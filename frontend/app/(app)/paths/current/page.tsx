"use client";

import { useState } from "react";
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

const FORMAT_META: Record<ArtifactFormat, { label: string; icon: string }> = {
  cheatsheet: { label: "Cheatsheet", icon: "📋" },
  flashcards: { label: "Flashcards", icon: "🃏" },
  quiz:       { label: "Quiz",       icon: "✏️" },
  diagram:    { label: "Diagram",    icon: "🗺️" },
  audio:      { label: "Audio",      icon: "🎧" },
};

// ── Concept Panel (right side) ─────────────────────────────────────────────

function ConceptPanel({
  concept,
  goalText,
  userId,
  onMasteryUpdate,
}: {
  concept: ConceptProgress;
  goalText: string;
  userId: string | null;
  onMasteryUpdate: () => void;
}) {
  const { requestArtifact } = useArtifact(userId, goalText);
  const [loadingFormat, setLoadingFormat] = useState<ArtifactFormat | null>(null);
  const [activeArtifact, setActiveArtifact] = useState<{ format: ArtifactFormat; payload: ArtifactPayload } | null>(null);

  const isLocked = concept.state === "locked";

  async function handleArtifact(format: ArtifactFormat) {
    if (loadingFormat || isLocked) return;
    if (activeArtifact?.format === format) { setActiveArtifact(null); return; }
    setLoadingFormat(format);
    try {
      const payload = await requestArtifact(concept.id, format);
      if (!payload) return;
      setActiveArtifact({ format, payload });
      if (userId) {
        await apiClient.updateMastery({ user_id: userId, concept_id: concept.id, source: "view" });
        onMasteryUpdate();
      }
    } finally {
      setLoadingFormat(null);
    }
  }

  return (
    <div className="flex-1 min-w-0 py-8 px-8">
      {/* State badge + title */}
      <div className="flex items-center gap-3 mb-2">
        {concept.state === "done" && (
          <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            Mastered
          </span>
        )}
        {concept.state === "active" && (
          <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
            In progress
          </span>
        )}
        {concept.state === "locked" && (
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
            Locked
          </span>
        )}
      </div>
      <h2 className="text-xl font-semibold text-slate-100 mb-3">{concept.name}</h2>

      {/* Mastery bar */}
      {!isLocked && (
        <div className="flex items-center gap-3 mb-5">
          <div className="w-32 h-1.5 rounded-full bg-slate-700 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${concept.mastery_score}%` }}
            />
          </div>
          <span className="text-xs text-slate-500">{concept.mastery_score}% mastery</span>
        </div>
      )}

      {/* Description */}
      {concept.description && (
        <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-xl">
          {concept.description}
        </p>
      )}

      {isLocked ? (
        <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center max-w-md">
          <svg className="w-6 h-6 text-slate-600 mx-auto mb-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-slate-500">Complete prerequisite concepts to unlock this.</p>
        </div>
      ) : (
        <>
          {/* Format buttons */}
          <div className="mb-2">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-600 mb-3">
              Study with
            </p>
            <div className="flex flex-wrap gap-2">
              {concept.preferred_formats.map((fmt) => {
                const meta = FORMAT_META[fmt];
                const isThis = activeArtifact?.format === fmt;
                const loading = loadingFormat === fmt;
                return (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => handleArtifact(fmt)}
                    disabled={!!loadingFormat}
                    className={[
                      "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-all",
                      isThis
                        ? "bg-primary text-white border-primary"
                        : "bg-slate-800/60 text-slate-300 border-slate-700 hover:border-primary/50 hover:text-primary",
                    ].join(" ")}
                  >
                    {loading ? (
                      <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                    ) : (
                      <span>{meta.icon}</span>
                    )}
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Artifact content */}
          {activeArtifact && (
            <div className="mt-6 rounded-xl border border-slate-700/60 bg-slate-800/30 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700/40">
                <span className="text-xs font-semibold text-slate-400">
                  {FORMAT_META[activeArtifact.format].label}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveArtifact(null)}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Close ✕
                </button>
              </div>
              <div className="px-5 py-5">
                {activeArtifact.format === "cheatsheet" && <Cheatsheet payload={activeArtifact.payload as any} />}
                {activeArtifact.format === "flashcards" && (
                  <Flashcards
                    payload={activeArtifact.payload as any}
                    onComplete={async () => {
                      if (userId) {
                        await apiClient.updateMastery({ user_id: userId, concept_id: concept.id, source: "flashcard" });
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
                        await apiClient.updateMastery({ user_id: userId, concept_id: concept.id, source: correct ? "quiz_pass" : "quiz_fail" });
                        onMasteryUpdate();
                      }
                    }}
                  />
                )}
                {activeArtifact.format === "diagram" && <Diagram payload={activeArtifact.payload as any} />}
                {activeArtifact.format === "audio" && <Audio payload={activeArtifact.payload as any} />}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Main Path Detail Page ──────────────────────────────────────────────────

export default function CurrentPathPage() {
  const { userId } = useAuth();
  const { data, isLoading, error, refetch } = useProgress(userId);
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
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-sm text-slate-400">{error}</p>
        <button type="button" onClick={refetch} className="text-xs text-primary hover:underline">Try again</button>
      </div>
    );
  }

  if (!data || data.concepts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-sm text-slate-400">No concepts yet — upload documents to build your path.</p>
        <button
          type="button"
          onClick={() => router.push("/paths/new")}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium"
        >
          Upload documents
        </button>
      </div>
    );
  }

  const selected = data.concepts.find((c) => c.id === selectedId) ?? data.concepts.find((c) => c.state === "active") ?? data.concepts[0];
  const masteredPct = Math.round((data.mastered_count / data.total_count) * 100);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left panel — module/concept list */}
      <div className="w-72 min-w-[288px] border-r border-slate-800 flex flex-col overflow-y-auto">
        {/* Path header */}
        <div className="px-5 py-5 border-b border-slate-800">
          <h1 className="text-sm font-semibold text-slate-100 leading-snug mb-3">
            {data.goal_text}
          </h1>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${masteredPct}%` }}
              />
            </div>
            <span className="text-[11px] text-primary font-semibold">{masteredPct}%</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {data.mastered_count} / {data.total_count} mastered
          </p>
        </div>

        {/* Concept list */}
        <div className="flex-1 py-2">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-600 px-5 py-3">
            Concepts
          </p>
          {data.concepts.map((concept) => {
            const isSelected = concept.id === selected?.id;
            const isDone = concept.state === "done";
            const isActive = concept.state === "active";
            const isLocked = concept.state === "locked";

            return (
              <button
                key={concept.id}
                type="button"
                disabled={isLocked}
                onClick={() => setSelectedId(concept.id)}
                className={[
                  "w-full flex items-center gap-3 px-5 py-3 text-left transition-all",
                  isSelected ? "bg-slate-800/60 border-r-2 border-primary" : "hover:bg-slate-800/30",
                  isLocked ? "opacity-40 cursor-default" : "",
                ].join(" ")}
              >
                {/* State dot */}
                <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                  {isDone && (
                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                  {isActive && (
                    <div className="w-3 h-3 rounded-full border-2 border-primary bg-transparent" />
                  )}
                  {isLocked && (
                    <svg className="w-3 h-3 text-slate-600" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M9 5V4a3 3 0 00-6 0v1H2v6h8V5H9zm-4-1a1 1 0 012 0v1H5V4z" />
                    </svg>
                  )}
                </div>

                {/* Name + mastery */}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium leading-tight truncate ${isLocked ? "text-slate-500" : "text-slate-200"}`}>
                    {concept.name}
                  </p>
                  {!isLocked && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-12 h-0.5 rounded-full bg-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${concept.mastery_score}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-600">{concept.mastery_score}%</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right panel — concept detail */}
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
