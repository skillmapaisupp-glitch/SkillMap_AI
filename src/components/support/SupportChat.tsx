import { useState, useRef, useEffect } from "react";
import { Send, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SupportChatProps {
  messages: Message[];
  isLoading: boolean;
  onSend: (text: string) => void;
}

const SupportChat = ({ messages, isLoading, onSend }: SupportChatProps) => {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Filter out the initial system-like user message
  const visibleMessages = messages.filter(
    (m, i) => !(i === 0 && m.role === "user" && m.content.includes("I could use some support"))
  );

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {visibleMessages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Heart className="w-10 h-10 text-pink-400/50 mb-3" />
            <p className="text-muted-foreground text-sm">Mila is here for you.</p>
          </div>
        )}

        {visibleMessages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-pink-400/20 flex items-center justify-center mr-2 mt-1 shrink-0">
                <Heart className="w-3.5 h-3.5 text-pink-400" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm prose-invert max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>p:last-child]:mb-0">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {isLoading && visibleMessages[visibleMessages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-pink-400/20 flex items-center justify-center mr-2 shrink-0">
              <Heart className="w-3.5 h-3.5 text-pink-400" />
            </div>
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share what's on your mind..."
            disabled={isLoading}
            className="min-h-[44px] max-h-[120px] resize-none bg-muted border-0 focus-visible:ring-1 focus-visible:ring-pink-400/50"
            rows={1}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="shrink-0 h-11 w-11 bg-pink-400 hover:bg-pink-500"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SupportChat;
