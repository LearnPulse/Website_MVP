"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Chunking and embedding documents",
  "Storing vectors in ChromaDB",
  "Extracting concepts with Gemini",
  "Building knowledge graph",
  "Mapping prerequisites and relationships",
];

interface ProcessingStepsProps {
  conceptCount: number;
  onDone: () => void;
}

export default function ProcessingSteps({ conceptCount, onDone }: ProcessingStepsProps) {
  const [completed, setCompleted] = useState(0);

  // Animate steps completing every 800ms to match perceived backend work
  useEffect(() => {
    if (completed >= STEPS.length) return;
    const timer = setTimeout(() => setCompleted((c) => c + 1), 800);
    return () => clearTimeout(timer);
  }, [completed]);

  const allDone = completed >= STEPS.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Building your learning path…
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          This takes 15–30 seconds. Sit tight.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {STEPS.map((step, i) => {
          const done = i < completed;
          const active = i === completed;
          return (
            <div key={i} className="flex items-center gap-3">
              <div
                className={[
                  "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                  done ? "bg-primary" : active ? "border-2 border-primary" : "border-[0.5px] border-slate-300 dark:border-slate-600",
                ].join(" ")}
              >
                {done && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {active && (
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}
              </div>
              <span className={`text-sm ${done ? "text-slate-500 line-through" : active ? "text-slate-900 dark:text-slate-100" : "text-slate-400"}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {allDone && (
        <div className="flex flex-col items-center gap-4 pt-2">
          <div className="text-center">
            <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Your learning path is ready
            </p>
            {conceptCount > 0 && (
              <p className="text-sm text-slate-500 mt-1">
                {conceptCount} concept{conceptCount !== 1 ? "s" : ""} extracted
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onDone}
            className="px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Start learning
          </button>
        </div>
      )}
    </div>
  );
}
