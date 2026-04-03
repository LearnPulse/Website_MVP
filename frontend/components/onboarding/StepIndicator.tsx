"use client";

interface StepIndicatorProps {
  currentStep: 0 | 1 | 2;
  completedSteps: number[];
}

const LABELS = ["Goal", "Preferences", "Upload"];

export default function StepIndicator({ currentStep, completedSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {LABELS.map((label, i) => {
        const done = completedSteps.includes(i);
        const active = i === currentStep;
        return (
          <div key={i} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className={[
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                  done
                    ? "bg-primary text-white"
                    : active
                    ? "border-2 border-primary text-primary"
                    : "border-[0.5px] border-slate-300 text-slate-400 dark:border-slate-600",
                ].join(" ")}
              >
                {done ? (
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-xs ${active ? "text-primary font-medium" : "text-slate-400"}`}>
                {label}
              </span>
            </div>
            {i < LABELS.length - 1 && (
              <div
                className={`h-[0.5px] w-8 mb-4 ${done ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
