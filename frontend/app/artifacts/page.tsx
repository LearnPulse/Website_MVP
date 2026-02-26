"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { LearningArtifacts } from "@/components/LearningArtifacts";

export default function ArtifactsPage() {
  const userId = "user_123"; // TODO: Get from auth context
  const lessonId = "lesson_002"; // TODO: Get from lesson state
  const topicTitle = "System Design"; // TODO: Get from lesson state
  const lessonContent = `Load Balancer Architecture: A load balancer sits in front of your server fleet...`; // TODO: Get actual content

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Learning Materials
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Generate and manage multiple study artifacts to enhance your learning journey
          </p>
        </div>

        <LearningArtifacts
          lessonId={lessonId}
          userId={userId}
          topicTitle={topicTitle}
          lessonContent={lessonContent}
        />
      </div>
    </DashboardLayout>
  );
}
