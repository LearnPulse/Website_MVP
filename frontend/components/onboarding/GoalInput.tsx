"use client";

import { useState } from "react";

const SUGGESTIONS = [
  "Transformer architecture",
  "DSA for interviews",
  "System design fundamentals",
  "React internals",
  "Operating systems",
  "Machine learning basics",
];

interface GoalInputProps {
  value: string;
  onChange: (v: string) => void;
  onContinue: () => void;
}

export default function GoalInput({ value, onChange, onContinue }: GoalInputProps) {
  const [focused, setFocused] = useState(false);
  const canContinue = value.trim().length >= 6;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-white tracking-tight leading-tight">
          What do you want<br />to learn?
        </h2>
        <p className="text-base text-white/50 leading-relaxed">
          Be specific — the more detail, the better your learning path.
        </p>
      </div>

      <div className={[
        "relative rounded-2xl border transition-all duration-200",
        focused ? "border-primary shadow-lg shadow-primary/10" : "border-white/10",
        "bg-white/5",
      ].join(" ")}>
        <textarea
          className="w-full bg-transparent px-5 py-4 text-white placeholder:text-white/25 text-base resize-none focus:outline-none"
          rows={4}
          placeholder="e.g. I want to understand how attention mechanisms work in transformers"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {value.length > 0 && (
          <div className="px-5 pb-3 flex justify-end">
            <span className="text-xs text-white/20 tabular">{value.length} chars</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-white/30">Quick select</span>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => onChange(s)}
              className={[
                "px-3.5 py-1.5 rounded-full text-sm border transition-all duration-150",
                value === s
                  ? "border-primary bg-primary/15 text-primary font-medium"
                  : "border-white/10 text-white/50 hover:border-white/30 hover:text-white/80 bg-white/5",
              ].join(" ")}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={!canContinue}
        onClick={onContinue}
        className={[
          "w-full h-12 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2",
          canContinue
            ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
            : "bg-white/5 text-white/20 cursor-not-allowed",
        ].join(" ")}
      >
        Continue
        {canContinue && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
    </div>
  );
}
