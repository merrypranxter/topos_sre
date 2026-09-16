/** Capability-loss spectrum. Communicated as hard constraints, never as mood. */
export function decayConstraint(dl: number): string {
  const level = Math.min(10, Math.max(1, dl));
  switch (level) {
    case 1:
    case 2:
      return `DL_${level} | adjectives and adverbs are not permitted`;
    case 3:
    case 4:
      return `DL_${level} | only simple subject-verb-object clauses; subordinators (because, although, which, while) are not permitted`;
    case 5:
    case 6:
      return `DL_${level} | present-tense verbs are not permitted; actions use past or future only`;
    case 7:
    case 8:
      return `DL_${level} | no token may exceed 4 letters except glyphs in SYMBOL_TABLE`;
    case 9:
      return `DL_9 | nouns are not permitted; verbs and glyphs only`;
    case 10:
      return `DL_10 | alphanumeric tokens are not permitted; punctuation, whitespace, and glyphs only`;
    default:
      return `DL_${level}`;
  }
}
