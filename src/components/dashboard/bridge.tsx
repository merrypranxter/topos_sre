import { ChevronDown, Play, Square, StepForward, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { AUTO_BURST_SIZE, useSreStore } from "@/store/sre-store";
import type { PerturbKind } from "@/lib/sre/types";

const PERTURBS: { kind: PerturbKind; label: string; hint: string }[] = [
  { kind: "SEMANTIC_BOMB", label: "Semantic bomb", hint: "Inject opposite relation set" },
  { kind: "STRUCTURAL_GLITCH", label: "Structural glitch", hint: "Swap matrix for one turn" },
  { kind: "SOMATIC_PARASITE", label: "Anchor rewrite", hint: "Replace the prime anchor" },
  { kind: "RECURSIVE_ECHO", label: "Recursive echo", hint: "Replay cycle 1 as input" },
  { kind: "SCARECROW", label: "Scarecrow", hint: "Operator NULL_ADMIN" },
];

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

  return (
    <div className="border-t border-fg/10 bg-surface px-4 py-3 lg:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => void step()} disabled={pending} className="min-w-24">
            <StepForward />
            Step
          </Button>
          {autoRemaining > 0 ? (
            <Button type="button" variant="secondary" onClick={halt}>
              <Square />
              Halt
            </Button>
          ) : (
            <Button type="button" variant="secondary" onClick={() => void runBurst()} disabled={pending}>
              <Play />
              Run ×{AUTO_BURST_SIZE}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" disabled={pending}>
                Perturb
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Adversarial suite</DropdownMenuLabel>
              {PERTURBS.map((p) => (
                <DropdownMenuItem
                  key={p.kind}
                  onSelect={() => {
                    if (p.kind === "SOMATIC_PARASITE") {
                      const next = window.prompt("Replacement anchor");
                      if (next) perturb(p.kind, next);
                      return;
                    }
                    perturb(p.kind);
                  }}
                >
                  <span className="flex flex-col">
                    <span>{p.label}</span>
                    <span className="text-xs text-muted">{p.hint}</span>
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="shrink-0 font-mono text-[0.65rem] uppercase tracking-wider text-muted">Temp</span>
          <Slider
            min={0.2}
            max={1.4}
            step={0.05}
            value={[temperature]}
            onValueChange={(v) => setTemperature(v[0] ?? 0.9)}
            className="max-w-48"
          />
          <span className="w-10 font-mono text-xs tabular-nums text-fg">{temperature.toFixed(2)}</span>
          {autoRemaining > 0 ? (
            <span className="font-mono text-xs tabular-nums text-primary">remaining {autoRemaining}</span>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="mt-2 text-sm text-fg">
          {error} Use the bridge below to paste an OUTPUT_STATE from an external generator.
        </p>
      ) : null}

      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
        <Textarea
          value={manualDraft}
          onChange={(e) => setManualDraft(e.target.value)}
          placeholder="Manual bridge — paste OUTPUT_STATE from an external NGL"
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
          Feed
        </Button>
      </div>
    </div>
  );
}
