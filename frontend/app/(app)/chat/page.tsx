"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const { userId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("lp_token") ?? ""}`,
        },
        body: JSON.stringify({ message: text, user_id: userId }),
      });

      let reply = "Chat endpoint is coming soon. Explore your learning path to study concepts.";
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
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Could not reach the server. Check your connection.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen">

      {/* Header */}
      <div className="px-8 py-5 border-b border-line flex-shrink-0">
        <h1 className="text-base font-semibold text-ink">Chat</h1>
        <p className="text-xs text-dim mt-0.5">Ask anything about your learning materials</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            {/* Chat icon */}
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-dim mb-1">
              <path
                d="M4 6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H8l-4 4V6z"
                stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
            <p className="text-sm font-semibold text-ink">Ask about your concepts</p>
            <p className="text-xs text-dim max-w-xs">
              Type a question and LearnPulse will search your uploaded materials to answer it.
            </p>
          </div>
        )}

        <div className="space-y-5 max-w-2xl mx-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2.5 mt-0.5">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-primary">
                    <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M3 5h4M5 3v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </div>
              )}
              <div
                className={[
                  "max-w-md px-4 py-2.5 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-white rounded-md rounded-br-sm"
                    : "bg-surface border border-line text-ink rounded-md rounded-bl-sm",
                ].join(" ")}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2.5 mt-0.5">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-primary">
                  <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M3 5h4M5 3v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="bg-surface border border-line rounded-md rounded-bl-sm px-4 py-3">
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-dim animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-dim animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-dim animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="px-8 py-4 border-t border-line flex-shrink-0">
        <div className="flex items-end gap-2 max-w-2xl mx-auto">
          <textarea
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
            className="flex-1 resize-none bg-surface border border-line text-ink placeholder:text-dim rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-ghost transition-colors min-h-[40px] max-h-[140px]"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            title="Send message"
            className="w-9 h-9 rounded-md bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M12.5 7L1.5 2.5l2.5 4.5-2.5 4.5L12.5 7z" fill="currentColor"/>
            </svg>
          </button>
        </div>
        <p className="text-center text-2xs text-dim mt-2">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
