"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Summarize my learning path",
  "What should I study next?",
  "Explain the hardest concept",
];

export default function ChatPage() {
  const { userId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("lp_token") ?? ""}`,
          },
          body: JSON.stringify({ message: content, user_id: userId }),
        }
      );

      let reply = "Chat is coming soon. In the meantime, explore your learning path.";
      if (res.ok) {
        const data = await res.json();
        reply = data.reply ?? reply;
      }

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: "Could not reach the server." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen">

      {/* Header */}
      <div className="px-8 py-5 border-b border-line flex-shrink-0">
        <h1 className="text-xl font-bold tracking-tight text-ink">Chat</h1>
        <p className="text-sm text-dim mt-0.5">Ask anything about your learning materials</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-surface border border-line flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none" className="text-dim">
                <path d="M3 5a2 2 0 012-2h16a2 2 0 012 2v13a2 2 0 01-2 2H7.5L3 23V5Z"
                  stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-base font-semibold text-ink mb-1">Ask about your concepts</p>
              <p className="text-sm text-dim max-w-xs leading-relaxed">
                Search your uploaded materials and get instant answers.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => sendMessage(s)}
                  className="h-9 px-4 rounded-xl border border-line text-sm text-dim hover:text-ink hover:border-dim/40 hover:bg-surface transition-all duration-150"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-2xl mx-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-primary/12 flex items-center justify-center mt-0.5">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-primary">
                      <path d="M7 1.5L12 5v7.5H9.5V9.5h-5v3H2V5L7 1.5Z"
                        stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
                <div
                  className={[
                    "max-w-lg px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-white rounded-2xl rounded-br-sm"
                      : "bg-surface border border-line text-ink rounded-2xl rounded-bl-sm",
                  ].join(" ")}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-primary/12 flex items-center justify-center mt-0.5">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-primary">
                    <path d="M7 1.5L12 5v7.5H9.5V9.5h-5v3H2V5L7 1.5Z"
                      stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="bg-surface border border-line rounded-2xl rounded-bl-sm px-4 py-3.5">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-2 h-2 rounded-full bg-dim animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 rounded-full bg-dim animate-bounce [animation-delay:160ms]" />
                    <span className="w-2 h-2 rounded-full bg-dim animate-bounce [animation-delay:320ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-line flex-shrink-0">
        <div className="flex items-end gap-3 max-w-2xl mx-auto bg-surface border border-line rounded-2xl px-4 py-3 focus-within:border-dim/60 transition-colors">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask a question…"
            className="flex-1 resize-none bg-transparent text-ink placeholder:text-dim text-sm focus:outline-none min-h-[24px] max-h-[140px]"
          />
          <button
            type="button"
            title="Send"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M12 7H2M7.5 2.5L12 7l-4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <p className="text-center text-2xs text-dim/60 mt-2">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
