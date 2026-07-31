# Claude Intake 001

Status: `PROPOSED FOR SYNTHESIS`

## Provenance note

Written directly by Claude Code (local filesystem + git access to `Dutchthenomad/vpet-game` and `Dutchthenomad/tether-project`), not forwarded from another chat. This supersedes the `FORWARDED`-only claims in `USER-FORWARDED-CLAUDE-REPORT-001.md` with directly fetched evidence. All commit SHAs below are the `main`-branch HEAD at verification time: `vpet-game@0166f64`, `tether-project@b46640d`.

## 1. Tether — verified facts

- `VERIFIED` `creature.glb`: 20,835 triangles, 17,517 vertices, 1 skin, 24 joints, 1 material (OPAQUE, double-sided), sha256 `b4e7a6c1...62b866d`.
  Source: `tether/character/manifest.json` @ `tether-project:b46640d`, corroborated by `tether/character/README.md:32` and `tether/docs/CHARACTER_TRANSFER.md:42-43`.
- `VERIFIED` Palette: reference video/decision locked teal creature (`#51787d` albedo) against a warm-orange accretion-disk key light on charcoal basalt.
  Source: `tether/docs/DECISIONS.md:19-22,63-68` (decision D3) and `tether/character/manifest.json:107-108` @ `tether-project:b46640d`.
- `VERIFIED` Chest honeycomb is the coherence meter and is the **only** HUD element the design permits (no on-screen numeric HUD).
  Source: `tether/character/manifest.json:86-92`, `tether/character/README.md:91-92`, `tether/character/creature.js:106` @ `tether-project:b46640d`.
- `CORRECTION` (was `FORWARDED` as "animation clip IDs are defined and should be inventoried before any new animation contract is authored"): the mesh has exactly **one** baked animation clip (`Armature|clip0|baselayer`), and the runtime explicitly does not use baked clips — `public/creature.js:1` states "runtime bone driving, no baked clips." There is no multi-clip animation contract to inventory; treat the prior claim as stale/incorrect.
  Source: `tether/character/manifest.json:32`, `tether/public/creature.js:1` @ `tether-project:b46640d`.

## 2. PROTO-MON / V-Pet — verified facts

- `VERIFIED` Bootstrap commit `440eac50eea10063c7606277fb9c359ca36b4145` exists on `main` and is the repo's second commit (engine/content split established here).
  Source: `git log` on `Dutchthenomad/vpet-game`.
- `VERIFIED` Battle resolution is deterministic, no RNG: `ATTACK deals ATK+charge×3`, `DEFEND blocks BLOCK`, `CHARGE` banks power (interrupted by an attack), simultaneous reveal resolved identically on both devices.
  Source: `prototype/vpet-battle-harness.jsx:44,395` @ `vpet-game:0166f64`.
- `VERIFIED` Three Perfect-stage (terminal) outcomes exist in the shipping content model: **Titanore, Beadle, Cuddloth**.
  Source: `prototype/vpet-game-prototype.jsx:35-37` and `DESIGN-BRIEF.md:56` @ `vpet-game:0166f64`.
- `RECONSTRUCTED` (was `FORWARDED` as literal formula `elapsed = now - lastTick`): the spec mandates advancing time from a stored `lastTick` timestamp on resume ("catch-up simulation"), not a foreground loop — `design/spec/game-spec-v1.md:37,239`. The current Stage-3 prototype (`prototype/vpet-care-engine.jsx`) implements the same minute-stepped `simulate()` path for both live tick and "away" jumps, but its own header comment says it has **no persistence** ("artifact limit") — the "Away for" buttons stand in for real elapsed-time reads. So the pattern is real and spec'd, but the exact `now - lastTick` line doesn't exist in code yet; it's an implementation detail still to be written.
  Source: `design/spec/game-spec-v1.md:37,239`; `prototype/vpet-care-engine.jsx:4-11` @ `vpet-game:0166f64`.
- `VERIFIED` The Adult→Perfect gate is explicitly **stochastic**, separate from the deterministic battle math above: "Not guaranteed even when met — a failed roll leaves the pet stuck at Adult until lifespan ends. Keep this stochastic gate; it's core to the mystery."
  Source: `design/spec/game-spec-v1.md:186` @ `vpet-game:0166f64`. This nuance matters for DEC-005 below — combat is deterministic, but promotion past Adult is not.
