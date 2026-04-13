"use client";

import html2pdf from "html2pdf.js";
import type { DiagramPayload } from "@/lib/types";

export default function Diagram({ payload }: { payload: DiagramPayload }) {

  const downloadPDF = () => {
    const element = document.getElementById("diagram-pdf");
    if (!element) return;

    const opt = {
      margin: 0.5,
      filename: "learnpulse-diagram.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] }
    };

    html2pdf().set(opt).from(element).save();
  };

  if (!payload.svg) {
    return (
      <div className="flex items-center justify-center h-32 rounded-lg border-[0.5px] border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-400">No diagram generated.</p>
      </div>
    );
  }

  return (
    <div>
      {/* PDF CONTENT */}
      <div
        id="diagram-pdf"
        className="bg-white text-black p-6 rounded-lg"
      >
        <h1 className="text-xl font-bold mb-4">
          Diagram
        </h1>

        <div
          className="w-full overflow-auto border rounded-lg p-4"
          dangerouslySetInnerHTML={{ __html: payload.svg }}
        />
      </div>

      {/* DOWNLOAD BUTTON */}
      <button
        onClick={downloadPDF}
        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded"
      >
        Download Diagram PDF
      </button>
    </div>
  );
}
