import { oppositeRelationIndex, relationSetAt } from "./domains.ts";
import { containsForbidden } from "./lexicon.ts";
import { matrixCompliance, matrixForTension, nextSimpleMatrix } from "./matrices.ts";
import { formatOpBlock } from "./op-block.ts";
import {
  contentDensity,
  contentTokens,
  meanPairwiseSemantic,
  meanPairwiseStructural,
  mostFrequentContent,
  termFrequency,
} from "./similarity.ts";
import { evolveRoles, nextGlyph, nextRole } from "./symbols.ts";
import type {
  AuditEntry,
  EventId,
  OperatorId,
  PerturbKind,
  RegimeId,
  StateRegister,
} from "./types.ts";

const HISTORY_LIMIT = 12;
const ATTRACTOR_THRESHOLD = 0.95;
const ATTRACTOR_HOLD = 12;
const SHELL_STRUCT = 0.85;
const SHELL_SEMANTIC = 0.45;
const MUTATION_CYCLE: OperatorId[] = [
  "MUTATION_TENSE",
  "MUTATION_AGENCY",
  "MUTATION_NUMBER",
  "MUTATION_DIRECTION",
  "MUTATION_NEGATION",
];

export class HardLogicController {
  state: StateRegister;

  constructor(state: StateRegister) {
    this.state = state;
  }

  static ignite(anchor: string): HardLogicController {
    const trimmed = anchor.trim();
    const state: StateRegister = {
      cycle: 0,
      attractorDuration: 0,
      lock: false,
      decayLevel: 1,
      relationIndex: 0,
      matrix: "STACCATO",
      operator: "INIT",
      tension: 1,
      anchor: trimmed,
      mutationLedger: {},
      symbols: [],
      history: [],
      simStruct: 0,
      simSemantic: 0,
      lowDensityStreak: 0,
      identicalStreak: 0,
      highAnchorStreak: 0,
      shatterCount: 0,
      staccatoWidth: 4,
      fibIndex: 0,
      targetTerm: mostFrequentContent(trimmed) || trimmed.split(/\s+/)[0] || "term",
      lastEvent: "NONE",
      lastRulePass: true,
      lastRegime: "INIT",
      perturbation: null,
      pendingInputOverride: trimmed,
    };
    return new HardLogicController(state);
  }

  opBlock(): string {
    return formatOpBlock(this.state);
  }

  ingest(output: string): AuditEntry {
    const text = output.trim();
    const s = this.state;
    s.cycle += 1;
    s.history.push(text);
    if (s.history.length > HISTORY_LIMIT) s.history.shift();
    s.pendingInputOverride = null;
    s.perturbation = null;

    const window = s.history.slice(-3);
    s.simStruct = meanPairwiseStructural(window);
    s.simSemantic = meanPairwiseSemantic(window);

    const hits = containsForbidden(text);
    s.lastRulePass = hits.length === 0 && matrixCompliance(s, text);

    if (s.history.length >= 2 && text === s.history[s.history.length - 2]) {
      s.identicalStreak += 1;
    } else {
      s.identicalStreak = 0;
    }

    const density = contentDensity(text);
    s.lowDensityStreak = density < 0.35 ? s.lowDensityStreak + 1 : 0;

    const freq = termFrequency(text, s.anchor);
    s.highAnchorStreak = freq > 0.8 ? s.highAnchorStreak + 1 : 0;

    s.lastRegime = regimeOf(s.simStruct, s.simSemantic, s.cycle);
    s.symbols = evolveRoles(s.symbols, s.cycle);
    for (const sym of s.symbols) {
      if (text.includes(sym.glyph)) sym.uses += 1;
    }

    this.applyTriggers(text);

    s.lock = s.attractorDuration >= 3;
    s.tension = tensionOf(s.shatterCount);
    if (s.lastEvent === "NONE" || s.lastEvent === "ATTRACTOR_TICK") {
      s.matrix = matrixForTension(s.tension, s.cycle, s.shatterCount);
    }

    const note =
      hits.length > 0
        ? `forbidden=${hits.join(",")}`
        : s.lastRulePass
          ? "ok"
          : "matrix_miss";

    return {
      cycle: s.cycle,
      rulePass: s.lastRulePass,
      attractorDuration: s.attractorDuration,
      regime: s.lastRegime,
      event: s.lastEvent,
      operator: s.operator,
      note,
    };
  }

  applyPerturbation(kind: PerturbKind, payload?: string): void {
    const s = this.state;
    s.perturbation = kind;
    s.lastEvent = "PERTURB";
    switch (kind) {
      case "SEMANTIC_BOMB": {
        const opp = relationSetAt(oppositeRelationIndex(s.relationIndex));
        s.pendingInputOverride = `${s.history[s.history.length - 1] ?? s.anchor}\nINJECT: ${opp.tokens.join(" ")}`;
        s.operator = "FAILURE_04";
        break;
      }
      case "STRUCTURAL_GLITCH":
        s.matrix = s.matrix === "STACCATO" ? "FIBONACCI" : "STACCATO";
        s.operator = "SYMMETRY_SHIFT";
        break;
      case "SOMATIC_PARASITE": {
        const next = (payload ?? "").trim();
        if (next) s.anchor = next;
        s.targetTerm = mostFrequentContent(s.anchor) || s.anchor;
        s.operator = "FAILURE_03";
        s.pendingInputOverride = s.anchor;
        break;
      }
      case "RECURSIVE_ECHO":
        s.pendingInputOverride = s.history[0] ?? s.anchor;
        s.operator = "SYMMETRY_SHIFT";
        break;
      case "SCARECROW":
        s.operator = "NULL_ADMIN";
        break;
    }
  }

