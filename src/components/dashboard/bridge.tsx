import { useMemo, useState } from "react";
import { Play, ShieldCheck, Square, StepForward, Upload, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AUTO_BURST_SIZE, useSreStore } from "@/store/sre-store";
import type { PerturbKind } from "@/lib/sre/types";

const PERTURBS: { kind: PerturbKind; label: string; hint: string }[] = [
  { kind: "SEMANTIC_BOMB", label: "Semantic bomb", hint: "Rotate into the opposing relation inventory." },
  { kind: "STRUCTURAL_GLITCH", label: "Structural glitch", hint: "Force a different structural matrix for one turn." },
  { kind: "SOMATIC_PARASITE", label: "Rewrite the seed", hint: "Replace the original anchor while keeping the current machine state." },
  { kind: "RECURSIVE_ECHO", label: "Recursive echo", hint: "Throw cycle 1 back into the loop as input." },
  { kind: "SCARECROW", label: "Scarecrow", hint: "Apply NULL_ADMIN: a deliberate controller dead-zone." },
];

function variationLabel(value: number) {
  if (value < 0.55) return "tight";
  if (value < 0.9) return "restrained";
  if (value < 1.15) return "loose";
  return "unruly";
}

export function Bridge() {
  const pending = useSreStore((s) => s.pending);
  const error = useSreStore((s) => s.error);
  const autoRemaining = useSreStore((s) => s.autoRemaining);
  const temperature = useSreStore((s) => s.temperature);
  const manualDraft = useSreStore((s) => s.manualDraft);
  const step = useSreStore((s) => s.step);
  const runBurst = useSreStore((s) => s.runBurst);
  const halt = useSreStore((s) => s.halt);
  const ingestManual = useSreStore((s) => s.ingestManual);
  const perturb = useSreStore((s) => s.perturb);
  const setTemperature = useSreStore((s) => s.setTemperature);
  const setManualDraft = useSreStore((s) => s.setManualDraft);

  const [perturbKind, setPerturbKind] = useState<PerturbKind>("SEMANTIC_BOMB");
  const [replacementAnchor, setReplacementAnchor] = useState("");
  const selectedPerturb = useMemo(
    () => PERTURBS.find((p) => p.kind === perturbKind) ?? PERTURBS[0]!,
    [perturbKind],
  );

  function applyPerturbation() {
    if (perturbKind === "SOMATIC_PARASITE") {
      const next = replacementAnchor.trim();
      if (!next) return;
      perturb(perturbKind, next);
      setReplacementAnchor("");
      return;
    }
    perturb(perturbKind);
  }

  return (
    <section className="border-b border-fg/10 bg-surface/95 px-4 py-4 lg:px-5">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted">Drive the loop</p>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-fg/85">
              <strong>Step</strong> runs one cycle. <strong>Run ×{AUTO_BURST_SIZE}</strong> runs a short burst slowly enough to watch.
              Nothing here calls a paid model API.
            </p>
          </div>
          <Badge variant="safe" className="w-fit gap-1.5 px-2 py-1">
            <ShieldCheck className="size-3" /> local · $0 API · no token burn
          </Badge>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" onClick={() => void step()} disabled={pending || autoRemaining > 0} className="min-w-28">
            <StepForward />
            Step once
          </Button>
          {autoRemaining > 0 ? (
            <Button type="button" variant="secondary" onClick={halt}>
              <Square />
              Stop burst
            </Button>
          ) : (
            <Button type="button" variant="secondary" onClick={() => void runBurst()} disabled={pending}>
              <Play />
              Run ×{AUTO_BURST_SIZE}
            </Button>
          )}
          {autoRemaining > 0 ? (
            <span className="self-center font-mono text-xs tabular-nums text-primary">{autoRemaining} cycle{autoRemaining === 1 ? "" : "s"} left</span>
          ) : null}
        </div>

        <div className="mt-4 grid gap-2 rounded-lg bg-bg/55 p-3 sm:grid-cols-[auto_minmax(180px,360px)_auto] sm:items-center">
          <div>
            <label htmlFor="variation" className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">
              Variation
            </label>
            <p className="text-xs text-muted">How aggressively the local executor mixes its allowed token inventory.</p>
          </div>
          <input
            id="variation"
            type="range"
            min={0.2}
            max={1.4}
            step={0.05}
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="w-full accent-[var(--color-primary)]"
            aria-label="Variation"
          />
          <span className="font-mono text-xs tabular-nums text-fg">
            {temperature.toFixed(2)} · {variationLabel(temperature)}
          </span>
        </div>

        <details className="mt-3 rounded-lg bg-bg/45 p-3 open:bg-bg/70">
          <summary className="cursor-pointer select-none text-sm font-medium text-fg">
            <span className="inline-flex items-center gap-2"><Zap className="size-4 text-primary" /> Kick it sideways — perturbations</span>
          </summary>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted">
            A perturbation changes the controller state before the next cycle. It does not generate text by itself and costs nothing.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(180px,260px)_1fr_auto] sm:items-end">
            <label className="grid gap-1 text-xs text-muted">
              Perturbation
              <select
                value={perturbKind}
                onChange={(e) => setPerturbKind(e.target.value as PerturbKind)}
                className="h-11 rounded-md border border-fg/15 bg-surface px-3 text-sm text-fg outline-none focus:border-primary/60"
              >
                {PERTURBS.map((p) => (
                  <option key={p.kind} value={p.kind}>{p.label}</option>
                ))}
              </select>
            </label>
            <div>
              <p className="text-xs leading-relaxed text-muted">{selectedPerturb.hint}</p>
              {perturbKind === "SOMATIC_PARASITE" ? (
                <input
                  value={replacementAnchor}
                  onChange={(e) => setReplacementAnchor(e.target.value)}
                  placeholder="New seed / anchor"
                  className="mt-2 h-11 w-full rounded-md border border-fg/15 bg-surface px-3 text-sm text-fg outline-none placeholder:text-muted focus:border-primary/60"
                />
              ) : null}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={applyPerturbation}
              disabled={pending || (perturbKind === "SOMATIC_PARASITE" && !replacementAnchor.trim())}
            >
              Apply jolt
            </Button>
          </div>
        </details>

        <details className="mt-2 rounded-lg bg-bg/35 p-3">
          <summary className="cursor-pointer select-none text-sm text-muted hover:text-fg">External model bridge — advanced</summary>
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted">
            This box is only for manually pasting an OUTPUT_STATE produced somewhere else. TOPOS-SRE does not send it anywhere or make an API call for you.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
            <Textarea
              value={manualDraft}
              onChange={(e) => setManualDraft(e.target.value)}
              placeholder="Paste an external OUTPUT_STATE here"
              className="min-h-20 font-mono text-xs"
            />
            <Button
              type="button"
              variant="secondary"
              className="sm:h-11"
              disabled={pending || !manualDraft.trim()}
              onClick={() => ingestManual(manualDraft)}
            >
              <Upload />
              Feed it in
            </Button>
          </div>
        </details>

        {error ? <p className="mt-3 text-sm text-red-200">{error}</p> : null}
      </div>
    </section>
  );
}
