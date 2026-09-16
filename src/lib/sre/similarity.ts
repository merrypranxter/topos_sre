import { STOPWORDS } from "./lexicon.ts";
import { meanPairwise, structuralSimilarity } from "./levenshtein.ts";

const TOKEN_RE = /[\p{L}\p{N}∅△▽□○ΦΨΩ∇†⌬⬡⟁]+/gu;

export function tokenize(text: string): string[] {
  return (text.toLowerCase().match(TOKEN_RE) ?? []).filter(Boolean);
}

export function contentTokens(text: string): string[] {
  return tokenize(text).filter((t) => !STOPWORDS.has(t) && t.length > 1);
}

export function splitSentences(text: string): string[] {
  return text
    .split(/[\n.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function bagVector(tokens: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const t of tokens) m.set(t, (m.get(t) ?? 0) + 1);
  return m;
}

export function cosine(a: Map<string, number>, b: Map<string, number>): number {
  if (a.size === 0 && b.size === 0) return 1;
  if (a.size === 0 || b.size === 0) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const [k, va] of a) {
    na += va * va;
    const vb = b.get(k);
    if (vb) dot += va * vb;
  }
  for (const vb of b.values()) nb += vb * vb;
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

export function semanticSimilarity(a: string, b: string): number {
  return cosine(bagVector(contentTokens(a)), bagVector(contentTokens(b)));
}

export function meanPairwiseStructural(texts: string[]): number {
  if (texts.length < 2) return 0;
  const scores: number[] = [];
  for (let i = 0; i < texts.length; i++) {
    for (let j = i + 1; j < texts.length; j++) {
      scores.push(structuralSimilarity(texts[i]!, texts[j]!));
    }
  }
  return meanPairwise(scores);
}

export function meanPairwiseSemantic(texts: string[]): number {
  if (texts.length < 2) return 0;
  const scores: number[] = [];
  for (let i = 0; i < texts.length; i++) {
    for (let j = i + 1; j < texts.length; j++) {
      scores.push(semanticSimilarity(texts[i]!, texts[j]!));
    }
  }
  return meanPairwise(scores);
}

export function contentDensity(text: string): number {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return 0;
  const counts = sentences.map((s) => contentTokens(s).length);
  return counts.reduce((a, b) => a + b, 0) / sentences.length;
}

export function termFrequency(text: string, term: string): number {
  const tokens = tokenize(text);
  if (tokens.length === 0 || !term) return 0;
  const needle = term.toLowerCase();
  const hits = tokens.filter((t) => t === needle || t.includes(needle)).length;
  return hits / tokens.length;
}

export function mostFrequentContent(text: string, exclude: Set<string> = new Set()): string {
  const tokens = contentTokens(text).filter((t) => !exclude.has(t) && t.length > 2);
  if (tokens.length === 0) return "";
  const counts = bagVector(tokens);
  let best = "";
  let n = 0;
  for (const [k, v] of counts) {
    if (v > n) {
      best = k;
      n = v;
    }
  }
  return best;
}

export function sentenceWordCounts(text: string): number[] {
  return splitSentences(text).map((s) => tokenize(s).length);
}
