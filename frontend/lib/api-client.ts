import {
  LearnRequest,
  LearnResponse,
  IngestResponse,
  ApiResponse,
  UserProfile,
  UserStats,
  GenerateArtifactRequest,
  GenerateArtifactResponse,
  Artifact,
} from "@/lib/types";

// API Base URL - configure based on your backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * RAG Pipeline: Upload document
   * Triggers ingestion → chunking → embedding → ChromaDB + Knowledge Graph
   */
  async uploadDocument(
    file: File,
    topic: string,
    userId: string
  ): Promise<ApiResponse<IngestResponse>> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("topic", topic);
    formData.append("user_id", userId);

    try {
      const response = await fetch(`${this.baseUrl}/ingest`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Upload failed: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  /**
   * RAG Pipeline: Generate personalized learning content
   * Retrieves from ChromaDB → loads Knowledge Graph → generates with LLM + user context
   */
  async generateLearningContent(
    request: LearnRequest
  ): Promise<ApiResponse<LearnResponse>> {
    return this.request<LearnResponse>("/learn", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * Store user preferences and learning context
   * Used by memory service for personalization
   */
  async upsertUserMemory(
    userId: string,
    preferences: Record<string, unknown>
  ): Promise<ApiResponse<any>> {
    return this.request("/memory", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        ...preferences,
      }),
    });
  }

  // ===== Helper Methods for Frontend State =====
  // Note: These would typically be called from actual backend endpoints
  // For now, they return mock data compatible with UI

  async getUserProfile(userId: string): Promise<ApiResponse<UserProfile>> {
    // TODO: Connect to backend when endpoint ready
    return {
      success: true,
      data: {
        id: userId,
        name: "Alex Chen",
        joinedDate: "Oct 2023",
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDi0OzyXdTB5Pu2r5fenujrHFqQGxJpLpC-L0q9575upN13u9hk03JgkXCLGSsMSr-YIhv-n6WT8jDVYBLcLUsKjixKxIHkcrVGnod05x51GDAv1d-rS7p5u-vIX8Gl0fu1WTpvPc-K5UhrB1PUevgti-nInRby6OkAq3a7sLYatvGtTe18deG9p23EuSY1JJUcumuMMaNdvtZlH248W-dVAODspbBQQ9WSIeUfcaC8dbYAFaFiT58vq7Up0xbcyVw-TgKwaTME1Uw",
      },
    };
  }

  async getUserStats(userId: string): Promise<ApiResponse<UserStats>> {
    // TODO: Connect to backend endpoint
    return {
      success: true,
      data: {
        learningStreak: 14,
        topicsCompleted: 12,
        quizAverage: 87,
      },
    };
  }

  async getWeeklyActivity(userId: string): Promise<ApiResponse<any>> {
    // TODO: Connect to backend when analytics endpoint ready
    return {
      success: true,
      data: [
        { day: "Monday", value: 60 },
        { day: "Tuesday", value: 80 },
        { day: "Wednesday", value: 95 },
        { day: "Thursday", value: 40 },
        { day: "Friday", value: 70 },
        { day: "Saturday", value: 0 },
        { day: "Sunday", value: 0 },
      ],
    };
  }

  async getLessonContent(topicId: string): Promise<ApiResponse<any>> {
    // TODO: Connect to backend when lesson endpoint ready
    // This should call generate_learning_output from backend
    return {
      success: true,
      data: {
        title: "System Design Basics",
        topic: "System Design",
        module: 2,
        totalModules: 12,
      },
    };
  }

  /**
   * Multi-artifact generation endpoint (NotebookLM-style)
   * Generates cheatsheets, podcasts, flashcards from lesson content
   */
  async generateArtifacts(
    request: GenerateArtifactRequest
  ): Promise<ApiResponse<GenerateArtifactResponse>> {
    return this.request<GenerateArtifactResponse>("/artifacts", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * Fetch existing artifacts for a lesson
   */
  async getLessonArtifacts(
    lessonId: string
  ): Promise<ApiResponse<Artifact[]>> {
    return this.request<Artifact[]>(`/artifacts/${lessonId}`, {
      method: "GET",
    });
  }
}

export const apiClient = new APIClient();
