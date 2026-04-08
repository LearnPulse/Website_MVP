"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useProgress } from "@/hooks/useProgress";

export default function DashboardPage() {
  const { userId } = useAuth();
  const { data, isLoading } = useProgress(userId);
  const router = useRouter();

  const masteredPct = data && data.total_count > 0
    ? Math.round((data.mastered_count / data.total_count) * 100)
    : 0;

  const activeConcepts = data?.concepts.filter((c) => c.state === "active") ?? [];
  const nextConcept = activeConcepts[0] ?? null;

  return (
    <div className="px-8 py-10 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-slate-100 mb-1">Good morning</h1>
        <p className="text-sm text-slate-500">Pick up where you left off.</p>
      </div>

      {/* Pick up where you left off */}
      {isLoading ? (
        <div className="h-32 rounded-xl bg-slate-800/40 animate-pulse mb-6" />
      ) : data && data.total_count > 0 ? (
        <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-6 mb-6">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-3">
            Current path
          </p>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-slate-100 mb-3 leading-snug">
                {data.goal_text}
              </h2>
              {/* Progress */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-700"
                    style={{ width: `${masteredPct}%` }}
                  />
                </div>
                <span className="text-xs text-primary font-semibold">{masteredPct}%</span>
              </div>
              <p className="text-xs text-slate-400">
                {data.mastered_count} of {data.total_count} concepts mastered
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/paths")}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors flex-shrink-0"
            >
              Continue
            </button>
          </div>

          {/* Next up */}
          {nextConcept && (
            <div className="mt-4 pt-4 border-t border-slate-700/40">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-2">
                Next up
              </p>
              <p className="text-sm text-slate-300 font-medium">{nextConcept.name}</p>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{nextConcept.description}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-800/20 p-8 mb-6 text-center">
          <p className="text-sm text-slate-400 mb-4">No learning path yet.</p>
          <button
            type="button"
            onClick={() => router.push("/paths/new")}
            className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-medium"
          >
            Create your first path
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Concepts mastered", value: data?.mastered_count ?? 0 },
          { label: "Total concepts", value: data?.total_count ?? 0 },
          { label: "Path progress", value: `${masteredPct}%` },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-700/60 bg-slate-800/20 p-4"
          >
            <p className="text-2xl font-bold text-slate-100 mb-1">{stat.value}</p>
            <p className="text-[11px] text-slate-500 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-600 mb-4">
          Quick actions
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => router.push("/paths")}
            className="flex flex-col gap-1.5 p-4 rounded-xl border border-slate-700/60 bg-slate-800/20 hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
          >
            <span className="text-sm font-semibold text-slate-200">View my paths</span>
            <span className="text-xs text-slate-500">See all your learning journeys</span>
          </button>
          <button
            type="button"
            onClick={() => router.push("/paths/new")}
            className="flex flex-col gap-1.5 p-4 rounded-xl border border-slate-700/60 bg-slate-800/20 hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
          >
            <span className="text-sm font-semibold text-slate-200">New path</span>
            <span className="text-xs text-slate-500">Upload docs, set a goal</span>
          </button>
          <button
            type="button"
            onClick={() => router.push("/chat")}
            className="flex flex-col gap-1.5 p-4 rounded-xl border border-slate-700/60 bg-slate-800/20 hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
          >
            <span className="text-sm font-semibold text-slate-200">Ask a question</span>
            <span className="text-xs text-slate-500">Chat with your knowledge base</span>
          </button>
          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="flex flex-col gap-1.5 p-4 rounded-xl border border-slate-700/60 bg-slate-800/20 hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
          >
            <span className="text-sm font-semibold text-slate-200">Edit preferences</span>
            <span className="text-xs text-slate-500">Formats, detail level, session length</span>
          </button>
        </div>
      </div>
    </div>
  );
}
