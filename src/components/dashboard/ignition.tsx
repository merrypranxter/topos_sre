import { useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSreStore } from "@/store/sre-store";

const SEEDS = ["hand holds cup", "What are you?", "The world is a cage"];

export function Ignition() {
  const ignite = useSreStore((s) => s.ignite);
  const [anchor, setAnchor] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = anchor.trim();
    if (!value) return;
    ignite(value);
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-12 sm:py-16">
      <h1 className="text-4xl font-medium tracking-tight text-fg sm:text-5xl">TOPOS-SRE</h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-fg/85">
        Give the machine a starting thought. The controller will keep measuring the result, changing the rules, and feeding the altered state back through the loop.
      </p>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        You do not need to understand the controller internals to play with it. Start with one boring sentence and watch where the rules drag it.
      </p>

      <Badge variant="safe" className="mt-5 w-fit gap-1.5 px-2 py-1">
        <ShieldCheck className="size-3" /> local generator · $0 API · no model-token burn
      </Badge>

      <form onSubmit={submit} className="mt-9 space-y-4 rounded-2xl bg-surface p-4 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-fg)_10%,transparent)] sm:p-5">
        <div>
          <label className="block text-sm font-medium text-fg" htmlFor="anchor">
            Starting thought
          </label>
          <p className="mt-1 text-xs text-muted">A word, phrase, sentence, question — whatever you want the loop to chew on.</p>
        </div>
        <Input
          id="anchor"
          value={anchor}
          onChange={(e) => setAnchor(e.target.value)}
          placeholder="e.g. hand holds cup"
          autoComplete="off"
          autoFocus
          className="h-12 text-base"
        />
        <div className="flex flex-wrap gap-2">
          {SEEDS.map((seed) => (
            <button
              key={seed}
              type="button"
              onClick={() => setAnchor(seed)}
              className="rounded-md bg-elevated px-2.5 py-1.5 font-mono text-[0.72rem] text-muted hover:text-fg"
            >
              {seed}
            </button>
          ))}
        </div>
        <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={!anchor.trim()}>
          Ignite experiment
          <ArrowRight />
        </Button>
      </form>

      <div className="mt-6 grid gap-3 text-xs leading-relaxed text-muted sm:grid-cols-3">
        <p><strong className="text-fg">STEP</strong><br />one controller → generator cycle</p>
        <p><strong className="text-fg">RUN ×4</strong><br />a small watchable automatic burst</p>
        <p><strong className="text-fg">PERTURB</strong><br />kick the controller into a different path</p>
      </div>
    </main>
  );
}
