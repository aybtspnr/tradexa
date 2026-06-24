/**
 * Calculadora de Emissão de Carbono (CO₂) — Logística Internacional
 * Ferramenta gratuita para calcular e comparar emissões entre modais de transporte,
 * incluindo custo CBAM, projeção anual, gráfico visual e dicas de redução.
 */
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calculator, Truck, Ship, Plane, Train, Leaf,
  ArrowRight, Info, BarChart3, Scale, MapPin,
  TrendingDown, Euro, Calendar, Lightbulb,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

// ─── Tipos ───
type TransportMode = "maritimo" | "aereo" | "rodoviario" | "ferroviario";
type Frequency = "mensal" | "anual";

interface FormState {
  weight: number;
  distance: number;
  mode: TransportMode;
  frequency: Frequency;
}

interface ModalData {
  mode: TransportMode;
  label: string;
  icon: React.ElementType;
  emissionFactor: number; // gCO₂/ton-km
  efficiency: string;
}

// ─── Constantes ───
const MODAL_DATA: ModalData[] = [
  { mode: "maritimo", label: "Marítimo", icon: Ship, emissionFactor: 12, efficiency: "Alta" },
  { mode: "aereo", label: "Aéreo", icon: Plane, emissionFactor: 650, efficiency: "Baixa" },
  { mode: "rodoviario", label: "Rodoviário", icon: Truck, emissionFactor: 80, efficiency: "Média" },
  { mode: "ferroviario", label: "Ferroviário", icon: Train, emissionFactor: 25, efficiency: "Alta" },
];

const MODAL_ICONS: Record<TransportMode, React.ElementType> = {
  maritimo: Ship,
  aereo: Plane,
  rodoviario: Truck,
  ferroviario: Train,
};

const MODAL_LABELS: Record<TransportMode, string> = {
  maritimo: "Marítimo",
  aereo: "Aéreo",
  rodoviario: "Rodoviário",
  ferroviario: "Ferroviário",
};

const CBAM_PRICE_EUR = 85; // EUR por tonelada de CO₂ (referência EU ETS)

// ─── Contextualizações ───
const CONTEXTUALIZATIONS = [
  (kg: number) => {
    const cars = Math.round(kg / 400);
    return cars > 0
      ? `Equivalente a ${cars.toLocaleString("pt-BR")} carros populares rodando por um ano.`
      : `Equivalente a menos de 1 carro popular rodando por um ano.`;
  },
  (kg: number) => {
    const trees = Math.round(kg / 10);
    return trees > 0
      ? `Equivalente a ${trees.toLocaleString("pt-BR")} árvores absorvendo CO₂ por ano.`
      : `Equivalente a menos de 1 árvore absorvendo CO₂ por ano.`;
  },
  (kg: number) => {
    const flights = Math.round(kg / 1000);
    return flights > 0
      ? `≈ ${flights} voos São Paulo — Nova York (ida e volta, classe econômica).`
      : `Menos de 1 voo São Paulo — Nova York (ida e volta).`;
  },
];

// ─── Dicas de Redução ───
const REDUCTION_TIPS: Record<TransportMode, string[]> = {
  maritimo: [
    "Adote slow steaming: reduzir a velocidade em 10% pode cortar emissões em até 20%.",
    "Otimize rotas com software de planejamento para evitar desvios e esperas.",
    "Considere navios com propulsão a GNL ou biocombustíveis (drop-in fuels).",
    "Melhore a eficiência portuária com agendamento digital e redução de ociosidade.",
  ],
  aereo: [
    "Consolide cargas para maximizar o fator de ocupação (load factor) por voo.",
    "Priorize rotas diretas: escalas adicionam até 30% mais emissões por decolagem.",
    "Utilize aeronaves de nova geração (A350, B787) com consumo até 25% menor.",
    "Compense emissões via créditos de carbono certificados (VERRA, Gold Standard).",
  ],
  rodoviario: [
    "Modernize a frota com caminhões Euro VI ou elétricos para rotas curtas.",
    "Treine motoristas em eco-driving: aceleração suave reduz consumo em até 15%.",
    "Migrate trechos longos para modal ferroviário sempre que possível.",
    "Consolide cargas fracionadas para reduzir viagens com caminhão vazio ou parcial.",
  ],
  ferroviario: [
    "Priorize trechos eletrificados: trens elétricos emitem até 90% menos CO₂.",
    "Utilize frenagem regenerativa para recuperar energia em declives.",
    "Otimize a capacidade dos vagões com planejamento de carga e descarga.",
    "Integre com last-mile elétrico para eliminar emissões na ponta final.",
  ],
};

