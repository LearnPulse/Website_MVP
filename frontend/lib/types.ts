// ── Generic ───────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ── Auth ──────────────────────────────────────────────────────────────────

export interface GoogleAuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
  display_name: string | null;
}

// ── Knowledge Graph ───────────────────────────────────────────────────────

export interface ConceptNode {
  id: string;
  name: string;
  description: string;
  chunk_ids: string[];
  source_id: string;
}

export type EdgeType = "prerequisite" | "related" | "part_of" | "example_of";

export interface ConceptEdge {
  from: string;
  to: string;
  type: EdgeType;
}

// ── Learning Path / Progress ──────────────────────────────────────────────

export type ConceptState = "done" | "active" | "locked";
export type ArtifactFormat = "cheatsheet" | "flashcards" | "quiz" | "diagram" | "audio";

export interface ConceptProgress {
  id: string;
  name: string;
  description: string;
  mastery_score: number;           // 0–100
  state: ConceptState;             // done ≥70 | active >0 | locked prerequisite <50
  preferred_formats: ArtifactFormat[];
  viewed_formats: ArtifactFormat[];
}

export interface ProgressResponse {
  goal_text: string;
  concepts: ConceptProgress[];     // ordered by topological sort
  mastered_count: number;
  total_count: number;
}

// ── Onboarding ────────────────────────────────────────────────────────────

export interface UserGoalIn {
  goal_text: string;
}

export interface UserPreferencesIn {
  preferred_formats: ArtifactFormat[];
  detail_level: "concise" | "detailed";
  session_length: "micro" | "standard" | "deep";
}

export interface OnboardingState {
  step: 0 | 1 | 2 | 3;
  goal: string;
  preferences: Omit<UserPreferencesIn, "user_id"> | null;
  files: File[];
  ingestResults: IngestResponse[];
}

// ── Ingest ────────────────────────────────────────────────────────────────

export interface IngestResponse {
  status: string;
  doc_id: string;
  source_id: string;
  chunks: number;
  concept_count: number;
  embedding_time: number;
  total_time: number;
}

// ── Ask / Artifacts ───────────────────────────────────────────────────────

export interface AskRequest {
  user_id: string;
  concept_id: string;
  goal: string;
  artifact_type: ArtifactFormat;
}

export interface AskResponse {
  artifact_type: ArtifactFormat;
  concept_id: string;
  payload: ArtifactPayload;
}

export type ArtifactPayload =
  | CheatsheetPayload
  | FlashcardPayload
  | QuizPayload
  | DiagramPayload
  | AudioPayload;

export interface CheatsheetPayload {
  type: "cheatsheet";
  entries: { term: string; definition: string }[];
}

export interface FlashcardPayload {
  type: "flashcards";
  cards: { front: string; back: string; tags: string[] }[];
}

export interface QuizQuestion {
  stem: string;
  options: [string, string, string, string];
  correct_index: 0 | 1 | 2 | 3;
}

export interface QuizPayload {
  type: "quiz";
  questions: QuizQuestion[];
}

export interface DiagramPayload {
  type: "diagram";
  svg: string;
}

export interface AudioPayload {
  type: "audio";
  transcript: string;
}

// ── Knowledge Graph (visualization) ──────────────────────────────────────

export interface KGNode {
  id: string;
  name: string;
  description: string;
  mastery_score: number;
  source_id: string;
}

export interface KGEdge {
  source: string;
  target: string;
  type: EdgeType;
}

export interface KGResponse {
  nodes: KGNode[];
  edges: KGEdge[];
}

// ── Mastery ───────────────────────────────────────────────────────────────

export type MasterySource = "view" | "flashcard" | "quiz_pass" | "quiz_fail";

export interface MasteryUpdateRequest {
  user_id?: string;
  concept_id: string;
  source: MasterySource;
}
