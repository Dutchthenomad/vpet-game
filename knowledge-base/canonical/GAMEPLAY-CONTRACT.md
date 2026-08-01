# Gameplay Contract — Holographic Digital Pet Foundation

Status: `CANONICAL DRAFT — VERIFIED FOUNDATION WITH OPEN PRODUCT DECISIONS`

## Primary loop

`Observe → identify need → act → receive behavioral feedback → advance time → train or encounter threat → evaluate development → continue or terminate lifecycle`

The game must preserve the proven virtual-pet structure while presenting every interaction through the Holographic Digital Pet fiction.

## Engine/content separation

The engine must not contain creature names, visual identities, lore-specific labels, or hardcoded evolution content. Creature definitions, presentation, stats, thresholds, and outcome mapping belong in data/content catalogs.

The existing repository establishes this separation and should remain the architectural foundation.

## Time model

- The simulation advances continuously while active.
- A stored `lastTick` timestamp is used to calculate elapsed time on resume.
- Active ticks and catch-up simulation must use the same state-transition path.
- The literal persistence implementation remains to be completed; the Stage-3 care testbed currently simulates away-time jumps without persistent storage.
- Catch-up must be bounded and testable so long absences cannot create undefined state.

## Care model

The precise final state list remains subject to catalog validation, but the MVP must support a narrow set of observable needs and actions rather than an expanding life-simulation stack.

`PROPOSED` interaction categories (traced to `CHATGPT-INTAKE-001.md`'s "six care actions," itself labeled `PROPOSED` there and never given a `SYN-###` or `DEC-###` entry — treat the list below as a synthesis starting point, not an approved requirement):

- Sustenance.
- Rest/recovery.
- Hygiene or refuge purification.
- Training/adaptation.
- Treatment/stabilization.
- Social reassurance/trust building.

Every action must define immediate effects, delayed effects, repetition limits, visible feedback, and care-mistake implications.

## Battle model

The existing battle foundation is deterministic and must be preserved unless an owner decision explicitly replaces it.

Verified baseline:

- `ATTACK`: damage = ATK + charge × 3.
- `DEFEND`: blocks a defined `BLOCK` amount.
- `CHARGE`: banks power up to `MAX_CHARGE` and may be interrupted by attack.
- Both sides reveal actions and resolve the same result.
- Battle resolution itself uses no RNG.
- The winner permanently gains +1 ATK for the session.

Source: `prototype/vpet-battle-harness.jsx:44,395`.

Presentation may change completely, but identical combatant state, chosen actions, and catalog version must produce the same result.

`REVIEW NOTE`: this section describes the resolution math but does not state whether the existing two-device battle requirement (`CLAUDE.md`'s "Social battle" design pillar) is retained. `CHATGPT-INTAKE-001.md` separately proposed a single-player threat encounter. See `PROJECT-CHARTER.md`'s MVP-objective review note — this needs an explicit decision, not silent omission from either canonical file.

## Evolution model

- Evolution criteria remain partially hidden from the player.
- Care history, state history, training, battle results, and content-defined gates may influence outcomes.
- Three terminal outcomes already exist in the current shipping-content model, but their identity and mapping to the Holographic Digital Pet remain unresolved under `DEC-005`.
- The existing Adult-to-Perfect promotion gate is stochastic even though battle resolution is deterministic.
- Whether that stochastic gate remains canonical for this product is not yet approved and must not be mistaken for settled engine truth.

## Death and lifecycle termination

The current V-Pet engine treats permadeath as a core pillar. The Holographic Digital Pet public MVP death model remains unresolved under `DEC-004`.

Until resolved:

- Existing permadeath behavior is implementation evidence, not automatically approved public-product behavior.
- Agents must not remove death handling from the engine.
- Agents must not expose irreversible public permadeath without the owner decision.
- Save schemas should support a terminal state and a recoverable-collapse state until the product decision is finalized.

## IP and roster boundary

The Digital Monster Ver.1 roster in mechanics-reference specs and testbeds must never be shipped or promoted into canonical content.

The Mochi roster is original project IP and valid historical shipping content, but it is not automatically the Holographic Digital Pet roster. Reuse, renaming, reinterpretation, or replacement requires an explicit content decision.

## Verification requirements

A gameplay feature is complete only when:

1. Its content/catalog entry exists.
2. Its state transition is deterministic where specified.
3. Its active and catch-up behavior agree.
4. Its player-facing feedback is defined.
5. Automated or harness-based verification covers the expected result.
6. No reference-only creature names leak into active content.

## Evidence

- `knowledge-base/intake/claude/CLAUDE-INTAKE-001.md`, sections 2, 4, and 6.
- `knowledge-base/intake/chatgpt/CHATGPT-INTAKE-001.md` (source of the still-`PROPOSED` care-action list above).
- `knowledge-base/synthesis/SYNTHESIS-LEDGER.md`, SYN-003 (`CONSENSUS` — battle/catch-up/evolution foundation reuse).
- Existing `prototype/vpet-battle-harness.jsx`.
- Existing `prototype/vpet-care-engine.jsx`.
- Existing `design/spec/game-spec-v1.md`.
- Existing `DESIGN-BRIEF.md` and engine/content split documentation.
