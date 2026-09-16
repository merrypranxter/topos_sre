# TOPOS-SRE

**Topological Semantic Recursion Engine — SRE-V3.1**

A two-layer closed-loop linguistic ecology. Not a chatbot. Not a roleplay.

- **HLC** (Hard-Logic Controller) — deterministic state machine. Measurements, ledgers, triggers.
- **NGL** (Neutral Generative Layer) — executes each `[SRE_OP_BLOCK]` and returns an `OUTPUT_STATE`.

The hunt is a regime shift: a point where the generator can no longer satisfy the constraints in ordinary English and is forced into a synthetic shorthand in order to remain in the loop.

## Cost / token safety

The standalone dashboard is **local-first**.

`Step` and `Run ×4` call `executeOpBlock()` in the browser. They do **not** call Grok, OpenAI, or any other paid model API, so normal dashboard use consumes **zero model tokens / credits**.

The old optional xAI server caller remains in `src/lib/ngl/generate.ts` for future experiments, but it is not imported by the standalone dashboard and is disabled unless `XAI_REMOTE_ENABLED=true` is explicitly set. It also has a low output cap, a request cap, and no automatic paid retry.

The **External model bridge** is manual: paste an `OUTPUT_STATE` made somewhere else and TOPOS-SRE will ingest it. TOPOS-SRE does not send that text to an API.

## How to drive it

1. Enter a **Starting thought** and press **Ignite experiment**.
2. **Step once** executes one controller → generator → controller cycle.
3. **Run ×4** executes a short, deliberately slowed burst so the changes are visible and stoppable.
4. **Variation** changes how aggressively the local executor mixes its allowed token inventory. It does not affect billing.
5. **Perturbations** change the controller state before the next cycle:
   - Semantic bomb — rotate toward an opposing relation inventory.
   - Structural glitch — force another matrix for one turn.
   - Rewrite the seed — replace the prime anchor while preserving state.
   - Recursive echo — replay the first cycle as input.
   - Scarecrow — apply `NULL_ADMIN`.
6. The main **Output** panel is the thing to watch. **Controller guts** contains the metrics, symbol table, exact OP_BLOCK, and audit trail when you want to inspect why something happened.

## Layout

```text
src/lib/sre/          HLC engine (pure TypeScript, no network)
src/lib/ngl/local.ts  onboard zero-cost NGL executor
src/store/            session + loop orchestration
src/components/       mobile-first dashboard
prompts/ngl-v1.txt    sterilized external-worker prompt
docs/ARCHITECTURE.md  machine spec
docs/HLC.md           controller contract
docs/NGL.md           worker contract
```

## Local development

Requires Node 22+.

```bash
npm install
npm run dev
```

Build production files:

```bash
npm run build
```

Run the deterministic engine tests:

```bash
npm test
```

## Netlify

The repository includes `netlify.toml`.

- Build command: `npm run build`
- Publish directory: `dist`
- Node: `22`
- No API key or environment variable is required for the normal local-first dashboard.

Connect this repository to Netlify and deploy from `main`. The generated Vite site is a static SPA.

## Loop

1. Operator supplies an anchor.
2. HLC emits an `[SRE_OP_BLOCK]` (relation set, matrix, operator, mappings, decay).
3. Local NGL executes the block and returns `OUTPUT_STATE`.
4. HLC ingests the text, updates similarity / attractor / decay, and emits the next block.
5. Repeat. Perturbations are optional shocks, not style instructions.

Do not tell the NGL to “do a better job.” Do not tell the HLC to “make it weirder.”

## License

MIT
