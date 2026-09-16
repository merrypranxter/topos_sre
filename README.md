# TOPOS-SRE

**Topological Semantic Recursion Engine — SRE-V3**

A two-layer closed-loop linguistic ecology. Not a chatbot. Not a roleplay.

- **HLC** (Hard-Logic Controller) — deterministic state machine. Measurements, ledgers, triggers.
- **NGL** (Neutral Generative Layer) — sterile executor of `[SRE_OP_BLOCK]`.

The hunt is a regime shift: a point where the generator can no longer satisfy the constraints in ordinary English and is forced into a synthetic shorthand in order to remain in the loop.

Repository: [github.com/merrypranxter/topos_sre](https://github.com/merrypranxter/topos_sre)

## Layout

```
src/lib/sre/          HLC engine (pure TypeScript, no network)
src/lib/ngl/          NGL server function (xAI chat)
src/store/            session + loop orchestration
src/components/       SRE-V3 dashboard
prompts/ngl-v1.txt    sterilized worker prompt
docs/ARCHITECTURE.md  machine spec
docs/HLC.md           controller contract
docs/NGL.md           worker contract
```

## Loop

1. Operator supplies an **anchor**.
2. HLC emits an `[SRE_OP_BLOCK]` (relation set, matrix, operator, mappings, decay).
3. NGL returns only `OUTPUT_STATE`.
4. HLC ingests the text, updates similarity / attractor / decay, emits the next block.
5. Repeat. Perturbations are optional shocks, not style instructions.

Do not tell the NGL to “do a better job.” Do not tell the HLC to “make it weirder.”

If the generative layer is quota-blocked, the HLC still runs. Paste an `OUTPUT_STATE` into the manual bridge and Feed.

## Local engine tests

Node 22+:

```
node --experimental-strip-types --test src/lib/sre/hlc.test.ts
```

or `npm test`.

## License

MIT
