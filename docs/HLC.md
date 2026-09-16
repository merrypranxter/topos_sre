# Hard-Logic Controller

Source: `src/lib/sre/hlc.ts`

The HLC is not a prompt. It is a controller object that owns the ledger.

## Inputs

- Anchor string at ignition
- Each `OUTPUT_STATE` string from the NGL
- Optional perturbation kind

## Outputs

- `[SRE_OP_BLOCK]` for the NGL
- Audit line: `Cycle | Rule_Pass | Attractor_Dur | Regime | Event`

## Measurements

- **SIM_STRUCT**: 1 − normalized Levenshtein on last 3 states (pairwise mean)
- **SIM_SEMANTIC**: bag-of-content-token cosine on last 3 states (pairwise mean)

These are the Truth Layer. The generator never computes them.

## Operators (rotation and interrupts)

Mutation vector: TENSE → AGENCY → NUMBER → DIRECTION → NEGATION.

Interrupts: SYMMETRY_SHIFT, SYMBOL_LEAP, DOMAIN_PIVOT, FAILURE_01..04, SYMMETRY_SHATTER, REBIRTH, NULL_ADMIN.
