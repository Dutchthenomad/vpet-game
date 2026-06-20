import { useState, useRef, useEffect, useMemo } from "react";

/* ============================================================
   STAGE 3 v1 — CARE + CATCH-UP TIME ENGINE
   One minute-stepped simulate() runs BOTH live ticking and
   "away" catch-up from a stored timestamp — the mobile-correct
   pattern (spec §2). Full care loop, Call/care-mistake window,
   poop/sickness, sleep, death checks (spec §4/§7), and the
   Stage 2 evolution engine wired in so the pet actually ages
   and evolves. No persistence (artifact limit) — the "Away for"
   buttons stand in for app-close/resume.
   ============================================================ */

// ---------- Ver.1 evolution data (shared with Stage 2) ----------
const STAGES = ["EGG", "BABY1", "BABY2", "CHILD", "ADULT", "PERFECT"];
const ROSTER = {
  BOTAMON: "BABY1", KOROMON: "BABY2", AGUMON: "CHILD", BETAMON: "CHILD",
  GREYMON: "ADULT", DEVIMON: "ADULT", TYRANOMON: "ADULT", MERAMON: "ADULT",
  AIRDRAMON: "ADULT", SEADRAMON: "ADULT", NUMEMON: "ADULT",
  METALGREYMON: "PERFECT", MAMEMON: "PERFECT", MONZAEMON: "PERFECT",
};
const BRANCHES = [
  { from: "BOTAMON", to: "KOROMON", conditions: null },
  { from: "KOROMON", to: "AGUMON", conditions: { careMistakes: [0, 3] } },
  { from: "KOROMON", to: "BETAMON", conditions: { careMistakes: [4, 99] } },
  { from: "AGUMON", to: "GREYMON", conditions: { careMistakes: [0, 3], training: [32, 999] } },
  { from: "AGUMON", to: "DEVIMON", conditions: { careMistakes: [0, 3], training: [0, 31] } },
  { from: "AGUMON", to: "TYRANOMON", conditions: { careMistakes: [4, 99], training: [5, 15], overfeed: [3, 99], sleepDisturb: [0, 4] } },
  { from: "AGUMON", to: "MERAMON", conditions: { careMistakes: [4, 99], training: [16, 999], overfeed: [3, 99], sleepDisturb: [0, 6] } },
  { from: "AGUMON", to: "NUMEMON", fallback: true },
  { from: "BETAMON", to: "DEVIMON", conditions: { careMistakes: [0, 3], training: [48, 999] } },
  { from: "BETAMON", to: "MERAMON", conditions: { careMistakes: [0, 3], training: [0, 47] } },
  { from: "BETAMON", to: "AIRDRAMON", conditions: { careMistakes: [4, 99], training: [8, 31], overfeed: [0, 3], sleepDisturb: [9, 99] } },
  { from: "BETAMON", to: "SEADRAMON", conditions: { careMistakes: [4, 99], training: [8, 31], overfeed: [4, 99], sleepDisturb: [0, 8] } },
  { from: "BETAMON", to: "NUMEMON", fallback: true },
  { from: "GREYMON", to: "METALGREYMON", conditions: { battleGate: true } },
  { from: "DEVIMON", to: "METALGREYMON", conditions: { battleGate: true } },
  { from: "AIRDRAMON", to: "METALGREYMON", conditions: { battleGate: true } },
  { from: "TYRANOMON", to: "MAMEMON", conditions: { battleGate: true } },
  { from: "MERAMON", to: "MAMEMON", conditions: { battleGate: true } },
  { from: "SEADRAMON", to: "MAMEMON", conditions: { battleGate: true } },
  { from: "NUMEMON", to: "MONZAEMON", conditions: { battleGate: true } },
];
const inRange = (v, [lo, hi]) => v >= lo && v <= hi;
function evaluate(species, c, battle) {
  const bs = BRANCHES.filter((b) => b.from === species);
  if (!bs.length) return { terminal: true };
  if (bs.length === 1 && bs[0].conditions?.battleGate) {
    const ratio = (battle.childWins + battle.adultWins) / Math.max(1, battle.childBattles + battle.adultBattles);
    const ok = battle.childBattles >= 15 && battle.adultBattles >= 15 && battle.childWins >= 12 && battle.adultWins >= 12 && ratio >= 0.8;
    return ok ? { to: bs[0].to } : { hold: true };
  }
  let fb = null;
  for (const b of bs) {
    if (b.fallback) { fb = b; continue; }
    const cd = b.conditions || {};
    if (["careMistakes", "training", "overfeed", "sleepDisturb"].filter((k) => cd[k]).every((k) => inRange(c[k], cd[k]))) return { to: b.to };
  }
  return fb ? { to: fb.to } : { terminal: true };
}

