import { useState, useRef, useEffect, useMemo } from "react";

/* ============================================================================
   V-PET — INTEGRATED PROTOTYPE (engine + content split)
   One living pet: care · real-time clock w/ catch-up · data-driven evolution ·
   CPU battle that feeds the Perfect gate. Built to hand to Claude Design.

   >>> TO RESKIN: edit the CONTENT block ONLY. The ENGINE below is generic and
   >>> never needs changing. Creatures, sprites, stats, evolution rules, food,
   >>> and tuning all live in CONTENT. Swap originals for any roster + art.
   ============================================================================ */

// ============================================================================
// CONTENT LAYER  ⟵ edit here. Original creatures; structure mirrors a classic
//                  v-pet (egg→baby→baby→2 child branches→adults→3 perfects).
// ============================================================================
const CONTENT = {
  meta: { title: "PROTO-MON", version: "proto-1" },
  hatch: "MOCHI",
  stages: ["EGG", "BABY1", "BABY2", "CHILD", "ADULT", "PERFECT"],

  // power = battle base power. sprite seed = name (procedural placeholder art).
  creatures: {
    MOCHI:    { stage: "BABY1",   power: 2,  bedtime: 20 },
    PYX:      { stage: "BABY2",   power: 3,  bedtime: 20 },
    EMBERLING:{ stage: "CHILD",   power: 6,  bedtime: 21 },
    FRILLFIN: { stage: "CHILD",   power: 6,  bedtime: 21 },
    CINDRA:   { stage: "ADULT",   power: 12, bedtime: 22 },
    NOCTIS:   { stage: "ADULT",   power: 12, bedtime: 23 },
    SAUREX:   { stage: "ADULT",   power: 11, bedtime: 22 },
    PYREWULF: { stage: "ADULT",   power: 11, bedtime: 22 },
    AEROKITE: { stage: "ADULT",   power: 12, bedtime: 22 },
    COILEEL:  { stage: "ADULT",   power: 11, bedtime: 22 },
    GOOPUS:   { stage: "ADULT",   power: 7,  bedtime: 21 },
    TITANORE: { stage: "PERFECT", power: 18, bedtime: 23 },
    BEADLE:   { stage: "PERFECT", power: 17, bedtime: 23 },
    CUDDLOTH: { stage: "PERFECT", power: 16, bedtime: 22 },
  },

  // first matching branch wins; fallback chosen if none match; battleGate = Adult→Perfect
  evolutions: [
    { from: "MOCHI", to: "PYX", conditions: null },
    { from: "PYX", to: "EMBERLING", conditions: { careMistakes: [0, 3] } },
    { from: "PYX", to: "FRILLFIN", conditions: { careMistakes: [4, 99] } },

    { from: "EMBERLING", to: "CINDRA",   conditions: { careMistakes: [0, 3], training: [32, 999] } },
    { from: "EMBERLING", to: "NOCTIS",   conditions: { careMistakes: [0, 3], training: [0, 31] } },
    { from: "EMBERLING", to: "SAUREX",   conditions: { careMistakes: [4, 99], training: [5, 15], overfeed: [3, 99], sleepDisturb: [0, 4] } },
    { from: "EMBERLING", to: "PYREWULF", conditions: { careMistakes: [4, 99], training: [16, 999], overfeed: [3, 99], sleepDisturb: [0, 6] } },
    { from: "EMBERLING", to: "GOOPUS",   fallback: true },

    { from: "FRILLFIN", to: "NOCTIS",   conditions: { careMistakes: [0, 3], training: [48, 999] } },
    { from: "FRILLFIN", to: "PYREWULF", conditions: { careMistakes: [0, 3], training: [0, 47] } },
    { from: "FRILLFIN", to: "AEROKITE", conditions: { careMistakes: [4, 99], training: [8, 31], overfeed: [0, 3], sleepDisturb: [9, 99] } },
    { from: "FRILLFIN", to: "COILEEL",  conditions: { careMistakes: [4, 99], training: [8, 31], overfeed: [4, 99], sleepDisturb: [0, 8] } },
    { from: "FRILLFIN", to: "GOOPUS",   fallback: true },

    { from: "CINDRA", to: "TITANORE", conditions: { battleGate: true } },
    { from: "NOCTIS", to: "TITANORE", conditions: { battleGate: true } },
    { from: "AEROKITE", to: "TITANORE", conditions: { battleGate: true } },
    { from: "SAUREX", to: "BEADLE", conditions: { battleGate: true } },
    { from: "PYREWULF", to: "BEADLE", conditions: { battleGate: true } },
    { from: "COILEEL", to: "BEADLE", conditions: { battleGate: true } },
    { from: "GOOPUS", to: "CUDDLOTH", conditions: { battleGate: true } },
  ],

  food: { meat: { hunger: 1, weight: 1 }, protein: { strength: 1, weight: 2, energy: 1 } },

  tuning: {
    maxHeart: 4, weightSick: 99, strengthBonusPer: 4,
    depleteMin: 90, poopEveryMin: 120, callWindowMin: 20,
    untreatedDeathMin: 360, emptyDeathMin: 360, poopSickAt: 8, sleepFullMin: 480,
    wakeHour: 7, deathCareInjury: 20, deathSickness: 20, deathInjury: 20,
    gate: { minBattles: 15, minWins: 12, minRatio: 0.8 },
    lifespansReal: { BABY1: 60, BABY2: 1320, CHILD: 4320, ADULT: 5040 },
    lifespansTest: { BABY1: 8, BABY2: 45, CHILD: 70, ADULT: 70 },
  },
};

