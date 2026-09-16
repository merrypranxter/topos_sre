import { BookOpen, Eye, FlaskConical, Gauge, Play, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSreStore } from "@/store/sre-store";
import type { PerturbKind } from "@/lib/sre/types";

type ExperimentPreset = {
  id: string;
  title: string;
  seed: string;
  variation: number;
  why: string;
  watch: string;
  perturb?: PerturbKind;
  perturbLabel?: string;
  rewriteSeed?: string;
  twoStageEcho?: boolean;
};

const PRESETS: ExperimentPreset[] = [
  {
    id: "baseline",
    title: "Baseline drift",
    seed: "hand holds cup",
    variation: 0.75,
    why: "A boring seed gives the controller very little aesthetic help, so any strangeness is easier to attribute to the machine's rules instead of the prompt.",
    watch: "Watch how structure and agency move before the language gets obviously strange.",
  },
  {
    id: "unruly",
    title: "Same seed, unruly executor",
    seed: "hand holds cup",
    variation: 1.35,
    why: "This keeps the starting thought identical but lets the local executor mix the allowed inventory much more aggressively.",
    watch: "Compare this run with Baseline drift. The controller is the same; only local token mixing changes.",
  },
  {
    id: "semantic-bomb",
    title: "Semantic bomb",
    seed: "The world is a cage",
    variation: 0.95,
    perturb: "SEMANTIC_BOMB",
    perturbLabel: "semantic bomb",
    why: "The controller injects the opposing relation inventory before the next generation step, forcing a sideways semantic shove without asking for a style.",
    watch: "Look for vocabulary replacement, abrupt relation changes, or the old idea being absorbed into the new inventory.",
  },
  {
    id: "structural-glitch",
    title: "Structural glitch",
    seed: "the key fits the lock",
    variation: 1,
    perturb: "STRUCTURAL_GLITCH",
    perturbLabel: "structural glitch",
    why: "This changes the structural matrix before generation, so you can watch form destabilize while the semantic material is still recognizable.",
    watch: "Watch the structure label on each output card and compare it with the wording itself.",
  },
  {
    id: "parasite",
    title: "Anchor parasite",
    seed: "a door opens",
    variation: 1.05,
    perturb: "SOMATIC_PARASITE",
    perturbLabel: "rewrite the seed",
    rewriteSeed: "the door remembers me",
    why: "This swaps the prime anchor while keeping the controller alive, letting you test whether the current state absorbs the new thought or splits into a new trajectory.",
    watch: "Look for traces of both anchors living in the same run versus a clean takeover by the replacement seed.",
  },
  {
    id: "echo",
    title: "Recursive echo",
    seed: "I forgot why I came in here",
    variation: 1.1,
    twoStageEcho: true,
    why: "This runs one short burst, then throws the first generated cycle back into the machine and runs another burst.",
    watch: "Look for reinforcement, mutation, bifurcation, or total collapse after the machine is forced to meet its own earlier output again.",
  },
  {
    id: "scarecrow",
    title: "Scarecrow dead-zone",
    seed: "the room remembers",
    variation: 0.9,
    perturb: "SCARECROW",
    perturbLabel: "scarecrow",
    why: "NULL_ADMIN temporarily suspends the normal mutation behavior, which gives you a control case for what happens when the controller stops pushing as hard.",
    watch: "Compare repetition and semantic drift with a normal run using the same seed.",
  },
];

