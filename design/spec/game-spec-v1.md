# V-Pet Game Structure — Conclusive Design Spec v1

Anchored on the original 1997 Digital Monster **Ver.1** (flagship roster, 14 Digimon). Every contested original-vs-Ver.20th fork is resolved and **LOCKED** below. Numbers tagged `(derived)` are community-observed or Ver.20th proxies, not published 1997 constants — these are the tunables. This spec is the single source of truth that the build, Claude Design, and Codex cleanup all reference.

---

## 0. Design Pillars (non-negotiable)

These three are the "soul." No iteration may remove them without an explicit decision.

- **Permadeath** — the pet genuinely dies and is gone. Survival to natural lifespan leaves an egg; death by neglect leaves nothing.
- **Opaque evolution** — branch requirements are hidden by default. Two players raising the same egg can get a hero or a Numemon. Discovery is the reward.
- **Social battle** — battling another player is the competitive spine; win ratio is bragging rights and the gate to Perfect.

---

## 1. Canonical Rule Decisions (the forks, resolved)

| Fork | Original Ver.1 | Ver.20th | **LOCKED** |
|---|---|---|---|
| Sleep counts toward evolution timer | No | Yes | **No** (timer ticks only while awake) |
| Both meters empty simultaneously | 1 care mistake | 2 | **1** |
| Sleep disturbance as evolution counter | Yes | Removed | **Yes** (kept) |
| Call window → care mistake | ~10–20 min | — | **20 min** (forgiving; mobile push latency) |
| Training-attempt counting | Counts even on cancel/loss | Success only | **Counts attempts** (Ver.1 rule) |
| Sickness-death threshold | undocumented (~10–20) | 20 | **20** `(derived)` |

Global escape hatch: a `ruleset` flag (`original` \| `relaxed`) so the relaxed/modern variant can be toggled later without code change. Default `original`.

---

## 2. Time System

- Real-time clock drives everything. 1 "Digimon year" = 24h real time.
- Single global `timeScale` multiplier (default `1.0`). Dev/testing runs at e.g. `60.0` to compress days into minutes. **This is the one engineering liberty taken — it does not alter mechanics, only their speed.**
- All timers below expressed in real minutes at `timeScale = 1.0`.
- ⚠️ Mobile reality: the app is closed most of the time. Time must advance from a stored `lastTick` timestamp on resume (catch-up simulation), **not** from a foreground loop — or the pet effectively pauses when backgrounded, breaking permadeath stakes. This is the single biggest port-time correctness risk.

---

## 3. Lifecycle

| Stage | Battle-capable | Stage duration (awake time) |
|---|---|---|
| Digitama (egg) | — | hatches ~1 min after clock set |
| Baby I (Fresh) | No | ~60 min |
| Baby II (In-Training) | No | ~20–44 h `(derived)` |
| Child (Rookie) | Yes | ~68–76 h `(derived)`, per-species |
| Adult (Champion) | Yes | ~44–124 h `(derived)`, per-species |
| Perfect (Ultimate) | Yes | terminal; lives out species lifespan |

- Evolution fires when `awakeElapsedInStage >= speciesStageLifespan`, evaluating the hidden counters at that instant (§6).
- Lifespans are per-species from the humulos/NHOKO Ver.1 data table (imported as data, not hardcoded).

---

## 4. Care Subsystems

### 4.1 Hunger & Strength
- 4 hearts each, independent.
- Deplete 1 heart per `depletionInterval` (default **90 min** `(derived)`, per-species override; accelerates after a failed Perfect evolution).
- Filling all 4 hunger hearts pauses the hunger cycle for **60 min**.
- Empty meter → Call fires (§4.6). Ignored past the 20-min window → **1 care mistake**. Both empty at once → still **1**.
- Empty for ~6 h → contributes to starvation death (§7).

### 4.2 Feeding & Weight
- **Meat**: +1 hunger heart, **+1G**.
- **Protein**: +1 strength heart, **+2G**, +energy/DP.
- Weight in `G`. Each species has an ideal weight; **99G** = strength power-bonus removed + sickness risk.
- Training −2G; battle −4G.

### 4.3 Overfeeding
- Feed meat past full → first refusal = **+1 overfeed counter**.
- Cannot bank another overfeed until a hunger heart has dropped. Overfeed feeds the evolution branch (§6).

