import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-ink/10 bg-white/80 px-4 py-2 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/50",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
