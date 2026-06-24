import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, LogOut, Menu, Search, User, BarChart3,
  Globe, Map, TrendingUp, FileText, Settings, Sparkles, Trophy, Bell,
  Coins, Zap, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUsage } from "@/hooks/use-usage";
import Logo from "@/components/Logo";
import { PLAN_LABELS } from "@/lib/usage-costs";
import type { PlanType } from "@/lib/usage-costs";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import AIChat from "@/components/AIChat";

interface ImportIntelligenceLayoutProps {
  children: React.ReactNode;
  title: string;
}

const NavItem = ({
  to,
  icon: Icon,
  label,
  active,
  collapsed,
  onClick,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) => {
  const content = (
    <Button
      variant="ghost"
      className={cn(
        "h-9 w-full justify-start gap-3 rounded-xl px-3 transition-all",
        collapsed && "justify-center px-0 w-9 mx-auto",
        active
          ? "bg-[#2563EB]/10 text-[#2563EB] shadow-sm font-black"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      )}
      onClick={onClick}
    >
      <Icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-[#2563EB]" : "text-slate-600")} />
      {!collapsed && <span className="text-[13px] truncate">{label}</span>}
    </Button>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="font-bold text-xs bg-white text-slate-900 shadow-lg border-slate-100">
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }
  return content;
};

const ImportIntelligenceLayout = ({ children, title }: ImportIntelligenceLayoutProps) => {
  const { profile, signOut } = useAuth();
  const { usage, percentUsed, isNearLimit, plan } = useUsage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const navSections = [
    {
      title: "Principal",
      items: [
        { to: "/import-intelligence", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/import-intelligence/search", icon: Sparkles, label: "Pesquisa IA" },
        { to: "/import-intelligence/map", icon: Map, label: "Mapa" },
        { to: "/import-intelligence/trends", icon: TrendingUp, label: "Tendências" },
      ],
    },
    {
      title: "Inteligência",
      items: [
        { to: "/import-intelligence/ranking", icon: Trophy, label: "Ranking" },
        { to: "/import-intelligence/alertas", icon: Bell, label: "Alertas" },
      ],
    },
    {
      title: "Dados",
      items: [
        { to: "/import-intelligence/reports", icon: FileText, label: "Relatórios" },
        { to: "/import-intelligence/countries", icon: Globe, label: "Países" },
      ],
    },
    {
      title: "Global",
      items: [
        { to: "/trade-intelligence", icon: Globe, label: "Trade Intelligence" },
        { to: "/ncm-comparison", icon: BarChart3, label: "Comparar NCMs" },
        { to: "/cross-data-comparison", icon: Globe, label: "Cross-Data" },
      ],
    },
    {
      title: "Conta",
      items: [
        { to: "/plans", icon: Coins, label: "Planos" },
        { to: "/credits", icon: Zap, label: "Meus Créditos" },
        { to: "/settings", icon: Settings, label: "Configurações" },
        { to: "/history", icon: Bell, label: "Histórico" },
      ],
    },
  ];

  const SidebarContent = ({ onNavClick }: { onNavClick?: () => void }) => (
    <TooltipProvider>
      <div className="flex h-full flex-col bg-white border-r border-slate-200">
        <div className={cn("px-4 pb-4 pt-6 flex items-center", sidebarCollapsed ? "justify-center" : "justify-between")}>
          {!sidebarCollapsed && <Logo className="h-8" to="/ai-search" />}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-slate-600 hover:text-slate-700 hover:bg-slate-100 shrink-0"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
          {navSections.map((section) => (
            <div key={section.title}>
              {!sidebarCollapsed && (
                <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.24em] text-slate-600">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavItem
                    key={item.to}
                    {...item}
                    active={location.pathname === item.to}
                    collapsed={sidebarCollapsed}
                    onClick={() => {
                      navigate(item.to);
                      onNavClick?.();
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3">
          {sidebarCollapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl mx-auto text-slate-600 hover:bg-[#2563EB]/10 hover:text-[#2563EB]"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-bold text-xs bg-white text-slate-900 border-slate-200 shadow-lg">Sair</TooltipContent>
            </Tooltip>
          ) : (
            <div className="rounded-2xl border border-slate-200 p-3 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md" style={{ background: "#2563EB" }}>
                  <User className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-black text-slate-900">{profile?.company_name}</p>
                  <p className="mt-0.5 text-[9px] font-bold text-slate-500">Plano: {PLAN_LABELS[plan]}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="mt-3 h-9 w-full justify-start gap-2 rounded-xl font-bold text-xs text-slate-600 hover:bg-[#2563EB]/10 hover:text-[#2563EB]"
                onClick={handleSignOut}
              >
                <LogOut className="h-3.5 w-3.5" />
                Sair da conta
              </Button>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen lg:flex lg:flex-col transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-60",
        )}
      >
        <SidebarContent />
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex min-h-[3.5rem] items-center justify-between border-b border-slate-200 px-4 py-2 backdrop-blur-xl sm:h-14 sm:px-6 lg:px-8 bg-white/80">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl lg:hidden">
                  <Menu className="h-5 w-5 text-slate-700" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-60 border-r border-slate-200 p-0">
                <SidebarContent onNavClick={() => setIsMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-600">
                  Import Intelligence
                </p>
                {location.pathname.includes("search") && (
                  <span className="inline-flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                )}
              </div>
              <h1 className="mt-0.5 truncate text-sm font-black tracking-tight text-slate-900 sm:text-base">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Card
              className={cn(
                "hidden sm:block border-none shadow-md rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-105",
                percentUsed >= 80 ? "bg-[#D80E16]" : "bg-[#222222]",
              )}
              onClick={() => navigate("/my-usage")}
            >
              <CardContent className="p-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-sm shadow-lg bg-white/10">
                    <Coins className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[7px] font-black text-white/60 uppercase tracking-widest">Uso</p>
                    <p className="text-base font-black text-white">
                      {`${percentUsed.toFixed(0)}%`}
                    </p>
                  </div>
                  {percentUsed >= 80 && (
                    <Badge className="bg-white/20 text-white border-none text-[7px] font-black uppercase ml-1">
                      <Zap className="w-3 h-3 mr-0.5" />
                      Alto
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-bold gap-2 h-9 text-xs transition-all duration-300"
                onClick={() => navigate("/ai-search")}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Ferramentas</span>
              </Button>
            </motion.div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-7xl"
          >
            {children}
          </motion.div>
        </div>
      </main>

      <AIChat />
    </div>
  );
};

export default ImportIntelligenceLayout;