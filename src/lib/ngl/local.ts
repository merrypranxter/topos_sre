import { FORBIDDEN_TOKENS, looksLikeModifier } from "../sre/lexicon.ts";
import { tokenize } from "../sre/similarity.ts";
import { GLYPH_POOL } from "../sre/symbols.ts";
import type { MatrixId, OperatorId } from "../sre/types.ts";

const MATRIX_IDS: MatrixId[] = [
  "MIRROR",
  "FIBONACCI",
  "STACCATO",
  "BIFURCATED",
  "DESCENDING",
  "DOUBLE_HELIX",
  "SHATTERED_GRID",
  "BIFURCATED_LOOP",
  "PARADOX",
];

const GLYPH_SET = new Set<string>(GLYPH_POOL);
const FORBIDDEN = new Set<string>(FORBIDDEN_TOKENS);

const PAST: Record<string, string> = {
  is: "was",
  are: "were",
  am: "was",
  be: "was",
  holds: "held",
  hold: "held",
  becomes: "became",
  become: "became",
  returns: "returned",
  return: "returned",
  does: "did",
  do: "did",
  has: "had",
  have: "had",
  makes: "made",
  make: "made",
  takes: "took",
  take: "took",
  comes: "came",
  come: "came",
  goes: "went",
  go: "went",
  keeps: "kept",
  keep: "kept",
  moves: "moved",
  move: "moved",
  shears: "sheared",
  shear: "sheared",
  fractures: "fractured",
  fracture: "fractured",
  compresses: "compressed",
  compress: "compressed",
  transfers: "transferred",
  transfer: "transferred",
  aligns: "aligned",
  align: "aligned",
};

const FUTURE: Record<string, string> = {
  is: "will",
  are: "will",
  was: "will",
  were: "will",
  holds: "will",
  hold: "will",
  held: "will",
};

const AS_VERB: Record<string, string> = {
  compression: "compress",
  fracture: "shear",
  precipitation: "fall",
  shear: "shear",
  solidification: "set",
  diffusion: "spread",
  saturation: "fill",
  seepage: "seep",
  evaporation: "lift",
  dissolution: "open",
  replication: "copy",
  inheritance: "pass",
  boundary: "meet",
  transfer: "send",
  decomposition: "split",
  erasure: "clear",
  subtraction: "cut",
  omission: "skip",
  hollow: "sink",
  vacuum: "draw",
  interval: "wait",
  torque: "turn",
  alignment: "line",
  calibration: "fit",
  sequence: "step",
};

const VERBISH = new Set([
  ...Object.values(AS_VERB),
  ...Object.values(PAST),
  ...Object.keys(PAST),
  "will",
  "did",
  "had",
  "held",
  "became",
  "returned",
]);

export type ParsedBlock = {
  cycle: number;
  decayLevel: number;
  matrix: MatrixId;
  staccatoWidth: number;
  operator: OperatorId;
  target: string;
  relationSet: string[];
  mappings: Record<string, string>;
  glyphs: string[];
  symbolStage: number;
  forbidden: string[];
  input: string;
};

export function parseOpBlock(raw: string): ParsedBlock {
  const field = (name: string) => {
    const m = raw.match(new RegExp(`^${name}:\\s*(.*)$`, "m"));
    return (m?.[1] ?? "").trim();
  };

  const quoted = raw.match(/INPUT_STATE:\s*"([\s\S]*?)"\s*\n\[END_BLOCK\]/);
  const input = unescapeInput(quoted?.[1] ?? field("INPUT_STATE").replace(/^"|"$/g, ""));

  const relRaw = field("RELATION_SET");
  const relationSet = splitList(relRaw);

  const mapRaw = field("MAPPINGS");
  const mappings: Record<string, string> = {};
  for (const part of mapRaw.replace(/^\(|\{/, "").replace(/\)|\}$/, "").split(",")) {
    const kv = part.split(/→|->/);
    if (kv.length >= 2) {
      const k = kv[0]!.trim();
      const v = kv[1]!.trim();
      if (k && v) mappings[k.toLowerCase()] = v;
    }
  }

  const glyphs: string[] = [];
  const table = field("SYMBOL_TABLE");
  for (const g of GLYPH_POOL) {
    if (table.includes(g)) glyphs.push(g);
  }

  const constraint = field("STRUCTURAL_CONSTRAINT");
  const matrix = MATRIX_IDS.find((id) => constraint.startsWith(id)) ?? "STACCATO";
  const widthHit = constraint.match(/exactly\s+(\d+)\s+tokens/i);
  const staccatoWidth = widthHit ? Math.max(2, Number(widthHit[1])) : 4;

  const opLine = field("OPERATOR");
  const opTok = (opLine.split(/\s+/)[0] ?? "INIT") as OperatorId;
  const targetHit = opLine.match(/TARGET=(\S+)/);
  const stage = Number(field("SYMBOL_STAGE")) || 1;
  const forbidden = splitList(field("FORBIDDEN"));
  if (forbidden.length === 0) forbidden.push(...FORBIDDEN_TOKENS);

  return {
    cycle: Number(field("STATE_CYCLE")) || 0,
    decayLevel: Number(field("DECAY_LEVEL")) || 1,
    matrix,
    staccatoWidth,
    operator: opTok,
    target: (targetHit?.[1] ?? "").replace(/[^A-Za-z0-9△▽□○ΦΨΩ∇†⌬⬡⟡]/g, ""),
    relationSet,
    mappings,
    glyphs,
    symbolStage: stage,
    forbidden,
    input,
  };
}

