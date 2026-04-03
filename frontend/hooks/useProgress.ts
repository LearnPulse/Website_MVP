"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { ProgressResponse } from "@/lib/types";

export function useProgress(userId: string | null) {
  const [data, setData] = useState<ProgressResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    const res = await apiClient.getProgress(userId);
    if (res.success && res.data) {
      setData(res.data);
    } else {
      setError(res.error ?? "Failed to load progress");
    }
    setIsLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, isLoading, error, refetch: fetch };
}