// ---------- constants (sim minutes) ----------
const DEPLETE = 90, POOP_EVERY = 120, CALL_WINDOW = 20, UNTREATED_DEATH = 360, EMPTY_DEATH = 360;
const POOP_SICK = 8, WEIGHT_SICK = 99, SLEEP_FULL = 480, BEDTIME = 21 * 60, WAKE = 7 * 60;
const LIFESPAN_REAL = { BABY1: 60, BABY2: 1320, CHILD: 4320, ADULT: 5040 };
const LIFESPAN_TEST = { BABY1: 10, BABY2: 60, CHILD: 90, ADULT: 90 };

function newPet() {
  return {
    species: "BOTAMON", stage: "BABY1", alive: true, deathReason: null,
    awakeMin: 0, simMin: 8 * 60, // start 08:00
    hunger: 4, strength: 4, weight: 5,
    hungerTimer: DEPLETE, strengthTimer: DEPLETE, hungerPause: 60,
    poop: 0, poopTimer: POOP_EVERY,
    sick: false, injured: false, illSince: null, sicknessTotal: 0, injuryTotal: 0,
    asleep: false, sleepStart: null, lightsOff: false, energy: 4, energyMax: 4,
    callActive: false, callReason: null, callTimer: 0,
    careMistakes: 0, training: 0, trainEffort: 0, overfeed: 0, overfeedLock: false, sleepDisturb: 0,
    proteinCount: 0, preEnhancement: 0,
    emptyMeterSince: null,
    battle: { childWins: 13, childBattles: 15, adultWins: 13, adultBattles: 15 },
  };
}

// ---------- the engine: advance N sim-minutes, return {state, events} ----------
function simulate(s0, minutes, cfg) {
  const s = { ...s0, battle: { ...s0.battle } };
  const events = [];
  const LS = cfg.testLifespans ? LIFESPAN_TEST : LIFESPAN_REAL;
  const ev = (m, k) => events.push({ m: s.simMin, msg: m, kind: k });
  for (let i = 0; i < minutes && s.alive; i++) {
    s.simMin++;
    const tod = s.simMin % 1440;
    const night = tod >= BEDTIME || tod < WAKE;

    // sleep transitions
    if (!s.asleep && night) {
      if (s.lightsOff) { s.asleep = true; s.sleepStart = s.simMin; ev("Fell asleep", "dim"); }
    } else if (s.asleep && !night) {
      s.asleep = false; s.sleepStart = null; ev("Woke up (morning)", "dim");
    }

    if (!s.asleep) {
      s.awakeMin++;
      // hunger
      if (s.hungerPause > 0) s.hungerPause--;
      else if (--s.hungerTimer <= 0) { if (s.hunger > 0) s.hunger--; s.hungerTimer = DEPLETE; if (s.overfeedLock && s.hunger < 4) s.overfeedLock = false; }
      // strength
      if (--s.strengthTimer <= 0) { if (s.strength > 0) s.strength--; s.strengthTimer = DEPLETE; }
      // poop
      if (--s.poopTimer <= 0) { s.poop = Math.min(POOP_SICK, s.poop + 1); s.poopTimer = POOP_EVERY; if (s.poop >= POOP_SICK && !s.sick) { s.sick = true; s.sicknessTotal++; ev("Got sick (waste)", "warn"); } }
    } else if (s.simMin - s.sleepStart >= SLEEP_FULL) {
      s.energy = s.energyMax;
    }

    // weight sickness
    if (s.weight >= WEIGHT_SICK && !s.sick) { s.sick = true; s.sicknessTotal++; ev("Got sick (overweight)", "warn"); }

    // unmet need → call
    const needFood = s.hunger === 0 || s.strength === 0;
    const needLights = night && !s.lightsOff;
    const unmet = needFood || needLights;
    if (unmet && !s.callActive) { s.callActive = true; s.callTimer = CALL_WINDOW; s.callReason = needFood ? "hunger/strength" : "bedtime"; ev(`Call: ${s.callReason}`, "warn"); }
    if (s.callActive) {
      const stillUnmet = (s.callReason === "hunger/strength" ? needFood : needLights);
      if (!stillUnmet) { s.callActive = false; }
      else if (--s.callTimer <= 0) { s.careMistakes++; s.preEnhancement = Math.max(-4, s.preEnhancement - 1); s.callActive = false; ev(`Care mistake (#${s.careMistakes})`, "bad"); }
    }

    // empty-meter starvation clock
    if (s.hunger === 0 || s.strength === 0) { if (s.emptyMeterSince == null) s.emptyMeterSince = s.simMin; }
    else s.emptyMeterSince = null;

    // illness untreated clock
    if (s.sick || s.injured) { if (s.illSince == null) s.illSince = s.simMin; }
    else s.illSince = null;

    // death checks
    if (s.careMistakes + s.injuryTotal >= 20) die(s, "20 care mistakes + injuries");
    else if (s.sicknessTotal >= 20) die(s, "20 sicknesses");
    else if (s.injuryTotal >= 20) die(s, "20 injuries");
    else if (s.illSince != null && s.simMin - s.illSince >= UNTREATED_DEATH) die(s, "untreated illness ~6h");
    else if (s.emptyMeterSince != null && s.simMin - s.emptyMeterSince >= EMPTY_DEATH) die(s, "starvation ~6h");
    if (!s.alive) { ev(`DIED — ${s.deathReason}`, "bad"); break; }

    // evolution at stage timeout (awake time)
    const span = LS[s.stage];
    if (span && s.awakeMin >= span && s.stage !== "PERFECT") {
      const r = evaluate(s.species, s, s.battle);
      if (r.to) {
        const from = s.species;
        s.species = r.to; s.stage = ROSTER[r.to]; s.awakeMin = 0;
        s.careMistakes = 0; s.training = 0; s.trainEffort = 0; s.overfeed = 0; s.sleepDisturb = 0; s.preEnhancement = 0; s.proteinCount = 0;
        ev(`Evolved: ${from} → ${r.to}`, "good");
      } else if (r.hold) { s.awakeMin = 0; ev(`${s.species}: Perfect gate failed — holds at Adult`, "warn"); }
    }
  }
  return { state: s, events };
}
function die(s, reason) { s.alive = false; s.deathReason = reason; }

