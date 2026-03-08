import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import SupportChat from "@/components/support/SupportChat";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/support-chat`;

const SupportPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [saveHistory, setSaveHistory] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadSession();
  }, [user]);

  const loadSession = async () => {
    if (!user) return;

    const { data: sessions } = await supabase
      .from("support_sessions")
      .select("id, messages, save_history")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (sessions?.length && sessions[0].messages) {
      const session = sessions[0];
      setSessionId(session.id);
      setSaveHistory(session.save_history ?? true);
      const savedMessages = session.messages as any[];
      if (savedMessages.length > 0) {
        setMessages(savedMessages as Msg[]);
        setInitialized(true);
        return;
      }
    }

    setInitialized(true);
    startGreeting();
  };

  const startGreeting = async () => {
    if (user) {
      const { data: session } = await supabase
        .from("support_sessions")
        .insert({ user_id: user.id, save_history: saveHistory })
        .select("id")
        .single();
      if (session) setSessionId(session.id);
    }

    const initialMsg: Msg = {
      role: "user",
      content: "Hi Mila, I could use some support today.",
    };
    setMessages([initialMsg]);
    await streamResponse([initialMsg]);
  };

  const saveMessages = useCallback(async (msgs: Msg[]) => {
    if (!sessionId || !saveHistory) return;
    await supabase
      .from("support_sessions")
      .update({ messages: msgs as any, updated_at: new Date().toISOString() })
      .eq("id", sessionId);
  }, [sessionId, saveHistory]);

  const streamResponse = useCallback(async (allMessages: Msg[]) => {
    setIsLoading(true);
    let assistantContent = "";

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) {
        toast.error("Please log in to chat with Mila.");
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
        body: JSON.stringify({ messages: allMessages, sessionId, saveHistory }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        toast.error(errData.error || "Chat failed. Please try again.");
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
          if (jsonStr === "[DONE]") { streamDone = true; break; }

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
          if (!raw || !raw.startsWith("data: ")) continue;
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

      const finalMessages = [...allMessages, { role: "assistant" as const, content: assistantContent }];
      await saveMessages(finalMessages);

    } catch (err: any) {
      console.error(err);
      toast.error("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, saveHistory, saveMessages]);

  const handleSend = async (text: string) => {
    const userMsg: Msg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    await streamResponse(newMessages);
  };

  const handleClearChat = async () => {
    setMessages([]);
    if (sessionId) {
      await supabase
        .from("support_sessions")
        .update({ messages: [] as any })
        .eq("id", sessionId);
    }
    toast.success("Chat cleared.");
    startGreeting();
  };

  const handleToggleSaveHistory = async (checked: boolean) => {
    setSaveHistory(checked);
    if (sessionId) {
      await supabase
        .from("support_sessions")
        .update({ save_history: checked })
        .eq("id", sessionId);
    }
    toast.success(checked ? "Chat history will be saved." : "Chat history will not be saved.");
  };

  if (!initialized) {
    return (
      <div className="p-6 md:p-10 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-72 bg-muted rounded" />
          <div className="h-96 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
            <Heart className="w-8 h-8 text-pink-400" />
            Chat with Mila
          </h1>
          <p className="text-muted-foreground text-sm">
            Your empathetic AI companion for career-related stress and wellbeing.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="save-history"
              checked={saveHistory}
              onCheckedChange={handleToggleSaveHistory}
            />
            <Label htmlFor="save-history" className="text-xs text-muted-foreground">
              Save history
            </Label>
          </div>
          <Button variant="outline" size="sm" onClick={handleClearChat} className="gap-1.5">
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 glass-card rounded-xl overflow-hidden flex flex-col min-h-[500px]"
      >
        <SupportChat
          messages={messages}
          isLoading={isLoading}
          onSend={handleSend}
        />
      </motion.div>

      <p className="text-[11px] text-muted-foreground/50 text-center mt-3">
        Mila is an AI companion, not a licensed therapist. If you're in crisis, please contact the 988 Suicide & Crisis Lifeline or text HOME to 741741.
      </p>
    </div>
  );
};

export default SupportPage;
