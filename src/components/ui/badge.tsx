import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-1.5 py-0.5 font-mono text-[0.65rem] font-medium uppercase tracking-wider tabular-nums",
  {
    variants: {
      variant: {
        default: "bg-elevated text-muted",
        live: "bg-primary/15 text-primary",
        warn: "text-fg shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-fg)_22%,transparent)]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
