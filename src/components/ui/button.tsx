import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "ghost" | "outline" | "danger";
type ButtonSize = "default" | "sm" | "lg" | "icon";

const VARIANTS: Record<ButtonVariant, string> = {
  default: "bg-primary text-bg hover:opacity-90",
  secondary:
    "bg-surface text-fg shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-fg)_14%,transparent)] hover:bg-elevated",
  ghost: "text-muted hover:bg-elevated hover:text-fg",
  outline:
    "text-fg shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-fg)_16%,transparent)] hover:bg-elevated",
  danger:
    "text-red-200 bg-red-500/10 shadow-[0_0_0_1px_color-mix(in_oklab,#ef4444_35%,transparent)] hover:bg-red-500/15",
};

const SIZES: Record<ButtonSize, string> = {
  default: "h-11 px-4",
  sm: "h-9 px-3 text-xs",
  lg: "h-12 px-5",
  icon: "size-11",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[opacity,transform,background-color,color,box-shadow] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
