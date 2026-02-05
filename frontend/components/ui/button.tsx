import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition",
          variant === "primary" && "bg-accent text-ink hover:bg-accentDeep hover:text-white",
          variant === "ghost" && "border border-ink/10 text-ink/70 hover:text-ink",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
