import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, Globe, TrendingUp, Search, ArrowRight, Loader2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSeo } from "@/hooks/use-seo";

// API constants defined below after COUNTRY_FLAGS

const HS_DESCRIPTIONS: Record<string, string> = {
  "01": "Animais vivos", "02": "Carnes e miudezas", "03": "Peixes e frutos do mar",
  "04": "Leite e laticínios", "05": "Produtos de origem animal", "06": "Plantas e flores",
  "07": "Produtos hortícolas", "08": "Frutas comestíveis", "09": "Café, chá e especiarias",
  "10": "Cereais", "11": "Produtos da moagem", "12": "Sementes e frutos oleaginosos",
  "13": "Gomas e resinas", "14": "Matérias vegetais para trançado", "15": "Gorduras e óleos",
  "16": "Preparações de carne/peixe", "17": "Açúcares e confeitaria", "18": "Cacau e preparações",
  "19": "Preparações de cereais", "20": "Preparações de hortaliças/frutas",
  "21": "Preparações alimentícias diversas", "22": "Bebidas e líquidos alcoólicos",
  "23": "Resíduos da indústria alimentícia", "24": "Tabaco e sucedâneos",
  "25": "Sal, enxofre, terras", "26": "Minérios e escórias", "27": "Combustíveis minerais",
  "28": "Produtos químicos inorgânicos", "29": "Produtos químicos orgânicos",
  "30": "Produtos farmacêuticos", "31": "Adubos (fertilizantes)",
  "32": "Extratos tanantes e tintoriais", "33": "Óleos essenciais e cosméticos",
  "34": "Sabões e preparações de limpeza", "35": "Matérias albuminoides e colas",
  "36": "Pólvoras e explosivos", "37": "Produtos fotográficos",
  "38": "Produtos químicos diversos", "39": "Plásticos e obras", "40": "Borracha e obras",
  "41": "Couro e peles", "42": "Obras de couro", "43": "Peles e peleteria",
  "44": "Madeira e obras de madeira", "45": "Cortiça e obras",
  "46": "Obras de palha e matérias trançadas", "47": "Pasta de madeira/papel",
  "48": "Papel e obras de papel", "49": "Livros e publicações",
  "50": "Seda", "51": "Lã e pelo fino", "52": "Algodão",
  "53": "Outras fibras têxteis vegetais", "54": "Filamentos sintéticos",
  "55": "Fibras sintéticas/artificiais", "56": "Tecidos especiais",
  "57": "Tapetes e revestimentos", "58": "Tecidos especiais e rendas",
  "59": "Tecidos impregnados", "60": "Tecidos de malha",
  "61": "Vestuário de malha", "62": "Vestuário (exceto malha)",
  "63": "Outros artefatos têxteis", "64": "Calçados", "65": "Chapéus",
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

const HS_ICONS: Record<string, string> = {};
const HS_ICONS_FALLBACK = "";

const COUNTRY_FLAGS: Record<string, string> = {
  "United States": "🇺🇸", "China": "🇨🇳", "Germany": "🇩🇪", "France": "🇫🇷",
  "Japan": "🇯🇵", "United Kingdom": "🇬🇧", "Italy": "🇮🇹", "Spain": "🇪🇸",
  "Netherlands": "🇳🇱", "Canada": "🇨🇦", "Mexico": "🇲🇽", "Belgium": "🇧🇪",
  "South Korea": "🇰🇷", "Australia": "🇦🇺", "Turkey": "🇹🇷", "Brazil": "🇧🇷",
  "India": "🇮🇳", "Russia": "🇷🇺", "Argentina": "🇦🇷", "Chile": "🇨🇱",
  "Colombia": "🇨🇴", "Peru": "🇵🇪", "Ecuador": "🇪🇨", "Uruguay": "🇺🇾",
  "Paraguay": "🇵🇾", "Bolivia": "🇧🇴", "USA": "🇺🇸", "USA ": "🇺🇸",
  "UK": "🇬🇧", "UAE": "🇦🇪", "Saudi Arabia": "🇸🇦", "Singapore": "🇸🇬",
  "Thailand": "🇹🇭", "Vietnam": "🇻🇳", "Indonesia": "🇮🇩", "Malaysia": "🇲🇾",
  "Philippines": "🇵🇭", "Poland": "🇵🇱", "Czech Republic": "🇨🇿", "Romania": "🇷🇴",
  "Hungary": "🇭🇺", "Sweden": "🇸🇪", "Denmark": "🇩🇰", "Norway": "🇳🇴",
  "Finland": "🇫🇮", "Austria": "🇦🇹", "Switzerland": "🇨🇭", "Portugal": "🇵🇹",
  "Greece": "🇬🇷", "Ireland": "🇮🇪", "Israel": "🇮🇱", "Egypt": "🇪🇬",
  "South Africa": "🇿🇦", "Nigeria": "🇳🇬", "Kenya": "🇰🇪", "Ukraine": "🇺🇦",
  "New Zealand": "🇳🇿", "Pakistan": "🇵🇰", "Bangladesh": "🇧🇩", "Taiwan": "🇹🇼",
  "Hong Kong": "🇭🇰", "Dominican Republic": "🇩🇴", "Costa Rica": "🇨🇷",
  "Guatemala": "🇬🇹", "Panama": "🇵🇦", "El Salvador": "🇸🇻",
  "Korea": "🇰🇷", "Kuwait": "🇰🇼", "Iraq": "🇮🇶", "Morocco": "🇲🇦",
};

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

function useAnimatedNumber(target: number, duration: number = 1200) {
  const [value, setValue] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (target === prevTarget.current) return;
    const start = prevTarget.current;
    prevTarget.current = target;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(Math.round(start + (target - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [target, duration]);

  return value;
}

export default function ImportadoresLanding() {
  useSeo({
    title: "Diretório de Importadores — Empresas por HS Code",
    description: "Milhões de importadores por código HS em 97 países. Contatos, volumes e portfólio de produtos para prospecção B2B internacional.",
    keywords: "importadores, HS code, diretório importadores, prospecção B2B, comércio exterior, find importers",
    canonical: "https://www.tradexa.com.br/importadores",
  });
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    apiFetch("/index").then((data) => {
      if (data && Array.isArray(data)) {
        setChapters(data);
      }
      setLoading(false);
    });
  }, []);

  const filteredChapters = searchQuery.trim()
    ? chapters.filter((ch) => {
        const q = searchQuery.toLowerCase();
        return (
          ch.hs_chapter.includes(q) ||
          ch.description.toLowerCase().includes(q) ||
          ch.categories?.some((c: string) => c.toLowerCase().includes(q))
        );
      })
    : chapters;

  const totalImporters = chapters.reduce((sum: number, ch: any) => sum + (ch.count || 0), 0);
  const animatedTotal = useAnimatedNumber(totalImporters);

  // Precompute top country flag for each chapter
  const chapterTopFlag = useCallback((ch: any) => {
    if (!ch.categories || ch.categories.length === 0) return "";
    const topCountry = ch.categories[0];
    return COUNTRY_FLAGS[topCountry] || "";
  }, []);

  return (
    <>
      <Helmet>
        <title>Diretório de Importadores Mundiais — Tradexa Market Intelligence</title>
        <meta
          name="description"
          content={`${totalImporters.toLocaleString()} importadores em ${chapters.length} categorias HS. Encontre leads qualificados para sua exportação.`}
        />
      </Helmet>

      <div className="max-w-6xl mx-auto py-12 px-4">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D80E16]/[0.08] border border-[#D80E16]/[0.15] text-[#D80E16] text-[11px] font-bold uppercase tracking-[0.2em] mb-5">
            <Users className="w-3.5 h-3.5" />
            Diretório Global
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F111A] tracking-tight mb-4">
            Diretório de <span className="text-[#D80E16]">Importadores</span>
          </h1>
          <p className="text-lg text-[#5E6278] max-w-2xl mx-auto">
            {loading
              ? "Carregando dados..."
              : `${animatedTotal.toLocaleString()} empresas importadoras em ${chapters.length} categorias HS, cobrindo 169+ países. Selecione um capítulo para explorar.`}
          </p>

          <div className="flex gap-4 justify-center mt-8">
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <Card className="border-slate-200">
            <CardContent className="pt-6 text-center">
              <Building2 className="w-10 h-10 mx-auto mb-2 text-[#D80E16]" />
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 break-all">
                {animatedTotal.toLocaleString()}
              </p>
              <p className="text-sm text-[#5E6278]">Importadores cadastrados</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="pt-6 text-center">
              <Globe className="w-10 h-10 mx-auto mb-2 text-[#D80E16]" />
              <p className="text-3xl font-extrabold text-slate-900">169+</p>
              <p className="text-sm text-[#5E6278]">Países cobertos</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="pt-6 text-center">
              <TrendingUp className="w-10 h-10 mx-auto mb-2 text-[#D80E16]" />
              <p className="text-3xl font-extrabold text-slate-900">{chapters.length}</p>
              <p className="text-sm text-[#5E6278]">Categorias de produtos</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-600" />
            <Input
              placeholder="Buscar por categoria (ex: café, plásticos, máquinas...)"
              className="pl-12 text-lg h-12 rounded-xl border-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Categories grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-6">
            Categorias de importadores
          </h2>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-28 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredChapters.map((ch) => {
                const topFlag = chapterTopFlag(ch);
                return (
                  <button
                    key={ch.hs_chapter}
                    onClick={() => navigate(`/importadores-hs/${ch.hs_chapter}`)}
                    className="group relative p-4 rounded-xl border border-slate-200 bg-white hover:border-[#D80E16]/30 hover:shadow-lg hover:shadow-[#D80E16]/5 hover:bg-gradient-to-br hover:from-[#D80E16]/5 hover:to-orange-500/5 transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{HS_ICONS[ch.hs_chapter] || HS_ICONS_FALLBACK}</span>
                      {topFlag && (
                        <span className="text-base" title={ch.categories?.[0] || ""}>{topFlag}</span>
                      )}
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold mb-1.5">
                      HS {ch.hs_chapter}
                    </Badge>
                    <p className="text-sm font-semibold text-slate-900 line-clamp-2">
                      {ch.description}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {ch.count.toLocaleString()} importadores
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}