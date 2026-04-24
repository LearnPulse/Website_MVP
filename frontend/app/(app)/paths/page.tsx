"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api-client";
import type { GoalSummary } from "@/lib/types";

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
  const router = useRouter();
  const [goals, setGoals] = useState<GoalSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const res = await apiClient.listGoals();
    if (res.success && res.data) {
      setGoals(res.data);
    } else {
      setError(res.error ?? "Failed to load paths");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // suppress unused warning — userId kept for future per-user API calls
  void userId;

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
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-surface rounded-2xl border border-line animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="py-10">
          <p className="text-sm text-dim mb-3">{error}</p>
          <button type="button" onClick={load} className="text-sm text-primary hover:underline">Try again</button>
        </div>
      )}

      {!isLoading && !error && goals.length > 0 && (
        <div className="flex flex-col gap-4">
          {goals.map((g, i) => {
            const pct = g.total_count > 0 ? Math.round((g.mastered_count / g.total_count) * 100) : 0;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => router.push(`/paths/current?goal_id=${g.id}`)}
                className="w-full group text-left p-6 bg-surface border border-line rounded-2xl hover:border-dim/40 hover:shadow-card transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex-1 min-w-0">
                    {i === 0 && (
                      <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-primary/12 text-primary text-xs font-semibold mb-3">
                        Active
                      </span>
                    )}
                    <p className="text-base font-semibold text-ink leading-snug">{g.goal_text}</p>
                  </div>
                  <svg
                    className="w-5 h-5 text-dim group-hover:text-ink transition-colors flex-shrink-0 mt-1"
                    viewBox="0 0 16 16" fill="none"
                  >
                    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {g.total_count > 0 ? (
                  <>
                    <ProgressBar pct={pct} />
                    <div className="flex items-center gap-4 mt-3 text-sm text-dim">
                      <span>{g.mastered_count} mastered</span>
                      <span>·</span>
                      <span>{g.total_count - g.mastered_count} remaining</span>
                      <span className="ml-auto tabular font-semibold text-primary">{pct}%</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-dim">No documents uploaded yet.</p>
                )}
              </button>
            );
          })}
        </div>
      )}

      {!isLoading && !error && goals.length === 0 && (
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
