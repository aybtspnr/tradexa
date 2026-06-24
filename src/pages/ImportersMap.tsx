import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Globe, MapPin, Search, Loader2, AlertTriangle, Users,
  Building2, ArrowRight, ChevronDown, ChevronUp, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useSeo } from "@/hooks/use-seo";
import { useUsage } from "@/hooks/use-usage";

/* ── Types ── */
interface HsChapter {
  hs_chapter: string;
  description: string;
  count: number;
  categories: string[];
}

interface Importer {
  id: string;
  company: string;
  country: string;
  city?: string;
  hs_code: string;
  hs_description: string;
  product_category?: string;
  employees?: number;
  turnover_usd?: number | null;
  categories_traded?: number;
}

/* ── Country Coordinates ── */
const COUNTRY_COORDS: Record<string, [number, number]> = {
  "United States": [37.0902, -95.7129],
  "China": [35.8617, 104.1954],
  "Germany": [51.1657, 10.4515],
  "United Kingdom": [55.3781, -3.4360],
  "France": [46.2276, 2.2137],
  "Italy": [41.8719, 12.5674],
  "Japan": [36.2048, 138.2529],
  "Netherlands": [52.1326, 5.2913],
  "South Korea": [35.9078, 127.7669],
  "Canada": [56.1304, -106.3468],
  "Belgium": [50.5039, 4.4699],
  "India": [20.5937, 78.9629],
  "Mexico": [23.6345, -102.5528],
  "Spain": [40.4637, -3.7492],
  "Switzerland": [46.8182, 8.2275],
  "Australia": [-25.2744, 133.7751],
  "Brazil": [-14.2350, -51.9253],
  "Russia": [61.5240, 105.3188],
  "Turkey": [38.9637, 35.2433],
  "Türkiye": [38.9637, 35.2433],
  "Austria": [47.5162, 14.5501],
  "Poland": [51.9194, 19.1451],
  "Sweden": [60.1282, 18.6435],
  "Argentina": [-38.4161, -63.6167],
  "Nigeria": [9.0820, 8.6753],
  "Norway": [60.4720, 8.4689],
  "Vietnam": [14.0583, 108.2772],
  "Viet Nam": [14.0583, 108.2772],
  "Denmark": [56.2639, 9.5018],
  "South Africa": [-30.5595, 22.9375],
  "Saudi Arabia": [23.8859, 45.0792],
  "Singapore": [1.3521, 103.8198],
  "UAE": [23.4241, 53.8478],
  "United Arab Emirates": [23.4241, 53.8478],
  "Finland": [61.9241, 25.7482],
  "Thailand": [15.8700, 100.9925],
  "Israel": [31.0461, 34.8516],
  "Malaysia": [4.2105, 101.9758],
  "Portugal": [39.3999, -8.2245],
  "Czech Republic": [49.8175, 15.4730],
  "Greece": [39.0742, 21.8243],
  "Ireland": [53.4129, -8.2439],
  "Romania": [45.9432, 24.9668],
  "Hungary": [47.1625, 19.5033],
  "Ukraine": [48.3794, 31.1656],
  "New Zealand": [-40.9006, 174.8860],
  "Chile": [-35.6751, -71.5430],
  "Colombia": [4.5709, -74.2973],
  "Peru": [-9.1900, -75.0152],
  "Egypt": [26.8206, 30.8025],
  "Kazakhstan": [48.0196, 66.9237],
  "Morocco": [31.7917, -7.0926],
  "Bangladesh": [23.6850, 90.3563],
  "Philippines": [12.8797, 121.7740],
  "Pakistan": [30.3753, 69.3451],
  "Indonesia": [-0.7893, 113.9213],
  "Ecuador": [-1.8312, -78.1834],
  "Venezuela": [6.4238, -66.5897],
  "Bolivia": [-16.2902, -63.5887],
  "Paraguay": [-23.4425, -58.4438],
  "Uruguay": [-32.5228, -55.7658],
  "Guatemala": [15.7835, -90.2308],
  "Costa Rica": [9.7489, -83.7534],
  "Panama": [8.5380, -80.7821],
  "Dominican Republic": [18.7357, -70.1627],
  "Croatia": [45.1000, 15.2000],
  "Bulgaria": [42.7339, 25.4858],
  "Slovakia": [48.6690, 19.6990],
  "Slovenia": [46.1512, 14.9955],
  "Lithuania": [55.1694, 23.8813],
  "Latvia": [56.8796, 24.6032],
  "Estonia": [58.5953, 25.0136],
  "Luxembourg": [49.8153, 6.1296],
  "Cyprus": [35.1264, 33.4299],
  "Malta": [35.9375, 14.3754],
  "Belarus": [53.7098, 27.9534],
  "Serbia": [44.0165, 21.0059],
  "Sri Lanka": [7.8731, 80.7718],
  "Myanmar": [21.9162, 95.9560],
  "Kenya": [-0.0236, 37.9062],
  "Ethiopia": [9.1450, 40.4897],
  "Ghana": [7.9465, -1.0232],
  "Tanzania": [-6.3690, 34.8888],
  "Algeria": [28.0339, 1.6596],
  "Tunisia": [33.8869, 9.5375],
};