// ---------- actions ----------
const ACTIONS = {
  meat: (s) => { if (s.hunger >= 4) { if (!s.overfeedLock) { s.overfeed++; s.overfeedLock = true; } } else s.hunger++; s.weight++; },
  protein: (s) => { if (s.strength < 4) s.strength++; s.weight += 2; s.energy = Math.min(s.energyMax, s.energy + 1); if (++s.proteinCount % 4 === 0 && s.preEnhancement < 4) s.preEnhancement++; },
  clean: (s) => { s.poop = 0; },
  medicine: (s) => { s.sick = false; s.injured = false; s.illSince = null; },
  lights: (s) => { s.lightsOff = !s.lightsOff; },
  train: (s) => { s.training++; s.weight = Math.max(0, s.weight - 2); if (++s.trainEffort % 4 === 0 && s.strength < 4) s.strength++; },
  wake: (s) => { if (s.asleep) { s.asleep = false; s.sleepStart = null; s.sleepDisturb++; } },
};

// ---------- sprite ----------
function grid(name) {
  let h = 2166136261; for (let i = 0; i < name.length; i++) { h ^= name.charCodeAt(i); h = Math.imul(h, 16777619); }
  const rnd = () => { h += 0x6d2b79f5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const g = Array.from({ length: 12 }, () => Array(12).fill(0));
  for (let y = 2; y < 11; y++) for (let x = 0; x < 6; x++) { const e = x === 0 || y === 2 || y === 10; const on = rnd() > (e ? 0.62 : 0.38) ? 1 : 0; g[y][x] = on; g[y][11 - x] = on; }
  g[5][3] = 0; g[5][8] = 0; return g;
}
function Sprite({ name, asleep }) {
  const g = useMemo(() => grid(name), [name]);
  return <svg width={120} height={120} viewBox="0 0 12 12" style={{ imageRendering: "pixelated", opacity: asleep ? 0.5 : 1 }}>{g.map((r, y) => r.map((c, x) => c ? <rect key={x + "-" + y} x={x} y={y} width={1.02} height={1.02} fill="#2b3318" /> : null))}</svg>;
}

const INK = "#2b3318", LCD = "#c3d196";
const hhmm = (m) => `${String(Math.floor((m % 1440) / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export default function App() {
  const [pet, setPet] = useState(newPet);
  const [log, setLog] = useState([{ m: 480, msg: "Hatched → Botamon", kind: "good" }]);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(10); // sim-min per real second
  const [testLife, setTestLife] = useState(true);
  const petRef = useRef(pet); petRef.current = pet;

  const apply = (mins, label) => {
    const cur = petRef.current;
    if (!cur.alive) return;
    const { state, events } = simulate(cur, mins, { testLifespans: testLife });
    setPet(state);
    if (events.length) setLog((l) => [...events.slice(-12).reverse(), ...l].slice(0, 60));
    if (label) setLog((l) => [{ m: state.simMin, msg: label, kind: "dim" }, ...l].slice(0, 60));
  };
  const act = (k) => { const s = { ...petRef.current, battle: { ...petRef.current.battle } }; if (!s.alive) return; ACTIONS[k](s); setPet(s); };

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => { if (!petRef.current.alive) { setRunning(false); return; } apply(speed); }, 1000);
    return () => clearInterval(id);
  }, [running, speed, testLife]);

  const p = pet;
  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% 0%,#1d2024,#121316)", color: "#c9cdc2", fontFamily: "ui-monospace,Menlo,monospace", padding: "22px 14px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#eef0e8", letterSpacing: 1 }}>STAGE 3 — Care + Catch-Up Time Engine</div>
        <div style={{ fontSize: 11, color: "#8b9085", margin: "4px 0 16px", lineHeight: 1.6 }}>
          One minute-stepped engine drives live play <b>and</b> away-catch-up. Press play to live-tick, or jump time with the Away buttons — same code path, the mobile-correct pattern. The pet ages, accrues hidden counters, and evolves via the Stage 2 engine.
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
          {/* device */}
          <div style={{ width: 240, background: LCD, color: INK, borderRadius: 12, padding: 14, boxShadow: "inset 0 2px 8px rgba(0,0,0,.3)", backgroundImage: "repeating-linear-gradient(0deg,#aebd84 0 1px,transparent 1px 3px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 700 }}>
              <span>{p.stage}</span><span>{hhmm(p.simMin)} {p.asleep ? "z" : ""}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>{p.alive ? <Sprite name={p.species} asleep={p.asleep} /> : <div style={{ fontSize: 60 }}>✝</div>}</div>
            <div style={{ textAlign: "center", fontSize: 14, fontWeight: 800 }}>{p.alive ? p.species : "DEAD"}</div>
            {!p.alive && <div style={{ textAlign: "center", fontSize: 9 }}>{p.deathReason}</div>}
            <Meter label="Hunger" v={p.hunger} />
            <Meter label="Strength" v={p.strength} />
            <div style={{ fontSize: 9, marginTop: 8, lineHeight: 1.7 }}>
              <Row k="Weight" v={`${p.weight}G`} warn={p.weight >= WEIGHT_SICK} />
              <Row k="Poop" v={p.poop} warn={p.poop >= POOP_SICK} />
              <Row k="Status" v={p.sick ? "SICK" : p.injured ? "INJURED" : p.callActive ? `CALL ${p.callTimer}m` : "ok"} warn={p.sick || p.injured || p.callActive} />
              <Row k="Lights" v={p.lightsOff ? "off" : "on"} />
              <Row k="Energy" v={`${p.energy}/${p.energyMax}`} />
            </div>
          </div>

          {/* care actions */}
          <div style={{ flex: 1, minWidth: 300 }}>
            <Panel title="Care actions">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                <Act label="Meat" onClick={() => act("meat")} />
                <Act label="Protein" onClick={() => act("protein")} />
                <Act label="Clean" onClick={() => act("clean")} />
                <Act label="Medicine" onClick={() => act("medicine")} />
                <Act label={p.lightsOff ? "Lights On" : "Lights Off"} onClick={() => act("lights")} />
                <Act label="Train" onClick={() => act("train")} />
                <Act label="Wake" onClick={() => act("wake")} />
                <Act label="New Egg" onClick={() => { setPet(newPet()); setLog([{ m: 480, msg: "Hatched → Botamon", kind: "good" }]); setRunning(false); }} />
              </div>
            </Panel>

            <Panel title="Time engine" mt>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <button onClick={() => setRunning((r) => !r)} style={mainBtn(!p.alive)} disabled={!p.alive}>{running ? "⏸ PAUSE" : "▶ PLAY"}</button>
                <span style={{ fontSize: 10 }}>speed {speed} min/s</span>
                <input type="range" min={1} max={120} value={speed} onChange={(e) => setSpeed(+e.target.value)} />
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                <button onClick={() => apply(60, "— away 1h —")} style={ghost} disabled={!p.alive}>Away 1h</button>
                <button onClick={() => apply(360, "— away 6h —")} style={ghost} disabled={!p.alive}>Away 6h</button>
                <button onClick={() => apply(1440, "— away 24h —")} style={ghost} disabled={!p.alive}>Away 24h</button>
              </div>
              <label style={{ fontSize: 10, display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                <input type="checkbox" checked={testLife} onChange={(e) => setTestLife(e.target.checked)} />
                test lifespans (short — watch full evolution; off = real spec values)
              </label>
            </Panel>

            <Panel title="Hidden counters (this stage)" mt>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, fontSize: 10 }}>
                <Cnt k="Care" v={p.careMistakes} /><Cnt k="Train" v={p.training} /><Cnt k="Overfeed" v={p.overfeed} />
                <Cnt k="SleepDist" v={p.sleepDisturb} /><Cnt k="PreEnh" v={p.preEnhancement} /><Cnt k="Awake" v={`${p.awakeMin}m`} />
                <Cnt k="SickTot" v={p.sicknessTotal} /><Cnt k="InjTot" v={p.injuryTotal} /><Cnt k="Age" v={`${Math.floor(p.simMin / 1440)}d`} />
              </div>
            </Panel>
          </div>
        </div>

        <Panel title="Event log" mt>
          <div style={{ fontSize: 11, lineHeight: 1.6, maxHeight: 200, overflowY: "auto" }}>
            {log.map((e, i) => <div key={i} style={{ color: { good: "#bcd27a", warn: "#e0a526", bad: "#e0653a", dim: "#6f746a" }[e.kind] || "#c9cdc2" }}><span style={{ opacity: 0.5 }}>{hhmm(e.m)}</span> {e.msg}</div>)}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Meter({ label, v }) {
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ fontSize: 9, fontWeight: 700 }}>{label}</div>
      <div style={{ display: "flex", gap: 3 }}>{[0, 1, 2, 3].map((i) => <div key={i} style={{ width: 16, height: 11, border: `1.5px solid ${INK}`, background: i < v ? INK : "transparent" }} />)}</div>
    </div>
  );
}
const Row = ({ k, v, warn }) => <div style={{ display: "flex", justifyContent: "space-between", fontWeight: warn ? 800 : 400 }}><span>{k}</span><span>{v}</span></div>;
function Panel({ title, children, mt }) { return <div style={{ background: "#191c1f", border: "1px solid #23262a", borderRadius: 10, padding: 12, marginTop: mt ? 14 : 0 }}><div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: "#8b9085", marginBottom: 8, textTransform: "uppercase" }}>{title}</div>{children}</div>; }
const Act = ({ label, onClick }) => <button onClick={onClick} style={{ background: "#2c302a", color: "#dfe3d6", border: "1px solid #3a4038", borderRadius: 8, padding: "10px 4px", cursor: "pointer", fontWeight: 700, fontSize: 10, fontFamily: "ui-monospace,monospace" }}>{label}</button>;
const Cnt = ({ k, v }) => <div style={{ background: "#15171a", borderRadius: 6, padding: "6px 8px", display: "flex", justifyContent: "space-between" }}><span style={{ color: "#8b9085" }}>{k}</span><span style={{ color: "#eef0e8", fontWeight: 800 }}>{v}</span></div>;
const ghost = { background: "#2c302a", color: "#dfe3d6", border: "1px solid #3a4038", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontWeight: 800, fontSize: 11, fontFamily: "ui-monospace,monospace" };
const mainBtn = (dis) => ({ background: dis ? "#23262a" : "#bcd27a", color: dis ? "#5a5f55" : "#1b1d16", border: "none", borderRadius: 8, padding: "8px 16px", cursor: dis ? "default" : "pointer", fontWeight: 800, fontSize: 12, fontFamily: "ui-monospace,monospace" });
