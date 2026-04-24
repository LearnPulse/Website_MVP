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
    onFilesChange([...files, ...valid].slice(0, 10));
  }

  function removeFile(idx: number) {
    onFilesChange(files.filter((_, i) => i !== idx));
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-white tracking-tight leading-tight">
          Upload your<br />materials
        </h2>
        <p className="text-base text-white/50">
          PDF or TXT files. Your learning path is built from these.
        </p>
      </div>

      {/* Drop zone */}
      <label
        htmlFor="file-upload"
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        className={[
          "w-full rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 cursor-pointer block",
          dragging
            ? "border-primary bg-primary/10 scale-[1.01]"
            : "border-white/15 bg-white/5 hover:border-white/25 hover:bg-white/[0.07]",
        ].join(" ")}
      >
        <input ref={inputRef} id="file-upload" type="file" accept=".pdf,.txt" multiple className="sr-only" title="Upload PDF or TXT files" onChange={(e) => addFiles(e.target.files)} />
        <div className="flex flex-col items-center gap-3">
          <div className={[
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200",
            dragging ? "bg-primary/20" : "bg-white/10",
          ].join(" ")}>
            <svg className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
            </svg>
          </div>
          <div>
            <p className="text-sm text-white/70 font-medium">
              Drop files here or <span className="text-primary">browse</span>
            </p>
            <p className="text-xs text-white/30 mt-1">PDF or TXT · up to 10 files</p>
          </div>
        </div>
      </label>

      {/* File list */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <span className="flex-1 text-sm text-white truncate">{f.name}</span>
              <span className="text-xs text-white/30 flex-shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/10 transition-all"
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
        className={[
          "w-full h-12 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2",
          files.length > 0 && !isLoading
            ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
            : "bg-white/5 text-white/20 cursor-not-allowed",
        ].join(" ")}
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Building your path…
          </>
        ) : (
          <>
            Build my learning path
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </>
        )}
      </button>
    </div>
  );
}
