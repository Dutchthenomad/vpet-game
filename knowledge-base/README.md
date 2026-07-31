# Holographic Digital Pet — Shared Knowledge Base

This directory is the durable collaboration workspace for the project owner, ChatGPT, Claude, and local coding agents.

## Why GitHub

Google Drive connector visibility proved unreliable across assistants. GitHub provides a shared, versioned, diffable source that both assistants can read through repository tools or ordinary `git` commands.

## Authority order

1. `canonical/` — approved project truth.
2. `decisions/DECISION-REGISTER.md` — approved decisions and unresolved blockers.
3. `synthesis/` — reconciled proposals awaiting promotion.
4. `intake/chatgpt/` and `intake/claude/` — independent model contributions.
5. Existing repository specs and source archives — evidence, not automatic canon.

## Hard rules

- Never claim to have read a file unless it was actually fetched or opened.
- Cite repository paths and commit SHAs when making factual claims.
- Do not overwrite another model's intake files.
- Submit changes through a branch and pull request whenever practical.
- Material becomes canonical only after owner approval or an explicitly authorized merge.
- The old Void pet concept has no authority in the active product.
- Do not silently reintroduce blockchain, NFTs, wagering, PvP, breeding, multiplayer, or expanded creature families into the MVP.

## Collaboration loop

1. Read this file and `COLLABORATION-PROTOCOL.md`.
2. Add independent findings to your own intake directory.
3. Record agreements and conflicts in `synthesis/SYNTHESIS-LEDGER.md`.
4. Add unresolved choices to `decisions/DECISION-REGISTER.md`.
5. Promote only approved, implementation-ready material into `canonical/`.

## Claude bootstrap

```bash
git clone https://github.com/Dutchthenomad/vpet-game.git
cd vpet-game
cat knowledge-base/README.md
cat knowledge-base/COLLABORATION-PROTOCOL.md
```

Claude should then create or update files only under `knowledge-base/intake/claude/` until a synthesis pass is explicitly requested.
