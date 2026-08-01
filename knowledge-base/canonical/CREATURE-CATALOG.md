# Creature Catalog — Canonical Pilot

Status: `CANONICAL DRAFT — ASSET BOUNDARY APPROVED`

## Canonical identity

- Working machine ID: `creature.genesis`
- Working project label: Holographic Digital Pet
- Species display name: `UNRESOLVED`
- Individual default name: player-defined or `UNRESOLVED`

## Canonical source asset

The pilot body is the creature asset developed in `Dutchthenomad/tether-project`:

- Source path: `tether/public/assets/creature.glb`
- Verified geometry: 20,835 triangles; 17,517 vertices.
- Rig: one skin; 24 joints.
- Material: one opaque, double-sided material.
- Verified asset hash prefix/suffix: `b4e7a6c1...62b866d`.

The asset and rig carry over. No other Tether subsystem carries over automatically.

## Prohibited dependency boundary

This catalog must not depend on:

- Tether physics.
- Paczyński–Wiita movement or orbital gameplay.
- Tether UI, controls, game modes, level design, or runtime code.
- Tether-specific environmental presentation except where separately approved as art reference.

## Resting phenotype

The ordinary creature presentation must communicate:

- Compact and approachable proportions.
- Clearly extraterrestrial anatomy.
- Strong eye-led emotional readability.
- Volumetric or reconstructed material behavior.
- Subtle instability, particles, or coherence artifacts.
- Physical presence inside the refuge rather than a flat overlay.

## Survival phenotype

The battle form is not a second unrelated character. It exposes latent structures and behaviors already present in the resting body.

Every survival feature must be:

- Foreshadowed in ordinary animation or silhouette.
- Rig-compatible or explicitly documented as an additive effect.
- Reversible after the threat state.
- Recognizable as the same cared-for organism.

Generic monster substitutions—random spikes, a dark recolor, arbitrary teeth, demonic styling, or unrelated model swaps—are prohibited.

## Existing asset facts that are not automatically canonical art direction

The Tether project verified a teal material, warm-orange environmental key light, and a chest honeycomb used as a coherence meter. These are valid source-asset facts, but their use in the Holographic Digital Pet presentation remains subject to the art-direction catalog.

The chest honeycomb is a high-value diegetic-interface candidate. It is not yet approved as the sole game HUD.

`REVIEW NOTE` (dependency boundary): the honeycomb's glow is not a static material property — in `tether-project` it is driven at runtime by a `uCoherence` shader uniform set from `character/creature.js` and `public/looks.js`, fed by Tether's own `game.coherence` state (`public/index.html:244,246,280`). `DEC-003` approved only `creature.glb`'s mesh and rig, and explicitly excludes all other Tether files, including this shader/behavior code. The static honeycomb geometry baked into the mesh is in scope; the coherence-driven shader behavior is not, and must be reimplemented against Holographic Digital Pet state if adopted, not imported from Tether.

## Animation state

The source GLB contains one baked clip named `Armature|clip0|baselayer`. The Tether runtime used procedural/runtime bone driving rather than a multi-clip baked animation library.

Therefore:

- No pre-existing multi-clip animation contract exists to inherit.
- A new animation contract must be authored for the V-Pet implementation.
- The 24-joint rig should be preserved unless a documented deformation or readability test demonstrates it is insufficient.

## Lifecycle mapping

`UNSUPPORTED — flagged in review, not evidenced`: the two claims below do not trace to `CLAUDE-INTAKE-001.md`, any `DEC-###`, or any `SYN-###` entry, and conflict with verified engine structure without recording that conflict as a decision:

- "The conventional egg stage is replaced by a recovery/reconstruction phase" — no cited source. The verified engine stage sequence is `EGG, BABY1, BABY2, CHILD, ADULT, PERFECT` (`design/spec/game-spec-v1.md`; `prototype/vpet-game-prototype.jsx:20`; `CLAUDE-INTAKE-001.md` §2). A rename/reframe of the first stage may be a reasonable content-layer choice, but it needs a decision-register entry, not silent assertion in a "CANONICAL DRAFT" doc.
- The working lifecycle IDs below collapse `BABY1/BABY2/CHILD/ADULT` (four verified engine stages) into a single `juvenile` ID. That is a structural simplification of the six-stage engine this same PR's `GAMEPLAY-CONTRACT.md` says must be "preserved unless an owner decision explicitly replaces it." Either restore a per-stage ID scheme or record the collapse as an explicit decision with its own evidence.

Working lifecycle IDs (revise per the note above before treating as canonical):

- `creature.genesis.recovery`
- `creature.genesis.juvenile`
- `creature.genesis.terminal_a`
- `creature.genesis.terminal_b`
- `creature.genesis.terminal_c`

The final names, visual differences, and whether existing Titanore/Beadle/Cuddloth outcomes are reinterpreted remain unresolved under `DEC-005`.

## Evidence

- `knowledge-base/decisions/DECISION-REGISTER.md`, DEC-003.
- `knowledge-base/intake/claude/CLAUDE-INTAKE-001.md`, section 1.
- `knowledge-base/synthesis/SYNTHESIS-LEDGER.md`, SYN-002 (`PROMOTED`).
- `Dutchthenomad/tether-project` manifest and transfer documentation cited in that intake.
- No source is cited for "Lifecycle mapping" — see review note in that section; this is a gap, not an oversight to silently fix.
