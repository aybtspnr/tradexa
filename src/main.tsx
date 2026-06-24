import { createRoot } from "react-dom/client";
import App from "./App";
import "./globals.css";

import { StrictMode } from "react";

const rootElement = document.getElementById("root");
if (rootElement) {
  // Remove o SEO prerender assim que o React montar
  // (mais confiável que o script inline com setTimeout na race condition)
  const seoPrerender = document.getElementById("seo-prerender");
  if (seoPrerender) seoPrerender.remove();
  
  // Remove placeholder + marca como hidratado (anti-CLS)
  rootElement.classList.add("hydrated");
  
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}