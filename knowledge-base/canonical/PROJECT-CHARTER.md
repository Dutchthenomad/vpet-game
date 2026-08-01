# Project Charter — Holographic Digital Pet

Status: `CANONICAL DRAFT — SETTLED SCOPE ONLY`

## Product thesis

A deterministic virtual-pet game about maintaining a genuine living extraterrestrial organism reconstructed from information escaping a black-hole event horizon and sustained inside a phone-linked artificial refuge.

The pet is not an AI assistant, software mascot, decorative hologram, or simulated animal. “Holographic” describes the reconstructed volumetric body and observation interface, not an illusion.

## Active product identity

- The Holographic Digital Pet fully replaces the prior Void design.
- The existing `vpet-game` engine and care/evolution foundation are retained where compatible.
- Content, lore, art direction, creature identity, and presentation are replaced or reinterpreted for the Holographic Digital Pet.
- `tether-project` is not a gameplay or engine dependency. Only its creature asset and rig are adopted.

## MVP objective

The first vertical slice must prove:

1. The pet feels alive rather than merely animated.
2. Care creates attachment and visible behavioral change.
3. The habitat feels like a real contained space rather than a menu.
4. The same event history produces the same simulation and battle result.
5. The familiar social phenotype and terrifying survival phenotype remain recognizably the same organism.
6. A complete recovery-to-terminal-form lifecycle can be played without blockchain, accounts, or network services.

`REVIEW NOTE`: item 4 states battle results are reproducible from event history, which is verified engine fact (`CLAUDE-INTAKE-001.md` §2). It does not state whether battles remain the existing two-device social system — `CLAUDE.md`'s "Social battle" pillar ("battles require two devices") is a recorded engine pillar that this charter neither confirms nor waives. `CHATGPT-INTAKE-001.md`'s proposed MVP boundary separately floats "one deterministic single-player threat encounter" (`PROPOSED`, not decided). These two are in tension and this charter does not say which governs. Needs an explicit decision (new DEC-### or a SYN entry), not silence.

## Platform boundary

- Browser-first.
- Desktop target with responsive mobile-browser testing.
- Local save state.
- No wallet, account, blockchain, or server dependency for the vertical slice.

## Included foundation

`VERIFIED` / decided by an approved `DEC-###` (see Evidence):

- Real-time care simulation.
- Catch-up simulation from a stored timestamp on resume.
- Engine/content separation.
- Deterministic battle resolution.
- Hidden evolution criteria.
- One pilot creature body (`DEC-003`).
- Three terminal developmental outcomes (identity unresolved, `DEC-005`).
- Meaningful post-battle consequences (verified as the winner's permanent +1 ATK for the session, `prototype/vpet-battle-harness.jsx:395`).

`PROPOSED`, not yet synthesized or decided — do not treat as settled:

- One refuge environment. This traces only to `CHATGPT-INTAKE-001.md`'s "Proposed MVP boundary" section (labeled `PROPOSED` there, never given a `SYN-###` or `DEC-###` entry). Status line above says "SETTLED SCOPE ONLY," which this item does not meet yet.

## Explicit exclusions

The MVP excludes:

- Void assets, taxonomy, terminology, and lore.
- Solana, NFTs, wallets, marketplaces, and token metadata.
- PvP, matchmaking, wagering, tournaments, and multiplayer.
- Breeding, lineage, parent-offspring systems, and Punnett-square interfaces.
- Multiple creature families.
- Full procedural 3D habitat generation.
- AR and desktop-overlay companion behavior.
- `tether-project` physics, UI, controls, game modes, and code.

## Reference-content boundary

The Digital Monster Ver.1 names and tree appearing in the mechanics specification, visual reference, and Stage 2/3 testbeds are mechanics-accuracy references only. They are not active IP, canonical creatures, or shipping content and must never be promoted into this canonical directory.

The older Mochi shipping roster is original project IP and remains implementation evidence, but its names and forms are not automatically canonical for the Holographic Digital Pet. Terminal outcome identity remains governed by `DEC-005`.

## Authority

This directory contains approved or synthesis-ready product truth. Numeric mechanics remain authoritative in validated catalogs and tests. Unresolved choices remain in `knowledge-base/decisions/DECISION-REGISTER.md` and may not be silently filled by an implementation agent.

## Evidence

- Owner instruction replacing Void with Holographic Digital Pet.
- `knowledge-base/decisions/DECISION-REGISTER.md`, DEC-001 through DEC-003.
- `knowledge-base/intake/claude/CLAUDE-INTAKE-001.md`.
- `knowledge-base/intake/chatgpt/CHATGPT-INTAKE-001.md` (source of the still-`PROPOSED` "one refuge environment" item above; also the origin of the cute-social/terrifying-survival-phenotype language in MVP objective item 5, there labeled `VERIFIED` from direct owner instruction).
- `knowledge-base/synthesis/SYNTHESIS-LEDGER.md`, SYN-002 (`PROMOTED`), SYN-003 (`CONSENSUS`), SYN-005 (`OWNER DECISION REQUIRED` — the Digimon-reference-boundary rule this charter states in "Reference-content boundary" below is not yet owner-approved as a `knowledge-base/README.md` hard rule; this charter should not be read as having pre-settled that approval).
- Existing engine/content split documented by the repository README, CLAUDE.md, design brief, and prototype files.
