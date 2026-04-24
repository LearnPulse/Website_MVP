"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useProgress } from "@/hooks/useProgress";
import { apiClient } from "@/lib/api-client";
import type { GoalSummary } from "@/lib/types";

// ── Streak helpers ────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function initStreak(): { count: number; isNew: boolean } {
  const today = todayStr();
  const last = localStorage.getItem("lp_last_checkin");
  const stored = parseInt(localStorage.getItem("lp_streak_count") ?? "0", 10);
  if (last === today) return { count: stored, isNew: false };
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const next = last === yesterday ? stored + 1 : 1;
  localStorage.setItem("lp_last_checkin", today);
  localStorage.setItem("lp_streak_count", String(next));
  return { count: next, isNew: true };
}

const ENCOURAGEMENT = [
  "You're on a roll — keep the momentum going!",
  "Consistency beats intensity. One concept at a time.",
  "Every session brings you closer to mastery.",
  "Great work showing up today!",
  "Small steps compound into big results.",
  "Learning is a superpower. You're building it.",
];

function encouragement(streak: number, pct: number): string {
  if (streak >= 7) return `${streak}-day streak! You're unstoppable 🔥`;
  if (pct >= 80) return "Almost there — you're in the final stretch!";
  if (pct >= 50) return "Past the halfway point. Keep pushing!";
  if (streak >= 3) return `${streak} days in a row — great habit building!`;
  return ENCOURAGEMENT[streak % ENCOURAGEMENT.length];
}

// ── Check-in toast ────────────────────────────────────────────────────────

function CheckInToast({
  streak,
  pct,
  onClose,
}: {
  streak: number;
  pct: number;
  onClose: () => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    barRef.current?.style.setProperty("--pct", `${pct}%`);
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [pct, onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 rounded-2xl bg-canvas border border-line shadow-card p-5 animate-slide-up">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-lg">
            {streak >= 7 ? "🔥" : streak >= 3 ? "⚡" : "👋"}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Welcome back!</p>
            <p className="text-xs text-dim">{streak} day streak</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="text-dim hover:text-ink text-xs mt-0.5">✕</button>
      </div>
      <p className="text-xs text-dim mb-3">{encouragement(streak, pct)}</p>
      <div className="h-1.5 bg-line rounded-full overflow-hidden">
        <div ref={barRef} className="progress-fill h-full bg-primary rounded-full transition-all duration-700" />
      </div>
      <p className="text-[10px] text-dim mt-1.5">{pct}% mastered overall</p>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────

function StatCard({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  return (
    <div className={`flex-1 min-w-0 p-5 rounded-2xl border ${accent ? "bg-primary/5 border-primary/20" : "bg-surface border-line"}`}>
      <p className={`tabular text-4xl font-bold tracking-tight mb-1 ${accent ? "text-primary" : "text-ink"}`}>{value}</p>
      <p className="text-sm text-dim">{label}</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [goals, setGoals] = useState<GoalSummary[]>([]);
  const [activeGoalId, setActiveGoalId] = useState<string | undefined>(undefined);
  const { data, isLoading } = useProgress(userId, activeGoalId);
  const [streak, setStreak] = useState(0);
  const [showToast, setShowToast] = useState(false);

  const pct = data && data.total_count > 0
    ? Math.round((data.mastered_count / data.total_count) * 100) : 0;

  const next = data?.concepts.find((c) => c.state === "active") ?? null;
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    barRef.current?.style.setProperty("--pct", `${pct}%`);
  }, [pct]);

  useEffect(() => {
    const { count, isNew } = initStreak();
    setStreak(count);
    if (isNew && data && data.total_count > 0) setShowToast(true);
  }, [data]);

  const loadGoals = useCallback(async () => {
    const res = await apiClient.listGoals();
    if (res.success && res.data && res.data.length > 0) {
      setGoals(res.data);
      setActiveGoalId(res.data[0].id);
    }
  }, []);

  useEffect(() => { loadGoals(); }, [loadGoals]);

  const closeToast = useCallback(() => setShowToast(false), []);

  return (
    <div className="min-h-full px-10 py-12 max-w-[780px]">

      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-ink">Overview</h1>
          {streak > 0 && (
            <div className="flex items-center gap-1.5 h-7 px-3 rounded-full bg-primary/10 border border-primary/20">
              <span className="text-sm">{streak >= 7 ? "🔥" : streak >= 3 ? "⚡" : "✨"}</span>
              <span className="text-xs font-semibold text-primary">{streak} day streak</span>
            </div>
          )}
        </div>
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
          <div className="flex gap-4 mt-6">
            {[1, 2, 3].map((i) => <div key={i} className="flex-1 h-24 bg-surface rounded-2xl" />)}
          </div>
        </div>

      ) : data && data.total_count > 0 ? (
        <>
          {/* Goal selector */}
          {goals.length > 1 && (
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-dim mb-2">Learning path</p>
              <div className="flex flex-wrap gap-2">
                {goals.map((g, i) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setActiveGoalId(g.id)}
                    className={[
                      "h-8 px-4 rounded-full text-xs font-medium border transition-all",
                      activeGoalId === g.id
                        ? "bg-primary text-white border-transparent"
                        : "border-line text-dim hover:border-dim/60 hover:text-ink",
                    ].join(" ")}
                  >
                    {i === 0 && <span className="mr-1.5">●</span>}
                    {g.goal_text.length > 36 ? `${g.goal_text.slice(0, 36)}…` : g.goal_text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Goal */}
          <div className="mb-10">
            {goals.length <= 1 && (
              <p className="text-xs font-semibold uppercase tracking-widest text-dim mb-2">Active path</p>
            )}
            <h2 className="text-xl font-semibold text-ink mb-6 leading-snug">
              {data.goal_text}
            </h2>

            {/* Encouragement */}
            <p className="text-sm text-primary font-medium mb-4">
              {encouragement(streak, pct)}
            </p>

            {/* Progress */}
            <div className="flex items-center gap-4 mb-2">
              <div className="flex-1 h-2 bg-line rounded-full overflow-hidden">
                <div ref={barRef} className="progress-fill h-full bg-primary rounded-full transition-all duration-700" />
              </div>
              <span className="tabular text-sm font-bold text-primary w-12 text-right">{pct}%</span>
            </div>
            <p className="text-sm text-dim">
              {data.mastered_count} of {data.total_count} concepts mastered
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-3 mb-12 pb-10 border-b border-line">
            <StatCard value={data.mastered_count} label="Mastered" accent />
            <StatCard value={data.total_count - data.mastered_count} label="Remaining" />
            <StatCard value={data.total_count} label="Total concepts" />
            {streak > 0 && <StatCard value={streak} label="Day streak" />}
          </div>

          {/* Up next */}
          {next && (
            <div className="mb-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-dim mb-4">Up next</p>
              <div className="flex items-center justify-between gap-6 p-5 bg-surface border border-line rounded-2xl hover:border-dim/40 transition-all duration-200">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-ink mb-1">{next.name}</p>
                  <p className="text-sm text-dim truncate max-w-md">{next.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push(activeGoalId ? `/paths/current?goal_id=${activeGoalId}` : "/paths/current")}
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
              { label: "View full path",  href: activeGoalId ? `/paths/current?goal_id=${activeGoalId}` : "/paths/current" },
              { label: "Concept Map",     href: "/graph" },
              { label: "Chat",            href: "/chat" },
            ].map(({ label, href }) => (
              <button
                key={label}
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

      {showToast && (
        <CheckInToast streak={streak} pct={pct} onClose={closeToast} />
      )}
    </div>
  );
}
