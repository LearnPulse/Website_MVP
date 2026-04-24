"use client";

import { useEffect, useRef, useState } from "react";

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
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (completed >= STEPS.length) return;
    const timer = setTimeout(() => setCompleted((c) => c + 1), 900);
    return () => clearTimeout(timer);
  }, [completed]);

  const allDone = completed >= STEPS.length;
  const progress = Math.round((completed / STEPS.length) * 100);

  useEffect(() => {
    barRef.current?.style.setProperty("--pct", `${progress}%`);
  }, [progress]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-white tracking-tight leading-tight">
          {allDone ? "Your path is ready." : "Building your\nlearning path…"}
        </h2>
        <p className="text-base text-white/50">
          {allDone ? `${conceptCount} concept${conceptCount !== 1 ? "s" : ""} extracted from your materials.` : "This takes 15–30 seconds."}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
        <div
          ref={barRef}
          className="progress-fill h-full bg-primary rounded-full transition-all duration-700 ease-out"
        />
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-3">
        {STEPS.map((step, i) => {
          const done = i < completed;
          const active = i === completed;
          return (
            <div
              key={i}
              className={[
                "flex items-center gap-3 transition-all duration-300",
                done ? "opacity-40" : active ? "opacity-100" : "opacity-20",
              ].join(" ")}
            >
              <div className={[
                "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300",
                done ? "bg-primary" : active ? "border-2 border-primary" : "border border-white/20",
              ].join(" ")}>
                {done ? (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : active ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                ) : null}
              </div>
              <span className={`text-sm ${done ? "text-white/50 line-through" : active ? "text-white font-medium" : "text-white/30"}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {allDone && (
        <button
          type="button"
          onClick={onDone}
          className="w-full h-12 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
        >
          Start learning
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </div>
  );
}
