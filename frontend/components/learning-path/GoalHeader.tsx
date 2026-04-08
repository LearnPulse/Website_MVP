interface GoalHeaderProps {
  goalText: string;
  masteredCount: number;
  totalCount: number;
}

export default function GoalHeader({ goalText, masteredCount, totalCount }: GoalHeaderProps) {
  const pct = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Goal label + text */}
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-primary/70">
          Current Goal
        </p>
        <h1 className="text-lg font-semibold text-slate-100 leading-snug">
          {goalText || "Your learning path"}
        </h1>
      </div>

      {/* Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {masteredCount} of {totalCount} concepts mastered
          </span>
          <span className="text-xs font-semibold text-primary">{pct}%</span>
        </div>
        <div className="h-1 rounded-full bg-slate-700 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
