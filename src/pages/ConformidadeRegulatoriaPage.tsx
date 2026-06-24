/**
 * Conformidade Regulatória — Guia informativo de exigências para exportação
 * Mostra requisitos por país e HS code com links para fontes atualizadas.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Globe, Search, ExternalLink, ArrowRight, Sparkles, Info,
  BadgeCheck, AlertTriangle, FileText, CheckCircle2, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

// ─── Regulatory data per country (curated, real patterns) ───
interface CountryRegulation {
  name: string;
  flag: string;
  authority: string;
  authorityUrl: string;
  tariffUrl: string;
  requirements: string[];
  certifications: { name: string; required: boolean }[];
  documents: string[];
  notes: string;
}

const regulations: Record<string, CountryRegulation> = {
  DE: {
    name: "Alemanha", flag: "🇩🇪", authority: "Zoll (Alfândega Alemã) + BAuA", authorityUrl: "https://www.zoll.de/",
    tariffUrl: "https://trade.ec.europa.eu/access-to-markets/",
    requirements: [
      "Conformidade CE (CE marking) — obrigatório para maioria dos produtos industriais",
      "REACH — registro de substâncias químicas",
      "RoHS — restrição de substâncias perigosas em eletrônicos",
      "Normas DIN / EN para especificações técnicas",
      "Rótulo em alemão com informações do importador",
    ],
    certifications: [
      { name: "CE Marking (Conformidade Europeia)", required: true },
      { name: "Certificado de Origem (EUR.1 para preferência tarifária)", required: true },
      { name: "Certificação ISO 9001 (qualidade)", required: false },
      { name: "Certificação Orgânica (EU Organic para alimentos)", required: false },
      { name: "Halal (para carnes e alimentos)", required: false },
    ],
    documents: ["Commercial Invoice", "Packing List", "Bill of Lading / AWB", "Certificate of Origin (EUR.1)", "CE Declaration of Conformity"],
    notes: "Alemanha segue regras da UE. Produtos brasileiros com acordo Mercosul-UE têm preferência tarifária com EUR.1.",
  },
  US: {
    name: "EUA", flag: "🇺🇸", authority: "CBP (Customs and Border Protection) + FDA/USDA", authorityUrl: "https://www.cbp.gov/",
    tariffUrl: "https://www.macmap.org/",
    requirements: [
      "FDA (Food and Drug Administration) — registro para alimentos, cosméticos, dispositivos médicos",
      "USDA (Departamento de Agricultura) — inspeção de carnes, lácteos e vegetais",
      "FCC (Federal Communications Commission) — para produtos eletrônicos",
      "CPSIA — segurança de produtos infantis",
      "Country of Origin marking obrigatório em inglês",
    ],
    certifications: [
      { name: "FDA Registration (alimentos/cosméticos)", required: true },
      { name: "USDA Organic (para produtos orgânicos)", required: false },
      { name: "UL Listing (para equipamentos elétricos)", required: false },
      { name: "FCC Compliance (eletrônicos)", required: true },
    ],
    documents: ["Commercial Invoice", "Packing List", "Bill of Lading / AWB", "Customs Bond", "FDA Prior Notice (alimentos)", "ISF Filing (Importer Security Filing)"],
    notes: "EUA exigem ISF (10+2) enviado 24h antes do embarque. Tarifas variam conforme acordos e podem mudar com decisões políticas.",
  },
  CN: {
    name: "China", flag: "🇨🇳", authority: "GAC (General Administration of Customs)", authorityUrl: "http://english.customs.gov.cn/",
    tariffUrl: "https://www.macmap.org/",
    requirements: [
      "Registro no sistema CIFER da GAC para exportadores de alimentos",
      "CIQ (China Inspection and Quarantine) para produtos agrícolas",
      "CCC (China Compulsory Certification) para produtos específicos",
      "Rótulo em mandarim obrigatório",
      "Restrições específicas para carnes — exigem habilitação de frigorífico",
    ],
    certifications: [
      { name: "CCC Mark (China Compulsory Certification)", required: false },
      { name: "CIQ Health Certificate (alimentos)", required: true },
      { name: "Halal (para carnes)", required: false },
    ],
    documents: ["Commercial Invoice", "Packing List", "Bill of Lading / AWB", "Certificate of Origin", "Health Certificate (para alimentos)"],
    notes: "China é o maior parceiro comercial do Brasil. Frigoríficos brasileiros precisam de habilitação prévia para exportar carnes.",
  },
  JP: {
    name: "Japão", flag: "🇯🇵", authority: "Japan Customs + MHLW (Saúde)", authorityUrl: "https://www.customs.go.jp/",
    tariffUrl: "https://www.macmap.org/",
    requirements: [
      "Food Sanitation Act — rigoroso para alimentos e bebidas",
      "JAS (Japanese Agricultural Standards) para produtos agrícolas",
      "PSE (Product Safety of Electrical Appliances) para eletrônicos",
      "Rótulo em japonês obrigatório",
      "Quotas para alguns produtos agrícolas",
    ],
    certifications: [
      { name: "JAS Organic (para orgânicos)", required: false },
      { name: "Health Certificate (MHLW)", required: true },
      { name: "Halal (para carnes — crescente)", required: false },
    ],
    documents: ["Commercial Invoice", "Packing List", "Bill of Lading / AWB", "Certificate of Origin", "Health Certificate"],
    notes: "Japão é exigente com qualidade e apresentação. Embalagem e rótulo são fundamentais para aceitação no mercado.",
  },
  AE: {
    name: "Emirados Árabes", flag: "🇦🇪", authority: "Dubai Customs + ESMA", authorityUrl: "https://www.dubaicustoms.gov.ae/",
    tariffUrl: "https://www.macmap.org/",
    requirements: [
      "Certificação Halal obrigatória para carnes e alimentos",
      "ESMA (Emirates Authority for Standardization) para produtos industriais",
      "Rótulo em árabe (pode ser adesivo sobreposto)",
      "Registro de exportador no sistema do país",
    ],
    certifications: [
      { name: "Certificação Halal (obrigatório para carnes e alimentos)", required: true },
      { name: "ESMA Certificate (produtos regulados)", required: false },
      { name: "Certificate of Origin (autenticado pela Câmara Árabe)", required: true },
    ],
    documents: ["Commercial Invoice (autenticada)", "Packing List", "Bill of Lading / AWB", "Certificate of Origin (autenticado)", "Halal Certificate"],
    notes: "Documentos precisam ser autenticados pela Câmara de Comércio Árabe-Brasileira. Certificação Halal é indispensável para alimentos.",
  },
};

// Generic fallback for other countries
const genericRegulation: CountryRegulation = {
  name: "", flag: "", authority: "Órgão aduaneiro local", authorityUrl: "https://www.wto.org/",
  tariffUrl: "https://www.macmap.org/",
  requirements: ["Verifique as exigências do país de destino com o importador", "Consulte o site oficial da alfândega do país"],
  certifications: [
    { name: "Certificate of Origin", required: true },
    { name: "Commercial Invoice", required: true },
    { name: "Certificações específicas do destino — consultar", required: false },
  ],
  documents: ["Commercial Invoice", "Packing List", "Bill of Lading / AWB", "Certificate of Origin"],
  notes: "Cada país possui exigências próprias. Consulte o importador, a câmara de comércio bilateral ou um especialista.",
};

// Country list for dropdown
const COUNTRIES = [
  { code: "DE", name: "Alemanha", eu: true },
  { code: "US", name: "EUA", eu: false },
  { code: "CN", name: "China", eu: false },
  { code: "JP", name: "Japão", eu: false },
  { code: "AE", name: "Emirados Árabes", eu: false },
  { code: "FR", name: "França", eu: true },
  { code: "IT", name: "Itália", eu: true },
  { code: "ES", name: "Espanha", eu: true },
  { code: "PT", name: "Portugal", eu: true },
  { code: "NL", name: "Países Baixos", eu: true },
  { code: "GB", name: "Reino Unido", eu: false },
  { code: "SA", name: "Arábia Saudita", eu: false },
  { code: "AR", name: "Argentina", eu: false },
  { code: "CL", name: "Chile", eu: false },
  { code: "CO", name: "Colômbia", eu: false },
  { code: "MX", name: "México", eu: false },
  { code: "KR", name: "Coreia do Sul", eu: false },
  { code: "IN", name: "Índia", eu: false },
  { code: "CA", name: "Canadá", eu: false },
];

export default function ConformidadeRegulatoriaPage() {
  const [hsCode, setHsCode] = useState("");
  const [destCountry, setDestCountry] = useState("DE");
  const [showResult, setShowResult] = useState(false);

  useSeo({
    title: "Conformidade Regulatória para Exportação | TRADEXA",
    description: "Guia de exigências sanitárias, certificados e documentos para exportar. Dados da UE, EUA, China, Japão, Emirados Árabes e mais.",
    canonical: "https://www.tradexa.com.br/ferramentas/conformidade-regulatoria",
  });

  const country = COUNTRIES.find((c) => c.code === destCountry);
  const regulation = regulations[destCountry] || { ...genericRegulation, name: country?.name || destCountry, flag: "" };

  return (
    <SiteLayout>
      <div className="sr-only">
        <h2>Conformidade Regulatória para Importação</h2>
        <p>A ferramenta de conformidade regulatória da TRADEXA é um guia completo para exportadores brasileiros que precisam entender as exigências sanitárias, certificações, documentos e tarifas de cada país de destino. Navegar pelo labirinto regulatório internacional é um dos maiores obstáculos para empresas que querem exportar: cada país possui autoridades específicas como FDA e USDA nos EUA, ANVISA e MAPA no Brasil, Zoll e BAuA na Alemanha, GAC e CIQ na China, entre outras. A ferramenta cobre os principais destinos das exportações brasileiras: Alemanha (União Europeia com marcação CE, REACH, RoHS), EUA (FDA registration, FCC compliance, CPSIA para produtos infantis), China (CIQ, CCC, rótulo em mandarim), além de Japão, Emirados Árabes, Reino Unido e Mercosul. Para cada país, você encontra a lista de requisitos obrigatórios, certificações recomendadas, documentos exigidos no despacho aduaneiro e notas específicas sobre acordos comerciais e preferências tarifárias. Também são exibidos links para as autoridades oficiais e para consulta de tarifas atualizadas. Ideal para exportadores que estão abrindo novos mercados e precisam garantir que seus produtos atendam a todas as exigências antes do embarque, evitando rejeições, multas e atrasos na alfândega do país importador.</p>
      </div>
      <section className="relative pt-28 pb-12 md:pt-36 md:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <ParticleCanvasThemed opacity={0.12} particleCount={25} color="216,14,22" connectionDist={120} />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(216,14,22,0.04),transparent)]" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="mb-4 font-bold text-[11px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-0 bg-[#D80E16]/8 text-[#D80E16]">
              Guia de Exportação
            </Badge>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#0F111A] mb-4">
              Conformidade <span className="text-[#D80E16]">Regulatória</span>
            </h1>
            <p className="text-lg text-[#5E6278] max-w-2xl mx-auto">
              Consulte exigências sanitárias, certificados, documentos e tarifas para exportar.
              Guia com dados reais das autoridades oficiais de cada país.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20 px-4 sm:px-6 lg:px-8 bg-[#FAFAF9]">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Search — apenas país */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-black/[0.06] p-6 md:p-8 shadow-sm"
          >
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[250px]">
                <label className="text-[11px] font-bold text-[#5E6278] block mb-1">País de Destino</label>
                <select value={destCountry} onChange={(e) => { setDestCountry(e.target.value); setShowResult(true); }}
                  className="w-full px-4 py-3 rounded-xl border border-black/[0.08] bg-white text-sm focus:outline-none focus:border-[#D80E16]/30 focus:ring-2 focus:ring-[#D80E16]/10">
                  {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.eu ? "🇪🇺 " : ""}{c.name}</option>)}
                </select>
              </div>
              <Button onClick={() => setShowResult(true)}
                className="gap-2 bg-[#D80E16] hover:bg-[#b80c12] text-white font-bold px-6 py-3 rounded-xl">
                <Search className="w-4 h-4" /> Consultar
              </Button>
            </div>
          </motion.div>

          {/* Results */}
          {showResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Header */}
              <div className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#D80E16]/5 flex items-center justify-center text-3xl">
                    {regulation.flag || ""}
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-[#0F111A]">Exportando para {regulation.name}</h2>
                    <p className="text-sm text-[#5E6278]">
                      Autoridade:{" "}
                      <a href={regulation.authorityUrl} target="_blank" rel="noopener noreferrer" className="text-[#D80E16] hover:underline font-bold">
                        {regulation.authority} <ExternalLink className="w-3 h-3 inline" />
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="bg-white rounded-2xl border border-black/[0.06] p-6 md:p-8 shadow-sm">
                <h3 className="text-lg font-extrabold text-[#0F111A] mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" /> Requisitos Específicos
                </h3>
                <div className="space-y-2">
                  {regulation.requirements.map((r, i) => (
                    <div key={i} className="flex gap-3 items-start bg-amber-50 border border-amber-100 rounded-xl p-3">
                      <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-[#5E6278] leading-relaxed">{r}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-white rounded-2xl border border-black/[0.06] p-6 md:p-8 shadow-sm">
                <h3 className="text-lg font-extrabold text-[#0F111A] mb-4 flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5 text-[#D80E16]" /> Certificações
                </h3>
                <div className="space-y-2">
                  {regulation.certifications.map((c, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
                      <span className="text-sm text-[#0F111A]">{c.name}</span>
                      <Badge className={c.required ? "bg-[#D80E16]/10 text-[#D80E16]" : "bg-slate-200 text-slate-500"}>
                        {c.required ? "Obrigatório" : "Recomendado"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents */}
              <div className="bg-white rounded-2xl border border-black/[0.06] p-6 md:p-8 shadow-sm">
                <h3 className="text-lg font-extrabold text-[#0F111A] mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#D80E16]" /> Documentos Necessários
                </h3>
                <div className="space-y-1.5">
                  {regulation.documents.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-[#5E6278]">
                      <CheckCircle2 className="w-4 h-4 text-[#10b981]" /> {d}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tariffs — redirect to register */}
              <div className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-sm">
                <h3 className="text-lg font-extrabold text-[#0F111A] mb-2">Tarifas e Impostos</h3>
                <p className="text-sm text-[#5E6278] mb-4">
                  Consulte alíquotas de importação, VAT e impostos aplicáveis para {regulation.name} diretamente na plataforma TRADEXA.
                </p>
                <a href="/register"
                  className="inline-flex items-center gap-2 bg-[#D80E16] hover:bg-[#b80c12] text-white font-bold px-6 py-3 rounded-xl transition-colors">
                  <Globe className="w-4 h-4" /> Cadastre-se e Consulte Alíquotas <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* Notes */}
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-blue-800 mb-1">Nota importante</p>
                  <p className="text-xs text-blue-600">{regulation.notes}</p>
                  <p className="text-xs text-blue-500 mt-2">
                    Este guia é informativo e baseado em dados públicos. Exigências podem mudar.
                    Sempre confirme com o importador e/ou despachante antes de exportar.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative rounded-2xl bg-gradient-to-br from-[#D80E16] to-[#b80c12] p-8 md:p-10 text-white overflow-hidden text-center">
            <h3 className="text-2xl font-extrabold mb-3">Precisa de ajuda com certificações?</h3>
            <p className="text-white/80 max-w-lg mx-auto mb-6">
              Nossa equipe mapeia todas as exigências regulatórias para seu produto no destino.
            </p>
            <Link to="/servicos/pesquisa-mercado-exportacao"
              className="inline-flex items-center gap-2 bg-white text-[#D80E16] hover:bg-white/90 px-8 py-4 rounded-2xl font-bold text-base shadow-xl transition-all">
              <Sparkles className="w-5 h-5" /> Pesquisa de Mercado <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </SiteLayout>
  );
}