### 4.4 Protein hidden counters (DMComm-decoded)
Every 4 protein ticks three counters (each only if currently allowed to rise):
- **Energy** — species default, resets after 8 h continuous sleep.
- **Pre-Enhancement** — combat power-up, range −4…+4, resets to 0 on evolution. +1 on counter wrap, −1 on a care mistake. Training does **not** affect it.
- **Vulnerability** — 0…15, raises post-battle injury chance.

### 4.5 Waste & Sickness
- Pet poops ~every **2 h**. Up to 4 piles is harmless; **8 uncleaned piles → sick**.
- Sickness also from 99G weight / chronic overfeed.
- Medicine icon cures sickness ("dots") and injury ("skull"); pet may refuse → repeat.
- Untreated sickness/injury **~6 h → death**. 20 accumulated sicknesses → death `(derived)`.

### 4.6 Sleep
- Per-species bedtime (~19:00–21:00); common wake (~07:00–08:00).
- Lights must be turned off within the Call window or it's a **care mistake**.
- 8 h continuous sleep refills energy/DP.
- Waking the pet (lights on / forced) = **sleep disturbance** counter (not a care mistake). Setting clock to daytime wakes without a disturbance.

### 4.7 Training
- 4 sessions = **1 effort/strength heart**, regardless of outcome (Ver.1: opening the menu counts).
- Each session: **−2G**; a success also adds a strength heart.
- Per-version mini-game (Ver.1 = high/low attack vs. shadow). Mini-game is cosmetic to the counters — the counter increments on attempt.

---

## 5. Complete State Model

Everything the engine tracks. `// reset on evolution` marks per-stage counters.

```
Pet {
  // identity & lifecycle
  species:        string      // slot key into Ver.1 roster (0x0..0xE)
  stage:          enum        // EGG|BABY1|BABY2|CHILD|ADULT|PERFECT|DEAD
  bornAt:         timestamp
  stageEnteredAt: timestamp
  awakeMsInStage: int         // drives evolution; sleep excluded

  // care meters
  hunger:         int 0..4
  strength:       int 0..4
  weight:         int (G)
  hungerCycleAt:  timestamp   // next heart-drop
  strengthCycleAt:timestamp

  // hidden evolution counters
  careMistakes:   int   // reset on evolution
  trainingCount:  int   // reset on evolution
  overfeedCount:  int   // reset on evolution
  sleepDisturb:   int   // reset on evolution
  preEnhancement: int -4..4   // reset on evolution

  // protein-driven
  energy:         int
  vulnerability:  int 0..15

  // health
  poopPiles:      int 0..n
  sick:           bool
  injured:        bool
  sickSince:      timestamp?
  sicknessTotal:  int   // lifetime, toward death
  injuryTotal:    int   // lifetime, toward death
  emptyMeterSince:timestamp?  // starvation clock

  // sleep
  asleep:         bool
  lightsOff:      bool

  // battle record (persists across stages)
  battlesChild:   int
  winsChild:      int
  battlesAdult:   int
  winsAdult:      int
  winRatio:       float

  // call/alert
  callActive:     bool
  callReason:     enum
  callFiredAt:    timestamp
}

Account {
  ruleset:   enum   // original | relaxed
  timeScale: float  // default 1.0
  eggsHatched: int  // generations
}
```

---

## 6. Evolution Engine

- Pure function: `evolve(pet) -> nextSpecies`, evaluated at stage timeout.
- Data-driven: each branch is a row of conditions over the §5 counters. **No logic is hardcoded per species** — the Ver.1 table is loaded as data so Ver.2–5 drop in later by swapping the table.

Branch row schema:
```
{ from, to, careMistakes:[min,max], training:[min,max],
  overfeed:[min,max], sleepDisturb:[min,max],
  fallback:bool }   // fallback = the "junk" result (Numemon) when nothing else matches
```

Locked Ver.1 example (Agumon → Adult), from FileIsland/NHOKO:
- → Greymon: care 0–3, training 32+
- → Devimon: care 0–3, training 0–31
- → Tyranomon: care 4+, training 5–15, overfeed 3+, sleepDisturb 0–4
- → Meramon: care 4+, training 16+, overfeed 3+, sleepDisturb 0–6
- → Numemon: `fallback`

Adult → Perfect (all lines): requires ~15 battles **and** 12–15 wins at **both** Child and Adult, win ratio ≥80%. **Not guaranteed even when met** — a failed roll leaves the pet stuck at Adult until lifespan ends. Keep this stochastic gate; it's core to the mystery.

---

## 7. Death & Rebirth

