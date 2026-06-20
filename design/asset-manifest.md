# Asset Manifest

Everything the final build needs as art/audio. The prototype ships **procedural placeholder sprites**; the engine reads sprite data from the `CONTENT` layer, so finished frames drop in by replacing placeholders — no engine changes.

## Creature roster (ship this — original IP, clean)

Structure mirrors the documented v-pet tree 1:1 (see `diagrams/03-evolution-tree.png`). Names are original.

| Stage | Creature | Branch | Notes |
|---|---|---|---|
| Baby I | **Mochi** | — | first form out of egg |
| Baby II | **Pyx** | — | |
| Child | **Emberling** | A (fire-leaning) | "good care" line |
| Child | **Frillfin** | B (water-leaning) | "neglect" line |
| Adult | **Cindra** | A | best-care result |
| Adult | **Noctis** | A+B | low-training result |
| Adult | **Saurex** | A | overfed/low-train |
| Adult | **Pyrewulf** | A+B | high-train messy-care |
| Adult | **Aerokite** | B | high sleep-disturbance |
| Adult | **Coileel** | B | overfed |
| Adult | **Goopus** | A+B | fallback ("junk") form |
| Perfect | **Titanore** | from Cindra/Noctis/Aerokite | hero terminal |
| Perfect | **Beadle** | from Saurex/Pyrewulf/Coileel | |
| Perfect | **Cuddloth** | from Goopus | |

## Per-creature animation states

Each creature needs these frames (LCD 2-tone, ink-on-transparent, target 48×48 logical, drawn at 2–4×):

- **Idle** — 2-frame loop (gentle bob)
- **Happy** — fed / praised reaction
- **Hurt/Hit** — battle hit + sick state (prototype uses an invert flash)
- **Sleep** — eyes closed / Zzz
- **Attack** — battle lunge (single frame ok)
- **Evolve flash** — the transition burst (can be shared across creatures)
- **Refuse** — declines food/medicine (optional, 1 frame)

Egg: **Digitama** idle + 3-frame hatch sequence.

## Screen inventory (design each)

| Screen | Purpose | Key states |
|---|---|---|
| Boot / clock-set | hatch the egg | egg idle, hatch anim |
| Home / care | the main LCD with pet + meters | awake, asleep, sick, call-active, dead |
| Status pages | cycle stats | age/weight, hunger, strength, win-ratio, energy |
| Feed menu | meat / protein select | |
| Battle | pet vs opponent | start, exchanges, win, lose, injury |
| Evolution | the payoff moment | flash → reveal |
| Death / grave | permadeath | grave (default) + optional "mainframe" skin |
| Codex (optional) | reveal a branch's rules *after* first achieved | locked / unlocked |

## UI chrome

- **8 border icons**: Status, Food, Training, Battle, Clean, Lights, Medicine, Call/alert
- **Buttons**: A (scroll) · B (confirm) · C (cancel) — physical device buttons
- **Meters**: 4-segment hunger + strength; charge/effort pips
- **Power LED**: single amber dot (the only non-LCD color accent)
- **Device shell**: rugged graphite/olive handheld; LCD recessed with inset shadow + scanline texture

## Type

- Display/heading + LCD text: pixel/dot-matrix face (fallback: monospace, as in prototype)

## Audio (optional, nice-to-have)

- Call/alert beep, eat, train hit, battle hit, win jingle, evolve sting, death tone, button blip

## Hard rule

- ⚠️ LCD content stays **strictly 2-tone** (ink + screen-green) for authenticity. Amber LED is the only color accent, and it lives on the shell, not the screen.
