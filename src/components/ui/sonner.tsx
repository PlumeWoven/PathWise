import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
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
