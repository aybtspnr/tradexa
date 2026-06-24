import { createRoot } from "react-dom/client";
import App from "./App";
import "./globals.css";

import { StrictMode } from "react";

const rootElement = document.getElementById("root");
if (rootElement) {
  // Remove placeholder + marca como hidratado (anti-CLS)
  rootElement.classList.add("hydrated");
  
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}