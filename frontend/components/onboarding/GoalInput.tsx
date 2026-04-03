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
  const canContinue = value.trim().length >= 6;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          What do you want to learn?
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Be specific — the more detail, the better your learning path.
        </p>
      </div>

      <textarea
        className="w-full rounded-lg border-[0.5px] border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none focus:outline-none focus:border-primary transition-colors"
        rows={3}
        placeholder="e.g. I want to understand how attention mechanisms work in transformers"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      <div className="flex flex-col gap-2">
        <span className="text-xs text-slate-400">Quick select</span>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => onChange(s)}
              className={[
                "px-3 py-1.5 rounded-full text-xs border-[0.5px] transition-colors",
                value === s
                  ? "border-primary text-primary bg-primary/5"
                  : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary hover:text-primary",
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
        className="self-end px-5 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        Continue
      </button>
    </div>
  );
}
