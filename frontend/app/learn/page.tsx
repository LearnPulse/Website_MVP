"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useProgress } from "@/hooks/useProgress";
import { useArtifact } from "@/hooks/useArtifact";
import GoalHeader from "@/components/learning-path/GoalHeader";
import ConceptCard from "@/components/learning-path/ConceptCard";
import { apiClient } from "@/lib/api-client";
import type { ArtifactFormat } from "@/lib/types";

export default function LearnPage() {
  const { isAuthenticated, isLoading: authLoading, userId, logout } = useAuth();
  const router = useRouter();
  const { data, isLoading, error, refetch } = useProgress(userId);
  const { requestArtifact } = useArtifact(userId, data?.goal_text ?? "");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/");
  }, [authLoading, isAuthenticated, router]);

  async function handleMasteryUpdate(conceptId: string, source: "view" | "flashcard" | "quiz_pass" | "quiz_fail") {
    if (!userId) return;
    await apiClient.updateMastery({ user_id: userId, concept_id: conceptId, source });
    refetch();
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-slate-400">{error}</p>
        <button type="button" onClick={refetch} className="text-xs text-primary hover:underline">
          Try again
        </button>
      </div>
    );
  }

  if (!data || data.concepts.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-slate-400">No concepts yet — upload documents to build your path.</p>
        <button
          type="button"
          onClick={() => router.push("/onboarding")}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium"
        >
          Upload documents
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Dark header zone */}
      <div className="bg-slate-900 px-5 pt-10 pb-8 border-b border-slate-800">
        <div className="max-w-lg mx-auto">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-primary font-bold text-base tracking-tight">LearnPulse</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/onboarding")}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                New path
              </button>
              <button
                type="button"
                onClick={logout}
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>

          {/* Goal + progress */}
          <GoalHeader
            goalText={data.goal_text}
            masteredCount={data.mastered_count}
            totalCount={data.total_count}
          />
        </div>
      </div>

      {/* Concept track */}
      <div className="flex-1 bg-slate-900/95 px-5 py-8">
        <div className="max-w-lg mx-auto">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-600 mb-6">
            Learning Path
          </p>
          <div>
            {data.concepts.map((concept, i) => (
              <ConceptCard
                key={concept.id}
                concept={concept}
                isLast={i === data.concepts.length - 1}
                onArtifactRequest={(format: ArtifactFormat) =>
                  requestArtifact(concept.id, format)
                }
                onMasteryUpdate={(source) => handleMasteryUpdate(concept.id, source)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
