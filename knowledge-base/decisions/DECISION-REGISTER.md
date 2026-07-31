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

- Status: `OPEN`
- Question: Is the existing Tether `creature.glb` the canonical pilot creature body, a prototype reference, or rejected?
- Blocks: Creature catalog, animation contract, visual target, and vertical-slice implementation.

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
