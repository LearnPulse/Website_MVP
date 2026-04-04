"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/lib/types";

interface InlineQuizProps {
  question: QuizQuestion;
  onAnswer: (isCorrect: boolean) => void;
}

export default function InlineQuiz({ question, onAnswer }: InlineQuizProps) {
  const [selected, setSelected] = useState<number | null>(null);

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    onAnswer(idx === question.correct_index);
  }

  return (
    <div className="flex flex-col gap-3 pt-3 border-t-[0.5px] border-slate-100 dark:border-slate-700">
      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{question.stem}</p>
      <div className="flex flex-col gap-1.5">
        {question.options.map((opt, idx) => {
          const isCorrect = idx === question.correct_index;
          const isSelected = idx === selected;
          const answered = selected !== null;

          return (
            <button
              type="button"
              key={idx}
              disabled={answered}
              onClick={() => handleSelect(idx)}
              className={[
                "text-left px-3 py-2 rounded-lg border-[0.5px] text-sm transition-colors",
                !answered
                  ? "border-slate-200 dark:border-slate-700 hover:border-primary text-slate-700 dark:text-slate-300"
                  : isCorrect
                  ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                  : isSelected
                  ? "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                  : "border-slate-100 dark:border-slate-800 text-slate-400 opacity-50",
              ].join(" ")}
            >
              <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span>
              {opt}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <p className={`text-xs font-medium ${selected === question.correct_index ? "text-emerald-600" : "text-red-500"}`}>
          {selected === question.correct_index ? "Correct! +35 mastery" : "Not quite — +8 mastery"}
        </p>
      )}
    </div>
  );
}
