import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { UserProfile, UserStats, DayActivity } from "@/lib/types";

interface UseDashboardDataProps {
  userId: string;
}

export function useDashboardData({ userId }: UseDashboardDataProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [weeklyActivity, setWeeklyActivity] = useState<DayActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [profileRes, statsRes, activityRes] = await Promise.all([
          apiClient.getUserProfile(userId),
          apiClient.getUserStats(userId),
          apiClient.getWeeklyActivity(userId),
        ]);

        if (profileRes.success && profileRes.data) {
          setProfile(profileRes.data);
        } else {
          setError(profileRes.error || "Failed to fetch profile");
        }

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }

        if (activityRes.success && activityRes.data) {
          setWeeklyActivity(activityRes.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  return {
    profile,
    stats,
    weeklyActivity,
    isLoading,
    error,
  };
}
