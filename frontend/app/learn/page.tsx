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

  async function handleMasteryUpdate(conceptId: string, source: string) {
    if (!userId) return;
    await apiClient.updateMastery({ user_id: userId, concept_id: conceptId, source });
    refetch();
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-slate-500">{error}</p>
        <button type="button" onClick={refetch} className="text-xs text-primary hover:underline">
          Try again
        </button>
      </div>
    );
  }

  if (!data || data.concepts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-slate-500">No concepts yet. Upload documents to get started.</p>
        <button
          type="button"
          onClick={() => router.push("/onboarding")}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm"
        >
          Upload documents
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="max-w-xl mx-auto px-4 py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <span className="text-primary font-semibold text-base tracking-tight">LearnPulse</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/onboarding")}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              New path
            </button>
            <button
              type="button"
              onClick={logout}
              className="text-xs text-slate-400 hover:text-slate-600"
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

        {/* Concept track */}
        <div className="mt-8">
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
  );
}
