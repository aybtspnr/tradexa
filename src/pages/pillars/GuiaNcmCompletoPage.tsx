import { Link } from "react-router-dom";
import { FileText, Search, Calculator, AlertTriangle, ArrowRight, ChevronRight, BookOpen, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

const sections = [
  { id: "o-que-e", title: "O que é NCM?", icon: FileText },
  { id: "estrutura", title: "Estrutura do Código", icon: Search },
  { id: "diferencas", title: "NCM vs HS vs HTS", icon: FileText },
  { id: "classificacao", title: "Como Classificar", icon: Calculator },
  { id: "erros", title: "Erros Comuns", icon: AlertTriangle },
  { id: "dicas", title: "Dicas Práticas", icon: CheckCircle },
];

const relatedPosts = [
  { slug: "classificacao-ncm-guia-completo", title: "Classificação NCM: Guia Completo" },
  { slug: "como-saber-ncm-produto", title: "Como Descobrir o NCM do Produto" },
  { slug: "classificacao-ncm-guia-completo", title: "Comparação de Ferramentas NCM" },
  { slug: "calcular-imposto-importacao-brasil", title: "Impostos de Importação" },
];

export default function GuiaNcmCompletoPage() {
  useSeo({
    title: "Tudo sobre NCM: Classificação, Consulta e Uso | TRADEXA",
    description: "Guia completo sobre NCM (Nomenclatura Comum do Mercosul): estrutura do código, diferença para HS e HTS, como classificar produtos e erros comuns.",
    url: "https://www.tradexa.com.br/guia-ncm",
    type: "website",
    schema: { "@context": "https://schema.org", "@type": "Article", headline: "Tudo sobre NCM: Classificação, Consulta e Uso", author: { "@type": "Organization", name: "TRADEXA" }, publisher: { "@type": "Organization", name: "TRADEXA", logo: { "@type": "ImageObject", url: "https://www.tradexa.com.br/favicon-48x48.png" } }, datePublished: "2026-05-27", dateModified: "2026-05-27" },
  });

  return (
    <SiteLayout>
      <div className="min-h-screen bg-white text-slate-800">
        <section className="relative overflow-hidden bg-gradient-to-b from-[#D80E16]/5 to-white pt-24 pb-16">
          <div className="absolute inset-0 pointer-events-none"><ParticleCanvasThemed opacity={0.15} particleCount={30} color="216,14,22" connectionDist={120} /></div>
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-[#D80E16]/5 border border-[#D80E16]/20 rounded-full px-4 py-1.5 mb-6">
                <FileText className="w-4 h-4 text-[#D80E16]" /><span className="text-sm text-[#D80E16] font-medium">Pilar — NCM</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Tudo sobre <span className="text-[#D80E16]">NCM</span></h1>
              <p className="text-lg text-slate-500 max-w-2xl">Classificação, consulta e uso da Nomenclatura Comum do Mercosul. Entenda o código, diferenças para HS e HTS, e como classificar corretamente.</p>
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
              <h2 className="text-2xl font-bold mb-4">O que é NCM?</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>A Nomenclatura Comum do Mercosul (NCM) é o sistema de classificação de mercadorias adotado pelo Brasil e demais países do Mercosul. Baseado no Sistema Harmonizado (SH) da OMA, cada produto importado ou exportado precisa ser classificado em um código NCM de 8 dígitos.</p>
                <p>O código NCM é fundamental porque determina: alíquotas de impostos federais (II, IPI, PIS, COFINS), ICMS estadual, regulamentações técnicas (ANVISA, INMETRO), benefícios fiscais (drawback, ex-tarifário) e estatísticas oficiais de comércio exterior.</p>
                <p>Classificar corretamente o produto no NCM é uma das decisões mais importantes em qualquer operação de comércio exterior. Um erro de classificação pode resultar em multas de até 75% do valor dos tributos.</p>
              </div>
            </section>
            <section id="estrutura">
              <h2 className="text-2xl font-bold mb-4">Estrutura do Código NCM</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>O código NCM tem 8 dígitos, organizados em 4 níveis:</p>
                <div className="space-y-3">
                  {[
                    { code: "XX", level: "Capítulo", desc: "2 dígitos — Ex: 84 = Máquinas e aparelhos mecânicos", ex: "84" },
                    { code: "XXXX", level: "Posição", desc: "4 dígitos — Ex: 8471 = Máquinas automáticas para processamento de dados", ex: "8471" },
                    { code: "XXXXXX", level: "Subposição (SH)", desc: "6 dígitos = código SH internacional — Ex: 847130 = Máquinas portáteis ≤ 10kg", ex: "847130" },
                    { code: "XXXXXXXX", level: "Item NCM", desc: "8 dígitos = específico do Mercosul — Ex: 84713011 = Notebooks", ex: "84713011" },
                  ].map((l) => (
                    <div key={l.code} className="flex gap-4 items-start bg-white border border-slate-200 shadow-sm rounded-xl p-4">
                      <div className="font-mono text-[#D80E16] font-bold text-lg w-24 shrink-0">{l.code}</div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{l.level}</h4>
                        <p className="text-xs text-slate-500">{l.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p>Os 6 primeiros dígitos são idênticos em 200+ países que adotam o SH. Os 2 últimos são específicos do Mercosul.</p>
              </div>
            </section>
            <section id="diferencas">
              <h2 className="text-2xl font-bold mb-4">NCM vs HS vs HTS</h2>
              <div className="space-y-3">
                {[
                  { sys: "HS", full: "Harmonized System", digits: "6 dígitos", use: "Padrão internacional, tarifas OMC, estatísticas globais" },
                  { sys: "NCM", full: "Nomenclatura Comum do Mercosul", digits: "8 dígitos", use: "Brasil, Argentina, Paraguai e Uruguai — impostos e regulamentação" },
                  { sys: "HTS", full: "Harmonized Tariff Schedule", digits: "8-10 dígitos", use: "Estados Unidos — tarifas de importação americanas" },
                ].map((s) => (
                  <div key={s.sys} className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[#D80E16] font-bold text-lg">{s.sys}</span>
                      <span className="text-slate-400 text-sm">{s.full}</span>
                    </div>
                    <p className="text-sm text-slate-500"><strong className="text-slate-800 font-semibold">{s.digits}</strong> — {s.use}</p>
                  </div>
                ))}
              </div>
            </section>
            <section id="classificacao">
              <h2 className="text-2xl font-bold mb-4">Como Classificar um Produto</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>A classificação NCM segue as Regras Gerais de Interpretação (RGI) da OMA. Para classificar corretamente:</p>
                <ol className="space-y-2 ml-4 list-decimal">
                  <li><strong className="text-slate-800 font-semibold">Leia o texto da posição</strong> — a RGI 1 determina que a classificação começa pelo texto legal</li>
                  <li><strong className="text-slate-800 font-semibold">Considere Notas de Seção e Capítulo</strong> — podem incluir ou excluir produtos específicos</li>
                  <li><strong className="text-slate-800 font-semibold">Aplique as demais RGI</strong> — essência, proporção majoritária, conjunto, etc.</li>
                  <li><strong className="text-slate-800 font-semibold">Consulte o NCM oficial</strong> — disponível no portal da Receita Federal</li>
                </ol>
                <p>Para agilizar o processo, a TRADEXA oferece um classificador NCM com inteligência artificial que processa descrições em linguagem natural e sugere códigos com nível de confiança.</p>
              </div>
              <Link to="/landing/ncm-classifier" className="inline-flex items-center gap-2 mt-4 text-[#D80E16] hover:text-[#b80c12] transition-colors text-sm">
                Classificar com IA agora <ArrowRight className="w-4 h-4" />
              </Link>
            </section>
            <section id="erros">
              <h2 className="text-2xl font-bold mb-4">Erros Comuns na Classificação</h2>
              <div className="space-y-3">
                {[
                    "Descrição genérica demais — Peças para máquinas sem especificar o tipo",
                    "Confundir matéria-prima com produto acabado — fio de algodão não é camiseta",
                    "Ignorar as Regras Gerais de Interpretação (RGI)",
                    "Não considerar Notas de Seção e Capítulo — exclusões e inclusões específicas",
                    "Classificar por aparência em vez de função — smartphone não é apenas aparelho de comunicação",
                ].map((err, i) => (
                  <div key={i} className="flex gap-3 items-start bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" /><p className="text-sm text-slate-600">{err}</p>
                  </div>
                ))}
              </div>
            </section>
            <section id="dicas">
              <h2 className="text-2xl font-bold mb-4">Dicas Práticas</h2>
              <div className="space-y-3">
                {[
                  "Sempre consulte o NCM oficial antes de cada operação — códigos podem ser atualizados",
                  "Mantenha documentação da classificação — pode ser exigida em auditorias",
                  "Use IA para acelerar o processo, mas valide com profissional qualificado",
                  "Verifique se existem regimes especiais que podem reduzir impostos para seu NCM",
                  "Acompanhe alterações na tabela NCM — atualizações acontecem periodicamente",
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
            <h2 className="text-3xl font-extrabold mb-4">Classifique seu produto agora</h2>
            <p className="text-slate-500 mb-8 max-w-xl mx-auto">Use o Classificador NCM da TRADEXA com inteligência artificial para classificar em segundos.</p>
            <Link to="/landing/ncm-classifier" className="inline-flex items-center gap-2 bg-[#D80E16] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#b80c12] transition-colors">
              Classificar com IA <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
