"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, clearNewUserFlag } from "@/hooks/useAuth";
import StepIndicator from "@/components/onboarding/StepIndicator";
import GoalInput from "@/components/onboarding/GoalInput";
import PreferenceSelector from "@/components/onboarding/PreferenceSelector";
import UploadZone from "@/components/onboarding/UploadZone";
import ProcessingSteps from "@/components/onboarding/ProcessingSteps";
import { apiClient } from "@/lib/api-client";
import type { ArtifactFormat } from "@/lib/types";

type Step = 0 | 1 | 2 | 3;

interface Prefs {
  preferred_formats: ArtifactFormat[];
  session_length: "micro" | "standard" | "deep";
  detail_level: "concise" | "detailed";
}

const DEFAULT_PREFS: Prefs = {
  preferred_formats: ["cheatsheet"],
  session_length: "standard",
  detail_level: "concise",
};

export default function NewPathPage() {
  const { userId } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>(0);
  const [goal, setGoal] = useState("");
  const [goalId, setGoalId] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [conceptCount, setConceptCount] = useState(0);

  async function handleGoalContinue() {
    if (!userId) return;
    const res = await apiClient.saveGoal({ goal_text: goal });
    if (res.success && res.data) setGoalId(res.data.id);
    setStep(1);
  }

  async function handlePrefsContinue() {
    if (!userId) return;
    await apiClient.savePreferences(prefs);
    setStep(2);
  }

  async function handleUploadSubmit() {
    if (!userId || files.length === 0) return;
    setUploading(true);
    setStep(3);
    const results = await Promise.all(files.map((f) => apiClient.uploadDocument(f, userId)));
    const total = results.reduce((acc, r) => acc + (r.data?.concept_count ?? 0), 0);
    setConceptCount(total);
    setUploading(false);
    // Link the uploaded source_ids to this goal so concepts are filtered per path
    if (goalId) {
      const sourceIds = results.flatMap((r) => r.data?.source_id ? [r.data.source_id] : []);
      if (sourceIds.length > 0) await apiClient.updateGoalSources(goalId, sourceIds);
    }
  }

  return (
    <div className="min-h-full flex flex-col bg-canvas">
      {/* Header with step indicator */}
      {step < 3 && (
        <div className="px-6 pt-10 pb-6">
          <div className="max-w-md mx-auto flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/20 uppercase tracking-widest">New learning path</span>
              <span className="text-xs text-white/20">{step + 1} / 3</span>
            </div>
            <StepIndicator
              currentStep={step as 0 | 1 | 2}
              completedSteps={Array.from({ length: step }, (_, i) => i)}
            />
          </div>
        </div>
      )}

      {/* Step content — key forces remount + step-enter animation on each step */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div key={step} className="step-enter w-full max-w-md">
          {step === 0 && (
            <GoalInput value={goal} onChange={setGoal} onContinue={handleGoalContinue} />
          )}
          {step === 1 && (
            <PreferenceSelector value={prefs} onChange={setPrefs} onContinue={handlePrefsContinue} />
          )}
          {step === 2 && (
            <UploadZone files={files} onFilesChange={setFiles} onSubmit={handleUploadSubmit} isLoading={uploading} />
          )}
          {step === 3 && (
            <ProcessingSteps
              conceptCount={conceptCount}
              onDone={() => { clearNewUserFlag(); router.push(goalId ? `/paths/current?goal_id=${goalId}` : "/dashboard"); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
