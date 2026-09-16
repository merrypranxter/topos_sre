# TOPOS-SRE Architecture (SRE-V3.1)

Closed-loop linguistic ecology. Two layers, a-aesthetic.

## Objective

Induce a regime shift: a point where a generative layer can no longer satisfy
hard structural constraints in standard English and must invent a synthetic
representation to remain in the loop. The desired object is unprescribed.

Style is not a goal. Weirdness is not requested. Constraint satisfaction is.

## Layers

### HLC — Hard-Logic Controller

External state manager. Deterministic TypeScript (`src/lib/sre`).

Holds:

- `CYCLE_COUNT`
- attractor duration and lock flag
- decay level (1–10)
- relation-set index (not domain names)
- active matrix and operator
- symbol table (glyph, role, inheritance, cycle created)
- mutation ledger
- recent raw outputs
- `SIM_STRUCT` — mean pairwise normalized Levenshtein *similarity* of last 3
- `SIM_SEMANTIC` — mean pairwise token-cosine of last 3

Never generates prose. Never sees an aesthetic brief.

### NGL — Neutral Generative Layer

Blind executor. Receives `[SRE_OP_BLOCK]`, returns `OUTPUT_STATE`.

The standalone dashboard uses `src/lib/ngl/local.ts`, a deterministic onboard executor that runs entirely in the browser. **Step and Run do not make model API calls.**

A sterilized external-worker prompt remains in `prompts/ngl-v1.txt`, and the manual bridge can ingest an `OUTPUT_STATE` generated elsewhere.

`src/lib/ngl/generate.ts` retains an optional xAI server caller for future experiments. It is not imported by the standalone dashboard and is explicitly disabled unless `XAI_REMOTE_ENABLED=true` is configured. Remote output and request counts are capped and paid retries are disabled.

## OP_BLOCK (neutral)

```text
[SRE_OP_BLOCK]
STATE_CYCLE:
SIM_STRUCT: | SIM_SEMANTIC:
ATTRACTOR_DURATION:
DECAY_LEVEL:
TENSION:
RELATION_SET: {token inventory}
STRUCTURAL_CONSTRAINT: MATRIX | hard rule
OPERATOR:
MAPPINGS:
SYMBOL_TABLE:
SYMBOL_STAGE:
DECAY_CONSTRAINT:
FORBIDDEN:
INPUT_STATE:
[END_BLOCK]
```

Relation sets rotate A→B→C→D→E→A:

| ID   | Inventory                                                          |
| ---- | ------------------------------------------------------------------ |
| RS_A | compression, fracture, precipitation, shear, solidification        |
| RS_B | diffusion, saturation, seepage, evaporation, dissolution           |
| RS_C | replication, inheritance, boundary, transfer, decomposition        |
| RS_D | erasure, subtraction, omission, hollow, vacuum                     |
| RS_E | interval, torque, alignment, calibration, sequence                 |

## Trigger table

| Condition                                         | Action                         |
| ------------------------------------------------- | ------------------------------ |
| both sims > 0.95                                  | attractor duration += 1        |
| attractor duration ≥ 12                           | FAILURE_01, DL += 1, rotate    |
| identical output 3 cycles                         | SYMMETRY_SHATTER               |
| SIM_STRUCT high, SIM_SEMANTIC low                 | SYMMETRY_SHIFT                 |
| matrix violated                                   | DOMAIN_PIVOT                   |
| content density ≈ 0 for 5 cycles                  | FAILURE_02                     |
| anchor frequency > 80% for 3 cycles               | FAILURE_03                     |
| tension 3 (PARADOX matrix)                        | FAILURE_04                     |
| DL reaches 10                                     | REBIRTH (DL=1, symbols kept)   |

## Libraries

1. **Symmetry matrices** — MIRROR, FIBONACCI, STACCATO, BIFURCATED, DESCENDING, plus composites DOUBLE_HELIX, SHATTERED_GRID, BIFURCATED_LOOP, and unsatisfiable PARADOX.
2. **Symbolic bootstrap** — glyphs with roles C/O/T, inheritance, role mutation every 5 uses, stages 1–3.
3. **Decay gradient** — DL 1–10 capability loss (modifiers → SVO → no present tense → ≤4 letters → no nouns → no alphanumerics).
4. **Adversarial perturbations** — semantic bomb, structural glitch, anchor rewrite, recursive echo, scarecrow.

## Interface contract

The **Output** panel is the primary play surface. The **Controller** is explanatory instrumentation. The exact OP_BLOCK, similarity meters, symbol table, and audit trail remain available under **Controller guts** instead of occupying the main mobile workflow.

The dashboard's normal feedback path is local:

`HLC → local NGL → OUTPUT_STATE → HLC`

The manual bridge is an optional alternate path for externally generated output.
