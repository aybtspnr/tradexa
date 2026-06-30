import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  Anchor,
  ArrowLeftRight,
  ArrowRightLeft,
  BarChart3,
  Bell,
  BrainCircuit,
  Building2,
  Calculator,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coins,
  Database,
  DollarSign,
  Globe,
  LayoutDashboard,
  Lock,
  LogOut,
  MapPin,
  Menu,
  Percent,
  Navigation,
  Radar,
  Search,
  Settings,
  Ship,
  Sparkles,
  Trophy,
  User,
  Users,
  Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUsage } from "@/hooks/use-usage";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { FEATURE_MAP } from "@/lib/plan-features";
import Logo from "@/components/Logo";
import { PLAN_LABELS } from "@/lib/usage-costs";
import type { PlanType } from "@/lib/usage-costs";
import AIChat from "@/components/AIChat";
import { UsageBar } from "@/components/UsageBar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

/* ══════════════════════════════
   NAVIGATION GROUPS
   ══════════════════════════════ */
interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: string;
  locked?: boolean;
}

interface NavGroup {
  key: string;
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    key: "dashboard",
    label: "Painel",
    items: [
      { to: "/dashboard", icon: LayoutDashboard, label: "Visão Geral" },
    ],
  },
  {
    key: "tools",
    label: "Ferramentas",
    items: [
      { to: "/ai-search", icon: Sparkles, label: "Classificar NCM/HS" },
      { to: "/hts-lookup", icon: Search, label: "Código HTS EUA" },




      { to: "/global-tariff", icon: Percent, label: "Alíquotas por País" },
    ],
  },
  {
    key: "importers",
    label: "Importadores",
    items: [
      { to: "/importadores", icon: Building2, label: "Diretório de Importadores" },
      { to: "/potential-importers", icon: Building2, label: "Importadores Potenciais" },
    ],
  },
  {
    key: "analysis",
    label: "Análise",
    items: [
      { to: "/intelligence", icon: BarChart3, label: "Inteligência Comercial" },
      { to: "/import-export-data", icon: BarChart3, label: "Export Import Data" },


      { to: "/trade-intelligence", icon: BrainCircuit, label: "Análise Avançada" },
      { to: "/importers-map", icon: Globe, label: "Mapa Comercial" },

    ],
  },
  {
    key: "operational",
    label: "Operacional",
    items: [
      { to: "/maritime-freight-map", icon: Ship, label: "Mapa de Frete" },
      { to: "/track-trace", icon: Navigation, label: "Track & Trace" },
      { to: "/port-intelligence", icon: Anchor, label: "Port Intelligence EUA" },
    ],
  },
  {
    key: "account",
    label: "Conta",
    items: [
      { to: "/plans", icon: Coins, label: "Planos" },
      { to: "/my-usage", icon: Zap, label: "Meu Uso" },
      { to: "/settings", icon: Settings, label: "Configurações" },
    ],
  },
];

const ADMIN_GROUP: NavGroup = {
  key: "admin",
  label: "Admin",
  items: [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/users", icon: Users, label: "Usuários" },
    { to: "/admin/usage", icon: Activity, label: "Uso" },
    { to: "/admin/logs", icon: Clock, label: "Logs" },
    { to: "/admin/ncm", icon: Database, label: "Base NCM" },
    { to: "/admin/hs", icon: Database, label: "Base HS" },
  ],
};

