import { TargetIcon, ZapIcon, RouteIcon } from "lucide-react";
import type { ComponentType } from "react";

type Depth = "sm" | "md" | "lg";

const depthShadow: Record<Depth, string> = {
  sm: "shadow-pw-raised-sm",
  md: "shadow-pw-raised",
  lg: "shadow-pw-raised-lg",
};

interface ChipData {
  kind: "chip";
  label: string;
  text: string;
  depth: Depth;
  gridClass: string;
  animationClass: string;
}

interface PodData {
  kind: "pod";
  value: string;
  label: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  depth: Depth;
  gridClass: string;
  animationClass: string;
}

const items: (ChipData | PodData)[] = [
  {
    kind: "chip",
    label: "Stage 01",
    text: "Foundations",
    depth: "sm",
    gridClass: "col-start-1 row-start-1 self-start justify-self-start",
    animationClass: "animate-pw-float-1",
  },
  {
    kind: "chip",
    label: "Stage 02",
    text: "Core Skills",
    depth: "md",
    gridClass: "col-start-5 row-start-1 self-start justify-self-end",
    animationClass: "animate-pw-float-2",
  },
  {
    kind: "pod",
    value: "3 min",
    label: "avg",
    icon: ZapIcon,
    depth: "sm",
    gridClass: "col-start-1 row-start-2 self-center justify-self-start",
    animationClass: "animate-pw-float-3",
  },
  {
    kind: "pod",
    value: "94%",
    label: "accuracy",
    icon: TargetIcon,
    depth: "md",
    gridClass: "col-start-5 row-start-2 self-center justify-self-end",
    animationClass: "animate-pw-float-1",
  },
  {
    kind: "pod",
    value: "No",
    label: "signup",
    icon: RouteIcon,
    depth: "lg",
    gridClass: "col-start-1 row-start-3 self-end justify-self-start",
    animationClass: "animate-pw-float-2",
  },
  {
    kind: "chip",
    label: "Stage 05",
    text: "Your Goal",
    depth: "lg",
    gridClass: "col-start-5 row-start-3 self-end justify-self-end",
    animationClass: "animate-pw-float-3",
  },
];

export function FloatingCluster() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 hidden lg:grid grid-cols-5 grid-rows-3 gap-8 p-16"
      aria-hidden="true"
    >
      {items.map((item, i) => (
        <div key={`${item.kind}-${i}`} className={`${item.gridClass} ${item.animationClass}`}>
          {item.kind === "chip" ? (
            <div
              className={`min-w-[140px] rounded-2xl bg-pw-surface px-5 py-4 text-center ${depthShadow[item.depth]}`}
            >
              <span className="block text-[11px] font-bold uppercase tracking-wider text-pw-accent">
                {item.label}
              </span>
              <span className="mt-1 block text-sm font-semibold text-pw-ink">{item.text}</span>
            </div>
          ) : (
            <div
              className={`flex h-24 w-24 flex-col items-center justify-center rounded-[20px] bg-pw-surface px-2 text-center ${depthShadow[item.depth]}`}
            >
              <item.icon className="mb-1 h-4 w-4 text-pw-secondary" aria-hidden={true} />
              <span className="text-lg font-bold leading-none text-pw-accent">{item.value}</span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-pw-muted">
                {item.label}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
