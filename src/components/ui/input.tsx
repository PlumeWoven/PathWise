import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full border border-[var(--pw-border)] bg-[var(--pw-surface-2)] px-3 py-1 text-base text-[var(--pw-ink)] transition-colors duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--pw-ink)] placeholder:text-[var(--pw-ink-2)] focus-visible:border-[var(--pw-accent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--pw-accent)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
