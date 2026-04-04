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
          variant === "primary" && "bg-primary text-white hover:opacity-90",
          variant === "ghost" && "border-[0.5px] border-foreground/10 text-foreground/70 hover:text-foreground",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
