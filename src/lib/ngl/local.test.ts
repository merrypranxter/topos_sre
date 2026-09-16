import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HardLogicController } from "../sre/hlc.ts";
import { containsForbidden } from "../sre/lexicon.ts";
import { matrixCompliance } from "../sre/matrices.ts";
import { executeOpBlock } from "./local.ts";

describe("onboard NGL", () => {
  it("emits STACCATO sentences of the required width", () => {
    const hlc = HardLogicController.ignite("the hand holds the cup");
    const text = executeOpBlock(hlc.opBlock(), 0.7);
    assert.ok(text.length > 0);
    assert.equal(containsForbidden(text).length, 0);
    assert.equal(matrixCompliance(hlc.state, text), true);
  });

  it("applies mappings from the OP_BLOCK", () => {
    const hlc = HardLogicController.ignite("hand holds cup");
    hlc.state.mutationLedger = { hand: "△" };
    const text = executeOpBlock(hlc.opBlock(), 0.4);
    assert.match(text, /△/);
    assert.doesNotMatch(text, /\bhand\b/);
  });

  it("runs a closed loop without emptying OUTPUT_STATE", () => {
    const hlc = HardLogicController.ignite("What are you?");
    const seen = new Set<string>();
    for (let i = 0; i < 8; i++) {
      const out = executeOpBlock(hlc.opBlock(), 0.9);
      assert.ok(out.trim().length > 0, `empty at cycle ${i}`);
      hlc.ingest(out);
      seen.add(out);
    }
    assert.equal(hlc.state.cycle, 8);
    assert.ok(seen.size >= 2, "loop collapsed to a single output");
  });
});
