import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx"; // .tsx extension එක specify කරන්න ඕනෑ නෑ, Vite එක ඒක හොයාගන්නවා

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);