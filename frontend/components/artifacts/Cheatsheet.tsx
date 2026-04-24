"use client";

import { useRef } from "react";
import type { CheatsheetPayload } from "@/lib/types";

export default function Cheatsheet({ payload }: { payload: CheatsheetPayload }) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!payload.entries?.length) return <p className="text-sm text-dim">No entries generated.</p>;

  function downloadPDF() {
    const entries = payload.entries
      .map((e) => `<tr><td style="padding:10px 16px;font-weight:600;color:#111;width:180px;vertical-align:top;border-bottom:1px solid #eee">${e.term}</td><td style="padding:10px 16px;color:#555;border-bottom:1px solid #eee">${e.definition}</td></tr>`)
      .join("");

    const html = `<!DOCTYPE html><html><head><title>Cheatsheet</title><style>
      body{font-family:system-ui,sans-serif;margin:40px;color:#111}
      h1{font-size:18px;font-weight:700;margin-bottom:24px}
      table{width:100%;border-collapse:collapse;font-size:13px}
    </style></head><body>
      <h1>Cheatsheet</h1>
      <table><tbody>${entries}</tbody></table>
    </body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) {
      win.onload = () => {
        win.print();
        URL.revokeObjectURL(url);
      };
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={downloadPDF}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-line text-xs text-dim hover:text-ink hover:border-dim/40 transition-all"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v7M3.5 6l2.5 2.5L8.5 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M1.5 10h9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          Save as PDF
        </button>
      </div>
      <div ref={printRef} className="flex flex-col divide-y divide-line">
        {payload.entries.map((e, i) => (
          <div key={i} className="flex gap-4 py-3">
            <span className="w-36 flex-shrink-0 text-xs font-semibold text-ink leading-relaxed">
              {e.term}
            </span>
            <span className="text-xs text-dim leading-relaxed">{e.definition}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
