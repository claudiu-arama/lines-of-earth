import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

// TODO: replace `any` with proper types
createRoot(document.getElementById("root") as any).render(
  <StrictMode>
    <App />
  </StrictMode>
);
