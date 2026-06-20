# V-Pet Game — Claude Code Context

## How to run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle check
```

## Canonical file
`prototype/vpet-game-prototype.jsx` — the full, integrated game. The other three jsx files are testbeds:
- `vpet-care-engine.jsx` — care + catch-up time simulation
- `vpet-evolution-testbed.jsx` — evolution branch verification
- `vpet-battle-harness.jsx` — two-device battle transport

`src/Launcher.jsx` imports all four and renders them in tabs. Do not duplicate prototype files into `src/`.

## Engine / Content split (hard rule)

The prototype has three layers:
- **CONTENT** — creatures, sprites, stats, evolution table, tuning. **This is the reskin surface.**
- **ENGINE** — time sim, care, `evaluate()`, battle pipeline. Generic; reads CONTENT only.
- **UI** — device shell, LCD, screens.

**Never edit ENGINE logic to achieve a visual or content change. Change CONTENT or UI instead, or flag the constraint explicitly before touching ENGINE.**

## Three design pillars (never remove without an explicit recorded decision)
1. **Permadeath** — pets can die permanently; no save/restore.
2. **Opaque / hidden evolution** — the player cannot see evolution counters or branch weights.
3. **Social battle** — battles require two devices (or the two-player harness).

## IP rule
Ship the **original Mochi creature roster only**. The `design/` docs reference the documented 1997 Tamagotchi roster *as a mechanics reference only*. No code or assets from any fan project are included or derived.

## Stack constraints
- React 18 hooks only — no class components.
- Inline styles — no Tailwind, no CSS modules.
- No browser storage (`localStorage`, `sessionStorage`, `IndexedDB`).
- No external deps beyond `react` and `react-dom`.

## Design source of truth
`DESIGN-BRIEF.md` and everything under `design/` — do not modify these files.
