import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { LearnRequest, LearnResponse } from "@/lib/types";

export function useLearningContent() {
  const [content, setContent] = useState<LearnResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateContent = async (request: LearnRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.generateLearningContent(request);

      if (response.success && response.data) {
        setContent(response.data);
      } else {
        setError(response.error || "Failed to generate content");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate content");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    content,
    isLoading,
    error,
    generateContent,
  };
}
