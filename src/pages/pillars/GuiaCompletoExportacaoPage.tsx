import { Link } from "react-router-dom";
import { Globe, FileText, TrendingUp, ArrowRight, ChevronRight, BookOpen, CheckCircle, BarChart3, Award } from "lucide-react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

const sections = [
  { id: "o-que-e", title: "O que é Exportação?", icon: Globe },
  { id: "tipos", title: "Tipos de Exportação", icon: FileText },
  { id: "processo", title: "Processo Passo a Passo", icon: TrendingUp },
  { id: "incentivos", title: "Incentivos Fiscais", icon: Award },
  { id: "mercados", title: "Principais Mercados", icon: BarChart3 },
  { id: "dicas", title: "Dicas para Exportar", icon: CheckCircle },
];

const relatedPosts = [
  { slug: "como-fazer-exportacao-passo-a-passo", title: "Como Fazer Exportação Passo a Passo" },
  { slug: "principais-produtos-exportados-brasil-2026", title: "Principais Produtos Exportados" },
  { slug: "drawback-regime-aduaneiro-exportacao", title: "Drawback na Exportação" },
  { slug: "balanca-comercial-brasileira-2026", title: "Balança Comercial" },
];

export default function GuiaCompletoExportacaoPage() {
  useSeo({
    title: "Guia Completo de Exportação do Brasil 2026 | TRADEXA",
    description: "Tudo sobre exportação brasileira: processo, documentos, incentivos fiscais, mercados e dicas práticas. Guia atualizado para 2026.",
    url: "https://www.tradexa.com.br/guia-exportacao",
    type: "website",
    schema: { "@context": "https://schema.org", "@type": "Article", headline: "Guia Completo de Exportação do Brasil 2026", author: { "@type": "Organization", name: "TRADEXA" }, publisher: { "@type": "Organization", name: "TRADEXA", logo: { "@type": "ImageObject", url: "https://www.tradexa.com.br/favicon-48x48.png" } }, datePublished: "2026-05-27", dateModified: "2026-05-27" },
  });

  return (
    <SiteLayout>
      <div className="min-h-screen bg-white text-slate-800">
        <section className="relative overflow-hidden bg-gradient-to-b from-[#D80E16]/5 to-white pt-24 pb-16">
          <div className="absolute inset-0 pointer-events-none"><ParticleCanvasThemed opacity={0.15} particleCount={30} color="216,14,22" connectionDist={120} /></div>
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-[#D80E16]/5 border border-[#D80E16]/20 rounded-full px-4 py-1.5 mb-6">
                <BookOpen className="w-4 h-4 text-[#D80E16]" /><span className="text-sm text-[#D80E16] font-medium">Pilar — Exportação</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Guia Completo de <span className="text-[#D80E16]">Exportação</span> do Brasil</h1>
              <p className="text-lg text-slate-500 max-w-2xl">Tudo sobre exportação brasileira: processo, documentos, incentivos fiscais, mercados e dicas para expandir seus negócios internacionais.</p>
            </motion.div>
          </div>
        </section>
        <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col lg:flex-row gap-12">
          <nav className="lg:w-64 shrink-0">
            <div className="lg:sticky lg:top-24 space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Neste guia</p>
              {sections.map((s) => (<a key={s.id} href={`#${s.id}`} className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#D80E16] transition-colors py-1"><s.icon className="w-4 h-4" />{s.title}</a>))}
            </div>
          </nav>
          <article className="flex-1 space-y-12 max-w-none">
            <section id="o-que-e">
              <h2 className="text-2xl font-bold mb-4">O que é Exportação?</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>Exportação é a comercialização de bens e serviços produzidos no Brasil para mercados internacionais. É uma das principais fontes de divisas estrangeiras do país e um motor de crescimento econômico.</p>
                <p>O Brasil é o maior exportador da América Latina e um dos top 20 do mundo, com destaque para soja, petróleo, minério de ferro, celulose, carnes e produtos manufaturados. A exportação brasileira movimenta mais de US$ 300 bilhões anuais.</p>
                <p>Entender o processo exportador é essencial para empresas que buscam diversificar mercados, aumentar receita e reduzir dependência do mercado interno.</p>
              </div>
            </section>
            <section id="tipos">
              <h2 className="text-2xl font-bold mb-4">Tipos de Exportação</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p><strong className="text-slate-800 font-semibold">Exportação Direta:</strong> O produtor exporta diretamente para o comprador estrangeiro, sem intermediários. Maior controle sobre preço e relacionamento.</p>
                <p><strong className="text-slate-800 font-semibold">Exportação Indireta:</strong> O produto é vendido a um intermediário no Brasil (trading company, distribuidor) que realiza a exportação. Comum para pequenas empresas.</p>
                <p><strong className="text-slate-800 font-semibold">Exportação por Conta Própria:</strong> A empresa exporta em seu próprio nome, assumindo todos os riscos e custos da operação.</p>
                <p><strong className="text-slate-800 font-semibold">Exportação por Conta de Terceiros:</strong> Uma empresa atua como mandatária, exportando em nome de outra empresa (exportador declarante).</p>
              </div>
            </section>
            <section id="processo">
              <h2 className="text-2xl font-bold mb-4">Processo Passo a Passo</h2>
              <div className="space-y-3">
                {[
                  { step: 1, title: "Pesquisa de Mercado", desc: "Identifique mercados-alvo, concorrentes, regulamentações e demanda. Use inteligência comercial para fundamentar decisões." },
                  { step: 2, title: "Classificação NCM do Produto", desc: "Determine o código NCM para saber alíquotas, exigências e acordos comerciais aplicáveis." },
                  { step: 3, title: "Cotação e Negociação", desc: "Elabore proposta comercial com Incoterms, preço, prazo de entrega e condições de pagamento." },
                  { step: 4, title: "Contrato de Exportação", desc: "Formalize os termos da venda em contrato, incluindo cláusulas de garantia, arbitragem e force majeure." },
                  { step: 5, title: "Registro da Declaração Única de Exportação (DU-E)", desc: "Registre no portal Único Siscomex. O DU-E substituiu a antiga Declaração de Exportação (DE)." },
                  { step: 6, title: "Despacho Aduaneiro", desc: "Apresente a mercadoria na aduana com documentação completa. A Receita Federal pode realizar inspeção física." },
                  { step: 7, title: "Embarque e Documentação", desc: "Conhecimento de embarque, fatura comercial, packing list e certificado de origem. Envie documentos ao comprador." },
                  { step: 8, title: "Câmbio e Recebimento", desc: "Converta a moeda estrangeira em reais. O prazo para registro da operação cambial é de 750 dias." },
                ].map((s) => (
                  <div key={s.step} className="flex gap-4 items-start bg-white border border-slate-200 shadow-sm rounded-xl p-4 hover:border-[#D80E16]/40 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-[#D80E16]/5 border border-[#D80E16]/20 flex items-center justify-center text-[#D80E16] font-bold shrink-0">{s.step}</div>
                    <div><h4 className="font-bold text-slate-800">{s.title}</h4><p className="text-sm text-slate-500">{s.desc}</p></div>
                  </div>
                ))}
              </div>
            </section>
            <section id="incentivos">
              <h2 className="text-2xl font-bold mb-4">Incentivos Fiscais à Exportação</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>O Brasil oferece diversos incentivos para estimular a exportação:</p>
                <ul className="space-y-2 ml-4">
                  <li><strong className="text-slate-800 font-semibold">Drawback:</strong> Suspensão/isenção de impostos na importação de insumos para exportação</li>
                  <li><strong className="text-slate-800 font-semibold">RECOF-Exportação:</strong> Creditamento de PIS/COFINS para exportadores</li>
                  <li><strong className="text-slate-800 font-semibold">RESEX:</strong> Regime especial para micro e pequenas empresas</li>
                  <li><strong className="text-slate-800 font-semibold">Zona Franca de Manaus:</strong> Incentivos para empresas que exportam a partir de Manaus</li>
                  <li><strong className="text-slate-800 font-semibold">FINEX:</strong> Financiamento à exportação com recursos do Tesouro Nacional</li>
                  <li><strong className="text-slate-800 font-semibold">Pró-Exportador:</strong> Isenção de IOF em operações de câmbio para exportadores</li>
                </ul>
              </div>
              <Link to="/blog/drawback-regime-aduaneiro-exportacao" className="inline-flex items-center gap-2 mt-4 text-[#D80E16] hover:text-[#b80c12] transition-colors text-sm">
                Saiba mais sobre drawback <ArrowRight className="w-4 h-4" />
              </Link>
            </section>
            <section id="mercados">
              <h2 className="text-2xl font-bold mb-4">Principais Mercados para Exportação Brasileira</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>Os principais parceiros comerciais do Brasil em exportação incluem: China (maior parceiro), Estados Unidos, Argentina, Alemanha, Japão, Coreia do Sul, México, Índia e Chile.</p>
                <p>Os blocos comerciais Mercosul, ACE-14 (com a União Europeia) e ACE-35 (com o Mercosul e Singapura) oferecem preferências tarifárias que facilitam o acesso a esses mercados.</p>
                <p>A TRADEXA permite analisar a balança comercial do Brasil com qualquer país, identificando oportunidades de exportação baseadas em dados reais de importação dos parceiros comerciais.</p>
              </div>
            </section>
            <section id="dicas">
              <h2 className="text-2xl font-bold mb-4">Dicas para Exportar com Sucesso</h2>
              <div className="space-y-3">
                {[
                  "Use dados de inteligência comercial para identificar os melhores mercados para seu produto",
                  "Comece com mercados de língua espanhola — barreira cultural menor e acordo Mercosul",
                  "Considere o custo total de exportação (frete, seguro, documentação) ao precificar",
                  "Invista em certificações internacionais (ISO, HACCP, Kosher) para acessar mercados regulados",
                  "Mantenha relacionamento próximo com despachante aduaneiro e agente de carga",
                  "Documente tudo — transparência evita disputas e fortalece confiança com compradores",
                ].map((tip, i) => (
                  <div key={i} className="flex gap-3 items-start bg-white border border-slate-200 shadow-sm rounded-xl p-4">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /><p className="text-sm text-slate-600">{tip}</p>
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
            <h2 className="text-3xl font-extrabold mb-4">Pronto para exportar?</h2>
            <p className="text-slate-500 mb-8 max-w-xl mx-auto">Use o Smart Rank da TRADEXA para identificar os melhores mercados para seu produto.</p>
            <Link to="/intelligence" className="inline-flex items-center gap-2 bg-[#D80E16] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#b80c12] transition-colors">
              Explorar Inteligência <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
