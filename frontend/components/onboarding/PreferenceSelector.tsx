"use client";

import type { ArtifactFormat } from "@/lib/types";

const FORMATS: { value: ArtifactFormat; label: string }[] = [
  { value: "cheatsheet", label: "Cheatsheet" },
  { value: "flashcards", label: "Flashcards" },
  { value: "quiz", label: "Quiz" },
  { value: "diagram", label: "Diagram" },
  { value: "audio", label: "Audio" },
];

const SESSION_LENGTHS = [
  { value: "micro", label: "Micro", sub: "5 min" },
  { value: "standard", label: "Standard", sub: "20 min" },
  { value: "deep", label: "Deep", sub: "1 hr+" },
] as const;

const DETAIL_LEVELS = [
  { value: "concise", label: "Concise" },
  { value: "detailed", label: "Detailed" },
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          How do you learn best?
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Choose the artifact formats you want generated for each concept.
        </p>
      </div>

      {/* Artifact formats */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Formats</span>
        <div className="flex flex-wrap gap-2">
          {FORMATS.map(({ value: f, label }) => {
            const selected = value.preferred_formats.includes(f);
            return (
              <button
                type="button"
                key={f}
                onClick={() => toggleFormat(f)}
                className={[
                  "px-3 py-1.5 rounded-full text-sm border-[0.5px] transition-colors",
                  selected
                    ? "border-primary bg-primary text-white"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary",
                ].join(" ")}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Session length */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Session length</span>
        <div className="flex gap-2">
          {SESSION_LENGTHS.map(({ value: v, label, sub }) => (
            <button
              type="button"
              key={v}
              onClick={() => onChange({ ...value, session_length: v })}
              className={[
                "flex-1 py-2 rounded-lg border-[0.5px] text-sm transition-colors",
                value.session_length === v
                  ? "border-primary text-primary bg-primary/5"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary",
              ].join(" ")}
            >
              <div className="font-medium">{label}</div>
              <div className="text-xs opacity-60">{sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail level */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Detail level</span>
        <div className="flex gap-2">
          {DETAIL_LEVELS.map(({ value: v, label }) => (
            <button
              type="button"
              key={v}
              onClick={() => onChange({ ...value, detail_level: v })}
              className={[
                "flex-1 py-2 rounded-lg border-[0.5px] text-sm transition-colors",
                value.detail_level === v
                  ? "border-primary text-primary bg-primary/5"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={!canContinue}
        onClick={onContinue}
        className="self-end px-5 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        Continue
      </button>
    </div>
  );
}