const FLAG_MAP: Record<string, string> = {
  "United States": "🇺🇸", "China": "🇨🇳", "Germany": "🇩🇪", "United Kingdom": "🇬🇧",
  "France": "🇫🇷", "Italy": "🇮🇹", "Japan": "🇯🇵", "Netherlands": "🇳🇱",
  "South Korea": "🇰🇷", "Canada": "🇨🇦", "Belgium": "🇧🇪", "India": "🇮🇳",
  "Mexico": "🇲🇽", "Spain": "🇪🇸", "Switzerland": "🇨🇭", "Australia": "🇦🇺",
  "Brazil": "🇧🇷", "Russia": "🇷🇺", "Turkey": "🇹🇷", "Türkiye": "🇹🇷",
  "Austria": "🇦🇹", "Poland": "🇵🇱", "Sweden": "🇸🇪", "Argentina": "🇦🇷",
  "Nigeria": "🇳🇬", "Norway": "🇳🇴", "Vietnam": "🇻🇳", "Viet Nam": "🇻🇳",
  "Denmark": "🇩🇰", "South Africa": "🇿🇦", "Saudi Arabia": "🇸🇦", "Singapore": "🇸🇬",
  "UAE": "🇦🇪", "United Arab Emirates": "🇦🇪", "Finland": "🇫🇮", "Thailand": "🇹🇭",
  "Israel": "🇮🇱", "Malaysia": "🇲🇾", "Portugal": "🇵🇹", "Czech Republic": "🇨🇿",
  "Greece": "🇬🇷", "Ireland": "🇮🇪", "Romania": "🇷🇴", "Hungary": "🇭🇺",
  "Ukraine": "🇺🇦", "New Zealand": "🇳🇿", "Chile": "🇨🇱", "Colombia": "🇨🇴",
  "Peru": "🇵🇪", "Egypt": "🇪🇬", "Kazakhstan": "🇰🇿", "Morocco": "🇲🇦",
  "Bangladesh": "🇧🇩", "Philippines": "🇵🇭", "Pakistan": "🇵🇰", "Indonesia": "🇮🇩",
  "Ecuador": "🇪🇨", "Venezuela": "🇻🇪", "Bolivia": "🇧🇴", "Paraguay": "🇵🇾",
  "Uruguay": "🇺🇾", "Guatemala": "🇬🇹", "Costa Rica": "🇨🇷", "Panama": "🇵🇦",
  "Dominican Republic": "🇩🇴", "Croatia": "🇭🇷", "Bulgaria": "🇧🇬",
  "Slovakia": "🇸🇰", "Slovenia": "🇸🇮", "Lithuania": "🇱🇹", "Latvia": "🇱🇻",
  "Estonia": "🇪🇪", "Luxembourg": "🇱🇺", "Cyprus": "🇨🇾", "Malta": "🇲🇹",
  "Belarus": "🇧🇾", "Serbia": "🇷🇸", "Sri Lanka": "🇱🇰", "Myanmar": "🇲🇲",
  "Kenya": "🇰🇪", "Ethiopia": "🇪🇹", "Ghana": "🇬🇭", "Tanzania": "🇹🇿",
  "Algeria": "🇩🇿", "Tunisia": "🇹🇳",
};

function getFlag(country: string): string {
  return FLAG_MAP[country] || "";
}

