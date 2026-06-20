import { useReducer, useEffect, useRef, useState } from "react";

/* ============================================================
   V-PET BATTLE — MVP dev harness
   ------------------------------------------------------------
   Two independent "devices" (Device components) talk ONLY through
   a Transport. Right now that transport is an in-memory bus that
   mimics a network (async + artificial latency). Neither device
   reads the other's state directly — same constraint as real
   WiFi/BLE. To go to real devices later, replace makeBus() with a
   WebSocketTransport exposing the same { send, subscribe } shape.
   Nothing else changes.
   ============================================================ */

// ---------- Transport (swap this layer later) ----------
function makeBus() {
  const subs = [];
  let latency = 120;
  return {
    setLatency: (ms) => { latency = ms; },
    subscribe(id, handler) {
      const s = { id, handler };
      subs.push(s);
      return () => { const i = subs.indexOf(s); if (i >= 0) subs.splice(i, 1); };
    },
    send(fromId, msg) {
      const payload = { ...msg, from: fromId };
      subs.forEach((s) => {
        if (s.id !== fromId) setTimeout(() => s.handler(payload), latency);
      });
    },
  };
}

// ---------- Game constants ----------
const MAX_HP = 24;
const BASE_ATK = 4;
const MAX_CHARGE = 3;
const BLOCK = 4;
const cap = (c) => Math.min(MAX_CHARGE, Math.max(0, c));
const power = (p) => p.atk + p.charge * 3;

// Deterministic, symmetric round resolution. Both devices run this
// with identical inputs -> identical result -> no desync, no RNG.
function outcome(a, b) {
  let aTake = 0, bTake = 0, aCharge = a.charge, bCharge = b.charge;
  const A = a.action, B = b.action;
  if (A === "ATTACK" && B === "ATTACK") { bTake = power(a); aTake = power(b); aCharge = 0; bCharge = 0; }
  else if (A === "ATTACK" && B === "DEFEND") { bTake = Math.max(0, power(a) - BLOCK); aCharge = 0; }
  else if (A === "ATTACK" && B === "CHARGE") { bTake = power(a); aCharge = 0; bCharge = 0; }
  else if (A === "DEFEND" && B === "ATTACK") { aTake = Math.max(0, power(b) - BLOCK); bCharge = 0; }
  else if (A === "DEFEND" && B === "DEFEND") { /* standoff */ }
  else if (A === "DEFEND" && B === "CHARGE") { bCharge = b.charge + 1; }
  else if (A === "CHARGE" && B === "ATTACK") { aTake = power(b); aCharge = 0; bCharge = 0; }
  else if (A === "CHARGE" && B === "DEFEND") { aCharge = a.charge + 1; }
  else if (A === "CHARGE" && B === "CHARGE") { aCharge = a.charge + 1; bCharge = b.charge + 1; }
  return { aTake, bTake, aCharge: cap(aCharge), bCharge: cap(bCharge) };
}

// ---------- Creatures (monochrome 12x12, x = ink pixel) ----------
const CREATURES = {
  korvox: {
    name: "KORVOX",
    px: [
      "............",
      "...x....x...",
      "...x....x...",
      "..xxxxxxxx..",
      ".xxxxxxxxxx.",
      ".xx.xxxx.xx.",
      ".xx.xxxx.xx.",
      ".xxxxxxxxxx.",
      ".xxx.xx.xxx.",
      ".xxxxxxxxxx.",
      "..xx....xx..",
      "............",
    ],
  },
  finlet: {
    name: "FINLET",
    px: [
      "............",
      ".....xx.....",
      "....xxxx....",
      "...xxxxxx...",
      "..xxxxxxxx..",
      ".xx.xxxx.xx.",
      ".xxxxxxxxxx.",
      ".xxxxxxxxxx.",
      "..xxxxxxxx..",
      "...xxxxxx...",
      "....x..x....",
      "............",
    ],
  },
};

const INK = "#2b3318";
const LCD = "#c3d196";
const LCD_DIM = "#aebd84";
const SHELL = "#3a4038";
const SHELL_HI = "#4b5247";
const AMBER = "#e0a526";

