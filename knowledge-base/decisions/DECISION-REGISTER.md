# Decision Register

Only the project owner can finalize product-level decisions unless authority is explicitly delegated.

## Status values

`OPEN | PROPOSED | APPROVED | REJECTED | SUPERSEDED`

## Decisions

### DEC-001 — Active pilot concept

- Status: `APPROVED`
- Decision: The Holographic Digital Pet replaces the prior Void design completely.
- Consequence: Active canonical files and future implementation content must not depend on Void assets, taxonomy, or terminology.

### DEC-002 — Shared knowledge substrate

- Status: `APPROVED`
- Decision: `knowledge-base/` inside `Dutchthenomad/vpet-game` is the shared durable workspace for ChatGPT, Claude, and local agents.
- Reason: Cross-assistant Google Drive visibility was unreliable; GitHub is directly accessible, versioned, and auditable.

### DEC-003 — Canonical pilot body

- Status: `APPROVED`
- Decision: `tether-project` is a standalone side exploration of additional game modes and is **not** connected to the core V-Pet/Holographic Digital Pet system. The **only** thing that carries over is the creature asset developed there — `tether/public/assets/creature.glb` (mesh + 24-joint rig, see `CLAUDE-INTAKE-001.md` §1) — which is adopted as the canonical pilot creature body. `tether-project`'s physics, game modes, UI, and code are out of scope for `vpet-game` and must not be treated as engine or gameplay reference.
- Source: direct owner instruction, project owner conversation, 2026-07-31 (Claude Code session) — captured here per the collaboration protocol's provenance rule for conversational memory.
- Consequence: `canonical/CREATURE-CATALOG.md`, the animation contract, and the visual target may cite the Tether creature asset and its manifest. They must not cite or depend on any other `tether-project` file (physics, controls, non-creature UI).
- Blocks (resolved): Creature catalog, animation contract, visual target, and vertical-slice implementation may now proceed on this basis.

### DEC-004 — Public MVP death model

- Status: `OPEN`
- Question: Does the first public vertical slice include permanent death, temporary collapse/recovery, or both through a configurable mode?
- Blocks: Lifecycle contract and save-state design.

### DEC-005 — Adult outcomes

- Status: `OPEN`
- Question: Retain the existing three Perfect-stage outcomes, reinterpret them for Holographic Digital Pet, or author three new adaptation outcomes?
- Blocks: Evolution catalog and asset scope.

### DEC-006 — Genetics depth

- Status: `OPEN`
- Question: Use a small deterministic trait genome for MVP, reuse the specimen-lab genome, or defer visible genetics entirely while preserving seeded variation?
- Blocks: Genetics catalog and procedural asset requirements.

### DEC-007 — Battle modes structure

- Status: `APPROVED` (split resolved; exact PvP mechanics still open — see Unresolved remainder below)
- Decision: The game supports two distinct battle contexts, not one:
  1. **Solo training/practice** — single-player, completable alone. This is the mode `CHATGPT-INTAKE-001.md` was gesturing at with its proposed "one deterministic single-player threat encounter."
  2. **PvP battles** — social, opt-in ("both players agree to battle"), following the original Digimon Tamagotchi V-pet two-device method. This is `CLAUDE.md`'s existing "Social battle" design pillar, preserved as-is for this mode specifically.
- Consequence: The two are not competing proposals and neither cancels the other. `CLAUDE.md`'s "Social battle" pillar applies to PvP; it does not forbid a separate solo training mode from existing alongside it. Resolves the conflict flagged during review of PR #2 (see `PROJECT-CHARTER.md` and `GAMEPLAY-CONTRACT.md` `REVIEW NOTE`s, PR #3).
- Source: direct owner instruction, project owner conversation, 2026-08-01 (Claude Code session) — captured per the collaboration protocol's provenance rule for conversational memory.
- Unresolved remainder: exact PvP mechanics (connection/agreement UX, whether it reuses the existing `ATTACK`/`DEFEND`/`CHARGE` harness as-is or evolves it, what "solo training" content/rewards look like) are explicitly **not yet defined** per the owner. Do not invent specifics — treat as `UNRESOLVED` pending further owner input.
- Blocks: Battle-model section of `GAMEPLAY-CONTRACT.md` (partially unblocked — mode split may be documented now; PvP mechanic details remain blocked).
