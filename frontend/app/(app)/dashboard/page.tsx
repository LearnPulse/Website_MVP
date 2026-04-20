"use client";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/hooks/useProgress";

export default function DashboardPage() {
  const router = useRouter();

  // 🔥 FAKE USER (replaces useAuth)
  const userId = "demo-user";

  const { data, isLoading } = useProgress(userId);

  const pct =
    data && data.total_count > 0
      ? Math.round((data.mastered_count / data.total_count) * 100)
      : 0;

  const next = data?.concepts.find((c) => c.state === "active") ?? null;
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // fake token for backend
    localStorage.setItem("lp_token", "demo-token");
    localStorage.setItem("lp_user_id", "demo-user");

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
            <path
              d="M6.5 1.5v10M1.5 6.5h10"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          New path
        </button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : data && data.total_count > 0 ? (
        <>
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-dim mb-2">
              Active path
            </p>
            <h2 className="text-xl font-semibold text-ink mb-6 leading-snug">
              {data.goal_text}
            </h2>

            <div className="flex items-center gap-4 mb-2">
              <div className="flex-1 h-1.5 bg-line rounded-full overflow-hidden">
                <div
                  ref={barRef}
                  className="progress-fill h-full bg-primary rounded-full"
                />
              </div>
              <span className="text-sm font-bold text-primary w-12 text-right">
                {pct}%
              </span>
            </div>

            <p className="text-sm text-dim">
              {data.mastered_count} of {data.total_count} concepts mastered
            </p>
          </div>
        </>
      ) : (
        <div>No data yet</div>
      )}
    </div>
  );
}