function Sprite({ px, size = 7, flip = false, hit = false }) {
  const w = px[0].length, h = px.length;
  return (
    <svg
      width={w * size} height={h * size}
      viewBox={`0 0 ${w} ${h}`}
      style={{
        imageRendering: "pixelated",
        transform: flip ? "scaleX(-1)" : "none",
        transition: "filter .08s",
        filter: hit ? "invert(1)" : "none",
      }}
    >
      {px.map((row, y) =>
        row.split("").map((c, x) =>
          c === "x" ? <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={INK} /> : null
        )
      )}
    </svg>
  );
}

function HpBar({ hp }) {
  const seg = 12;
  const filled = Math.round((hp / MAX_HP) * seg);
  return (
    <div style={{ display: "flex", gap: 1.5 }}>
      {Array.from({ length: seg }).map((_, i) => (
        <div key={i} style={{ width: 7, height: 9, background: i < filled ? INK : "transparent", border: `1px solid ${INK}`, opacity: i < filled ? 1 : 0.35 }} />
      ))}
    </div>
  );
}

function Charge({ c }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: MAX_CHARGE }).map((_, i) => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", border: `1.5px solid ${INK}`, background: i < c ? INK : "transparent" }} />
      ))}
    </div>
  );
}

// ---------- Per-device reducer ----------
function initState(myName) {
  return {
    phase: "init",           // init | choosing | waiting | over
    connected: false,
    round: 1,
    myAtk: BASE_ATK, oppAtk: BASE_ATK,
    myHp: MAX_HP, oppHp: MAX_HP,
    myCharge: 0, oppCharge: 0,
    myMove: null, oppMove: null,
    winner: null,            // me | opp | draw
    myName, oppName: "????",
    log: [],
  };
}

function resolveIfReady(st, order) {
  if (!st.myMove || !st.oppMove) return st;
  const me = { action: st.myMove, charge: st.myCharge, atk: st.myAtk };
  const op = { action: st.oppMove, charge: st.oppCharge, atk: st.oppAtk };
  // fixed ordering so both devices compute identically
  const meFirst = order[0] === "me";
  const a = meFirst ? me : op, b = meFirst ? op : me;
  const r = outcome(a, b);
  const myTake = meFirst ? r.aTake : r.bTake;
  const opTake = meFirst ? r.bTake : r.aTake;
  const myCharge = meFirst ? r.aCharge : r.bCharge;
  const opCharge = meFirst ? r.bCharge : r.aCharge;

  const myHp = Math.max(0, st.myHp - myTake);
  const oppHp = Math.max(0, st.oppHp - opTake);
  const line = `R${st.round}  ${st.myName} ${st.myMove} / ${st.oppName} ${st.oppMove}` +
    (myTake || opTake ? `  →  ${opTake ? st.oppName + " -" + opTake : ""}${opTake && myTake ? ", " : ""}${myTake ? st.myName + " -" + myTake : ""}` : "  →  standoff");

  let phase = "choosing", winner = null, myAtk = st.myAtk, oppAtk = st.oppAtk;
  if (myHp <= 0 || oppHp <= 0) {
    phase = "over";
    winner = myHp <= 0 && oppHp <= 0 ? "draw" : oppHp <= 0 ? "me" : "opp";
    if (winner === "me") myAtk += 1;
    if (winner === "opp") oppAtk += 1;
  }
  return {
    ...st, myHp, oppHp, myCharge, oppCharge: opCharge,
    myMove: null, oppMove: null, round: st.round + 1,
    phase, winner, myAtk, oppAtk,
    log: [line, ...st.log].slice(0, 6),
  };
}

function reducer(order) {
  return (st, ev) => {
    switch (ev.t) {
      case "HELLO": {
        const next = { ...st, connected: true, oppName: ev.name, oppAtk: ev.atk };
        if (st.phase === "init") next.phase = "choosing";
        return next;
      }
      case "CHOOSE": {
        if (st.phase !== "choosing") return st;
        return resolveIfReady({ ...st, myMove: ev.action, phase: "waiting" }, order);
      }
      case "OPP_MOVE": {
        if (ev.round !== st.round) return st;
        return resolveIfReady({ ...st, oppMove: ev.action }, order);
      }
      case "REMATCH":
        return {
          ...st, phase: "choosing", round: 1,
          myHp: MAX_HP, oppHp: MAX_HP, myCharge: 0, oppCharge: 0,
          myMove: null, oppMove: null, winner: null,
          log: ["— rematch —", ...st.log].slice(0, 6),
        };
      default:
        return st;
    }
  };
}

