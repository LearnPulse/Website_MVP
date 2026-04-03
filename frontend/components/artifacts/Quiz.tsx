"use client";

import { useState } from "react";
import type { QuizPayload } from "@/lib/types";
import InlineQuiz from "@/components/learning-path/InlineQuiz";

export default function Quiz({ payload, onAnswer }: { payload: QuizPayload; onAnswer?: (correct: boolean) => void }) {
  const [qIdx, setQIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);

  if (!payload.questions?.length) return <p className="text-sm text-slate-400">No questions generated.</p>;

  function handleAnswer(correct: boolean) {
    if (correct) setScore((s) => s + 1);
    onAnswer?.(correct);
    setTimeout(() => {
      if (qIdx + 1 >= payload.questions.length) {
        setDone(true);
      } else {
        setQIdx((i) => i + 1);
      }
    }, 1000);
  }

  if (done) {
    const pct = Math.round((score / payload.questions.length) * 100);
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">{pct}%</p>
        <p className="text-sm text-slate-500">{score} of {payload.questions.length} correct</p>
        <p className="text-xs text-primary font-medium">
          {pct >= 70 ? "+35 mastery — quiz passed!" : "+8 mastery"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-xs text-slate-400 pb-1">
        <span>Question {qIdx + 1} of {payload.questions.length}</span>
      </div>
      <InlineQuiz key={qIdx} question={payload.questions[qIdx]} onAnswer={handleAnswer} />
    </div>
  );
}
