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

## Animation state

The source GLB contains one baked clip named `Armature|clip0|baselayer`. The Tether runtime used procedural/runtime bone driving rather than a multi-clip baked animation library.

Therefore:

- No pre-existing multi-clip animation contract exists to inherit.
- A new animation contract must be authored for the V-Pet implementation.
- The 24-joint rig should be preserved unless a documented deformation or readability test demonstrates it is insufficient.

## Lifecycle mapping

The conventional egg stage is replaced by a recovery/reconstruction phase.

Working lifecycle IDs:

- `creature.genesis.recovery`
- `creature.genesis.juvenile`
- `creature.genesis.terminal_a`
- `creature.genesis.terminal_b`
- `creature.genesis.terminal_c`

The final names, visual differences, and whether existing Titanore/Beadle/Cuddloth outcomes are reinterpreted remain unresolved under `DEC-005`.

## Evidence

- `knowledge-base/decisions/DECISION-REGISTER.md`, DEC-003.
- `knowledge-base/intake/claude/CLAUDE-INTAKE-001.md`, section 1.
- `Dutchthenomad/tether-project` manifest and transfer documentation cited in that intake.
