"use client";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useProgress } from "@/hooks/useProgress";

function ProgressBar({ pct }: { pct: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.style.setProperty("--pct", `${pct}%`); }, [pct]);
  return (
    <div className="h-1.5 bg-line rounded-full overflow-hidden">
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
    <div className="min-h-full px-10 py-12 max-w-[780px]">

      <div className="flex items-center justify-between mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-ink">Paths</h1>
        <button
          type="button"
          onClick={() => router.push("/paths/new")}
          className="flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all duration-150 shadow-subtle"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1.5v10M1.5 6.5h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          New path
        </button>
      </div>

      {isLoading && (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-surface rounded-2xl border border-line" />
          ))}
        </div>
      )}

      {error && (
        <div className="py-10">
          <p className="text-sm text-dim mb-3">{error}</p>
          <button type="button" onClick={refetch} className="text-sm text-primary hover:underline">
            Try again
          </button>
        </div>
      )}

      {!isLoading && !error && data && data.total_count > 0 && (
        <button
          type="button"
          onClick={() => router.push("/paths/current")}
          className="w-full group text-left p-6 bg-surface border border-line rounded-2xl hover:border-dim/40 hover:shadow-card transition-all duration-200"
        >
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-primary/12 text-primary text-xs font-semibold mb-3">
                Active
              </span>
              <p className="text-base font-semibold text-ink leading-snug">{data.goal_text}</p>
            </div>
            <svg
              className="w-5 h-5 text-dim group-hover:text-ink transition-colors flex-shrink-0 mt-1"
              viewBox="0 0 16 16" fill="none"
            >
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <ProgressBar pct={pct} />

          <div className="flex items-center gap-4 mt-3 text-sm text-dim">
            <span>{data.mastered_count} mastered</span>
            <span>·</span>
            <span>{data.total_count - data.mastered_count} remaining</span>
            <span className="ml-auto tabular font-semibold text-primary">{pct}%</span>
          </div>
        </button>
      )}

      {!isLoading && !error && (!data || data.total_count === 0) && (
        <div className="py-24 flex flex-col items-start">
          <div className="w-14 h-14 rounded-2xl bg-surface border border-line flex items-center justify-center mb-8">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" className="text-dim">
              <rect x="2" y="2" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.6"/>
              <rect x="14" y="2" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.6"/>
              <rect x="2" y="14" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.6"/>
              <rect x="14" y="14" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.6"/>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-ink tracking-tight mb-3">No paths yet.</h2>
          <p className="text-base text-dim mb-8 max-w-sm leading-relaxed">
            Upload your materials and set a learning goal to get started.
          </p>
          <button
            type="button"
            onClick={() => router.push("/paths/new")}
            className="h-11 px-6 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all duration-150 shadow-subtle"
          >
            Create a path
          </button>
        </div>
      )}
    </div>
  );
}
