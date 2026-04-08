"use client";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useProgress } from "@/hooks/useProgress";

function ProgressBar({ pct }: { pct: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.style.setProperty("--pct", `${pct}%`); }, [pct]);
  return (
    <div className="h-[3px] bg-line rounded-full overflow-hidden">
      <div ref={ref} className="progress-fill h-full bg-primary rounded-full transition-all duration-700" />
    </div>
  );
}

export default function PathsPage() {
  const { userId } = useAuth();
  const { data, isLoading, error, refetch } = useProgress(userId);
  const router = useRouter();

  const pct = data && data.total_count > 0
    ? Math.round((data.mastered_count / data.total_count) * 100) : 0;

  return (
    <div className="min-h-full px-10 py-10 max-w-[720px]">

      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Paths</h1>
        <button
          type="button"
          onClick={() => router.push("/paths/new")}
          className="flex items-center gap-2 h-8 px-3 rounded bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          New path
        </button>
      </div>

      {isLoading && (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-surface rounded-md border border-line" />
          ))}
        </div>
      )}

      {error && (
        <div className="py-8">
          <p className="text-sm text-dim mb-3">{error}</p>
          <button type="button" onClick={refetch} className="text-xs text-primary hover:underline">
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && data && data.total_count > 0 && (
        <button
          type="button"
          onClick={() => router.push("/paths/current")}
          className="w-full group text-left p-5 bg-surface border border-line rounded-md hover:border-ghost transition-colors"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center h-5 px-2 rounded-sm bg-primary/10 text-primary text-2xs font-semibold uppercase tracking-wide">
                  Active
                </span>
              </div>
              <p className="text-sm font-semibold text-ink leading-snug">{data.goal_text}</p>
            </div>
            <svg
              className="w-4 h-4 text-dim group-hover:text-ink transition-colors flex-shrink-0 mt-0.5"
              viewBox="0 0 16 16" fill="none"
            >
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <ProgressBar pct={pct} />

          <div className="flex items-center gap-4 mt-3 text-xs text-dim">
            <span>{data.mastered_count} mastered</span>
            <span>·</span>
            <span>{data.total_count - data.mastered_count} remaining</span>
            <span className="ml-auto tabular font-semibold text-primary">{pct}%</span>
          </div>
        </button>
      )}

      {!isLoading && !error && (!data || data.total_count === 0) && (
        <div className="py-20">
          <p className="text-3xl font-bold text-ink tracking-tight mb-2">No paths yet.</p>
          <p className="text-sm text-dim mb-8 max-w-xs">
            Upload your materials and set a learning goal to get started.
          </p>
          <button
            type="button"
            onClick={() => router.push("/paths/new")}
            className="h-9 px-5 rounded bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Create a path
          </button>
        </div>
      )}
    </div>
  );
}
