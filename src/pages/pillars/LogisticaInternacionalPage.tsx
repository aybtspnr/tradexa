import { Link } from "react-router-dom";
import { Ship, Plane, Truck, MapPin, ArrowRight, ChevronRight, BookOpen, CheckCircle, Anchor, Package } from "lucide-react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

const sections = [
  { id: "fretes", title: "Tipos de Frete", icon: Ship },
  { id: "portos", title: "Principais Portos", icon: MapPin },
  { id: "containeres", title: "Containeres", icon: Package },
  { id: "seguros", title: "Seguro de Carga", icon: Anchor },
  { id: "wci", title: "WCI e Mercado", icon: Ship },
  { id: "dicas", title: "Dicas de Logística", icon: CheckCircle },
];

const relatedPosts = [
  { slug: "frete-maritimo-como-funciona", title: "Frete Marítimo: Como Funciona" },
  { slug: "frete-aereo-vs-maritimo", title: "Frete Aéreo vs Marítimo" },
  { slug: "quanto-custa-container-maritimo", title: "Quanto Custa um Container" },
  { slug: "portos-brasil-infraestrutura-logistica", title: "Principais Portos do Brasil" },
  { slug: "cotacao-frete-internacional", title: "Cotação de Frete Marítimo" },
  { slug: "seguro-internacional-carga-importacao-exportacao", title: "Seguro de Carga" },
];

