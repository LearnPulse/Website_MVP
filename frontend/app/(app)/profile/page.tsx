"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api-client";
import type { ArtifactFormat } from "@/lib/types";

const FORMAT_OPTIONS: { value: ArtifactFormat; label: string; icon: string }[] = [
  { value: "cheatsheet", label: "Cheatsheet", icon: "📋" },
  { value: "flashcards", label: "Flashcards", icon: "🃏" },
  { value: "quiz",       label: "Quiz",       icon: "✏️" },
  { value: "diagram",    label: "Diagram",    icon: "🗺️" },
  { value: "audio",      label: "Audio",      icon: "🎧" },
];

const DETAIL_OPTIONS = ["concise", "detailed"] as const;
const SESSION_OPTIONS: { value: "micro" | "standard" | "deep"; label: string; sub: string }[] = [
  { value: "micro", label: "Micro", sub: "5 min" },
  { value: "standard", label: "Standard", sub: "20 min" },
  { value: "deep", label: "Deep", sub: "1 hr+" },
];

export default function ProfilePage() {
  const { session, logout } = useAuth();
  const [formats, setFormats] = useState<ArtifactFormat[]>(["cheatsheet"]);
  const [detail, setDetail] = useState<"concise" | "detailed">("concise");
  const [sessionLength, setSessionLength] = useState<"micro" | "standard" | "deep">("micro");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const email = (session?.user?.email) ?? "";
  const name = (session?.user?.name) ?? "";
  const image = (session?.user?.image) ?? "";

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
    <div className="px-8 py-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-slate-100 mb-8">Profile</h1>

      {/* Account info */}
      <section className="rounded-xl border border-slate-700/60 bg-slate-800/20 p-6 mb-6">
        <h2 className="text-xs font-semibold tracking-widest uppercase text-slate-500 mb-4">Account</h2>
        <div className="flex items-center gap-4">
          {image ? (
            <img src={image} alt={name} className="w-12 h-12 rounded-full" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
              {name?.[0] ?? "?"}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-slate-100">{name || "—"}</p>
            <p className="text-xs text-slate-500">{email || "—"}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">Signed in with Google</p>
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section className="rounded-xl border border-slate-700/60 bg-slate-800/20 p-6 mb-6">
        <h2 className="text-xs font-semibold tracking-widest uppercase text-slate-500 mb-5">Learning preferences</h2>

        {/* Formats */}
        <div className="mb-5">
          <p className="text-xs text-slate-400 font-medium mb-3">Preferred formats</p>
          <div className="flex flex-wrap gap-2">
            {FORMAT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleFormat(opt.value)}
                className={[
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                  formats.includes(opt.value)
                    ? "bg-primary/10 text-primary border-primary/40"
                    : "bg-slate-700/40 text-slate-400 border-slate-700 hover:border-slate-600",
                ].join(" ")}
              >
                <span>{opt.icon}</span> {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Detail level */}
        <div className="mb-5">
          <p className="text-xs text-slate-400 font-medium mb-3">Detail level</p>
          <div className="flex gap-2">
            {DETAIL_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { setDetail(opt); setSaved(false); }}
                className={[
                  "px-4 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize",
                  detail === opt
                    ? "bg-primary/10 text-primary border-primary/40"
                    : "bg-slate-700/40 text-slate-400 border-slate-700 hover:border-slate-600",
                ].join(" ")}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Session length */}
        <div className="mb-6">
          <p className="text-xs text-slate-400 font-medium mb-3">Session length</p>
          <div className="flex gap-2">
            {SESSION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setSessionLength(opt.value); setSaved(false); }}
                className={[
                  "flex flex-col items-center px-4 py-2 rounded-lg text-xs font-medium border transition-all",
                  sessionLength === opt.value
                    ? "bg-primary/10 text-primary border-primary/40"
                    : "bg-slate-700/40 text-slate-400 border-slate-700 hover:border-slate-600",
                ].join(" ")}
              >
                <span>{opt.label}</span>
                <span className="text-[10px] opacity-70">{opt.sub}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={savePreferences}
          disabled={saving}
          className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save preferences"}
        </button>
      </section>

      {/* Danger zone */}
      <section className="rounded-xl border border-red-900/30 bg-red-950/10 p-6">
        <h2 className="text-xs font-semibold tracking-widest uppercase text-red-500/70 mb-4">Danger zone</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-300 font-medium">Sign out</p>
            <p className="text-xs text-slate-500">You will need to sign in again.</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="px-4 py-2 rounded-lg border border-red-800/50 text-red-400 text-xs font-medium hover:bg-red-950/30 transition-colors"
          >
            Sign out
          </button>
        </div>
      </section>
    </div>
  );
}
