"use client";

import { useState, useRef } from "react";
import { apiClient } from "@/lib/api-client";

interface DocumentUploadProps {
  userId: string;
  topic: string;
  onSuccess?: (sourceId: string, chunks: number) => void;
  onError?: (error: string) => void;
}

/**
 * DocumentUpload Component
 * Frontend entry point for RAG Pipeline
 * 
 * Flow:
 * 1. User selects document (PDF/TXT)
 * 2. Component calls apiClient.uploadDocument()
 * 3. Backend /ingest endpoint:
 *    - Chunks document (800 chars, 100 char overlap)
 *    - Creates source node in Knowledge Graph
 *    - Embeds chunks with embedding service
 *    - Stores embeddings in ChromaDB (vector database)
 *    - Links source to topic in KG
 * 4. Component receives sourceId and chunk count
 * 5. Retrieved sources later used in /learn endpoint for RAG
 */
export function DocumentUpload({
  userId,
  topic,
  onSuccess,
  onError,
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    // Validate file type
    const isValid =
      file.type === "application/pdf" ||
      file.type === "text/plain" ||
      file.name.endsWith(".pdf") ||
      file.name.endsWith(".txt");

    if (!isValid) {
      onError?.("Only PDF and text files are supported");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      // 50MB limit
      onError?.("File size must be under 50MB");
      return;
    }

    setIsLoading(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(
        () =>
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + Math.random() * 30;
          }),
        300
      );

      // Call RAG pipeline ingestion endpoint
      const response = await apiClient.uploadDocument(file, topic, userId);

      clearInterval(progressInterval);
      setProgress(100);

      if (response.success && response.data) {
        onSuccess?.(response.data.sourceId, response.data.chunks);
        setTimeout(() => {
          setIsLoading(false);
          setProgress(0);
        }, 500);
      } else {
        onError?.(response.error || "Upload failed");
        setIsLoading(false);
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Upload failed");
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isLoading}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-slate-400">
            cloud_upload
          </span>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">
              {isLoading ? "Processing document..." : "Drop your document here"}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              or click to browse (PDF or TXT)
            </p>
          </div>

          {/* Progress Bar */}
          {isLoading && progress > 0 && (
            <div className="w-full mt-4 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          )}

          {/* Upload Status */}
          {isLoading && (
            <div className="text-xs text-slate-500 mt-2">
              Uploading and processing...
            </div>
          )}
        </div>
      </div>

      {/* Info Text */}
      <p className="text-xs text-slate-400 mt-3">
        📚 Supports: PDF, TXT (Max 50MB) • Goes into knowledge graph as topic "
        <span className="font-semibold text-primary">{topic}</span>"
      </p>
    </div>
  );
}
