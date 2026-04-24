"use client";

import { useState } from "react";
import type { QuizPayload, QuizQuestion } from "@/lib/types";

function QuizCard({ question, onAnswer }: { question: QuizQuestion; onAnswer: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<number | null>(null);

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    onAnswer(idx === question.correct_index);
  }

  const answered = selected !== null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-ink leading-relaxed">{question.stem}</p>
      <div className="flex flex-col gap-2">
        {question.options.map((opt, idx) => {
          const isCorrect = idx === question.correct_index;
          const isSelected = idx === selected;
          let cls = "text-left px-4 py-3 rounded-xl border text-sm transition-all duration-150 ";
          if (!answered) {
            cls += "border-line text-dim hover:border-primary/60 hover:text-ink hover:bg-surface cursor-pointer";
          } else if (isCorrect) {
            cls += "border-primary/60 bg-primary/8 text-ink font-medium";
          } else if (isSelected) {
            cls += "border-red-400/60 bg-red-400/8 text-red-500";
          } else {
            cls += "border-line text-dim opacity-40";
          }

          return (
            <button key={idx} type="button" disabled={answered} onClick={() => handleSelect(idx)} className={cls}>
              <span className="font-semibold mr-2 text-dim text-xs">{String.fromCharCode(65 + idx)}.</span>
              {opt}
            </button>
          );
        })}
      </div>
      {answered && (
        <p className={`text-xs font-medium mt-1 ${selected === question.correct_index ? "text-primary" : "text-red-500"}`}>
          {selected === question.correct_index ? "Correct! +35 mastery" : "Not quite — +8 mastery"}
        </p>
      )}
    </div>
  );
}

export default function Quiz({ payload, onAnswer }: { payload: QuizPayload; onAnswer?: (correct: boolean) => void }) {
  const [qIdx, setQIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);

  if (!payload.questions?.length) return <p className="text-sm text-dim">No questions generated.</p>;

  function handleAnswer(correct: boolean) {
    if (correct) setScore((s) => s + 1);
    onAnswer?.(correct);
    setTimeout(() => {
      if (qIdx + 1 >= payload.questions.length) {
        setDone(true);
      } else {
        setQIdx((i) => i + 1);
      }
    }, 1200);
  }

  if (done) {
    const pct = Math.round((score / payload.questions.length) * 100);
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/12 flex items-center justify-center">
          <span className="text-xl font-bold text-primary">{pct}%</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">{score} of {payload.questions.length} correct</p>
          <p className="text-xs text-primary font-medium mt-0.5">
            {pct >= 70 ? "+35 mastery — quiz passed!" : "+8 mastery"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setQIdx(0); setScore(0); setDone(false); }}
          className="h-8 px-4 rounded-xl border border-line text-xs text-dim hover:text-ink hover:border-dim/40 transition-all"
        >
          Retry quiz
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-dim">Question {qIdx + 1} of {payload.questions.length}</span>
        <div className="flex gap-1">
          {payload.questions.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${i < qIdx ? "bg-primary w-4" : i === qIdx ? "bg-primary/50 w-4" : "bg-line w-2"}`}
            />
          ))}
        </div>
      </div>
      <QuizCard key={qIdx} question={payload.questions[qIdx]} onAnswer={handleAnswer} />
    </div>
  );
}