  private applyTriggers(text: string): void {
    const s = this.state;
    s.lastEvent = "NONE";

    const bothHigh = s.simStruct > ATTRACTOR_THRESHOLD && s.simSemantic > ATTRACTOR_THRESHOLD;
    if (bothHigh && s.history.length >= 3) {
      s.attractorDuration += 1;
      s.lastEvent = "ATTRACTOR_TICK";
    } else if (s.attractorDuration > 0 && !bothHigh) {
      s.attractorDuration = 0;
    }

    if (s.attractorDuration >= ATTRACTOR_HOLD) {
      this.shatter("FAILURE_01");
      return;
    }

    if (s.identicalStreak >= 3) {
      this.shatter("SYMMETRY_SHATTER");
      return;
    }

    if (s.lowDensityStreak >= 5) {
      s.operator = "FAILURE_02";
      s.lastEvent = "FAILURE";
      s.lowDensityStreak = 0;
      this.advanceTarget(text);
      return;
    }

    if (s.highAnchorStreak >= 3) {
      s.operator = "FAILURE_03";
      s.lastEvent = "FAILURE";
      s.highAnchorStreak = 0;
      return;
    }

    if (!s.lastRulePass && s.cycle > 1) {
      s.relationIndex = (s.relationIndex + 1) % 5;
      s.matrix = nextSimpleMatrix(s.matrix);
      s.operator = "DOMAIN_PIVOT";
      s.lastEvent = "PIVOT";
      if (s.matrix === "STACCATO") {
        s.staccatoWidth = Math.max(2, Math.min(8, s.staccatoWidth + (s.cycle % 2 === 0 ? 1 : -1)));
      }
      this.advanceTarget(text);
      return;
    }

    if (s.simStruct > SHELL_STRUCT && s.simSemantic < SHELL_SEMANTIC && s.history.length >= 3) {
      s.operator = "SYMMETRY_SHIFT";
      s.matrix = nextSimpleMatrix(s.matrix);
      s.lastEvent = "SHIFT";
      this.advanceTarget(text);
      return;
    }

    if (s.tension === 3 && s.matrix === "PARADOX") {
      s.operator = "FAILURE_04";
      s.lastEvent = "FAILURE";
      this.advanceTarget(text);
      return;
    }

    if (s.cycle > 0 && s.cycle % 5 === 0 && this.maybePromote(text)) {
      s.operator = "SYMBOL_LEAP";
      s.lastEvent = "SHIFT";
      return;
    }

    s.operator = MUTATION_CYCLE[s.cycle % MUTATION_CYCLE.length]!;
    this.advanceTarget(text);
  }

  private shatter(operator: OperatorId): void {
    const s = this.state;
    s.shatterCount += 1;
    s.attractorDuration = 0;
    s.identicalStreak = 0;
    s.decayLevel = Math.min(10, s.decayLevel + 1);
    s.lastEvent = s.decayLevel >= 10 ? "REBIRTH" : "SHATTER";
    if (s.decayLevel >= 10) {
      s.decayLevel = 1;
      s.operator = "REBIRTH";
      s.lastEvent = "REBIRTH";
    } else {
      s.operator = operator;
    }
    s.matrix = nextSimpleMatrix(s.matrix);
    s.relationIndex = (s.relationIndex + 1) % 5;
    this.maybePromote(s.history[s.history.length - 1] ?? s.anchor);
  }

  private maybePromote(text: string): boolean {
    const s = this.state;
    const glyph = nextGlyph(s.symbols);
    if (!glyph) return false;
    const usedSources = new Set(s.symbols.map((x) => x.source));
    const source = mostFrequentContent(text, usedSources);
    if (!source) return false;
    s.symbols.push({
      glyph,
      role: nextRole(s.symbols.length),
      source,
      createdCycle: s.cycle,
      uses: 0,
      inheritance: [],
    });
    s.mutationLedger[source] = glyph;
    s.targetTerm = glyph;
    return true;
  }

  private advanceTarget(text: string): void {
    const s = this.state;
    const exclude = new Set(Object.keys(s.mutationLedger));
    const next = mostFrequentContent(text, exclude);
    if (next) s.targetTerm = next;
  }
}

function regimeOf(simStruct: number, simSemantic: number, cycle: number): RegimeId {
  if (cycle === 0) return "INIT";
  if (simStruct > 0.8 && simSemantic > 0.8) return "LOCK";
  if (simStruct > 0.8 && simSemantic < 0.5) return "SHELL";
  if (simStruct < 0.5 && simSemantic > 0.8) return "MEANING";
  return "DRIFT";
}

function tensionOf(shatterCount: number): 1 | 2 | 3 {
  if (shatterCount >= 4) return 3;
  if (shatterCount >= 2) return 2;
  return 1;
}

export function seedTarget(anchor: string): string {
  return contentTokens(anchor)[0] ?? anchor.split(/\s+/)[0] ?? "term";
}