/* ── Component ── */
export default function ImportersMap() {
  useSeo({
    title: "Mapa de Importadores — Geolocalização de Empresas",
    description: "Visualize importadores no mapa. Encontre empresas importadoras por localização geográfica e veja concentração de compradores por região.",
    keywords: "mapa importadores, geolocalização importadores, prospecção comercial, tradexa",
  });

  const { consume } = useUsage();
  const [chapters, setChapters] = useState<HsChapter[]>([]);
  const [selectedHs, setSelectedHs] = useState("");
  const [countryGroups, setCountryGroups] = useState<Record<string, number>>({});
  const [allImporters, setAllImporters] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [countryImporters, setCountryImporters] = useState<Importer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMap, setLoadingMap] = useState(false);
  const [loadingImporters, setLoadingImporters] = useState(false);
  const [error, setError] = useState("");
  const [searchCountry, setSearchCountry] = useState("");
  const [sidePanelOpen, setSidePanelOpen] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  /* ── Load chapters ── */
  useEffect(() => {
    fetch("/api/vps/importadores/index")
      .then(r => r.json())
      .then((data: HsChapter[]) => {
        setChapters(data);
        if (data.length > 0) setSelectedHs(data[0].hs_chapter);
        setLoading(false);
      })
      .catch(() => {
        setError("Erro ao carregar capítulos HS do VPS.");
        setLoading(false);
      });
  }, []);

  /* ── Load importers when HS changes ── */
  useEffect(() => {
    if (!selectedHs) return;
    setLoadingMap(true);
    setSelectedCountry(null);
    setCountryImporters([]);
    setSidePanelOpen(false);

    // Fetch multiple pages to get good country coverage
    const fetchPage = (page: number) =>
      fetch(`/api/vps/importadores/chapter/${selectedHs}?page=${page}&per_page=200`)
        .then(r => r.json())
        .catch(() => ({ importers: [] }));

    // Fetch 20 pages for better coverage (4,000 importers)
    Promise.all([
      fetchPage(1), fetchPage(2), fetchPage(3), fetchPage(4), fetchPage(5),
      fetchPage(6), fetchPage(7), fetchPage(8), fetchPage(9), fetchPage(10),
      fetchPage(11), fetchPage(12), fetchPage(13), fetchPage(14), fetchPage(15),
      fetchPage(16), fetchPage(17), fetchPage(18), fetchPage(19), fetchPage(20),
    ])
      .then((results) => {
        const allImporters: any[] = [];
        results.forEach(r => {
          if (r.importers) allImporters.push(...r.importers);
        });

        setAllImporters(allImporters);

        // Group by country
        const countryMap: Record<string, number> = {};
        allImporters.forEach((imp: any) => {
          const c = imp.country || "Desconhecido";
          countryMap[c] = (countryMap[c] || 0) + 1;
        });

        setCountryGroups(countryMap);
        setLoadingMap(false);
      })
      .catch(() => {
        setLoadingMap(false);
      });
  }, [selectedHs]);

  /* ── Build map ── */
  useEffect(() => {
    if (!mapRef.current || loadingMap) return;
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: "© OpenStreetMap, © CARTO",
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    // Add country markers
    const countries = Object.keys(countryGroups);
    let markerCount = 0;

    countries.forEach((country) => {
      const coords = COUNTRY_COORDS[country];
      if (!coords) return;

      const count = countryGroups[country];
      const flag = getFlag(country);

      // Dot size based on count
      const size = Math.min(Math.max(12, Math.sqrt(count) * 2), 40);
      const opacity = Math.min(0.7 + count / 500, 0.95);

      const icon = L.divIcon({
        className: "custom-dot",
        html: `
          <div style="
            width: ${size}px; height: ${size}px;
            background: linear-gradient(135deg, #D80E16 0%, #b00c12 100%);
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(216,14,22,0.4);
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
            transition: transform 0.2s;
          " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
            <span style="font-size: ${size * 0.5}px;">${flag}</span>
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker(coords, { icon })
        .addTo(map)
        .bindTooltip(`${flag} ${country}<br/><strong>${count.toLocaleString("pt-BR")} importadores</strong>`, {
          direction: "top",
          offset: [0, -size / 2],
          className: "bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-lg",
        });

      marker.on("click", () => {
        handleCountryClick(country);
      });

      markersRef.current.push(marker);
      markerCount++;
    });

    leafletMapRef.current = map;

    // Fit bounds if we have markers
    if (markerCount > 0) {
      const group = new L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.1));
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [countryGroups, loadingMap]);

  /* ── Load country importers (filter from already loaded data) ── */
  const handleCountryClick = useCallback((country: string) => {
    consume("importer_view"); // track async, don't block UI
    setSelectedCountry(country);
    setLoadingImporters(true);
    setSidePanelOpen(true);

    // Filter from already loaded data instead of making new HTTP request
    const imps = allImporters
      .filter((imp: any) => (imp.country || "").toLowerCase() === country.toLowerCase())
      .map((imp: any) => ({
        id: imp.id || String(Math.random()),
        company: imp.company || imp.name || "N/A",
        country: imp.country,
        city: imp.city,
        hs_code: imp.hs_code || selectedHs,
        hs_description: chapters.find(c => c.hs_chapter === selectedHs)?.description || "",
        product_category: imp.product_category,
        employees: imp.employees,
        turnover_usd: imp.turnover_usd,
        categories_traded: imp.categories_traded,
      }));

    setCountryImporters(imps);
    setLoadingImporters(false);
  }, [allImporters, selectedHs, chapters]);

  /* ── Filtered countries ── */
  const filteredCountries = useMemo(() => {
    const entries = Object.entries(countryGroups);
    if (!searchCountry) return entries;
    return entries.filter(([country]) =>
      country.toLowerCase().includes(searchCountry.toLowerCase())
    );
  }, [countryGroups, searchCountry]);

  const totalCountries = Object.keys(countryGroups).length;
  const totalImporters = Object.values(countryGroups).reduce((a, b) => a + b, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
        <span className="ml-2 text-slate-600">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-800">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* ── KPIs + Link to Directory ── */}
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="flex-1 flex items-center gap-3">
          <div className="rounded-xl bg-white border border-slate-200 p-3 text-center min-w-[100px]">
            <p className="text-[10px] font-bold text-slate-600 uppercase">Países</p>
            <p className="text-xl font-black text-slate-800 mt-1">{totalCountries}</p>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 p-3 text-center min-w-[100px]">
            <p className="text-[10px] font-bold text-slate-600 uppercase">Importadores</p>
            <p className="text-xl font-black text-slate-800 mt-1">
              {loadingMap ? "..." : totalImporters.toLocaleString("pt-BR")}
            </p>
          </div>
        </div>

        <a
          href="/importadores"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#D80E16] text-white font-bold text-sm
                     hover:bg-[#b80c12] transition-all shadow-md hover:shadow-lg"
        >
          <Building2 className="w-4 h-4" />
          Ver diretório completo
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      {/* ── Map + Side Panel ── */}
      <div className="relative rounded-2xl border border-slate-200 bg-white overflow-hidden" style={{ height: "600px" }}>
        {/* Map */}
        <div ref={mapRef} className="w-full h-full" />

        {loadingMap && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <Loader2 className="w-8 h-8 animate-spin text-[#D80E16]" />
            <span className="ml-3 text-sm font-medium text-slate-700">Mapeando importadores...</span>
          </div>
        )}

        {/* Country filter overlay */}
        <div className="absolute top-4 left-4 z-[400] w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input
              value={searchCountry}
              onChange={(e) => setSearchCountry(e.target.value)}
              placeholder="Filtrar país no mapa..."
              className="w-full rounded-xl border border-slate-200 bg-white/95 backdrop-blur pl-10 pr-4 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-[#D80E16]/20 focus:border-[#D80E16] shadow-lg"
            />
          </div>
          {searchCountry && filteredCountries.length > 0 && (
            <div className="mt-2 bg-white/95 backdrop-blur rounded-xl border border-slate-200 shadow-lg max-h-48 overflow-y-auto">
              {filteredCountries.slice(0, 8).map(([country, count]) => (
                <button
                  key={country}
                  onClick={() => {
                    handleCountryClick(country);
                    setSearchCountry("");
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-50 text-sm"
                >
                  <span>{getFlag(country)}</span>
                  <span className="font-medium text-slate-700">{country}</span>
                  <span className="ml-auto text-xs text-slate-500">{count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Side Panel — Country Detail */}
        {sidePanelOpen && selectedCountry && (
          <div className="absolute top-0 right-0 bottom-0 w-full md:w-96 bg-white border-l border-slate-200 shadow-2xl z-[400] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getFlag(selectedCountry)}</span>
                <div>
                  <h3 className="font-black text-slate-800">{selectedCountry}</h3>
                  <p className="text-xs text-slate-600">
                    {countryGroups[selectedCountry] || 0} importadores
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSidePanelOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingImporters ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
                  <span className="ml-2 text-sm text-slate-600">Carregando...</span>
                </div>
              ) : countryImporters.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Nenhum importador encontrado.</p>
                </div>
              ) : (
                <>
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                    {countryImporters.length} empresas encontradas
                  </p>
                  {countryImporters.map((imp) => (
                    <div
                      key={imp.id}
                      className="rounded-xl border border-slate-200 p-4 hover:border-[#D80E16]/30 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#D80E16]/10 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5 text-[#D80E16]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-black text-slate-800">
                            {imp.company}
                          </h4>
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-700">
                              HS {imp.hs_code}
                            </span>
                            {imp.product_category && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-[10px] font-bold text-blue-700 truncate max-w-[200px]">
                                {imp.product_category}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-600">
                            {imp.city && (
                              <span>{imp.city}</span>
                            )}
                            {imp.employees && (
                              <span>{imp.employees} funcionários</span>
                            )}
                            {imp.turnover_usd && (
                              <span>${(imp.turnover_usd / 1_000_000).toFixed(1)}M faturamento</span>
                            )}
                          </div>
                          {imp.categories_traded && imp.categories_traded > 1 && (
                            <p className="text-[10px] text-slate-500 mt-1">
                              Comercializa em {imp.categories_traded} categorias
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom legend ── */}
      <div className="flex items-center gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#D80E16]" />
          <span>Importador no mapa</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#D80E16]/30 border border-[#D80E16]" />
          <span>Tamanho = volume de empresas</span>
        </div>
        <span className="ml-auto text-slate-500">
          Clique no dot para ver detalhes
        </span>
      </div>
    </div>
  );
}
