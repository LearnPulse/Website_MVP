"use client";

import html2pdf from "html2pdf.js";

export default function TestPage() {
  const downloadPDF = () => {
    const element = document.getElementById("pdf-content");
    if (!element) return;

    html2pdf().from(element).save("cheatsheet.pdf");
  };

  return (
    <div className="p-8">
      <div id="pdf-content" className="bg-white text-black p-6 rounded-xl">
        <h1 className="text-2xl font-bold mb-4">
          Transformer Architecture
        </h1>

        <h2 className="font-semibold mt-4">Key Concepts</h2>
        <ul className="list-disc ml-6">
          <li>Self-attention</li>
          <li>Multi-head attention</li>
          <li>Positional encoding</li>
        </ul>
      </div>

      <button
        onClick={downloadPDF}
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Download PDF
      </button>
    </div>
  );
}