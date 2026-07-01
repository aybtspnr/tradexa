import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Globe, MapPin, Search, Loader2, AlertTriangle,
  TrendingUp, TrendingDown, Download, X, ChevronDown, ChevronUp, ArrowLeft,
  Ship, Warehouse, SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useSeo } from "@/hooks/use-seo";
import { useUsage } from "@/hooks/use-usage";
import { comexstat } from "@/services/comexstat";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

interface CountryTrade {
  country: string;
  countryCode: string;
  fobValue: number;
  kgValue: number;
  share: number;
}

interface StateTrade {
  state: string;
  fobValue: number;
  kgValue: number;
  share: number;
}

interface CityTrade {
  city: string;
  uf: string;
  fobValue: number;
  kgValue: number;
}

interface TradeData {
  countries: CountryTrade[];
  states: StateTrade[];
  cities: CityTrade[];
}

type TabType = "export" | "import";
type PeriodMode = "months" | "full_year" | "specific_month";

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

const MONTHS_LABEL = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// Country → ISO2 code for country name matching
const COUNTRY_TO_ISO2: Record<string, string> = {
  "China": "CN", "Estados Unidos": "US", "EUA": "US", "Estados Unidos da América": "US", "Argentina": "AR",
  "Alemanha": "DE", "Países Baixos (Holanda)": "NL", "Países Baixos": "NL", "Holanda": "NL",
  "Japão": "JP", "Coreia do Sul": "KR", "Coreia do Sul (República da Coreia)": "KR",
  "França": "FR", "Itália": "IT", "Espanha": "ES", "Reino Unido": "GB",
  "Bélgica": "BE", "México": "MX", "Chile": "CL", "Índia": "IN",
  "Canadá": "CA", "Arábia Saudita": "SA", "Rússia": "RU", "Austrália": "AU",
  "Indonésia": "ID", "Tailândia": "TH", "Vietnã": "VN", "Viet Nam": "VN",
  "Singapura": "SG", "Malásia": "MY", "Suíça": "CH", "Suécia": "SE",
  "Noruega": "NO", "Dinamarca": "DK", "Finlândia": "FI", "Polônia": "PL",
  "Áustria": "AT", "Turquia": "TR", "Türkiye": "TR", "Egito": "EG",
  "África do Sul": "ZA", "Nigéria": "NG", "Angola": "AO", "Argélia": "DZ",
  "Marrocos": "MA", "Israel": "IL", "Emirados Árabes Unidos": "AE", "UAE": "AE",
  "Catar": "QA", "Coveite (Kuweit)": "KW", "Kuwait": "KW", "Iraque": "IQ",
  "Irã": "IR", "Paquistão": "PK", "Bangladesh": "BD", "Filipinas": "PH",
  "Taiwan": "TW", "Taiwan (Formosa)": "TW", "Hong Kong": "HK",
  "Peru": "PE", "Colômbia": "CO", "Equador": "EC", "Venezuela": "VE",
  "Bolívia": "BO", "Paraguai": "PY", "Uruguai": "UY", "Guiana": "GY",
  "Suriname": "SR", "Porto Rico": "PR",
  "República Dominicana": "DO", "Panamá": "PA", "Costa Rica": "CR",
  "Guatemala": "GT", "Honduras": "HN", "El Salvador": "SV", "Nicarágua": "NI",
  "Trinidad e Tobago": "TT", "Cuba": "CU", "Jamaica": "JM", "Haiti": "HT",
  "Nova Zelândia": "NZ", "Nova Zelândia (Aotearoa)": "NZ",
  "Portugal": "PT", "Brasil": "BR", "Romênia": "RO", "Bulgária": "BG",
  "Hungria": "HU", "Grécia": "GR", "Eslováquia": "SK", "Tcheca, República": "CZ",
  "Croácia": "HR", "Eslovênia": "SI", "Lituânia": "LT", "Letônia": "LV",
  "Estônia": "EE", "Irlanda": "IE", "Luxemburgo": "LU", "Malta": "MT",
  "Chipre": "CY", "Islândia": "IS", "Albânia": "AL", "Macedônia": "MK",
  "Bósnia-Herzegovina": "BA", "Sérvia": "RS", "Montenegro": "ME",
  "Belarus": "BY", "Ucrânia": "UA", "Moldávia": "MD", "Geórgia": "GE",
  "Armênia": "AM", "Azerbaijão": "AZ", "Cazaquistão": "KZ", "Uzbequistão": "UZ",
  "Turcomenistão": "TM", "Quirguistão": "KG", "Tadjiquistão": "TJ",
  "Mongólia": "MN", "Afeganistão": "AF", "Nepal": "NP", "Butão": "BT",
  "Sri Lanka": "LK", "Mianmar": "MM", "Laos": "LA", "Camboja": "KH",
  "Brunei": "BN", "Maldivas": "MV", "Palestina": "PS", "Jordânia": "JO",
  "Líbano": "LB", "Síria": "SY", "Iêmen": "YE", "Omã": "OM",
  "Barein": "BH", "Líbia": "LY", "Tunísia": "TN", "Sudão": "SD",
  "Sudão do Sul": "SS", "Mauritânia": "MR", "Senegal": "SN", "Gâmbia": "GM",
  "Guiné": "GN", "Guiné-Bissau": "GW", "Serra Leoa": "SL", "Libéria": "LR",
  "Costa do Marfim": "CI", "Gana": "GH", "Togo": "TG", "Benin": "BJ",
  "Níger": "NE", "Burkina Faso": "BF", "Mali": "ML",
  "Camarões": "CM", "República Centro-Africana": "CF", "Chade": "TD",
  "Congo, República Democrática": "CD", "Congo": "CG",
  "Gabão": "GA", "Guiné Equatorial": "GQ", "São Tomé e Príncipe": "ST",
  "Etiópia": "ET", "Eritreia": "ER", "Djibuti": "DJ", "Somália": "SO",
  "Quênia": "KE", "Uganda": "UG", "Ruanda": "RW", "Burundi": "BI",
  "Tanzânia": "TZ", "Moçambique": "MZ", "Zâmbia": "ZM", "Zimbábue": "ZW",
  "Malavi": "MW", "Madagascar": "MG", "Maurício": "MU", "Comores": "KM",
  "Seicheles": "SC", "Cabo Verde": "CV",
  "Bahamas": "BS", "Barbados": "BB", "Dominica": "DM", "Granada": "GD",
  "São Cristóvão e Névis": "KN", "Santa Lúcia": "LC", "São Vicente e Granadinas": "VC",
  "Antígua e Barbuda": "AG", "Belize": "BZ", "Aruba": "AW", "Curaçao": "CW",
  "Sint Maarten": "SX", "Cayman, Ilhas": "KY", "Bermudas": "BM",
  "Virgens, Ilhas (Britânicas)": "VG", "Virgens, Ilhas (Americanas)": "VI",
  "Turcas e Caicos, Ilhas": "TC", "Montserrat": "MS", "Anguilla": "AI",
  "Falkland (Malvinas)": "FK",
  "Papua Nova Guiné": "PG", "Fiji": "FJ", "Salomão, Ilhas": "SB",
  "Vanuatu": "VU", "Samoa": "WS", "Samoa Americana": "AS",
  "Tonga": "TO", "Tuvalu": "TV", "Kiribati": "KI", "Marshall, Ilhas": "MH",
  "Palau": "PW", "Micronésia": "FM", "Nauru": "NR",
  "Marianas do Norte, Ilhas": "MP", "Guam": "GU",
  "Polinésia Francesa": "PF", "Nova Caledônia": "NC", "Mayotte": "YT",
  "Reunião": "RE", "Guadalupe": "GP", "Martinica": "MQ", "Guiana Francesa": "GF",
  "São Bartolomeu": "BL", "São Martinho, Ilha de (parte francesa)": "MF",
  "Wallis e Futuna, Ilhas": "WF", "Toquelau": "TK", "Niue": "NU",
  "Cook, Ilhas": "CK", "Christmas (Navidad), Ilha": "CX",
  "Cocos (Keeling), Ilhas": "CC", "Norfolk, Ilha": "NF",
  "Pitcairn": "PN", "Geórgia do Sul e Sandwich do Sul, Ilhas": "GS",
  "Heard e ilhas mcdonald, Ilha": "HM", "Bouvet, Ilha": "BV",
  "Svalbard e Jan Mayen": "SJ", "Faroe, Ilhas": "FO", "Aland, Ilhas": "AX",
  "Gibraltar": "GI", "Mônaco": "MC", "Liechtenstein": "LI",
  "San Marino": "SM", "Vaticano": "VA", "Andorra": "AD",
  "Ilha de Man": "IM", "Guernsey": "GG",
  "Território Britânico do Oceano Índico": "IO",
  "Terras Austrais Francesas": "TF",
  "Pacífico, Ilhas do (EUA)": "UM",
  "Santa Helena": "SH",
  "Coreia do Norte": "KP",
  "Namíbia": "NA", "Botsuana": "BW", "Lesoto": "LS",
  "Suazilândia": "SZ",
  "Macau": "MO", "Timor Leste": "TL",
  "Bonaire, Saint Eustatius e Saba": "BQ",
  "Groenlândia": "GL",
  "Antártica": "AQ",
};

