"use client";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useProgress } from "@/hooks/useProgress";

export default function DashboardPage() {
  const { userId } = useAuth();
  const { data, isLoading } = useProgress(userId);
  const router = useRouter();

  const pct = data && data.total_count > 0
    ? Math.round((data.mastered_count / data.total_count) * 100) : 0;

  const next = data?.concepts.find((c) => c.state === "active") ?? null;
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    barRef.current?.style.setProperty("--pct", `${pct}%`);
  }, [pct]);

  return (
    <div className="min-h-full px-10 py-10 max-w-[720px]">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Overview</h1>
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

      {isLoading ? (
        <div className="space-y-8 animate-pulse">
          <div className="h-5 w-48 bg-surface rounded" />
          <div className="h-1 w-full bg-surface rounded" />
          <div className="flex gap-8">
            <div className="h-10 w-20 bg-surface rounded" />
            <div className="h-10 w-20 bg-surface rounded" />
            <div className="h-10 w-20 bg-surface rounded" />
          </div>
        </div>
      ) : data && data.total_count > 0 ? (
        <>
          {/* ── Active goal ── */}
          <div className="mb-10">
            <p className="text-2xs font-semibold uppercase tracking-widest text-dim mb-2">
              Current path
            </p>
            <h2 className="text-xl font-semibold text-ink tracking-tight mb-5 leading-snug">
              {data.goal_text}
            </h2>

            {/* Progress bar — full width, no card */}
            <div className="flex items-center gap-4 mb-1">
              <div className="flex-1 h-[3px] bg-line rounded-full overflow-hidden">
                <div ref={barRef} className="progress-fill h-full bg-primary rounded-full transition-all duration-700" />
              </div>
              <span className="tabular text-sm font-bold text-primary w-10 text-right">{pct}%</span>
            </div>
            <p className="text-xs text-dim">
              {data.mastered_count} of {data.total_count} concepts mastered
            </p>
          </div>

          {/* ── Stats row ── */}
          <div className="flex gap-10 mb-12 pb-10 border-b border-line">
            {[
              { n: data.mastered_count, label: "mastered" },
              { n: data.total_count - data.mastered_count, label: "remaining" },
              { n: data.total_count, label: "total concepts" },
            ].map(({ n, label }) => (
              <div key={label}>
                <p className="tabular text-4xl font-bold text-ink tracking-tight">{n}</p>
                <p className="text-xs text-dim mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* ── Continue studying ── */}
          {next && (
            <div className="mb-12">
              <p className="text-2xs font-semibold uppercase tracking-widest text-dim mb-4">
                Up next
              </p>
              <div className="flex items-center justify-between gap-6 p-5 bg-surface border border-line rounded-md">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink mb-0.5">{next.name}</p>
                  <p className="text-xs text-dim truncate max-w-sm">{next.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/paths/current")}
                  className="flex-shrink-0 flex items-center gap-1.5 h-8 px-3 rounded bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Study
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ── Actions ── */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/paths/current")}
              className="h-9 px-4 rounded border border-line text-sm font-medium text-ink hover:bg-surface transition-colors"
            >
              View full path
            </button>
            <button
              type="button"
              onClick={() => router.push("/graph")}
              className="h-9 px-4 rounded border border-line text-sm font-medium text-ink hover:bg-surface transition-colors"
            >
              Knowledge graph
            </button>
            <button
              type="button"
              onClick={() => router.push("/chat")}
              className="h-9 px-4 rounded border border-line text-sm font-medium text-ink hover:bg-surface transition-colors"
            >
              Chat
            </button>
          </div>
        </>
      ) : (
        /* ── Empty state ── */
        <div className="py-20">
          <p className="text-3xl font-bold text-ink tracking-tight mb-2">Start learning.</p>
          <p className="text-sm text-dim mb-8 max-w-xs">
            Upload your study materials, set a goal, and get a personalized learning path.
          </p>
          <button
            type="button"
            onClick={() => router.push("/paths/new")}
            className="h-9 px-5 rounded bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Create your first path
          </button>
        </div>
      )}
    </div>
  );
}
