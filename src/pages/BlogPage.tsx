import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  ArrowRight,
  Search,
  Sparkles,
  TrendingUp,
  Globe,
  Ship,
  FileText,
  BarChart3,
  X,
  Briefcase,
  Users,
  Shield,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { blogPosts, BlogPost } from "@/data/blog/posts";
import { ParticleCanvasThemed } from "@/components/3d";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// ─── Category config ───
const categoryIcons: Record<string, typeof FileText> = {
  NCM: FileText,
  Importação: TrendingUp,
  Exportação: TrendingUp,
  "Frete Marítimo": Ship,
  Logística: Ship,
  Tarifas: Globe,
  Alíquotas: Globe,
  Tributos: TrendingUp,
  Regulamentação: FileText,
  Incoterms: Globe,
};

const tagColors: Record<string, string> = {
  NCM: "bg-violet-100 text-violet-700 border-violet-200",
  Importação: "bg-blue-100 text-blue-700 border-blue-200",
  Exportação: "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Frete Marítimo": "bg-cyan-100 text-cyan-700 border-cyan-200",
  Tarifas: "bg-amber-100 text-amber-700 border-amber-200",
  Alíquotas: "bg-orange-100 text-orange-700 border-orange-200",
  Tributos: "bg-rose-100 text-rose-700 border-rose-200",
  Logística: "bg-sky-100 text-sky-700 border-sky-200",
  Regulamentação: "bg-indigo-100 text-indigo-700 border-indigo-200",
  Incoterms: "bg-teal-100 text-teal-700 border-teal-200",
};

const activeTagColors: Record<string, string> = {
  NCM: "bg-violet-600 text-white border-violet-600",
  Importação: "bg-blue-600 text-white border-blue-600",
  Exportação: "bg-emerald-600 text-white border-emerald-600",
  "Frete Marítimo": "bg-cyan-600 text-white border-cyan-600",
  Tarifas: "bg-amber-600 text-white border-amber-600",
  Alíquotas: "bg-orange-600 text-white border-orange-600",
  Tributos: "bg-rose-600 text-white border-rose-600",
  Logística: "bg-sky-600 text-white border-sky-600",
  Regulamentação: "bg-indigo-600 text-white border-indigo-600",
  Incoterms: "bg-teal-600 text-white border-teal-600",
};

