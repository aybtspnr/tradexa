/**
 * Calculadora de Incoterms 2020 — Compare Custos e Responsabilidades
 * Ferramenta interativa para selecionar incoterm, inserir valores e visualizar
 * a distribuicao de custos entre vendedor e comprador.
 */
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText, ArrowRight, Info, Check, X, ChevronDown,
  Scale, DollarSign, Truck, Shield, Package, Ship,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

// ─── Tipos ───
type IncotermCode =
  | "EXW" | "FCA" | "FAS" | "FOB" | "CFR" | "CIF"
  | "CPT" | "CIP" | "DAP" | "DPU" | "DDP";

interface IncotermDef {
  code: IncotermCode;
  nome: string;
  nomeCompleto: string;
  descricao: string;
  transporte: "qualquer" | "maritimo" | "qualquer";
  riscoTransfere: string;
}

interface CostRow {
  label: string;
  icon: React.ElementType;
  seller: boolean;
  buyer: boolean;
}

// ─── Incoterms 2020 ───
const INCOTERMS: IncotermDef[] = [
  { code: "EXW", nome: "Ex Works", nomeCompleto: "Ex Works (Local de Origem)", descricao: "Vendedor disponibiliza a mercadoria no seu estabelecimento. Comprador arca com todos os custos e riscos desde o pickup.", transporte: "qualquer", riscoTransfere: "No estabelecimento do vendedor" },
  { code: "FCA", nome: "Free Carrier", nomeCompleto: "Free Carrier (Ponto Acordado)", descricao: "Vendedor entrega a mercadoria ao transportador no ponto acordado. Risco se transfere na entrega ao transportador.", transporte: "qualquer", riscoTransfere: "No ponto de entrega ao transportador" },
  { code: "FAS", nome: "Free Alongside Ship", nomeCompleto: "Free Alongside Ship (Porto de Embarque)", descricao: "Vendedor coloca a mercadoria ao lado do navio no porto de embarque. Risco se transfere na colocação ao lado do navio.", transporte: "maritimo", riscoTransfere: "Ao lado do navio no porto de embarque" },
  { code: "FOB", nome: "Free On Board", nomeCompleto: "Free On Board (Porto de Embarque)", descricao: "Vendedor entrega a mercadoria a bordo do navio. Risco se transfere quando a carga esta no navio.", transporte: "maritimo", riscoTransfere: "A bordo do navio no porto de embarque" },
  { code: "CFR", nome: "Cost and Freight", nomeCompleto: "Cost and Freight (Porto de Destino)", descricao: "Vendedor paga o frete ate o porto de destino, mas o risco se transfere quando a carga embarca.", transporte: "maritimo", riscoTransfere: "A bordo do navio no porto de embarque" },
  { code: "CIF", nome: "Cost, Insurance and Freight", nomeCompleto: "Cost, Insurance and Freight (Porto de Destino)", descricao: "Vendedor paga frete e seguro ate o porto de destino. Risco se transfere quando a carga embarca.", transporte: "maritimo", riscoTransfere: "A bordo do navio no porto de embarque" },
  { code: "CPT", nome: "Carriage Paid To", nomeCompleto: "Carriage Paid To (Destino Acordado)", descricao: "Vendedor paga o frete ate o destino acordado. Risco se transfere quando a mercadoria e entregue ao primeiro transportador.", transporte: "qualquer", riscoTransfere: "Entrega ao primeiro transportador" },
  { code: "CIP", nome: "Carriage and Insurance Paid To", nomeCompleto: "Carriage and Insurance Paid To (Destino Acordado)", descricao: "Vendedor paga frete e seguro ate o destino. Risco se transfere na entrega ao primeiro transportador.", transporte: "qualquer", riscoTransfere: "Entrega ao primeiro transportador" },
  { code: "DAP", nome: "Delivered at Place", nomeCompleto: "Delivered at Place (Destino Acordado)", descricao: "Vendedor entrega a mercadoria no destino acordado, pronta para descarga. Risco se transfere no destino.", transporte: "qualquer", riscoTransfere: "No destino acordado (pronta para descarga)" },
  { code: "DPU", nome: "Delivered at Place Unloaded", nomeCompleto: "Delivered at Place Unloaded (Destino Acordado)", descricao: "Vendedor entrega e descarrega a mercadoria no destino. Unico Incoterm que exige descarga pelo vendedor.", transporte: "qualquer", riscoTransfere: "No destino, apos descarga" },
  { code: "DDP", nome: "Delivered Duty Paid", nomeCompleto: "Delivered Duty Paid (Destino Acordado)", descricao: "Vendedor arca com todos os custos, inclusive desembaraco e impostos no destino. Maior responsabilidade do vendedor.", transporte: "qualquer", riscoTransfere: "No destino, com impostos pagos" },
];

