"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Logo from "@/components/Logo";
import { Menu, X, ChevronDown } from "lucide-react";
import { PremiumButton } from "@/components/premium";
import { serviceLinks, toolGroups } from "../landingData";

interface HeaderProps {
  scrolled: boolean;
  onScrollToSection: (sectionId: string) => void;
}

export function Header({ scrolled, onScrollToSection }: HeaderProps) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = () => {
    navigate("/");
  };

  const handleRegister = () => {
    navigate("/");
  };

  const handleComingSoon = () => {
    navigate("/");
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white/95 backdrop-blur-xl shadow-lg border-b border-slate-100" 
          : "bg-white/80 backdrop-blur-md border-b border-slate-100/50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Logo size="md" />
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm font-bold text-slate-600 hover:text-red-600 gap-2">
                  Serviços
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64">
                {serviceLinks.map((link) => (
                  <DropdownMenuItem 
                    key={link.route}
                    onClick={() => navigate(link.route)}
                    className="cursor-pointer gap-3 py-3"
                  >
                    <link.icon className="w-4 h-4 text-red-600" />
                    <span className="font-bold text-sm">{link.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <button 
              onClick={() => onScrollToSection("segmentos")}
              className="text-sm font-bold text-slate-600 hover:text-red-600 transition-colors"
            >
              Segmentos
            </button>
            <button 
              onClick={() => onScrollToSection("jornadas")}
              className="text-sm font-bold text-slate-600 hover:text-red-600 transition-colors"
            >
              Jornadas
            </button>
            <button 
              onClick={() => onScrollToSection("mercados")}
              className="text-sm font-bold text-slate-600 hover:text-red-600 transition-colors"
            >
              Mercados
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm font-bold text-slate-600 hover:text-red-600 gap-2">
                  Ferramentas
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72">
                {toolGroups.map((group, gi) => (
                  <div key={group.label}>
                    {gi > 0 && <div className="h-px bg-slate-100 my-1" />}
                    <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      {group.label}
                    </div>
                    {group.items.map((item) => (
                      <DropdownMenuItem 
                        key={item.route}
                        onClick={() => navigate(item.route)}
                        className="cursor-pointer gap-3 py-2.5"
                      >
                        <item.icon className="w-4 h-4 text-red-600" />
                        <span className="font-bold text-sm">{item.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={handleLogin}
              className="rounded-xl font-bold text-sm"
            >
              Entrar
            </Button>
            <PremiumButton 
              onClick={handleRegister}
              size="md"
            >
              Começar Agora
            </PremiumButton>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-slate-100 bg-white max-h-[80vh] overflow-y-auto"
          >
            <div className="px-4 py-6 space-y-6">
              {/* Services Section */}
              <div>
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">Serviços</h4>
                <div className="space-y-2">
                  {serviceLinks.map((link) => (
                    <button
                      key={link.route}
                      onClick={() => { navigate(link.route); setMobileMenuOpen(false); }}
                      className="flex items-center gap-3 w-full text-left py-2"
                    >
                      <link.icon className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-bold text-slate-600">{link.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ferramentas Section */}
              <div>
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">Ferramentas</h4>
                <div className="space-y-2">
                  {toolGroups.map((group) => (
                    <div key={group.label} className="mb-2">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1 mb-1">{group.label}</p>
                      {group.items.map((item) => (
                        <button
                          key={item.route}
                          onClick={() => { navigate(item.route); setMobileMenuOpen(false); }}
                          className="flex items-center gap-3 w-full text-left py-2"
                        >
                          <item.icon className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-bold text-slate-600">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Section Links */}
              <div>
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">Navegação</h4>
                <div className="space-y-2">
                  <button onClick={() => { onScrollToSection("segmentos"); setMobileMenuOpen(false); }} className="block text-sm font-bold text-slate-600 py-2 text-left">Segmentos</button>
                  <button onClick={() => { onScrollToSection("jornadas"); setMobileMenuOpen(false); }} className="block text-sm font-bold text-slate-600 py-2 text-left">Jornadas</button>
                  <button onClick={() => { onScrollToSection("mercados"); setMobileMenuOpen(false); }} className="block text-sm font-bold text-slate-600 py-2 text-left">Mercados</button>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3 border-t border-slate-100">
                <Button 
                  variant="outline" 
                  onClick={handleLogin}
                  className="rounded-xl font-bold w-full text-sm"
                >
                  Entrar
                </Button>
                <PremiumButton 
                  onClick={handleRegister}
                  className="w-full"
                  size="md"
                >
                  Começar Agora
                </PremiumButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}