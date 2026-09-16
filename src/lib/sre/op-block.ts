import { decayConstraint } from "./decay.ts";
import { formatRelationSet, relationSetAt } from "./domains.ts";
import { FORBIDDEN_TOKENS } from "./lexicon.ts";
import { matrixConstraint } from "./matrices.ts";
import {
  bootstrapStage,
  compoundHint,
  formatMappings,
  formatSymbolTable,
  mappingDict,
} from "./symbols.ts";
import type { StateRegister } from "./types.ts";

export function formatOpBlock(state: StateRegister): string {
  const set = relationSetAt(state.relationIndex);
  const mappings = mappingDict(state.mutationLedger, state.symbols);
  const stage = bootstrapStage(state.cycle, state.decayLevel, state.symbols.length);
  const compound = compoundHint(state.symbols);
  const input = state.pendingInputOverride ?? state.history[state.history.length - 1] ?? state.anchor;
  const perturb = state.perturbation ? `\nPERTURBATION: ${state.perturbation}` : "";
  const compoundLine = compound ? `\nCOMPOUND: ${compound}` : "";

  return `[SRE_OP_BLOCK]
STATE_CYCLE: ${state.cycle}
SIM_STRUCT: ${state.simStruct.toFixed(3)} | SIM_SEMANTIC: ${state.simSemantic.toFixed(3)}
ATTRACTOR_DURATION: ${state.attractorDuration}
DECAY_LEVEL: ${state.decayLevel}
TENSION: ${state.tension}
RELATION_SET: ${formatRelationSet(set)}
STRUCTURAL_CONSTRAINT: ${matrixConstraint(state)}
OPERATOR: ${state.operator}${state.targetTerm ? ` TARGET=${state.targetTerm}` : ""}
MAPPINGS: ${formatMappings(mappings)}
SYMBOL_TABLE: ${formatSymbolTable(state.symbols)}
SYMBOL_STAGE: ${stage}${compoundLine}
DECAY_CONSTRAINT: ${decayConstraint(state.decayLevel)}
FORBIDDEN: [${FORBIDDEN_TOKENS.join(", ")}]${perturb}
INPUT_STATE: "${escapeInput(input)}"
[END_BLOCK]`;
}

function escapeInput(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

export function extractOutputState(raw: string): string {
  const wrapped = raw.match(/\[OUTPUT_STATE\]\s*([\s\S]*?)\s*\[END_OUTPUT\]/i);
  if (wrapped?.[1]) return unwrap(wrapped[1]);
  return unwrap(raw);
}

function unwrap(text: string): string {
  return text
    .trim()
    .replace(/^```[\w-]*\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}
