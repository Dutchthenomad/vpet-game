import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Launcher from "./Launcher.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Launcher />
  </StrictMode>
);
