"use client";

import { useState, useRef, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import type { AudioPayload } from "@/lib/types";

export default function Audio({ payload }: { payload: AudioPayload }) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Keep CSS var in sync
  useEffect(() => {
    progressRef.current?.style.setProperty("--pct", `${progress}%`);
  }, [progress]);

  // Revoke blob URL on unmount
  useEffect(() => {
    return () => { if (audioUrl) URL.revokeObjectURL(audioUrl); };
  }, [audioUrl]);

  async function synthesize() {
    if (!payload.transcript) return;
    setLoading(true);
    setError(null);
    const url = await apiClient.synthesizeSpeech(payload.transcript);
    setLoading(false);
    if (!url) { setError("Failed to generate audio. Please try again."); return; }
    setAudioUrl(url);

    // Auto-play once ready
    setTimeout(() => audioRef.current?.play(), 100);
  }

  function togglePlay() {
    const el = audioRef.current;
    if (!el) return;
    if (playing) { el.pause(); } else { el.play(); }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const el = audioRef.current;
    if (!el || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    el.currentTime = ratio * duration;
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  }

  if (!payload.transcript) {
    return <p className="text-sm text-dim">No transcript generated.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Player */}
      <div className="flex flex-col gap-3 px-4 py-4 rounded-xl border border-line bg-surface">
        {!audioUrl ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={synthesize}
              disabled={loading}
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-[1.5px] border-white border-t-transparent animate-spin" />
                  Generating audio…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M5 3.5L13 8 5 12.5V3.5z"/>
                  </svg>
                  Generate &amp; Play
                </>
              )}
            </button>
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
        ) : (
          <>
            {/* Hidden native audio element */}
            <audio
              ref={audioRef}
              src={audioUrl}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => { setPlaying(false); setProgress(100); }}
              onTimeUpdate={(e) => {
                const el = e.currentTarget;
                if (el.duration) setProgress((el.currentTime / el.duration) * 100);
              }}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            />

            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button
                type="button"
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 hover:bg-primary/90 transition-all"
              >
                {playing ? (
                  <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="3" y="3" width="3.5" height="10" rx="1"/>
                    <rect x="9.5" y="3" width="3.5" height="10" rx="1"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-white ml-0.5" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M5 3.5L13 8 5 12.5V3.5z"/>
                  </svg>
                )}
              </button>

              {/* Time */}
              <span className="tabular text-xs text-dim w-20 flex-shrink-0">
                {formatTime((progress / 100) * duration)} / {formatTime(duration)}
              </span>

              {/* Seek bar */}
              <div
                role="slider"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                tabIndex={0}
                className="flex-1 h-2 bg-line rounded-full overflow-hidden cursor-pointer"
                onClick={seek}
                onKeyDown={(e) => {
                  const el = audioRef.current;
                  if (!el) return;
                  if (e.key === "ArrowRight") el.currentTime = Math.min(el.duration, el.currentTime + 5);
                  if (e.key === "ArrowLeft") el.currentTime = Math.max(0, el.currentTime - 5);
                }}
              >
                <div
                  ref={progressRef}
                  className="h-full bg-primary rounded-full transition-all duration-150 [width:var(--pct,0%)]"
                />
              </div>

              {/* Re-generate button */}
              <button
                type="button"
                onClick={() => { audioRef.current?.pause(); setAudioUrl(null); setPlaying(false); setProgress(0); synthesize(); }}
                className="flex-shrink-0 h-7 px-2 rounded-lg border border-line text-xs text-dim hover:text-ink hover:border-dim/40 transition-all"
                title="Regenerate audio"
              >
                ↺
              </button>
            </div>
          </>
        )}
      </div>

      {/* Transcript */}
      <div className="border-l-2 border-primary/30 pl-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-dim mb-3">Transcript</p>
        <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{payload.transcript}</p>
      </div>
    </div>
  );
}
