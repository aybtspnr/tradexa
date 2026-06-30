"use client";

import { lazy, Suspense, useState, useEffect, useCallback, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useSeo } from "@/hooks/use-seo";
import { useAuth } from "@/hooks/use-auth";
import HubSidebar from "@/components/hub/HubSidebar";

/* ═══════════════════ LAZY-LOADED TAB COMPONENTS ═══════════════════ */

const HubDashboard = lazy(() => import("@/components/hub/HubDashboard"));
const HubPaises = lazy(() => import("@/pages/HubPaises"));
const HubNcm = lazy(() => import("@/pages/HubNcm"));
const HubSimulador = lazy(() => import("@/pages/HubSimulador"));
const HubRankings = lazy(() => import("@/pages/HubRankings"));
const HubAlertas = lazy(() => import("@/pages/HubAlerts"));
const HubEua = lazy(() => import("@/pages/HubEua"));
const HubAdmin = lazy(() => import("@/pages/HubAdmin"));

/* ═══════════════════ TAB COMPONENT MAP ═══════════════════ */

const TAB_COMPONENTS: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  dashboard: HubDashboard,
  paises: HubPaises,
  ncm: HubNcm,
  simulador: HubSimulador,
  rankings: HubRankings,
  alertas: HubAlertas,
  eua: HubEua,
  admin: HubAdmin,
};

const DEFAULT_TAB = "dashboard";

/* ═══════════════════ LOADING FALLBACK ═══════════════════ */

function TabFallback() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#c9a84c] mx-auto mb-3" />
        <p className="text-sm text-slate-500 font-medium">Carregando...</p>
      </div>
    </div>
  );
}

/* ═══════════════════ MAIN COMPONENT ═══════════════════ */

export default function IntelligenceHub() {
  // ─── SEO ───
  useSeo({
    title: "Intelligence Hub — Inteligência Comercial TRADEXA",
    description:
      "Central de inteligência comercial com dashboard completo, análise por países, NCM, simulador, rankings, alertas e mais.",
    keywords:
      "intelligence hub, inteligência comercial, comércio exterior, dashboard, análise, países, ncm, simulador, rankings, alertas, tradexa",
  });

  // ─── Auth (for admin tab filtering in sidebar) ───
  const { profile } = useAuth();

  // ─── Tab state from URL hash ───
  const getTabFromHash = useCallback((): string => {
    if (typeof window === "undefined") return DEFAULT_TAB;
    const hash = window.location.hash.replace("#", "");
    const valid = TAB_COMPONENTS[hash] !== undefined;
    return valid ? hash : DEFAULT_TAB;
  }, []);

  const [activeTab, setActiveTab] = useState<string>(getTabFromHash);

  // Sync hash → activeTab on mount and on hashchange
  useEffect(() => {
    const onHashChange = () => {
      const tab = getTabFromHash();
      setActiveTab(tab);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [getTabFromHash]);

  // Sync activeTab → URL hash
  const handleTabChange = useCallback((id: string) => {
    setActiveTab(id);
    window.location.hash = id;
  }, []);

  // ─── Derive active component ───
  const ActiveComponent = useMemo(() => {
    return TAB_COMPONENTS[activeTab] ?? TAB_COMPONENTS[DEFAULT_TAB];
  }, [activeTab]);

  return (
    <div className="flex min-h-screen bg-[#0f1923]">
      {/* ─── Sidebar ─── */}
      <HubSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        profile={profile as any}
      />

      {/* ─── Main content area ─── */}
      <main className="flex-1 min-w-0 overflow-auto pb-16 lg:pb-0 bg-gray-50">
        <Suspense fallback={<TabFallback />}>
          <ActiveComponent />
        </Suspense>
      </main>
    </div>
  );
}
