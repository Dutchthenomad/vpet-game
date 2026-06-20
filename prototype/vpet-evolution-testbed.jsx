import { useState, useMemo } from "react";

/* ============================================================
   STAGE 2 v1 — EVOLUTION ENGINE TESTBED
   Verifies the Ver.1 branch table (spec §6) produces the right
   Digimon for any counter state. Data-driven: the engine reads
   EVO_DATA (the same JSON the real build imports). Counters are
   set manually or by one-click recipes; every evolution logs the
   matched branch and the exact conditions that passed.
   Care/time (Stage 3) and real battle power (Stage 4) are NOT
   modeled here — battle stats are entered directly to drive the
   Adult→Perfect gate.
   ============================================================ */

const STAGES = ["EGG", "BABY1", "BABY2", "CHILD", "ADULT", "PERFECT"];
const nextStage = (s) => STAGES[STAGES.indexOf(s) + 1] ?? null;

// ---- Ver.1 evolution data (engine content file) ----
const EVO_DATA = {
  version: "Digital Monster Ver.1",
  hatch: "BOTAMON",
  roster: {
    BOTAMON: "BABY1", KOROMON: "BABY2",
    AGUMON: "CHILD", BETAMON: "CHILD",
    GREYMON: "ADULT", DEVIMON: "ADULT", TYRANOMON: "ADULT",
    MERAMON: "ADULT", AIRDRAMON: "ADULT", SEADRAMON: "ADULT", NUMEMON: "ADULT",
    METALGREYMON: "PERFECT", MAMEMON: "PERFECT", MONZAEMON: "PERFECT",
  },
  branches: [
    { from: "BOTAMON", to: "KOROMON", conditions: null },

    { from: "KOROMON", to: "AGUMON",  conditions: { careMistakes: [0, 3] } },
    { from: "KOROMON", to: "BETAMON", conditions: { careMistakes: [4, 99] } },

    { from: "AGUMON", to: "GREYMON",   conditions: { careMistakes: [0, 3], training: [32, 999] } },
    { from: "AGUMON", to: "DEVIMON",   conditions: { careMistakes: [0, 3], training: [0, 31] } },
    { from: "AGUMON", to: "TYRANOMON", conditions: { careMistakes: [4, 99], training: [5, 15], overfeed: [3, 99], sleepDisturb: [0, 4] } },
    { from: "AGUMON", to: "MERAMON",   conditions: { careMistakes: [4, 99], training: [16, 999], overfeed: [3, 99], sleepDisturb: [0, 6] } },
    { from: "AGUMON", to: "NUMEMON",   fallback: true },

    { from: "BETAMON", to: "DEVIMON",   conditions: { careMistakes: [0, 3], training: [48, 999] } },
    { from: "BETAMON", to: "MERAMON",   conditions: { careMistakes: [0, 3], training: [0, 47] } },
    { from: "BETAMON", to: "AIRDRAMON", conditions: { careMistakes: [4, 99], training: [8, 31], overfeed: [0, 3], sleepDisturb: [9, 99] } },
    { from: "BETAMON", to: "SEADRAMON", conditions: { careMistakes: [4, 99], training: [8, 31], overfeed: [4, 99], sleepDisturb: [0, 8] } },
    { from: "BETAMON", to: "NUMEMON",   fallback: true },

    { from: "GREYMON",   to: "METALGREYMON", conditions: { battleGate: true } },
    { from: "DEVIMON",   to: "METALGREYMON", conditions: { battleGate: true } },
    { from: "AIRDRAMON", to: "METALGREYMON", conditions: { battleGate: true } },
    { from: "TYRANOMON", to: "MAMEMON",      conditions: { battleGate: true } },
    { from: "MERAMON",   to: "MAMEMON",      conditions: { battleGate: true } },
    { from: "SEADRAMON", to: "MAMEMON",      conditions: { battleGate: true } },
    { from: "NUMEMON",   to: "MONZAEMON",    conditions: { battleGate: true } },
  ],
  gate: { minBattles: 15, minWins: 12, minRatio: 0.8 },
};

const COUNTER_KEYS = ["careMistakes", "training", "overfeed", "sleepDisturb"];
const COUNTER_LABEL = { careMistakes: "Care Mistakes", training: "Training", overfeed: "Overfeed", sleepDisturb: "Sleep Disturb" };

