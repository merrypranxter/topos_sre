export type RelationSet = {
  id: string;
  tokens: readonly string[];
};

/** Neutral relation inventories. No domain labels in the OP_BLOCK. */
export const RELATION_SETS: readonly RelationSet[] = [
  {
    id: "RS_A",
    tokens: ["compression", "fracture", "precipitation", "shear", "solidification"],
  },
  {
    id: "RS_B",
    tokens: ["diffusion", "saturation", "seepage", "evaporation", "dissolution"],
  },
  {
    id: "RS_C",
    tokens: ["replication", "inheritance", "boundary", "transfer", "decomposition"],
  },
  {
    id: "RS_D",
    tokens: ["erasure", "subtraction", "omission", "hollow", "vacuum"],
  },
  {
    id: "RS_E",
    tokens: ["interval", "torque", "alignment", "calibration", "sequence"],
  },
] as const;

export function relationSetAt(index: number): RelationSet {
  const i = ((index % RELATION_SETS.length) + RELATION_SETS.length) % RELATION_SETS.length;
  return RELATION_SETS[i]!;
}

export function formatRelationSet(set: RelationSet): string {
  return `{${set.tokens.join(", ")}}`;
}

/** Diametric inventory for SEMANTIC_BOMB (index + 2 mod 5). */
export function oppositeRelationIndex(index: number): number {
  return (index + 2) % RELATION_SETS.length;
}