const DashboardLayout = ({ children, title, subtitle }: DashboardLayoutProps) => {
  const { profile, signOut } = useAuth();
  const { percentUsed, isAtLimit, isNearLimit, plan } = useUsage();
  const navigate = useNavigate();
  const location = useLocation();
  const planType = (profile?.plan_type as PlanType) || "essential";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    dashboard: true,
    tools: true,
    importers: true,
    analysis: true,
    operational: true,
    account: true,
    admin: true,
  });

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  /* Show all items, mark unavailable ones as locked */
  const getItemsWithLock = (items: NavItem[]): NavItem[] => {
    return items.map((item) => {
      const feat = Object.values(FEATURE_MAP).find((f) =>
        item.label.includes(f.label) || f.key === item.to.replace("/", "").replace("-", "_")
      );
      if (!feat) return item;
      const allowed = feat.allowedPlans.includes(planType);
      return { ...item, locked: !allowed };
    });
  };

  const NavButton = ({ to, icon: Icon, label, badge, locked, onClick }: NavItem & { onClick?: () => void }) => {
    const isActive = location.pathname === to;

    if (locked) {
      const content = (
        <Button
          variant="ghost"
          className={cn(
            "h-9 w-full justify-start gap-3 rounded-xl px-3 transition-all opacity-40 cursor-not-allowed",
            sidebarCollapsed && "justify-center px-0 w-9 mx-auto"
          )}
          onClick={() => navigate("/plans")}
        >
          <Lock className={cn("h-[18px] w-[18px] shrink-0", "text-slate-400")} />
          {!sidebarCollapsed && (
            <span className="text-[13px] truncate flex-1 text-left text-slate-400">{label}</span>
          )}
        </Button>
      );
      if (sidebarCollapsed) {
        return (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent side="right" className="font-bold text-xs bg-white text-slate-900 border-slate-200 shadow-lg">{label} (bloqueado)</TooltipContent>
          </Tooltip>
        );
      }
      return content;
    }

    // lookup feature badge
    const feat = Object.values(FEATURE_MAP).find((f) => f.label === label);
    const showBadge = feat?.badge && !sidebarCollapsed;
    const content = (
      <Button
        variant="ghost"
        className={cn(
          "h-9 w-full justify-start gap-3 rounded-xl px-3 transition-all",
          sidebarCollapsed && "justify-center px-0 w-9 mx-auto",
          isActive
            ? "bg-[#D80E16]/10 text-[#D80E16] shadow-sm font-black"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        )}
        onClick={() => { navigate(to); onClick?.(); }}
      >
        <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-[#D80E16]" : "text-slate-600")} />
        {!sidebarCollapsed && (
          <span className="text-[13px] truncate flex-1 text-left">{label}</span>
        )}
        {showBadge && (
          <Badge className={cn(
            "text-[7px] font-black uppercase px-1.5 py-0 rounded-md shrink-0",
            feat!.badge === "PRO" ? "bg-red-100 text-red-700 border-red-200" :
            feat!.badge === "ENTERPRISE" ? "bg-slate-800 text-white border-slate-700" :
            "bg-amber-100 text-amber-700 border-amber-200"
          )}>{feat!.badge}</Badge>
        )}
      </Button>
    );
    if (sidebarCollapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="font-bold text-xs bg-white text-slate-900 border-slate-200 shadow-lg">{label}</TooltipContent>
        </Tooltip>
      );
    }
    return content;
  };

  const SidebarContent = ({ onNavClick }: { onNavClick?: () => void }) => (
    <TooltipProvider>
      <div className="flex h-full flex-col bg-white border-r border-slate-200">
        <div className={cn("px-4 pb-4 pt-6 flex items-center", sidebarCollapsed ? "justify-center" : "justify-between")}>
          {!sidebarCollapsed && <Logo className="h-8" to="/ai-search" />}
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-600 hover:text-slate-700 hover:bg-slate-100 shrink-0"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-6">
          {NAV_GROUPS.filter(g => g.key !== "account").map((group) => {
            const itemsWithLock = getItemsWithLock(group.items);
            return (
              <div key={group.key} className="mb-2">
                {!sidebarCollapsed && (
                  <button
                    onClick={() => toggleGroup(group.key)}
                    className="flex w-full items-center justify-between px-3 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-slate-600 hover:text-slate-600"
                  >
                    {group.label}
                    <ChevronDown className={cn("h-3 w-3 transition-transform", openGroups[group.key] ? "" : "-rotate-90")} />
                  </button>
                )}
                {(openGroups[group.key] || sidebarCollapsed) && (
                  <div className="space-y-0.5">
                    {itemsWithLock.map((item) => (
                      <NavButton key={item.to} {...item} onClick={onNavClick} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Admin group */}
          {profile?.role === "admin" && (
            <div className="mb-2">
              {!sidebarCollapsed && (
                <button
                  onClick={() => toggleGroup("admin")}
                  className="flex w-full items-center justify-between px-3 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-slate-600 hover:text-slate-600"
                >
                  {ADMIN_GROUP.label}
                  <ChevronDown className={cn("h-3 w-3 transition-transform", openGroups["admin"] ? "" : "-rotate-90")} />
                </button>
              )}
              {(openGroups["admin"] || sidebarCollapsed) && (
                <div className="space-y-0.5">
                  {ADMIN_GROUP.items.map((item) => (
                    <NavButton key={item.to} {...item} onClick={onNavClick} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Account group */}
          <div className="mt-2 border-t border-slate-100 pt-2">
            <div className="space-y-0.5">
              {getItemsWithLock(NAV_GROUPS.find(g => g.key === "account")!.items).map((item) => (
                <NavButton key={item.to} {...item} onClick={onNavClick} />
              ))}
            </div>
          </div>
        </nav>

        <div className="border-t border-slate-200 p-3">
          {sidebarCollapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl mx-auto text-slate-600 hover:bg-[#D80E16]/10 hover:text-[#D80E16]"
                  onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-bold text-xs bg-white text-slate-900 border-slate-200 shadow-lg">Sair</TooltipContent>
            </Tooltip>
          ) : (
            <div className="rounded-2xl border border-slate-200 p-3 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md" style={{ background: "#D80E16" }}>
                  <User className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-black text-slate-900">{profile?.company_name}</p>
                  <p className="mt-0.5 text-[9px] font-bold text-slate-500">Plano: {PLAN_LABELS[planType]}</p>
                </div>
              </div>
              <Button variant="ghost" className="mt-3 h-9 w-full justify-start gap-2 rounded-xl font-bold text-xs text-slate-600 hover:bg-[#D80E16]/10 hover:text-[#D80E16]"
                onClick={handleSignOut}>
                <LogOut className="h-3.5 w-3.5" /> Sair da conta
              </Button>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className={cn("sticky top-0 hidden h-screen lg:flex lg:flex-col transition-all duration-300 z-30",
        sidebarCollapsed ? "w-16" : "w-[260px]" )}
      >
        <SidebarContent />
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex min-h-[4.5rem] items-center justify-between border-b border-slate-200 px-4 py-3 backdrop-blur-xl sm:h-16 sm:px-6 lg:px-8 bg-white/80">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl lg:hidden">
                  <Menu className="h-5 w-5 text-slate-700" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[260px] p-0 border-none z-[9999]">
                <SidebarContent onNavClick={() => setIsMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>
            <div className="min-w-0">
              <h1 className="truncate text-base font-black tracking-tight text-slate-900 sm:text-lg">{title}</h1>
              {subtitle && <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Card className="hidden sm:block border-none shadow-md rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-105"
              style={{
                background: isAtLimit
                  ? "#fee2e2"
                  : isNearLimit
                  ? "#fef3c7"
                  : "#f8fafc",
              }}
              onClick={() => navigate("/plans")}
            >
              <CardContent className="p-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-sm shadow-lg bg-white/80">
                    <Zap className={cn("w-4 h-4", isAtLimit ? "text-red-500" : isNearLimit ? "text-amber-500" : "text-emerald-500")} />
                  </div>
                  <div>
                    <p className={cn("text-[7px] font-black uppercase tracking-widest", isAtLimit ? "text-red-400" : isNearLimit ? "text-amber-600" : "text-slate-400")}>Uso</p>
                    <p className={cn("text-base font-black", isAtLimit ? "text-red-600" : isNearLimit ? "text-amber-600" : "text-slate-700")}>{`${percentUsed.toFixed(1)}%`}</p>
                  </div>
                  {isNearLimit && !isAtLimit && (
                    <Badge className="bg-amber-100 text-amber-700 border-none text-[7px] font-black uppercase ml-1">
                      <AlertTriangle className="w-3 h-3 mr-0.5" /> Alto
                    </Badge>
                  )}
                  {isAtLimit && (
                    <Badge className="bg-red-100 text-red-600 border-none text-[7px] font-black uppercase ml-1">
                      LIMITE
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </div>
      </main>
      <AIChat />
    </div>
  );
};

export default DashboardLayout;