export function Guide({ onClose }: { onClose: () => void }) {
  const state = useSreStore((s) => s.state);
  const tape = useSreStore((s) => s.tape);
  const pending = useSreStore((s) => s.pending);
  const ignite = useSreStore((s) => s.ignite);
  const runBurst = useSreStore((s) => s.runBurst);
  const perturb = useSreStore((s) => s.perturb);
  const setTemperature = useSreStore((s) => s.setTemperature);

  function okayToReplaceCurrent() {
    if (!state || tape.length === 0) return true;
    return window.confirm("This starts a new experiment and replaces the current tape. Export it first if you want to keep it. Continue?");
  }

  function loadPreset(preset: ExperimentPreset) {
    if (!okayToReplaceCurrent()) return;
    ignite(preset.seed);
    setTemperature(preset.variation);
    if (preset.perturb) perturb(preset.perturb, preset.rewriteSeed);
    onClose();
  }

  async function runPreset(preset: ExperimentPreset) {
    if (!okayToReplaceCurrent()) return;
    ignite(preset.seed);
    setTemperature(preset.variation);
    if (preset.perturb) perturb(preset.perturb, preset.rewriteSeed);
    onClose();

    await Promise.resolve();
    await runBurst();

    if (preset.twoStageEcho) {
      perturb("RECURSIVE_ECHO");
      await runBurst();
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8 lg:px-5">
      <section className="rounded-2xl border border-fg/10 bg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted">Guide + experiment lab</p>
            <h1 className="mt-1 text-2xl font-medium tracking-tight text-fg sm:text-3xl">How to drive the weird little bastard</h1>
            <p className="mt-3 text-sm leading-relaxed text-fg/85">
              TOPOS-SRE is a feedback loop. The controller measures what just happened, changes the rules, and the local generator executes the next instruction packet. You can play it casually or open the controller guts and study exactly why the trajectory changed.
            </p>
          </div>
          <Badge variant="safe" className="w-fit gap-1.5 px-2 py-1">
            <ShieldCheck className="size-3" /> local · $0 API · no model tokens
          </Badge>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="button" onClick={onClose}>
            <Play />
            Back to the machine
          </Button>
          {state ? (
            <span className="self-center text-xs text-muted">Current experiment stays exactly where you left it.</span>
          ) : null}
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickCard icon={<Sparkles className="size-4" />} title="1. Feed it something" text="Use a plain word, sentence, or question. Boring seeds are scientifically useful because they do not smuggle weirdness in for free." />
        <QuickCard icon={<Play className="size-4" />} title="2. Step or burst" text="Step once shows one controller -> generator cycle. Run x4 gives you a small automatic burst that is still easy to follow." />
        <QuickCard icon={<Eye className="size-4" />} title="3. Watch the output" text="The left side is the creature. Compare cycles, structures, operators, and decay instead of judging one isolated sentence." />
        <QuickCard icon={<Zap className="size-4" />} title="4. Kick it sideways" text="Use perturbations when the run gets repetitive, too stable, or you deliberately want to test how the current state reacts to a shock." />
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted">Clickable experiments</p>
            <h2 className="mt-1 text-xl font-medium text-fg">Try one without setting shit up manually</h2>
          </div>
          <span className="hidden text-xs text-muted sm:block">Every preset runs locally.</span>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {PRESETS.map((preset) => (
            <article key={preset.id} className="rounded-xl border border-fg/10 bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-medium text-fg">{preset.title}</h3>
                  <p className="mt-1 font-mono text-[0.7rem] text-primary">seed: {preset.seed}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge>variation {preset.variation.toFixed(2)}</Badge>
                  {preset.perturbLabel ? <Badge variant="live">{preset.perturbLabel}</Badge> : null}
                  {preset.twoStageEcho ? <Badge variant="live">8 cycles</Badge> : <Badge>4 cycles</Badge>}
                </div>
              </div>

              <div className="mt-3 grid gap-3 text-sm leading-relaxed">
                <div>
                  <p className="font-medium text-fg">Why try it</p>
                  <p className="mt-1 text-muted">{preset.why}</p>
                </div>
                <div>
                  <p className="font-medium text-fg">What to watch</p>
                  <p className="mt-1 text-muted">{preset.watch}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" size="sm" disabled={pending} onClick={() => void runPreset(preset)}>
                  <FlaskConical />
                  Try it now
                </Button>
                <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => loadPreset(preset)}>
                  Load setup only
                </Button>
              </div>
              <p className="mt-2 text-[0.7rem] leading-relaxed text-muted">
                Try it now starts a fresh local session and automatically runs the preset. Load setup only prepares it and lets you step through manually.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <InfoPanel icon={<Gauge className="size-4" />} title="Variation: what that slider actually means">
          <p>Variation does not tell the machine to be creative or weird. It changes how aggressively the local executor mixes tokens from the inventory the controller already allowed.</p>
          <ul className="mt-3 space-y-1.5 text-sm text-muted">
            <li><strong className="text-fg">0.20-0.55 - tight:</strong> useful for cleaner comparisons and repeatable baselines.</li>
            <li><strong className="text-fg">0.55-0.90 - restrained:</strong> enough movement to see the system breathe without exploding immediately.</li>
            <li><strong className="text-fg">0.90-1.15 - loose:</strong> a good general experimental range.</li>
            <li><strong className="text-fg">1.15-1.40 - unruly:</strong> more aggressive token mixing; use it when you want to stress the local executor.</li>
          </ul>
        </InfoPanel>

        <InfoPanel icon={<Zap className="size-4" />} title="Perturbations: the five deliberate shocks">
          <ul className="space-y-2 text-sm text-muted">
            <li><strong className="text-fg">Semantic bomb:</strong> injects the opposing relation set. Good for testing absorption versus bifurcation.</li>
            <li><strong className="text-fg">Structural glitch:</strong> swaps the active structural matrix. Good for separating form changes from meaning changes.</li>
            <li><strong className="text-fg">Rewrite the seed:</strong> changes the prime anchor without restarting controller state.</li>
            <li><strong className="text-fg">Recursive echo:</strong> throws the earliest generated state back into the loop.</li>
            <li><strong className="text-fg">Scarecrow:</strong> applies NULL_ADMIN, a deliberate controller dead-zone for comparison.</li>
          </ul>
        </InfoPanel>

        <InfoPanel icon={<Eye className="size-4" />} title="What to watch for">
          <ul className="space-y-2 text-sm text-muted">
            <li><strong className="text-fg">Absorption:</strong> a shock gets folded into the existing trajectory and the run keeps its identity.</li>
            <li><strong className="text-fg">Bifurcation:</strong> the trajectory visibly splits or changes regime after a perturbation.</li>
            <li><strong className="text-fg">Attractor:</strong> recent outputs become structurally and semantically similar enough that the controller starts counting a repeat streak.</li>
            <li><strong className="text-fg">Collapse:</strong> constraints overpower useful language and output becomes very sparse, repetitive, or symbolic.</li>
            <li><strong className="text-fg">Rebirth:</strong> deep decay resets while accumulated symbols survive into the next phase.</li>
          </ul>
        </InfoPanel>

        <InfoPanel icon={<BookOpen className="size-4" />} title="Controller numbers in normal-human language">
          <ul className="space-y-2 text-sm text-muted">
            <li><strong className="text-fg">Cycle:</strong> how many completed passes the experiment has survived.</li>
            <li><strong className="text-fg">Decay:</strong> how much ordinary language capability has been deliberately eroded, from 1/10 to 10/10.</li>
            <li><strong className="text-fg">Tension:</strong> how aggressively the structure is being escalated.</li>
            <li><strong className="text-fg">Attractor:</strong> how long the machine has remained in a highly similar region.</li>
            <li><strong className="text-fg">SIM_STRUCT:</strong> recent structural similarity. Higher means the shapes of recent outputs are more alike.</li>
            <li><strong className="text-fg">SIM_SEMANTIC:</strong> recent token-inventory similarity. Higher means the semantic material is repeating more heavily.</li>
          </ul>
        </InfoPanel>
      </section>

      <section className="mt-8 rounded-xl border border-fg/10 bg-surface p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" />
          <h2 className="text-base font-medium text-fg">Credit and token safety</h2>
        </div>
        <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted">
          The normal TOPOS-SRE controls - Step once, Run x4, Variation, every perturbation, and every preset on this page - execute the onboard TypeScript generator in your browser. They do not call Grok, OpenAI, or another paid model API. The External model bridge is manual paste-in only. If a future remote-model mode is ever added, it should remain visibly separate and opt-in rather than silently replacing local execution.
        </p>
      </section>

      <section className="mt-8 rounded-xl border border-dashed border-fg/15 p-4 sm:p-5">
        <h2 className="text-base font-medium text-fg">A good first science-y comparison</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Run <strong className="text-fg">Baseline drift</strong>, export or screenshot the result, then run <strong className="text-fg">Same seed, unruly executor</strong>. Because the seed and controller architecture stay the same, the difference you see is much easier to trace to the Variation setting instead of some giant prompt change. Then try <strong className="text-fg">Semantic bomb</strong> and watch whether the trajectory absorbs the shock or genuinely changes regime.
        </p>
      </section>
    </main>
  );
}

function QuickCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <article className="rounded-xl bg-surface p-4 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-fg)_9%,transparent)]">
      <div className="flex items-center gap-2 text-primary">{icon}<h2 className="text-sm font-medium text-fg">{title}</h2></div>
      <p className="mt-2 text-xs leading-relaxed text-muted">{text}</p>
    </article>
  );
}

function InfoPanel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-xl border border-fg/10 bg-surface p-4 sm:p-5">
      <div className="flex items-center gap-2 text-primary">{icon}<h2 className="text-base font-medium text-fg">{title}</h2></div>
      <div className="mt-3 text-sm leading-relaxed text-muted">{children}</div>
    </article>
  );
}