// ─── Matriz de responsabilidades ───
// true = vendedor paga, false = comprador paga
const RESPONSABILIDADES: Record<IncotermCode, Record<string, boolean>> = {
  EXW: { Carregamento: false, "Transporte Internacional": false, Seguro: false, Desembaraco: false, Impostos_Importacao: false, Descarga_Destino: false },
  FCA: { Carregamento: true, "Transporte Internacional": false, Seguro: false, Desembaraco: false, Impostos_Importacao: false, Descarga_Destino: false },
  FAS: { Carregamento: true, "Transporte Internacional": false, Seguro: false, Desembaraco: false, Impostos_Importacao: false, Descarga_Destino: false },
  FOB: { Carregamento: true, "Transporte Internacional": false, Seguro: false, Desembaraco: false, Impostos_Importacao: false, Descarga_Destino: false },
  CFR: { Carregamento: true, "Transporte Internacional": true, Seguro: false, Desembaraco: false, Impostos_Importacao: false, Descarga_Destino: false },
  CIF: { Carregamento: true, "Transporte Internacional": true, Seguro: true, Desembaraco: false, Impostos_Importacao: false, Descarga_Destino: false },
  CPT: { Carregamento: true, "Transporte Internacional": true, Seguro: false, Desembaraco: false, Impostos_Importacao: false, Descarga_Destino: false },
  CIP: { Carregamento: true, "Transporte Internacional": true, Seguro: true, Desembaraco: false, Impostos_Importacao: false, Descarga_Destino: false },
  DAP: { Carregamento: true, "Transporte Internacional": true, Seguro: false, Desembaraco: false, Impostos_Importacao: false, Descarga_Destino: false },
  DPU: { Carregamento: true, "Transporte Internacional": true, Seguro: false, Desembaraco: false, Impostos_Importacao: false, Descarga_Destino: true },
  DDP: { Carregamento: true, "Transporte Internacional": true, Seguro: false, Desembaraco: true, Impostos_Importacao: true, Descarga_Destino: false },
};

const COST_LABELS: { key: string; label: string; icon: React.ElementType }[] = [
  { key: "Carregamento", label: "Carregamento", icon: Package },
  { key: "Transporte Internacional", label: "Transporte Internacional", icon: Ship },
  { key: "Seguro", label: "Seguro", icon: Shield },
  { key: "Desembaraco", label: "Desembaraco", icon: Truck },
  { key: "Impostos_Importacao", label: "Impostos de Importacao", icon: Scale },
  { key: "Descarga_Destino", label: "Descarga no Destino", icon: Package },
];

const CUSTOS_FIXOS = {
  loading: 250,       // Carregamento
  customs: 1800,      // Desembaraco
  importDuties: 3200, // Impostos
  unloading: 300,     // Descarga
};

