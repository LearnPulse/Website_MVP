"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

// ── Format icons (SVG, no emojis) ─────────────────────────────────────────

const FORMAT_META: Record<ArtifactFormat, { label: string; icon: React.ReactNode }> = {
  cheatsheet: {
    label: "Cheatsheet",
    icon: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <rect x="1" y="1" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
        <path d="M3.5 4.5h6M3.5 6.5h6M3.5 8.5h4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      </svg>
    ),
  },
  flashcards: {
    label: "Flashcards",
    icon: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <rect x="1" y="2.5" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
        <rect x="3" y="1" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.1" strokeDasharray="2 1"/>
      </svg>
    ),
  },
  quiz: {
    label: "Quiz",
    icon: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.1"/>
        <path d="M5 5.2a1.5 1.5 0 012.5 1.1c0 .8-.7 1.2-1 1.5v.7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
        <circle cx="6.5" cy="9.5" r=".6" fill="currentColor"/>
      </svg>
    ),
  },
  diagram: {
    label: "Diagram",
    icon: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <circle cx="6.5" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.1"/>
        <circle cx="2.5" cy="10" r="1.5" stroke="currentColor" strokeWidth="1.1"/>
        <circle cx="10.5" cy="10" r="1.5" stroke="currentColor" strokeWidth="1.1"/>
        <path d="M6.5 4.5v1L4 8.5M6.5 5.5L9 8.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      </svg>
    ),
  },
  audio: {
    label: "Audio",
    icon: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <rect x="4" y="1.5" width="5" height="7" rx="2.5" stroke="currentColor" strokeWidth="1.1"/>
        <path d="M2 7.5a4.5 4.5 0 009 0" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
        <path d="M6.5 11v1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      </svg>
    ),
  },
};

// ── Progress bar ───────────────────────────────────────────────────────────

function Bar({ pct, thin }: { pct: number; thin?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.style.setProperty("--pct", `${pct}%`); }, [pct]);
  return (
    <div className={`bg-line rounded-full overflow-hidden ${thin ? "h-[2px]" : "h-[3px]"}`}>
      <div ref={ref} className="progress-fill h-full bg-primary rounded-full transition-all duration-500" />
    </div>
  );
}

