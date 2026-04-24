import { getStoredToken } from "@/hooks/useAuth";
import type {
  GoogleAuthResponse,
  IngestResponse,
  AskRequest,
  AskResponse,
  ProgressResponse,
  MasteryUpdateRequest,
  UserPreferencesIn,
  UserGoalIn,
  GoalSummary,
  KGResponse,
  ApiResponse,
} from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private authHeaders(): Record<string, string> {
    const token = getStoredToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...this.authHeaders(),
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const body = await response.text();
        return { success: false, error: `HTTP ${response.status}: ${body}` };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  /** Exchange a Google ID token for a backend JWT. Called once after OAuth sign-in. */
  async googleAuth(idToken: string): Promise<GoogleAuthResponse> {
    const res = await fetch(`${this.baseUrl}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token: idToken }),
    });
    if (!res.ok) throw new Error(`Auth failed: ${res.statusText}`);
    return res.json();
  }

  // ── Onboarding ────────────────────────────────────────────────────────────

  async listGoals(): Promise<ApiResponse<GoalSummary[]>> {
    return this.request<GoalSummary[]>("/goals");
  }

  async saveGoal(goal: UserGoalIn): Promise<ApiResponse<{ id: string }>> {
    return this.request("/goals", { method: "POST", body: JSON.stringify(goal) });
  }

  async updateGoalSources(goalId: string, sourceIds: string[]): Promise<ApiResponse<void>> {
    return this.request(`/goals/${goalId}/sources`, {
      method: "PATCH",
      body: JSON.stringify({ source_ids: sourceIds }),
    });
  }

  async savePreferences(prefs: UserPreferencesIn): Promise<ApiResponse<void>> {
    return this.request("/preferences", { method: "POST", body: JSON.stringify(prefs) });
  }

  /** Upload a file and trigger ingest pipeline. Returns source_id + chunk_count. */
  async uploadDocument(file: File, userId: string): Promise<ApiResponse<IngestResponse>> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", userId);

    try {
      const response = await fetch(`${this.baseUrl}/ingest`, {
        method: "POST",
        headers: this.authHeaders(),
        body: formData,
      });
      if (!response.ok) return { success: false, error: `Upload failed: ${response.statusText}` };
      return { success: true, data: await response.json() };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Upload failed" };
    }
  }

  // ── Learning ──────────────────────────────────────────────────────────────

  /** Send concept_id + goal to the orchestrator, get back a structured artifact. */
  async ask(req: AskRequest): Promise<ApiResponse<AskResponse>> {
    return this.request<AskResponse>("/ask", { method: "POST", body: JSON.stringify(req) });
  }

  /** Get full learning path with mastery scores for a user. */
  async getProgress(userId: string, goalId?: string): Promise<ApiResponse<ProgressResponse>> {
    const qs = goalId ? `?goal_id=${goalId}` : "";
    return this.request<ProgressResponse>(`/progress/${userId}${qs}`);
  }

  /** Fire after artifact interaction: view (+8), flashcard (+15), quiz_pass (+35), quiz_fail (+8). */
  async updateMastery(req: MasteryUpdateRequest): Promise<ApiResponse<void>> {
    return this.request("/mastery/update", { method: "POST", body: JSON.stringify(req) });
  }

  /** Get knowledge graph nodes + edges with mastery overlay for visualization. */
  async getGraph(): Promise<ApiResponse<KGResponse>> {
    return this.request<KGResponse>("/graph");
  }

  /** Get gamification stats: XP, coins, mastered count. */
  async getStats(): Promise<ApiResponse<{ total_xp: number; coins: number; mastered_count: number; reviewed_count: number }>> {
    return this.request("/stats");
  }
}

export const apiClient = new APIClient();
