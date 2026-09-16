import { Badge } from "@/components/ui/badge";
import { useSreStore } from "@/store/sre-store";
import { cn } from "@/lib/utils";

const FRIENDLY_OPERATORS: Record<string, string> = {
  INIT: "initial rotation",
  MUTATION_TENSE: "tense shift",
  MUTATION_AGENCY: "agency swap",
  MUTATION_NUMBER: "number mutation",
  MUTATION_DIRECTION: "direction reversal",
  MUTATION_NEGATION: "negation",
  SYMMETRY_SHIFT: "symmetry shift",
  SYMBOL_LEAP: "symbol leap",
  DOMAIN_PIVOT: "domain pivot",
  SYMMETRY_SHATTER: "symmetry shatter",
  REBIRTH: "rebirth",
  NULL_ADMIN: "null admin",
};

function plainOperator(operator: string) {
  return FRIENDLY_OPERATORS[operator] ?? operator.toLowerCase().replaceAll("_", " ");
}

export function GenerativePanel() {
  const tape = useSreStore((s) => s.tape);
  const pending = useSreStore((s) => s.pending);
  const last = tape[tape.length - 1];
  const visible = [...tape].slice(-40).reverse();

  return (
    <section className="flex min-h-0 flex-col p-4 lg:p-5">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted">Output</p>
          <h2 className="text-base font-medium text-fg">What the creature said</h2>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted">
            This is the fun part. Each card is one completed cycle after the controller imposed its current rules.
          </p>
        </div>
        {last ? (
          <Badge variant={last.event === "NONE" || last.event === "ATTRACTOR_TICK" ? "default" : "live"}>
            {last.event}
          </Badge>
        ) : null}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {tape.length === 0 && !pending ? (
          <div className="rounded-xl border border-dashed border-fg/15 bg-elevated/35 p-5">
            <p className="text-sm font-medium text-fg">Nothing has happened yet.</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Hit <strong className="text-fg">Step once</strong> above. That executes one local cycle and drops the result here.
            </p>
          </div>
        ) : (
          <ol className="space-y-3">
            {visible.map((rec, i) => (
              <li
                key={rec.cycle}
                className={cn(
                  "rounded-xl bg-elevated p-4 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-fg)_10%,transparent)]",
                  i === 0 && "tape-enter shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-primary)_34%,transparent)]",
                )}
              >
                <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.68rem] text-muted">
                  <span className="font-mono tabular-nums text-primary">C{String(rec.cycle).padStart(3, "0")}</span>
                  <span>structure <span className="font-mono text-fg/80">{rec.matrix}</span></span>
                  <span>·</span>
                  <span>{plainOperator(rec.operator)}</span>
                  <span>·</span>
                  <span>decay {rec.decayLevel}/10</span>
                </div>
                <p className="whitespace-pre-wrap font-mono text-[0.95rem] leading-7 text-fg">{rec.output}</p>
              </li>
            ))}
            {pending ? (
              <li className="rounded-xl bg-elevated p-4 text-sm text-muted shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-fg)_10%,transparent)]">
                Executing the next local constraint…
              </li>
            ) : null}
          </ol>
        )}
        {tape.length > visible.length ? (
          <p className="mt-3 text-center font-mono text-[0.65rem] text-muted">
            Showing the newest {visible.length} cycles · export the session for the full retained tape
          </p>
        ) : null}
      </div>
    </section>
  );
}