// Map continent colors for legend
const FOB_COLORS = [
  { max: 100000000, color: "#fef2f2", label: "< $100M" },
  { max: 500000000, color: "#fecaca", label: "$100M - $500M" },
  { max: 1000000000, color: "#f87171", label: "$500M - $1B" },
  { max: 5000000000, color: "#dc2626", label: "$1B - $5B" },
  { max: 10000000000, color: "#b91c1c", label: "$5B - $10B" },
  { max: Infinity, color: "#7f1d1d", label: "> $10B" },
];

function getColor(fob: number): string {
  for (const c of FOB_COLORS) {
    if (fob < c.max) return c.color;
  }
  return "#7f1d1d";
}

function getIntensity(fob: number, maxFob: number): number {
  if (maxFob <= 0) return 0;
  return Math.min(1, fob / maxFob);
}

function fmtFob(v: number): string {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function fmtKg(v: number): string {
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B kg`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M kg`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K kg`;
  return `${v.toFixed(0)} kg`;
}

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */

export default function ImportersMap() {
  useSeo({
    title: "Mapa Comercial — Comércio Global do Brasil",
description: "Visualize países, estados e cidades que mais exportam e importam com o Brasil. Dados de comércio exterior.
    keywords: "mapa comércio exterior, exportação Brasil, importação Brasil, comércio exterior, tradexa",
  });

  const { consume } = useUsage();

  // ── Period state ──
  const [period, setPeriod] = useState<{ mode: PeriodMode; year?: number; month?: number; count?: number }>({ mode: "full_year", year: 2026 });
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  // ── Tab ──
  const [tab, setTab] = useState<TabType>("export");

  // ── Data ──
  const [dataExport, setDataExport] = useState<TradeData | null>(null);
  const [dataImport, setDataImport] = useState<TradeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMap, setLoadingMap] = useState(true);
  const [error, setError] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const dataRef = useRef<TradeData | null>(null);

  // ── Map refs ──
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const resizeTimer = useRef<ReturnType<typeof setTimeout>>(null);

  // ── Fetch available years ──
  useEffect(() => {
    comexstat.getAvailableYears()
      .then((res) => {
        const years: number[] = [];
        if (res?.data) {
          const min = parseInt(res.data.min);
          const max = parseInt(res.data.max);
          for (let y = max; y >= min; y--) years.push(y);
        }
        setAvailableYears(years);
      })
      .catch(() => {});
  }, []);

  // ── Build period ──
  const periodParam = useMemo(() => {
    if (period.mode === "months") {
      const now = new Date();
      const end = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const start = new Date(now.getFullYear(), now.getMonth() - (period.count || 12) + 1, 1);
      return { from: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`, to: end };
    }
    if (period.mode === "full_year") {
      return { from: `${period.year}-01`, to: `${period.year}-12` };
    }
    return { from: `${period.year}-${String(period.month || 1).padStart(2, "0")}`, to: `${period.year}-${String(period.month || 1).padStart(2, "0")}` };
  }, [period]);

  // ── Fetch data ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const filters = undefined;

      // 1. Countries
      const countryResult = await comexstat.queryGeneral({
        flow: tab,
        monthDetail: false,
        period: periodParam,
        details: ["country"],
        metrics: ["metricFOB", "metricKG"],
        filters,
        limit: 200,
      });

      const countryRaw = countryResult?.data?.list || [];
      const totalFob = countryRaw.reduce((s: number, r: any) => s + Number(r.metricFOB || 0), 0);

      const countries: CountryTrade[] = countryRaw
        .filter((r: any) => r.country && (r.metricFOB || 0) > 0)
        .map((r: any) => ({
          country: r.country,
          countryCode: COUNTRY_TO_ISO2[r.country] || "",
          fobValue: Number(r.metricFOB) || 0,
          kgValue: Number(r.metricKG) || 0,
          share: totalFob > 0 ? Math.round((Number(r.metricFOB) / totalFob) * 1000) / 10 : 0,
        }))
        .sort((a: CountryTrade, b: CountryTrade) => b.fobValue - a.fobValue);

      // 2. States
      // Small delay between API calls to avoid rate limiting
      await new Promise(r => setTimeout(r, 600));
      const stateResult = await comexstat.queryGeneral({
        flow: tab,
        monthDetail: false,
        period: periodParam,
        details: ["state"],
        metrics: ["metricFOB", "metricKG"],
        filters,
        limit: 27,
      });

      const stateRaw = stateResult?.data?.list || [];
      const totalStateFob = stateRaw.reduce((s: number, r: any) => s + Number(r.metricFOB || 0), 0);

      const states: StateTrade[] = stateRaw
        .filter((r: any) => r.state && (r.metricFOB || 0) > 0)
        .map((r: any) => ({
          state: r.state,
          fobValue: Number(r.metricFOB) || 0,
          kgValue: Number(r.metricKG) || 0,
          share: totalStateFob > 0 ? Math.round((Number(r.metricFOB) / totalStateFob) * 1000) / 10 : 0,
        }))
        .sort((a: StateTrade, b: StateTrade) => b.fobValue - a.fobValue);

      // 3. Cities (comexstat /cities: no metricKG, heading/chapter filters only)
      const citiesFilters = filters ? (() => {
        // Convert to heading/chapter level for cities endpoint
        const f = filters[0];
        if (f.filter === "ncm" || f.filter === "subHeading") {
          return [{ filter: "heading", values: [f.values[0].substring(0, 4)] }];
        }
        return filters;
      })() : undefined;

      await new Promise(r => setTimeout(r, 600));
      const cityResult = await comexstat.queryCities({
        flow: tab,
        period: periodParam,
        details: ["city"],
        metrics: ["metricFOB"],
        filters: citiesFilters,
        limit: 100,
      });

      const cityData = cityResult?.data?.list || [];
      const cities: CityTrade[] = cityData
        .filter((r: any) => r.noMunMinsgUf && (r.metricFOB || 0) > 0)
        .map((r: any) => {
          // Parse "Cidade - UF" format
          const parts = r.noMunMinsgUf.split(" - ");
          return {
            city: parts[0] || r.noMunMinsgUf,
            uf: parts[1] || "",
            fobValue: r.metricFOB || 0,
            kgValue: r.metricKG || 0,
          };
        })
        .sort((a: CityTrade, b: CityTrade) => b.fobValue - a.fobValue);

      if (tab === "export") setDataExport({ countries, states, cities });
      else setDataImport({ countries, states, cities });
      dataRef.current = { countries, states, cities };
      consume("search");
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [periodParam, tab, consume]);

  useEffect(() => {
    // Only auto-fetch on mount or when period changes
    const hasData = tab === "export" ? dataExport !== null : dataImport !== null;
    if (!hasData) {
      fetchData();
    }
  }, [periodParam]);

  // Fetch on tab switch if no cached data for that tab
  useEffect(() => {
    const hasData = tab === "export" ? dataExport !== null : dataImport !== null;
    if (!hasData) {
      fetchData();
    }
  }, [tab]);

  // ── Init MapLibre map ──
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [-30, -15],
      zoom: 2,
      minZoom: 1.5,
      maxZoom: 8,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl(), "bottom-right");
    map.doubleClickZoom.disable();

    map.on("load", () => {
      // Add countries source from local GeoJSON
      map.addSource("countries", {
        type: "geojson",
        data: "/data/countries.geojson",
      });

      // Add fill layer (will be updated with data)
      map.addLayer({
        id: "countries-fill",
        type: "fill",
        source: "countries",
        paint: {
          "fill-color": "#e2e8f0",
          "fill-opacity": 0.85,
          "fill-outline-color": "#ffffff",
        },
      });

      // Add hover outline layer
      map.addLayer({
        id: "countries-hover",
        type: "line",
        source: "countries",
        paint: {
          "line-color": "#D80E16",
          "line-width": 2.5,
          "line-opacity": 0,
        },
      });

      // Hover effect
      let hoveredId: string | number | null = null;
      map.on("mousemove", "countries-fill", (e) => {
        if (e.features && e.features.length > 0) {
          const id = e.features[0].id || e.features[0].properties?.iso_a3 || e.features[0].properties?.iso_a2 || "";
          if (hoveredId !== id) {
            map.setPaintProperty("countries-hover", "line-opacity", 1);
            map.setFilter("countries-hover", ["==", ["get", "iso_a3"], id]);
            map.getCanvas().style.cursor = "pointer";
            hoveredId = id;
          }
        }
      });
      map.on("mouseleave", "countries-fill", () => {
        map.setPaintProperty("countries-hover", "line-opacity", 0);
        map.getCanvas().style.cursor = "";
        hoveredId = null;
      });

      // Click
      map.on("click", "countries-fill", (e) => {
        if (e.features && e.features.length > 0) {
          const props = e.features[0].properties || {};
          // Try to match by ISO2 code first (more reliable than names)
          const iso2 = props.iso_a2;
          const clickData = dataRef.current;
          if (iso2 && iso2 !== "-99" && clickData) {
            const matched = clickData.countries.find(c => c.countryCode === iso2);
            if (matched) {
              setSelectedCountry(matched.country);
              return;
            }
          }
          // Fallback: try name matching
          const name = props.name || props.sovereignt || props.ADMIN || "";
          const matched = findCountryName(name, clickData?.countries || []);
          setSelectedCountry(matched || name);
        }
      });

      setLoadingMap(false);
    });

    map.on("error", () => {
      setLoadingMap(false);
    });

    mapRef.current = map;

    // Resize handler
    const handleResize = () => {
      if (resizeTimer.current) clearTimeout(resizeTimer.current);
      resizeTimer.current = setTimeout(() => map.resize(), 300);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimer.current) clearTimeout(resizeTimer.current);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Derived data ──
  const currentData = tab === "export" ? dataExport : dataImport;
  const topCountries = currentData?.countries.slice(0, 15) || [];
  const topStates = currentData?.states.slice(0, 10) || [];
  const topCities = currentData?.cities.slice(0, 20) || [];
  const totalFobDisplay = currentData?.countries.reduce((s, c) => s + (c.fobValue || 0), 0) || 0;

  // ── Update map colors when data changes ──
  useEffect(() => {
    const map = mapRef.current;
    const d = currentData;
    if (!map || !d) return;

    const maxFob = d.countries.length > 0 ? d.countries[0].fobValue : 1;

    // Build a lookup: country name → FOB value
    const fobMap: Record<string, number> = {};
    for (const c of d.countries) {
      // Store both the original name and common aliases
      fobMap[c.country] = c.fobValue;
      fobMap[c.country.toLowerCase()] = c.fobValue;
      // Store by ISO2 if available
      if (c.countryCode) fobMap[c.countryCode] = c.fobValue;
    }

    // Use expressions for each country
    // MapLibre fill-color using match expression on iso_a3 or name
    const layer = map.getLayer("countries-fill");
    if (!layer) return;

    // We need to match country properties to our data
    // The GeoJSON has properties: name, iso_a3, iso_a2, etc.
    // We'll use a case expression to match country names
    
    // Simplify: just color all countries with a default, then use data-driven expressions
    // Build match expression for known countries using ISO2 code
    const colorExpression: any[] = ["match", ["get", "iso_a2"]];
    
    for (const c of d.countries) {
      const color = getColor(c.fobValue);
      if (c.countryCode) {
        colorExpression.push(c.countryCode, color);
      }
    }
    colorExpression.push("#e2e8f0"); // default (no data)

    map.setPaintProperty("countries-fill", "fill-color", colorExpression);
  }, [currentData]);

  // ── Find matching country name between GeoJSON and our data ──
  function findCountryName(geoName: string, countries: CountryTrade[]): string | null {
    if (!geoName) return null;
    const lower = geoName.toLowerCase();
    // Direct match
    for (const c of countries) {
      if (c.country.toLowerCase() === lower) return c.country;
    }
    // Partial match
    for (const c of countries) {
      if (lower.includes(c.country.toLowerCase().slice(0, 6)) || c.country.toLowerCase().includes(lower.slice(0, 6))) return c.country;
    }
    return null;
  }

  const selectedCountryData = useMemo(() => {
    if (!selectedCountry || !currentData) return null;
    return currentData.countries.find(c => c.country === selectedCountry) || null;
  }, [selectedCountry, currentData]);

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* ═══ HEADER ═══ */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/70 shadow-sm">
        <div className="max-w-full mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D80E16] to-[#b80c12] flex items-center justify-center shadow-md">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-800">Mapa Comercial</h1>
              <p className="text-[11px] text-slate-500">Comércio exterior do Brasil por país, estado e cidade</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab badge */}
            <Badge variant="outline" className="text-[11px] font-bold text-slate-600 border-slate-200 bg-slate-50">
              {tab === "export" ? "Exportação" : "Importação"}
            </Badge>
          </div>
        </div>
      </header>

      {/* ═══ FILTER BAR ═══ */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-full mx-auto px-4 md:px-6 py-3 flex items-center gap-3 flex-wrap">
          {/* Tab toggle */}
          <div className="flex shrink-0 bg-slate-100 rounded-lg p-0.5">
            <button onClick={() => setTab("export")}
              className={cn("flex items-center gap-1.5 text-xs font-semibold py-2 px-3.5 rounded-md transition-all whitespace-nowrap",
                tab === "export" ? "bg-white text-[#D80E16] shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}>
              <TrendingUp className="h-3.5 w-3.5" /> Exportação
            </button>
            <button onClick={() => setTab("import")}
              className={cn("flex items-center gap-1.5 text-xs font-semibold py-2 px-3.5 rounded-md transition-all whitespace-nowrap",
                tab === "import" ? "bg-white text-[#D80E16] shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}>
              <TrendingDown className="h-3.5 w-3.5" /> Importação
            </button>
          </div>

          <span className="w-px h-6 bg-slate-200 shrink-0" />

          {/* Período */}
          <div className="flex items-center gap-1.5 shrink-0">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">Ano</label>
            <div className="flex gap-1">
              {(availableYears.length > 0 ? availableYears.filter(y => y !== 2024) : [2026, 2025]).slice(0, 2).map((y) => (
                <button key={y} onClick={() => {
                  if (period.mode === "full_year" && period.year === y) {
                    setPeriod({ mode: "specific_month", year: y, month: period.month || 1 });
                  } else {
                    setPeriod({ mode: "full_year", year: y });
                  }
                }}
                  className={cn("text-[11px] font-bold py-1.5 px-2.5 rounded border transition-all",
                    (period.mode === "full_year" || period.mode === "specific_month") && period.year === y ? "bg-[#D80E16] text-white border-[#D80E16]" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  )}>{y}</button>
              ))}
            </div>
            {period.mode === "full_year" && period.year && (
              <button onClick={() => setPeriod({ mode: "specific_month", year: period.year!, month: 1 })}
                className="text-[11px] text-slate-400 hover:text-slate-600 underline whitespace-nowrap">mês</button>
            )}
            {period.mode === "specific_month" && period.year && (
              <div className="flex gap-1">
                {MONTHS_LABEL.map((m, i) => (
                  <button key={i} onClick={() => {
                    if (period.month === i + 1) setPeriod({ mode: "full_year", year: period.year! });
                    else setPeriod({ mode: "specific_month", year: period.year!, month: i + 1 });
                  }}
                    className={cn("text-[10px] font-bold py-1.5 px-2 rounded border transition-all",
                      period.month === i + 1 ? "bg-[#D80E16] text-white border-[#D80E16]" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                    )}>{m}</button>
                ))}
              </div>
            )}
          </div>

          <span className="w-px h-6 bg-slate-200 shrink-0" />

          {/* Refresh */}
          <Button onClick={fetchData} className="ml-auto flex items-center gap-2">
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
              {loading ? "Carregando..." : "Atualizar"}
            </Button>
        </div>
      </div>

      {/* ═══ CONTENT ═══ */}
      <div className="max-w-full mx-auto p-4 md:p-6 space-y-6">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-800">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">FOB Total</p>
            <p className="text-xl font-black text-slate-800 mt-1">{loading ? "..." : fmtFob(totalFobDisplay)}</p>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Países</p>
            <p className="text-xl font-black text-slate-800 mt-1">{loading ? "..." : currentData?.countries.length || 0}</p>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Principal Destino</p>
            <p className="text-xl font-black text-slate-800 mt-1 truncate">
              {loading ? "..." : topCountries[0]?.country || "—"}
            </p>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Participação</p>
            <p className="text-xl font-black text-slate-800 mt-1">
              {loading ? "..." : topCountries[0] ? `${topCountries[0].share}%` : "—"}
            </p>
          </div>
        </div>

        {/* ═══ MAP + SIDE PANEL ═══ */}
        <div className="relative rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm" style={{ height: "520px" }}>
          {/* Map */}
          <div ref={mapContainer} className="w-full h-full" />

          {loadingMap && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <Loader2 className="w-8 h-8 animate-spin text-[#D80E16]" />
              <span className="ml-3 text-sm font-medium text-slate-700">Carregando mapa...</span>
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur rounded-xl border border-slate-200 shadow-lg p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">FOB</p>
            <div className="space-y-1">
              {FOB_COLORS.map((c) => (
                <div key={c.label} className="flex items-center gap-2">
                  <div className="w-4 h-3 rounded border border-slate-200" style={{ backgroundColor: c.color }} />
                  <span className="text-[10px] text-slate-600">{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Loading overlay for data */}
          {loading && (
            <div className="absolute top-4 right-4 z-[400] bg-white/90 backdrop-blur rounded-xl border border-slate-200 shadow-lg px-4 py-2 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#D80E16]" />
              <span className="text-xs font-medium text-slate-600">Atualizando dados...</span>
            </div>
          )}

          {/* Selected country tooltip */}
          {selectedCountryData && (
            <div className="absolute top-4 left-4 z-[400] bg-white/95 backdrop-blur rounded-xl border border-slate-200 shadow-lg p-4 max-w-xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-black text-slate-800 text-sm">{selectedCountry}</h3>
                <button onClick={() => setSelectedCountry(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">FOB</span>
                  <p className="font-bold text-slate-800">{fmtFob(selectedCountryData.fobValue)}</p>
                </div>
                <div>
                  <span className="text-slate-500">Peso</span>
                  <p className="font-bold text-slate-800">{fmtKg(selectedCountryData.kgValue)}</p>
                </div>
                <div>
                  <span className="text-slate-500">Share</span>
                  <p className="font-bold text-[#D80E16]">{selectedCountryData.share}%</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ═══ TABLES ROW ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Countries */}
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-800">Top Países</h3>
              <p className="text-[11px] text-slate-500">{tab === "export" ? "Destinos da exportação" : "Origens da importação"}</p>
            </div>
            <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-sm text-slate-500">Carregando...</div>
              ) : topCountries.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">Nenhum dado disponível</div>
              ) : topCountries.map((c, i) => (
                <div key={c.country}
                  onClick={() => setSelectedCountry(c.country)}
                  className={cn("flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer",
                    selectedCountry === c.country && "bg-[#D80E16]/5"
                  )}>
                  <span className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black",
                    i === 0 ? "bg-red-100 text-red-700" : i < 3 ? "bg-orange-50 text-orange-600" : "bg-slate-100 text-slate-500"
                  )}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{c.country}</p>
                    <p className="text-[11px] text-slate-500">{c.share}% share</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-800">{fmtFob(c.fobValue)}</p>
                    <p className="text-[10px] text-slate-400">{fmtKg(c.kgValue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top States */}
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-800">Top Estados</h3>
              <p className="text-[11px] text-slate-500">UFs que mais {tab === "export" ? "exportam" : "importam"}</p>
            </div>
            <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-sm text-slate-500">Carregando...</div>
              ) : topStates.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">Nenhum dado disponível</div>
              ) : topStates.map((s, i) => (
                <div key={s.state} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-[11px] font-black">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-800">{s.state}</p>
                      <p className="text-sm font-black text-slate-800">{fmtFob(s.fobValue)}</p>
                    </div>
                    <div className="mt-1 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#D80E16] to-[#f87171] transition-all"
                        style={{ width: `${Math.min(100, s.share * 1.5)}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{s.share}% do total</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Cities */}
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-800">Top Cidades</h3>
              <p className="text-[11px] text-slate-500">Municípios que mais {tab === "export" ? "exportam" : "importam"}</p>
            </div>
            <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-sm text-slate-500">Carregando...</div>
              ) : topCities.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">Nenhum dado disponível</div>
              ) : topCities.slice(0, 15).map((c, i) => (
                <div key={`${c.city}-${c.uf}`} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-[11px] font-black">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{c.city}</p>
                    <p className="text-[11px] text-slate-500">{c.uf}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-800">{fmtFob(c.fobValue)}</p>
                    <p className="text-[10px] text-slate-400">{fmtKg(c.kgValue)}</p>
                  </div>
                </div>
              ))}
            </div>
            {topCities.length > 15 && (
              <div className="p-3 text-center text-[11px] text-slate-400 border-t border-slate-100">
                +{topCities.length - 15} cidades
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
