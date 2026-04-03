"use client";

import { useState } from "react";
import type { FlashcardPayload } from "@/lib/types";

export default function Flashcards({ payload, onComplete }: { payload: FlashcardPayload; onComplete?: () => void }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);

  if (!payload.cards?.length) return <p className="text-sm text-slate-400">No cards generated.</p>;
  const card = payload.cards[idx];

  function next(knew: boolean) {
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
      <div className="flex flex-col items-center gap-3 py-6">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Deck complete! +15 mastery</p>
        <button type="button" onClick={() => { setIdx(0); setFlipped(false); setDone(false); }}
          className="text-xs text-primary hover:underline">Restart deck</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between text-xs text-slate-400">
        <span>{idx + 1} / {payload.cards.length}</span>
        <div className="flex gap-1">
          {payload.cards.map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= idx ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"}`} />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="min-h-[120px] w-full rounded-lg border-[0.5px] border-slate-200 dark:border-slate-700 p-5 text-left transition-colors hover:border-primary"
      >
        <p className="text-xs text-slate-400 mb-2">{flipped ? "Answer" : "Question"}</p>
        <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
          {flipped ? card.back : card.front}
        </p>
        {!flipped && <p className="text-xs text-slate-400 mt-3">Tap to reveal</p>}
      </button>

      {flipped && (
        <div className="flex gap-2">
          <button type="button" onClick={() => next(false)}
            className="flex-1 py-2 rounded-lg border-[0.5px] border-slate-200 dark:border-slate-700 text-sm text-slate-600 hover:border-red-400 hover:text-red-500 transition-colors">
            Review again
          </button>
          <button type="button" onClick={() => next(true)}
            className="flex-1 py-2 rounded-lg border-[0.5px] border-primary bg-primary/5 text-primary text-sm hover:bg-primary/10 transition-colors">
            Got it
          </button>
        </div>
      )}
    </div>
  );
}
