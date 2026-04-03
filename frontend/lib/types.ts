// User & Profile Types
export interface UserProfile {
  id: string;
  name: string;
  joinedDate: string;
  avatar?: string;
}

export interface UserStats {
  learningStreak: number;
  topicsCompleted: number;
  quizAverage: number;
}

export interface UserPreferences {
  skillLevel: "beginner" | "intermediate" | "advanced";
  learningStyle: "visual" | "verbal" | "practical";
  dailyMinutes: number;
  cheatStyle: "minimalist" | "detailed";
  notificationsEnabled: boolean;
}

// Learning Content Types
export interface LessonContent {
  id: string;
  title: string;
  topic: string;
  category: string;
  module: number;
  totalModules: number;
  progress: number;
  content: string;
  imageUrl?: string;
  keyTakeaways: string[];
  sections: LessonSection[];
  lastUpdated: string;
}

export interface LessonSection {
  title: string;
  content: string;
  items?: string[];
}

// Learning Artifacts Types (NotebookLM-style output)
export type ArtifactType = "cheatsheet" | "podcast" | "flashcard" | "study-guide";

export interface Artifact {
  id: string;
  type: ArtifactType;
  title: string;
  lessonId: string;
  content: string;
  metadata?: Record<string, any>;
  generatedAt: string;
  status: "generating" | "ready" | "error";
}

// Cheatsheet-specific
export interface CheatSheet extends Artifact {
  type: "cheatsheet";
  definitions: Definition[];
  concepts: Concept[];
  examples: CodeExample[];
  pitfalls: string[];
  readTime: number;
}

export interface Definition {
  term: string;
  description: string;
}

export interface Concept {
  title: string;
  description: string;
  icon?: string;
}

export interface CodeExample {
  language: string;
  code: string;
}

// Podcast-specific
export interface PodcastArtifact extends Artifact {
  type: "podcast";
  transcript: string;
  audioUrl?: string;
  duration: number;
  speaker?: string;
}

// Flashcard-specific
export interface FlashcardArtifact extends Artifact {
  type: "flashcard";
  cards: Flashcard[];
  cardCount: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  tags?: string[];
}

// Artifact Generation Request
export interface GenerateArtifactRequest {
  lessonId: string;
  type: ArtifactType | ArtifactType[];
  topic: string;
  content: string;
  userId: string;
}

export interface GenerateArtifactResponse {
  artifacts: Artifact[];
  lessonId: string;
}

// RAG & Learning Request Types
export interface LearnRequest {
  topic: string;
  goal: string;
  format?: string;
  userId: string;
}

export interface LearnResponse {
  output: string;
  retrievedSources: string[];
}

// Document Ingestion Types
export interface IngestResponse {
  status: "success" | "empty";
  chunks: number;
  sourceId: string;
}

// Dashboard Types
export interface DashboardData {
  userProfile: UserProfile;
  userStats: UserStats;
  currentFocus: {
    topic: string;
    subtopic: string;
    imageUrl?: string;
  };
  weeklyActivity: DayActivity[];
  upcomingSessions: SessionConfig[];
}

export interface DayActivity {
  day: string;
  minutes: number;
  percentage: number;
}

export interface SessionConfig {
  topic: string;
  goal: string;
  timeAvailable: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
