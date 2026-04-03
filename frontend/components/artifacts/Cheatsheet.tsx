import type { CheatsheetPayload } from "@/lib/types";

export default function Cheatsheet({ payload }: { payload: CheatsheetPayload }) {
  if (!payload.entries?.length) return <p className="text-sm text-slate-400">No entries generated.</p>;
  return (
    <div className="flex flex-col divide-y-[0.5px] divide-slate-100 dark:divide-slate-700">
      {payload.entries.map((e, i) => (
        <div key={i} className="flex gap-4 py-2.5">
          <span className="w-36 flex-shrink-0 text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
            {e.term}
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{e.definition}</span>
        </div>
      ))}
    </div>
  );
}
