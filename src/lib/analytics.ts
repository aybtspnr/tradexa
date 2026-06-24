/**
 * Analytics — Mixpanel + Google Tag Manager
 *
 * O mixpanel e o gtag são iniciados pelo analytics-loader.js (script
 * não-modular injetado via App.tsx). Este módulo expõe funções TypeScript
 * tipadas que acessam window.mixpanel já inicializado.
 *
 * NOTA: Não importamos mixpanel-browser aqui porque o analytics-loader.js
 * já carrega o CDN wrapper. Duas importações do mesmo script criariam
 * conflito de stubs.
 */

/** @returns the global mixpanel instance (initialized by analytics-loader.js) */
function getMixpanel() {
  // @ts-ignore
  return window.mixpanel;
}

/** Verifica se o mixpanel já foi carregado e inicializado */
function isReady(): boolean {
  const mp = getMixpanel();
  return !!mp && typeof mp.get_distinct_id === "function";
}

export function trackPageView(path: string) {
  if (!isReady()) return;
  getMixpanel().track_pageview({ url: path });
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (!isReady()) return;
  getMixpanel().track(event, properties);
}

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  if (!isReady()) return;
  getMixpanel().identify(userId);
  if (traits) {
    getMixpanel().people.set(traits);
  }
}

export function setUserProfile(properties: Record<string, unknown>) {
  if (!isReady()) return;
  getMixpanel().people.set(properties);
}

export function resetAnalytics() {
  if (!isReady()) return;
  getMixpanel().reset();
}
