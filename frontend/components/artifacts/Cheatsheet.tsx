import type { CheatsheetPayload } from "@/lib/types";

export default function Cheatsheet({ payload }: { payload: CheatsheetPayload }) {
  if (!payload.entries?.length) return <p className="text-sm text-dim">No entries generated.</p>;
  return (
    <div className="flex flex-col divide-y divide-line">
      {payload.entries.map((e, i) => (
        <div key={i} className="flex gap-4 py-3">
          <span className="w-36 flex-shrink-0 text-xs font-semibold text-ink leading-relaxed">
            {e.term}
          </span>
          <span className="text-xs text-dim leading-relaxed">{e.definition}</span>
        </div>
      ))}
    </div>
  );
}
