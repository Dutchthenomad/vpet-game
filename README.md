# V-Pet (PROTO-MON) — Design Handoff

A real-time, permadeath, battling virtual-pet game. A generic engine drives a data-defined creature; the design surface is wide open. This repo is a complete handoff for **Claude Design** to produce the polished build.

## Start here

1. **`DESIGN-BRIEF.md`** — the design ask, art direction, screens, constraints, success criteria.
2. **`prototype/vpet-game-prototype.jsx`** — the working game. Run it to feel the loop.
3. **`design/spec/game-spec-v1.md`** — every rule and number behind it.

## Layout

```
DESIGN-BRIEF.md                 ← read first
README.md
design/
  design-tokens.json            established palette / type / metrics
  asset-manifest.md             every creature, animation state, screen, chrome asset
  visual-reference.md           diagrams as canonical Mermaid + JSON, annotated
  spec/
    game-spec-v1.md             full game design spec; all locked decisions
  diagrams/
    01-hidden-counters.png      rendered system diagrams (6)
    02-state-machine.png
    03-evolution-tree.png
    04-time-catchup-engine.png
    05-evolution-evaluation-engine.png
    06-battle-pipeline.png
    evolution-tree.mmd / .json  editable source + engine data contract
    state-machine.mmd / .json
prototype/
  vpet-game-prototype.jsx       ← canonical functional reference
  vpet-care-engine.jsx          subsystem testbeds
  vpet-evolution-testbed.jsx
  vpet-battle-harness.jsx
  README.md
```

## Core principle

**Engine vs content split.** The engine never names a creature. Creatures, art, stats, evolution rules, and tuning are data in the `CONTENT` layer. Reskinning = editing data + UI; behavior stays put. This is what makes the design swappable and the project maintainable.

## Provenance & IP

- All code, the spec, the design brief, and the creature roster (the **Mochi line**) are original to this project.
- The mechanics were reverse-engineered from public community documentation of the original 1997 device; the diagram/spec files reference the documented original roster **only as a mechanics reference** (like citing a source). The shipping product uses the original roster.
- A fan project (DVPet) and its PDF guide were consulted as a behavioral reference only — no code or assets from it are included or derived here.

## Push to GitHub

This bundle is git-ready. From the unzipped folder:

```bash
git init
git add .
git commit -m "V-Pet design handoff: spec, diagrams, tokens, prototype, design brief"
git branch -M main
git remote add origin git@github.com:Dutchthenomad/<repo-name>.git
git push -u origin main
```