// ── Concept Panel ──────────────────────────────────────────────────────────

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
  const locked = concept.state === "locked";

  async function handleArtifact(fmt: ArtifactFormat) {
    if (loadingFormat || locked) return;
    if (activeArtifact?.format === fmt) { setActiveArtifact(null); return; }
    setLoadingFormat(fmt);
    try {
      const payload = await requestArtifact(concept.id, fmt);
      if (!payload) return;
      setActiveArtifact({ format: fmt, payload });
      if (userId) {
        await apiClient.updateMastery({ concept_id: concept.id, source: "view" });
        onMasteryUpdate();
      }
    } finally {
      setLoadingFormat(null);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8">
      {/* State tag */}
      <div className="flex items-center gap-2 mb-3">
        {concept.state === "done" && (
          <span className="inline-flex items-center h-5 px-2 rounded-sm bg-primary/10 text-primary text-2xs font-semibold uppercase tracking-wide">
            Mastered
          </span>
        )}
        {concept.state === "active" && (
          <span className="inline-flex items-center h-5 px-2 rounded-sm bg-amber-500/10 text-amber-400 text-2xs font-semibold uppercase tracking-wide">
            In progress
          </span>
        )}
        {locked && (
          <span className="inline-flex items-center h-5 px-2 rounded-sm bg-ghost text-dim text-2xs font-semibold uppercase tracking-wide">
            Locked
          </span>
        )}
      </div>

      <h2 className="text-xl font-bold tracking-tight text-ink mb-1">{concept.name}</h2>

      {!locked && (
        <div className="flex items-center gap-3 mt-3 mb-4">
          <div className="w-28">
            <Bar pct={concept.mastery_score} thin />
          </div>
          <span className="tabular text-xs text-dim">{concept.mastery_score}% mastery</span>
        </div>
      )}

      {concept.description && (
        <p className="text-sm text-dim leading-relaxed mb-7 max-w-lg">{concept.description}</p>
      )}

      {locked ? (
        <div className="flex items-center gap-3 py-5 border-t border-line">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-dim flex-shrink-0">
            <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <p className="text-sm text-dim">Complete prerequisite concepts to unlock this.</p>
        </div>
      ) : (
        <>
          {/* Format selector */}
          <p className="text-2xs font-semibold uppercase tracking-widest text-dim mb-3">Study with</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {concept.preferred_formats.map((fmt) => {
              const meta = FORMAT_META[fmt];
              const active = activeArtifact?.format === fmt;
              const loading = loadingFormat === fmt;
              return (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => handleArtifact(fmt)}
                  disabled={!!loadingFormat}
                  className={[
                    "flex items-center gap-2 h-8 px-3 rounded border text-sm font-medium transition-all",
                    active
                      ? "bg-primary border-primary text-white"
                      : "border-line text-dim hover:text-ink hover:border-ghost bg-surface",
                  ].join(" ")}
                >
                  {loading
                    ? <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                    : meta.icon
                  }
                  {meta.label}
                </button>
              );
            })}
          </div>

          {/* Artifact output */}
          {activeArtifact && (
            <div className="border-t border-line pt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-2xs font-semibold uppercase tracking-widest text-dim">
                  {FORMAT_META[activeArtifact.format].label}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveArtifact(null)}
                  className="text-xs text-dim hover:text-ink transition-colors"
                >
                  Close
                </button>
              </div>
              {activeArtifact.format === "cheatsheet" && <Cheatsheet payload={activeArtifact.payload as any} />}
              {activeArtifact.format === "flashcards" && (
                <Flashcards
                  payload={activeArtifact.payload as any}
                  onComplete={async () => {
                    if (userId) {
                      await apiClient.updateMastery({ concept_id: concept.id, source: "flashcard" });
                      onMasteryUpdate();
                    }
                  }}
                />
              )}
              {activeArtifact.format === "quiz" && (
                <Quiz
                  payload={activeArtifact.payload as any}
                  onAnswer={async (correct) => {
                    if (userId) {
                      await apiClient.updateMastery({ concept_id: concept.id, source: correct ? "quiz_pass" : "quiz_fail" });
                      onMasteryUpdate();
                    }
                  }}
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

// ── Main page ─────────────────────────────────────────────────────────────

export default function CurrentPathPage() {
  const { userId } = useAuth();
  const { data, isLoading, error, refetch } = useProgress(userId);
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-sm text-dim">{error}</p>
        <button type="button" onClick={refetch} className="text-xs text-primary hover:underline">Retry</button>
      </div>
    );
  }
  if (!data || data.concepts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-sm text-dim">No concepts yet — upload documents to build your path.</p>
        <button
          type="button"
          onClick={() => router.push("/paths/new")}
          className="h-9 px-4 rounded bg-primary text-white text-sm font-medium"
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
      <div className="w-64 min-w-[256px] flex flex-col border-r border-line overflow-y-auto">

        {/* Path header */}
        <div className="px-4 py-4 border-b border-line">
          <p className="text-xs font-semibold text-ink leading-snug mb-3 line-clamp-2">
            {data.goal_text}
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Bar pct={pct} thin />
            </div>
            <span className="tabular text-2xs text-primary font-bold">{pct}%</span>
          </div>
          <p className="text-2xs text-dim mt-1">{data.mastered_count}/{data.total_count} mastered</p>
        </div>

        {/* Concept list */}
        <div className="flex-1 py-1">
          {data.concepts.map((c) => {
            const sel = c.id === selected?.id;
            return (
              <button
                key={c.id}
                type="button"
                disabled={c.state === "locked"}
                onClick={() => setSelectedId(c.id)}
                className={[
                  "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors text-sm",
                  sel ? "bg-surface text-ink" : "",
                  c.state === "locked" ? "opacity-35 cursor-default" : "hover:bg-surface/50",
                  sel ? "border-r-2 border-primary" : "",
                ].join(" ")}
              >
                {/* State indicator */}
                <span className="flex-shrink-0">
                  {c.state === "done" && (
                    <span className="flex w-4 h-4 rounded-full bg-primary items-center justify-center">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1.5 4l1.5 1.5L6.5 2" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  )}
                  {c.state === "active" && (
                    <span className="flex w-4 h-4 rounded-full border-2 border-primary" />
                  )}
                  {c.state === "locked" && (
                    <svg width="12" height="12" viewBox="0 0 12 12" className="text-dim" fill="none">
                      <rect x="1.5" y="5" width="9" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
                      <path d="M3.5 5V3.5a2.5 2.5 0 015 0V5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                    </svg>
                  )}
                </span>

                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${c.state === "locked" ? "text-dim" : sel ? "text-ink" : "text-dim"}`}>
                    {c.name}
                  </p>
                  {c.state !== "locked" && c.mastery_score > 0 && (
                    <p className="tabular text-2xs text-dim mt-0.5">{c.mastery_score}%</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 overflow-y-auto">
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
