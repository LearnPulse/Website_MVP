"use client";

import { useState } from "react";
import type { ConceptProgress, ArtifactFormat, ArtifactPayload } from "@/lib/types";
import Cheatsheet from "@/components/artifacts/Cheatsheet";
import Flashcards from "@/components/artifacts/Flashcards";
import Quiz from "@/components/artifacts/Quiz";
import Diagram from "@/components/artifacts/Diagram";
import Audio from "@/components/artifacts/Audio";

interface ConceptCardProps {
  concept: ConceptProgress;
  isLast: boolean;
  onArtifactRequest: (format: ArtifactFormat) => Promise<ArtifactPayload | null>;
  onMasteryUpdate: (source: "view" | "flashcard" | "quiz_pass" | "quiz_fail") => void;
}

const FORMAT_META: Record<ArtifactFormat, { label: string; icon: string }> = {
  cheatsheet: { label: "Cheatsheet", icon: "📋" },
  flashcards: { label: "Flashcards", icon: "🃏" },
  quiz:       { label: "Quiz",       icon: "✏️" },
  diagram:    { label: "Diagram",    icon: "🗺️" },
  audio:      { label: "Audio",      icon: "🎧" },
};

export default function ConceptCard({ concept, isLast, onArtifactRequest, onMasteryUpdate }: ConceptCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [loadingFormat, setLoadingFormat] = useState<ArtifactFormat | null>(null);
  const [activeArtifact, setActiveArtifact] = useState<{ format: ArtifactFormat; payload: ArtifactPayload } | null>(null);
  const [viewedFormats, setViewedFormats] = useState<Set<ArtifactFormat>>(new Set(concept.viewed_formats));

  const isDone   = concept.state === "done";
  const isActive = concept.state === "active";
  const isLocked = concept.state === "locked";

  async function handleArtifact(format: ArtifactFormat) {
    if (loadingFormat || isLocked) return;
    if (activeArtifact?.format === format) { setActiveArtifact(null); return; }
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
    <div className="flex gap-3">
      {/* Timeline column */}
      <div className="flex flex-col items-center pt-[3px] flex-shrink-0">
        {/* Node */}
        <div className="relative w-5 h-5 flex items-center justify-center">
          {isActive && (
            <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          )}
          <div className={[
            "w-3.5 h-3.5 rounded-full border-2 transition-colors",
            isDone   ? "bg-primary border-primary"                      : "",
            isActive ? "bg-background-dark border-primary"              : "",
            isLocked ? "bg-transparent border-slate-600"                : "",
          ].join(" ")}>
            {isDone && (
              <svg className="w-full h-full text-white p-[1px]" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        </div>
        {/* Connector */}
        {!isLast && (
          <div className={`w-px flex-1 mt-1 ${isDone ? "bg-primary/40" : "bg-slate-700"}`} />
        )}
      </div>

      {/* Card body */}
      <div className="flex-1 pb-5">
        {/* Header row */}
        <button
          type="button"
          disabled={isLocked}
          onClick={() => setExpanded((e) => !e)}
          className={[
            "w-full text-left rounded-xl px-4 py-3 border transition-all",
            isDone   ? "border-primary/30 bg-primary/5"                               : "",
            isActive ? "border-slate-700 bg-slate-800/60 hover:border-primary/50"    : "",
            isLocked ? "border-slate-800 bg-slate-800/20 opacity-40 cursor-default"  : "",
          ].join(" ")}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <span className={`text-sm font-medium leading-tight ${isLocked ? "text-slate-500" : "text-slate-100"}`}>
                {concept.name}
              </span>

              {/* Mastery bar — always visible when active/done */}
              {!isLocked && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-0.5 rounded-full bg-slate-700 overflow-hidden max-w-[80px]">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${concept.mastery_score}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">{concept.mastery_score}%</span>
                </div>
              )}
            </div>

            {/* State badge */}
            <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
              {isDone && (
                <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Done
                </span>
              )}
              {isLocked && (
                <svg className="w-3 h-3 text-slate-600" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M9 5V4a3 3 0 00-6 0v1H2v6h8V5H9zm-4-1a1 1 0 012 0v1H5V4z"/>
                </svg>
              )}
              {!isLocked && (
                <svg className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} viewBox="0 0 12 12" fill="none">
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </div>
        </button>

        {/* Expanded panel */}
        {expanded && !isLocked && (
          <div className="mt-2 rounded-xl border border-slate-700/60 bg-slate-800/40 overflow-hidden">
            {/* Description */}
            {concept.description && (
              <p className="text-xs text-slate-400 leading-relaxed px-4 pt-4 pb-3 border-b border-slate-700/40">
                {concept.description}
              </p>
            )}

            {/* Artifact format pills */}
            <div className="px-4 py-3 flex gap-2 flex-wrap">
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
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                      isThis
                        ? "bg-primary text-white border-primary"
                        : viewedFormats.has(fmt)
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "bg-slate-700/50 text-slate-300 border-slate-700 hover:border-primary/50 hover:text-primary",
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

            {/* Active artifact content */}
            {activeArtifact && (
              <div className="border-t border-slate-700/40 px-4 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-500">
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
