import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HardLogicController } from "./hlc.ts";
import { structuralSimilarity } from "./levenshtein.ts";
import { semanticSimilarity } from "./similarity.ts";
import { formatOpBlock } from "./op-block.ts";

describe("structuralSimilarity", () => {
  it("is 1 for identical strings", () => {
    assert.equal(structuralSimilarity("abc", "abc"), 1);
  });
  it("is 0 for disjoint equal-length", () => {
    assert.equal(structuralSimilarity("aaa", "bbb"), 0);
  });
});

describe("semanticSimilarity", () => {
  it("matches shared content tokens", () => {
    const s = semanticSimilarity("compression of the stone", "stone compression");
    assert.ok(s > 0.9);
  });
});

describe("HardLogicController", () => {
  it("ignites with cycle 0 and an OP_BLOCK", () => {
    const hlc = HardLogicController.ignite("the hand holds the cup");
    assert.equal(hlc.state.cycle, 0);
    assert.equal(hlc.state.decayLevel, 1);
    const block = hlc.opBlock();
    assert.match(block, /\[SRE_OP_BLOCK\]/);
    assert.match(block, /RELATION_SET:/);
    assert.doesNotMatch(block, /Biological|Crystalline|Clockwork/);
  });

  it("increments cycle and computes sims on ingest", () => {
    const hlc = HardLogicController.ignite("hand holds cup");
    hlc.ingest("hand holds cup. cup becomes vessel. vessel returns hand.");
    assert.equal(hlc.state.cycle, 1);
    assert.equal(hlc.state.history.length, 1);
  });

  it("detects attractor lock after repeated near-identical outputs", () => {
    const hlc = HardLogicController.ignite("grid");
    const line = "click click click click";
    for (let i = 0; i < 3; i++) hlc.ingest(line);
    assert.ok(hlc.state.simStruct > 0.95);
    assert.ok(hlc.state.attractorDuration >= 1);
  });

  it("shatters after twelve attractor ticks", () => {
    const hlc = HardLogicController.ignite("grid");
    const line = "click click click click";
    for (let i = 0; i < 14; i++) hlc.ingest(line);
    assert.ok(hlc.state.shatterCount >= 1);
  });

  it("keeps OP_BLOCK free of domain labels", () => {
    const hlc = HardLogicController.ignite("What are you?");
    const block = formatOpBlock(hlc.state);
    assert.doesNotMatch(block, /Biological|Crystalline|Clockwork|Organic/);
    assert.match(block, /RELATION_SET: \{compression/);
  });
});
