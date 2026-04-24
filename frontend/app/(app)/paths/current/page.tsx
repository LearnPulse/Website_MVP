"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useProgress } from "@/hooks/useProgress";
import { useArtifact } from "@/hooks/useArtifact";
import { apiClient } from "@/lib/api-client";
import type { ConceptProgress, ArtifactFormat, ArtifactPayload } from "@/lib/types";
import Cheatsheet from "@/components/artifacts/Cheatsheet";
import Flashcards from "@/components/artifacts/Flashcards";
import Quiz from "@/components/artifacts/Quiz";
import Diagram from "@/components/artifacts/Diagram";
import Audio from "@/components/artifacts/Audio";

// ── Format metadata ────────────────────────────────────────────────────────

const FORMAT_META: Record<ArtifactFormat, { label: string; icon: React.ReactNode }> = {
  cheatsheet: {
    label: "Cheatsheet",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M3.5 4.5h7M3.5 7h7M3.5 9.5h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  flashcards: {
    label: "Flashcards",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="2.5" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="3" y="1" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2.5 1.5"/>
      </svg>
    ),
  },
  quiz: {
    label: "Quiz",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M5.2 5.5a2 2 0 013.1 1.65c0 1-.8 1.4-1.3 1.85V10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="7" cy="11.2" r=".7" fill="currentColor"/>
      </svg>
    ),
  },
  diagram: {
    label: "Diagram",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="2.5" r="1.8" stroke="currentColor" strokeWidth="1.2"/>
        <circle cx="2.5" cy="11.5" r="1.8" stroke="currentColor" strokeWidth="1.2"/>
        <circle cx="11.5" cy="11.5" r="1.8" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M7 4.3V6L4.3 9.7M7 6l2.7 3.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  audio: {
    label: "Audio",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="4.5" y="1.5" width="5" height="7.5" rx="2.5" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M2 8a5 5 0 0010 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M7 13v-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
};

// ── Progress bar ────────────────────────────────────────────────────────────

function Bar({ pct }: { pct: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.style.setProperty("--pct", `${pct}%`); }, [pct]);
  return (
    <div className="h-1.5 bg-line rounded-full overflow-hidden">
      <div ref={ref} className="progress-fill h-full bg-primary rounded-full transition-all duration-500" />
    </div>
  );
}

// ── State badge ─────────────────────────────────────────────────────────────

function StateBadge({ state }: { state: ConceptProgress["state"] }) {
  if (state === "done") return (
    <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-primary/12 text-primary text-xs font-semibold">
      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
        <path d="M1.5 4.5l2 2L7.5 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Mastered
    </span>
  );
  if (state === "active") return (
    <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-amber-500/12 text-amber-400 text-xs font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
      In progress
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-ghost text-dim text-xs font-semibold">
      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
        <rect x="1" y="4" width="7" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.1"/>
        <path d="M2.5 4V3a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      </svg>
      Locked
    </span>
  );
}

const XP_AMOUNTS: Record<string, number> = { view: 8, flashcard: 15, quiz_pass: 35, quiz_fail: 8 };

// ── Concept panel ───────────────────────────────────────────────────────────

