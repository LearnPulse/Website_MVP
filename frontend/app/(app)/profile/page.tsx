"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api-client";
import type { ArtifactFormat } from "@/lib/types";

// ── Format icons ──────────────────────────────────────────────────────────────

const FORMAT_OPTIONS: { value: ArtifactFormat; label: string; icon: React.ReactNode }[] = [
  {
    value: "cheatsheet",
    label: "Cheatsheet",
    icon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <rect x="1" y="1" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
        <path d="M3 4.5h6M3 6.5h6M3 8.5h3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    value: "flashcards",
    label: "Flashcards",
    icon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <rect x="1" y="2.5" width="8" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
        <rect x="3" y="1" width="8" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.1" strokeDasharray="2 1"/>
      </svg>
    ),
  },
  {
    value: "quiz",
    label: "Quiz",
    icon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.1"/>
        <path d="M4.5 4.8a1.5 1.5 0 012.5 1c0 .8-.7 1.1-1 1.4v.6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
        <circle cx="6" cy="9" r=".5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    value: "diagram",
    label: "Diagram",
    icon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="2.5" r="1.5" stroke="currentColor" strokeWidth="1.1"/>
        <circle cx="2" cy="9.5" r="1.5" stroke="currentColor" strokeWidth="1.1"/>
        <circle cx="10" cy="9.5" r="1.5" stroke="currentColor" strokeWidth="1.1"/>
        <path d="M6 4v1L3.5 8M6 5l2.5 3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    value: "audio",
    label: "Audio",
    icon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <rect x="3.5" y="1" width="5" height="6.5" rx="2.5" stroke="currentColor" strokeWidth="1.1"/>
        <path d="M1.5 7a4.5 4.5 0 009 0" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
        <path d="M6 10.5V12" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const DETAIL_OPTIONS = ["concise", "detailed"] as const;
const SESSION_OPTIONS: { value: "micro" | "standard" | "deep"; label: string; sub: string }[] = [
  { value: "micro", label: "Micro", sub: "5 min" },
  { value: "standard", label: "Standard", sub: "20 min" },
  { value: "deep", label: "Deep", sub: "1 hr+" },
];

// ── Row divider ───────────────────────────────────────────────────────────────

function Divider() {
  return <div className="h-px bg-line my-5" />;
}

// ── Section label ─────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-2xs font-semibold uppercase tracking-widest text-dim mb-3">{children}</p>
  );
}

export default function ProfilePage() {
  const { session, logout } = useAuth();
  const [formats, setFormats] = useState<ArtifactFormat[]>(["cheatsheet"]);
  const [detail, setDetail] = useState<"concise" | "detailed">("concise");
  const [sessionLength, setSessionLength] = useState<"micro" | "standard" | "deep">("micro");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const email = session?.user?.email ?? "";
  const name = session?.user?.name ?? "";
  const image = session?.user?.image ?? "";

  function toggleFormat(fmt: ArtifactFormat) {
    setFormats((prev) =>
      prev.includes(fmt) ? prev.filter((f) => f !== fmt) : [...prev, fmt]
    );
    setSaved(false);
  }

  async function savePreferences() {
    setSaving(true);
    await apiClient.savePreferences({
      preferred_formats: formats,
      detail_level: detail,
      session_length: sessionLength,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-full px-10 py-10 max-w-[600px]">

      <h1 className="text-2xl font-bold tracking-tight text-ink mb-10">Settings</h1>

      {/* ── Account ── */}
      <div className="mb-10">
        <Label>Account</Label>
        <div className="flex items-center gap-4">
          {image ? (
            <img src={image} alt={name} width={40} height={40} className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
              {name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-ink">{name || "—"}</p>
            <p className="text-xs text-dim">{email || "—"}</p>
          </div>
        </div>
      </div>

      <Divider />

      {/* ── Learning preferences ── */}
      <div className="mb-10">
        <Label>Learning preferences</Label>

        {/* Formats */}
        <div className="mb-6">
          <p className="text-xs font-medium text-ink mb-2.5">Preferred formats</p>
          <div className="flex flex-wrap gap-2">
            {FORMAT_OPTIONS.map((opt) => {
              const active = formats.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleFormat(opt.value)}
                  className={[
                    "flex items-center gap-2 h-8 px-3 rounded border text-sm font-medium transition-all",
                    active
                      ? "bg-primary border-primary text-white"
                      : "border-line text-dim hover:text-ink hover:border-ghost bg-surface",
                  ].join(" ")}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail level */}
        <div className="mb-6">
          <p className="text-xs font-medium text-ink mb-2.5">Detail level</p>
          <div className="flex gap-2">
            {DETAIL_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { setDetail(opt); setSaved(false); }}
                className={[
                  "h-8 px-4 rounded border text-sm font-medium transition-all capitalize",
                  detail === opt
                    ? "bg-primary border-primary text-white"
                    : "border-line text-dim hover:text-ink hover:border-ghost bg-surface",
                ].join(" ")}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Session length */}
        <div className="mb-7">
          <p className="text-xs font-medium text-ink mb-2.5">Session length</p>
          <div className="flex gap-2">
            {SESSION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setSessionLength(opt.value); setSaved(false); }}
                className={[
                  "flex flex-col items-center w-20 py-2 rounded border text-sm font-medium transition-all",
                  sessionLength === opt.value
                    ? "bg-primary border-primary text-white"
                    : "border-line text-dim hover:text-ink hover:border-ghost bg-surface",
                ].join(" ")}
              >
                <span>{opt.label}</span>
                <span className="text-2xs mt-0.5 opacity-70">{opt.sub}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={savePreferences}
          disabled={saving}
          className="h-8 px-4 rounded bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : saved ? "Saved" : "Save preferences"}
        </button>
      </div>

      <Divider />

      {/* ── Sign out ── */}
      <div>
        <Label>Account actions</Label>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink">Sign out</p>
            <p className="text-xs text-dim mt-0.5">You will need to sign in again to continue.</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="h-8 px-3 rounded border border-line text-sm font-medium text-dim hover:text-ink hover:border-ghost transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
