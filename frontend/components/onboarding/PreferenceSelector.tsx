"use client";

import type { ArtifactFormat } from "@/lib/types";

const FORMATS: { value: ArtifactFormat; label: string; icon: string }[] = [
  { value: "cheatsheet", label: "Cheatsheet", icon: "📋" },
  { value: "flashcards", label: "Flashcards", icon: "🃏" },
  { value: "quiz",       label: "Quiz",       icon: "✏️" },
  { value: "diagram",    label: "Diagram",    icon: "🗺️" },
  { value: "audio",      label: "Audio",      icon: "🎧" },
];

const SESSION_LENGTHS = [
  { value: "micro",    label: "Micro",    sub: "5 min",  desc: "Quick refreshers" },
  { value: "standard", label: "Standard", sub: "20 min", desc: "Balanced sessions" },
  { value: "deep",     label: "Deep",     sub: "1 hr+",  desc: "Full deep dives" },
] as const;

const DETAIL_LEVELS = [
  { value: "concise",  label: "Concise",  desc: "Key points only" },
  { value: "detailed", label: "Detailed", desc: "Full explanations" },
] as const;

interface Preferences {
  preferred_formats: ArtifactFormat[];
  session_length: "micro" | "standard" | "deep";
  detail_level: "concise" | "detailed";
}

interface PreferenceSelectorProps {
  value: Preferences;
  onChange: (v: Preferences) => void;
  onContinue: () => void;
}

export default function PreferenceSelector({ value, onChange, onContinue }: PreferenceSelectorProps) {
  function toggleFormat(f: ArtifactFormat) {
    const next = value.preferred_formats.includes(f)
      ? value.preferred_formats.filter((x) => x !== f)
      : [...value.preferred_formats, f];
    onChange({ ...value, preferred_formats: next });
  }

  const canContinue = value.preferred_formats.length > 0;

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-white tracking-tight leading-tight">
          How do you<br />learn best?
        </h2>
        <p className="text-base text-white/50">
          Personalise how LearnPulse delivers content to you.
        </p>
      </div>

      {/* Formats */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-white/30">Study formats</span>
        <div className="grid grid-cols-5 gap-2">
          {FORMATS.map(({ value: f, label, icon }) => {
            const selected = value.preferred_formats.includes(f);
            return (
              <button
                type="button"
                key={f}
                onClick={() => toggleFormat(f)}
                className={[
                  "flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-medium transition-all duration-150",
                  selected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-white/10 bg-white/5 text-white/40 hover:border-white/20 hover:text-white/70",
                ].join(" ")}
              >
                <span className="text-lg leading-none">{icon}</span>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Session length */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-white/30">Session length</span>
        <div className="flex gap-2">
          {SESSION_LENGTHS.map(({ value: v, label, sub, desc }) => (
            <button
              type="button"
              key={v}
              onClick={() => onChange({ ...value, session_length: v })}
              className={[
                "flex-1 py-3 px-3 rounded-xl border text-left transition-all duration-150",
                value.session_length === v
                  ? "border-primary bg-primary/10"
                  : "border-white/10 bg-white/5 hover:border-white/20",
              ].join(" ")}
            >
              <div className={`text-sm font-semibold ${value.session_length === v ? "text-primary" : "text-white"}`}>{label}</div>
              <div className="text-xs text-white/40 mt-0.5">{sub}</div>
              <div className="text-[10px] text-white/25 mt-1">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail level */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-white/30">Detail level</span>
        <div className="flex gap-2">
          {DETAIL_LEVELS.map(({ value: v, label, desc }) => (
            <button
              type="button"
              key={v}
              onClick={() => onChange({ ...value, detail_level: v })}
              className={[
                "flex-1 py-3 px-4 rounded-xl border text-left transition-all duration-150",
                value.detail_level === v
                  ? "border-primary bg-primary/10"
                  : "border-white/10 bg-white/5 hover:border-white/20",
              ].join(" ")}
            >
              <div className={`text-sm font-semibold ${value.detail_level === v ? "text-primary" : "text-white"}`}>{label}</div>
              <div className="text-xs text-white/40 mt-0.5">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={!canContinue}
        onClick={onContinue}
        className={[
          "w-full h-12 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2",
          canContinue
            ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
            : "bg-white/5 text-white/20 cursor-not-allowed",
        ].join(" ")}
      >
        Continue
        {canContinue && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
    </div>
  );
}