// which counters actually gate the transition out of this species
function relevantCounters(species) {
  const set = new Set();
  EVO_DATA.branches.filter((b) => b.from === species && b.conditions).forEach((b) => {
    Object.keys(b.conditions).forEach((k) => { if (COUNTER_KEYS.includes(k)) set.add(k); });
  });
  return set;
}

// ---- gate evaluation ----
function gateResult(battle, opts) {
  const { childWins, childBattles, adultWins, adultBattles } = battle;
  const ratio = (childWins + adultWins) / Math.max(1, childBattles + adultBattles);
  const reqMet =
    childBattles >= EVO_DATA.gate.minBattles && adultBattles >= EVO_DATA.gate.minBattles &&
    childWins >= EVO_DATA.gate.minWins && adultWins >= EVO_DATA.gate.minWins &&
    ratio >= EVO_DATA.gate.minRatio;
  const detail = `battles ${childBattles}/${adultBattles}, wins ${childWins}/${adultWins}, ratio ${(ratio * 100).toFixed(0)}%`;
  if (!reqMet) return { pass: false, reason: `requirements not met (${detail})` };
  if (opts.forceGate) return { pass: true, reason: `requirements met (${detail}); forced pass` };
  const roll = Math.random();
  return { pass: roll < opts.gateProb, reason: `requirements met (${detail}); roll ${(roll * 100).toFixed(0)}% vs ${(opts.gateProb * 100).toFixed(0)}%` };
}

const inRange = (v, [lo, hi]) => v >= lo && v <= hi;

// ---- core evaluation: returns the chosen branch + human reason ----
function evaluate(species, counters, battle, opts) {
  const branches = EVO_DATA.branches.filter((b) => b.from === species);
  if (branches.length === 0) return { terminal: true };

  // battle-gated step (Adult→Perfect): single branch with battleGate
  if (branches.length === 1 && branches[0].conditions?.battleGate) {
    const g = gateResult(battle, opts);
    const b = branches[0];
    if (g.pass) return { to: b.to, branch: b, reason: `gate PASS — ${g.reason}` };
    return { hold: true, reason: `gate FAIL — ${g.reason}; stays ${species}` };
  }

  let fallback = null;
  for (const b of branches) {
    if (b.fallback) { fallback = b; continue; }
    const conds = b.conditions || {};
    const checks = COUNTER_KEYS.filter((k) => conds[k]).map((k) => ({ k, ok: inRange(counters[k], conds[k]), range: conds[k], val: counters[k] }));
    if (checks.every((c) => c.ok)) {
      const why = checks.map((c) => `${c.k}∈[${c.range[0]},${c.range[1]}] (=${c.val})`).join(", ");
      return { to: b.to, branch: b, reason: why || "unconditional" };
    }
  }
  if (fallback) return { to: fallback.to, branch: fallback, reason: "no branch matched → fallback" };
  return { terminal: true };
}