export default function LogisticaInternacionalPage() {
  useSeo({
    title: "Logística Internacional: Frete, Portos e Transporte",
    description: "Guia completo de logística internacional: frete marítimo, aéreo, terrestre, principais portos brasileiros, containeres, seguros e o mercado WCI.",
    url: "https://www.tradexa.com.br/logistica-internacional",
    type: "website",
    schema: { "@context": "https://schema.org", "@type": "Article", headline: "Logística Internacional para Comércio Exterior", author: { "@type": "Organization", name: "TRADEXA" }, publisher: { "@type": "Organization", name: "TRADEXA", logo: { "@type": "ImageObject", url: "https://www.tradexa.com.br/favicon-48x48.png" } }, datePublished: "2026-05-27", dateModified: "2026-05-27" },
  });

  return (
    <SiteLayout>
      <div className="min-h-screen bg-white text-slate-800">
        <section className="relative overflow-hidden bg-gradient-to-b from-[#D80E16]/5 to-white pt-24 pb-16">
          <div className="absolute inset-0 pointer-events-none"><ParticleCanvasThemed opacity={0.15} particleCount={30} color="216,14,22" connectionDist={120} /></div>
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-[#D80E16]/5 border border-[#D80E16]/20 rounded-full px-4 py-1.5 mb-6">
                <Ship className="w-4 h-4 text-[#D80E16]" /><span className="text-sm text-[#D80E16] font-medium">Pilar — Logística</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Logística <span className="text-[#D80E16]">Internacional</span></h1>
              <p className="text-lg text-slate-500 max-w-2xl">Frete marítimo, aéreo, terrestre, portos, containeres e seguro. Guia completo para otimizar sua cadeia de suprimentos.</p>
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
            <section id="fretes">
              <h2 className="text-2xl font-bold mb-4">Tipos de Frete</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p><strong className="text-slate-800 font-semibold">Frete Marítimo:</strong> O mais utilizado para comércio exterior, responsável por 80% do volume global. Econômico para grandes volumes, mas com prazos mais longos (15-45 dias entre Brasil e Ásia).</p>
                <p><strong className="text-slate-800 font-semibold">Frete Aéreo:</strong> Rápido (3-7 dias), ideal para produtos de alto valor ou urgência. Custo 5-10x maior que o marítimo. Peso volumétrico é fator decisivo.</p>
                <p><strong className="text-slate-800 font-semibold">Frete Rodoviário:</strong> Usado em transporte terrestre, especialmente para mercosul e fronteiras. Flexibilidade de door-to-door.</p>
                <p><strong className="text-slate-800 font-semibold">Frete Ferroviário:</strong> Custo competitivo para cargas pesadas em longas distâncias. Crescimento no Brasil com a concessão de malhas.</p>
                <p><strong className="text-slate-800 font-semibold">Multimodal:</strong> Combinação de dois ou mais modais. Ex: marítimo + rodoviário. Mais eficiente para rotas complexas.</p>
              </div>
            </section>
            <section id="portos">
              <h2 className="text-2xl font-bold mb-4">Principais Portos do Brasil</h2>
              <div className="space-y-3">
                {[
                  { name: "Porto de Santos (SP)", desc: "Maior porto da América Latina. Volume recorde em 2024. Principal porta de entrada para importações." },
                  { name: "Porto de Paranaguá (PR)", desc: "Segundo maior porto. Especializado em grãos (soja, milho) e celulose." },
                  { name: "Porto de Rio Grande (RS)", desc: "Principal porta do sul do Brasil. Carga geral e graneados." },
                  { name: "Porto de Itajaí (SC)", desc: "Maior porto de exportação de containers do país. Foco em produtos manufaturados." },
                  { name: "Porto de Tubarão (ES)", desc: "Maior terminal de minério de ferro do mundo. Exportação de ferro e aço." },
                ].map((p) => (
                  <div key={p.name} className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2"><MapPin className="w-4 h-4 text-[#D80E16]" />{p.name}</h4>
                    <p className="text-sm text-slate-500 mt-1">{p.desc}</p>
                  </div>
                ))}
              </div>
              <Link to="/blog/portos-brasil-infraestrutura-logistica" className="inline-flex items-center gap-2 mt-4 text-[#D80E16] hover:text-[#b80c12] transition-colors text-sm">
                Ver análise completa dos portos <ArrowRight className="w-4 h-4" />
              </Link>
            </section>
            <section id="containeres">
              <h2 className="text-2xl font-bold mb-4">Tipos de Containeres</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <ul className="space-y-2 ml-4">
                  <li><strong className="text-slate-800 font-semibold">20' Standard (TEU):</strong> 33,2 m³ — padrão para cargas gerais</li>
                  <li><strong className="text-slate-800 font-semibold">40' Standard (FEU):</strong> 67,7 m³ — dobra a capacidade do 20'</li>
                  <li><strong className="text-slate-800 font-semibold">40' High Cube:</strong> 76,4 m³ — 30cm mais alto, ideal para cargas volumosas</li>
                  <li><strong className="text-slate-800 font-semibold">Reefer (Refrigerado):</strong> Para produtos perecíveis, controlando temperatura</li>
                  <li><strong className="text-slate-800 font-semibold">Open Top:</strong> Teto aberto para cargas que não cabem pela porta</li>
                  <li><strong className="text-slate-800 font-semibold">Flat Rack:</strong> Sem paredes laterais para cargas overweight/overdimensionadas</li>
                </ul>
              </div>
            </section>
            <section id="seguros">
              <h2 className="text-2xl font-bold mb-4">Seguro de Carga</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>O seguro de transporte internacional protege contra perdas e avarias durante o trajeto. Existem principais modalidades:</p>
                <ul className="space-y-2 ml-4">
                  <li><strong className="text-slate-800 font-semibold">Cobertura Ampla (All Risks):</strong> Cobre todos os riscos, exceto exclusões específicas</li>
                  <li><strong className="text-slate-800 font-semibold">Cobertura com Avaria Particular:</strong> Cobre danos parciais à carga</li>
                  <li><strong className="text-slate-800 font-semibold">Cobertura com Avaria Geral:</strong> Cobre perdas decorrentes de sacrifício do navio</li>
                </ul>
                <p>O prazo de average é de 30 dias após a descarga para notificar o segurador.</p>
              </div>
              <Link to="/blog/seguro-internacional-carga-importacao-exportacao" className="inline-flex items-center gap-2 mt-4 text-[#D80E16] hover:text-[#b80c12] transition-colors text-sm">
                Saiba mais sobre seguros <ArrowRight className="w-4 h-4" />
              </Link>
            </section>
            <section id="wci">
              <h2 className="text-2xl font-bold mb-4">WCI e o Mercado de Fretes</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>O World Container Index (WCI) é o índice que mede o preço de frete marítimo em rotas principais. Criado pela Drewry, é referência global para o mercado de containers.</p>
                <p>O WCI reflete a oferta e demanda de capacidade no transporte marítimo. Quando a demanda é alta (como na pandemia), os preços disparam. Quando a capacidade excede a demanda, os fretes caem.</p>
                <p>A TRADEXA monitora o WCI em tempo real e aplica o multiplicador no mapa de frete marítimo, permitindo que importadores e exportadores planejem custos com dados atualizados.</p>
              </div>
              <Link to="/maritime-freight-map" className="inline-flex items-center gap-2 mt-4 text-[#D80E16] hover:text-[#b80c12] transition-colors text-sm">
                Ver mapa de frete marítimo <ArrowRight className="w-4 h-4" />
              </Link>
            </section>
            <section id="dicas">
              <h2 className="text-2xl font-bold mb-4">Dicas de Logística</h2>
              <div className="space-y-3">
                {[
                  "Compare cotações de pelo menos 3 transportadoras antes de contratar",
                  "Considere o custo total (frete + seguro + despesas portuárias), não só o preço do frete",
                  "Negocie contratos de longo prazo com transportadoras para obter descontos",
                  "Use o mapa de frete marítimo da TRADEXA para monitorar tendências de preço",
                  "Planeje com antecedência — embarques na alta temporada custam 30-50% mais",
                  "Mantenha contato com o agente de carga — atualizações em tempo real evitam surpresas",
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
            <h2 className="text-3xl font-extrabold mb-4">Precisa cotar frete?</h2>
            <p className="text-slate-500 mb-8 max-w-xl mx-auto">Use o Mapa de Frete Marítimo da TRADEXA com preços em tempo real baseados no WCI.</p>
            <Link to="/maritime-freight-map" className="inline-flex items-center gap-2 bg-[#D80E16] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#b80c12] transition-colors">
              Ver Mapa de Frete <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
