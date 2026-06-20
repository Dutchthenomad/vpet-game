# Prototype

Four runnable React artifacts. They were built in stages; the integrated one is canonical.

| File | What it is | Status |
|---|---|---|
| **vpet-game-prototype.jsx** | **The full game** — care + clock + evolution + battle in one pet, with the engine/content split. | **Canonical. Start here.** |
| vpet-care-engine.jsx | Care + real-time + catch-up engine in isolation (live tick and "away" share one minute-stepped sim). | reference |
| vpet-evolution-testbed.jsx | Evolution engine + hidden-counter controls + recipe assertions (proves the branch table). | reference |
| vpet-battle-harness.jsx | Two-device battle over a swappable transport (in-memory now, WebSocket/BLE later). | reference |

## Architecture (in the canonical file)

- `CONTENT` block — creatures, sprites, stats, evolution table, food, tuning. **Reskin/extend here.**
- `ENGINE` block — generic: time sim, care actions, evolution `evaluate()`, battle pipeline. Reads `CONTENT` only.
- `UI` block — device shell + LCD + screens. **Design here.**

## Run

These are claude.ai-style React artifacts (default export, Tailwind-free inline styling, no browser storage). Drop into any React 18 sandbox, or paste back into Claude as an artifact. No build deps beyond React.

## Known limits (intentional, not bugs)

- No persistence — artifacts can't use storage. The "Away" buttons stand in for app-close/resume; on a real port this becomes `elapsed = now − lastTick`.
- Sprites are procedural placeholders read from `CONTENT`; real frames replace them with no engine change.
- Battle opponent is CPU; the two-player transport in `vpet-battle-harness.jsx` is the path to real PvP.
