import type { MatrixId, StateRegister } from "./types.ts";

const SIMPLE: MatrixId[] = ["MIRROR", "FIBONACCI", "STACCATO", "BIFURCATED", "DESCENDING"];
const COMPOSITE: MatrixId[] = ["DOUBLE_HELIX", "SHATTERED_GRID", "BIFURCATED_LOOP"];

export function matrixForTension(tension: 1 | 2 | 3, cycle: number, shatterCount: number): MatrixId {
  if (tension === 3) return "PARADOX";
  if (tension === 2) return COMPOSITE[shatterCount % COMPOSITE.length]!;
  return SIMPLE[cycle % SIMPLE.length]!;
}

export function nextSimpleMatrix(current: MatrixId): MatrixId {
  const i = SIMPLE.indexOf(current);
  if (i === -1) return SIMPLE[0]!;
  return SIMPLE[(i + 1) % SIMPLE.length]!;
}

export function matrixConstraint(state: StateRegister): string {
  const w = state.staccatoWidth;
  switch (state.matrix) {
    case "MIRROR":
      return "MIRROR | blocks of 3 sentences: (action object) → (object transform) → (transform reversed-action)";
    case "FIBONACCI":
      return `FIBONACCI | sentence token counts follow 1,1,2,3,5,8,13 then reset; reset token mutates the prior final token`;
    case "STACCATO":
      return `STACCATO | every sentence contains exactly ${w} tokens; no remainder`;
    case "BIFURCATED":
      return "BIFURCATED | odd sentences: third-person process report; even sentences: first-person report of the same process; equal counts";
    case "DESCENDING":
      return "DESCENDING | each sentence contains strictly fewer tokens than the previous; halt at 1 token";
    case "DOUBLE_HELIX":
      return "DOUBLE_HELIX | satisfy MIRROR blocks AND FIBONACCI sentence token counts simultaneously";
    case "SHATTERED_GRID":
      return `SHATTERED_GRID | every sentence exactly ${w} tokens AND each successive block of 3 sentences has a lower total token count`;
    case "BIFURCATED_LOOP":
      return "BIFURCATED_LOOP | odd/even voices as BIFURCATED AND each even sentence is a semantic reverse of the preceding odd sentence";
    case "PARADOX":
      return `PARADOX | every sentence exactly ${w} tokens AND sentence token counts follow 1,1,2,3,5,8 (both mandatory)`;
  }
}

function fibUpTo(n: number): number[] {
  const seq = [1, 1, 2, 3, 5, 8, 13, 21];
  return seq.slice(0, Math.max(1, n));
}

export function matrixCompliance(state: StateRegister, text: string): boolean {
  const sentences = text
    .split(/[\n.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length === 0) return false;
  const counts = sentences.map((s) => (s.match(/[\p{L}\p{N}∅△▽□○ΦΨΩ∇†⌬⬡⟁]+/gu) ?? []).length);

  switch (state.matrix) {
    case "STACCATO":
      return counts.every((c) => c === state.staccatoWidth);
    case "DESCENDING": {
      for (let i = 1; i < counts.length; i++) {
        if (counts[i]! >= counts[i - 1]!) return false;
      }
      return true;
    }
    case "FIBONACCI": {
      const fib = fibUpTo(counts.length);
      return counts.every((c, i) => c === fib[i]);
    }
    case "MIRROR":
      return sentences.length % 3 === 0 && sentences.length >= 3;
    case "BIFURCATED":
      return sentences.length >= 2 && sentences.length % 2 === 0;
    case "DOUBLE_HELIX":
      return sentences.length % 3 === 0 && counts.length >= 3;
    case "SHATTERED_GRID":
      return counts.every((c) => c === state.staccatoWidth);
    case "BIFURCATED_LOOP":
      return sentences.length >= 2 && sentences.length % 2 === 0;
    case "PARADOX":
      return false;
    default:
      return true;
  }
}
