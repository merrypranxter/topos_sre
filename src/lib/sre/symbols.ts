import type { SymbolEntry, SymbolRole } from "./types.ts";

export const GLYPH_POOL = ["△", "▽", "□", "○", "Φ", "Ψ", "Ω", "∇", "†", "⌬", "⬡", "⟁"] as const;

const ROLES: SymbolRole[] = ["C", "O", "T"];

export function nextGlyph(existing: SymbolEntry[]): string | null {
  const used = new Set(existing.map((s) => s.glyph));
  return GLYPH_POOL.find((g) => !used.has(g)) ?? null;
}

export function nextRole(index: number): SymbolRole {
  return ROLES[index % ROLES.length]!;
}

export function evolveRoles(symbols: SymbolEntry[], cycle: number): SymbolEntry[] {
  return symbols.map((s) => {
    if (s.uses > 0 && s.uses % 5 === 0 && s.createdCycle !== cycle) {
      const i = ROLES.indexOf(s.role);
      return { ...s, role: ROLES[(i + 1) % ROLES.length]! };
    }
    return s;
  });
}

export function formatSymbolTable(symbols: SymbolEntry[]): string {
  if (symbols.length === 0) return "{}";
  const parts = symbols.map((s) => {
    const inherit = s.inheritance.length ? ` inherit=${s.inheritance.join("")}` : "";
    return `${s.glyph}:[${s.role} src=${s.source} c=${s.createdCycle} uses=${s.uses}${inherit}]`;
  });
  return `{${parts.join("; ")}}`;
}

export function mappingDict(ledger: Record<string, string>, symbols: SymbolEntry[]): Record<string, string> {
  const out: Record<string, string> = { ...ledger };
  for (const s of symbols) out[s.source] = s.glyph;
  return out;
}

export function formatMappings(map: Record<string, string>): string {
  const keys = Object.keys(map);
  if (keys.length === 0) return "{}";
  return `{${keys.map((k) => `${k}→${map[k]}`).join(", ")}}`;
}

export function compoundHint(symbols: SymbolEntry[]): string {
  if (symbols.length < 2) return "";
  const a = symbols[0]!;
  const b = symbols[1]!;
  return `${a.glyph}${b.glyph}=[${a.role}+${b.role}]`;
}

export function bootstrapStage(cycle: number, decayLevel: number, symbolCount: number): 1 | 2 | 3 {
  if (decayLevel >= 9 || (cycle >= 16 && symbolCount >= 3)) return 3;
  if (cycle >= 8 && symbolCount >= 1) return 2;
  return 1;
}
