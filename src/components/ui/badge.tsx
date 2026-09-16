import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "live" | "warn" | "safe";

const VARIANTS: Record<BadgeVariant, string> = {
  default: "bg-elevated text-muted",
  live: "bg-primary/15 text-primary",
  warn: "text-fg shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-fg)_22%,transparent)]",
  safe: "bg-emerald-400/10 text-emerald-300 shadow-[0_0_0_1px_color-mix(in_oklab,#34d399_24%,transparent)]",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: BadgeVariant }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-sm px-1.5 py-0.5 font-mono text-[0.65rem] font-medium uppercase tracking-wider tabular-nums",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
