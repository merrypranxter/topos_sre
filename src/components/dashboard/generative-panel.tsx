import { Badge } from "@/components/ui/badge";
import { useSreStore } from "@/store/sre-store";
import { cn } from "@/lib/utils";

export function GenerativePanel() {
  const tape = useSreStore((s) => s.tape);
  const pending = useSreStore((s) => s.pending);
  const last = tape[tape.length - 1];

  return (
    <section className="flex min-h-0 flex-col p-4 lg:p-5">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted">Neutral generative layer</p>
          <h2 className="text-sm font-medium text-fg">OUTPUT_STATE</h2>
        </div>
        {last ? (
          <Badge variant={last.event === "NONE" || last.event === "ATTRACTOR_TICK" ? "default" : "live"}>
            {last.event}
          </Badge>
        ) : null}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {tape.length === 0 && !pending ? (
          <p className="text-sm text-muted">No output yet. Step the loop to feed the current OP_BLOCK into the generator.</p>
        ) : (
          <ol className="space-y-3">
            {[...tape].reverse().map((rec, i) => (
              <li
                key={rec.cycle}
                className={cn(
                  "rounded-lg bg-elevated p-3 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-fg)_10%,transparent)]",
                  i === 0 && "tape-enter",
                )}
              >
                <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.65rem] uppercase tracking-wider text-muted">
                  <span className="tabular-nums text-primary">C{String(rec.cycle).padStart(3, "0")}</span>
                  <span>{rec.matrix}</span>
                  <span>{rec.operator}</span>
                  <span>DL_{rec.decayLevel}</span>
                </div>
                <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-fg">{rec.output}</p>
              </li>
            ))}
            {pending ? (
              <li className="rounded-lg bg-elevated p-3 text-sm text-muted shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-fg)_10%,transparent)]">
                Executing constraint…
              </li>
            ) : null}
          </ol>
        )}
      </div>
    </section>
  );
}
