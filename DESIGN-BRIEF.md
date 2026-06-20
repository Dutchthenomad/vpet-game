# Design Brief — V-Pet (PROTO-MON)

**For: Claude Design.** This is the one document to read first. Everything else in this repo supports it.

---

## The ask

Take the working game prototype in `prototype/vpet-game-prototype.jsx` and make it **beautiful** — a polished, cohesive, emotionally resonant reimagining of a 1997 monochrome-LCD virtual pet, ready to show as a flagship example of what design adds. The game logic is done and correct; your job is the entire visual and interaction surface.

**Reskin the look, not the logic.** The prototype is built on a hard split: a generic `ENGINE` and a `CONTENT` data layer. All creatures, sprites, and tuning live in `CONTENT`; all behavior lives in `ENGINE`. You should never need to touch engine code. Designed sprite frames and styling drop into the content/UI layers.

## What this game is (so the design carries meaning)

A pocket creature you raise in real time. It hatches, ages through five stages, and **which creature it becomes is hidden** — driven by how you cared for it. It can **die permanently**. You **battle** other creatures to grow stronger. Three feelings must come through in the design:

- **Care anxiety** — the pet visibly needs you; neglect has weight.
- **Discovery** — evolution is a mystery; the reveal is a payoff.
- **Loss** — permadeath is real and should land emotionally.

## Art direction

**North star: an authentic late-90s dot-matrix LCD handheld, lovingly rendered.** Think the tactile object first, the screen second.

- **The device is a physical object.** A rugged graphite/olive plastic shell, recessed LCD under faintly reflective glass, three real buttons, a single amber power/alert LED. It should feel like you could hold it.
- **The LCD is strictly two-tone** — dark ink on pale green, with a subtle dot-matrix/scanline texture and slight ghosting. This constraint is the soul; resist the urge to add screen color. (The amber LED is the *only* color accent, and it lives on the shell.)
- **Pixel art, deliberate.** Creatures are chunky, characterful 1-bit sprites. Readable silhouettes per stage; the Perfect forms should feel like a genuine glow-up from the baby.
- **Motion sells it.** Idle bobs, the Call-light blink, the hatch, the evolution flash, the battle exchange, the grave. Small, crisp, purposeful.

You have latitude to push a refined "modern-retro" interpretation (cleaner glass, nicer type, tasteful bloom) as long as the two-tone LCD discipline holds. `design/design-tokens.json` has the established palette/metrics — start there; evolve them with intent, don't discard them.

## Screens to design

Full list + states in `design/asset-manifest.md`. The priority set:

1. **Home / care** — the hero screen. Pet on the LCD, hunger/strength meters, status glyphs, the 8 icon menu, three buttons. Must read at a glance and feel alive.
2. **Battle** — pet vs opponent, the multi-exchange beat, the WIN/LOSE moment, injury.
3. **Evolution** — the reveal. This is the emotional peak; give it a real moment.
4. **Death / grave** — permadeath. Quiet, weighty.
5. **Boot / hatch**, **status pages**, **feed menu**, optional **codex**.

## Deliverables

- A restyled, runnable artifact (same component contract as the prototype) **or** a Figma file with the screens, components, and an interactive flow — your call which best shows the work.
- A small component/token system (device shell, LCD frame, meter, icon set, button, sprite cell) so it's consistent and extensible.
- The creature sprite set (original roster below) across the animation states in the manifest. Placeholder-quality is fine for a first pass if full art is out of scope — but the *system* should be production-shaped.

## Hard constraints (don't break these)

- ⚠️ **Engine is off-limits.** Style the UI and populate `CONTENT`. If something seems to require logic changes, flag it instead.
- ⚠️ **LCD stays two-tone.** Color lives on the shell only.
- ⚠️ **Ship the original roster, not the reference one.** The mechanics docs and rendered diagrams (`design/diagrams/`) use the documented 1997 creatures *for mechanics accuracy and to match the source research* — treat those as the spec/skeleton. The **shipping creatures are original** (the Mochi line in `prototype` + `asset-manifest.md`). Design and name against the original roster.

## Original creature roster (what ships)

Egg → **Mochi** → **Pyx** → { **Emberling** | **Frillfin** } → seven Adults (**Cindra, Noctis, Saurex, Pyrewulf, Aerokite, Coileel, Goopus**) → three Perfects (**Titanore, Beadle, Cuddloth**). Branch logic and battle math in the spec; per-creature notes in the manifest.

## What "one-shot success" looks like

- Someone opens it and immediately reads it as a *real* virtual-pet handheld, not a web UI mock.
- The home screen is glanceable; the pet feels like it wants attention.
- Evolution and death each land as a *moment*.
- The component/token system is clean enough that adding a creature or a screen is obvious.
- It runs against the existing engine with zero logic edits.

## Repo map (supporting material)

- `prototype/vpet-game-prototype.jsx` — **the functional reference. Run it.** Canonical.
- `prototype/` (others) — earlier focused testbeds: battle transport, evolution engine, care/time engine. Useful to understand subsystems in isolation.
- `design/spec/game-spec-v1.md` — full game design spec; every rule and number, with the locked decisions.
- `design/visual-reference.md` — the diagrams as canonical Mermaid + JSON, with notes.
- `design/diagrams/*.png` — six rendered system diagrams (hidden counters, state machine, evolution tree, catch-up engine, evolution evaluation, battle pipeline).
- `design/diagrams/*.mmd / *.json` — editable diagram sources + the evolution **data contract** the engine consumes.
- `design/design-tokens.json` — established palette, type, metrics.
- `design/asset-manifest.md` — every creature, animation state, screen, and chrome asset to produce.
