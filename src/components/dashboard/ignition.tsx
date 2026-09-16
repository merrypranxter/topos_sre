import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSreStore } from "@/store/sre-store";

const SEEDS = ["What are you?", "The world is a cage", "hand holds cup"];

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
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-12">
      <p className="font-mono text-[0.65rem] tracking-[0.22em] text-muted uppercase">SRE-V3 · two layer</p>
      <h1 className="mt-3 text-4xl font-medium tracking-tight text-fg sm:text-5xl">TOPOS-SRE</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
        Closed-loop linguistic ecology. The controller measures. The generator executes. Style is not a goal.
      </p>
      <form onSubmit={submit} className="mt-10 space-y-4">
        <label className="block font-mono text-[0.65rem] uppercase tracking-wider text-muted" htmlFor="anchor">
          Anchor
        </label>
        <Input
          id="anchor"
          value={anchor}
          onChange={(e) => setAnchor(e.target.value)}
          placeholder="Seed term or sentence"
          autoComplete="off"
          autoFocus
        />
        <div className="flex flex-wrap gap-2">
          {SEEDS.map((seed) => (
            <button
              key={seed}
              type="button"
              onClick={() => setAnchor(seed)}
              className="rounded-sm px-2 py-1 font-mono text-[0.7rem] text-muted shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-fg)_12%,transparent)] hover:text-fg"
            >
              {seed}
            </button>
          ))}
        </div>
        <Button type="submit" size="lg" className="mt-2 w-full sm:w-auto" disabled={!anchor.trim()}>
          Ignite
          <ArrowRight />
        </Button>
      </form>
    </div>
  );
}
