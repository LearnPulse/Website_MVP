"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import StepIndicator from "@/components/onboarding/StepIndicator";
import GoalInput from "@/components/onboarding/GoalInput";
import PreferenceSelector from "@/components/onboarding/PreferenceSelector";
import UploadZone from "@/components/onboarding/UploadZone";
import ProcessingSteps from "@/components/onboarding/ProcessingSteps";
import { apiClient } from "@/lib/api-client";
import type { ArtifactFormat } from "@/lib/types";

type Step = 0 | 1 | 2 | 3;

const DEFAULT_PREFS = {
  preferred_formats: ["cheatsheet"] as ArtifactFormat[],
  session_length: "micro" as "micro" | "standard" | "deep",
  detail_level: "concise" as "concise" | "detailed",
};

export default function OnboardingPage() {
  const { isAuthenticated, isLoading, userId } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>(0);
  const [goal, setGoal] = useState("");
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [conceptCount, setConceptCount] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/");
  }, [isLoading, isAuthenticated, router]);

  async function handleGoalContinue() {
    if (!userId) return;
    await apiClient.saveGoal({ user_id: userId, goal_text: goal });
    setCompletedSteps((s) => [...s, 0]);
    setStep(1);
  }

  async function handlePrefsContinue() {
    if (!userId) return;
    await apiClient.savePreferences({ user_id: userId, ...prefs });
    setCompletedSteps((s) => [...s, 1]);
    setStep(2);
  }

  async function handleUpload() {
    if (!userId || files.length === 0) return;
    setUploading(true);
    let total = 0;
    for (const file of files) {
      const res = await apiClient.uploadDocument(file, userId);
      if (res.success && res.data) total += res.data.concept_count ?? 0;
    }
    setConceptCount(total);
    setCompletedSteps((s) => [...s, 2]);
    setUploading(false);
    setStep(3);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark px-4 py-12">
      <div className="w-full max-w-md flex flex-col gap-8">
        <div className="flex flex-col items-center gap-1">
          <span className="text-primary font-semibold text-xl tracking-tight">LearnPulse</span>
        </div>

        {step < 3 && (
          <div className="flex justify-center">
            <StepIndicator currentStep={step as 0 | 1 | 2} completedSteps={completedSteps} />
          </div>
        )}

        <div className="bg-white dark:bg-slate-800/50 rounded-xl border-[0.5px] border-slate-200 dark:border-slate-700 p-6">
          {step === 0 && (
            <GoalInput value={goal} onChange={setGoal} onContinue={handleGoalContinue} />
          )}
          {step === 1 && (
            <PreferenceSelector value={prefs} onChange={setPrefs} onContinue={handlePrefsContinue} />
          )}
          {step === 2 && (
            <UploadZone
              files={files}
              onFilesChange={setFiles}
              onSubmit={handleUpload}
              isLoading={uploading}
            />
          )}
          {step === 3 && (
            <ProcessingSteps
              conceptCount={conceptCount}
              onDone={() => router.replace("/learn")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
