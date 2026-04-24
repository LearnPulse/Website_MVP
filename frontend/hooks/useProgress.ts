"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { ProgressResponse } from "@/lib/types";

export function useProgress(userId: string | null, goalId?: string) {
  const [data, setData] = useState<ProgressResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (silent = false) => {
    if (!userId) return;
    if (!silent) setIsLoading(true);
    setError(null);
    const res = await apiClient.getProgress(userId, goalId);
    if (res.success && res.data) {
      setData(res.data);
    } else {
      setError(res.error ?? "Failed to load progress");
    }
    if (!silent) setIsLoading(false);
  }, [userId, goalId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, isLoading, error, refetch: fetch, silentRefetch: () => fetch(true) };
}
