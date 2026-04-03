"use client";

import { useState } from "react";
import type { AudioPayload } from "@/lib/types";

export default function Audio({ payload }: { payload: AudioPayload }) {
  const [showTranscript, setShowTranscript] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {/* Play button — placeholder for MVP (no TTS synthesis yet) */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg border-[0.5px] border-slate-200 dark:border-slate-700">
        <button
          type="button"
          disabled
          title="Audio playback coming soon"
          className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center opacity-40 cursor-not-allowed"
        >
          <svg className="w-4 h-4 text-slate-600 dark:text-slate-300" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6 3.5L12.5 8 6 12.5V3.5z"/>
          </svg>
        </button>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Audio script</span>
          <span className="text-xs text-slate-400">Playback coming soon</span>
        </div>
      </div>

      {/* Transcript toggle */}
      <button
        type="button"
        onClick={() => setShowTranscript((s) => !s)}
        className="text-xs text-primary hover:underline self-start"
      >
        {showTranscript ? "Hide transcript" : "Show transcript"}
      </button>

      {showTranscript && payload.transcript && (
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap border-l-2 border-primary/30 pl-3">
          {payload.transcript}
        </p>
      )}
    </div>
  );
}
