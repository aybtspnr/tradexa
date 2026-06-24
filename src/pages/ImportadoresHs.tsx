import { useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Globe, Building2, Users, MapPin, Search, ChevronLeft, ChevronRight,
  Filter, X, Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSeo } from "@/hooks/use-seo";

// API constants defined below after HS_DESCRIPTIONS

// HS descriptions

const HS_DESCRIPTIONS: Record<string, string> = {
  "01": "Animais vivos", "02": "Carnes e miudezas", "03": "Peixes e frutos do mar",
  "04": "Leite e laticínios", "05": "Produtos de origem animal", "06": "Plantas e flores",
  "07": "Produtos hortícolas", "08": "Frutas comestíveis", "09": "Café, chá e especiarias",
  "10": "Cereais", "11": "Produtos da moagem", "12": "Sementes e frutos oleaginosos",
  "13": "Gomas e resinas", "14": "Matérias vegetais para trançado", "15": "Gorduras e óleos",
  "16": "Preparações de carne/peixe", "17": "Açúcares e confeitaria", "18": "Cacau e preparações",
  "19": "Preparações de cereais/farinho", "20": "Preparações de hortaliças/frutas",
  "21": "Preparações alimentícias diversas", "22": "Bebidas e líquidos alcoólicos",
  "23": "Resíduos da indústria alimentícia", "24": "Tabaco e sucedâneos",
  "25": "Sal, enxofre, terras e pedras", "26": "Minérios e escórias",
  "27": "Combustíveis minerais e óleos", "28": "Produtos químicos inorgânicos",
  "29": "Produtos químicos orgânicos", "30": "Produtos farmacêuticos",
  "31": "Adubos (fertilizantes)", "32": "Extratos tanantes e tintoriais",
  "33": "Óleos essenciais e cosméticos", "34": "Sabões e preparações de limpeza",
  "35": "Matérias albuminoides e colas", "36": "Pólvoras e explosivos",
  "37": "Produtos fotográficos e cinematográficos", "38": "Produtos químicos diversos",
  "39": "Plásticos e obras", "40": "Borracha e obras", "41": "Couro e peles",
  "42": "Obras de couro e artesãos", "43": "Peles e peleteria",
  "44": "Madeira e obras de madeira", "45": "Cortiça e obras",
  "46": "Obras de palha e matérias trançadas", "47": "Pasta de madeira/papel",
  "48": "Papel e obras de papel", "49": "Livros e publicações", "50": "Seda",
  "51": "Lã e pelo fino", "52": "Algodão", "53": "Outras fibras têxteis vegetais",
  "54": "Filamentos sintéticos", "55": "Fibras sintéticas/artificiais",
  "56": "Pasta para feltro e tecidos especiais", "57": "Tapetes e revestimentos piso têxteis",
  "58": "Tecidos especiais e rendas", "59": "Tecidos impregnados/revestidos",
  "60": "Tecidos de malha", "61": "Vestuário de malha",
  "62": "Vestuário (exceto malha)", "63": "Outros artefatos têxteis",
  "64": "Calçados", "65": "Chapéus e artefatos uso cabeça",
  "66": "Guardas-chuva e bengalas", "67": "Penas e plumas preparadas",
  "68": "Obras de pedra/gesso/cimento", "69": "Produtos cerâmicos",
  "70": "Vidro e obras de vidro", "71": "Pérolas e pedras preciosas",
  "72": "Ferro fundido e aço", "73": "Obras de ferro/aço", "74": "Cobre e obras",
  "75": "Níquel e obras", "76": "Alumínio e obras", "78": "Chumbo e obras",
  "79": "Zinco e obras", "80": "Estanho e obras", "81": "Outros metais comuns",
  "82": "Ferramentas e artefatos de corte", "83": "Obras diversas de metais comuns",
  "84": "Máquinas e aparelhos mecânicos", "85": "Máquinas e aparelhos elétricos",
  "86": "Material ferroviário", "87": "Veículos automotores",
  "88": "Aeronaves e veículos espaciais", "89": "Navios e embarcações",
  "90": "Instrumentos ópticos/fotográficos", "91": "Aparelhos de relojoaria",
  "92": "Instrumentos musicais", "93": "Armas e munições",
  "94": "Móveis e mobiliário", "95": "Brinquedos e artigos esportivos",
  "96": "Obras diversas", "97": "Obras de arte e coleções",
};

interface Importer {
  company: string;
  categories_traded: number;
  employees: number | null;
  turnover_usd: string | null;
  country: string;
  city: string;
  hs_chapter: string;
  product_category: string;
}

const API_EDGE_FN = "importadores-api";

async function apiFetch(path: string) {
  // Use Supabase client invoke (auto-handles auth)
  try {
    const { data, error } = await supabase.functions.invoke(API_EDGE_FN, {
      body: { path },
    });
    if (!error && data) return data;
  } catch {}
  // Fallback: VPS direct (HTTP — only works in dev/localhost)
  try {
    const url = `/api/vps/importadores${path}`;
    const res = await fetch(url);
    if (res.ok) return res.json();
  } catch {}
  return null;
}

