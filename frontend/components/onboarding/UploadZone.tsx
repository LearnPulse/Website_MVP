"use client";

import { useRef, useState } from "react";

interface UploadZoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function UploadZone({ files, onFilesChange, onSubmit, isLoading }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;
    const valid = Array.from(incoming).filter(
      (f) => f.type === "application/pdf" || f.name.endsWith(".txt")
    );
    const combined = [...files, ...valid].slice(0, 10);
    onFilesChange(combined);
  }

  function removeFile(idx: number) {
    onFilesChange(files.filter((_, i) => i !== idx));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Upload your materials
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          PDF or TXT files — up to 10. Your learning path is built from these.
        </p>
      </div>

      {/* Drop zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        className={[
          "w-full rounded-lg border-[0.5px] p-8 text-center transition-colors cursor-pointer",
          dragging
            ? "border-primary bg-primary/5"
            : "border-slate-200 dark:border-slate-700 hover:border-primary",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400">
          <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
          </svg>
          <span className="text-sm">Drop files here or <span className="text-primary">browse</span></span>
          <span className="text-xs opacity-60">PDF or TXT, up to 10 files</span>
        </div>
      </button>

      {/* File pills */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full border-[0.5px] border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300"
            >
              <span className="max-w-[140px] truncate">{f.name}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                aria-label="Remove file"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        disabled={files.length === 0 || isLoading}
        onClick={onSubmit}
        className="self-end px-5 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center gap-2"
      >
        {isLoading && (
          <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
        )}
        {isLoading ? "Uploading…" : "Build my learning path"}
      </button>
    </div>
  );
}
