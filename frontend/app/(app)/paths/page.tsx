"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useProgress } from "@/hooks/useProgress";

export default function PathsPage() {
  const { userId } = useAuth();
  const { data, isLoading, error, refetch } = useProgress(userId);
  const router = useRouter();

  const masteredPct = data && data.total_count > 0
    ? Math.round((data.mastered_count / data.total_count) * 100)
    : 0;

  return (
    <div className="px-8 py-10 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100 mb-1">My paths</h1>
          <p className="text-sm text-slate-500">All your learning journeys in one place.</p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/paths/new")}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + New path
        </button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-slate-800/40 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-6 text-center">
          <p className="text-sm text-red-400 mb-3">{error}</p>
          <button type="button" onClick={refetch} className="text-xs text-primary hover:underline">
            Try again
          </button>
        </div>
      )}

      {!isLoading && !error && data && data.total_count > 0 && (
        <div
          className="rounded-xl border border-slate-700/60 bg-slate-800/20 p-6 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
          onClick={() => router.push("/paths/current")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && router.push("/paths/current")}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-semibold tracking-widest uppercase text-primary/70">
                  Active
                </span>
              </div>
              <h2 className="text-base font-semibold text-slate-100 leading-snug">
                {data.goal_text}
              </h2>
            </div>
            <svg className="w-4 h-4 text-slate-500 flex-shrink-0 mt-1" viewBox="0 0 16 16" fill="none">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-1.5 rounded-full bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${masteredPct}%` }}
              />
            </div>
            <span className="text-xs text-primary font-semibold">{masteredPct}%</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>{data.mastered_count} of {data.total_count} mastered</span>
            <span>·</span>
            <span>{data.total_count - data.mastered_count} remaining</span>
          </div>
        </div>
      )}

      {!isLoading && !error && (!data || data.total_count === 0) && (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-800/10 p-12 text-center">
          <p className="text-sm text-slate-400 mb-2">No paths yet.</p>
          <p className="text-xs text-slate-600 mb-6">
            Upload your study materials and set a goal to generate a personalized learning path.
          </p>
          <button
            type="button"
            onClick={() => router.push("/paths/new")}
            className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium"
          >
            Create your first path
          </button>
        </div>
      )}
    </div>
  );
}