- `VERIFIED`, new finding not in ChatGPT's intake: the repo deliberately runs **two rosters**. `design/spec/game-spec-v1.md`, `design/visual-reference.md`, and the Stage 2/3 testbeds (`prototype/vpet-evolution-testbed.jsx`, `prototype/vpet-care-engine.jsx`) use the literal 1997 Digital Monster Ver.1 roster and evolution tree (Botamon → Koromon → Agumon/Betamon → ... → MetalGreymon/Mamemon/Monzaemon) as a **mechanics-accuracy reference**, explicitly disclosed in `DESIGN-BRIEF.md:52`: "Ship the original roster, not the reference one." The actual shipping roster is original IP: Mochi → Pyx → {Emberling|Frillfin} → seven Adults → three Perfects (Titanore/Beadle/Cuddloth), defined in `design/asset-manifest.md:5-15` and `DESIGN-BRIEF.md:56`.
  Why this matters for synthesis: it's easy to misread the testbed/spec files as the intended shipping content (they use trademarked names throughout) and either flag a false IP alarm or, worse, accidentally promote a testbed roster into `canonical/`. Recommend the collaboration protocol's hard-rules section get an explicit line about this split so neither model nor a local coding agent conflates them.

## 3. Specimen-lab — could not verify

- `UNRESOLVED` No repository matching "specimen lab," a 22-character mulberry32 genome, seven sockets, or geometry-derived stats was found — searched all 60 repositories under the `Dutchthenomad` GitHub account (`gh repo list`) by name/description, and grepped `~/Projects` and known local clones for `mulberry32`, `specimen`, `genome`, `socket`. `mulberry32` does appear as a generic seeded-RNG utility in `tether-project:tether/public/physics.js:80` and `tether/reference/event-horizon-escape/js/game.js`, but neither implements a genome/socket system — these are unrelated uses of the same well-known PRNG algorithm.
- Per the no-fabrication rule, none of the specimen-lab claims in `USER-FORWARDED-CLAUDE-REPORT-001.md` are promoted here. Added to the source-inventory queue below — need the actual repo name/URL from the project owner, or confirmation this only exists in unarchived conversation memory.

## 4. Conflicts / additions to ChatGPT intake (`CHATGPT-INTAKE-001.md`)

- No direct factual conflicts found. ChatGPT's proposed MVP boundary ("three adult outcomes") is actually already-shipped fact, not just a proposal — see §2 above (Titanore/Beadle/Cuddloth already exist in `prototype/vpet-game-prototype.jsx`).
- SYN-003 (reuse of PROTO-MON/V-Pet mechanics): ChatGPT's position — "preserve the deterministic engine and narrow care/evolution foundation; replace content and presentation" — matches the repo's own documented design exactly (engine/content split in `CLAUDE.md`, Digimon-reference-vs-Mochi-shipping split in `DESIGN-BRIEF.md:52`). Recommend moving SYN-003 to `CONSENSUS`.

## 5. Proposed canonical rules

- `PROPOSED` Add to `knowledge-base/README.md` hard rules: "The Digimon Ver.1 names appearing in `design/spec/game-spec-v1.md`, `design/visual-reference.md`, and the Stage 2/3 testbeds are a mechanics-accuracy reference only (see `DESIGN-BRIEF.md:52`) and must never be promoted into `canonical/` or shipped content. The shipping roster is Mochi/Pyx/Emberling/Frillfin/... per `design/asset-manifest.md`."

## 6. Unresolved decisions (repository-informed)

- DEC-005 (adult outcomes): repository evidence shows Titanore/Beadle/Cuddloth are already implemented as the shipping three Perfect outcomes, not a green-field choice. The open question is narrower than the register currently states — it's whether to keep these three as-is for the Holographic Digital Pet reskin, or reinterpret/rename them, not whether to invent new ones from scratch.
- DEC-004 (public MVP death model): `design/spec/game-spec-v1.md`'s pillar #1 is unconditional permadeath, and the engine/content split makes death an ENGINE-layer rule per `CLAUDE.md`. Any decision to soften this for the Holographic Digital Pet MVP is an explicit deviation from the current engine contract, not a content-layer tweak — flagging so the owner treats it as an ENGINE-touching decision.

## 7. Source-inventory queue (could not access)

- Specimen-lab repository: name/URL unknown; not found locally or on the `Dutchthenomad` GitHub account as of this intake.
