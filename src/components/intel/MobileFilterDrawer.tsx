import React, { useState, useRef } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import {
  Ship,
  Warehouse,
  Search,
  Loader2,
  X,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NcmChip {
  code: string;
  desc?: string;
}

export interface PeriodState {
  mode: string;
  year?: number;
  month?: number;
}

export interface NcmSuggestion {
  code: string;
  desc: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Mode
  tab: "import" | "export";
  onTabChange: (tab: "import" | "export") => void;
  // NCM
  ncmInput: string;
  onNcmInputChange: (val: string) => void;
  ncms: NcmChip[];
  onAddNcm: (code: string, desc?: string) => void;
  onRemoveNcm: (code: string) => void;
  ncmSuggestions: NcmSuggestion[];
  onNcmFocus: () => void;
  // Period
  period: PeriodState;
  onPeriodChange: (p: PeriodState) => void;
  latestYear: number;
  latestMonth: number;
  // UF
  ufs: string[];
  onToggleUf: (uf: string) => void;
  onClearUfs: () => void;
  // Actions
  onSearch: () => void;
  onClearAll: () => void;
  loading: boolean;
}

const UF_LIST = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA",
  "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN",
  "RO", "RR", "RS", "SC", "SE", "SP", "TO",
];

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export const MobileFilterDrawer: React.FC<Props> = ({
  open,
  onOpenChange,
  tab,
  onTabChange,
  ncmInput,
  onNcmInputChange,
  ncms,
  onAddNcm,
  onRemoveNcm,
  ncmSuggestions,
  onNcmFocus,
  period,
  onPeriodChange,
  latestYear,
  latestMonth,
  ufs,
  onToggleUf,
  onClearUfs,
  onSearch,
  onClearAll,
  loading,
}) => {
  const [showNcmSug, setShowNcmSug] = useState(false);
  const ncmRef = useRef<HTMLInputElement>(null);

  const years = [2024, 2025, 2026];
  if (latestYear > 2026) years.push(latestYear);

  const handleSearch = () => {
    onSearch();
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92vh] bg-white">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
            <SlidersHorizontal className="h-4 w-4 text-[#D80E16]" />
            Filtros de Consulta
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-5">
          {/* Modo Import/Export */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
              Operação
            </label>
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
              <button
                onClick={() => onTabChange("import")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-lg transition-all min-h-[44px]",
                  tab === "import" ? "bg-white text-[#D80E16] shadow-sm" : "text-slate-500"
                )}
              >
                <Ship className="h-4 w-4" /> Importação
              </button>
              <button
                onClick={() => onTabChange("export")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-lg transition-all min-h-[44px]",
                  tab === "export" ? "bg-white text-[#D80E16] shadow-sm" : "text-slate-500"
                )}
              >
                <Warehouse className="h-4 w-4" /> Exportação
              </button>
            </div>
          </div>

          {/* NCM */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
              NCM
            </label>
            <div className="relative">
              <Input
                ref={ncmRef}
                value={ncmInput}
                onChange={(e) => {
                  onNcmInputChange(e.target.value);
                  if (e.target.value.length >= 2) {
                    setShowNcmSug(true);
                    onNcmFocus();
                  } else {
                    setShowNcmSug(false);
                  }
                }}
                onFocus={() => {
                  onNcmFocus();
                  if (ncmInput.length >= 2) setShowNcmSug(true);
                }}
                onBlur={() => setTimeout(() => setShowNcmSug(false), 200)}
                placeholder="Ex: 2836 ou 54024400"
                className="h-11 text-sm rounded-xl border-slate-200"
              />
              {ncmSuggestions.length > 0 && ncmInput.length > 0 && showNcmSug && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-lg z-50 max-h-52 overflow-y-auto">
                  {ncmSuggestions.slice(0, 10).map((s, i) => (
                    <button
                      key={i}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-start gap-2 text-sm border-b border-slate-100 last:border-0 min-h-[44px]"
                      onClick={() => {
                        onAddNcm(s.code, s.desc);
                        onNcmInputChange("");
                        setShowNcmSug(false);
                      }}
                    >
                      <code className="font-mono font-bold text-[#D80E16] shrink-0">{s.code}</code>
                      <span className="text-slate-600 truncate">{s.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {ncms.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {ncms.map((n, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold bg-[#D80E16]/10 text-[#D80E16] px-2.5 py-1.5 rounded-lg min-h-[32px]"
                  >
                    {n.code}
                    <button
                      onClick={() => onRemoveNcm(n.code)}
                      className="hover:text-[#b80c12] p-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Ano */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
              Ano
            </label>
            <div className="flex gap-2">
              {years.map((y) => {
                const isActive =
                  (period.mode === "full_year" || period.mode === "specific_month") &&
                  period.year === y;
                return (
                  <button
                    key={y}
                    onClick={() => {
                      if (isActive && period.mode === "full_year") {
                        onPeriodChange({ mode: "specific_month", year: y, month: period.month || 1 });
                      } else if (isActive && period.mode === "specific_month") {
                        onPeriodChange({ mode: "full_year", year: y });
                      } else {
                        onPeriodChange({ mode: "full_year", year: y });
                      }
                    }}
                    className={cn(
                      "flex-1 text-sm font-bold py-3 rounded-xl border transition-all min-h-[44px]",
                      isActive
                        ? "bg-[#D80E16] text-white border-[#D80E16]"
                        : "bg-white text-slate-500 border-slate-200"
                    )}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mês (se specific_month) */}
          {period.mode === "specific_month" && period.year && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Mês
                </label>
                <button
                  onClick={() => onPeriodChange({ mode: "full_year", year: period.year! })}
                  className="text-[11px] text-slate-400 hover:text-slate-600 underline"
                >
                  Voltar para ano inteiro
                </button>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {MONTHS.map((m, i) => {
                  const isActive = period.month === i + 1;
                  const isFuture = period.year === latestYear && i + 1 > latestMonth;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        if (isFuture) return;
                        if (isActive) {
                          onPeriodChange({ mode: "full_year", year: period.year! });
                        } else {
                          onPeriodChange({ mode: "specific_month", year: period.year!, month: i + 1 });
                        }
                      }}
                      disabled={isFuture}
                      className={cn(
                        "text-xs font-bold py-2.5 rounded-lg border transition-all min-h-[40px]",
                        isActive
                          ? "bg-[#D80E16] text-white border-[#D80E16]"
                          : isFuture
                          ? "bg-slate-50 text-slate-300 border-slate-100"
                          : "bg-white text-slate-500 border-slate-200"
                      )}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Estados */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Estados {ufs.length > 0 && `(${ufs.length})`}
              </label>
              {ufs.length > 0 && (
                <button
                  onClick={onClearUfs}
                  className="text-[11px] text-slate-400 hover:text-red-500 transition-colors"
                >
                  Limpar
                </button>
              )}
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {UF_LIST.map((uf) => {
                const isSelected = ufs.includes(uf);
                return (
                  <button
                    key={uf}
                    onClick={() => onToggleUf(uf)}
                    className={cn(
                      "text-xs font-bold py-2.5 rounded-lg border transition-all min-h-[40px]",
                      isSelected
                        ? "bg-[#D80E16]/10 text-[#D80E16] border-[#D80E16]/30"
                        : "bg-white text-slate-500 border-slate-200"
                    )}
                  >
                    {uf}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DrawerFooter className="pt-2 pb-[env(safe-area-inset-bottom)] border-t border-slate-100">
          <div className="flex gap-2">
            {(ncms.length > 0 || ufs.length > 0) && (
              <button
                onClick={onClearAll}
                className="text-sm text-slate-400 hover:text-red-500 transition-colors px-3 py-3 min-h-[44px]"
              >
                Limpar tudo
              </button>
            )}
            <Button
              onClick={handleSearch}
              disabled={loading || ncms.length === 0}
              className="flex-1 h-12 bg-[#D80E16] hover:bg-[#b80c12] text-white text-sm gap-2 rounded-xl font-semibold"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {loading ? "Consultando..." : "Consultar"}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileFilterDrawer;
