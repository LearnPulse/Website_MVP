interface GoalHeaderProps {
  goalText: string;
  masteredCount: number;
  totalCount: number;
}

export default function GoalHeader({ goalText, masteredCount, totalCount }: GoalHeaderProps) {
  const pct = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col gap-3 pb-6 border-b-[0.5px] border-slate-200 dark:border-slate-700">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Your goal</p>
      <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug">
        {goalText || "Learning path"}
      </h1>
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs text-slate-500">
          <span>{pct}% complete</span>
          <span>{masteredCount} of {totalCount} concepts mastered</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
