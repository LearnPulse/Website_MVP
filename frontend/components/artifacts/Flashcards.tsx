"use client";

import { useState } from "react";
import type { FlashcardPayload } from "@/lib/types";

export default function Flashcards({ payload, onComplete }: { payload: FlashcardPayload; onComplete?: () => void }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);

  if (!payload.cards?.length) return <p className="text-sm text-dim">No cards generated.</p>;
  const card = payload.cards[idx];

  function next() {
    setFlipped(false);
    if (idx + 1 >= payload.cards.length) {
      setDone(true);
      onComplete?.();
    } else {
      setIdx((i) => i + 1);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-primary/12 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-primary">
            <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Deck complete!</p>
          <p className="text-xs text-dim mt-0.5">+15 mastery added</p>
        </div>
        <button
          type="button"
          onClick={() => { setIdx(0); setFlipped(false); setDone(false); }}
          className="h-8 px-4 rounded-xl border border-line text-xs text-dim hover:text-ink hover:border-dim/40 transition-all"
        >
          Restart deck
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-dim">{idx + 1} / {payload.cards.length}</span>
        <div className="flex gap-1">
          {payload.cards.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${i <= idx ? "bg-primary w-4" : "bg-line w-2"}`}
            />
          ))}
        </div>
      </div>

      {/* Card */}
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="min-h-[140px] w-full rounded-2xl border border-line bg-surface p-6 text-left hover:border-primary/40 transition-all duration-150 group"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-dim mb-3">
          {flipped ? "Answer" : "Question — tap to reveal"}
        </p>
        <p className="text-sm text-ink leading-relaxed">
          {flipped ? card.back : card.front}
        </p>
        {!flipped && (
          <div className="mt-4 flex items-center gap-1.5 text-dim group-hover:text-primary transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <span className="text-xs">Tap to flip</span>
          </div>
        )}
      </button>

      {/* Actions — only shown when flipped */}
      {flipped && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={next}
            className="flex-1 h-10 rounded-xl border border-line text-sm text-dim hover:border-red-400/60 hover:text-red-500 transition-all"
          >
            Review again
          </button>
          <button
            type="button"
            onClick={next}
            className="flex-1 h-10 rounded-xl border border-primary bg-primary/8 text-primary text-sm font-medium hover:bg-primary/15 transition-all"
          >
            Got it ✓
          </button>
        </div>
      )}
    </div>
  );
}
