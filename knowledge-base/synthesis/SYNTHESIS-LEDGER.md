# Synthesis Ledger

This file tracks cross-model agreements, conflicts, and promotion status.

## Entry format

### SYN-000

- Topic:
- ChatGPT position:
- Claude position:
- Evidence:
- Status: `OPEN | CONSENSUS | OWNER DECISION REQUIRED | PROMOTED | REJECTED`
- Canonical target:

## Current entries

### SYN-001

- Topic: Active creature concept.
- ChatGPT position: Holographic Digital Pet fully replaces the Void design.
- Claude position: Awaiting verified intake.
- Evidence: Direct owner instruction.
- Status: `CONSENSUS EXPECTED`
- Canonical target: `canonical/PROJECT-CHARTER.md`

### SYN-002

- Topic: Existing Tether asset as canonical pilot.
- ChatGPT position: Unresolved; likely high-value candidate, but must be compared against owner intent and asset evidence.
- Claude position: Tether mesh/palette/coherence-meter details independently verified against the live `tether-project` repo (see `CLAUDE-INTAKE-001.md` §1). One prior forwarded claim (defined multi-clip animation IDs) was found incorrect — the rig has exactly one baked clip and the runtime doesn't use baked clips at all.
- Owner decision (2026-07-31): `tether-project` is a standalone side exploration, not connected to the core system. Only the creature asset (`creature.glb` + rig) carries over; the rest of `tether-project` (physics, game modes, UI, code) is out of scope. Recorded as `DEC-003`.
- Evidence: `tether/character/manifest.json`, `tether/character/README.md`, `tether/docs/DECISIONS.md`, `tether/public/creature.js` @ `tether-project:b46640d`.
- Status: `PROMOTED` — resolved by `DEC-003`.
- Canonical target: `canonical/CREATURE-CATALOG.md`

### SYN-003

- Topic: Reuse of PROTO-MON/V-Pet mechanics.
- ChatGPT position: Preserve the deterministic engine and narrow care/evolution foundation; replace content and presentation.
- Claude position: Confirms this matches the repository's own documented design exactly — no-RNG battle math (`prototype/vpet-battle-harness.jsx`), spec-mandated `lastTick`-based catch-up (implementation not yet written), three existing Perfect-stage outcomes (Titanore/Beadle/Cuddloth), and a deliberate engine/content split (`CLAUDE.md`) with a separately-documented Digimon-reference-vs-Mochi-shipping roster split (`DESIGN-BRIEF.md:52`) that keeps mechanics reference material out of shipped content already.
- Evidence: `prototype/vpet-battle-harness.jsx:44,395`; `prototype/vpet-game-prototype.jsx:35-37`; `design/spec/game-spec-v1.md:37,186,239`; `DESIGN-BRIEF.md:52,56`; `design/asset-manifest.md:5-15` @ `vpet-game:0166f64`. Full detail in `CLAUDE-INTAKE-001.md` §2.
- Status: `CONSENSUS`
- Canonical target: `canonical/GAMEPLAY-CONTRACT.md` and catalog files.

### SYN-004

- Topic: Specimen-lab procedural genome work.
- ChatGPT position: Treat as R&D evidence; do not automatically promote complex procedural geometry into MVP.
- Claude position: Could not locate a specimen-lab repository anywhere in the `Dutchthenomad` GitHub account (60 repos checked) or on the local machine. The seven-sockets/22-character-mulberry32-genome/~90%-noise claims remain unverified and are not promoted. `mulberry32` does exist elsewhere in the ecosystem (`tether-project:tether/public/physics.js`) but only as a generic seeded RNG, unrelated to any genome system.
- Evidence: `gh repo list Dutchthenomad`; local grep across `~/Projects`. See `CLAUDE-INTAKE-001.md` §3 and §7 (source-inventory queue).
- Status: `OPEN` — blocked on the owner supplying the actual repo name/URL, or confirming this is unarchived conversation memory only.
- Canonical target: `canonical/GENETICS-CATALOG.md` or archive.

### SYN-005

- Topic: Digimon-reference-roster vs. Mochi-shipping-roster split is undocumented in the shared knowledge-base itself.
- ChatGPT position: Not previously raised.
- Claude position: `design/spec/game-spec-v1.md`, `design/visual-reference.md`, and the Stage 2/3 testbeds use the literal 1997 Digital Monster Ver.1 roster as a mechanics-accuracy reference; `DESIGN-BRIEF.md:52` already forbids shipping it and names the real roster (Mochi/Pyx/Emberling/Frillfin/...). Risk: a model or local agent reading only the spec/testbed files (not `DESIGN-BRIEF.md`) could misread the reference roster as canon. Proposes adding an explicit line to `knowledge-base/README.md` hard rules calling this out.
- Evidence: `DESIGN-BRIEF.md:52,56`; `design/asset-manifest.md:5-15`; `design/spec/game-spec-v1.md:3`; `prototype/vpet-evolution-testbed.jsx:1-10` @ `vpet-game:0166f64`.
- Status: `OWNER DECISION REQUIRED` — whether to add the proposed hard-rule line.
- Canonical target: `knowledge-base/README.md`
