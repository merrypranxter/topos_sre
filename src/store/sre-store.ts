import { create } from "zustand";
import { persist } from "zustand/middleware";
import { executeOpBlock } from "@/lib/ngl/local";
import { HardLogicController } from "@/lib/sre/hlc";
import type { AuditEntry, CycleRecord, PerturbKind, SessionDump, StateRegister } from "@/lib/sre/types";

const AUTO_BURST = 8;

type SreStore = {
  state: StateRegister | null;
  tape: CycleRecord[];
  audit: AuditEntry[];
  currentBlock: string;
  lastOutput: string;
  pending: boolean;
  error: string | null;
  autoRemaining: number;
  temperature: number;
  manualDraft: string;
  ignite: (anchor: string) => void;
  step: () => Promise<void>;
  runBurst: () => Promise<void>;
  halt: () => void;
  ingestManual: (text: string) => void;
  perturb: (kind: PerturbKind, payload?: string) => void;
  setTemperature: (n: number) => void;
  setManualDraft: (s: string) => void;
  reset: () => void;
  exportSession: () => SessionDump | null;
};

function ingestOutput(get: () => SreStore, set: (p: Partial<SreStore>) => void, text: string) {
  const current = get().state;
  if (!current) return;
  const hlc = new HardLogicController(structuredClone(current));
  const blockBefore = hlc.opBlock();
  const audit = hlc.ingest(text);
  const rec: CycleRecord = {
    cycle: hlc.state.cycle,
    output: text,
    operator: hlc.state.operator,
    matrix: hlc.state.matrix,
    decayLevel: hlc.state.decayLevel,
    relationIndex: hlc.state.relationIndex,
    simStruct: hlc.state.simStruct,
    simSemantic: hlc.state.simSemantic,
    event: hlc.state.lastEvent,
    regime: hlc.state.lastRegime,
    rulePass: hlc.state.lastRulePass,
    opBlock: blockBefore,
  };
  set({
    state: hlc.state,
    currentBlock: hlc.opBlock(),
    lastOutput: text,
    tape: [...get().tape, rec],
    audit: [...get().audit, audit],
    error: null,
    manualDraft: "",
  });
}

export const useSreStore = create<SreStore>()(
  persist(
    (set, get) => ({
      state: null,
      tape: [],
      audit: [],
      currentBlock: "",
      lastOutput: "",
      pending: false,
      error: null,
      autoRemaining: 0,
      temperature: 0.9,
      manualDraft: "",

      ignite: (anchor) => {
        const hlc = HardLogicController.ignite(anchor);
        set({
          state: hlc.state,
          tape: [],
          audit: [],
          currentBlock: hlc.opBlock(),
          lastOutput: "",
          pending: false,
          error: null,
          autoRemaining: 0,
          manualDraft: "",
        });
      },

      step: async () => {
        const { state, currentBlock, pending, temperature } = get();
        if (!state || pending || !currentBlock) return;
        set({ pending: true, error: null });
        const text = executeOpBlock(currentBlock, temperature).trim();
        if (!text) {
          set({ pending: false, error: "NGL returned an empty OUTPUT_STATE.", autoRemaining: 0 });
          return;
        }
        ingestOutput(get, set, text);
        const remaining = get().autoRemaining;
        if (remaining > 1) {
          set({ autoRemaining: remaining - 1, pending: false });
          await get().step();
          return;
        }
        set({ pending: false, autoRemaining: 0 });
      },

      runBurst: async () => {
        if (!get().state || get().pending) return;
        set({ autoRemaining: AUTO_BURST });
        await get().step();
      },

      halt: () => set({ autoRemaining: 0 }),

      ingestManual: (text) => {
        const trimmed = text.trim();
        if (!get().state || !trimmed || get().pending) return;
        ingestOutput(get, set, trimmed);
      },

      perturb: (kind, payload) => {
        const current = get().state;
        if (!current) return;
        const hlc = new HardLogicController(structuredClone(current));
        hlc.applyPerturbation(kind, payload);
        set({ state: hlc.state, currentBlock: hlc.opBlock() });
      },

      setTemperature: (n) => set({ temperature: n }),
      setManualDraft: (s) => set({ manualDraft: s }),

      reset: () =>
        set({
          state: null,
          tape: [],
          audit: [],
          currentBlock: "",
          lastOutput: "",
          pending: false,
          error: null,
          autoRemaining: 0,
          manualDraft: "",
        }),

      exportSession: () => {
        const { state, tape, audit, currentBlock } = get();
        if (!state) return null;
        return {
          version: "SRE-V3",
          savedAt: new Date().toISOString(),
          state,
          tape,
          audit,
          currentBlock,
        };
      },
    }),
    {
      name: "topos-sre-v3",
      partialize: (s) => ({
        state: s.state,
        tape: s.tape,
        audit: s.audit,
        currentBlock: s.currentBlock,
        lastOutput: s.lastOutput,
        temperature: s.temperature,
      }),
    },
  ),
);

export const AUTO_BURST_SIZE = AUTO_BURST;
