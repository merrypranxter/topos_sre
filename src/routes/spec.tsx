import { createFileRoute, Link } from "@tanstack/react-router";
import { NGL_SYSTEM_PROMPT } from "@/lib/sre/prompts";

export const Route = createFileRoute("/spec")({ component: SpecPage });

function SpecPage() {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="flex items-center justify-between border-b border-fg/10 px-4 py-3 lg:px-5">
        <Link to="/" className="text-sm font-medium tracking-tight">
          TOPOS-SRE
        </Link>
        <Link
          to="/"
          className="inline-flex h-11 items-center font-mono text-[0.7rem] uppercase tracking-wider text-muted hover:text-fg"
        >
          Console
        </Link>
      </header>
      <article className="mx-auto max-w-3xl px-4 py-10 text-sm leading-relaxed">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted">SRE-V3 · a-aesthetic</p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight">Machine specification</h1>
        <p className="mt-4 text-muted">
          Two isolated layers. The controller never generates prose. The generator never holds the ledger. The
          loop is the experiment.
        </p>

        <h2 className="mt-10 text-lg font-medium">Layers</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-muted">
          <li>
            <span className="text-fg">HLC</span> — deterministic state machine. Levenshtein similarity, token cosine,
            attractor duration, decay level, symbol table, mutation ledger, trigger gates.
          </li>
          <li>
            <span className="text-fg">NGL</span> — sterile executor. Receives an SRE_OP_BLOCK. Emits OUTPUT_STATE.
            No persona. No aesthetic objective.
          </li>
        </ol>

        <h2 className="mt-10 text-lg font-medium">SRE_OP_BLOCK</h2>
        <p className="mt-3 text-muted">
          Neutral fields only. Relation sets replace named domains. Example inventory RS_A is
          {" "}
          <code className="font-mono text-fg">{"{compression, fracture, precipitation, shear, solidification}"}</code>
          — never “crystalline.”
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-elevated p-4 font-mono text-[0.7rem] leading-relaxed text-fg/90">
{`[SRE_OP_BLOCK]
STATE_CYCLE: n
SIM_STRUCT: 0.000 | SIM_SEMANTIC: 0.000
ATTRACTOR_DURATION: 0
DECAY_LEVEL: 1
TENSION: 1
RELATION_SET: {…}
STRUCTURAL_CONSTRAINT: MATRIX | exact rule
OPERATOR: MUTATION_* | FAILURE_* | …
MAPPINGS: {src→dst}
SYMBOL_TABLE: {glyph:[role …]}
DECAY_CONSTRAINT: DL_n | …
FORBIDDEN: […]
INPUT_STATE: "…"
[END_BLOCK]`}
        </pre>

        <h2 className="mt-10 text-lg font-medium">Trigger gates</h2>
        <ul className="mt-3 space-y-2 text-muted">
          <li>SIM_STRUCT and SIM_SEMANTIC both above 0.95 → increment attractor duration.</li>
          <li>Duration at least 12 → FAILURE_01, decay +1, matrix rotate, possible glyph promotion.</li>
          <li>Identical output 3 cycles → SYMMETRY_SHATTER.</li>
          <li>High structure, low semantics → SYMMETRY_SHIFT.</li>
          <li>Matrix miss → DOMAIN_PIVOT (next relation set).</li>
          <li>Decay 10 → REBIRTH. Symbol table is preserved.</li>
        </ul>

        <h2 className="mt-10 text-lg font-medium">NGL sterilization</h2>
        <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-lg bg-elevated p-4 font-mono text-[0.7rem] leading-relaxed text-fg/90">
          {NGL_SYSTEM_PROMPT}
        </pre>
      </article>
    </div>
  );
}