// ---------- Device ----------
function Device({ playerId, oppId, name, creatureKey, bus }) {
  const order = [playerId, oppId].sort().map((id) => (id === playerId ? "me" : "opp"));
  const [st, dispatch] = useReducer(reducer(order), name, initState);
  const stRef = useRef(st); stRef.current = st;
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const unsub = bus.subscribe(playerId, (msg) => {
      if (msg.t === "HELLO") {
        dispatch({ t: "HELLO", name: msg.name, atk: msg.atk });
        // reply so a late-mounting peer learns us
        bus.send(playerId, { t: "HELLO", name, atk: stRef.current.myAtk });
      } else if (msg.t === "MOVE") {
        dispatch({ t: "OPP_MOVE", round: msg.round, action: msg.action });
      } else if (msg.t === "REMATCH") {
        dispatch({ t: "REMATCH" });
      }
    });
    bus.send(playerId, { t: "HELLO", name, atk: BASE_ATK });
    return unsub;
  }, [bus, playerId, name]);

  // flash sprite on damage
  const prevHp = useRef({ my: MAX_HP, opp: MAX_HP });
  useEffect(() => {
    if (st.myHp < prevHp.current.my || st.oppHp < prevHp.current.opp) {
      setFlash(true); const id = setTimeout(() => setFlash(false), 120);
      prevHp.current = { my: st.myHp, opp: st.oppHp };
      return () => clearTimeout(id);
    }
    prevHp.current = { my: st.myHp, opp: st.oppHp };
  }, [st.myHp, st.oppHp]);

  const choose = (action) => {
    dispatch({ t: "CHOOSE", action });
    bus.send(playerId, { t: "MOVE", round: stRef.current.round, action });
  };
  const rematch = () => { bus.send(playerId, { t: "REMATCH" }); dispatch({ t: "REMATCH" }); };

  const myCr = CREATURES[creatureKey];
  const oppCr = creatureKey === "korvox" ? CREATURES.finlet : CREATURES.korvox;
  const status =
    !st.connected ? "LINKING…" :
    st.phase === "over" ? (st.winner === "me" ? "VICTORY" : st.winner === "opp" ? "DEFEAT" : "DRAW") :
    st.phase === "waiting" ? "WAIT…" : "YOUR MOVE";

  return (
    <div style={{ width: 300 }}>
      {/* shell */}
      <div style={{
        background: `linear-gradient(160deg, ${SHELL_HI}, ${SHELL})`,
        borderRadius: 26, padding: 18, boxShadow: "0 8px 30px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.06)",
        border: "1px solid rgba(0,0,0,.4)",
      }}>
        {/* top label + LED */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, color: "#cfd3c7", fontSize: 10, letterSpacing: 2, fontFamily: "ui-monospace,Menlo,monospace" }}>
          <span>{name}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: st.connected ? AMBER : "#5a5f55", boxShadow: st.connected ? `0 0 6px ${AMBER}` : "none" }} />
            v-pet
          </span>
        </div>

        {/* LCD */}
        <div style={{
          background: LCD, borderRadius: 8, padding: 12, position: "relative",
          boxShadow: "inset 0 2px 8px rgba(0,0,0,.35)", color: INK,
          fontFamily: "ui-monospace,Menlo,monospace",
          backgroundImage: `repeating-linear-gradient(0deg, ${LCD_DIM} 0 1px, transparent 1px 3px)`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>
            <span>RND {st.round > 1 && st.phase !== "over" ? st.round : st.phase === "over" ? st.round - 1 : 1}</span>
            <span>{status}</span>
          </div>

          {/* opponent (top, facing down) */}
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 9, fontWeight: 700 }}>{st.oppName}  ATK {st.oppAtk}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 3 }}>
              <Sprite px={oppCr.px} flip hit={flash && st.oppHp < prevHp.current.opp} />
              <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                <HpBar hp={st.oppHp} /><Charge c={st.oppCharge} />
              </div>
            </div>
          </div>

          <div style={{ borderTop: `2px dashed ${INK}`, opacity: 0.5, margin: "8px 0" }} />

          {/* me (bottom) */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <HpBar hp={st.myHp} /><Charge c={st.myCharge} />
              </div>
              <Sprite px={myCr.px} hit={flash && st.myHp < prevHp.current.my} />
            </div>
            <div style={{ fontSize: 9, fontWeight: 700, textAlign: "right" }}>{st.myName}  ATK {st.myAtk}</div>
          </div>

          {/* log */}
          <div style={{ marginTop: 8, fontSize: 8, lineHeight: 1.5, minHeight: 40, opacity: 0.85 }}>
            {st.log.map((l, i) => <div key={i} style={{ opacity: 1 - i * 0.13 }}>{l}</div>)}
          </div>
        </div>

        {/* buttons */}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          {st.phase === "over" ? (
            <button onClick={rematch} style={btn(true)}>REMATCH</button>
          ) : (
            ["ATTACK", "DEFEND", "CHARGE"].map((a) => (
              <button
                key={a}
                disabled={st.phase !== "choosing"}
                onClick={() => choose(a)}
                style={btn(false, st.phase !== "choosing")}
              >{a}</button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function btn(wide, disabled) {
  return {
    flex: 1, padding: "10px 6px", borderRadius: 10, cursor: disabled ? "default" : "pointer",
    border: "1px solid rgba(0,0,0,.5)", background: disabled ? "#2c302a" : "#dfe3d6",
    color: disabled ? "#5a5f55" : INK, fontFamily: "ui-monospace,Menlo,monospace",
    fontSize: 10, fontWeight: 800, letterSpacing: 1,
    boxShadow: disabled ? "none" : "0 2px 0 rgba(0,0,0,.4)",
    transition: "transform .05s", outline: "none",
  };
}

// ---------- Harness ----------
export default function App() {
  const busRef = useRef(null);
  if (!busRef.current) busRef.current = makeBus();
  const [latency, setLatency] = useState(120);
  const [seed, setSeed] = useState(0); // reset both devices

  useEffect(() => { busRef.current.setLatency(latency); }, [latency]);

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% 0%, #1d2024, #121316)", padding: "28px 18px", fontFamily: "ui-monospace,Menlo,monospace", color: "#c9cdc2" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ marginBottom: 4, fontSize: 18, fontWeight: 800, letterSpacing: 1, color: "#eef0e8" }}>V-PET BATTLE — dev harness</div>
        <div style={{ fontSize: 11, lineHeight: 1.6, color: "#8b9085", marginBottom: 18 }}>
          Two devices, one in-memory transport that mimics a network. Each device only sends and receives messages — it never reads the other's state. Play both sides to test the protocol. The transport layer is the only thing that changes when you move to real devices.
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 22, flexWrap: "wrap" }}>
          <label style={{ fontSize: 11 }}>
            link latency {latency}ms{" "}
            <input type="range" min={0} max={800} step={20} value={latency} onChange={(e) => setLatency(+e.target.value)} style={{ verticalAlign: "middle" }} />
          </label>
          <button onClick={() => setSeed((s) => s + 1)} style={{ ...btn(false), flex: "none", padding: "8px 14px" }}>RESET BOTH</button>
        </div>

        <div style={{ display: "flex", gap: 22, justifyContent: "center", flexWrap: "wrap" }} key={seed}>
          <Device playerId="P1" oppId="P2" name="PLAYER 1" creatureKey="korvox" bus={busRef.current} />
          <Device playerId="P2" oppId="P1" name="PLAYER 2" creatureKey="finlet" bus={busRef.current} />
        </div>

        <div style={{ fontSize: 10, color: "#6f746a", marginTop: 22, lineHeight: 1.6 }}>
          rules — ATTACK deals ATK+charge×3. DEFEND blocks {BLOCK}. CHARGE banks power (max {MAX_CHARGE}) but is interrupted by an attack. Simultaneous reveal each round, resolved deterministically on both devices (no RNG → no desync). Winner permanently gains +1 ATK for the session.
        </div>
      </div>
    </div>
  );
}
