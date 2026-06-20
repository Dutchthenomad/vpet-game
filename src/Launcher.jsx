import { useState } from "react";
import GamePrototype from "../prototype/vpet-game-prototype.jsx";
import CareEngine from "../prototype/vpet-care-engine.jsx";
import EvolutionTestbed from "../prototype/vpet-evolution-testbed.jsx";
import BattleHarness from "../prototype/vpet-battle-harness.jsx";

const TABS = [
  { label: "Game (canonical)", Component: GamePrototype },
  { label: "Care engine", Component: CareEngine },
  { label: "Evolution testbed", Component: EvolutionTestbed },
  { label: "Battle harness", Component: BattleHarness },
];

const tabStyle = (active) => ({
  padding: "8px 16px",
  cursor: "pointer",
  border: "none",
  borderBottom: active ? "3px solid #333" : "3px solid transparent",
  background: "none",
  fontWeight: active ? 700 : 400,
  fontSize: 14,
});

export default function Launcher() {
  const [active, setActive] = useState(0);
  const { Component } = TABS[active];

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <nav style={{ display: "flex", borderBottom: "1px solid #ccc", padding: "0 8px" }}>
        {TABS.map((tab, i) => (
          <button key={tab.label} style={tabStyle(active === i)} onClick={() => setActive(i)}>
            {tab.label}
          </button>
        ))}
      </nav>
      <Component />
    </div>
  );
}