// ============================================================================
// ENGINE  ⟵ generic. Reads CONTENT only; no creature names hardcoded.
// ============================================================================
const T = CONTENT.tuning;
const roster = (s) => CONTENT.creatures[s];
const inRange = (v, [lo, hi]) => v >= lo && v <= hi;
const COUNTERS = ["careMistakes", "training", "overfeed", "sleepDisturb"];

function evaluate(species, c, battle) {
  const bs = CONTENT.evolutions.filter((b) => b.from === species);
  if (!bs.length) return { terminal: true };
  if (bs.length === 1 && bs[0].conditions?.battleGate) {
    const ratio = (battle.childWins + battle.adultWins) / Math.max(1, battle.childBattles + battle.adultBattles);
    const ok = battle.childBattles >= T.gate.minBattles && battle.adultBattles >= T.gate.minBattles &&
      battle.childWins >= T.gate.minWins && battle.adultWins >= T.gate.minWins && ratio >= T.gate.minRatio;
    return ok ? { to: bs[0].to } : { hold: true };
  }
  let fb = null;
  for (const b of bs) {
    if (b.fallback) { fb = b; continue; }
    const cd = b.conditions || {};
    if (COUNTERS.filter((k) => cd[k]).every((k) => inRange(c[k], cd[k]))) return { to: b.to };
  }
  return fb ? { to: fb.to } : { terminal: true };
}

function newPet() {
  return {
    species: CONTENT.hatch, stage: roster(CONTENT.hatch).stage, alive: true, deathReason: null,
    awakeMin: 0, simMin: 8 * 60,
    hunger: 4, strength: 4, weight: 5,
    hungerTimer: T.depleteMin, strengthTimer: T.depleteMin, hungerPause: 60,
    poop: 0, poopTimer: T.poopEveryMin,
    sick: false, injured: false, illSince: null, sicknessTotal: 0, injuryTotal: 0,
    asleep: false, sleepStart: null, lightsOff: false, energy: 4,
    callActive: false, callReason: null, callTimer: 0,
    careMistakes: 0, training: 0, trainEffort: 0, overfeed: 0, overfeedLock: false,
    sleepDisturb: 0, proteinCount: 0, preEnhancement: 0, vulnerability: 2,
    emptyMeterSince: null,
    battle: { childWins: 0, childBattles: 0, adultWins: 0, adultBattles: 0 },
  };
}
const clone = (s) => ({ ...s, battle: { ...s.battle } });

