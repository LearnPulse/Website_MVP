"use client";

import { useState, useEffect } from "react";
import { Artifact, ArtifactType } from "@/lib/types";
import { apiClient } from "@/lib/api-client";

interface LearningArtifactsProps {
  lessonId: string;
  userId: string;
  topicTitle: string;
  lessonContent: string;
}

/**
 * LearningArtifacts Component
 * 
 * Unified hub for multi-artifact generation (NotebookLM-style)
 * Supports: Cheatsheets, Podcasts, Flashcards, Study Guides
 * 
 * Connected to: /artifacts endpoint (backend artifact generation)
 */
export function LearningArtifacts({
  lessonId,
  userId,
  topicTitle,
  lessonContent,
}: LearningArtifactsProps) {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<ArtifactType>("cheatsheet");
  const [error, setError] = useState<string | null>(null);

  // Fetch existing artifacts
  useEffect(() => {
    const fetchArtifacts = async () => {
      const response = await apiClient.getLessonArtifacts(lessonId);
      if (response.success && response.data) {
        setArtifacts(response.data);
      }
    };
    fetchArtifacts();
  }, [lessonId]);

  const handleGenerateArtifact = async (type: ArtifactType | ArtifactType[]) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await apiClient.generateArtifacts({
        lessonId,
        type,
        topic: topicTitle,
        content: lessonContent,
        userId,
      });

      if (response.success && response.data) {
        setArtifacts([...artifacts, ...response.data.artifacts]);
        if (Array.isArray(type)) {
          setActiveTab(type[0]);
        } else {
          setActiveTab(type);
        }
      } else {
        setError(response.error || "Failed to generate artifacts");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate artifacts");
    } finally {
      setIsGenerating(false);
    }
  };

  const artifactsByType = artifacts.reduce((acc, artifact) => {
    acc[artifact.type] = artifact;
    return acc;
  }, {} as Record<ArtifactType, Artifact>);

  const activeArtifact = artifactsByType[activeTab];

  const getArtifactIcon = (type: ArtifactType) => {
    switch (type) {
      case "cheatsheet":
        return "description";
      case "podcast":
        return "radio";
      case "flashcard":
        return "credit_card";
      case "study-guide":
        return "school";
      default:
        return "note";
    }
  };

  const getArtifactLabel = (type: ArtifactType) => {
    switch (type) {
      case "cheatsheet":
        return "Cheatsheet";
      case "podcast":
        return "Podcast";
      case "flashcard":
        return "Flashcards";
      case "study-guide":
        return "Study Guide";
      default:
        return "Document";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Learning Artifacts
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Generate study materials in multiple formats to enhance your learning
            </p>
          </div>
          <span className="material-symbols-outlined text-4xl text-primary/30">
            package_2
          </span>
        </div>

        {/* Quick Generation Buttons */}
        <div className="grid grid-cols-4 gap-3">
          {(["cheatsheet", "podcast", "flashcard", "study-guide"] as ArtifactType[]).map(
            (type) => {
              const hasArtifact = artifactsByType[type];
              return (
                <button
                  key={type}
                  onClick={() =>
                    hasArtifact ? setActiveTab(type) : handleGenerateArtifact(type)
                  }
                  disabled={isGenerating}
                  className={`p-4 rounded-xl border-2 transition-all text-center flex flex-col items-center gap-2 ${
                    hasArtifact
                      ? "border-primary bg-primary/5 text-primary cursor-pointer"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary hover:bg-primary/5"
                  } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span className="material-symbols-outlined">
                    {getArtifactIcon(type)}
                  </span>
                  <span className="text-sm font-semibold">{getArtifactLabel(type)}</span>
                  {hasArtifact && (
                    <span className="text-xs bg-primary/20 px-2 py-1 rounded text-primary font-bold">
                      Ready
                    </span>
                  )}
                </button>
              );
            }
          )}
        </div>

        {isGenerating && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined animate-spin">
                progress_activity
              </span>
              Generating selected artifacts... This may take a moment while our agents create optimized study materials.
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}
      </div>

      {/* Artifact Content */}
      {activeArtifact ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-slate-200 dark:border-slate-800 px-8 flex gap-8">
            {(["cheatsheet", "podcast", "flashcard", "study-guide"] as ArtifactType[]).map(
              (type) => {
                const hasArtifact = artifactsByType[type];
                if (!hasArtifact) return null;

                return (
                  <button
                    key={type}
                    onClick={() => setActiveTab(type)}
                    className={`pb-4 px-2 text-lg font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                      activeTab === type
                        ? "border-primary text-primary"
                        : "border-transparent text-slate-600 dark:text-slate-400 hover:text-primary"
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {getArtifactIcon(type)}
                    </span>
                    {getArtifactLabel(type)}
                  </button>
                );
              }
            )}
          </div>

          {/* Content Display */}
          <div className="p-8">
            <ArtifactRenderer artifact={activeArtifact} />
          </div>

          {/* Footer Actions */}
          <div className="border-t border-slate-200 dark:border-slate-800 px-8 py-4 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined">download</span>
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined">content_copy</span>
              Copy
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined">bookmark</span>
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-400 block mb-4">
            note_stack_add
          </span>
          <p className="text-slate-600 dark:text-slate-400 font-medium mb-4">
            No artifacts generated yet
          </p>
          <p className="text-slate-500 dark:text-slate-500 text-sm mb-6">
            Click above to generate study materials in your preferred format(s)
          </p>
          <button
            onClick={() => handleGenerateArtifact("cheatsheet")}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
            Generate First Artifact
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Renders different artifact types
 */
function ArtifactRenderer({ artifact }: { artifact: Artifact }) {
  switch (artifact.type) {
    case "cheatsheet":
      return (
        <div className="prose dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: artifact.content }} />
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 text-sm text-slate-500">
            <span className="material-symbols-outlined text-base">schedule</span>
            <span>
              Generated {new Date(artifact.generatedAt).toLocaleDateString()} •{" "}
              {artifact.metadata?.readTime || "5"} min read
            </span>
          </div>
        </div>
      );

    case "podcast":
      return (
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-8 flex items-center gap-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-4xl text-primary">
                radio
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">{artifact.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Duration: {formatDuration(artifact.metadata?.duration || 0)}
              </p>
            </div>
            <button className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors">
              <span className="material-symbols-outlined text-3xl">play_arrow</span>
            </button>
          </div>
          <div>
            <h4 className="font-bold mb-4">Transcript</h4>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {artifact.content}
            </div>
          </div>
        </div>
      );

    case "flashcard":
      return (
        <FlashcardViewer
          cards={(() => {
            try {
              return JSON.parse(artifact.content);
            } catch {
              return [];
            }
          })()}
        />
      );

    case "study-guide":
      return (
        <div className="prose dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: artifact.content }} />
        </div>
      );

    default:
      return <p className="text-slate-500">{artifact.content}</p>;
  }
}

/**
 * Flashcard interactive viewer
 */
function FlashcardViewer({
  cards,
}: {
  cards: Array<{ front: string; back: string; tags?: string[] }>;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (cards.length === 0) {
    return <p className="text-slate-500">No flashcards available</p>;
  }

  const current = cards[currentIndex];

  return (
    <div className="space-y-6">
      <div className="text-center text-sm text-slate-500 font-medium">
        Card {currentIndex + 1} of {cards.length}
      </div>

      {/* Flashcard */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="h-64 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-xl shadow-sm flex items-center justify-center cursor-pointer transition-all hover:shadow-md transform hover:scale-[1.02]"
      >
        <div className="text-center px-8">
          <p className="text-xs font-bold text-primary/60 mb-4 uppercase">
            {isFlipped ? "Answer" : "Question"}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {isFlipped ? current.back : current.front}
          </p>
          <p className="mt-6 text-xs text-slate-400">Click to flip</p>
        </div>
      </div>

      {/* Tags */}
      {current.tags && current.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {current.tags.map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => {
            setCurrentIndex(Math.max(0, currentIndex - 1));
            setIsFlipped(false);
          }}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Previous
        </button>

        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>

        <button
          onClick={() => {
            setCurrentIndex(Math.min(cards.length - 1, currentIndex + 1));
            setIsFlipped(false);
          }}
          disabled={currentIndex === cards.length - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
