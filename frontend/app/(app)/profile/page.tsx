"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api-client";
import type { ArtifactFormat } from "@/lib/types";

const FORMAT_OPTIONS: { value: ArtifactFormat; label: string }[] = [
  { value: "cheatsheet", label: "Cheatsheet" },
  { value: "flashcards", label: "Flashcards" },
  { value: "quiz",       label: "Quiz"       },
  { value: "diagram",    label: "Diagram"    },
  { value: "audio",      label: "Audio"      },
];

const DETAIL_OPTIONS = ["concise", "detailed"] as const;

const SESSION_OPTIONS: { value: "micro" | "standard" | "deep"; label: string; sub: string }[] = [
  { value: "micro",    label: "Micro",    sub: "5 min"  },
  { value: "standard", label: "Standard", sub: "20 min" },
  { value: "deep",     label: "Deep",     sub: "1 hr+"  },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-dim mb-4">{title}</p>
      {children}
    </div>
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
  const name  = session?.user?.name  ?? "";
  const image = session?.user?.image ?? "";

  function toggleFormat(fmt: ArtifactFormat) {
    setFormats((prev) => prev.includes(fmt) ? prev.filter((f) => f !== fmt) : [...prev, fmt]);
    setSaved(false);
  }

  async function savePreferences() {
    setSaving(true);
    await apiClient.savePreferences({ preferred_formats: formats, detail_level: detail, session_length: sessionLength });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="min-h-full px-10 py-12 max-w-[640px]">

      <h1 className="text-3xl font-bold tracking-tight text-ink mb-12">Settings</h1>

      {/* Account */}
      <Section title="Account">
        <div className="flex items-center gap-4 p-5 bg-surface border border-line rounded-2xl">
          {image ? (
            <img src={image} alt={name} width={48} height={48} className="w-12 h-12 rounded-full" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/12 flex items-center justify-center text-primary text-lg font-bold">
              {name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-base font-semibold text-ink truncate">{name || "—"}</p>
            <p className="text-sm text-dim truncate">{email || "—"}</p>
          </div>
        </div>
      </Section>

      <div className="h-px bg-line mb-10" />

      {/* Preferences */}
      <Section title="Learning preferences">

        {/* Formats */}
        <div className="mb-7">
          <p className="text-sm font-medium text-ink mb-3">Preferred formats</p>
          <div className="flex flex-wrap gap-2">
            {FORMAT_OPTIONS.map((opt) => {
              const active = formats.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleFormat(opt.value)}
                  className={[
                    "h-9 px-4 rounded-xl border text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-primary border-primary text-white"
                      : "border-line text-dim hover:text-ink hover:border-dim/40 hover:bg-surface bg-ghost/40",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail level */}
        <div className="mb-7">
          <p className="text-sm font-medium text-ink mb-3">Detail level</p>
          <div className="flex gap-2">
            {DETAIL_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { setDetail(opt); setSaved(false); }}
                className={[
                  "h-9 px-5 rounded-xl border text-sm font-medium capitalize transition-all duration-150",
                  detail === opt
                    ? "bg-primary border-primary text-white"
                    : "border-line text-dim hover:text-ink hover:border-dim/40 hover:bg-surface bg-ghost/40",
                ].join(" ")}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Session length */}
        <div className="mb-8">
          <p className="text-sm font-medium text-ink mb-3">Session length</p>
          <div className="flex gap-2">
            {SESSION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setSessionLength(opt.value); setSaved(false); }}
                className={[
                  "flex flex-col items-center w-24 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150",
                  sessionLength === opt.value
                    ? "bg-primary border-primary text-white"
                    : "border-line text-dim hover:text-ink hover:border-dim/40 hover:bg-surface bg-ghost/40",
                ].join(" ")}
              >
                {opt.label}
                <span className="text-xs mt-0.5 opacity-70">{opt.sub}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={savePreferences}
          disabled={saving}
          className="h-10 px-6 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all duration-150 disabled:opacity-50 shadow-subtle"
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save preferences"}
        </button>
      </Section>

      <div className="h-px bg-line mb-10" />

      {/* Sign out */}
      <Section title="Account actions">
        <div className="flex items-center justify-between p-5 bg-surface border border-line rounded-2xl">
          <div>
            <p className="text-base font-medium text-ink">Sign out</p>
            <p className="text-sm text-dim mt-0.5">You will need to sign in again to continue.</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="h-9 px-4 rounded-xl border border-line text-sm font-medium text-dim hover:text-ink hover:border-dim/40 hover:bg-ghost/60 transition-all duration-150"
          >
            Sign out
          </button>
        </div>
      </Section>
    </div>
  );
}