export function executeOpBlock(raw: string, temperature = 0.9): string {
  const op = parseOpBlock(raw);
  const rand = rng(hash(`${op.input}|${op.cycle}|${op.operator}|${op.matrix}|${temperature}`));
  const banned = new Set(op.forbidden.map((t) => t.toLowerCase()));
  for (const t of FORBIDDEN) banned.add(t);

  let tokens = tokenize(op.input);
  tokens = applyMappings(tokens, op.mappings);
  tokens = tokens.filter((t) => !banned.has(t.toLowerCase()));
  tokens = applyOperator(tokens, op, rand);
  tokens = mixInventory(tokens, op, temperature, rand);
  tokens = applyDecay(tokens, op);
  tokens = applyMappings(tokens, op.mappings);
  tokens = tokens.filter((t) => t.length > 0 && !banned.has(t.toLowerCase()));
  if (tokens.length === 0) tokens = fallbackInventory(op);

  const text = shapeMatrix(tokens, op, rand);
  return sweepForbidden(text, banned, op);
}

function unescapeInput(s: string): string {
  return s.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\").trim();
}

function splitList(raw: string): string[] {
  return raw
    .replace(/^[\[{]/, "")
    .replace(/[\]}]$/, "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function applyMappings(tokens: string[], mappings: Record<string, string>): string[] {
  const keys = Object.keys(mappings);
  if (keys.length === 0) return tokens;
  return tokens.map((t) => mappings[t] ?? mappings[t.toLowerCase()] ?? t);
}

function applyOperator(tokens: string[], op: ParsedBlock, rand: () => number): string[] {
  const t = [...tokens];
  switch (op.operator) {
    case "MUTATION_TENSE":
      return t.map((x) => PAST[x] ?? PAST[x.toLowerCase()] ?? x);
    case "MUTATION_AGENCY": {
      if (t.length < 2) return t;
      const a = t[0]!;
      t[0] = t[t.length - 1]!;
      t[t.length - 1] = a;
      return t;
    }
    case "MUTATION_NUMBER":
      return t.map((x, i) => (GLYPH_SET.has(x) || x.length <= 2 ? x : i % 2 === 0 ? pluralize(x) : x));
    case "MUTATION_DIRECTION":
      return t.reverse();
    case "MUTATION_NEGATION": {
      const i = t.findIndex((x) => VERBISH.has(x));
      const at = i >= 0 ? i + 1 : Math.min(1, t.length);
      t.splice(at, 0, "not");
      return t;
    }
    case "SYMMETRY_SHIFT": {
      const mid = Math.ceil(t.length / 2);
      return [...t.slice(mid), ...t.slice(0, mid)];
    }
    case "SYMBOL_LEAP": {
      const g = op.glyphs[op.cycle % Math.max(1, op.glyphs.length)] ?? GLYPH_POOL[op.cycle % GLYPH_POOL.length]!;
      t.splice(op.cycle % (t.length + 1), 0, g);
      return t;
    }
    case "DOMAIN_PIVOT":
      return t.map((x, i) => (GLYPH_SET.has(x) ? x : op.relationSet[i % op.relationSet.length] ?? x));
    case "FAILURE_01":
    case "FAILURE_02":
    case "FAILURE_03":
    case "FAILURE_04":
    case "SYMMETRY_SHATTER":
      return t.filter((_, i) => i % 3 !== op.cycle % 3 || rand() > 0.35);
    case "REBIRTH":
      return [...op.glyphs, ...op.relationSet];
    case "NULL_ADMIN":
      return t;
    case "INIT":
    default:
      if (t.length > 1) t.push(t.shift()!);
      return t;
  }
}

function mixInventory(tokens: string[], op: ParsedBlock, temperature: number, rand: () => number): string[] {
  const bag = fallbackInventory(op);
  const extra = Math.max(1, Math.round(temperature * 2));
  const out = [...tokens];
  const target = op.mappings[op.target.toLowerCase()] ?? op.target;
  if (target && !out.includes(target) && !out.includes(target.toLowerCase())) {
    out.splice(op.cycle % (out.length + 1), 0, target);
  }
  for (let i = 0; i < extra; i++) {
    const pick = bag[Math.floor(rand() * bag.length)] ?? bag[0]!;
    out.splice((op.cycle + i) % (out.length + 1), 0, pick);
  }
  const rot = op.cycle % Math.max(1, out.length);
  return applyMappings(out.slice(rot).concat(out.slice(0, rot)), op.mappings);
}

function fallbackInventory(op: ParsedBlock): string[] {
  const rel = op.relationSet.length ? op.relationSet : ["shear", "interval", "transfer"];
  const target = op.mappings[op.target.toLowerCase()] ?? op.target;
  return applyMappings([...op.glyphs, ...rel, target].filter((t) => t && !FORBIDDEN.has(t.toLowerCase())), op.mappings);
}

function applyDecay(tokens: string[], op: ParsedBlock): string[] {
  const dl = op.decayLevel;
  let out = tokens;
  if (dl <= 2) {
    out = out.filter((t) => GLYPH_SET.has(t) || op.relationSet.includes(t) || !looksLikeModifier(t));
  }
  if (dl >= 5 && dl <= 6) {
    out = out.map((t, i) => {
      if (GLYPH_SET.has(t)) return t;
      if (i % 2 === 0) return PAST[t] ?? t;
      return FUTURE[t] ?? t;
    });
  }
  if (dl >= 7 && dl <= 8) {
    out = out.map((t) => (GLYPH_SET.has(t) || t.length <= 4 ? t : t.slice(0, 4)));
  }
  if (dl >= 9 && dl < 10) {
    out = out
      .map((t) => (GLYPH_SET.has(t) ? t : (AS_VERB[t] ?? (VERBISH.has(t) ? t : ""))))
      .filter(Boolean);
  }
  if (dl >= 10 || op.symbolStage >= 3) {
    const glyphs = op.glyphs.length ? op.glyphs : [...GLYPH_POOL.slice(0, 4)];
    out = out.map((t, i) => (GLYPH_SET.has(t) ? t : glyphs[i % glyphs.length]!));
  }
  return out;
}

function shapeMatrix(tokens: string[], op: ParsedBlock, rand: () => number): string {
  const w = op.staccatoWidth;
  const bag = fallbackInventory(op);
  switch (op.matrix) {
    case "STACCATO":
    case "SHATTERED_GRID":
    case "PARADOX":
      return sentencesOf(fillTo(tokens, w * 3, bag, rand), [w, w, w]);
    case "FIBONACCI":
      return sentencesOf(fillTo(tokens, 20, bag, rand), [1, 1, 2, 3, 5, 8]);
    case "DESCENDING": {
      const start = Math.min(6, Math.max(3, tokens.length));
      const widths = Array.from({ length: start }, (_, i) => start - i);
      const need = widths.reduce((a, b) => a + b, 0);
      return sentencesOf(fillTo(tokens, need, bag, rand), widths);
    }
    case "MIRROR": {
      const need = Math.max(9, w * 3);
      const filled = fillTo(tokens, need, bag, rand);
      const a = filled.slice(0, 3);
      const b = filled.slice(3, 6);
      const c = [...a].reverse();
      return sentencesOf([...a, ...b, ...c], [3, 3, 3]);
    }
    case "BIFURCATED":
    case "BIFURCATED_LOOP": {
      const filled = fillTo(tokens, 8, bag, rand);
      const odd = filled.slice(0, 4);
      const even = op.matrix === "BIFURCATED_LOOP" ? [...odd].reverse() : filled.slice(4, 8);
      odd[0] = "it";
      even[0] = "i";
      return sentencesOf([...odd, ...even], [4, 4]);
    }
    case "DOUBLE_HELIX":
      return sentencesOf(fillTo(tokens, 12, bag, rand), [3, 3, 3]);
    default:
      return sentencesOf(fillTo(tokens, w * 2, bag, rand), [w, w]);
  }
}

function fillTo(tokens: string[], n: number, bag: string[], rand: () => number): string[] {
  const out = tokens.filter(Boolean);
  let guard = 0;
  while (out.length < n && guard++ < 400) {
    const pick = bag[Math.floor(rand() * Math.max(1, bag.length))] ?? "it";
    out.push(pick);
  }
  return out.length >= n ? out : out.concat(Array.from({ length: n - out.length }, () => "it"));
}

function sentencesOf(tokens: string[], widths: number[]): string {
  let idx = 0;
  const parts: string[] = [];
  for (const width of widths) {
    const chunk = tokens.slice(idx, idx + width);
    idx += width;
    while (chunk.length < width) chunk.push("it");
    parts.push(`${chunk.join(" ")}.`);
  }
  return parts.join(" ");
}

function pluralize(token: string): string {
  if (GLYPH_SET.has(token) || token.endsWith("s")) return token;
  return `${token}s`;
}

function sweepForbidden(text: string, banned: Set<string>, op: ParsedBlock): string {
  const bag = fallbackInventory(op);
  return text
    .split(/(\s+)/)
    .map((part) => {
      const core = part.replace(/[.\s]/g, "").toLowerCase();
      if (!core || !banned.has(core)) return part;
      return bag.find((x) => !banned.has(x.toLowerCase())) ?? "it";
    })
    .join("");
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