// minute-stepped sim — drives live tick AND away-catch-up (mobile-correct)
function simulate(s0, minutes, cfg) {
  const s = clone(s0); const events = [];
  const LS = cfg.testLifespans ? T.lifespansTest : T.lifespansReal;
  const ev = (msg, kind) => events.push({ m: s.simMin, msg, kind });
  for (let i = 0; i < minutes && s.alive; i++) {
    s.simMin++;
    const tod = s.simMin % 1440;
    const bed = (roster(s.species)?.bedtime ?? 21) * 60;
    const night = tod >= bed || tod < T.wakeHour * 60;

    if (!s.asleep && night && s.lightsOff) { s.asleep = true; s.sleepStart = s.simMin; ev("Fell asleep", "dim"); }
    else if (s.asleep && !night) { s.asleep = false; s.sleepStart = null; ev("Woke (morning)", "dim"); }

    if (!s.asleep) {
      s.awakeMin++;
      if (s.hungerPause > 0) s.hungerPause--;
      else if (--s.hungerTimer <= 0) { if (s.hunger > 0) s.hunger--; s.hungerTimer = T.depleteMin; if (s.overfeedLock && s.hunger < 4) s.overfeedLock = false; }
      if (--s.strengthTimer <= 0) { if (s.strength > 0) s.strength--; s.strengthTimer = T.depleteMin; }
      if (--s.poopTimer <= 0) { s.poop = Math.min(T.poopSickAt, s.poop + 1); s.poopTimer = T.poopEveryMin; if (s.poop >= T.poopSickAt && !s.sick) { s.sick = true; s.sicknessTotal++; ev("Got sick (waste)", "warn"); } }
    } else if (s.simMin - s.sleepStart >= T.sleepFullMin) s.energy = T.maxHeart;

    if (s.weight >= T.weightSick && !s.sick) { s.sick = true; s.sicknessTotal++; ev("Got sick (weight)", "warn"); }

    const needFood = s.hunger === 0 || s.strength === 0;
    const needLights = night && !s.lightsOff;
    if ((needFood || needLights) && !s.callActive) { s.callActive = true; s.callTimer = T.callWindowMin; s.callReason = needFood ? "hunger/strength" : "bedtime"; ev(`Call: ${s.callReason}`, "warn"); }
    if (s.callActive) {
      const still = s.callReason === "hunger/strength" ? needFood : needLights;
      if (!still) s.callActive = false;
      else if (--s.callTimer <= 0) { s.careMistakes++; s.preEnhancement = Math.max(-4, s.preEnhancement - 1); s.callActive = false; ev(`Care mistake #${s.careMistakes}`, "bad"); }
    }

    if (s.hunger === 0 || s.strength === 0) { if (s.emptyMeterSince == null) s.emptyMeterSince = s.simMin; } else s.emptyMeterSince = null;
    if (s.sick || s.injured) { if (s.illSince == null) s.illSince = s.simMin; } else s.illSince = null;

    if (s.careMistakes + s.injuryTotal >= T.deathCareInjury) die(s, "20 mistakes+injuries");
    else if (s.sicknessTotal >= T.deathSickness) die(s, "20 sicknesses");
    else if (s.injuryTotal >= T.deathInjury) die(s, "20 injuries");
    else if (s.illSince != null && s.simMin - s.illSince >= T.untreatedDeathMin) die(s, "untreated illness");
    else if (s.emptyMeterSince != null && s.simMin - s.emptyMeterSince >= T.emptyDeathMin) die(s, "starvation");
    if (!s.alive) { ev(`DIED — ${s.deathReason}`, "bad"); break; }

    const span = LS[s.stage];
    if (span && s.awakeMin >= span && s.stage !== "PERFECT") {
      const r = evaluate(s.species, s, s.battle);
      if (r.to) { const f = s.species; s.species = r.to; s.stage = roster(r.to).stage; s.awakeMin = 0; s.careMistakes = 0; s.training = 0; s.trainEffort = 0; s.overfeed = 0; s.sleepDisturb = 0; s.preEnhancement = 0; s.proteinCount = 0; ev(`Evolved ${f} → ${r.to}`, "good"); }
      else if (r.hold) { s.awakeMin = 0; ev("Perfect gate failed — holds", "warn"); }
    }
  }
  return { state: s, events };
}
function die(s, r) { s.alive = false; s.deathReason = r; }

// care actions
const ACTIONS = {
  meat: (s) => { if (s.hunger >= 4) { if (!s.overfeedLock) { s.overfeed++; s.overfeedLock = true; } } else s.hunger++; s.weight += CONTENT.food.meat.weight; },
  protein: (s) => { if (s.strength < 4) s.strength++; s.weight += CONTENT.food.protein.weight; s.energy = Math.min(4, s.energy + 1); if (++s.proteinCount % 4 === 0 && s.preEnhancement < 4) s.preEnhancement++; },
  clean: (s) => { s.poop = 0; },
  medicine: (s) => { s.sick = false; s.injured = false; s.illSince = null; },
  lights: (s) => { s.lightsOff = !s.lightsOff; },
  train: (s) => { s.training++; s.weight = Math.max(0, s.weight - 2); if (++s.trainEffort % 4 === 0 && s.strength < 4) s.strength++; },
  wake: (s) => { if (s.asleep) { s.asleep = false; s.sleepStart = null; s.sleepDisturb++; } },
};