// ─── Post Card ───
function PostCard({ post, index }: { post: BlogPost; index: number }) {
  const primaryTag = (post.tags || [])[0];
  const CategoryIcon = categoryIcons[primaryTag] || FileText;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/blog/${post.slug}`}
        className="group block relative rounded-2xl border border-black/[0.06] bg-white p-6 lg:p-8 hover:shadow-[0_8px_40px_-12px_rgba(15,17,26,0.12)] hover:border-[#D80E16]/15 transition-all duration-500 h-full"
      >
        {/* Hover gradient */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_top_right,rgba(216,14,22,0.03),transparent_60%)]" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Header: tag + date */}
          <div className="flex items-center justify-between mb-4">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                tagColors[primaryTag] || "bg-[#D80E16]/8 text-[#D80E16] border-[#D80E16]/20"
              }`}
            >
              <CategoryIcon className="w-3 h-3" />
              {primaryTag}
            </span>
            <span className="flex items-center gap-1 text-xs text-[#5E6278]">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(post.date)}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-lg lg:text-xl font-extrabold text-[#0F111A] mb-3 group-hover:text-[#D80E16] transition-colors duration-300 leading-tight">
            {post.title}
          </h2>

          {/* Excerpt */}
          <p className="text-sm text-[#5E6278] leading-relaxed mb-5 line-clamp-3 flex-1">
            {post.excerpt}
          </p>

          {/* Footer: read time + CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-black/[0.04]">
            <span className="flex items-center gap-1.5 text-xs text-[#5E6278]">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime} min de leitura
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#D80E16] group-hover:gap-2.5 transition-all duration-300">
              Ler artigo <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Tool cards for CTA section ───
const toolCards = [
  {
    title: "Classificador NCM com IA",
    desc: "Classifique produtos automaticamente em NCM, HS e HTS com inteligência artificial.",
    route: "/landing/ncm-classifier",
    icon: Sparkles,
    color: "#D80E16",
  },
  {
    title: "Tarifário Global",
    desc: "Consulte alíquotas de importação em 31 países com simulação de custos.",
    route: "/landing/tariff-calculator",
    icon: Globe,
    color: "#f59e0b",
  },
  {
    title: "Trade Intelligence",
    desc: "Dashboard completo com dados atualizados de importação e exportação brasileira.",
    route: "/landing/import-dashboard",
    icon: BarChart3,
    color: "#10b981",
  },
];

// ─── Extract unique categories from posts ───
function getCategories(posts: BlogPost[]): string[] {
  const freq = new Map<string, number>();
  for (const p of posts) {
    for (const tag of p.tags || []) {
      freq.set(tag, (freq.get(tag) || 0) + 1);
    }
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([tag]) => tag);
}

// ─── Main Page ───
export default function BlogPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const POSTS_PER_PAGE = 30;

  const categories = useMemo(() => getCategories(blogPosts), []);

  const filtered = useMemo(() => {
    let result = blogPosts;

    // Category filter
    if (activeCategory) {
      result = result.filter((p) => (p.tags || []).includes(activeCategory));
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q)),
      );
    }

    return result;
  }, [search, activeCategory]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeCategory]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE)),
    [filtered],
  );

  const paginatedPosts = useMemo(
    () => filtered.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE),
    [filtered, currentPage],
  );

  useSeo({
    title: "Blog — Inteligência Comercial e Comércio Exterior | TRADEXA",
    description: "Artigos sobre classificação NCM, alíquotas de importação, exportação, frete marítimo e inteligência comercial.",
    keywords:
      "blog comércio exterior, artigos NCM, classificação fiscal, exportação, importação, guia comex",
    canonical: "https://www.tradexa.com.br/blog",
  });

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <ParticleCanvasThemed
            opacity={0.15}
            particleCount={30}
            color="216, 14, 22"
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
              Blog
            </Badge>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-[#0F111A] tracking-tight leading-[1.08] mb-6">
              Inteligência para{" "}
              <span className="text-[#D80E16]">Comércio Exterior</span>
            </h1>

            <p className="text-lg md:text-xl text-[#5E6278] max-w-2xl mx-auto leading-relaxed mb-10">
              Artigos, guias e análises sobre classificação NCM, alíquotas de
              importação, exportação, frete marítimo e inteligência de mercado.
              Conteúdo gratuito para profissionais de comércio exterior.
            </p>

            {/* Search + Category filters */}
            <div className="space-y-4">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5E6278]" />
                <input
                  type="text"
                  placeholder="Buscar artigos por palavra-chave..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-black/[0.08] bg-white/80 backdrop-blur-sm text-[#0F111A] text-sm focus:outline-none focus:border-[#D80E16]/30 focus:ring-2 focus:ring-[#D80E16]/10 transition-all shadow-sm"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center hover:bg-slate-300 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Category pills */}
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
                    !activeCategory
                      ? "bg-[#D80E16] text-white border-[#D80E16] shadow-[0_2px_12px_rgba(216,14,22,0.25)]"
                      : "bg-white text-[#5E6278] border-black/[0.08] hover:border-[#D80E16]/20 hover:text-[#0F111A]"
                  }`}
                >
                  Todos
                </button>
                {categories.map((cat) => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(isActive ? null : cat)}
                      className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
                        isActive
                          ? activeTagColors[cat] || "bg-[#D80E16] text-white border-[#D80E16]"
                          : tagColors[cat]
                            ? `${tagColors[cat]} hover:shadow-sm`
                            : "bg-white text-[#5E6278] border-black/[0.08] hover:border-[#D80E16]/20"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="pb-20 md:pb-28 px-4 sm:px-6 lg:px-8 bg-[#FAFAF9]">
        <div className="max-w-5xl mx-auto">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-lg text-[#5E6278] mb-2">
                Nenhum artigo encontrado
              </p>
              <p className="text-sm text-[#5E6278]/60 mb-6">
                {search && activeCategory
                  ? `para "${search}" na categoria ${activeCategory}`
                  : search
                    ? `para "${search}"`
                    : `na categoria ${activeCategory}`}
              </p>
              <div className="flex items-center justify-center gap-3">
                {search && (
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setSearch("")}
                  >
                    Limpar busca
                  </Button>
                )}
                {activeCategory && (
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setActiveCategory(null)}
                  >
                    Mostrar todas categorias
                  </Button>
                )}
              </div>
            </motion.div>
          ) : (
            <>
              {/* Results count */}
              {activeCategory && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-[#5E6278] mb-6"
                >
                  <span className="font-bold text-[#0F111A]">{filtered.length}</span>{" "}
                  artigo{filtered.length !== 1 ? "s" : ""} em{" "}
                  <span className="font-bold text-[#D80E16]">{activeCategory}</span>
                  {search && (
                    <>
                      {" "}contendo "<span className="font-medium">{search}</span>"
                    </>
                  )}
                </motion.p>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory || "_all"}
                  className="grid md:grid-cols-2 gap-6 lg:gap-8"
                >
                  {paginatedPosts.map((post, i) => (
                    <PostCard key={post.slug} post={post} index={i} />
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-4 mt-10"
                >
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      currentPage === 1
                        ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                        : "bg-white text-[#D80E16] border border-[#D80E16]/20 hover:bg-[#D80E16] hover:text-white hover:border-[#D80E16] shadow-sm"
                    }`}
                  >
                    ← Anterior
                  </button>
                  <span className="text-sm text-[#5E6278] font-medium px-4 py-2 rounded-xl bg-white border border-black/[0.06]">
                    Página <strong className="text-[#0F111A]">{currentPage}</strong> de{" "}
                    <strong className="text-[#0F111A]">{totalPages}</strong>
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      currentPage === totalPages
                        ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                        : "bg-white text-[#D80E16] border border-[#D80E16]/20 hover:bg-[#D80E16] hover:text-white hover:border-[#D80E16] shadow-sm"
                    }`}
                  >
                    Próximo →
                  </button>
                </motion.div>
              )}

              {/* Serviços para Exportadores */}
              {!activeCategory && !search && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="mt-12"
                >
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold mb-4">
                      <Briefcase className="w-4 h-4" />
                      Serviços para Exportadores
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F111A] mb-3">
                      Tudo para sua operação de comércio exterior
                    </h2>
                    <p className="text-[#5E6278] max-w-xl mx-auto">
                      Da pesquisa de mercado ao despacho aduaneiro. Serviços completos com especialistas.
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { title: "Pesquisa de Mercado", desc: "Descubra os melhores mercados para seus produtos.", route: "/servicos/pesquisa-mercado-exportacao", icon: BarChart3, color: "#D80E16" },
                      { title: "Pesquisa de Compradores", desc: "Encontre compradores qualificados no exterior.", route: "/servicos/pesquisa-compradores", icon: Users, color: "#2563eb" },
                      { title: "Cotação de Frete", desc: "Compare cotações com 20+ armadores e agentes.", route: "/servicos/cotacao-frete-internacional", icon: Ship, color: "#0ea5e9" },
                      { title: "Despacho Aduaneiro", desc: "Desembaraço em todos os portos do Brasil.", route: "/servicos/despacho-aduaneiro", icon: Shield, color: "#10b981" },
                      { title: "Fulfillment", desc: "Armazenagem, picking e distribuição global.", route: "/servicos/fulfillment", icon: Package, color: "#f59e0b" },
                      { title: "Ver Todos →", desc: "Representação, feiras e mais serviços.", route: "/servicos", icon: Globe, color: "#8b5cf6" },
                    ].map((svc) => {
                      const SIcon = svc.icon;
                      return (
                        <Link key={svc.route} to={svc.route}
                          className="group block rounded-xl border border-black/[0.06] bg-white p-5 text-left hover:shadow-[0_4px_20px_-8px_rgba(15,17,26,0.1)] hover:border-[#D80E16]/10 transition-all"
                        >
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-white"
                            style={{ background: svc.color }}>
                            <SIcon className="w-5 h-5" />
                          </div>
                          <h3 className="font-bold text-sm text-[#0F111A] mb-1 group-hover:text-[#D80E16] transition-colors">
                            {svc.title}
                          </h3>
                          <p className="text-xs text-[#5E6278] leading-relaxed">{svc.desc}</p>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* CTA Section after posts */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mt-16 text-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D80E16]/[0.08] border border-[#D80E16]/[0.15] text-[#D80E16] text-sm font-semibold mb-4">
                  <Sparkles className="w-4 h-4" />
                  Ferramentas
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F111A] mb-4">
                  Coloque o conhecimento em prática
                </h2>
                <p className="text-[#5E6278] max-w-xl mx-auto mb-8">
                  Use as ferramentas da TRADEXA para classificar NCM, consultar tarifas e
                  analisar dados reais de comércio exterior.
                </p>
                <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  {toolCards.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <Link
                        key={tool.route}
                        to={tool.route}
                        className="group block rounded-xl border border-black/[0.06] bg-white p-5 text-left hover:shadow-[0_4px_20px_-8px_rgba(15,17,26,0.1)] hover:border-[#D80E16]/10 transition-all"
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-white"
                          style={{ background: tool.color }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-sm text-[#0F111A] mb-1 group-hover:text-[#D80E16] transition-colors">
                          {tool.title}
                        </h3>
                        <p className="text-xs text-[#5E6278] leading-relaxed">
                          {tool.desc}
                        </p>
                      </Link>
                    );
                  })}
                </div>
                <div className="mt-8">
                  <Button
                    size="lg"
                    className="gap-2 bg-[#D80E16] hover:bg-[#b80c12] text-white px-8 py-6 text-base font-bold rounded-2xl shadow-[0_0_40px_rgba(216,14,22,0.25)] border-0 btn-glow"
                    asChild
                  >
                    <Link to="/register">
                      <Sparkles className="w-5 h-5" />
                      Criar Conta Grátis
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