// ─── Helpers ───
function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} milhões`;
  if (n >= 1_000) return n.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
  return n.toFixed(1);
}

function formatKgCO2(kg: number): string {
  if (kg >= 1_000_000) return `${(kg / 1_000_000).toFixed(2)} t CO₂`;
  if (kg >= 1_000) return `${(kg / 1_000).toFixed(2)} t CO₂`;
  return `${kg.toFixed(0)} kg CO₂`;
}

function formatEUR(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getEmissionFactor(mode: TransportMode): number {
  return MODAL_DATA.find((m) => m.mode === mode)?.emissionFactor ?? 0;
}

function calculateEmissions(weight: number, distance: number, mode: TransportMode): number {
  if (!weight || !distance) return 0;
  const factor = getEmissionFactor(mode);
  return weight * distance * factor; // gCO₂
}

// ─── Página Principal ───
export default function CalculadoraCarbonoPage() {
  const [form, setForm] = useState<FormState>({
    weight: 10,
    distance: 20000,
    mode: "maritimo",
    frequency: "mensal",
  });

  useSeo({
    title: "Calculadora de Carbono CO₂ — Logística Internacional",
    description: "Calcule as emissões de CO₂ da sua operação de comércio exterior. Compare modais marítimo, aéreo, rodoviário e ferroviário.",
    canonical: "https://www.tradexa.com.br/ferramentas/calculadora-carbono",
  });

  const update = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  // Emissões por viagem (kg CO₂)
  const emissionG = useMemo(
    () => calculateEmissions(form.weight, form.distance, form.mode),
    [form],
  );
  const emissionKg = emissionG / 1000;

  // Emissões anualizadas (se frequência anual)
  const emissionKgYear = useMemo(() => {
    if (form.frequency === "anual") return emissionKg * 12;
    return emissionKg;
  }, [emissionKg, form.frequency]);

  // CBAM cost (EUR) — usa a emissão por viagem (mensal) ou anualizada
  const cbamCost = useMemo(() => {
    const tons = emissionKgYear / 1000; // kg → toneladas
    return tons * CBAM_PRICE_EUR;
  }, [emissionKgYear]);

  // Comparações entre modais
  const comparisons = useMemo(() => {
    return MODAL_DATA.map((m) => ({
      ...m,
      emissionsKg: calculateEmissions(form.weight, form.distance, m.mode) / 1000,
    }));
  }, [form.weight, form.distance]);

  const maxEmissions = Math.max(...comparisons.map((c) => c.emissionsKg), 1);
  const maritimeEmissions =
    comparisons.find((c) => c.mode === "maritimo")?.emissionsKg ?? 1;

  // Contextualização aleatória (estável por resultado)
  const contextualText = useMemo(() => {
    if (!emissionKgYear) return "";
    // Usa um índice pseudo-determinístico baseado no valor para evitar flicker
    const idx = Math.floor(emissionKgYear * 7) % CONTEXTUALIZATIONS.length;
    return CONTEXTUALIZATIONS[Math.abs(idx)](emissionKgYear);
  }, [emissionKgYear]);

  // Dados para o gráfico horizontal
  const chartData = useMemo(() => {
    return MODAL_DATA.map((m) => {
      const kg = calculateEmissions(form.weight, form.distance, m.mode) / 1000;
      return {
        name: m.label,
        emissaoKg: kg,
        fill: m.mode === form.mode ? "#D80E16" : "#5E6278",
        isSelected: m.mode === form.mode,
      };
    });
  }, [form.weight, form.distance, form.mode]);

  // Dica selecionada (roda entre as 4 dicas do modal atual)
  const tipIndex = useMemo(
    () => Math.floor(emissionKgYear * 3) % REDUCTION_TIPS[form.mode].length,
    [form.mode, emissionKgYear],
  );
  const currentTip = REDUCTION_TIPS[form.mode][Math.abs(tipIndex)];

  return (
    <SiteLayout>
      {/* ═══════════════ Hero ═══════════════ */}
      <section className="relative pt-28 pb-12 md:pt-36 md:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <ParticleCanvasThemed
            opacity={0.12}
            particleCount={25}
            color="216,14,22"
            connectionDist={120}
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(216,14,22,0.04),transparent)]" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 font-bold text-[11px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-0 bg-[#D80E16]/8 text-[#D80E16]">
              <Leaf className="w-3.5 h-3.5 mr-1.5" />
              Ferramenta Gratuita
            </Badge>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#0F111A] mb-4 leading-tight">
              Calculadora de{" "}
              <span className="text-[#D80E16]">Emissão de Carbono</span>
            </h1>
            <p className="text-lg text-[#5E6278] max-w-2xl mx-auto">
              Estime as emissões de CO₂ da sua operação de comércio exterior,
              compare o impacto ambiental entre modais e descubra quanto sua
              carga custaria sob o CBAM europeu.
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
              {/* Peso da Carga */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#5E6278] flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" /> Peso da Carga (toneladas)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.weight || ""}
                    onChange={(e) => update("weight", Number(e.target.value))}
                    placeholder="10"
                    min={0}
                    step={0.1}
                    className="w-full pl-3 pr-3 py-2.5 rounded-xl border border-black/[0.08] bg-white text-[#0F111A] text-sm focus:outline-none focus:border-[#D80E16]/30 focus:ring-2 focus:ring-[#D80E16]/10 transition-all placeholder:text-slate-400"
                  />
                </div>
                <p className="text-[10px] text-[#5E6278]/70">
                  1 contêiner de 20' ≈ 10t líquidas
                </p>
              </div>

              {/* Distância */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#5E6278] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Distância Percorrida (km)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.distance || ""}
                    onChange={(e) => update("distance", Number(e.target.value))}
                    placeholder="20000"
                    min={0}
                    step={100}
                    className="w-full pl-3 pr-3 py-2.5 rounded-xl border border-black/[0.08] bg-white text-[#0F111A] text-sm focus:outline-none focus:border-[#D80E16]/30 focus:ring-2 focus:ring-[#D80E16]/10 transition-all placeholder:text-slate-400"
                  />
                </div>
                <p className="text-[10px] text-[#5E6278]/70">
                  Shanghai → Santos ≈ 20.000 km
                </p>
              </div>

              {/* Modal de Transporte */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#5E6278] flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5" /> Modal de Transporte
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(MODAL_LABELS) as [TransportMode, string][]).map(
                    ([mode, label]) => {
                      const Icon = MODAL_ICONS[mode];
                      return (
                        <button
                          key={mode}
                          onClick={() => update("mode", mode)}
                          className={cn(
                            "p-3 rounded-xl border text-left transition-all",
                            form.mode === mode
                              ? "border-[#D80E16] bg-[#D80E16]/[0.04] shadow-sm"
                              : "border-black/[0.06] hover:border-[#D80E16]/20",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Icon
                              className={cn(
                                "w-4 h-4",
                                form.mode === mode
                                  ? "text-[#D80E16]"
                                  : "text-[#5E6278]",
                              )}
                            />
                            <p
                              className={cn(
                                "font-bold text-sm",
                                form.mode === mode
                                  ? "text-[#D80E16]"
                                  : "text-[#0F111A]",
                              )}
                            >
                              {label}
                            </p>
                          </div>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              {/* Frequência — toggle Mensal / Anual */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#5E6278] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Frequência da Operação
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["mensal", "anual"] as Frequency[]).map((freq) => (
                    <button
                      key={freq}
                      onClick={() => update("frequency", freq)}
                      className={cn(
                        "p-3 rounded-xl border text-center transition-all font-bold text-sm",
                        form.frequency === freq
                          ? "border-[#D80E16] bg-[#D80E16]/[0.04] shadow-sm text-[#D80E16]"
                          : "border-black/[0.06] hover:border-[#D80E16]/20 text-[#0F111A]",
                      )}
                    >
                      {freq === "mensal" ? "Mensal" : "Anual"}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[#5E6278]/70">
                  {form.frequency === "anual"
                    ? "Projeção: 12 embarques por ano. Cálculo anualizado."
                    : "Cálculo para 1 embarque mensal típico."}
                </p>
              </div>

              {/* Resultado */}
              {emissionKg > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-gradient-to-br from-[#D80E16]/[0.04] to-transparent border border-[#D80E16]/20 p-5 space-y-3"
                >
                  <p className="text-[11px] font-bold text-[#5E6278] uppercase tracking-wider">
                    Resultado
                  </p>

                  {/* Emissão principal */}
                  <div>
                    <p className="text-3xl font-extrabold text-[#D80E16]">
                      {formatKgCO2(
                        form.frequency === "anual" ? emissionKgYear : emissionKg,
                      )}
                    </p>
                    <p className="text-[10px] text-[#5E6278]/60 mt-0.5">
                      {form.frequency === "anual"
                        ? `${formatKgCO2(emissionKg)} por embarque × 12 meses`
                        : `por embarque`}
                    </p>
                  </div>

                  {/* Contextualização */}
                  <p className="text-[11px] text-[#5E6278]/70 leading-relaxed">
                    Para contextualizar: {contextualText}
                  </p>

                  {/* CBAM Cost */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-[#f59e0b]/[0.06] border border-[#f59e0b]/20">
                    <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center shrink-0">
                      <Euro className="w-4 h-4 text-[#f59e0b]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#f59e0b] uppercase tracking-wider mb-0.5">
                        Custo Estimado CBAM
                      </p>
                      <p className="text-lg font-extrabold text-[#0F111A] tabular-nums">
                        {formatEUR(cbamCost)}
                      </p>
                      <p className="text-[10px] text-[#5E6278]/70 mt-0.5">
                        Com base em {CBAM_PRICE_EUR} EUR/t CO₂ (referência EU ETS).{" "}
                        {form.frequency === "mensal"
                          ? "Valor por embarque."
                          : "Projeção para 12 embarques."}
                      </p>
                    </div>
                  </div>

                  {/* Projeção anual — só mostra se for mensal (pois anual já mostra no principal) */}
                  {form.frequency === "mensal" && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-[#10b981]/[0.06] border border-[#10b981]/20">
                      <div className="w-8 h-8 rounded-lg bg-[#10b981]/10 flex items-center justify-center shrink-0">
                        <TrendingDown className="w-4 h-4 text-[#10b981]" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-[#10b981] uppercase tracking-wider mb-0.5">
                          Projeção Anual (12 embarques)
                        </p>
                        <p className="text-lg font-extrabold text-[#0F111A] tabular-nums">
                          {formatKgCO2(emissionKg * 12)}
                        </p>
                        <p className="text-[10px] text-[#5E6278]/70 mt-0.5">
                          CBAM anual estimado:{" "}
                          <span className="font-bold text-[#f59e0b]">
                            {formatEUR(emissionKg * 12 / 1000 * CBAM_PRICE_EUR)}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>

            {/* ─── Painel Direito (2 colunas) ─── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-4"
            >
              {/* Comparativo entre Modais */}
              <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-sm">
                <h3 className="text-sm font-bold text-[#0F111A] mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#D80E16]" />
                  Comparativo entre Modais
                </h3>
                <div className="space-y-3">
                  {/* Cabeçalho */}
                  <div className="grid grid-cols-[1fr_auto_auto] gap-2 text-[10px] font-bold text-[#5E6278] uppercase tracking-wider px-2">
                    <span>Modal</span>
                    <span className="text-right">Emissões CO₂</span>
                    <span className="text-right w-16">vs Marítimo</span>
                  </div>
                  {comparisons.map((m) => {
                    const ratio =
                      m.mode === "maritimo"
                        ? 1
                        : m.emissionsKg / maritimeEmissions;
                    const widthPct =
                      maxEmissions > 0
                        ? (m.emissionsKg / maxEmissions) * 100
                        : 0;
                    return (
                      <div
                        key={m.mode}
                        className="grid grid-cols-[1fr_auto_auto] gap-2 items-center px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <m.icon className="w-3.5 h-3.5 text-[#5E6278]" />
                          <span className="text-xs font-medium text-[#0F111A]">
                            {m.label}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-bold text-[#0F111A] tabular-nums">
                            {formatKgCO2(m.emissionsKg)}
                          </span>
                          <div className="w-24 h-1.5 rounded-full bg-slate-100 mt-0.5">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                m.mode === form.mode
                                  ? "bg-[#D80E16]"
                                  : "bg-slate-300",
                              )}
                              style={{ width: `${widthPct}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-right w-16 tabular-nums text-[#5E6278]">
                          {m.mode === "maritimo"
                            ? "--"
                            : `${ratio.toFixed(1)}x`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Gráfico Visual — BarChart horizontal */}
              <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-sm">
                <h3 className="text-sm font-bold text-[#0F111A] mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#D80E16]" />
                  Gráfico Comparativo
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 0, right: 70, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#0F111A0A"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 9, fill: "#5E6278" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => {
                        if (v >= 1000) return `${(v / 1000).toFixed(0)}t`;
                        return `${v.toFixed(0)}kg`;
                      }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 10, fontWeight: 600, fill: "#0F111A" }}
                      axisLine={false}
                      tickLine={false}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid rgba(0,0,0,0.06)",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                        fontSize: "11px",
                        fontFamily: "inherit",
                      }}
                      formatter={(value: number) => [
                        formatKgCO2(value),
                        "Emissão CO₂",
                      ]}
                    />
                    <Bar
                      dataKey="emissaoKg"
                      radius={[0, 6, 6, 0]}
                      maxBarSize={32}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-[#5E6278]/60 mt-2 text-center">
                  Emissões para {form.weight}t em {form.distance.toLocaleString("pt-BR")} km
                </p>
              </div>

              {/* Dicas de Redução */}
              <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-sm">
                <h3 className="text-sm font-bold text-[#0F111A] mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-[#f59e0b]" />
                  Dicas de Redução — {MODAL_LABELS[form.mode]}
                </h3>
                <ul className="space-y-2">
                  {REDUCTION_TIPS[form.mode].map((tip, i) => (
                    <li
                      key={i}
                      className={cn(
                        "flex items-start gap-2 text-xs leading-relaxed rounded-lg p-2 transition-colors",
                        i === tipIndex
                          ? "bg-[#D80E16]/[0.04] border border-[#D80E16]/10"
                          : "text-[#5E6278]",
                      )}
                    >
                      <span
                        className={cn(
                          "shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5",
                          i === tipIndex
                            ? "bg-[#D80E16] text-white"
                            : "bg-slate-100 text-[#5E6278]",
                        )}
                      >
                        {i + 1}
                      </span>
                      <span
                        className={
                          i === tipIndex
                            ? "text-[#0F111A] font-medium"
                            : undefined
                        }
                      >
                        {tip}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Metodologia — Referência */}
              <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-sm">
                <h4 className="text-xs font-bold text-[#0F111A] mb-2 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#5E6278]" />
                  Metodologia e Referências
                </h4>
                <div className="text-[10px] text-[#5E6278] leading-relaxed space-y-1.5">
                  <p>
                    Fatores de emissão baseados em médias da indústria (GLEC
                    Framework / IMO / GHG Protocol).
                  </p>
                  <p>
                    <strong>Marítimo:</strong> 12 gCO₂/t-km |{" "}
                    <strong>Aéreo:</strong> 650 gCO₂/t-km |{" "}
                    <strong>Rodoviário:</strong> 80 gCO₂/t-km |{" "}
                    <strong>Ferroviário:</strong> 25 gCO₂/t-km
                  </p>
                  <p>
                    <strong>CBAM:</strong> Preço de referência de{" "}
                    {CBAM_PRICE_EUR} EUR/t CO₂ — média do EU ETS (2024-2025).
                    Valor sujeito a variações de mercado.
                  </p>
                  <p>
                    Valores reais variam conforme tipo de navio/aeronave/caminhão,
                    idade da frota, taxa de ocupação e rota específica. Esta
                    calculadora oferece estimativas para fins de planejamento.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="relative py-20 bg-gradient-to-b from-white to-[#D80E16]/5">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Badge className="mb-4 font-bold text-[11px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-0 bg-[#D80E16]/8 text-[#D80E16]">
            <Leaf className="w-3.5 h-3.5 mr-1.5" />
            Quer reduzir a pegada de carbono da sua operação?
          </Badge>
          <h2 className="text-3xl font-extrabold text-[#0F111A] mb-4">
            Otimização de Rota e Modal
          </h2>
          <p className="text-[#5E6278] mb-8 max-w-xl mx-auto">
            Nossa equipe analisa sua cadeia logística e identifica oportunidades
            reais de redução de emissões com economia de custos.
          </p>
          <Link
            to="/contato"
            className="inline-flex items-center gap-2 bg-[#D80E16] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#b80c12] transition-colors"
          >
            Falar com Especialista <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
