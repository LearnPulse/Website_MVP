"use client";

import { useRef } from "react";
import { apiClient } from "@/lib/api-client";
import type { ArtifactFormat, ArtifactPayload } from "@/lib/types";

export function useArtifact(userId: string | null, goal: string) {
  // Cache by "conceptId:format" to avoid re-fetching
  const cache = useRef<Map<string, ArtifactPayload>>(new Map());

  async function requestArtifact(
    conceptId: string,
    format: ArtifactFormat,
  ): Promise<ArtifactPayload | null> {
    const key = `${conceptId}:${format}`;
    if (cache.current.has(key)) return cache.current.get(key)!;
    if (!userId) return null;

    const res = await apiClient.ask({ user_id: userId, concept_id: conceptId, goal, artifact_type: format });
    if (!res.success || !res.data) return null;

    const payload = res.data.payload;
    cache.current.set(key, payload);
    return payload;
  }

  return { requestArtifact };
}
