"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api-client";

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

  async function sendMessage() {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // For now, use the /ask endpoint with a generic "cheatsheet" artifact as a proxy.
      // Phase 8 will add a dedicated /chat endpoint with streaming.
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("lp_token") ?? ""}`,
        },
        body: JSON.stringify({ message: text, user_id: userId }),
      });

      let reply = "Chat endpoint is coming soon! For now, explore your learning path to study concepts.";
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
          content: "Chat is being set up. Check back soon!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="px-8 py-5 border-b border-slate-800 flex-shrink-0">
        <h1 className="text-lg font-semibold text-slate-100">Chat</h1>
        <p className="text-xs text-slate-500 mt-0.5">Ask anything about your learning materials</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-primary" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6l-4 3V5z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm text-slate-400 font-medium">Ask about your concepts</p>
            <p className="text-xs text-slate-600 max-w-sm">
              Type a question and LearnPulse will search your uploaded materials to answer it.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={[
                "max-w-xl px-4 py-3 rounded-2xl text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-primary text-white rounded-br-sm"
                  : "bg-slate-800 text-slate-200 border border-slate-700/60 rounded-bl-sm",
              ].join(" ")}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700/60 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-8 py-5 border-t border-slate-800 flex-shrink-0">
        <div className="flex items-end gap-3 max-w-2xl mx-auto">
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
            placeholder="Ask a question about your learning materials..."
            className="flex-1 resize-none bg-slate-800/60 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors min-h-[48px] max-h-[160px]"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M14 8L2 3l3 5-3 5 12-5z" fill="currentColor" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-600 mt-2">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
