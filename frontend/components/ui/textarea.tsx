import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/50",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
