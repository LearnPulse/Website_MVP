"use client";

import { useState } from "react";
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

interface Prefs {
  preferred_formats: ArtifactFormat[];
  session_length: "micro" | "standard" | "deep";
  detail_level: "concise" | "detailed";
}

const DEFAULT_PREFS: Prefs = {
  preferred_formats: ["cheatsheet"],
  session_length: "micro",
  detail_level: "concise",
};

export default function NewPathPage() {
  const { userId } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>(0);
  const [goal, setGoal] = useState("");
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [conceptCount, setConceptCount] = useState(0);

  async function handleGoalContinue() {
    if (!userId) return;
    await apiClient.saveGoal({ goal_text: goal });
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
    const results = await Promise.all(
      files.map((f) => apiClient.uploadDocument(f, userId))
    );
    const total = results.reduce((acc, r) => acc + (r.data?.concept_count ?? 0), 0);
    setConceptCount(total);
    setUploading(false);
  }

  return (
    <div className="min-h-full flex flex-col">
      {step < 3 && (
        <div className="px-5 pt-8 pb-4 max-w-lg mx-auto w-full">
          <StepIndicator
            currentStep={step as 0 | 1 | 2}
            completedSteps={Array.from({ length: step }, (_, i) => i)}
          />
        </div>
      )}
      <div className="flex-1 flex items-center justify-center px-5 py-8">
        <div className="w-full max-w-lg">
          {step === 0 && (
            <GoalInput
              value={goal}
              onChange={setGoal}
              onContinue={handleGoalContinue}
            />
          )}
          {step === 1 && (
            <PreferenceSelector
              value={prefs}
              onChange={setPrefs}
              onContinue={handlePrefsContinue}
            />
          )}
          {step === 2 && (
            <UploadZone
              files={files}
              onFilesChange={setFiles}
              onSubmit={handleUploadSubmit}
              isLoading={uploading}
            />
          )}
          {step === 3 && (
            <ProcessingSteps
              conceptCount={conceptCount}
              onDone={() => router.push("/paths/current")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
