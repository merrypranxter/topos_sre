import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Meter } from "@/components/dashboard/meter";
import { formatRelationSet, relationSetAt } from "@/lib/sre/domains";
import { formatSymbolTable } from "@/lib/sre/symbols";
import { useSreStore } from "@/store/sre-store";
import { cn } from "@/lib/utils";

const FRIENDLY_OPERATORS: Record<string, string> = {
  INIT: "rotate the starting material",
  MUTATION_TENSE: "shift tense",
  MUTATION_AGENCY: "swap who acts on whom",
  MUTATION_NUMBER: "change singular/plural pressure",
  MUTATION_DIRECTION: "reverse token direction",
  MUTATION_NEGATION: "inject negation",
  SYMMETRY_SHIFT: "break a structural attractor",
  SYMBOL_LEAP: "introduce a symbol",
  DOMAIN_PIVOT: "replace vocabulary with another relation set",
  SYMMETRY_SHATTER: "break repeated structure",
  REBIRTH: "reset decay while keeping symbols",
  NULL_ADMIN: "temporarily suspend mutation",
  FAILURE_01: "escape a stable attractor",
  FAILURE_02: "recover from low content density",
  FAILURE_03: "escape anchor overuse",
  FAILURE_04: "resolve paradox tension",
};

function plainOperator(operator: string) {
  return FRIENDLY_OPERATORS[operator] ?? operator.toLowerCase().replaceAll("_", " ");
}

export function ControllerPanel() {
  const state = useSreStore((s) => s.state);
  const block = useSreStore((s) => s.currentBlock);
  const audit = useSreStore((s) => s.audit);
  const [copied, setCopied] = useState(false);

  if (!state) return null;
  const set = relationSetAt(state.relationIndex);

  async function copyBlock() {
    await navigator.clipboard.writeText(block);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <section className="flex min-h-0 flex-col p-4 lg:p-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted">Controller</p>
          <h2 className="text-base font-medium text-fg">What rules are active?</h2>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted">
            This side does not write the output. It measures repetition, chooses constraints, and decides the next mutation.
          </p>
        </div>
        <Badge variant={state.lock ? "live" : "default"}>{state.lock ? "attractor lock" : "open"}</Badge>
      </header>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        <Stat label="Cycle" value={String(state.cycle).padStart(3, "0")} note="passes completed" />
        <Stat label="Decay" value={`${state.decayLevel}/10`} note="language erosion" />
        <Stat label="Tension" value={`${state.tension}/3`} note="constraint escalation" />
        <Stat label="Attractor" value={String(state.attractorDuration)} note="repeat streak" />
      </dl>

      <div className="mt-4 grid gap-2 rounded-lg bg-elevated/75 p-3">
        <div className="grid gap-1 sm:grid-cols-[8rem_1fr]">
          <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">Next structure</span>
          <span className="font-mono text-xs text-fg">{state.matrix}</span>
        </div>
        <div className="grid gap-1 sm:grid-cols-[8rem_1fr]">
          <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">Next operation</span>
          <span className="text-xs text-fg"><span className="font-mono">{state.operator}</span> · {plainOperator(state.operator)}</span>
        </div>
        <div className="grid gap-1 sm:grid-cols-[8rem_1fr]">
          <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">Vocabulary</span>
          <span className="text-xs leading-relaxed text-fg/85">{formatRelationSet(set)}</span>
        </div>
      </div>

      <details className="mt-4 rounded-lg border border-fg/10 bg-bg/45 p-3">
        <summary className="cursor-pointer select-none text-sm font-medium text-fg">Controller guts — metrics, symbols, OP_BLOCK + audit</summary>
        <div className="mt-4 grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Meter label="SIM_STRUCT" value={state.simStruct} />
              <p className="mt-1 text-[0.7rem] leading-relaxed text-muted">How similar the recent output structures are.</p>
            </div>
            <div>
              <Meter label="SIM_SEMANTIC" value={state.simSemantic} />
              <p className="mt-1 text-[0.7rem] leading-relaxed text-muted">How similar the recent token meanings/inventories are.</p>
            </div>
          </div>

          <div>
            <p className="mb-1 font-mono text-[0.65rem] uppercase tracking-wider text-muted">Symbol table</p>
            <p className="break-all rounded-md bg-elevated/60 p-2 font-mono text-xs leading-relaxed text-fg">
              {formatSymbolTable(state.symbols) || "No symbols yet."}
            </p>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <div>
                <p className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">SRE_OP_BLOCK</p>
                <p className="text-[0.7rem] text-muted">The exact instruction packet the local generator will execute next.</p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={copyBlock} className="h-8 px-2">
                {copied ? <Check /> : <Copy />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <pre className="max-h-72 overflow-auto rounded-lg bg-elevated p-3 font-mono text-[0.7rem] leading-relaxed text-fg/90 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-fg)_10%,transparent)]">
              {block}
            </pre>
          </div>

          <div>
            <p className="mb-1.5 font-mono text-[0.65rem] uppercase tracking-wider text-muted">Audit trail</p>
            <ul className="max-h-48 space-y-1 overflow-auto rounded-lg bg-elevated/55 p-2 font-mono text-[0.7rem] text-muted">
              {audit.length === 0 ? (
                <li>awaiting first OUTPUT_STATE</li>
              ) : (
                [...audit].reverse().slice(0, 24).map((a) => (
                  <li key={`${a.cycle}-${a.event}`} className="tabular-nums">
                    C{String(a.cycle).padStart(3, "0")} · {a.event} · {a.regime} · pass={a.rulePass ? "T" : "F"} · {a.note}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </details>
    </section>
  );
}

function Stat({
  label,
  value,
  note,
  className,
}: {
  label: string;
  value: string;
  note: string;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 rounded-lg bg-elevated/55 p-3", className)}>
      <dt className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-0.5 font-mono text-lg tabular-nums text-fg">{value}</dd>
      <dd className="mt-0.5 text-[0.68rem] text-muted">{note}</dd>
    </div>
  );
}
