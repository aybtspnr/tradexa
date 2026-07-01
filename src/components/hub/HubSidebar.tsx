import React from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Globe,
  FileSearch,
  TrendingUp,
  Award,
  BellRing,
  Flag,
  Shield,
  Calculator,
  Percent,
} from "lucide-react";

/* ═══════════════════ TYPES ═══════════════════ */

export interface HubSidebarProps {
  /** The currently active tab ID */
  activeTab: string;
  /** Callback fired when a tab is clicked */
  onTabChange: (tab: string) => void;
  /** Optional profile to check admin status */
  profile?: { is_admin?: boolean } | null;
}

export interface HubTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requireAdmin?: boolean;
}

/* ═══════════════════ TAB DEFINITIONS ═══════════════════ */

const TABS: HubTab[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "paises", label: "Países", icon: Globe },
  { id: "ncm", label: "NCM", icon: FileSearch },
  { id: "simulador", label: "Simulador", icon: TrendingUp },
  { id: "rankings", label: "Rankings", icon: Award },
  { id: "alertas", label: "Alertas", icon: BellRing },
  { id: "eua", label: "EUA", icon: Flag },
  { id: "landing-cost", label: "Landing Cost", icon: Calculator },
  { id: "tarifas", label: "Tarifas WITS", icon: Percent },
  { id: "admin", label: "Admin", icon: Shield, requireAdmin: true },
];

/* ═══════════════════ DESKTOP SIDEBAR ═══════════════════ */

function DesktopSidebar({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: HubTab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  return (
    <aside className="hidden lg:flex lg:flex-col w-56 shrink-0">
      <nav className="flex flex-col gap-1 p-3" role="tablist" aria-orientation="vertical">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "group flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                isActive
                  ? "bg-[#c9a84c]/15 text-[#c9a84c] shadow-sm shadow-[#c9a84c]/5"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5",
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-all duration-200",
                  isActive
                    ? "bg-[#c9a84c]/20 text-[#c9a84c]"
                    : "bg-white/5 text-slate-500 group-hover:text-slate-300 group-hover:bg-white/10",
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="truncate">{tab.label}</span>
              {isActive && (
                <div className="ml-auto w-1 h-5 rounded-full bg-[#c9a84c]" />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

/* ═══════════════════ MOBILE BOTTOM NAV ═══════════════════ */

function MobileBottomNav({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: HubTab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1a2634] border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around px-1 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg transition-all min-w-[48px] min-h-[44px]",
                isActive
                  ? "text-[#c9a84c]"
                  : "text-slate-500 hover:text-slate-300",
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  isActive && "scale-110",
                )}
              />
              <span
                className={cn(
                  "text-[8px] leading-tight font-semibold transition-all",
                  isActive && "font-bold",
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ═══════════════════ MAIN COMPONENT ═══════════════════ */

const HubSidebar: React.FC<HubSidebarProps> = ({
  activeTab,
  onTabChange,
  profile,
}) => {
  // Filter tabs: hide Admin unless user is admin
  const visibleTabs = React.useMemo(
    () => TABS.filter((tab) => !tab.requireAdmin || profile?.is_admin),
    [profile],
  );

  return (
    <>
      {/* Desktop sidebar — hidden on mobile */}
      <DesktopSidebar
        tabs={visibleTabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      {/* Mobile bottom nav — hidden on desktop */}
      <MobileBottomNav
        tabs={visibleTabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      {/* Spacer for mobile bottom nav to prevent content overlap */}
      <div className="lg:hidden h-16" />
    </>
  );
};

export default HubSidebar;
