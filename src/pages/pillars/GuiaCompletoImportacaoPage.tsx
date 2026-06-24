import { Link } from "react-router-dom";
import { Ship, FileText, Calculator, Globe, ArrowRight, ChevronRight, BookOpen, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

const sections = [
  { id: "o-que-e", title: "O que é Importação?", icon: Globe },
  { id: "tipos", title: "Tipos de Importação", icon: FileText },
  { id: "processo", title: "Processo Passo a Passo", icon: TrendingUp },
  { id: "documentos", title: "Documentos Necessários", icon: FileText },
  { id: "impostos", title: "Impostos na Importação", icon: Calculator },
  { id: "regimes", title: "Regimes Aduaneiros", icon: Ship },
  { id: "dicas", title: "Dicas Importantes", icon: CheckCircle },
  { id: "erros", title: "Erros Comuns", icon: AlertTriangle },
];

const relatedPosts = [
  { slug: "classificacao-ncm-guia-completo", title: "Classificação NCM: Guia Completo" },
  { slug: "calculadora-imposto-importacao-2026", title: "Calculadora de Impostos de Importação" },
  { slug: "como-importar-da-china-guia-completo", title: "Como Importar da China" },
  { slug: "desembaraco-aduaneiro-como-funciona", title: "Desembaraço Aduaneiro" },
  { slug: "documentos-importacao-exportacao", title: "Documentos de Importação e Exportação" },
  { slug: "regimes-aduaneiros-especiais-recof-repetro", title: "Regimes Aduaneiros Especiais" },
  { slug: "incoterms-2026-guia-importacao-exportacao", title: "Incoterms: Guia Completo" },
  { slug: "calcular-imposto-importacao-brasil", title: "Impostos de Importação no Brasil" },
  { slug: "quanto-custa-container-maritimo", title: "Quanto Custa um Container Marítimo" },
  { slug: "remessa-conforme-importacao-2026", title: "Remessa Conforme" },
];

export default function GuiaCompletoImportacaoPage() {
  useSeo({
    title: "Guia Completo de Importação para o Brasil 2026 | TRADEXA",
    description: "Tudo sobre importação no Brasil: processo, documentos, impostos, regimes aduaneiros, dicas e erros comuns. Guia atualizado para 2026.",
    url: "https://www.tradexa.com.br/guia-importacao",
    type: "website",
    schema: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Guia Completo de Importação para o Brasil 2026",
      description: "Tudo sobre importação no Brasil: processo, documentos, impostos, regimes aduaneiros.",
      author: { "@type": "Organization", name: "TRADEXA" },
      publisher: { "@type": "Organization", name: "TRADEXA", logo: { "@type": "ImageObject", url: "https://www.tradexa.com.br/favicon-48x48.png" } },
      datePublished: "2026-05-27",
      dateModified: "2026-05-27",
    },
  });

  return (
    <SiteLayout>
      <div className="min-h-screen bg-white text-slate-800">
        <section className="relative overflow-hidden bg-gradient-to-b from-[#D80E16]/5 to-white pt-24 pb-16">
          <div className="absolute inset-0 pointer-events-none">
            <ParticleCanvasThemed opacity={0.15} particleCount={30} color="216,14,22" connectionDist={120} />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-[#D80E16]/5 border border-[#D80E16]/20 rounded-full px-4 py-1.5 mb-6">
                <BookOpen className="w-4 h-4 text-[#D80E16]" />
                <span className="text-sm text-[#D80E16] font-medium">Pilar — Importação</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                Guia Completo de <span className="text-[#D80E16]">Importação</span> para o Brasil
              </h1>
              <p className="text-lg text-slate-500 max-w-2xl">
                Tudo que você precisa saber sobre importação: processo, documentos, impostos, regimes aduaneiros e dicas práticas. Atualizado para 2026.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col lg:flex-row gap-12">
          <nav className="lg:w-64 shrink-0">
            <div className="lg:sticky lg:top-24 space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Neste guia</p>
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#D80E16] transition-colors py-1">
                  <s.icon className="w-4 h-4" />
                  {s.title}
                </a>
              ))}
            </div>
          </nav>

          <article className="flex-1 space-y-12 prose-invert max-w-none">
            <section id="o-que-e">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Globe className="w-6 h-6 text-[#D80E16]" /> O que é Importação?</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>Importação é o processo de adquirir bens ou serviços de um país estrangeiro para uso, consumo ou industrialização no território nacional. É uma atividade regulamentada pela Receita Federal e envolve pagamento de tributos, cumprimento de normas técnicas e documentação específica.</p>
                <p>O Brasil é um dos maiores importadores do mundo, com destaque para produtos de tecnologia, petróleo, automotivos e insumos industriais. Entender o processo de importação é essencial para empresas que desejam reduzir custos, acessar mercados globais e manter competitividade.</p>
                <p>A TRADEXA fornece inteligência comercial em tempo real para importadores brasileiros, permitindo análise de concorrentes, monitoramento de preços e identificação de oportunidades em mais de 60 países.</p>
              </div>
            </section>

            <section id="tipos">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><FileText className="w-6 h-6 text-[#D80E16]" /> Tipos de Importação</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p><strong className="text-slate-800 font-semibold">Para Consumo ou Uso:</strong> Mercadoria destinada ao uso final da empresa, sem processo de industrialização. Recolhe todos os tributos na importação.</p>
                <p><strong className="text-slate-800 font-semibold">Para Industrialização:</strong> Mercadoria que será processada ou transformada no Brasil. Pode utilizar regimes aduaneiros como drawback para suspensão de tributos.</p>
                <p><strong className="text-slate-800 font-semibold">Importação por Conta de Terceiros:</strong> Realizada por empresa intermediária (despachante ou trading) em nome do importador final.</p>
                <p><strong className="text-slate-800 font-semibold">Importação Temporária:</strong> Mercadoria que entra no país temporariamente, sem intenção de permanência. Usada em feiras, amostras e eventos.</p>
                <p><strong className="text-slate-800 font-semibold">Importação Simples:</strong> Encomendas postais e courier com valor até US$ 50 (isenção de II) ou até US$ 500 (alíquota reduzida de 20%).</p>
              </div>
            </section>

            <section id="processo">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-6 h-6 text-[#D80E16]" /> Processo Passo a Passo</h2>
              <div className="space-y-3">
                {[
                  { step: 1, title: "Pesquisa e Planejamento", desc: "Identifique o produto, fornecedores, mercado e viabilidade financeira. Use dados de inteligência comercial." },
                  { step: 2, title: "Classificação NCM", desc: "Determine o código NCM do produto para saber alíquotas e regulamentações. Use o Classificador NCM da TRADEXA." },
                  { step: 3, title: "Cálculo de Custos", desc: "Calcule impostos, frete, seguro, despesas aduaneiras e margem. Use a Calculadora de Importação." },
                  { step: 4, title: "Negociação com Fornecedor", desc: "Defina Incoterms, forma de pagamento, prazo e condições. Carta de crédito é recomendada para primeira compra." },
                  { step: 5, title: "Contratação do Frete", desc: "Escolha o modal (marítimo, aéreo, terrestre) e contrate o transporte. Compare cotações no Mapa de Frete Marítimo." },
                  { step: 6, title: "Documentação", desc: "Prepare nota fiscal, packing list, conhecimento de embarque, certificado de origem e demais documentos." },
                  { step: 7, title: "Registro no Siscomex", desc: "Registre a Declaração de Importação (DI) no portal Único Siscomex." },
                  { step: 8, title: "Desembaraço Aduaneiro", desc: "Apresente documentos, pague tributos e aguarde liberação da Receita Federal." },
                  { step: 9, title: "Retirada da Mercadoria", desc: "Após liberação, retire a mercadoria do recinto aduaneiro para entrega ou armazenamento." },
                ].map((s) => (
                  <div key={s.step} className="flex gap-4 items-start bg-white border border-slate-200 shadow-sm rounded-xl p-4 hover:border-[#D80E16]/40 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-[#D80E16]/5 border border-[#D80E16]/20 flex items-center justify-center text-[#D80E16] font-bold shrink-0">{s.step}</div>
                    <div>
                      <h4 className="font-bold text-slate-800">{s.title}</h4>
                      <p className="text-sm text-slate-500">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section id="documentos">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><FileText className="w-6 h-6 text-[#D80E16]" /> Documentos Necessários</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>Os documentos principais para importação incluem: Declaração de Importação (DI), Nota Fiscal de Importação, Conhecimento de Embarque, Fatura Comercial, Packing List, Certificado de Origem e demais documentos conforme o produto (Laudo Técnico, Registro ANVISA, etc).</p>
                <p>A documentação varia conforme o tipo de mercadoria, o país de origem e o regime aduaneiro utilizado. Erros documentais são a principal causa de atrasos no desembaraço.</p>
              </div>
              <Link to="/blog/documentos-importacao-exportacao" className="inline-flex items-center gap-2 mt-4 text-[#D80E16] hover:text-[#b80c12] transition-colors text-sm">
                Ver lista completa de documentos <ArrowRight className="w-4 h-4" />
              </Link>
            </section>

            <section id="impostos">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Calculator className="w-6 h-6 text-[#D80E16]" /> Impostos na Importação</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>A carga tributária na importação é composta por vários tributos federais e estaduais:</p>
                <ul className="space-y-2 ml-4">
                  <li><strong className="text-slate-800 font-semibold">II (Imposto de Importação):</strong> 0% a 35%, calculado sobre o valor aduaneiro</li>
                  <li><strong className="text-slate-800 font-semibold">IPI (Imposto sobre Produtos Industrializados):</strong> Varia por NCM, sobre valor aduaneiro + II</li>
                  <li><strong className="text-slate-800 font-semibold">PIS-Importação:</strong> 2,10% sobre o valor aduaneiro</li>
                  <li><strong className="text-slate-800 font-semibold">COFINS-Importação:</strong> 7,6% sobre o valor aduaneiro</li>
                  <li><strong className="text-slate-800 font-semibold">ICMS:</strong> 4% a 18% conforme o estado, sobre (valor aduaneiro + II + IPI + PIS + COFINS)</li>
                </ul>
                <p>A carga tributária total pode variar de 20% a mais de 100% dependendo do NCM e estado. Use a Calculadora de Importação para simular custos reais.</p>
              </div>
              <Link to="/landing/calculadora-importacao" className="inline-flex items-center gap-2 mt-4 text-[#D80E16] hover:text-[#b80c12] transition-colors text-sm">
                Calcular impostos da sua importação <ArrowRight className="w-4 h-4" />
              </Link>
            </section>

            <section id="regimes">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Ship className="w-6 h-6 text-[#D80E16]" /> Regimes Aduaneiros</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>O Brasil oferece diversos regimes aduaneiros que podem reduzir ou suspender tributos em operações específicas:</p>
                <ul className="space-y-2 ml-4">
                  <li><strong className="text-slate-800 font-semibold">Drawback:</strong> Suspensão de impostos para exportação posterior</li>
                  <li><strong className="text-slate-800 font-semibold">Drawback Setorial:</strong> Benefício para toda a cadeia produtiva</li>
                  <li><strong className="text-slate-800 font-semibold">Importação Temporária:</strong> Para uso temporário sem tributação plena</li>
                  <li><strong className="text-slate-800 font-semibold">Depósito Aduaneiro:</strong> Armazenamento com suspensão de tributos</li>
                  <li><strong className="text-slate-800 font-semibold">RECOF:</strong> Creditamento de PIS/COFINS para exportadores</li>
                  <li><strong className="text-slate-800 font-semibold">REPETRO:</strong> Para setor petrolífero</li>
                  <li><strong className="text-slate-800 font-semibold">Ex-tarifário:</strong> Redução de II para equipamentos sem similar nacional</li>
                </ul>
              </div>
              <Link to="/blog/regimes-aduaneiros-especiais-recof-repetro" className="inline-flex items-center gap-2 mt-4 text-[#D80E16] hover:text-[#b80c12] transition-colors text-sm">
                Conhecer todos os regimes <ArrowRight className="w-4 h-4" />
              </Link>
            </section>

            <section id="dicas">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><CheckCircle className="w-6 h-6 text-[#D80E16]" /> Dicas Importantes</h2>
              <div className="space-y-3">
                {[
                  "Sempre pesquise o NCM antes de fechar compra — alíquotas variam muito entre códigos similares",
                  "Contrate seguro de transporte — perdas e avarias são mais comuns do que parece",
                  "Use dados de inteligência comercial para negociar melhor com fornecedores",
                  "Considere o custo total (CIF + impostos + despesas aduaneiras), não só o preço FOB",
                  "Verifique se o produto exige licença obrigatória (LI) ou certificação (ANVISA, INMETRO)",
                  "Mantenha documentação organizada — erros documentais causam atrasos e multas",
                  "Considere o câmbio na precificação — variações cambiais afetam margem",
                ].map((tip, i) => (
                  <div key={i} className="flex gap-3 items-start bg-white border border-slate-200 shadow-sm rounded-xl p-4">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600">{tip}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="erros">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><AlertTriangle className="w-6 h-6 text-[#D80E16]" /> Erros Comuns</h2>
              <div className="space-y-3">
                {[
                  "Classificar o produto com NCM errado — gera multas de até 75% do valor dos tributos",
                  "Não considerar o ICMS estadual no cálculo de custos — pode inviabilizar o negócio",
                  "Fornecer descrição genérica na nota fiscal — causas retenção na alfândega",
                  "Não contratar despachante aduaneiro qualificado — processos complexes exigem experiência",
                  "Ignorar licenças e certificações — produtos podem ser apreendidos na aduana",
                ].map((err, i) => (
                  <div key={i} className="flex gap-3 items-start bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600">{err}</p>
                  </div>
                ))}
              </div>
            </section>
          </article>
        </div>

        <section className="max-w-4xl mx-auto px-4 pb-16">
          <h2 className="text-2xl font-bold mb-6">Artigos Relacionados</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {relatedPosts.map((p) => (
              <Link key={p.slug} to={`/blog/${p.slug}`} className="flex items-center justify-between bg-white border border-slate-200 shadow-sm rounded-xl p-4 hover:border-[#D80E16]/50 transition-colors group">
                <span className="text-sm text-slate-600 group-hover:text-white transition-colors">{p.title}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#D80E16] transition-colors" />
              </Link>
            ))}
          </div>
        </section>

        <section className="relative py-20 bg-gradient-to-b from-slate-50 to-[#D80E16]/5">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-extrabold mb-4">Pronto para importar?</h2>
            <p className="text-slate-500 mb-8 max-w-xl mx-auto">Use as ferramentas da TRADEXA para planejar sua importação com inteligência.</p>
            <Link to="/services" className="inline-flex items-center gap-2 bg-[#D80E16] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#b80c12] transition-colors">
              Explorar Ferramentas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
