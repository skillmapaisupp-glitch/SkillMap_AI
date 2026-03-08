import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { MessageSquare, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import InterviewSetup from "@/components/interview/InterviewSetup";
import InterviewChat from "@/components/interview/InterviewChat";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mock-interview`;

interface InterviewConfig {
  targetRole: string;
  interviewType: string;
  difficulty: string;
}

const InterviewPage = () => {
  const { user } = useAuth();
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [config, setConfig] = useState<InterviewConfig>({ targetRole: "", interviewType: "behavioral", difficulty: "medium" });
  const [isComplete, setIsComplete] = useState(false);

  const streamResponse = useCallback(async (allMessages: Msg[]) => {
    setIsLoading(true);
    let assistantContent = "";

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) {
        toast.error("Please log in to start an interview.");
        setIsLoading(false);
        return;
      }

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          messages: allMessages,
          sessionId,
          targetRole: config.targetRole,
          interviewType: config.interviewType,
          difficulty: config.difficulty,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        toast.error(errData.error || "Interview failed. Please try again.");
        setIsLoading(false);
        return;
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch { /* ignore */ }
        }
      }

      if (assistantContent.includes("Interview Complete") || assistantContent.includes("Overall Score")) {
        setIsComplete(true);
        if (user && sessionId) {
          const scoreMatch = assistantContent.match(/Overall Score[:\s]*(\d+)/i);
          const score = scoreMatch ? parseInt(scoreMatch[1]) : null;

          await supabase
            .from("interview_sessions")
            .update({
              completed: true,
              completed_at: new Date().toISOString(),
              overall_score: score,
            })
            .eq("id", sessionId);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, config, user]);

  const handleStart = async (cfg: typeof config) => {
    setConfig(cfg);
    setStarted(true);
    setMessages([]);
    setIsComplete(false);

    if (user) {
      const { data: session } = await supabase
        .from("interview_sessions")
        .insert({
          user_id: user.id,
          target_role: cfg.targetRole,
          interview_type: cfg.interviewType,
          difficulty: cfg.difficulty,
        })
        .select("id")
        .single();

      if (session) setSessionId(session.id);
    }

    const initialMsg: Msg = {
      role: "user",
      content: `Hi Alex, I'm ready for my ${cfg.interviewType} interview for the ${cfg.targetRole} position. Difficulty: ${cfg.difficulty}. Let's begin!`,
    };

    setMessages([initialMsg]);
    await streamResponse([initialMsg]);
  };

  const handleSend = async (text: string) => {
    const userMsg: Msg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    if (user && sessionId) {
      const questionNum = messages.filter((m) => m.role === "assistant").length;
      await supabase.from("interview_responses").insert({
        user_id: user.id,
        session_id: sessionId,
        question: messages[messages.length - 1]?.content || "",
        answer: text,
        question_number: questionNum,
      });
    }

    await streamResponse(newMessages);
  };

  const handleReset = () => {
    setStarted(false);
    setMessages([]);
    setSessionId(null);
    setIsComplete(false);
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" />
            Mock Interview
          </h1>
          <p className="text-muted-foreground text-sm">
            {started
              ? `Interviewing for ${config.targetRole} · ${config.interviewType} · ${config.difficulty}`
              : "Practice with Alex, your AI interviewer."}
          </p>
        </div>
        {started && (
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            New Interview
          </Button>
        )}
      </div>

      {!started ? (
        <InterviewSetup onStart={handleStart} />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 glass-card rounded-xl overflow-hidden flex flex-col min-h-[500px]"
        >
          <InterviewChat
            messages={messages}
            isLoading={isLoading}
            onSend={handleSend}
            disabled={isComplete}
          />
        </motion.div>
      )}
    </div>
  );
};

export default InterviewPage;
