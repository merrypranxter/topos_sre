# Neutral Generative Layer

Prompt: `prompts/ngl-v1.txt`  
Onboard executor: `src/lib/ngl/local.ts`  
Remote caller: `src/lib/ngl/generate.ts`

The NGL is a worker. It has no ledger and no opinion about the experiment.

The console Step/Run path uses the onboard executor: a non-autonomous transition
engine that applies mappings, forbidden substitution, operator, relation-set
inventory, decay, and matrix token counts to INPUT_STATE. The remote worker is
optional. The manual bridge still accepts an external OUTPUT_STATE.

## Contract

**In:** one `[SRE_OP_BLOCK]`  
**Out:** one `OUTPUT_STATE` (raw text only)

## Sterilization

- Zero persona
- No self-description
- Forbidden token list is enforced as a substitution rule, not as a theme
- Matrix token counts are exact
- Operator is a grammatical transform
- Relation set is a closed inventory, not a mood

If the upstream model wraps the result in labels or fences, the caller strips them (`extractOutputState`).