- Dies when **any**: care mistakes + injuries ≥ 20 in one form; sicknessTotal ≥ 20 `(derived)`; injuryTotal ≥ 20 `(derived)`; sick/injured untreated ~6 h; meter empty ~6 h (starvation, 20-strike on `relaxed`).
- On death past natural lifespan → lays an egg (next generation, `eggsHatched++`). Death by neglect → no egg.
- `DEAD` shows grave (`original`) / mainframe (international skin option).

---

## 8. Battle System & Netcode

### 8.1 Local model
- Effective power = `speciesBasePower + (+4 per strength heart, max +16)` `(Ver.20th proxy)`; removed if 99G or hunger empty.
- Transmitted **Enhancement** = `floor(avg(preEnhancement, strengthHearts))`, min 0.
- Hit likelihood scales with power difference. On-screen 4-exchange animation is **cosmetic** — outcome is decided by the data exchange, then presented.

### 8.2 Wire/message mapping (onto the existing harness transport)
The harness's placeholder RPS combat is replaced by the documented packet model, carried as JSON over the same `{ send, subscribe }` transport. Mirrors DigiROM `V1-FC03-FD02`:

```
BATTLE_OFFER { species, enhancement, version, seed }   // packet 1 + commit
BATTLE_ACK   { species, enhancement, version, seed }
BATTLE_RESULT{ winFlag }                                // packet 2 (0x01 win / 0x02 lose)
```

- ⚠️ The original trusted the initiator's win flag. For untrusted phone-vs-phone, **don't** — use commit-reveal: both send a seed, both compute the *same* outcome from `(powers, combinedSeed)` deterministically (same no-RNG-desync principle the harness already proves), and the flag is a confirmation, not an authority. This is the one place we deliberately improve on 1997.
- Real-device interop (bridging to physical V-Pets via DMComm) is possible later because the payload maps 1:1 to the documented protocol — defer.

### 8.3 Outcome effects
- Win/loss updates the per-stage battle record + win ratio (gates Perfect).
- Post-battle injury roll uses `vulnerability`. −4G either way.

---

## 9. UX / Interaction Model

- 8 border icons: **Status, Food (Meat/Protein), Training, Battle, Clean, Lights, Medicine, Call**.
- Buttons: **A** scroll/cycle · **B** confirm/activate · **C** cancel · **A+C** mute.
- Call (8th icon, non-selectable) beeps for hunger, sleep, waste.
- Status screens cycle: Age/Weight → Hunger → Strength → Win Ratio → DP/Energy.
- Default mode **hides** evolution requirements. Optional unlockable **codex** reveals a branch's rules only *after* the player first achieves it — mirrors how the community itself reverse-engineered the game.

---

## 10. Build Mapping

What we have vs. what this spec adds, layered so each stage stays playable.

1. **Done — transport + battle loop** (current harness). Deterministic no-desync message exchange proven. Combat is placeholder RPS.
2. **Core counters + evolution engine** (§5, §6). Single-pet, no real-time care yet; fast-forward via `timeScale` to test that the Ver.1 table produces the right Digimon every time. *Highest-fidelity priority — this is the soul.*
3. **Care + time system** (§2, §4). Real-time meters, Call window, sleep, poop/sickness, death (§7). Catch-up simulation from `lastTick`.
4. **Real battle model** (§8) replacing RPS; wire the Enhancement/win-flag payload into the existing transport.
5. **UX shell + permadeath/egg loop + codex** (§9, §7). Then hand to Claude Design for the device/LCD polish, Codex for cleanup.

---

## 11. Open Tunables (flagged, safe to change)

These do not affect structure — only feel. Settle via playtest, not now.
- `depletionInterval` (90 min default) and per-species overrides.
- Call window (20 min).
- Sickness/injury death thresholds (20 each).
- Strength power-bonus (+4/heart) and species base powers.
- Perfect-evolution success probability.
- `timeScale` for shipped difficulty (likely >1.0 so a pet's life fits a play schedule — but flag that this dilutes permadeath tension).

---

## 12. Caveats

- Items tagged `(derived)` are community-observed or Ver.20th figures, not published 1997 constants. Validate against DMComm original-hardware data before treating as exact.
- Per-species lifespans, base powers, and the full Ver.1 evolution table are **imported as a data file** from humulos/NHOKO — this spec defines the *engine*, the data file defines the *content*. Confirm the data file matches Ver.1 (not Ver.20th) before import.