export default function ImportadoresHs() {
  const { hs } = useParams();
  const [importers, setImporters] = useState<Importer[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterCountry, setFilterCountry] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const [filterEmployees, setFilterEmployees] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [countries, setCountries] = useState<string[]>([]);

  const hsChapter = hs?.padStart(2, "0") || "";
  const name = HS_DESCRIPTIONS[hsChapter] || `Capítulo ${hsChapter}`;

  useSeo({
    title: `Importadores de ${name} (HS ${hsChapter}) — Diretório B2B | TRADEXA`,
    description: `Encontre importadores reais de ${name} (código HS ${hsChapter}). Dados de milhões de empresas em 97 países com contatos, volumes e fornecedores. Prospecção B2B qualificada.`,
    keywords: `importadores ${name}, HS ${hsChapter}, importadores Brasil, ${name.toLowerCase()} comércio exterior, prospecção B2B`,
    canonical: `https://www.tradexa.com.br/importadores-hs/${hsChapter}`,
  });

  // Add noindex for protected pages
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    if (!hsChapter) return;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), per_page: "48" });
    if (filterCountry) params.set("country", filterCountry);
    if (filterCategory) params.set("category", filterCategory);
    if (filterSearch) params.set("search", filterSearch);
    if (filterEmployees === "1-10") {
      params.set("min_employees", "1"); params.set("max_employees", "10");
    } else if (filterEmployees === "11-50") {
      params.set("min_employees", "11"); params.set("max_employees", "50");
    } else if (filterEmployees === "51-200") {
      params.set("min_employees", "51"); params.set("max_employees", "200");
    } else if (filterEmployees === "200+") {
      params.set("min_employees", "200");
    }

    apiFetch(`/chapter/${hsChapter}?${params.toString()}`).then((data) => {
      if (data) {
        setImporters(data.importers || []);
        setTotal(data.total || 0);
        setTotalPages(data.total_pages || 1);
        setCategories(data.categories || []);
        const uniqueCountries = [...new Set((data.importers || []).map((i: Importer) => i.country))].sort();
        setCountries(uniqueCountries);
      }
      setLoading(false);
    });
  }, [hsChapter, page, filterCountry, filterCategory, filterSearch, filterEmployees]);

  const formatEmployees = (emp: number | null) => {
    if (!emp) return "—";
    if (emp <= 10) return "1-10";
    if (emp <= 50) return "11-50";
    if (emp <= 200) return "51-200";
    if (emp <= 1000) return "201-1.000";
    return "1.000+";
  };

  return (
    <>
      <Helmet>
        <title>Importadores de {name} — HS {hsChapter} | Tradexa</title>
        <meta name="description" content={`${total.toLocaleString()} importadores de ${name}. Filtre por país, porte ecategoria.`} />
      </Helmet>

      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="font-bold">HS {hsChapter}</Badge>
              <h1 className="text-2xl font-extrabold text-slate-900">{name}</h1>
            </div>
            <p className="text-sm text-slate-600">{total.toLocaleString()} importadores cadastrados</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="w-3.5 h-3.5" /> Filtros
                {(filterCountry || filterCategory || filterSearch || filterEmployees) && (
                  <Badge className="ml-1 bg-[#D80E16] text-white text-[10px] px-1.5">Ativos</Badge>
                )}
              </Button>
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
                <Input placeholder="Buscar por nome ou cidade..." className="pl-9 h-9 text-sm" value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") setPage(1); }} />
              </div>
              {(filterCountry || filterCategory || filterSearch || filterEmployees) && (
                <Button variant="ghost" size="sm" className="text-[#D80E16]"
                  onClick={() => { setFilterCountry(""); setFilterCategory(""); setFilterSearch(""); setFilterEmployees(""); setPage(1); }}>
                  <X className="w-3.5 h-3.5 mr-1" /> Limpar
                </Button>
              )}
            </div>
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">País</label>
                  <select className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm" value={filterCountry} onChange={(e) => { setFilterCountry(e.target.value); setPage(1); }}>
                    <option value="">Todos os países</option>
                    {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {categories.length > 1 && (
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Categoria</label>
                    <select className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm" value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}>
                      <option value="">Todas</option>
                      {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Funcionários</label>
                  <select className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm" value={filterEmployees} onChange={(e) => { setFilterEmployees(e.target.value); setPage(1); }}>
                    <option value="">Qualquer porte</option>
                    <option value="1-10">1-10 funcionários</option>
                    <option value="11-50">11-50 funcionários</option>
                    <option value="51-200">51-200 funcionários</option>
                    <option value="200+">200+ funcionários</option>
                  </select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-slate-50 rounded-xl animate-pulse" />)}
          </div>
        ) : importers.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-lg text-slate-600">Nenhum importador encontrado com estes filtros</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {importers.map((imp, idx) => (
                <Card key={`${imp.company}-${idx}`} className="group hover:border-[#D80E16]/20 hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-9 h-9 rounded-lg bg-[#D80E16]/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-[#D80E16]" />
                      </div>
                      <h3 className="font-semibold text-sm text-slate-900 truncate">{imp.company}</h3>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Globe className="w-3.5 h-3.5 text-slate-600" />
                        <span>{imp.country}{imp.city && ` — ${imp.city}`}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Users className="w-3.5 h-3.5 text-slate-600" />
                        <span>{formatEmployees(imp.employees)} funcionários</span>
                      </div>
                      {imp.categories_traded > 1 && (
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-600" />
                          <span>{imp.categories_traded} categorias</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-[10px] font-medium">HS {imp.hs_chapter}</Badge>
                      <Badge variant="secondary" className="text-[10px] truncate max-w-[180px]">{imp.product_category}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-slate-600 px-3">Página {page} de {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}