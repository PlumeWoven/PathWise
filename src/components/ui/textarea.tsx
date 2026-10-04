import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[3.75rem] w-full border border-[var(--pw-border)] bg-[var(--pw-surface-2)] px-3 py-2 text-base text-[var(--pw-ink)] transition-colors duration-300 placeholder:text-[var(--pw-ink-2)] focus-visible:border-[var(--pw-accent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--pw-accent)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
