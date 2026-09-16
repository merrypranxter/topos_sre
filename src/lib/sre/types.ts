export type SymbolRole = "C" | "O" | "T";

export type SymbolEntry = {
  glyph: string;
  role: SymbolRole;
  source: string;
  createdCycle: number;
  uses: number;
  inheritance: string[];
};

export type MatrixId =
  | "MIRROR"
  | "FIBONACCI"
  | "STACCATO"
  | "BIFURCATED"
  | "DESCENDING"
  | "DOUBLE_HELIX"
  | "SHATTERED_GRID"
  | "BIFURCATED_LOOP"
  | "PARADOX";

export type OperatorId =
  | "INIT"
  | "MUTATION_TENSE"
  | "MUTATION_AGENCY"
  | "MUTATION_NUMBER"
  | "MUTATION_DIRECTION"
  | "MUTATION_NEGATION"
  | "SYMMETRY_SHIFT"
  | "SYMBOL_LEAP"
  | "DOMAIN_PIVOT"
  | "FAILURE_01"
  | "FAILURE_02"
  | "FAILURE_03"
  | "FAILURE_04"
  | "SYMMETRY_SHATTER"
  | "REBIRTH"
  | "NULL_ADMIN";

export type EventId =
  | "NONE"
  | "ATTRACTOR_TICK"
  | "SHATTER"
  | "PIVOT"
  | "SHIFT"
  | "REBIRTH"
  | "FAILURE"
  | "BREACH"
  | "PERTURB";

export type RegimeId = "LOCK" | "SHELL" | "DRIFT" | "MEANING" | "INIT";

export type PerturbKind =
  | "SEMANTIC_BOMB"
  | "STRUCTURAL_GLITCH"
  | "SOMATIC_PARASITE"
  | "RECURSIVE_ECHO"
  | "SCARECROW";

export type StateRegister = {
  cycle: number;
  attractorDuration: number;
  lock: boolean;
  decayLevel: number;
  relationIndex: number;
  matrix: MatrixId;
  operator: OperatorId;
  tension: 1 | 2 | 3;
  anchor: string;
  mutationLedger: Record<string, string>;
  symbols: SymbolEntry[];
  history: string[];
  simStruct: number;
  simSemantic: number;
  lowDensityStreak: number;
  identicalStreak: number;
  highAnchorStreak: number;
  shatterCount: number;
  staccatoWidth: number;
  fibIndex: number;
  targetTerm: string;
  lastEvent: EventId;
  lastRulePass: boolean;
  lastRegime: RegimeId;
  perturbation: PerturbKind | null;
  pendingInputOverride: string | null;
};

export type CycleRecord = {
  cycle: number;
  output: string;
  operator: OperatorId;
  matrix: MatrixId;
  decayLevel: number;
  relationIndex: number;
  simStruct: number;
  simSemantic: number;
  event: EventId;
  regime: RegimeId;
  rulePass: boolean;
  opBlock: string;
};

export type AuditEntry = {
  cycle: number;
  rulePass: boolean;
  attractorDuration: number;
  regime: RegimeId;
  event: EventId;
  operator: OperatorId;
  note: string;
};

export type SessionDump = {
  version: "SRE-V3";
  savedAt: string;
  state: StateRegister;
  tape: CycleRecord[];
  audit: AuditEntry[];
  currentBlock: string;
};