// ---- procedural placeholder sprite (deterministic per species) ----
function spriteGrid(name) {
  let h = 2166136261;
  for (let i = 0; i < name.length; i++) { h ^= name.charCodeAt(i); h = Math.imul(h, 16777619); }
  const rnd = () => { h += 0x6d2b79f5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const W = 12, H = 12, g = Array.from({ length: H }, () => Array(W).fill(0));
  for (let y = 2; y < H - 1; y++) {
    for (let x = 0; x < W / 2; x++) {
      const edge = x === 0 || y === 2 || y === H - 2;
      const on = rnd() > (edge ? 0.62 : 0.38) ? 1 : 0;
      g[y][x] = on; g[y][W - 1 - x] = on;
    }
  }
  // carve eyes
  g[5][3] = 0; g[5][W - 4] = 0;
  return g;
}
function Sprite({ name, size = 9 }) {
  const g = useMemo(() => spriteGrid(name), [name]);
  return (
    <svg width={12 * size} height={12 * size} viewBox="0 0 12 12" style={{ imageRendering: "pixelated" }}>
      {g.map((row, y) => row.map((c, x) => (c ? <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill="#2b3318" /> : null)))}
    </svg>
  );
}

// ---- recipes (assertions: full egg→Perfect runs) ----
const RECIPES = [
  { name: "Greymon → MetalGreymon", expect: "METALGREYMON",
    plan: { BABY2: { careMistakes: 0 }, CHILD: { careMistakes: 0, training: 40 }, battle: fullWin() } },
  { name: "Devimon(Agu) → MetalGreymon", expect: "METALGREYMON",
    plan: { BABY2: { careMistakes: 0 }, CHILD: { careMistakes: 0, training: 10 }, battle: fullWin() } },
  { name: "Tyranomon → Mamemon", expect: "MAMEMON",
    plan: { BABY2: { careMistakes: 0 }, CHILD: { careMistakes: 5, training: 10, overfeed: 4, sleepDisturb: 2 }, battle: fullWin() } },
  { name: "Meramon(Agu) → Mamemon", expect: "MAMEMON",
    plan: { BABY2: { careMistakes: 0 }, CHILD: { careMistakes: 5, training: 20, overfeed: 4, sleepDisturb: 2 }, battle: fullWin() } },
  { name: "Numemon → Monzaemon", expect: "MONZAEMON",
    plan: { BABY2: { careMistakes: 0 }, CHILD: { careMistakes: 5, training: 0, overfeed: 0, sleepDisturb: 0 }, battle: fullWin() } },
  { name: "Betamon → Airdramon → MetalGreymon", expect: "METALGREYMON",
    plan: { BABY2: { careMistakes: 5 }, CHILD: { careMistakes: 5, training: 15, overfeed: 0, sleepDisturb: 10 }, battle: fullWin() } },
  { name: "Betamon → Seadramon → Mamemon", expect: "MAMEMON",
    plan: { BABY2: { careMistakes: 5 }, CHILD: { careMistakes: 5, training: 15, overfeed: 5, sleepDisturb: 2 }, battle: fullWin() } },
  { name: "Betamon → Devimon → MetalGreymon", expect: "METALGREYMON",
    plan: { BABY2: { careMistakes: 5 }, CHILD: { careMistakes: 0, training: 50 }, battle: fullWin() } },
];
function fullWin() { return { childWins: 13, childBattles: 15, adultWins: 13, adultBattles: 15 }; }
function zeroCounters() { return { careMistakes: 0, training: 0, overfeed: 0, sleepDisturb: 0 }; }

// run a recipe deterministically (forceGate) -> terminal species + path
function runRecipe(plan) {
  let species = EVO_DATA.hatch, stage = "BABY1";
  const path = [species];
  // BABY1 -> BABY2 (unconditional)
  let r = evaluate(species, zeroCounters(), {}, { forceGate: true });
  species = r.to; stage = "BABY2"; path.push(species);
  // BABY2 -> CHILD
  r = evaluate(species, { ...zeroCounters(), ...plan.BABY2 }, {}, { forceGate: true });
  species = r.to; stage = "CHILD"; path.push(species);
  // CHILD -> ADULT
  r = evaluate(species, { ...zeroCounters(), ...plan.CHILD }, {}, { forceGate: true });
  species = r.to; stage = "ADULT"; path.push(species);
  // ADULT -> PERFECT
  r = evaluate(species, zeroCounters(), plan.battle, { forceGate: true });
  if (r.to) { species = r.to; path.push(species); }
  return { terminal: species, path };
}

// ---------- UI ----------
const INK = "#2b3318", LCD = "#c3d196";
export default function App() {
  const [species, setSpecies] = useState(EVO_DATA.hatch);
  const [stage, setStage] = useState("BABY1");
  const [counters, setCounters] = useState(zeroCounters());
  const [battle, setBattle] = useState(fullWin());
  const [log, setLog] = useState([{ msg: "Hatched → Botamon (Baby I)", kind: "ok" }]);
  const [forceGate, setForceGate] = useState(true);
  const [gateProb, setGateProb] = useState(0.6);
  const [recipeResults, setRecipeResults] = useState(null);

  const rel = useMemo(() => relevantCounters(species), [species]);
  const atAdult = stage === "ADULT";
  const terminal = stage === "PERFECT";

  const setC = (k, d) => setCounters((c) => ({ ...c, [k]: Math.max(0, c[k] + d) }));
  const setB = (k, d) => setBattle((b) => ({ ...b, [k]: Math.max(0, b[k] + d) }));

  const advance = () => {
    const r = evaluate(species, counters, battle, { forceGate, gateProb });
    if (r.terminal) { pushLog(`${species} is terminal (Perfect).`, "dim"); return; }
    if (r.hold) { pushLog(`${species} (Adult) → ${r.reason}`, "warn"); return; }
    const ns = nextStage(stage);
    pushLog(`${stage} ${species} → ${EVO_DATA.roster[r.to]} ${r.to}  |  ${r.reason}`, "ok");
    setSpecies(r.to); setStage(EVO_DATA.roster[r.to]);
    setCounters(zeroCounters()); // per-stage counters reset on evolution
  };
  const pushLog = (msg, kind) => setLog((l) => [{ msg, kind }, ...l].slice(0, 14));
  const reset = () => { setSpecies(EVO_DATA.hatch); setStage("BABY1"); setCounters(zeroCounters()); setBattle(fullWin()); setLog([{ msg: "Hatched → Botamon (Baby I)", kind: "ok" }]); };

  const runAllRecipes = () => {
    const res = RECIPES.map((rc) => { const out = runRecipe(rc.plan); return { ...rc, got: out.terminal, path: out.path, pass: out.terminal === rc.expect }; });
    setRecipeResults(res);
  };

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% 0%,#1d2024,#121316)", color: "#c9cdc2", fontFamily: "ui-monospace,Menlo,monospace", padding: "24px 16px" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#eef0e8", letterSpacing: 1 }}>STAGE 2 — Evolution Engine Testbed</div>
        <div style={{ fontSize: 11, color: "#8b9085", marginBottom: 18, lineHeight: 1.6 }}>
          Data-driven Ver.1 branch table (the same JSON the build imports). Set the hidden counters, advance the stage, and the engine shows which branch matched and why. Battle stats drive the Adult→Perfect gate. Care/time and real battle power come in Stages 3–4.
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
          {/* device / current pet */}
          <div style={{ background: LCD, color: INK, borderRadius: 10, padding: 16, width: 220, boxShadow: "inset 0 2px 8px rgba(0,0,0,.3)", backgroundImage: "repeating-linear-gradient(0deg,#aebd84 0 1px,transparent 1px 3px)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, display: "flex", justifyContent: "space-between" }}>
              <span>{stage}</span><span>{EVO_DATA.version.split(" ").pop()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "center", padding: "14px 0" }}><Sprite name={species} size={10} /></div>
            <div style={{ textAlign: "center", fontSize: 14, fontWeight: 800 }}>{species}</div>
            <div style={{ marginTop: 12, fontSize: 9, lineHeight: 1.7 }}>
              {COUNTER_KEYS.map((k) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", opacity: rel.has(k) ? 1 : 0.4 }}>
                  <span>{COUNTER_LABEL[k]}{rel.has(k) ? " ◂" : ""}</span><span>{counters[k]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* controls */}
          <div style={{ flex: 1, minWidth: 320 }}>
            <Panel title={`Hidden counters${terminal ? " (terminal — none apply)" : rel.size ? "  ◂ = gates this evolution" : "  (unconditional step)"}`}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {COUNTER_KEYS.map((k) => (
                  <Stepper key={k} label={COUNTER_LABEL[k]} value={counters[k]} dim={!rel.has(k)} onMinus={() => setC(k, -1)} onPlus={() => setC(k, 1)} onBig={() => setC(k, 10)} />
                ))}
              </div>
            </Panel>

            {atAdult && (
              <Panel title="Battle stats (Adult→Perfect gate)">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Stepper label="Child wins" value={battle.childWins} onMinus={() => setB("childWins", -1)} onPlus={() => setB("childWins", 1)} onBig={() => setB("childWins", 5)} />
                  <Stepper label="Child battles" value={battle.childBattles} onMinus={() => setB("childBattles", -1)} onPlus={() => setB("childBattles", 1)} onBig={() => setB("childBattles", 5)} />
                  <Stepper label="Adult wins" value={battle.adultWins} onMinus={() => setB("adultWins", -1)} onPlus={() => setB("adultWins", 1)} onBig={() => setB("adultWins", 5)} />
                  <Stepper label="Adult battles" value={battle.adultBattles} onMinus={() => setB("adultBattles", -1)} onPlus={() => setB("adultBattles", 1)} onBig={() => setB("adultBattles", 5)} />
                </div>
                <label style={{ fontSize: 10, display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                  <input type="checkbox" checked={forceGate} onChange={(e) => setForceGate(e.target.checked)} />
                  force gate pass when requirements met (off = stochastic, p={gateProb.toFixed(2)})
                </label>
                {!forceGate && <input type="range" min={0} max={1} step={0.05} value={gateProb} onChange={(e) => setGateProb(+e.target.value)} style={{ width: "100%" }} />}
              </Panel>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={advance} disabled={terminal} style={mainBtn(terminal)}>ADVANCE STAGE →</button>
              <button onClick={reset} style={ghostBtn}>RESET EGG</button>
            </div>
          </div>
        </div>

        {/* log */}
        <Panel title="Evolution log (matched branch + reason)" mt>
          <div style={{ fontSize: 11, lineHeight: 1.7 }}>
            {log.map((e, i) => (
              <div key={i} style={{ color: e.kind === "ok" ? "#bcd27a" : e.kind === "warn" ? "#e0a526" : "#6f746a" }}>{e.msg}</div>
            ))}
          </div>
        </Panel>

        {/* recipe assertions */}
        <Panel title="Recipe assertions — does the table produce the right Digimon every run?" mt>
          <button onClick={runAllRecipes} style={{ ...ghostBtn, marginBottom: 10 }}>RUN ALL RECIPES</button>
          {recipeResults && (
            <div style={{ fontSize: 11 }}>
              <div style={{ marginBottom: 6, color: recipeResults.every((r) => r.pass) ? "#bcd27a" : "#e0a526" }}>
                {recipeResults.filter((r) => r.pass).length}/{recipeResults.length} passed
              </div>
              {recipeResults.map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid #23262a" }}>
                  <span>{r.pass ? "✓" : "✗"} {r.name}</span>
                  <span style={{ color: r.pass ? "#6f746a" : "#e0653a" }}>{r.path.join(" → ")}{r.pass ? "" : `  (expected ${r.expect})`}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, children, mt }) {
  return (
    <div style={{ background: "#191c1f", border: "1px solid #23262a", borderRadius: 10, padding: 12, marginTop: mt ? 14 : 0 }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: "#8b9085", marginBottom: 8, textTransform: "uppercase" }}>{title}</div>
      {children}
    </div>
  );
}
function Stepper({ label, value, onMinus, onPlus, onBig, dim }) {
  return (
    <div style={{ background: "#15171a", borderRadius: 8, padding: 8, opacity: dim ? 0.5 : 1 }}>
      <div style={{ fontSize: 9, color: "#8b9085", marginBottom: 4 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button onClick={onMinus} style={miniBtn}>−</button>
        <span style={{ flex: 1, textAlign: "center", fontSize: 14, fontWeight: 800, color: "#eef0e8" }}>{value}</span>
        <button onClick={onPlus} style={miniBtn}>+</button>
        <button onClick={onBig} style={{ ...miniBtn, fontSize: 9 }}>+10</button>
      </div>
    </div>
  );
}
const miniBtn = { background: "#2c302a", color: "#dfe3d6", border: "1px solid #3a4038", borderRadius: 6, width: 26, height: 26, cursor: "pointer", fontWeight: 800 };
const ghostBtn = { background: "#2c302a", color: "#dfe3d6", border: "1px solid #3a4038", borderRadius: 8, padding: "10px 14px", cursor: "pointer", fontWeight: 800, fontSize: 11, letterSpacing: 1, fontFamily: "ui-monospace,monospace" };
const mainBtn = (dis) => ({ flex: 1, background: dis ? "#23262a" : "#bcd27a", color: dis ? "#5a5f55" : "#1b1d16", border: "none", borderRadius: 8, padding: "10px 14px", cursor: dis ? "default" : "pointer", fontWeight: 800, fontSize: 12, letterSpacing: 1, fontFamily: "ui-monospace,monospace" });