// battle pipeline — deterministic from seed; CPU opponent scaled to stage
function mulberry(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function finalPower(pet) {
  const base = roster(pet.species).power;
  const bonus = (pet.weight >= T.weightSick || pet.hunger === 0) ? 0 : pet.strength * T.strengthBonusPer;
  return base + bonus + pet.preEnhancement;
}
function makeOpponent(pet, seed) {
  const r = mulberry(seed);
  const sameStage = Object.keys(CONTENT.creatures).filter((k) => roster(k).stage === pet.stage);
  const name = sameStage[Math.floor(r() * sameStage.length)] || pet.species;
  const power = Math.max(2, Math.round(roster(name).power + (r() * 6 - 3)));
  return { species: name, power, hp: 3 };
}
// returns {win, frames:[{myHp,oppHp,note}], injured}
function resolveBattle(pet, opp, seed) {
  const r = mulberry(seed);
  const my = { hp: 3, p: finalPower(pet) }, op = { hp: 3, p: opp.power };
  const frames = [{ myHp: 3, oppHp: 3, note: "Battle start" }];
  const hitChance = (a, b) => Math.min(0.85, Math.max(0.15, 0.5 + (a - b) * 0.03));
  for (let turn = 0; turn < 8 && my.hp > 0 && op.hp > 0; turn++) {
    if (r() < hitChance(my.p, op.p)) op.hp--;
    if (r() < hitChance(op.p, my.p)) my.hp--;
    frames.push({ myHp: Math.max(0, my.hp), oppHp: Math.max(0, op.hp), note: `exchange ${turn + 1}` });
  }
  const win = my.hp > op.hp || (my.hp === op.hp && my.p >= op.p);
  const injured = !win && r() < (0.2 + pet.vulnerability * 0.04);
  frames.push({ myHp: Math.max(0, my.hp), oppHp: Math.max(0, op.hp), note: win ? "WIN" : "LOSE" });
  return { win, frames, injured };
}
function applyBattle(s0, win, injured) {
  const s = clone(s0);
  if (s.stage === "CHILD") { s.battle.childBattles++; if (win) s.battle.childWins++; }
  else if (s.stage === "ADULT") { s.battle.adultBattles++; if (win) s.battle.adultWins++; }
  s.weight = Math.max(0, s.weight - 4);
  if (injured) { s.injured = true; s.injuryTotal++; }
  return s;
}

// procedural placeholder sprite (engine util) — replace w/ real frames at design
function grid(name) {
  let h = 2166136261; for (let i = 0; i < name.length; i++) { h ^= name.charCodeAt(i); h = Math.imul(h, 16777619); }
  const rnd = () => { h += 0x6d2b79f5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const g = Array.from({ length: 12 }, () => Array(12).fill(0));
  for (let y = 2; y < 11; y++) for (let x = 0; x < 6; x++) { const e = x === 0 || y === 2 || y === 10; const on = rnd() > (e ? 0.6 : 0.36) ? 1 : 0; g[y][x] = on; g[y][11 - x] = on; }
  g[5][3] = 0; g[5][8] = 0; return g;
}

// ============================================================================
// UI
// ============================================================================
const INK = "#2b3318", LCD = "#c3d196", LCD_DIM = "#aebd84";
const hhmm = (m) => `${String(Math.floor((m % 1440) / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const canBattle = (p) => p.alive && !p.asleep && (p.stage === "CHILD" || p.stage === "ADULT" || p.stage === "PERFECT");

function Sprite({ name, size = 10, flip, hit, asleep }) {
  const g = useMemo(() => grid(name), [name]);
  return <svg width={12 * size} height={12 * size} viewBox="0 0 12 12" style={{ imageRendering: "pixelated", transform: flip ? "scaleX(-1)" : "none", filter: hit ? "invert(1)" : "none", opacity: asleep ? 0.5 : 1, transition: "filter .08s" }}>{g.map((row, y) => row.map((c, x) => c ? <rect key={x + "-" + y} x={x} y={y} width={1.02} height={1.02} fill={INK} /> : null))}</svg>;
}
function Hearts({ v }) { return <div style={{ display: "flex", gap: 3 }}>{[0, 1, 2, 3].map((i) => <div key={i} style={{ width: 15, height: 10, border: `1.5px solid ${INK}`, background: i < v ? INK : "transparent" }} />)}</div>; }

export default function App() {
  const [pet, setPet] = useState(newPet);
  const [screen, setScreen] = useState("home");
  const [log, setLog] = useState([{ m: 480, msg: `Hatched → ${CONTENT.hatch}`, kind: "good" }]);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(8);
  const [testLife, setTestLife] = useState(true);
  const [showStatus, setShowStatus] = useState(false);
  const [battle, setBattle] = useState(null); // {opp, frames, idx, win, injured}
  const petRef = useRef(pet); petRef.current = pet;

  const advance = (mins, label) => {
    const cur = petRef.current; if (!cur.alive) return;
    const { state, events } = simulate(cur, mins, { testLifespans: testLife });
    setPet(state);
    if (events.length) setLog((l) => [...events.slice(-10).reverse(), ...l].slice(0, 50));
    if (label) setLog((l) => [{ m: state.simMin, msg: label, kind: "dim" }, ...l].slice(0, 50));
  };
  const act = (k) => { const s = clone(petRef.current); if (!s.alive) return; ACTIONS[k](s); setPet(s); };

  useEffect(() => {
    if (!running || screen === "battle") return;
    const id = setInterval(() => { if (!petRef.current.alive) { setRunning(false); return; } advance(speed); }, 1000);
    return () => clearInterval(id);
  }, [running, speed, testLife, screen]);

  // battle flow
  const startBattle = () => {
    const seed = (petRef.current.simMin * 2654435761) ^ Date.now();
    const opp = makeOpponent(petRef.current, seed);
    const res = resolveBattle(petRef.current, opp, seed);
    setBattle({ opp, frames: res.frames, idx: 0, win: res.win, injured: res.injured, done: false });
    setScreen("battle"); setRunning(false);
  };
  useEffect(() => {
    if (screen !== "battle" || !battle || battle.done) return;
    if (battle.idx >= battle.frames.length - 1) {
      const s = applyBattle(petRef.current, battle.win, battle.injured);
      setPet(s);
      setLog((l) => [{ m: s.simMin, msg: `Battle vs ${battle.opp.species}: ${battle.win ? "WIN" : "LOSE"}${battle.injured ? " (injured)" : ""}`, kind: battle.win ? "good" : "bad" }, ...l].slice(0, 50));
      setBattle((b) => ({ ...b, done: true })); return;
    }
    const id = setTimeout(() => setBattle((b) => ({ ...b, idx: b.idx + 1 })), 650);
    return () => clearTimeout(id);
  }, [screen, battle]);

  const p = pet;
  const fr = battle?.frames[battle.idx];
  const gate = p.battle;
  const ratio = (gate.childWins + gate.adultWins) / Math.max(1, gate.childBattles + gate.adultBattles);

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% -10%,#222621,#101210)", color: "#c9cdc2", fontFamily: "ui-monospace,Menlo,monospace", padding: "20px 12px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#eef0e8", letterSpacing: 1 }}>{CONTENT.meta.title} <span style={{ fontSize: 10, color: "#6f746a" }}>— integrated prototype</span></div>
          <div style={{ fontSize: 10, color: "#6f746a" }}>{CONTENT.meta.version}</div>
        </div>
        <div style={{ fontSize: 10, color: "#8b9085", margin: "3px 0 14px" }}>Generic engine · content-driven creatures · care + clock + evolution + battle in one pet. Reskin = edit CONTENT.</div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
          {/* DEVICE */}
          <div style={{ width: 280, background: "linear-gradient(160deg,#4b5247,#343a32)", borderRadius: 24, padding: 16, boxShadow: "0 8px 30px rgba(0,0,0,.5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, color: "#cfd3c7", fontSize: 9, letterSpacing: 2 }}>
              <span>{p.stage}</span>
              <span style={{ display: "flex", gap: 5, alignItems: "center" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: p.alive ? "#e0a526" : "#5a5f55", boxShadow: p.alive ? "0 0 6px #e0a526" : "none" }} />{hhmm(p.simMin)}</span>
            </div>

            {/* LCD */}
            <div style={{ background: LCD, color: INK, borderRadius: 8, padding: 12, boxShadow: "inset 0 2px 8px rgba(0,0,0,.35)", backgroundImage: `repeating-linear-gradient(0deg,${LCD_DIM} 0 1px,transparent 1px 3px)`, minHeight: 190 }}>
              {screen === "battle" && battle ? (
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, textAlign: "center" }}>{fr.note}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                    <div style={{ textAlign: "center" }}><Sprite name={p.species} size={7} hit={fr.note.includes("exchange") && fr.myHp < battle.frames[Math.max(0, battle.idx - 1)].myHp} /><div style={{ fontSize: 8 }}>{[..."♥♥♥"].map((_, i) => i < fr.myHp ? "♥" : "·")}</div></div>
                    <div style={{ fontSize: 12, fontWeight: 800 }}>VS</div>
                    <div style={{ textAlign: "center" }}><Sprite name={battle.opp.species} size={7} flip hit={fr.note.includes("exchange") && fr.oppHp < battle.frames[Math.max(0, battle.idx - 1)].oppHp} /><div style={{ fontSize: 8 }}>{[..."♥♥♥"].map((_, i) => i < fr.oppHp ? "♥" : "·")}</div></div>
                  </div>
                  <div style={{ fontSize: 8, textAlign: "center", marginTop: 6 }}>{p.species} ({finalPower(p)}) vs {battle.opp.species} ({battle.opp.power})</div>
                  {battle.done && <div style={{ textAlign: "center", marginTop: 8, fontWeight: 800, fontSize: 13 }}>{battle.win ? "★ VICTORY ★" : "DEFEAT"}{battle.injured ? "  +injury" : ""}</div>}
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "center", padding: "6px 0" }}>{p.alive ? <Sprite name={p.species} asleep={p.asleep} hit={p.sick || p.injured} /> : <div style={{ fontSize: 56 }}>✝</div>}</div>
                  <div style={{ textAlign: "center", fontSize: 14, fontWeight: 800 }}>{p.alive ? p.species : "GAME OVER"}</div>
                  {!p.alive && <div style={{ textAlign: "center", fontSize: 9 }}>{p.deathReason}</div>}
                  <div style={{ marginTop: 8 }}><div style={{ fontSize: 8, fontWeight: 700 }}>HUNGER</div><Hearts v={p.hunger} /></div>
                  <div style={{ marginTop: 4 }}><div style={{ fontSize: 8, fontWeight: 700 }}>STRENGTH</div><Hearts v={p.strength} /></div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, marginTop: 6, fontWeight: 700 }}>
                    <span>{p.weight}G</span><span>{p.poop > 0 ? `💩${p.poop}` : "clean"}</span><span>{p.sick ? "SICK" : p.injured ? "HURT" : p.callActive ? `CALL ${p.callTimer}` : "ok"}</span><span>{p.lightsOff ? "🌙" : "☀"}</span>
                  </div>
                </>
              )}
            </div>

            {/* buttons */}
            {screen === "battle" ? (
              <button onClick={() => { setScreen("home"); setBattle(null); }} disabled={!battle?.done} style={{ ...mainBtn(!battle?.done), width: "100%", marginTop: 12 }}>{battle?.done ? "← BACK" : "…"}</button>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginTop: 12 }}>
                <Btn label="Meat" dis={!p.alive} onClick={() => act("meat")} />
                <Btn label="Protein" dis={!p.alive} onClick={() => act("protein")} />
                <Btn label="Clean" dis={!p.alive} onClick={() => act("clean")} />
                <Btn label="Med" dis={!p.alive} onClick={() => act("medicine")} />
                <Btn label="Train" dis={!p.alive} onClick={() => act("train")} />
                <Btn label={p.lightsOff ? "Lit" : "Dark"} dis={!p.alive} onClick={() => act("lights")} />
                <Btn label="Wake" dis={!p.alive || !p.asleep} onClick={() => act("wake")} />
                <Btn label="Fight" hot dis={!canBattle(p)} onClick={startBattle} />
              </div>
            )}
          </div>

          {/* SIDE PANELS */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <Panel title="Clock">
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <button onClick={() => setRunning((r) => !r)} disabled={!p.alive || screen === "battle"} style={mainBtn(!p.alive || screen === "battle")}>{running ? "⏸" : "▶"}</button>
                <span style={{ fontSize: 10 }}>{speed} min/s</span>
                <input type="range" min={1} max={120} value={speed} onChange={(e) => setSpeed(+e.target.value)} />
                <button onClick={() => advance(360, "— away 6h —")} disabled={!p.alive} style={ghost}>Away 6h</button>
                <button onClick={() => advance(1440, "— away 24h —")} disabled={!p.alive} style={ghost}>Away 24h</button>
              </div>
              <label style={{ fontSize: 9, display: "flex", gap: 6, marginTop: 8 }}><input type="checkbox" checked={testLife} onChange={(e) => setTestLife(e.target.checked)} />fast lifespans (watch full evolution)</label>
              <button onClick={() => { setPet(newPet()); setLog([{ m: 480, msg: `Hatched → ${CONTENT.hatch}`, kind: "good" }]); setRunning(false); setScreen("home"); setBattle(null); }} style={{ ...ghost, marginTop: 8 }}>NEW EGG</button>
            </Panel>

            <Panel title={`Perfect gate  ·  ${(ratio * 100).toFixed(0)}% win rate`} mt>
              <div style={{ fontSize: 10, lineHeight: 1.8 }}>
                <Bar label="Child wins" v={gate.childWins} need={T.gate.minWins} />
                <Bar label="Child battles" v={gate.childBattles} need={T.gate.minBattles} />
                <Bar label="Adult wins" v={gate.adultWins} need={T.gate.minWins} />
                <Bar label="Adult battles" v={gate.adultBattles} need={T.gate.minBattles} />
              </div>
            </Panel>

            <Panel title="Hidden counters" mt>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, fontSize: 10 }}>
                <Cnt k="Care" v={p.careMistakes} /><Cnt k="Train" v={p.training} /><Cnt k="Overfeed" v={p.overfeed} />
                <Cnt k="SleepDist" v={p.sleepDisturb} /><Cnt k="PreEnh" v={p.preEnhancement} /><Cnt k="Power" v={finalPower(p)} />
              </div>
            </Panel>
          </div>
        </div>

        <Panel title="Event log" mt>
          <div style={{ fontSize: 10, lineHeight: 1.6, maxHeight: 150, overflowY: "auto" }}>
            {log.map((e, i) => <div key={i} style={{ color: { good: "#bcd27a", warn: "#e0a526", bad: "#e0653a", dim: "#6f746a" }[e.kind] || "#c9cdc2" }}><span style={{ opacity: 0.5 }}>{hhmm(e.m)}</span> {e.msg}</div>)}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, children, mt }) { return <div style={{ background: "#181b18", border: "1px solid #262a25", borderRadius: 10, padding: 12, marginTop: mt ? 12 : 0 }}><div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1, color: "#8b9085", marginBottom: 8, textTransform: "uppercase" }}>{title}</div>{children}</div>; }
const Btn = ({ label, onClick, dis, hot }) => <button onClick={onClick} disabled={dis} style={{ background: dis ? "#23262a" : hot ? "#bcd27a" : "#2c302a", color: dis ? "#5a5f55" : hot ? "#1b1d16" : "#dfe3d6", border: "1px solid #3a4038", borderRadius: 8, padding: "9px 2px", cursor: dis ? "default" : "pointer", fontWeight: 800, fontSize: 9, fontFamily: "ui-monospace,monospace" }}>{label}</button>;
const Cnt = ({ k, v }) => <div style={{ background: "#101210", borderRadius: 6, padding: "6px 8px", display: "flex", justifyContent: "space-between" }}><span style={{ color: "#8b9085" }}>{k}</span><span style={{ color: "#eef0e8", fontWeight: 800 }}>{v}</span></div>;
function Bar({ label, v, need }) { const pct = Math.min(100, (v / need) * 100); return <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 90 }}>{label}</span><div style={{ flex: 1, height: 8, background: "#101210", borderRadius: 4, overflow: "hidden" }}><div style={{ width: pct + "%", height: "100%", background: v >= need ? "#bcd27a" : "#e0a526" }} /></div><span style={{ width: 42, textAlign: "right" }}>{v}/{need}</span></div>; }
const ghost = { background: "#2c302a", color: "#dfe3d6", border: "1px solid #3a4038", borderRadius: 8, padding: "7px 11px", cursor: "pointer", fontWeight: 800, fontSize: 10, fontFamily: "ui-monospace,monospace" };
const mainBtn = (dis) => ({ background: dis ? "#23262a" : "#bcd27a", color: dis ? "#5a5f55" : "#1b1d16", border: "none", borderRadius: 8, padding: "7px 14px", cursor: dis ? "default" : "pointer", fontWeight: 800, fontSize: 12, fontFamily: "ui-monospace,monospace" });