function ConceptPanel({
  concept, goalText, userId, onMasteryUpdate,
}: {
  concept: ConceptProgress;
  goalText: string;
  userId: string | null;
  onMasteryUpdate: () => void;
}) {
  const { requestArtifact } = useArtifact(userId, goalText);
  const [loadingFormat, setLoadingFormat] = useState<ArtifactFormat | null>(null);
  const [activeArtifact, setActiveArtifact] = useState<{ format: ArtifactFormat; payload: ArtifactPayload } | null>(null);
  const [artifactError, setArtifactError] = useState<string | null>(null);
  const artifactRef = useRef<HTMLDivElement>(null);
  const perConceptCache = useRef<Map<string, { format: ArtifactFormat; payload: ArtifactPayload }>>(new Map());
  const [xpToast, setXpToast] = useState<{ amount: number; key: number } | null>(null);
  const locked = concept.state === "locked";

  useEffect(() => {
    setArtifactError(null);
    setActiveArtifact(perConceptCache.current.get(concept.id) ?? null);
  }, [concept.id]);

  async function markMastery(source: "view" | "flashcard" | "quiz_pass" | "quiz_fail") {
    if (!userId) return;
    await apiClient.updateMastery({ concept_id: concept.id, source });
    onMasteryUpdate();
    const amount = XP_AMOUNTS[source];
    setXpToast({ amount, key: Date.now() });
    setTimeout(() => setXpToast(null), 2000);
  }

  async function handleArtifact(fmt: ArtifactFormat) {
    if (loadingFormat || locked) return;
    if (activeArtifact?.format === fmt) { setActiveArtifact(null); return; }
    setLoadingFormat(fmt);
    setArtifactError(null);
    try {
      const payload = await requestArtifact(concept.id, fmt);
      if (!payload) { setArtifactError("Generation failed — please try again."); return; }
      const artifact = { format: fmt, payload };
      setActiveArtifact(artifact);
      perConceptCache.current.set(concept.id, artifact);
      setTimeout(() => artifactRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      // Passive formats get mastery credit just for opening them
      if (fmt === "cheatsheet" || fmt === "diagram" || fmt === "audio") {
        await markMastery("view");
      }
    } catch (err) {
      console.error("Artifact request error:", err);
      setArtifactError("Something went wrong. Please try again.");
    } finally {
      setLoadingFormat(null);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-10">

      {/* Concept header */}
      <div className="mb-6">
        <StateBadge state={concept.state} />
        <h2 className="text-2xl font-bold tracking-tight text-ink mt-3 mb-2">{concept.name}</h2>

        {!locked && concept.mastery_score > 0 && (
          <div className="flex items-center gap-3 mt-4">
            <div className="w-32">
              <Bar pct={concept.mastery_score} />
            </div>
            <span className="tabular text-sm text-dim">{concept.mastery_score}% mastery</span>
          </div>
        )}
      </div>

      {concept.description && (
        <p className="text-base text-dim leading-relaxed mb-8 max-w-prose">{concept.description}</p>
      )}

      {locked ? (
        <div className="flex items-start gap-3 p-4 bg-surface rounded-xl border border-line">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-dim flex-shrink-0 mt-0.5">
            <rect x="2" y="7" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <p className="text-sm text-dim">Complete prerequisite concepts to unlock this topic.</p>
        </div>
      ) : (
        <>
          {/* XP toast */}
          {xpToast && (
            <div
              key={xpToast.key}
              className="fixed top-6 right-6 z-50 flex items-center gap-2 h-10 px-4 rounded-2xl bg-amber-400 text-white text-sm font-bold shadow-lg animate-slide-up pointer-events-none"
            >
              <span>🪙</span>
              +{xpToast.amount} XP
            </div>
          )}

          {/* Format buttons */}
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-dim mb-3">Study with</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(FORMAT_META) as ArtifactFormat[]).map((fmt) => {
                const meta = FORMAT_META[fmt];
                const isActive = activeArtifact?.format === fmt;
                const loading = loadingFormat === fmt;
                return (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => handleArtifact(fmt)}
                    disabled={!!loadingFormat}
                    className={[
                      "flex items-center gap-2 h-9 px-4 rounded-xl border text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-primary border-primary text-white"
                        : "border-line text-dim hover:text-ink hover:border-dim/40 hover:bg-surface bg-ghost/50",
                    ].join(" ")}
                  >
                    {loading
                      ? <span className="w-3.5 h-3.5 rounded-full border-[1.5px] border-current border-t-transparent animate-spin" />
                      : meta.icon
                    }
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error feedback */}
          {artifactError && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl border border-red-400/30 bg-red-400/8 text-sm text-red-400">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M7 4v3.5M7 10h.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              {artifactError}
            </div>
          )}

          {/* Artifact output */}
          {activeArtifact && (
            <div ref={artifactRef} className="border-t border-line pt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-dim">
                  {FORMAT_META[activeArtifact.format].label}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveArtifact(null)}
                  className="text-sm text-dim hover:text-ink transition-colors"
                >
                  Close
                </button>
              </div>
              {activeArtifact.format === "cheatsheet" && <Cheatsheet payload={activeArtifact.payload as any} />}
              {activeArtifact.format === "flashcards" && (
                <Flashcards
                  payload={activeArtifact.payload as any}
                  onComplete={() => markMastery("flashcard")}
                />
              )}
              {activeArtifact.format === "quiz" && (
                <Quiz
                  payload={activeArtifact.payload as any}
                  onAnswer={(correct) => markMastery(correct ? "quiz_pass" : "quiz_fail")}
                />
              )}
              {activeArtifact.format === "diagram" && <Diagram payload={activeArtifact.payload as any} />}
              {activeArtifact.format === "audio" && <Audio payload={activeArtifact.payload as any} />}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────

export default function CurrentPathPage() {
  const { userId } = useAuth();
  const searchParams = useSearchParams();
  const goalId = searchParams.get("goal_id") ?? undefined;
  const { data, isLoading, error, refetch } = useProgress(userId, goalId);
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-sm text-dim">{error}</p>
        <button type="button" onClick={refetch} className="text-sm text-primary hover:underline">Retry</button>
      </div>
    );
  }
  if (!data || data.concepts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-base text-dim">No concepts yet — upload documents to build your path.</p>
        <button
          type="button"
          onClick={() => router.push("/paths/new")}
          className="h-10 px-5 rounded-xl bg-primary text-white text-sm font-semibold"
        >
          Upload documents
        </button>
      </div>
    );
  }

  const selected = data.concepts.find((c) => c.id === selectedId)
    ?? data.concepts.find((c) => c.state === "active")
    ?? data.concepts[0];

  const pct = Math.round((data.mastered_count / data.total_count) * 100);

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ── Left rail ── */}
      <div className="w-72 min-w-[288px] flex flex-col border-r border-line overflow-y-auto bg-canvas">

        {/* Path header */}
        <div className="px-5 py-5 border-b border-line">
          <p className="text-sm font-semibold text-ink leading-snug mb-4 line-clamp-2">
            {data.goal_text}
          </p>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex-1">
              <Bar pct={pct} />
            </div>
            <span className="tabular text-xs font-bold text-primary">{pct}%</span>
          </div>
          <p className="text-xs text-dim">{data.mastered_count} / {data.total_count} mastered</p>
        </div>

        {/* Concept list */}
        <div className="flex-1 py-2">
          {data.concepts.map((c) => {
            const sel = c.id === selected?.id;
            return (
              <button
                key={c.id}
                type="button"
                disabled={c.state === "locked"}
                onClick={() => setSelectedId(c.id)}
                className={[
                  "w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150",
                  sel ? "bg-surface" : "",
                  c.state === "locked" ? "opacity-35 cursor-default" : "hover:bg-surface/60",
                ].join(" ")}
              >
                {/* State dot */}
                <span className="flex-shrink-0 flex items-center justify-center w-5 h-5">
                  {c.state === "done" && (
                    <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                        <path d="M1.5 4.5l2 2L7.5 2" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  )}
                  {c.state === "active" && (
                    <span className="w-5 h-5 rounded-full border-2 border-primary" />
                  )}
                  {c.state === "locked" && (
                    <svg width="12" height="12" viewBox="0 0 12 12" className="text-dim" fill="none">
                      <rect x="1.5" y="5" width="9" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
                      <path d="M3.5 5V3.5a2.5 2.5 0 015 0V5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                    </svg>
                  )}
                </span>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate transition-colors ${
                    c.state === "locked" ? "text-dim" : sel ? "text-ink" : "text-dim"
                  }`}>
                    {c.name}
                  </p>
                  {c.state !== "locked" && c.mastery_score > 0 && (
                    <p className="tabular text-xs text-dim mt-0.5">{c.mastery_score}%</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 overflow-y-auto bg-canvas">
        {selected && (
          <ConceptPanel
            concept={selected}
            goalText={data.goal_text}
            userId={userId}
            onMasteryUpdate={refetch}
          />
        )}
      </div>
    </div>
  );
}
