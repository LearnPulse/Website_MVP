"use client";

interface StepIndicatorProps {
  currentStep: 0 | 1 | 2;
  completedSteps: number[];
}

const LABELS = ["Goal", "Style", "Upload"];

export default function StepIndicator({ currentStep, completedSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-3 w-full max-w-xs mx-auto">
      {LABELS.map((label, i) => {
        const done = completedSteps.includes(i);
        const active = i === currentStep;
        return (
          <div key={i} className="flex items-center gap-3 flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={[
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300",
                  done
                    ? "bg-primary text-white scale-100"
                    : active
                    ? "bg-white text-slate-900 scale-110 shadow-lg shadow-white/20"
                    : "bg-white/10 text-white/30",
                ].join(" ")}
              >
                {done ? (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={[
                "text-[10px] font-medium tracking-wide uppercase transition-all duration-300",
                active ? "text-white" : done ? "text-primary" : "text-white/30",
              ].join(" ")}>
                {label}
              </span>
            </div>
            {i < LABELS.length - 1 && (
              <div className="flex-1 h-px mb-5 relative overflow-hidden rounded-full bg-white/10">
                <div
                  className="absolute inset-y-0 left-0 bg-primary transition-all duration-500"
                  style={{ width: done ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
