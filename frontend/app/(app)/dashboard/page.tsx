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
    <div className="min-h-full px-10 py-12 max-w-[780px]">

      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-ink">Overview</h1>
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

      {isLoading ? (
        <div className="space-y-8 animate-pulse">
          <div className="h-7 w-64 bg-surface rounded-lg" />
          <div className="h-2 w-full bg-surface rounded-full" />
          <div className="flex gap-10 mt-6">
            <div className="h-12 w-24 bg-surface rounded-lg" />
            <div className="h-12 w-24 bg-surface rounded-lg" />
            <div className="h-12 w-24 bg-surface rounded-lg" />
          </div>
        </div>

      ) : data && data.total_count > 0 ? (
        <>
          {/* Goal */}
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-dim mb-2">
              Active path
            </p>
            <h2 className="text-xl font-semibold text-ink mb-6 leading-snug">
              {data.goal_text}
            </h2>

            {/* Progress */}
            <div className="flex items-center gap-4 mb-2">
              <div className="flex-1 h-1.5 bg-line rounded-full overflow-hidden">
                <div ref={barRef} className="progress-fill h-full bg-primary rounded-full transition-all duration-700" />
              </div>
              <span className="tabular text-sm font-bold text-primary w-12 text-right">{pct}%</span>
            </div>
            <p className="text-sm text-dim">
              {data.mastered_count} of {data.total_count} concepts mastered
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-12 mb-12 pb-10 border-b border-line">
            {[
              { n: data.mastered_count,                          label: "Mastered" },
              { n: data.total_count - data.mastered_count,       label: "Remaining" },
              { n: data.total_count,                             label: "Total concepts" },
            ].map(({ n, label }) => (
              <div key={label}>
                <p className="tabular text-4xl font-bold text-ink tracking-tight">{n}</p>
                <p className="text-sm text-dim mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Up next */}
          {next && (
            <div className="mb-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-dim mb-4">
                Up next
              </p>
              <div className="flex items-center justify-between gap-6 p-5 bg-surface border border-line rounded-2xl">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-ink mb-1">{next.name}</p>
                  <p className="text-sm text-dim truncate max-w-md">{next.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/paths/current")}
                  className="flex-shrink-0 flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all duration-150"
                >
                  Study
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2.5 6.5h8M7 3.5l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            {[
              { label: "View full path",    href: "/paths/current" },
              { label: "Knowledge graph",   href: "/graph"         },
              { label: "Chat",              href: "/chat"          },
            ].map(({ label, href }) => (
              <button
                key={href}
                type="button"
                onClick={() => router.push(href)}
                className="h-10 px-5 rounded-xl border border-line text-sm font-medium text-ink hover:bg-surface hover:border-dim/40 transition-all duration-150"
              >
                {label}
              </button>
            ))}
          </div>
        </>

      ) : (
        /* Empty state */
        <div className="py-24 flex flex-col items-start">
          <div className="w-14 h-14 rounded-2xl bg-surface border border-line flex items-center justify-center mb-8">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" className="text-dim">
              <path d="M13 2.5L22 9v14H17V15H9v8H4V9L13 2.5Z"
                stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-ink tracking-tight mb-3">Start learning.</h2>
          <p className="text-base text-dim mb-8 max-w-sm leading-relaxed">
            Upload your study materials, set a goal, and get a personalized learning path.
          </p>
          <button
            type="button"
            onClick={() => router.push("/paths/new")}
            className="h-11 px-6 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all duration-150 shadow-subtle"
          >
            Create your first path
          </button>
        </div>
      )}
    </div>
  );
}
