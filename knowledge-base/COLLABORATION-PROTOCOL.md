# Cross-Model Collaboration Protocol

## Goal

Produce one authoritative, implementation-ready corpus for the Holographic Digital Pet project while preserving provenance and preventing model confabulation.

## Participants

- Project owner: final authority.
- ChatGPT: independent researcher, synthesizer, editor.
- Claude: independent researcher, synthesizer, editor.
- Local Codex/Claude agents: implementation consumers and contributors through reviewed changes.

## Contribution boundaries

### ChatGPT

Write initial contributions under:

`knowledge-base/intake/chatgpt/`

### Claude

Write initial contributions under:

`knowledge-base/intake/claude/`

### Shared synthesis

Use:

`knowledge-base/synthesis/`

Only after both relevant intake files have been read.

### Canon

Use:

`knowledge-base/canonical/`

Only for owner-approved or explicitly authorized material.

## Required evidence labels

Every substantive claim must be marked as one of:

- `VERIFIED` — directly supported by a fetched file, commit, working prototype, or owner statement.
- `RECONSTRUCTED` — derived from multiple verified sources.
- `PROPOSED` — a new recommendation.
- `UNRESOLVED` — conflicting or incomplete evidence.
- `REJECTED` — intentionally excluded.

## Provenance format

Use repository-relative paths and, when available, commit SHAs:

```text
Source: design/spec/game-spec-v1.md @ <commit-sha>
```

For conversational memory that is not yet stored in the repository:

```text
Source: owner conversation memory, date/topic noted; requires archival capture
```

## No-fabrication rule

If a tool returns empty, inaccessible, or ambiguous results:

1. State that the source was not read.
2. Do not infer its contents.
3. Continue only with independently verified material.
4. Add the missing source to the source-inventory queue.

## Merge method

1. Each model contributes independently.
2. A synthesis file compares claims line by line.
3. Agreements are marked `CONSENSUS`.
4. Conflicts are documented with both positions and evidence.
5. Owner decisions are recorded in the decision register.
6. Canonical files are updated only after the applicable conflicts are resolved.

## Scope reset

The active project is the Holographic Digital Pet concept.

The old Void pet concept is excluded from active canon.

The first implementation corpus must remain narrow and must not silently include:

- Solana or NFTs.
- Wagering.
- PvP or multiplayer.
- Breeding.
- Multiple creature families.
- Full procedural 3D habitat simulation.
- Autonomous multi-agent production infrastructure as a gameplay dependency.

## Branch convention

Recommended branches:

- `kb/chatgpt-<topic>`
- `kb/claude-<topic>`
- `kb/synthesis-<topic>`

Direct commits to `main` should be limited to workspace scaffolding or changes explicitly authorized by the owner.
