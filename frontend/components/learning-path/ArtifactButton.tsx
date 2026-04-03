import type { ArtifactFormat } from "@/lib/types";

const FORMAT_LABELS: Record<ArtifactFormat, string> = {
  cheatsheet: "Cheatsheet",
  flashcards: "Flashcards",
  quiz: "Quiz",
  diagram: "Diagram",
  audio: "Audio",
};

interface ArtifactButtonProps {
  format: ArtifactFormat;
  isViewed: boolean;
  isLoading: boolean;
  onClick: () => void;
}

export default function ArtifactButton({ format, isViewed, isLoading, onClick }: ArtifactButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={[
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border-[0.5px] transition-colors",
        isViewed
          ? "border-primary bg-primary/5 text-primary"
          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary",
        isLoading ? "opacity-50 cursor-wait" : "",
      ].join(" ")}
    >
      {isLoading ? (
        <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
      ) : isViewed ? (
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : null}
      {FORMAT_LABELS[format]}
    </button>
  );
}