// ─── Helpers ───
function formatUSD(v: number): string {
  return `US$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── Pagina Principal ───
export default function CalculadoraIncotermsPage() {
  const [selected, setSelected] = useState<IncotermCode>("FOB");
  const [fobValue, setFobValue] = useState<number>(50000);
  const [freightCost, setFreightCost] = useState<number>(3500);
  const [insuranceCost, setInsuranceCost] = useState<number>(450);
  const [otherCosts, setOtherCosts] = useState<number>(0);
  const [loadingCost, setLoadingCost] = useState<number>(CUSTOS_FIXOS.loading);
  const [customsCost, setCustomsCost] = useState<number>(CUSTOS_FIXOS.customs);
  const [importDutiesCost, setImportDutiesCost] = useState<number>(CUSTOS_FIXOS.importDuties);
  const [unloadingCost, setUnloadingCost] = useState<number>(CUSTOS_FIXOS.unloading);

  useSeo({
    title:
      "Calculadora de Incoterms 2020 | TRADEXA",
    description:
      "Compare todos os Incoterms 2020: EXW, FOB, CIF, DDP e mais. Veja quem paga frete, seguro, desembaraco e calcule o custo total do comprador.",
    canonical: "https://www.tradexa.com.br/ferramentas/calculadora-incoterms",
  });

  const incoterm = INCOTERMS.find((i) => i.code === selected)!;
  const resp = RESPONSABILIDADES[selected];

  // Cálculo dinâmico do custo total do comprador
  const buyerCost = useMemo(() => {
    let total = fobValue;
    // Frete internacional
    if (!resp["Transporte Internacional"]) total += freightCost;
    // Seguro
    if (!resp["Seguro"]) total += insuranceCost;
    // Outros custos fixos
    if (!resp["Carregamento"]) total += loadingCost;
    if (!resp["Desembaraco"]) total += customsCost;
    if (!resp["Impostos_Importacao"]) total += importDutiesCost;
    if (!resp["Descarga_Destino"]) total += unloadingCost;
    total += otherCosts;
    return total;
  }, [fobValue, freightCost, insuranceCost, otherCosts, resp]);

  const sellerCost = useMemo(() => {
    let total = 0;
    if (resp["Transporte Internacional"]) total += freightCost;
    if (resp["Seguro"]) total += insuranceCost;
    if (resp["Carregamento"]) total += loadingCost;
    if (resp["Desembaraco"]) total += customsCost;
    if (resp["Impostos_Importacao"]) total += importDutiesCost;
    if (resp["Descarga_Destino"]) total += unloadingCost;
    return total;
  }, [freightCost, insuranceCost, resp]);

  const totalValue = fobValue + sellerCost + (buyerCost - fobValue - otherCosts);

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
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              Incoterms 2020
            </Badge>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#0F111A] mb-4 leading-tight">
              Calculadora de{" "}
              <span className="text-[#D80E16]">Incoterms</span>
            </h1>
            <p className="text-lg text-[#5E6278] max-w-2xl mx-auto">
              Compare todos os 11 Incoterms 2020: visualize responsabilidades,
              insira valores e calcule o custo total do comprador para cada
              modalidade.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ Conteudo Principal ═══════════════ */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8 bg-[#FAFAF9] overflow-x-hidden">
        <div className="max-w-6xl mx-auto space-y-8 overflow-hidden">

          {/* ─── Selecao de Incoterm ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-black/[0.06] p-6 md:p-8 shadow-sm"
          >
            <h2 className="text-sm font-bold text-[#5E6278] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#D80E16]" />
              Selecione o Incoterm
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 sm:overflow-visible scrollbar-hide">
              {INCOTERMS.map((term) => (
                <button
                  key={term.code}
                  onClick={() => setSelected(term.code)}
                  className={cn(
                    "relative p-3 rounded-xl border text-center transition-all group shrink-0 min-w-[70px]",
                    selected === term.code
                      ? "border-[#D80E16] bg-[#D80E16]/[0.04] shadow-sm"
                      : "border-black/[0.06] hover:border-[#D80E16]/20 hover:bg-[#D80E16]/[0.02]"
                  )}
                >
                  <p
                    className={cn(
                      "text-sm font-extrabold",
                      selected === term.code ? "text-[#D80E16]" : "text-[#0F111A]"
                    )}
                  >
                    {term.code}
                  </p>
                  <p className="text-[9px] text-[#5E6278] mt-0.5 leading-tight hidden sm:block">
                    {term.nome}
                  </p>
                  {selected === term.code && (
                    <motion.div
                      layoutId="incoterm-indicator"
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-[#D80E16]"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Info do incoterm selecionado */}
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-5 rounded-xl bg-gradient-to-br from-[#D80E16]/[0.03] to-transparent border border-[#D80E16]/15"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#D80E16]/10 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-[#D80E16]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#0F111A]">
                    {selected} — {incoterm.nomeCompleto}
                  </h3>
                  <p className="text-sm text-[#5E6278] mt-1 leading-relaxed">
                    {incoterm.descricao}
                  </p>
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-[#5E6278] uppercase">Transporte:</span>
                      <Badge className="text-[9px] sm:text-[10px] bg-[#5E6278]/10 text-[#5E6278] border-0 capitalize whitespace-nowrap">
                        {incoterm.transporte}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-[#5E6278] uppercase">Risco transfere:</span>
                      <span className="text-[10px] text-[#0F111A] font-medium">
                        {incoterm.riscoTransfere}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">

            {/* ─── Formulario de Custos (2 colunas) ─── */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Inputs */}
              <div className="bg-white rounded-2xl border border-black/[0.06] p-6 md:p-8 shadow-sm space-y-5">
                <h3 className="text-sm font-bold text-[#5E6278] uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#D80E16]" />
                  Valores da Operacao (USD)
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#5E6278]">Valor FOB (USD)</label>
                    <input
                      type="number"
                      value={fobValue || ""}
                      onChange={(e) => setFobValue(Number(e.target.value))}
                      placeholder="50000"
                      min={0}
                      step={1000}
                      className="w-full px-4 py-3 rounded-xl border border-black/[0.08] bg-white text-[#0F111A] text-sm font-medium tabular-nums focus:outline-none focus:border-[#D80E16]/30 focus:ring-2 focus:ring-[#D80E16]/10 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#5E6278]">Custo Frete Internacional (USD)</label>
                    <input
                      type="number"
                      value={freightCost || ""}
                      onChange={(e) => setFreightCost(Number(e.target.value))}
                      placeholder="3500"
                      min={0}
                      step={100}
                      className="w-full px-4 py-3 rounded-xl border border-black/[0.08] bg-white text-[#0F111A] text-sm font-medium tabular-nums focus:outline-none focus:border-[#D80E16]/30 focus:ring-2 focus:ring-[#D80E16]/10 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#5E6278]">Custo Seguro (USD)</label>
                    <input
                      type="number"
                      value={insuranceCost || ""}
                      onChange={(e) => setInsuranceCost(Number(e.target.value))}
                      placeholder="450"
                      min={0}
                      step={50}
                      className="w-full px-4 py-3 rounded-xl border border-black/[0.08] bg-white text-[#0F111A] text-sm font-medium tabular-nums focus:outline-none focus:border-[#D80E16]/30 focus:ring-2 focus:ring-[#D80E16]/10 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#5E6278]">Outros Custos (USD)</label>
                    <input
                      type="number"
                      value={otherCosts || ""}
                      onChange={(e) => setOtherCosts(Number(e.target.value))}
                      placeholder="0"
                      min={0}
                      step={100}
                      className="w-full px-4 py-3 rounded-xl border border-black/[0.08] bg-white text-[#0F111A] text-sm font-medium tabular-nums focus:outline-none focus:border-[#D80E16]/30 focus:ring-2 focus:ring-[#D80E16]/10 transition-all"
                    />
                  </div>
                </div>

                {/* Custos Fixos Editaveis */}
                <div className="mt-4 pt-4 border-t border-black/[0.04]">
                  <p className="text-[10px] font-bold text-[#5E6278] uppercase tracking-wider mb-3">
                    Custos Estimados por Operacao (USD) — edite conforme sua operacao
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#5E6278]">Carregamento</label>
                      <input
                        type="number"
                        value={loadingCost || ""}
                        onChange={(e) => setLoadingCost(Number(e.target.value))}
                        placeholder="250"
                        min={0}
                        step={50}
                        className="w-full px-3 py-2 rounded-lg border border-black/[0.08] bg-white text-[#0F111A] text-xs font-medium tabular-nums focus:outline-none focus:border-[#D80E16]/30 focus:ring-2 focus:ring-[#D80E16]/10 transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#5E6278]">Desembaraco Aduaneiro</label>
                      <input
                        type="number"
                        value={customsCost || ""}
                        onChange={(e) => setCustomsCost(Number(e.target.value))}
                        placeholder="1800"
                        min={0}
                        step={100}
                        className="w-full px-3 py-2 rounded-lg border border-black/[0.08] bg-white text-[#0F111A] text-xs font-medium tabular-nums focus:outline-none focus:border-[#D80E16]/30 focus:ring-2 focus:ring-[#D80E16]/10 transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#5E6278]">Impostos de Importacao</label>
                      <input
                        type="number"
                        value={importDutiesCost || ""}
                        onChange={(e) => setImportDutiesCost(Number(e.target.value))}
                        placeholder="3200"
                        min={0}
                        step={100}
                        className="w-full px-3 py-2 rounded-lg border border-black/[0.08] bg-white text-[#0F111A] text-xs font-medium tabular-nums focus:outline-none focus:border-[#D80E16]/30 focus:ring-2 focus:ring-[#D80E16]/10 transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#5E6278]">Descarga no Destino</label>
                      <input
                        type="number"
                        value={unloadingCost || ""}
                        onChange={(e) => setUnloadingCost(Number(e.target.value))}
                        placeholder="300"
                        min={0}
                        step={50}
                        className="w-full px-3 py-2 rounded-lg border border-black/[0.08] bg-white text-[#0F111A] text-xs font-medium tabular-nums focus:outline-none focus:border-[#D80E16]/30 focus:ring-2 focus:ring-[#D80E16]/10 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Matriz de Responsabilidade Visual */}
              <div className="bg-white rounded-2xl border border-black/[0.06] p-6 md:p-8 shadow-sm">
                <h3 className="text-sm font-bold text-[#5E6278] uppercase tracking-wider mb-5 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#D80E16]" />
                  Distribuicao de Custos — {selected}
                </h3>

                <div className="space-y-3">
                  {COST_LABELS.map((cost) => {
                    const Icon = cost.icon;
                    const sellerPays = resp[cost.key];
                    return (
                      <div
                        key={cost.key}
                        className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-xl border border-black/[0.04] hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#D80E16]/5 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-[#D80E16]" />
                          </div>
                          <p className="text-sm font-bold text-[#0F111A]">{cost.label}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-10 sm:ml-0">
                          <div
                            className={cn(
                              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold",
                              sellerPays
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-50 text-[#5E6278] border border-slate-200"
                            )}
                          >
                            {sellerPays ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <X className="w-3.5 h-3.5" />
                            )}
                            <span className="hidden xs:inline">Vendedor</span>
                            <span className="xs:hidden">Vend.</span>
                          </div>
                          <div
                            className={cn(
                              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold",
                              !sellerPays
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-slate-50 text-[#5E6278] border border-slate-200"
                            )}
                          >
                            {!sellerPays ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <X className="w-3.5 h-3.5" />
                            )}
                            <span className="hidden xs:inline">Comprador</span>
                            <span className="xs:hidden">Comp.</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Resumo visual */}
                <div className="mt-5 p-4 rounded-xl bg-[#FAFAF9] border border-black/[0.04]">
                  <div className="flex items-center gap-3 sm:gap-4 text-xs flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-[#5E6278] font-bold">Vendedor paga</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="text-[#5E6278] font-bold">Comprador paga</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Matriz Completa — Todos os Incoterms */}
              <div className="bg-white rounded-2xl border border-black/[0.06] p-6 md:p-8 shadow-sm">
                <h3 className="text-sm font-bold text-[#5E6278] uppercase tracking-wider mb-5 flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#D80E16]" />
                  Matriz Completa de Responsabilidades
                </h3>

                {/* Desktop: tabela completa */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-xs border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-black/[0.06]">
                        <th className="text-left py-2 px-2 font-bold text-[#5E6278] uppercase tracking-wider text-[10px]">
                          Responsabilidade
                        </th>
                        {INCOTERMS.map((t) => (
                          <th
                            key={t.code}
                            className={cn(
                              "py-2 px-1 text-center font-extrabold text-[10px] uppercase tracking-wider",
                              selected === t.code
                                ? "text-[#D80E16] bg-[#D80E16]/[0.04]"
                                : "text-[#0F111A]"
                            )}
                          >
                            {t.code}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {COST_LABELS.map((cost) => (
                        <tr key={cost.key} className="border-b border-black/[0.04]">
                          <td className="py-2.5 px-2 text-[#0F111A] font-medium">
                            {cost.label}
                          </td>
                          {INCOTERMS.map((t) => {
                            const pays = RESPONSABILIDADES[t.code][cost.key];
                            return (
                              <td
                                key={t.code}
                                className={cn(
                                  "py-2.5 px-1 text-center",
                                  selected === t.code && "bg-[#D80E16]/[0.03]"
                                )}
                              >
                                {pays ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                                    <Check className="w-3.5 h-3.5" />
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-[#5E6278]">
                                    <X className="w-3.5 h-3.5" />
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      <tr className="border-b border-black/[0.04]">
                        <td className="py-2.5 px-2 text-[#0F111A] font-medium">Modalidade de Transporte</td>
                        {INCOTERMS.map((t) => (
                          <td
                            key={t.code}
                            className={cn(
                              "py-2.5 px-1 text-center text-[9px] text-[#5E6278] font-medium",
                              selected === t.code && "bg-[#D80E16]/[0.03]"
                            )}
                          >
                            {t.transporte === "maritimo" ? "Navio" : "Qualquer"}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Mobile: cards compactos */}
                <div className="md:hidden space-y-3">
                  {COST_LABELS.map((cost) => {
                    const Icon = cost.icon;
                    return (
                      <div key={cost.key} className="p-3 rounded-xl border border-black/[0.04]">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="w-3.5 h-3.5 text-[#D80E16]" />
                          <span className="text-xs font-bold text-[#0F111A]">{cost.label}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {INCOTERMS.map((t) => {
                            const pays = RESPONSABILIDADES[t.code][cost.key];
                            return (
                              <span
                                key={t.code}
                                className={cn(
                                  "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold",
                                  pays
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-slate-50 text-[#5E6278]",
                                  selected === t.code && "ring-1 ring-[#D80E16]"
                                )}
                              >
                                {t.code}
                                {pays ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  <div className="p-3 rounded-xl border border-black/[0.04]">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="w-3.5 h-3.5 text-[#D80E16]" />
                      <span className="text-xs font-bold text-[#0F111A]">Modalidade de Transporte</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {INCOTERMS.map((t) => (
                        <span
                          key={t.code}
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-slate-50 text-[#5E6278]",
                            selected === t.code && "ring-1 ring-[#D80E16]"
                          )}
                        >
                          {t.code} — {t.transporte === "maritimo" ? "Navio" : "Qualquer"}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ─── Painel Direito ─── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              {/* Resultado: Custo do Comprador */}
              <div className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-sm">
                <h3 className="text-sm font-bold text-[#5E6278] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#D80E16]" />
                  Custo Total do Comprador
                </h3>
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#D80E16]/[0.04] to-transparent border border-[#D80E16]/20 text-center">
                  <p className="text-3xl font-extrabold text-[#D80E16] tabular-nums">
                    {formatUSD(buyerCost)}
                  </p>
                  <p className="text-[10px] text-[#5E6278]/60 mt-1">
                    Incoterm {selected} — {incoterm.nome}
                  </p>
                </div>

                {/* Breakdown */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs gap-2">
                    <span className="text-[#5E6278] shrink-0">Valor FOB</span>
                    <span className="font-bold text-[#0F111A] tabular-nums">{formatUSD(fobValue)}</span>
                  </div>
                  {!resp["Transporte Internacional"] && freightCost > 0 && (
                    <div className="flex justify-between text-xs gap-2">
                      <span className="text-[#5E6278] shrink-0">+ Frete Int.</span>
                      <span className="font-bold text-amber-600 tabular-nums">{formatUSD(freightCost)}</span>
                    </div>
                  )}
                  {!resp["Seguro"] && insuranceCost > 0 && (
                    <div className="flex justify-between text-xs gap-2">
                      <span className="text-[#5E6278] shrink-0">+ Seguro</span>
                      <span className="font-bold text-amber-600 tabular-nums">{formatUSD(insuranceCost)}</span>
                    </div>
                  )}
                  {!resp["Carregamento"] && (
                    <div className="flex justify-between text-xs gap-2">
                      <span className="text-[#5E6278] shrink-0">+ Carregamento</span>
                      <span className="font-bold text-amber-600 tabular-nums">{formatUSD(loadingCost)}</span>
                    </div>
                  )}
                  {!resp["Desembaraco"] && (
                    <div className="flex justify-between text-xs gap-2">
                      <span className="text-[#5E6278] shrink-0">+ Desembaraco</span>
                      <span className="font-bold text-amber-600 tabular-nums">{formatUSD(customsCost)}</span>
                    </div>
                  )}
                  {!resp["Impostos_Importacao"] && (
                    <div className="flex justify-between text-xs gap-2">
                      <span className="text-[#5E6278] shrink-0">+ Impostos</span>
                      <span className="font-bold text-amber-600 tabular-nums">{formatUSD(importDutiesCost)}</span>
                    </div>
                  )}
                  {!resp["Descarga_Destino"] && (
                    <div className="flex justify-between text-xs gap-2">
                      <span className="text-[#5E6278] shrink-0">+ Descarga</span>
                      <span className="font-bold text-amber-600 tabular-nums">{formatUSD(unloadingCost)}</span>
                    </div>
                  )}
                  {otherCosts > 0 && (
                    <div className="flex justify-between text-xs gap-2">
                      <span className="text-[#5E6278] shrink-0">+ Outros</span>
                      <span className="font-bold text-amber-600 tabular-nums">{formatUSD(otherCosts)}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-black/[0.06] flex justify-between items-center">
                  <span className="text-sm font-bold text-[#0F111A]">Total Comprador</span>
                  <span className="text-lg font-extrabold text-[#D80E16] tabular-nums">{formatUSD(buyerCost)}</span>
                </div>
              </div>

              {/* Custo do Vendedor */}
              <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-sm">
                <h4 className="text-xs font-bold text-[#5E6278] uppercase tracking-wider mb-3">
                  Custo do Vendedor
                </h4>
                <p className="text-xl font-extrabold text-emerald-600 tabular-nums">
                  {formatUSD(sellerCost)}
                </p>
                <p className="text-[10px] text-[#5E6278]/60 mt-1">
                  Custos adicionais assumidos pelo vendedor no {selected}
                </p>
              </div>

              {/* Comparacao Rápida */}
              <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-sm">
                <h4 className="text-xs font-bold text-[#5E6278] uppercase tracking-wider mb-3">
                  Comparacao por Incoterm
                </h4>
                <div className="space-y-2">
                  {INCOTERMS.map((t) => {
                    const r = RESPONSABILIDADES[t.code];
                    let cost = fobValue + otherCosts;
                    if (!r["Transporte Internacional"]) cost += freightCost;
                    if (!r["Seguro"]) cost += insuranceCost;
                    if (!r["Carregamento"]) cost += loadingCost;
                    if (!r["Desembaraco"]) cost += customsCost;
                    if (!r["Impostos_Importacao"]) cost += importDutiesCost;
                    if (!r["Descarga_Destino"]) cost += unloadingCost;
                    const maxCost = fobValue + otherCosts + freightCost + insuranceCost +
                      loadingCost + customsCost + importDutiesCost + unloadingCost;
                    const widthPct = maxCost > 0 ? (cost / maxCost) * 100 : 0;
                    return (
                      <div
                        key={t.code}
                        className={cn(
                          "flex items-center gap-2 py-1 px-2 rounded-lg transition-colors",
                          selected === t.code && "bg-[#D80E16]/[0.04]"
                        )}
                      >
                        <span
                          className={cn(
                            "text-[10px] font-extrabold w-8",
                            selected === t.code ? "text-[#D80E16]" : "text-[#0F111A]"
                          )}
                        >
                          {t.code}
                        </span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${widthPct}%`,
                              backgroundColor: selected === t.code ? "#D80E16" : "#5E6278",
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-[#5E6278] tabular-nums w-16 sm:w-20 text-right shrink-0">
                          {formatUSD(cost)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Metodologia */}
              <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-sm">
                <h4 className="text-xs font-bold text-[#0F111A] mb-2 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#5E6278]" />
                  Metodologia
                </h4>
                <div className="text-[10px] text-[#5E6278] leading-relaxed space-y-1.5">
                  <p>
                    Valores de carregamento, desembaraco, impostos e descarga sao editaveis.
                    Ajuste conforme sua operacao para resultados mais precisos.
                  </p>
                  <p>
                    Incoterms 2020 (ICC). Esta calculadora oferece estimativas
                    para fins de planejamento e comparacao. Consulte um
                    especialista para operacoes reais.
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
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            Precisa de ajuda com Incoterms?
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F111A] mb-4">
            Consultoria em Comercio Exterior
          </h2>
          <p className="text-[#5E6278] mb-8 max-w-xl mx-auto">
            Nossa equipe de especialistas ajuda a definir os Incoterms ideais
            para sua operacao, negociar condicoes favoraveis e evitar custos
            inesperados.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-[#D80E16] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#b80c12] transition-colors"
          >
            Criar Conta Gratis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
