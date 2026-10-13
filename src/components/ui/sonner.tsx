import { Toaster as Sonner } from "sonner";
import { useDarkMode } from "@/pathwise/DarkMode";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  // Sonner defaults to light; follow the app's theme (set on <html>, not the OS).
  const { theme } = useDarkMode();
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[var(--pw-surface)] group-[.toaster]:text-[var(--pw-ink)] group-[.toaster]:border-[var(--pw-border)] group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-[var(--pw-ink-2)]",
          actionButton: "group-[.toast]:bg-[var(--pw-accent)] group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-[var(--pw-ink-2)]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
