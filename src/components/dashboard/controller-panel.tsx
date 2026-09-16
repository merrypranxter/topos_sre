import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Meter } from "@/components/dashboard/meter";
import { formatRelationSet, relationSetAt } from "@/lib/sre/domains";
import { formatSymbolTable } from "@/lib/sre/symbols";
import { useSreStore } from "@/store/sre-store";
import { cn } from "@/lib/utils";

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
    <section className="flex min-h-0 flex-col gap-4 overflow-y-auto p-4 lg:p-5">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted">Hard-logic controller</p>
          <h2 className="text-sm font-medium text-fg">STATE_REGISTER</h2>
        </div>
        <Badge variant={state.lock ? "live" : "default"}>{state.lock ? "lock" : "open"}</Badge>
      </header>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        <Stat label="Cycle" value={String(state.cycle).padStart(3, "0")} />
        <Stat label="Decay" value={`DL_${state.decayLevel}`} />
        <Stat label="Tension" value={`T${state.tension}`} />
        <Stat label="Attractor" value={String(state.attractorDuration).padStart(2, "0")} />
        <Stat label="Matrix" value={state.matrix} className="col-span-2" />
        <Stat label="Operator" value={state.operator} className="col-span-2" />
      </dl>

      <div className="grid gap-3 sm:grid-cols-2">
        <Meter label="SIM_STRUCT" value={state.simStruct} />
        <Meter label="SIM_SEMANTIC" value={state.simSemantic} />
      </div>

      <div>
        <p className="mb-1 font-mono text-[0.65rem] uppercase tracking-wider text-muted">Relation set · {set.id}</p>
        <p className="font-mono text-xs leading-relaxed text-fg">{formatRelationSet(set)}</p>
      </div>

      <div>
        <p className="mb-1 font-mono text-[0.65rem] uppercase tracking-wider text-muted">Symbol table</p>
        <p className="break-all font-mono text-xs leading-relaxed text-fg">
          {formatSymbolTable(state.symbols)}
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">SRE_OP_BLOCK</p>
          <Button type="button" variant="ghost" size="sm" onClick={copyBlock} className="h-8 px-2">
            {copied ? <Check /> : <Copy />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <pre className="max-h-64 overflow-auto rounded-lg bg-elevated p-3 font-mono text-[0.7rem] leading-relaxed text-fg/90 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-fg)_10%,transparent)]">
          {block}
        </pre>
      </div>

      <div>
        <p className="mb-1.5 font-mono text-[0.65rem] uppercase tracking-wider text-muted">Audit</p>
        <ul className="max-h-40 space-y-1 overflow-auto font-mono text-[0.7rem] text-muted">
          {audit.length === 0 ? (
            <li>awaiting first OUTPUT_STATE</li>
          ) : (
            [...audit].reverse().slice(0, 16).map((a) => (
              <li key={`${a.cycle}-${a.event}`} className="tabular-nums">
                C{String(a.cycle).padStart(3, "0")} · {a.event} · {a.regime} · pass={a.rulePass ? "T" : "F"} · {a.note}
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">{label}</dt>
      <dd className="truncate font-mono text-sm tabular-nums text-fg">{value}</dd>
    </div>
  );
}
