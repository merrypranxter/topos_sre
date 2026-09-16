import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({
  className,
  sideOffset = 6,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 max-w-xs rounded-md bg-elevated px-2 py-1.5 text-xs text-fg shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-fg)_14%,transparent)]",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}
