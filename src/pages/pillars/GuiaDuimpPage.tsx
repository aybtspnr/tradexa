import { Link } from "react-router-dom";
import {
  FileText,
  Calendar,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  ChevronRight,
  GitCompare,
  Cpu,
  TrendingDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

const sections = [
  { id: "o-que-e", title: "O que é a DUIMP?", icon: FileText },
  { id: "antes-depois", title: "Antes e Depois: DI vs DUIMP", icon: GitCompare },
  { id: "cronograma", title: "Cronograma de Implantação", icon: Calendar },
  { id: "mudancas", title: "O que Muda com a DUIMP?", icon: RefreshCw },
  { id: "tecnologia", title: "Tecnologia e Integração", icon: Cpu },
  { id: "vantagens", title: "Vantagens para o Importador", icon: CheckCircle },
  { id: "economia", title: "Economia Estimada", icon: TrendingDown },
  { id: "como-preparar", title: "Como se Preparar — Checklist", icon: FileText },
  { id: "impactos", title: "Impactos no Dia a Dia", icon: AlertTriangle },
  { id: "perguntas", title: "Perguntas Frequentes", icon: HelpCircle },
];

const relatedPosts = [
  { slug: "classificacao-ncm-guia-completo", title: "Classificação NCM: Guia Completo" },
  { slug: "calcular-imposto-importacao-brasil", title: "Impostos de Importação no Brasil" },
];

export default function GuiaDuimpPage() {
  useSeo({
    title: "DUIMP 2026: Guia da Declaração Única de Importação",
    description: "Tudo que você precisa saber sobre a DUIMP — a Declaração Única de Importação que está transformando o comércio exterior brasileiro.",
    canonical: "https://www.tradexa.com.br/guia-duimp",
    type: "website",
    schema: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "DUIMP 2026: Guia Completo da Nova Declaração Única de Importação",
      author: { "@type": "Organization", name: "TRADEXA" },
      publisher: {
        "@type": "Organization",
        name: "TRADEXA",
        logo: { "@type": "ImageObject", url: "https://www.tradexa.com.br/favicon-48x48.png" },
      },
      datePublished: "2026-05-15",
      dateModified: "2026-05-31",
    },
  });

  return (
    <SiteLayout>
      <div className="min-h-screen bg-white text-[#0F111A]">
        {/* ──────────── Hero ──────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#D80E16]/5 to-white pt-24 pb-16">
          <div className="absolute inset-0 pointer-events-none">
            <ParticleCanvasThemed
              opacity={0.15}
              particleCount={30}
              color="216,14,22"
              connectionDist={120}
            />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-[#D80E16]/5 border border-[#D80E16]/20 rounded-full px-4 py-1.5 mb-6">
                <FileText className="w-4 h-4 text-[#D80E16]" />
                <span className="text-sm text-[#D80E16] font-medium">Pilar — Regulatório</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                DUIMP 2026:{" "}
                <span className="text-[#D80E16]">Guia Completo</span> da Nova Declaração Única
              </h1>
              <p className="text-lg text-[#5E6278] max-w-2xl">
                Tudo que você precisa saber sobre a DUIMP — a Declaração Única de Importação que está
                transformando o comércio exterior brasileiro. Entenda o antes e depois, o cronograma de
                implantação, os impactos tecnológicos e como preparar sua empresa para a transição.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ──────────── Conteúdo (sidebar + article) ──────────── */}
        <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col lg:flex-row gap-12">
          {/* ── Sidebar ── */}
          <nav className="lg:w-64 shrink-0">
            <div className="lg:sticky lg:top-24 space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Neste guia
              </p>
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="flex items-center gap-2 text-sm text-[#5E6278] hover:text-[#D80E16] transition-colors py-1"
                >
                  <s.icon className="w-4 h-4" />
                  {s.title}
                </a>
              ))}
            </div>
          </nav>

          {/* ── Article ── */}
          <article className="flex-1 space-y-12 max-w-none">
            {/* ================================================================
                 1. O que é a DUIMP?
            ================================================================ */}
            <section id="o-que-e">
              <h2 className="text-2xl font-bold mb-4">O que é a DUIMP?</h2>
              <div className="space-y-4 text-[#5E6278] leading-relaxed">
                <p>
                  A <strong className="text-[#0F111A]">DUIMP (Declaração Única de Importação)</strong> é
                  o novo sistema da Receita Federal do Brasil que unifica todos os atos administrativos
                  relacionados à importação em um único documento digital. Ela substitui a atual
                  Declaração de Importação (DI) e a Declaração Simplificada de Importação (DSI),
                  simplificando drasticamente o processo de importação.
                </p>
                <p>
                  Parte do programa{" "}
                  <strong className="text-[#0F111A]">Portal Único de Comércio Exterior</strong>, a DUIMP
                  elimina a redundância de informações ao integrar em um só registro os dados fiscais,
                  aduaneiros, administrativos e financeiros necessários para desembaraçar uma mercadoria.
                  Isso significa menos burocracia, menos retrabalho e mais agilidade.
                </p>
                <p>
                  O novo modelo segue o conceito de{" "}
                  <strong className="text-[#0F111A]">"janela única"</strong>, onde o importador preenche
                  uma única declaração que é compartilhada com todos os órgãos envolvidos — Receita
                  Federal, ANVISA, MAPA, INMETRO, entre outros — em vez de precisar apresentar documentos
                  separados para cada um.
                </p>
              </div>
            </section>

            {/* ================================================================
                 2. Antes e Depois: DI vs DUIMP
            ================================================================ */}
            <section id="antes-depois">
              <h2 className="text-2xl font-bold mb-4">Antes e Depois: DI vs DUIMP</h2>
              <p className="text-[#5E6278] leading-relaxed mb-6">
                A transição da DI/DSI para a DUIMP representa uma ruptura com décadas de burocracia no
                comércio exterior brasileiro. Veja lado a lado as principais diferenças:
              </p>

              {/* Visual comparison cards */}
              <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-stretch mb-8">
                {/* ANTES card */}
                <div className="bg-red-500/5 border-2 border-red-300/60 rounded-2xl p-6 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-red-600 font-bold text-sm">DI</span>
                    </div>
                    <span className="text-sm font-bold text-red-700 uppercase tracking-wide">
                      ANTES
                    </span>
                  </div>
                  <ul className="space-y-3 text-sm text-[#5E6278] flex-1">
                    <li className="flex gap-2">
                      <span className="text-red-400 mt-0.5">-</span>
                      <span>8 a 10 etapas burocráticas</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-400 mt-0.5">-</span>
                      <span>Múltiplos sistemas diferentes (Siscomex, DW, LPCO)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-400 mt-0.5">-</span>
                      <span>Documentos físicos e retrabalho de digitação</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-400 mt-0.5">-</span>
                      <span>Prazo médio: 5 a 10 dias úteis</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-400 mt-0.5">-</span>
                      <span>Alta taxa de erros de preenchimento</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-400 mt-0.5">-</span>
                      <span>8 formulários distintos</span>
                    </li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-red-200/60">
                    <span className="text-xs text-red-600 font-semibold">
                      5 sistemas isolados, sem integração automática
                    </span>
                  </div>
                </div>

                {/* Arrow (hidden on mobile) */}
                <div className="hidden md:flex items-center justify-center">
                  <ArrowRight className="w-8 h-8 text-[#D80E16]" />
                </div>
                <div className="flex md:hidden items-center justify-center py-2">
                  <ArrowRight className="w-6 h-6 text-[#D80E16] rotate-90" />
                </div>

                {/* DEPOIS card */}
                <div className="bg-green-500/5 border-2 border-green-400/60 rounded-2xl p-6 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 font-bold text-xs">DUIMP</span>
                    </div>
                    <span className="text-sm font-bold text-green-700 uppercase tracking-wide">
                      DEPOIS
                    </span>
                  </div>
                  <ul className="space-y-3 text-sm text-[#5E6278] flex-1">
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>3 a 4 etapas digitais integradas</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>Janela única — um só portal para todos os órgãos</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>100% digital — sem papel, sem retrabalho</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>Prazo médio: 1 a 3 dias úteis</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>Validação automática dos dados na origem</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>1 formulário unificado</span>
                    </li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-green-200/60">
                    <span className="text-xs text-green-600 font-semibold">
                      Plataforma única integrada com todos os órgãos anuentes
                    </span>
                  </div>
                </div>
              </div>

              {/* Difference summary grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Formulários", antes: "8", depois: "1", unit: "" },
                  { label: "Sistemas", antes: "5", depois: "1", unit: "" },
                  { label: "Docs. físicos", antes: "Obrig.", depois: "Elimin.", unit: "" },
                  { label: "Retrabalho", antes: "Frequente", depois: "Eliminado", unit: "" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 text-center overflow-hidden"
                  >
                    <p className="text-[11px] text-[#5E6278] mb-2 font-medium truncate">{item.label}</p>
                    <div className="flex items-center justify-center gap-1 text-xs flex-wrap">
                      <span className="text-red-500 font-bold line-through opacity-70 truncate max-w-[60px]">
                        {item.antes}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="text-green-600 font-bold truncate max-w-[60px]">{item.depois}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ================================================================
                 3. Cronograma de Implantação
            ================================================================ */}
            <section id="cronograma">
              <h2 className="text-2xl font-bold mb-4">Cronograma de Implantação</h2>
              <div className="space-y-4 text-[#5E6278] leading-relaxed">
                <p>
                  A implantação da DUIMP está sendo feita de forma gradual pela Receita Federal, em
                  parceria com os demais órgãos anuentes. Conheça as principais fases e o que esperar em
                  cada uma:
                </p>

                <div className="relative pl-6 border-l-2 border-[#D80E16]/20 space-y-6">
                  {/* Fase 1 */}
                  <div className="relative">
                    <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-[#D80E16] ring-4 ring-[#D80E16]/10" />
                    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
                      <h4 className="font-bold text-[#0F111A] text-base mb-2">
                        Fase 1 — 2024 (Piloto)
                      </h4>
                      <p className="text-sm text-[#5E6278] mb-3">
                        Início do piloto controlado para importações de baixa complexidade. Empresas
                        selecionadas pela Receita Federal testam o novo fluxo em ambiente de produção
                        assistida. Categorias de produtos contempladas nesta fase:
                      </p>
                      <ul className="space-y-1.5 text-sm text-[#5E6278]">
                        <li className="flex gap-2">
                          <span className="text-[#D80E16] mt-1">•</span>
                          <span>Produtos com licenciamento automático (LPCO de baixa complexidade)</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-[#D80E16] mt-1">•</span>
                          <span>Mercadorias isentas de anuência de órgãos como ANVISA e MAPA</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-[#D80E16] mt-1">•</span>
                          <span>Importações por conta e ordem com documentação simplificada</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Fase 2 */}
                  <div className="relative">
                    <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-[#D80E16] ring-4 ring-[#D80E16]/10" />
                    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
                      <h4 className="font-bold text-[#0F111A] text-base mb-2">
                        Fase 2 — 2025 (Expansão)
                      </h4>
                      <p className="text-sm text-[#5E6278] mb-3">
                        Ampliação gradual para novas categorias de produtos e regimes aduaneiros
                        especiais. Integração progressiva de todos os órgãos anuentes ao Portal Único.
                      </p>
                      <ul className="space-y-1.5 text-sm text-[#5E6278]">
                        <li className="flex gap-2">
                          <span className="text-[#D80E16] mt-1">•</span>
                          <span>Produtos sujeitos a anuência da ANVISA (alimentos, medicamentos)</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-[#D80E16] mt-1">•</span>
                          <span>Produtos com anuência do MAPA (insumos agropecuários)</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-[#D80E16] mt-1">•</span>
                          <span>Regimes especiais: Drawback suspensão e isenção</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-[#D80E16] mt-1">•</span>
                          <span>Integração do INMETRO e demais órgãos reguladores</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Fase 3 */}
                  <div className="relative">
                    <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-[#D80E16] ring-4 ring-[#D80E16]/10" />
                    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
                      <h4 className="font-bold text-[#0F111A] text-base mb-2">
                        Fase 3 — 2026 (Obrigatoriedade)
                      </h4>
                      <p className="text-sm text-[#5E6278] mb-3">
                        Obrigatoriedade total para todas as importações. Fim definitivo do uso da DI e
                        DSI. Todos os regimes aduaneiros contemplados.
                      </p>
                      <ul className="space-y-1.5 text-sm text-[#5E6278]">
                        <li className="flex gap-2">
                          <span className="text-[#D80E16] mt-1">•</span>
                          <span>Todas as categorias de produtos, sem exceção</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-[#D80E16] mt-1">•</span>
                          <span>Regimes RECOF, Entreposto Aduaneiro, Admissão Temporária</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-[#D80E16] mt-1">•</span>
                          <span>Descontinuação oficial dos sistemas legados (DI/DSI)</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-[#D80E16] mt-1">•</span>
                          <span>
                            Multas e sanções para quem não migrar dentro do prazo estabelecido
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ================================================================
                 4. O que Muda com a DUIMP?
            ================================================================ */}
            <section id="mudancas">
              <h2 className="text-2xl font-bold mb-4">O que Muda com a DUIMP?</h2>
              <div className="space-y-4 text-[#5E6278] leading-relaxed">
                <p>
                  A DUIMP representa uma mudança de paradigma na forma como as importações são processadas
                  no Brasil. As principais mudanças incluem:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    {
                      title: "Documento único",
                      desc: "Uma única declaração digital substitui múltiplos formulários e documentos físicos.",
                    },
                    {
                      title: "Integração total",
                      desc: "Todos os órgãos anuentes conectados em uma única plataforma.",
                    },
                    {
                      title: "Dados inteligentes",
                      desc: "Aproveitamento automático de informações já prestadas em operações anteriores.",
                    },
                    {
                      title: "Menos retrabalho",
                      desc: "Fim da digitação repetida de informações em diferentes sistemas.",
                    },
                    {
                      title: "Processo digital",
                      desc: "Todo o fluxo, da habilitação ao desembaraço, é 100% digital.",
                    },
                    {
                      title: "Análise de risco",
                      desc: "Sistema classifica automaticamente o risco da operação para priorizar fiscalização.",
                    },
                  ].map((m) => (
                    <div
                      key={m.title}
                      className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 hover:border-[#D80E16]/30 transition-colors"
                    >
                      <h4 className="font-bold text-[#0F111A] text-sm mb-1">{m.title}</h4>
                      <p className="text-xs text-[#5E6278]">{m.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ================================================================
                 5. Tecnologia e Integração (NEW)
            ================================================================ */}
            <section id="tecnologia">
              <h2 className="text-2xl font-bold mb-4">Tecnologia e Integração</h2>
              <div className="space-y-4 text-[#5E6278] leading-relaxed">
                <p>
                  A DUIMP é sustentada por uma arquitetura tecnológica moderna, desenvolvida no âmbito do
                  Portal Único de Comércio Exterior (Siscomex). Entenda os principais componentes técnicos
                  e como eles impactam a integração com os sistemas da sua empresa:
                </p>

                <div className="space-y-4">
                  {[
                    {
                      title: "Portal Único Siscomex",
                      desc: "Plataforma centralizada que unifica o acesso a todos os serviços de comércio exterior. Substitui os múltiplos sistemas legados (Siscomex Web, DW, LPCO) por uma interface única baseada em nuvem com alta disponibilidade 24/7.",
                    },
                    {
                      title: "API REST para Integração com ERPs",
                      desc: "O novo Portal Único disponibiliza APIs RESTful documentadas que permitem integração direta com sistemas ERP (SAP, Oracle, TOTVS, etc.). Isso possibilita a transmissão automática de declarações, consulta de status em tempo real e recebimento de notificações de eventos do processo aduaneiro.",
                    },
                    {
                      title: "Web Services Disponíveis",
                      desc: "SOAP e REST com autenticação via certificado digital. Principais serviços: submissão de DUIMP, consulta de situação aduaneira, download de despacho, consulta de canais de parametrização (verde, amarelo, vermelho, cinza) e integração com sistemas de LPCO dos órgãos anuentes.",
                    },
                    {
                      title: "Certificação Digital ICP-Brasil",
                      desc: "O acesso ao Portal Único e à DUIMP exige certificação digital padrão ICP-Brasil (e-CNPJ A1 ou A3 para pessoa jurídica, e-CPF para pessoa física). O certificado é utilizado tanto para autenticação no portal quanto para assinatura digital das declarações com validade jurídica.",
                    },
                    {
                      title: "Mensageria e Notificações",
                      desc: "O sistema conta com um módulo de mensageria assíncrona que notifica o importador sobre cada evento relevante do processo: registro da declaração, parametrização, exigência fiscal, desembaraço e entrega da mercadoria. Notificações podem ser integradas via webhook ao ERP.",
                    },
                    {
                      title: "Acesso por Procuração Digital",
                      desc: "A plataforma suporta procuração digital (e-Procuração), permitindo que despachantes aduaneiros e escritórios de comércio exterior acessem o sistema em nome do importador. O modelo mantém total rastreabilidade das ações realizadas por cada usuário.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="bg-white border border-slate-200 shadow-sm rounded-xl p-5"
                    >
                      <h4 className="font-bold text-[#0F111A] text-sm mb-2 flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-[#D80E16]" />
                        {item.title}
                      </h4>
                      <p className="text-sm text-[#5E6278] leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ================================================================
                 6. Vantagens para o Importador
            ================================================================ */}
            <section id="vantagens">
              <h2 className="text-2xl font-bold mb-4">Vantagens para o Importador</h2>
              <div className="space-y-4 text-[#5E6278] leading-relaxed">
                <p>
                  Com a DUIMP, o importador brasileiro ganha em eficiência, previsibilidade e redução de
                  custos operacionais:
                </p>
                <div className="space-y-3">
                  {[
                    "Redução do tempo de desembaraço — estimativa de 5 para 2 dias úteis em operações de baixo risco",
                    "Diminuição de custos administrativos com eliminação de retrabalho e documentos físicos",
                    "Maior previsibilidade com regras claras e fluxo padronizado para todos os órgãos",
                    "Menos erros de preenchimento com validação automática dos dados na origem",
                    "Transparência total — acompanhamento em tempo real do status da declaração",
                    "Possibilidade de auditoria prévia (compliance) antes do fechamento da declaração",
                  ].map((v, i) => (
                    <div
                      key={i}
                      className="flex gap-3 items-start bg-green-500/5 border border-green-500/10 rounded-xl p-4"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-[#5E6278]">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ================================================================
                 7. Economia Estimada (NEW)
            ================================================================ */}
            <section id="economia">
              <h2 className="text-2xl font-bold mb-4">Economia Estimada</h2>
              <div className="space-y-4 text-[#5E6278] leading-relaxed">
                <p>
                  A transição para a DUIMP não é apenas uma modernização burocrática — ela gera economia
                  real e mensurável para as empresas importadoras. Com base em estimativas da Receita
                  Federal e projeções do setor, os ganhos esperados são significativos:
                </p>

                {/* Stat cards */}
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    {
                      value: "60-70%",
                      label: "Redução no tempo de desembaraço",
                      detail: "De 5-10 dias para 1-3 dias úteis em média",
                      color: "text-[#D80E16]",
                    },
                    {
                      value: "R$ 200-500",
                      label: "Economia por declaração",
                      detail: "Redução em mão de obra, armazenagem e despachante",
                      color: "text-green-600",
                    },
                    {
                      value: "40%",
                      label: "Redução de erros de preenchimento",
                      detail: "Validação automática elimina inconsistências na origem",
                      color: "text-blue-600",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 text-center"
                    >
                      <p className={`text-3xl font-extrabold ${stat.color} mb-1`}>{stat.value}</p>
                      <p className="text-sm font-bold text-[#0F111A] mb-1">{stat.label}</p>
                      <p className="text-xs text-[#5E6278]">{stat.detail}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-[#D80E16]/5 border border-[#D80E16]/10 rounded-xl p-5 text-sm text-[#5E6278] leading-relaxed">
                  <p className="font-bold text-[#0F111A] mb-1">Projeção de impacto anual</p>
                  <p>
                    Para uma empresa que realiza 100 importações por ano, a economia estimada pode chegar
                    a <strong className="text-[#0F111A]">R$ 20.000 a R$ 50.000 anuais</strong> apenas com
                    a redução de custos administrativos diretos. Quando somados os ganhos indiretos com
                    menor tempo de armazenagem, redução de multas por erros e maior previsibilidade
                    logística, o impacto financeiro pode ser ainda mais expressivo.
                  </p>
                </div>
              </div>
            </section>

            {/* ================================================================
                 8. Como se Preparar — Checklist
            ================================================================ */}
            <section id="como-preparar">
              <h2 className="text-2xl font-bold mb-4">Como se Preparar — Checklist</h2>
              <div className="space-y-4 text-[#5E6278] leading-relaxed">
                <p>
                  Para garantir uma transição tranquila para a DUIMP, sua empresa deve se preparar com
                  antecedência. Siga este checklist de 8 passos essenciais:
                </p>
                <ol className="space-y-3 ml-4 list-decimal">
                  {[
                    "Mapeie todos os processos de importação atuais e identifique pontos de melhoria — documente cada etapa do fluxo atual de DI/DSI",
                    "Verifique se seus sistemas (ERP, WMS, CRM) são compatíveis com a nova plataforma e com as APIs REST do Portal Único",
                    "Treine a equipe de comércio exterior no novo fluxo da DUIMP — considere programas de capacitação oferecidos pela Receita Federal",
                    "Revise a classificação fiscal (NCM) de todos os produtos importados — erros de classificação são a principal causa de retenção",
                    "Organize a documentação digital de todas as operações anteriores — o novo sistema exige histórico acessível",
                    "Avalie a necessidade de adequação de regimes aduaneiros especiais (Drawback, RECOF, etc.) — verifique os cronogramas específicos",
                    "Participe dos pilotos e testes da DUIMP quando disponíveis — a experiência prática é crucial para identificar gargalos internos",
                    "Consulte um despachante aduaneiro ou consultoria especializada para validação do plano de migração",
                  ].map((item, i) => (
                    <li key={i} className="text-[#5E6278]">
                      <strong className="text-[#0F111A] font-semibold">
                        {item.split(" — ")[0]}
                      </strong>
                      {item.includes(" — ") && (
                        <span> — {item.split(" — ").slice(1).join(" — ")}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            {/* ================================================================
                 9. Impactos no Dia a Dia
            ================================================================ */}
            <section id="impactos">
              <h2 className="text-2xl font-bold mb-4">Impactos no Dia a Dia</h2>
              <div className="space-y-4 text-[#5E6278] leading-relaxed">
                <p>
                  Veja como a DUIMP afeta as atividades diárias de cada profissional envolvido no
                  comércio exterior:
                </p>
                <div className="space-y-3">
                  {[
                    {
                      area: "Despachantes Aduaneiros",
                      impact:
                        "Precisarão se adaptar ao novo sistema digital e à diminuição de intervenções manuais. O papel do despachante evolui de 'digitador' para 'consultor estratégico', com foco em conformidade e otimização tributária.",
                    },
                    {
                      area: "Analistas de Importação",
                      impact:
                        "Menos digitação, mais foco em análise de conformidade e otimização de custos. O trabalho deixa de ser operacional e passa a ser analítico, com maior valor agregado para a empresa.",
                    },
                    {
                      area: "Gestores de Logística",
                      impact:
                        "Maior previsibilidade no lead time de importação e redução de custos com armazenagem. O planejamento logístico ganha precisão com prazos de desembaraço mais curtos e previsíveis.",
                    },
                    {
                      area: "Compliance",
                      impact:
                        "Ferramentas de auditoria prévia permitem validar operações antes do registro oficial. A conformidade deixa de ser reativa e passa a ser preventiva, reduzindo significativamente o risco de multas.",
                    },
                    {
                      area: "TI / Sistemas",
                      impact:
                        "Necessidade de integrar sistemas internos com a API do Portal Único. Demanda por desenvolvedores com conhecimento em integração via certificado digital e web services governamentais.",
                    },
                    {
                      area: "Financeiro / Tesouraria",
                      impact:
                        "Maior previsibilidade no fluxo de caixa com prazos de nacionalização mais curtos. Redução de custos com armazenagem portuária e multas por atraso de documentação.",
                    },
                  ].map((imp) => (
                    <div
                      key={imp.area}
                      className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 hover:border-[#D80E16]/30 transition-colors"
                    >
                      <h4 className="font-bold text-[#0F111A] text-sm mb-1">{imp.area}</h4>
                      <p className="text-xs text-[#5E6278]">{imp.impact}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ================================================================
                 10. Perguntas Frequentes
            ================================================================ */}
            <section id="perguntas">
              <h2 className="text-2xl font-bold mb-4">Perguntas Frequentes</h2>
              <div className="space-y-3">
                {[
                  {
                    q: "1. A DUIMP substitui completamente a DI e a DSI?",
                    a: "Sim. A partir da obrigatoriedade total (prevista para 2026), a DUIMP substitui integralmente a Declaração de Importação (DI) e a Declaração Simplificada de Importação (DSI). Os sistemas legados serão descontinuados e não será mais possível registrar importações por meio deles.",
                  },
                  {
                    q: "2. Preciso de certificação digital para usar a DUIMP?",
                    a: "Sim. O acesso ao Portal Único e à DUIMP exige certificação digital padrão ICP-Brasil (e-CNPJ A1 ou A3 para pessoa jurídica, e-CPF para pessoa física). O certificado é utilizado tanto para autenticação quanto para assinatura digital das declarações.",
                  },
                  {
                    q: "3. A DUIMP afeta regimes especiais como Drawback e RECOF?",
                    a: "Sim. Os regimes especiais serão gradualmente integrados ao novo sistema. O Drawback (suspensão e isenção) está previsto para a Fase 2 de implantação (2025), enquanto o RECOF e demais regimes serão contemplados na Fase 3 (2026). Consulte o cronograma oficial da Receita Federal para confirmar datas específicas.",
                  },
                  {
                    q: "4. Posso usar a DUIMP antes da obrigatoriedade?",
                    a: "Sim. Empresas podem aderir voluntariamente à DUIMP durante as fases de piloto e expansão, desde que atendam aos requisitos estabelecidos pela Receita Federal. A adesão antecipada é recomendada para quem deseja testar o sistema e treinar a equipe antes da obrigatoriedade.",
                  },
                  {
                    q: "5. O que acontece se eu não migrar a tempo?",
                    a: "Após a data de obrigatoriedade, não será mais possível registrar importações via DI ou DSI. A empresa ficará impedida de importar até se adequar ao novo sistema, o que pode gerar perdas financeiras significativas, ruptura de estoque e multas contratuais com fornecedores.",
                  },
                  {
                    q: "6. Como fica o papel do despachante aduaneiro com a DUIMP?",
                    a: "O despachante aduaneiro continua sendo essencial, mas seu papel evolui. Em vez de atuar como digitador de informações em múltiplos sistemas, o despachante passa a ser um consultor estratégico focado em classificação fiscal, conformidade regulatória, planejamento tributário e resolução de exigências fiscais. A procuração digital (e-Procuração) mantém o acesso formal do despachante ao sistema em nome do importador.",
                  },
                  {
                    q: "7. Precisa de treinamento específico para a DUIMP?",
                    a: "Sim. Embora o sistema seja mais intuitivo que os anteriores, recomenda-se treinamento específico para a equipe de comércio exterior. A Receita Federal oferece manuais, webinars e ambiente de testes (sandbox). Consultorias especializadas também oferecem programas de capacitação focados na transição.",
                  },
                  {
                    q: "8. A DUIMP integra com sistemas ERP da minha empresa?",
                    a: "Sim. O Portal Único disponibiliza APIs RESTful documentadas que permitem integração direta com os principais ERPs do mercado (SAP, Oracle, TOTVS, etc.). É possível transmitir declarações automaticamente, consultar status em tempo real e receber notificações via webhook. A integração reduz erros de digitação e acelera o fluxo operacional.",
                  },
                  {
                    q: "9. A DUIMP vale para exportação também?",
                    a: "Não. A DUIMP (Declaração Única de Importação) é exclusiva para operações de importação. Para exportações, o Brasil utiliza a DU-E (Declaração Única de Exportação), que já está em operação desde 2018 e segue um modelo semelhante de janela única. Ambos os sistemas fazem parte do Portal Único de Comércio Exterior.",
                  },
                  {
                    q: "10. Qual o custo para migrar para a DUIMP?",
                    a: "O uso do sistema DUIMP em si é gratuito (portal governamental). No entanto, existem custos indiretos que devem ser considerados: certificação digital (aproximadamente R$ 200-500/ano para e-CNPJ A1), adequação de sistemas internos (integração com API pode demandar desenvolvimento de TI) e treinamento da equipe (cursos e consultorias). O investimento, porém, é amplamente compensado pela economia operacional gerada a partir da migração.",
                  },
                ].map((faq, i) => (
                  <details
                    key={i}
                    className="group bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden"
                  >
                    <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-bold text-[#0F111A] hover:text-[#D80E16] transition-colors [&::-webkit-details-marker]:hidden">
                      {faq.q}
                      <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform shrink-0" />
                    </summary>
                    <div className="px-4 pb-4 text-sm text-[#5E6278] leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          </article>
        </div>

        {/* ──────────── Artigos Relacionados ──────────── */}
        <section className="max-w-4xl mx-auto px-4 pb-16">
          <h2 className="text-2xl font-bold mb-6">Artigos Relacionados</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {relatedPosts.map((p) => (
              <Link
                key={p.slug}
                to={`/blog/${p.slug}`}
                className="flex items-center justify-between bg-white border border-slate-200 shadow-sm rounded-xl p-4 hover:border-[#D80E16]/50 transition-colors group"
              >
                <span className="text-sm text-[#5E6278] group-hover:text-[#D80E16] transition-colors">
                  {p.title}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#D80E16] transition-colors" />
              </Link>
            ))}
          </div>
        </section>

        {/* ──────────── CTA ──────────── */}
        <section className="relative py-20 bg-gradient-to-b from-slate-50 to-[#D80E16]/5">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-extrabold mb-4">
              Precisa de ajuda com a transição para DUIMP?
            </h2>
            <p className="text-[#5E6278] mb-8 max-w-xl mx-auto">
              Nossa equipe oferece auditoria de classificação fiscal e inteligência de mercado para apoiar
              sua empresa na migração para a nova declaração única.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/servicos/auditoria-classificacao-fiscal"
                className="inline-flex items-center gap-2 bg-[#D80E16] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#b80c12] transition-colors"
              >
                Auditoria de NCM <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contato"
                className="inline-flex items-center gap-2 bg-white text-[#D80E16] border border-[#D80E16]/20 font-bold px-8 py-4 rounded-xl hover:bg-[#D80E16]/5 transition-colors"
              >
                Falar com Especialista <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
