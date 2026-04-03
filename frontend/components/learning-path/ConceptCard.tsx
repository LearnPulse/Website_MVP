"use client";

import { useState } from "react";
import type { ConceptProgress, ArtifactFormat, ArtifactPayload } from "@/lib/types";
import ArtifactButton from "./ArtifactButton";
import Cheatsheet from "@/components/artifacts/Cheatsheet";
import Flashcards from "@/components/artifacts/Flashcards";
import Quiz from "@/components/artifacts/Quiz";
import Diagram from "@/components/artifacts/Diagram";
import Audio from "@/components/artifacts/Audio";

interface ConceptCardProps {
  concept: ConceptProgress;
  isLast: boolean;
  onArtifactRequest: (format: ArtifactFormat) => Promise<ArtifactPayload | null>;
  onMasteryUpdate: (source: string) => void;
}

export default function ConceptCard({ concept, isLast, onArtifactRequest, onMasteryUpdate }: ConceptCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [loadingFormat, setLoadingFormat] = useState<ArtifactFormat | null>(null);
  const [activeArtifact, setActiveArtifact] = useState<{ format: ArtifactFormat; payload: ArtifactPayload } | null>(null);
  const [viewedFormats, setViewedFormats] = useState<Set<ArtifactFormat>>(new Set(concept.viewed_formats));

  const dotColor =
    concept.state === "done"
      ? "bg-primary"
      : concept.state === "active"
      ? "border-2 border-primary"
      : "border-[0.5px] border-slate-300 dark:border-slate-600";

  const masteryPct = concept.mastery_score;

  async function handleArtifact(format: ArtifactFormat) {
    if (loadingFormat) return;
    setLoadingFormat(format);
    try {
      const payload = await onArtifactRequest(format);
      if (!payload) return;
      setActiveArtifact({ format, payload });
      if (!viewedFormats.has(format)) {
        setViewedFormats((s) => new Set(s).add(format));
        onMasteryUpdate("view");
      }
    } finally {
      setLoadingFormat(null);
    }
  }

  return (
    <div className="flex gap-4">
      {/* Left column: dot + connector line */}
      <div className="flex flex-col items-center pt-1">
        <div className={`w-4 h-4 rounded-full flex-shrink-0 ${dotColor}`} />
        {!isLast && (
          <div className={`w-[0.5px] flex-1 mt-1 ${concept.state === "done" ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"}`} />
        )}
      </div>

      {/* Card */}
      <div className="flex-1 pb-6">
        <button
          type="button"
          onClick={() => concept.state !== "locked" && setExpanded((e) => !e)}
          className={[
            "w-full text-left rounded-lg border-[0.5px] px-4 py-3 transition-colors",
            concept.state === "locked"
              ? "border-slate-100 dark:border-slate-800 opacity-50 cursor-not-allowed"
              : "border-slate-200 dark:border-slate-700 hover:border-primary cursor-pointer",
          ].join(" ")}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {concept.name}
            </span>
            <div className="flex items-center gap-2 flex-shrink-0">
              {concept.state === "done" && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {masteryPct}% mastered
                </span>
              )}
              {concept.state === "active" && masteryPct > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-medium">
                  {masteryPct}% in progress
                </span>
              )}
              {concept.state === "locked" && (
                <svg className="w-3 h-3 text-slate-400" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M9 5V4a3 3 0 00-6 0v1H2v6h8V5H9zm-4-1a1 1 0 012 0v1H5V4z"/>
                </svg>
              )}
              {concept.state !== "locked" && (
                <svg className={`w-3 h-3 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`} viewBox="0 0 12 12" fill="none">
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </div>
        </button>

        {/* Expanded content */}
        {expanded && concept.state !== "locked" && (
          <div className="mt-2 rounded-lg border-[0.5px] border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-4">
            {/* Description */}
            {concept.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {concept.description}
              </p>
            )}

            {/* Mastery bar */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Mastery</span>
                <span>{masteryPct}%</span>
              </div>
              <div className="h-1 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${masteryPct}%` }}
                />
              </div>
            </div>

            {/* Artifact buttons */}
            <div className="flex flex-wrap gap-2">
              {concept.preferred_formats.map((fmt) => (
                <ArtifactButton
                  key={fmt}
                  format={fmt}
                  isViewed={viewedFormats.has(fmt)}
                  isLoading={loadingFormat === fmt}
                  onClick={() => handleArtifact(fmt)}
                />
              ))}
            </div>

            {/* Active artifact */}
            {activeArtifact && (
              <div className="pt-3 border-t-[0.5px] border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-slate-500 capitalize">
                    {activeArtifact.format}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveArtifact(null)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Close
                  </button>
                </div>
                {activeArtifact.format === "cheatsheet" && (
                  <Cheatsheet payload={activeArtifact.payload as any} />
                )}
                {activeArtifact.format === "flashcards" && (
                  <Flashcards
                    payload={activeArtifact.payload as any}
                    onComplete={() => onMasteryUpdate("flashcard")}
                  />
                )}
                {activeArtifact.format === "quiz" && (
                  <Quiz
                    payload={activeArtifact.payload as any}
                    onAnswer={(correct) => onMasteryUpdate(correct ? "quiz_pass" : "quiz_fail")}
                  />
                )}
                {activeArtifact.format === "diagram" && (
                  <Diagram payload={activeArtifact.payload as any} />
                )}
                {activeArtifact.format === "audio" && (
                  <Audio payload={activeArtifact.payload as any} />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
