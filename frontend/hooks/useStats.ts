"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

export interface Stats {
  total_xp: number;
  coins: number;
  mastered_count: number;
  reviewed_count: number;
}

export function useStats(userId: string | null) {
  const [stats, setStats] = useState<Stats | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const res = await apiClient.getStats();
    if (res.success && res.data) setStats(res.data);
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  return { stats, refresh };
}
