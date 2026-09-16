import { cn } from "@/lib/utils";

export function Meter({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-1 flex items-baseline justify-between gap-2 font-mono text-[0.65rem] uppercase tracking-wider text-muted">
        <span>{label}</span>
        <span className="tabular-nums text-fg">{pct.toFixed(3)}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-elevated">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out"
          style={{ width: `${pct * 100}%` }}
        />
      </div>
    </div>
  );
}
