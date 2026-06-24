/**
 * Calculadora ACC/ACE — Adiantamento sobre Contrato de Câmbio / Adiantamento sobre Cambiais Entregues
 * Ferramenta gratuita para exportadores brasileiros simularem financiamento de exportação.
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator, DollarSign, Calendar, Percent, TrendingUp,
  Building2, Ship, Clock, AlertCircle, CheckCircle2,
  ArrowRight, Sparkles, Landmark, Receipt, BarChart3,
  RefreshCw, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";
import { bcb } from "@/services/bcb";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LabelList,
} from "recharts";

// ─── Tipos ───
type Modality = "ACC" | "ACE";

interface FormState {
  exportValue: number;
  currency: string;
  shippingDays: number;
  paymentDays: number;
  modality: Modality;
  exchangeRate: number;
  interestRate: number;
}

interface ResultsState {
  advancedBrl: number;
  totalCost: number;
  costPercentage: number;
  iofCost: number;
  interestCost: number;
  netReceived: number;
  expectedDate: Date;
  maturityValue: number;
  savingsAmount: number;
  savingsPercentage: number;
}

// ─── Constantes ───
const IOF_RATE = 0.0038; // 0.38%
const DAYS_IN_YEAR = 360; // convenção de mercado

// Taxas de juros sugeridas por modalidade
const SUGGESTED_RATES: Record<Modality, { min: number; max: number; default: number }> = {
  ACC: { min: 4.5, max: 10, default: 6.5 },
  ACE: { min: 3.5, max: 8, default: 5.0 },
};

const CURRENCIES = ["USD", "EUR", "GBP", "BRL"];

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", BRL: "R$",
};

// ─── Helpers ───
function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatUSD(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function calculateResults(form: FormState): ResultsState | null {
  const { exportValue, shippingDays, paymentDays, modality, exchangeRate, interestRate } = form;
  if (!exportValue || !exchangeRate || !interestRate) return null;

  const exportBrl = exportValue * exchangeRate;
  const totalDays = modality === "ACC" ? shippingDays + paymentDays : paymentDays;
  const annualRate = interestRate / 100;

  // Juros proporcionais ao prazo
  const interestCost = exportBrl * annualRate * (totalDays / DAYS_IN_YEAR);

  // IOF
  const iofCost = exportBrl * IOF_RATE;

  // Custo total
  const totalCost = interestCost + iofCost;

  // Valor adiantado
  const advancedBrl = exportBrl * (1 - annualRate * (totalDays / DAYS_IN_YEAR));

  // Valor líquido recebido
  const netReceived = advancedBrl - iofCost;

  // Custo percentual
  const costPercentage = exportBrl > 0 ? (totalCost / exportBrl) * 100 : 0;

  // Data prevista do embarque (ou vencimento)
  const expectedDate = new Date();
  expectedDate.setDate(expectedDate.getDate() + totalDays);

  // Se esperar o vencimento: recebe o valor total, mas só no fim do prazo
  const maturityValue = exportBrl;
  const savingsAmount = netReceived - 0; // o valor que recebe AGORA vs esperar
  const savingsPercentage = exportBrl > 0 ? (savingsAmount / exportBrl) * 100 : 0;

  return {
    advancedBrl,
    totalCost,
    costPercentage,
    iofCost,
    interestCost,
    netReceived,
    expectedDate,
    maturityValue,
    savingsAmount,
    savingsPercentage,
  };
}

// ─── Componentes Auxiliares ───
function SliderInput({ label, value, onChange, min, max, step, unit, icon: Icon, description }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
  icon: React.ElementType;
  description?: string;
}) {
  const percentage = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-[#5E6278] flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5" /> {label}
        </label>
        <span className="text-sm font-bold text-[#0F111A] tabular-nums">
          {value} <span className="text-[11px] text-[#5E6278] font-medium">{unit}</span>
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[#0F111A]/[0.06] 
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#D80E16] 
            [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
          style={{
            background: `linear-gradient(to right, #D80E16 0%, #D80E16 ${percentage}%, #0F111A0F ${percentage}%, #0F111A0F 100%)`,
          }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-[#5E6278]/60">{min} {unit}</span>
          <span className="text-[10px] text-[#5E6278]/60">{max} {unit}</span>
        </div>
      </div>
      {description && (
        <p className="text-[10px] text-[#5E6278]/70">{description}</p>
      )}
    </div>
  );
}

function ResultCard({ label, value, sub, icon: Icon, highlight, color = "#D80E16" }: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  highlight?: boolean;
  color?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "p-4 rounded-xl border bg-white shadow-sm",
        highlight
          ? "border-[#D80E16]/20 bg-gradient-to-br from-[#D80E16]/[0.02] to-transparent"
          : "border-black/[0.06]"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-[#5E6278] uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className={cn(
            "text-2xl font-extrabold tabular-nums",
            highlight ? "text-[#D80E16]" : "text-[#0F111A]"
          )}>
            {value}
          </p>
          {sub && (
            <p className="text-[11px] text-[#5E6278] mt-0.5">{sub}</p>
          )}
        </div>
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
          highlight ? "bg-[#D80E16]/10" : "bg-slate-100"
        )}>
          <Icon className={cn("w-4 h-4", highlight ? "text-[#D80E16]" : "text-slate-400")} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Página Principal ───
export default function CalculadoraAccAcePage() {
  const [form, setForm] = useState<FormState>({
    exportValue: 50000,
    currency: "USD",
    shippingDays: 60,
    paymentDays: 90,
    modality: "ACC",
    exchangeRate: 0,
    interestRate: SUGGESTED_RATES["ACC"].default,
  });
  const [loadingRate, setLoadingRate] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);
  const [rateSource, setRateSource] = useState<string | null>(null);

  useSeo({
    title: "Calculadora ACC/ACE — Adiantamento de Exportação | TRADEXA",
    description: "Simule ACC e ACE para exportação. Calcule adiantamento, juros e spread cambial para financiar operações de comércio exterior.",
    canonical: "https://www.tradexa.com.br/ferramentas/calculadora-acc-ace",
  });

  // Buscar cotação PTAX do BCB ao montar
  useEffect(() => {
    let cancelled = false;
    async function fetchRate() {
      setLoadingRate(true);
      setRateError(null);
      try {
        const result = await bcb.getCotacaoDolar();
        if (cancelled) return;
        if (result.rate) {
          setForm((f) => ({ ...f, exchangeRate: result.rate }));
          setRateSource("BCB (PTAX Venda)");
        } else {
          setRateError(result.error || "Cotação indisponível");
          // Fallback: valor manual sugerido
          if (!form.exchangeRate) {
            setForm((f) => ({ ...f, exchangeRate: 5.65 }));
          }
        }
      } catch {
        if (!cancelled) setRateError("Erro ao consultar BCB");
      } finally {
        if (!cancelled) setLoadingRate(false);
      }
    }
    fetchRate();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Atualizar taxa de juros sugerida quando mudar modalidade
  const handleModalityChange = useCallback((modality: Modality) => {
    setForm((f) => ({
      ...f,
      modality,
      interestRate: SUGGESTED_RATES[modality].default,
    }));
  }, []);

  const update = useCallback(<K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [field]: value }));
  }, []);

  const results = useMemo(() => calculateResults(form), [form]);

  // Dados para o gráfico comparativo
  const chartData = useMemo(() => {
    if (!results) return [];
    return [
      {
        name: "Valor Total\nExportação",
        valor: form.exportValue * form.exchangeRate,
        fill: "#5E6278",
      },
      {
        name: form.modality + "\n(Adiantado)",
        valor: results.advancedBrl,
        fill: "#D80E16",
      },
      {
        name: "Líquido\nRecebido",
        valor: results.netReceived,
        fill: "#10b981",
      },
      {
        name: "Custo\nTotal",
        valor: results.totalCost,
        fill: "#f59e0b",
      },
    ];
  }, [results, form]);

  const suggestedRate = SUGGESTED_RATES[form.modality];

  return (
    <SiteLayout>
      {/* ═══════════════ Hero ═══════════════ */}
      <section className="relative pt-28 pb-12 md:pt-36 md:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <ParticleCanvasThemed opacity={0.12} particleCount={25} color="216,14,22" connectionDist={120} />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(216,14,22,0.04),transparent)]" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="mb-4 font-bold text-[11px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-0 bg-[#D80E16]/8 text-[#D80E16]">
              <Landmark className="w-3.5 h-3.5 mr-1.5" />
              Ferramenta Gratuita para Exportadores
            </Badge>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#0F111A] mb-4 leading-tight">
              Calculadora de <span className="text-[#D80E16]">ACC/ACE</span>
            </h1>
            <p className="text-lg text-[#5E6278] max-w-2xl mx-auto">
              Simule o adiantamento sobre contrato de câmbio (ACC) e adiantamento sobre cambiais entregues (ACE).
              Descubra quanto você pode receber agora pela sua exportação, em vez de esperar o vencimento.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ Conteúdo Principal ═══════════════ */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8 bg-[#FAFAF9]">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-6">

            {/* ─── Formulário (3 colunas) ─── */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-3 bg-white rounded-2xl border border-black/[0.06] p-6 md:p-8 shadow-sm space-y-6"
            >
              {/* Valor da Exportação */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#5E6278] flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" /> Valor da Exportação
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5E6278] text-sm font-medium">
                      {CURRENCY_SYMBOLS[form.currency] || "$"}
                    </span>
                    <input
                      type="number"
                      value={form.exportValue || ""}
                      onChange={(e) => update("exportValue", Number(e.target.value))}
                      placeholder="50.000"
                      min={0}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-black/[0.08] bg-white text-[#0F111A] text-sm focus:outline-none focus:border-[#D80E16]/30 focus:ring-2 focus:ring-[#D80E16]/10 transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <select
                    value={form.currency}
                    onChange={(e) => update("currency", e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-black/[0.08] bg-white text-[#0F111A] text-sm font-bold focus:outline-none focus:border-[#D80E16]/30 focus:ring-2 focus:ring-[#D80E16]/10 transition-all appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2212%22%20height=%2212%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22%235E6278%22%20stroke-width=%222%22%3E%3Cpath%20d=%22M6%209l6%206%206-6%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_0.5rem_center] pr-7 min-w-[80px]"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                {form.currency !== "USD" && (
                  <p className="text-[10px] text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    O valor será convertido para USD para o cálculo. Use USD para maior precisão.
                  </p>
                )}
              </div>

              {/* Modalidade: ACC vs ACE */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#5E6278] flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5" /> Modalidade
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["ACC", "ACE"] as Modality[]).map((mod) => (
                    <button
                      key={mod}
                      onClick={() => handleModalityChange(mod)}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all",
                        form.modality === mod
                          ? "border-[#D80E16] bg-[#D80E16]/[0.04] shadow-sm"
                          : "border-black/[0.06] hover:border-[#D80E16]/20"
                      )}
                    >
                      <p className={cn(
                        "font-bold text-sm",
                        form.modality === mod ? "text-[#D80E16]" : "text-[#0F111A]"
                      )}>
                        {mod}
                      </p>
                      <p className="text-[10px] text-[#5E6278] mt-0.5">
                        {mod === "ACC"
                          ? "Pré-embarque — antes do embarque da mercadoria"
                          : "Pós-embarque — cambiais já entregues"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders */}
              <SliderInput
                label={form.modality === "ACC" ? "Prazo até o Embarque" : "Prazo desde o Embarque"}
                value={form.shippingDays}
                onChange={(v) => update("shippingDays", v)}
                min={7}
                max={365}
                step={1}
                unit="dias"
                icon={Ship}
                description={
                  form.modality === "ACC"
                    ? "Dias estimados até o embarque da mercadoria"
                    : "Dias decorridos desde o embarque"
                }
              />

              <SliderInput
                label="Prazo de Pagamento do Importador"
                value={form.paymentDays}
                onChange={(v) => update("paymentDays", v)}
                min={15}
                max={360}
                step={5}
                unit="dias"
                icon={Calendar}
                description="Prazo concedido ao importador para pagamento"
              />

              {/* Taxa de Câmbio */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#5E6278] flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Taxa de Câmbio (USD/BRL)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5E6278] text-sm font-medium">
                      R$
                    </span>
                    <input
                      type="number"
                      value={form.exchangeRate || ""}
                      onChange={(e) => {
                        update("exchangeRate", Number(e.target.value));
                        setRateSource("Manual");
                      }}
                      placeholder="5.65"
                      step="0.01"
                      min={0}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-black/[0.08] bg-white text-[#0F111A] text-sm focus:outline-none focus:border-[#D80E16]/30 focus:ring-2 focus:ring-[#D80E16]/10 transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setLoadingRate(true);
                      setRateError(null);
                      try {
                        const result = await bcb.getCotacaoDolar();
                        if (result.rate) {
                          setForm((f) => ({ ...f, exchangeRate: result.rate }));
                          setRateSource("BCB (PTAX Venda)");
                        } else {
                          setRateError(result.error || "Cotação indisponível");
                        }
                      } catch {
                        setRateError("Erro ao consultar BCB");
                      } finally {
                        setLoadingRate(false);
                      }
                    }}
                    disabled={loadingRate}
                    className="gap-1.5 rounded-xl shrink-0"
                  >
                    {loadingRate ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    PTAX
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  {rateSource && (
                    <span className="text-[10px] font-bold text-[#10b981] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {rateSource}: R$ {form.exchangeRate?.toFixed(4)}
                    </span>
                  )}
                  {rateError && (
                    <span className="text-[10px] text-amber-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {rateError}
                    </span>
                  )}
                </div>
              </div>

              {/* Taxa de Juros */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#5E6278] flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5" /> Taxa de Juros Estimada (a.a.)
                </label>
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={form.interestRate || ""}
                      onChange={(e) => update("interestRate", Number(e.target.value))}
                      placeholder={String(suggestedRate.default)}
                      step="0.1"
                      min={0.1}
                      max={30}
                      className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-black/[0.08] bg-white text-[#0F111A] text-sm focus:outline-none focus:border-[#D80E16]/30 focus:ring-2 focus:ring-[#D80E16]/10 transition-all placeholder:text-slate-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5E6278] text-sm font-bold">%</span>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {[suggestedRate.default, suggestedRate.min, suggestedRate.max].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => update("interestRate", rate)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all",
                        form.interestRate === rate
                          ? "bg-[#D80E16] text-white"
                          : "bg-slate-100 text-[#5E6278] hover:bg-slate-200"
                      )}
                    >
                      {rate}%
                    </button>
                  ))}
                  <span className="text-[10px] text-[#5E6278]/60 flex items-center px-1">
                    {form.modality} — taxa sugerida: {suggestedRate.min}% a {suggestedRate.max}% a.a.
                  </span>
                </div>
              </div>

              {/* Info Box */}
              <div className="p-3 rounded-xl bg-[#0F111A]/[0.02] border border-black/[0.04] flex gap-2">
                <Info className="w-4 h-4 text-[#D80E16] shrink-0 mt-0.5" />
                <div className="text-[10px] text-[#5E6278] leading-relaxed">
                  <p className="font-bold text-[#0F111A] mb-0.5">Fórmulas utilizadas (Banco Central)</p>
                  <p>
                    <strong>Valor {form.modality}:</strong> Exportação USD × PTAX × (1 − (Juros% × Prazo / 360))
                    <br />
                    <strong>Custo Total:</strong> Juros Proporcionais + IOF (0,38%)
                    <br />
                    <strong>Valor Líquido:</strong> Valor {form.modality} − Custo Total
                  </p>
                </div>
              </div>
            </motion.div>

            {/* ─── Resultados (2 colunas) ─── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-4 h-4 text-[#D80E16]" />
                <h2 className="text-lg font-extrabold text-[#0F111A]">Resultados</h2>
                {results && (
                  <Badge className="ml-auto bg-[#10b981]/10 text-[#10b981] border-0 text-[10px]">
                    Simulação Atualizada
                  </Badge>
                )}
              </div>

              {results ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={form.modality + form.exportValue + form.exchangeRate + form.interestRate}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <ResultCard
                      label="Valor Adiantado"
                      value={formatBRL(results.advancedBrl)}
                      sub={`${form.modality} — valor bruto antes do IOF`}
                      icon={DollarSign}
                      highlight
                    />

                    <ResultCard
                      label="Custo da Operação"
                      value={formatBRL(results.totalCost)}
                      sub={`${results.costPercentage.toFixed(2)}% do valor total (Juros: ${formatBRL(results.interestCost)} + IOF: ${formatBRL(results.iofCost)})`}
                      icon={Receipt}
                      color="#f59e0b"
                    />

                    <ResultCard
                      label="Valor Líquido Recebido"
                      value={formatBRL(results.netReceived)}
                      sub="Valor que cai na sua conta hoje"
                      icon={CheckCircle2}
                      color="#10b981"
                    />

                    <ResultCard
                      label="Data Prevista de Liquidação"
                      value={formatDate(results.expectedDate)}
                      sub={`${form.shippingDays + form.paymentDays} dias (${form.shippingDays} embarque + ${form.paymentDays} pagamento)`}
                      icon={Clock}
                    />

                    {/* Comparativo */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="p-4 rounded-xl border border-[#D80E16]/10 bg-gradient-to-br from-[#D80E16]/[0.03] to-transparent"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#D80E16]/10 flex items-center justify-center shrink-0">
                          <Sparkles className="w-4 h-4 text-[#D80E16]" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-[#5E6278] uppercase tracking-wider mb-1">
                            Comparativo
                          </p>
                          <p className="text-sm text-[#0F111A] leading-relaxed">
                            Se esperar o vencimento em{" "}
                            <strong>{form.shippingDays + form.paymentDays} dias</strong>, você recebe{" "}
                            <strong>{formatBRL(results.maturityValue)}</strong>.
                            <br />
                            Com <strong>{form.modality}</strong>, você recebe{" "}
                            <strong className="text-[#10b981]">{formatBRL(results.netReceived)}</strong>{" "}
                            <span className="text-[#D80E16] font-bold">agora mesmo</span>.
                          </p>
                          <p className="text-xs text-[#5E6278] mt-1.5">
                            Custo da antecipação: {formatBRL(results.totalCost)} ({results.costPercentage.toFixed(2)}% do valor total)
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="p-8 text-center">
                  <Calculator className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-[#5E6278]">
                    Preencha os dados ao lado para ver os resultados da simulação.
                  </p>
                </div>
              )}

              {/* ─── Gráfico Comparativo ─── */}
              {results && chartData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-3 sm:p-4 rounded-xl border border-black/[0.06] bg-white shadow-sm overflow-hidden"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-[#D80E16]" />
                    <h3 className="text-sm font-extrabold text-[#0F111A]">Comparativo Visual</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData} margin={{ top: 15, right: 5, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#0F111A0A" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 8, fill: "#5E6278", fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                      />
                      <YAxis
                        tick={{ fontSize: 8, fill: "#5E6278" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                        width={40}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid rgba(0,0,0,0.06)",
                          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                          fontSize: "11px",
                          fontFamily: "inherit",
                        }}
                        formatter={(value: number) => [formatBRL(value), ""]}
                      />
                      <Bar dataKey="valor" radius={[6, 6, 0, 0]} maxBarSize={50}>
                        {chartData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                        <LabelList
                          dataKey="valor"
                          position="top"
                          style={{ fontSize: "8px", fontWeight: 700, fill: "#0F111A" }}
                          formatter={(v: number) => {
                            // Abreviado no mobile para evitar sobreposição
                            if (v >= 1000) return `R$${(v / 1000).toFixed(0)}k`;
                            return formatBRL(v);
                          }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* ─── Seção Educativa ─── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 max-w-5xl mx-auto"
          >
            <div className="bg-white rounded-2xl border border-black/[0.06] p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-[#D80E16]" />
                <h2 className="text-xl font-extrabold text-[#0F111A]">O que são ACC e ACE?</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-bold text-[#D80E16] text-sm flex items-center gap-1.5">
                    <Ship className="w-4 h-4" /> ACC — Adiantamento sobre Contrato de Câmbio
                  </h3>
                  <p className="text-sm text-[#5E6278] leading-relaxed">
                    Linha de crédito para exportadores que antecipa os recursos antes do embarque da mercadoria.
                    Ideal para financiar a produção e se proteger contra oscilações cambiais.
                  </p>
                  <ul className="text-xs text-[#5E6278] space-y-1 list-disc pl-4">
                    <li>Contratado antes do embarque</li>
                    <li>Prazo máximo: 360 dias</li>
                    <li>Taxas competitivas (4,5% a 10% a.a.)</li>
                    <li>Antecipa até 100% do valor da exportação</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-[#D80E16] text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> ACE — Adiantamento sobre Cambiais Entregues
                  </h3>
                  <p className="text-sm text-[#5E6278] leading-relaxed">
                    Similar ao ACC, mas contratado após o embarque — quando os documentos (cambiais) já foram
                    entregues ao banco. Taxas reduzidas pelo menor risco.
                  </p>
                  <ul className="text-xs text-[#5E6278] space-y-1 list-disc pl-4">
                    <li>Contratado após o embarque</li>
                    <li>Menor risco → taxas menores</li>
                    <li>Taxas: 3,5% a 8% a.a.</li>
                    <li>Ideal para capital de giro</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </SiteLayout>
  );
}
