import { useState, useEffect, useMemo } from "react";
import {
  Calculator, Package, Ship, DollarSign, Percent,
  ArrowRight, Loader2, AlertTriangle, Sparkles,
  FileDown, Receipt, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { groqChat } from "@/services/groq";
import { useSeo } from "@/hooks/use-seo";
import { lookupCTSTariff } from "@/services/ctsTariffs";
import { ProtectedFeature } from "@/components/ProtectedFeature";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { useUsage } from "@/hooks/use-usage";
import { calculateCost } from "@/lib/usage-costs";

/* ── Country data with fees ─────────────────────────────── */
interface CountryData {
  code: string;
  name: string;
  flag: string;
  vatLookup: string | null;
  hardcodedVat?: number | null;
  // Special fees by country
  fees: {
    name: string;
    rate: number; // percentage
    appliesTo: "cif" | "cif+duty" | "fob";
    description: string;
  }[];
  notes: string | null;
}

const COUNTRIES: CountryData[] = [
  // Principais parceiros comerciais do Brasil
  { code: "BRA", name: "Brasil", flag: "🇧🇷", vatLookup: "Brazil", fees: [], notes: "Origem — sem taxas de importação no destino." },
  {
    code: "USA", name: "EUA", flag: "🇺🇸", vatLookup: "USA",
    fees: [
      { name: "Section 122 (tarifa adicional)", rate: 10, appliesTo: "cif", description: "Tarifa adicional universal de 10% para todos os produtos" },
      { name: "MPF (Merchandise Processing Fee)", rate: 0.3464, appliesTo: "cif", description: "Taxa de processamento aduaneiro EUA" },
    ],
    notes: "EUA não possui VAT federal, mas cobra tarifa adicional de 10% (Section 122) + MPF de 0,3464% sobre CIF.",
  },
  { code: "CHN", name: "China", flag: "🇨🇳", vatLookup: "China", fees: [], notes: null },
  { code: "ARG", name: "Argentina", flag: "🇦🇷", vatLookup: "Argentina", fees: [], notes: null },
  { code: "URY", name: "Uruguai", flag: "🇺🇾", vatLookup: "Uruguay", fees: [], notes: null },
  { code: "CHL", name: "Chile", flag: "🇨🇱", vatLookup: "Chile", fees: [], notes: null },
  { code: "COL", name: "Colômbia", flag: "🇨🇴", vatLookup: "Colombia", fees: [], notes: null },
  { code: "PER", name: "Peru", flag: "🇵🇪", vatLookup: "Peru", fees: [], notes: null },
  { code: "MEX", name: "México", flag: "🇲🇽", vatLookup: "Mexico", fees: [], notes: null },
  { code: "GBR", name: "Reino Unido", flag: "🇬🇧", vatLookup: "United Kingdom", fees: [], notes: null },
  // Europa (VAT hardcoded — não constam no JSON do Supabase)
  { code: "DEU", name: "Alemanha", flag: "🇩🇪", vatLookup: null, hardcodedVat: 19, fees: [], notes: "VAT: 19% (dados hardcoded)." },
  { code: "FRA", name: "França", flag: "🇫🇷", vatLookup: null, hardcodedVat: 20, fees: [], notes: "VAT: 20% (dados hardcoded)." },
  { code: "ITA", name: "Itália", flag: "🇮🇹", vatLookup: null, hardcodedVat: 22, fees: [], notes: "VAT: 22% (dados hardcoded)." },
  { code: "ESP", name: "Espanha", flag: "🇪🇸", vatLookup: null, hardcodedVat: 21, fees: [], notes: "VAT: 21% (dados hardcoded)." },
  { code: "NLD", name: "Holanda", flag: "🇳🇱", vatLookup: null, hardcodedVat: 21, fees: [], notes: "VAT: 21% (dados hardcoded)." },
  // Ásia-Pacífico
  { code: "JPN", name: "Japão", flag: "🇯🇵", vatLookup: "Japan", fees: [], notes: null },
  { code: "KOR", name: "Coreia do Sul", flag: "🇰🇷", vatLookup: "South Korea", fees: [], notes: null },
  { code: "IND", name: "Índia", flag: "🇮🇳", vatLookup: "India", fees: [], notes: null },
  { code: "IDN", name: "Indonésia", flag: "🇮🇩", vatLookup: "Indonesia", fees: [], notes: null },
  { code: "AUS", name: "Austrália", flag: "🇦🇺", vatLookup: "Australia", fees: [], notes: null },
  { code: "NZL", name: "Nova Zelândia", flag: "🇳🇿", vatLookup: "New Zealand", fees: [], notes: null },
  { code: "SGP", name: "Singapura", flag: "🇸🇬", vatLookup: "Singapore", fees: [], notes: null },
  { code: "MYS", name: "Malásia", flag: "🇲🇾", vatLookup: "Malaysia", fees: [], notes: null },
  { code: "PHL", name: "Filipinas", flag: "🇵🇭", vatLookup: "Philippines", fees: [], notes: null },
  { code: "THA", name: "Tailândia", flag: "🇹🇭", vatLookup: "Thailand", fees: [], notes: null },
  { code: "VNM", name: "Vietnã", flag: "🇻🇳", vatLookup: "Vietnam", fees: [], notes: null },
  { code: "TWN", name: "Taiwan", flag: "🇹🇼", vatLookup: "Taiwan", fees: [], notes: null },
  { code: "ISR", name: "Israel", flag: "🇮🇱", vatLookup: "Israel", fees: [], notes: null },
  { code: "ARE", name: "Emirados Árabes Unidos", flag: "🇦🇪", vatLookup: "UAE", fees: [], notes: null },
  { code: "SAU", name: "Arábia Saudita", flag: "🇸🇦", vatLookup: "Saudi Arabia", fees: [], notes: null },
  { code: "BHR", name: "Barein", flag: "🇧🇭", vatLookup: "Bahrain", fees: [], notes: null },
  { code: "KAZ", name: "Cazaquistão", flag: "🇰🇿", vatLookup: "Kazakhstan", fees: [], notes: null },
  { code: "ARM", name: "Armênia", flag: "🇦🇲", vatLookup: "Armenia", fees: [], notes: null },
  { code: "AZE", name: "Azerbaijão", flag: "🇦🇿", vatLookup: "Azerbaijan", fees: [], notes: null },
  { code: "GEO", name: "Geórgia", flag: "🇬🇪", vatLookup: "Georgia", fees: [], notes: null },
  { code: "LAO", name: "Laos", flag: "🇱🇦", vatLookup: "Laos", fees: [], notes: null },
  // Américas
  { code: "CAN", name: "Canadá", flag: "🇨🇦", vatLookup: "Canada", fees: [], notes: null },
  { code: "BOL", name: "Bolívia", flag: "🇧🇴", vatLookup: "Bolivia", fees: [], notes: null },
  { code: "PRY", name: "Paraguai", flag: "🇵🇾", vatLookup: null, hardcodedVat: 10, fees: [], notes: "IVA: 10% (Impuesto al Valor Agregado) — dados hardcoded." },
  { code: "VEN", name: "Venezuela", flag: "🇻🇪", vatLookup: "Venezuela", fees: [], notes: null },
  { code: "ECU", name: "Equador", flag: "🇪🇨", vatLookup: "Ecuador", fees: [], notes: null },
  { code: "PAN", name: "Panamá", flag: "🇵🇦", vatLookup: "Panama", fees: [], notes: null },
  { code: "GTM", name: "Guatemala", flag: "🇬🇹", vatLookup: "Guatemala", fees: [], notes: null },
  { code: "SLV", name: "El Salvador", flag: "🇸🇻", vatLookup: "El Salvador", fees: [], notes: null },
  { code: "CRI", name: "Costa Rica", flag: "🇨🇷", vatLookup: "Costa Rica", fees: [], notes: null },
  // Europa (do JSON)
  { code: "BGR", name: "Bulgária", flag: "🇧🇬", vatLookup: "Bulgaria", fees: [], notes: null },
  { code: "UKR", name: "Ucrânia", flag: "🇺🇦", vatLookup: "Ukraine", fees: [], notes: null },
  { code: "RUS", name: "Rússia", flag: "🇷🇺", vatLookup: "Russia", fees: [], notes: null },
  { code: "TUR", name: "Turquia", flag: "🇹🇷", vatLookup: "Turkey", fees: [], notes: null },
  { code: "AND", name: "Andorra", flag: "🇦🇩", vatLookup: "Andorra", fees: [], notes: null },
  { code: "IMN", name: "Ilha de Man", flag: "🇮🇲", vatLookup: "Isle of Man", fees: [], notes: null },
  { code: "JEY", name: "Jersey", flag: "🇯🇪", vatLookup: "Jersey", fees: [], notes: null },
  { code: "FRO", name: "Ilhas Faroé", flag: "🇫🇴", vatLookup: "Faroe Islands", fees: [], notes: null },
  // África e Oriente Médio
  { code: "ZAF", name: "África do Sul", flag: "🇿🇦", vatLookup: "South Africa", fees: [], notes: null },
  { code: "EGY", name: "Egito", flag: "🇪🇬", vatLookup: "Egypt", fees: [], notes: null },
  { code: "MAR", name: "Marrocos", flag: "🇲🇦", vatLookup: "Morocco", fees: [], notes: null },
  { code: "NGA", name: "Nigéria", flag: "🇳🇬", vatLookup: "Nigeria", fees: [], notes: null },
  { code: "DZA", name: "Argélia", flag: "🇩🇿", vatLookup: "Algeria", fees: [], notes: null },
  { code: "TUN", name: "Tunísia", flag: "🇹🇳", vatLookup: "Tunisia", fees: [], notes: null },
  { code: "GHA", name: "Gana", flag: "🇬🇭", vatLookup: "Ghana", fees: [], notes: null },
  { code: "ETH", name: "Etiópia", flag: "🇪🇹", vatLookup: "Ethiopia", fees: [], notes: null },
  { code: "UGA", name: "Uganda", flag: "🇺🇬", vatLookup: "Uganda", fees: [], notes: null },
  { code: "TZA", name: "Tanzânia", flag: "🇹🇿", vatLookup: "Tanzania", fees: [], notes: null },
  { code: "BWA", name: "Botsuana", flag: "🇧🇼", vatLookup: "Botswana", fees: [], notes: null },
  { code: "MUS", name: "Maurício", flag: "🇲🇺", vatLookup: "Mauritius", fees: [], notes: null },
  { code: "MRT", name: "Mauritânia", flag: "🇲🇷", vatLookup: "Mauritania", fees: [], notes: null },
  { code: "OMN", name: "Omã", flag: "🇴🇲", vatLookup: "Oman", fees: [], notes: null },
  // Outros
  { code: "PAK", name: "Paquistão", flag: "🇵🇰", vatLookup: "Pakistan", fees: [], notes: null },
  { code: "BGD", name: "Bangladesh", flag: "🇧🇩", vatLookup: "Bangladesh", fees: [], notes: null },
  { code: "LKA", name: "Sri Lanka", flag: "🇱🇰", vatLookup: "Sri Lanka", fees: [], notes: null },
  { code: "LBN", name: "Líbano", flag: "🇱🇧", vatLookup: "Lebanon", fees: [], notes: null },
  { code: "TJK", name: "Tajiquistão", flag: "🇹🇯", vatLookup: "Tajikistan", fees: [], notes: null },
  { code: "UZB", name: "Uzbequistão", flag: "🇺🇿", vatLookup: "Uzbekistan", fees: [], notes: null },
  { code: "BRB", name: "Barbados", flag: "🇧🇧", vatLookup: "Barbados", fees: [], notes: null },
  { code: "BHS", name: "Bahamas", flag: "🇧🇸", vatLookup: "Bahamas", fees: [], notes: null },
  { code: "ABW", name: "Aruba", flag: "🇦🇼", vatLookup: "Aruba", fees: [], notes: null },
  { code: "CUW", name: "Curaçao", flag: "🇨🇼", vatLookup: "Curaçao", fees: [], notes: null },
  { code: "COK", name: "Ilhas Cook", flag: "🇨🇰", vatLookup: "Cook Islands", fees: [], notes: null },
  { code: "FJI", name: "Fiji", flag: "🇫🇯", vatLookup: "Fiji", fees: [], notes: null },
  { code: "VUT", name: "Vanuatu", flag: "🇻🇺", vatLookup: "Vanuatu", fees: [], notes: null },
  { code: "WSM", name: "Samoa", flag: "🇼🇸", vatLookup: "Samoa", fees: [], notes: null },
  { code: "LBR", name: "Libéria", flag: "🇱🇷", vatLookup: "Liberia", fees: [], notes: null },
  { code: "GNQ", name: "Guiné Equatorial", flag: "🇬🇶", vatLookup: "Equatorial Guinea", fees: [], notes: null },
  { code: "PRI", name: "Porto Rico", flag: "🇵🇷", vatLookup: "Puerto Rico", fees: [], notes: null },
  { code: "BLZ", name: "Belize", flag: "🇧🇿", vatLookup: "Belize", fees: [], notes: null },
  { code: "ATG", name: "Antígua e Barbuda", flag: "🇦🇬", vatLookup: "Antigua & Barbuda", fees: [], notes: null },
];

const COUNTRY_MAP: Record<string, string> = {
  "BRA": "Brazil", "USA": "United States of America", "CHN": "China",
  "ARG": "Argentina", "URY": "Uruguay", "PRY": "Paraguay",
  "CHL": "Chile", "COL": "Colombia", "PER": "Peru", "MEX": "Mexico",
  "GBR": "United Kingdom", "DEU": "Germany", "FRA": "France",
  "ITA": "Italy", "ESP": "Spain", "NLD": "Netherlands",
  "JPN": "Japan", "KOR": "South Korea", "IND": "India",
  "IDN": "Indonesia", "AUS": "Australia", "NZL": "New Zealand",
  "SGP": "Singapore", "MYS": "Malaysia", "PHL": "Philippines",
  "THA": "Thailand", "VNM": "Vietnam", "TWN": "Taiwan",
  "ISR": "Israel", "ARE": "United Arab Emirates", "SAU": "Saudi Arabia",
  "BHR": "Bahrain", "KAZ": "Kazakhstan", "ARM": "Armenia",
  "AZE": "Azerbaijan", "GEO": "Georgia", "LAO": "Laos",
  "CAN": "Canada", "BOL": "Bolivia", "VEN": "Venezuela",
  "ECU": "Ecuador", "PAN": "Panama", "GTM": "Guatemala",
  "SLV": "El Salvador", "CRI": "Costa Rica", "BGR": "Bulgaria",
  "UKR": "Ukraine", "RUS": "Russian Federation", "TUR": "Türkiye",
  "AND": "Andorra", "IMN": "Isle of Man", "JEY": "Jersey",
  "FRO": "Faroe Islands", "ZAF": "South Africa", "EGY": "Egypt",
  "MAR": "Morocco", "NGA": "Nigeria", "DZA": "Algeria",
  "TUN": "Tunisia", "GHA": "Ghana", "ETH": "Ethiopia",
  "UGA": "Uganda", "TZA": "Tanzania", "BWA": "Botswana",
  "MUS": "Mauritius", "MRT": "Mauritania", "OMN": "Oman",
  "PAK": "Pakistan", "BGD": "Bangladesh", "LKA": "Sri Lanka",
  "LBN": "Lebanon", "TJK": "Tajikistan", "UZB": "Uzbekistan",
  "BRB": "Barbados", "BHS": "Bahamas", "ABW": "Aruba",
  "CUW": "Curaçao", "COK": "Cook Islands", "FJI": "Fiji",
  "VUT": "Vanuatu", "WSM": "Samoa", "LBR": "Liberia",
  "GNQ": "Equatorial Guinea", "PRI": "Puerto Rico", "BLZ": "Belize",
  "ATG": "Antigua & Barbuda",
};

// CTS data names for tariff lookup (WTO official data)
const CTS_COUNTRY_MAP: Record<string, string> = {
  "USA": "United States of America", "CHN": "China", "JPN": "Japan",
  "KOR": "South Korea", "IND": "India", "AUS": "Australia",
  "ARG": "Argentina", "CHL": "Chile", "COL": "Colombia",
  "PER": "Peru", "MEX": "Mexico", "URY": "Uruguay",
  "PRY": "Paraguay", "CAN": "Canada", "BOL": "Bolivia",
  "ECU": "Ecuador", "PAN": "Panama", "CRI": "Costa Rica",
  "ZAF": "South Africa", "EGY": "Egypt", "ISR": "Israel",
  "THA": "Thailand", "TUR": "Türkiye", "ARE": "United Arab Emirates",
  "RUS": "Russian Federation", "GBR": "United Kingdom",
  "DEU": "European Union", "FRA": "European Union", "ITA": "European Union",
  "ESP": "European Union", "NLD": "European Union",
  "CHE": "Switzerland", "NOR": "Norway", "HKG": "Hong Kong, China",
};

interface VatEntry {
  Country: string;
  Region: string;
  "Tax Type": string;
  "Has VAT/GST": string;
  "Standard Rate (%)": number | string;
  "Reduced Rates (%)": string;
  Notes: string | null;
}

interface CostLine {
  label: string;
  value: number;
  isSubtotal?: boolean;
  isTotal?: boolean;
  color: string;
  note?: string | null;
  rate?: number | null;
}

interface SimResult {
  lines: CostLine[];
  totalCost: number;
  totalMarkup: number;
  dataSource: string;
  destNotes: string | null;
}

/* ── Component ── */
export default function ExportSimulator() {
  useSeo({
    title: "Simulador de Exportação — Custos e Viabilidade",
    description: "Simule custos de exportação incluindo frete, seguro, impostos e taxas portuárias. Analise a viabilidade financeira de exportar seus produtos.",
    keywords: "simulador exportação, custo exportação, viabilidade exportação",
  });

  const [step, setStep] = useState(1);
  const [vatRates, setVatRates] = useState<VatEntry[]>([]);

  // Step 1: Product
  const [productQuery, setProductQuery] = useState("");
  const [classifying, setClassifying] = useState(false);
  const [hsCode, setHsCode] = useState("");
  const [hsDesc, setHsDesc] = useState("");
  const [classifyError, setClassifyError] = useState("");

  // Step 2: Shipping
  const [origin, setOrigin] = useState("BRA");
  const [destination, setDestination] = useState("USA");
  const [fobValue, setFobValue] = useState("10000");
  const [containerType, setContainerType] = useState("20ft");
  const [freightEstimate, setFreightEstimate] = useState("");

  // Step 3: Results
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<SimResult | null>(null);
  const [calcError, setCalcError] = useState("");

  const { consume, plan } = useUsage();
  const { canAccess } = useFeatureAccess("export_simulator");

  const originCountry = COUNTRIES.find(c => c.code === origin);
  const destCountry = COUNTRIES.find(c => c.code === destination);

  /* ── Load VAT rates ── */
  useEffect(() => {
    fetch("https://ocivkbocmywinwqmaqac.supabase.co/storage/v1/object/public/trade-data/world_vat_rates.json")
      .then(r => r.json())
      .then((data: VatEntry[]) => setVatRates(Array.isArray(data) ? data : []))
      .catch(() => setVatRates([]));
  }, []);

  const getVatForDestination = (destCode: string): { rate: number | null; note: string | null } => {
    const country = COUNTRIES.find(c => c.code === destCode);
    if (!country || !country.vatLookup) {
      return { rate: null, note: country?.notes || "Dados de imposto não disponíveis no banco." };
    }

    const entry = vatRates.find(v => v.Country?.toLowerCase() === country.vatLookup?.toLowerCase());
    if (!entry) {
      return { rate: null, note: "Dados de imposto não disponíveis no banco." };
    }

    const rawRate = entry["Standard Rate (%)"];
    if (rawRate === "N/A" || rawRate === undefined || rawRate === null) {
      return { rate: null, note: entry.Notes || "Sem imposto indireto federal." };
    }

    const rate = typeof rawRate === "number" ? rawRate : parseFloat(String(rawRate));
    if (isNaN(rate) || rate <= 0) {
      return { rate: null, note: entry.Notes || "Sem imposto indireto federal." };
    }

    return { rate, note: entry.Notes || null };
  };

  const handleClassify = async () => {
    if (!productQuery.trim()) return;
    setClassifying(true);
    setClassifyError("");
    try {
      const response = await groqChat([
        { role: "system", content: "Classificador HS. Retorne APENAS JSON: {\"hs\":\"XXXX.XX\",\"desc\":\"breve descrição\",\"confidence\":0.XX}" },
        { role: "user", content: `Classifique o produto: "${productQuery}". Retorne HS de 6 dígitos.` },
      ], { temperature: 0.1, max_tokens: 150 });
      const clean = response.replace(/```json|```/g, "").trim();
      const guess = JSON.parse(clean);
      setHsCode(guess.hs || "");
      setHsDesc(guess.desc || "");
      if (guess.confidence && guess.confidence < 0.5) {
        setClassifyError("Classificação com baixa confiança. Verifique o código HS.");
      }
    } catch {
      setClassifyError("Erro ao classificar produto. Tente novamente.");
    }
    setClassifying(false);
  };

  const handleCalculate = async () => {
    if (canAccess) {
      const cost = 1;
      const consumed = await consume("simulator_run");
      if (!consumed) {
        setCalcError("Limite de simulações do plano atingido. Faça upgrade para continuar.");
        return;
      }
    }

    setCalculating(true);
    setCalcError("");

    const fob = parseFloat(fobValue) || 0;
    const freight = parseFloat(freightEstimate) || fob * 0.08;
    const insurance = fob * 0.0015;
    const cif = fob + freight + insurance;

    const destName = COUNTRY_MAP[destination] || destination;
    const destCountry = COUNTRIES.find(c => c.code === destination);

    // Fetch tariff from CTS data (WTO official)
    let tariffRate = 0;
    let dataSource = "estimativa";
    const ctsName = CTS_COUNTRY_MAP[destination];
    if (ctsName) {
      try {
        const hsPrefix = hsCode.replace(".", "").substring(0, 4);
        const { rate, hasData } = await lookupCTSTariff(ctsName, hsPrefix);
        if (hasData) {
          tariffRate = rate;
          dataSource = "alíquota OMC";
        }
      } catch {}
    }

    // Build cost lines
    const lines: CostLine[] = [];

    // 1. FOB
    lines.push({ label: "Valor FOB", value: fob, color: "bg-slate-300" });

    // 2. Freight
    lines.push({ label: "Frete Internacional", value: freight, color: "bg-blue-300", note: freight === fob * 0.08 ? "Estimado 8% do FOB" : null });

    // 3. Insurance
    lines.push({ label: "Seguro Internacional", value: insurance, color: "bg-amber-300", rate: 0.15, note: "0.15% do FOB" });

    // 4. CIF subtotal
    lines.push({ label: "Valor CIF", value: cif, isSubtotal: true, color: "bg-slate-400" });

    let runningBase = cif;

    // 5. Tariff
    const tariffAmount = cif * (tariffRate / 100);
    if (tariffRate > 0) {
      lines.push({ label: `Alíquota (${tariffRate.toFixed(1)}%)`, value: tariffAmount, color: "bg-red-300", rate: tariffRate, note: dataSource });
      runningBase += tariffAmount;
    }

    // 6. Country-specific fees
    if (destCountry && destCountry.fees.length > 0) {
      for (const fee of destCountry.fees) {
        if (fee.rate > 0) {
          const base = fee.appliesTo === "cif+duty" ? runningBase : cif;
          const feeAmount = base * (fee.rate / 100);
          lines.push({
            label: `${fee.name} (${fee.rate.toFixed(fee.rate < 1 ? 2 : 0)}%)`,
            value: feeAmount,
            color: "bg-orange-300",
            rate: fee.rate,
            note: fee.description,
          });
          runningBase += feeAmount;
        }
      }
    }

    // 7. VAT
    const vatInfo = getVatForDestination(destination);
    const vatRate = vatInfo.rate;
    let vatAmount = 0;
    if (vatRate && vatRate > 0) {
      vatAmount = runningBase * (vatRate / 100);
      lines.push({ label: `VAT / IVA (${vatRate}%)`, value: vatAmount, color: "bg-purple-300", rate: vatRate, note: vatInfo.note });
    } else if (destination === "USA") {
      // USA: no VAT, but show note
      lines.push({ label: "VAT / IVA", value: 0, color: "bg-purple-200", note: vatInfo.note || "EUA não possui VAT federal" });
    } else {
      lines.push({ label: "VAT / IVA", value: 0, color: "bg-purple-200", note: vatInfo.note || "Dados indisponíveis" });
    }

    const totalCost = runningBase + vatAmount;
    const totalMarkup = ((totalCost - fob) / fob) * 100;

    lines.push({ label: "CUSTO TOTAL ESTIMADO", value: totalCost, isTotal: true, color: "bg-green-500" });

    setResult({
      lines,
      totalCost,
      totalMarkup,
      dataSource,
      destNotes: destCountry?.notes || null,
    });

    setCalculating(false);
    setStep(3);
  };

  return (
    <ProtectedFeature featureKey="export_simulator">
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Steps */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all",
              step === s ? "bg-[#D80E16] text-white shadow-md" :
              step > s ? "bg-green-500 text-white" :
              "bg-slate-100 text-slate-600",
            )}>
              {step > s ? "✓" : s}
            </div>
            {s < 3 && <div className={cn("h-0.5 w-8", step > s ? "bg-green-500" : "bg-slate-200")} />}
          </div>
        ))}
        <span className="ml-2 text-xs font-bold text-slate-600">
          {step === 1 ? "Produto" : step === 2 ? "Logística" : "Resultado"}
        </span>
      </div>

      {/* ── Step 1 ── */}
      {step === 1 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#D80E16]" />
            Qual produto você quer exportar?
          </h2>
          <div className="flex gap-3">
            <input
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleClassify()}
              placeholder='Ex: "café verde em grãos", "calçados de couro"...'
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium
                         focus:outline-none focus:ring-2 focus:ring-[#D80E16]/20 focus:border-[#D80E16]"
            />
            <button
              onClick={handleClassify}
              disabled={classifying || !productQuery.trim()}
              className="px-5 py-3 rounded-xl bg-[#D80E16] text-white font-bold text-sm
                         hover:bg-[#b80c12] disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {classifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Classificar
            </button>
          </div>

          {classifyError && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-sm text-amber-800">
              <AlertTriangle className="w-4 h-4" /> {classifyError}
            </div>
          )}

          {hsCode && (
            <div className="p-4 rounded-xl bg-green-50 border border-green-200 space-y-2">
              <p className="text-xs font-bold text-green-700 uppercase">Produto Classificado</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-green-800">HS {hsCode}</span>
                <span className="text-sm text-green-700">{hsDesc}</span>
              </div>
              <button
                onClick={() => { setStep(2); setClassifyError(""); }}
                className="mt-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-all flex items-center gap-2"
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Step 2 ── */}
      {step === 2 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
              <Ship className="w-5 h-5 text-[#D80E16]" />
              Detalhes da Exportação
            </h2>
            <button onClick={() => setStep(1)} className="text-xs font-medium text-slate-600 hover:text-[#D80E16]">← Voltar</button>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <Package className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-bold text-slate-700">HS {hsCode}</span>
            <span className="text-xs text-slate-600">{hsDesc}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Origem</label>
              <select value={origin} onChange={(e) => setOrigin(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold bg-white">
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Destino</label>
              <select value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold bg-white">
                {COUNTRIES.filter(c => c.code !== origin).map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Valor FOB (USD)</label>
            <input type="number" value={fobValue} onChange={(e) => setFobValue(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#D80E16]/20 focus:border-[#D80E16]" placeholder="10000" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Container</label>
            <div className="flex gap-2">
              {["20ft", "40ft", "LCL"].map((t) => (
                <button key={t} onClick={() => setContainerType(t)}
                  className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", containerType === t ? "bg-[#D80E16] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Estimativa de Frete (USD) — opcional</label>
            <input type="number" value={freightEstimate} onChange={(e) => setFreightEstimate(e.target.value)}
              placeholder="Deixe em branco para estimar 8% do FOB"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D80E16]/20 focus:border-[#D80E16]" />
            <p className="text-[10px] text-slate-600 mt-1">Se não informado, usaremos 8% do FOB como estimativa.</p>
          </div>

          {calcError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-800">
              <AlertTriangle className="w-4 h-4" /> {calcError}
            </div>
          )}

          <button onClick={handleCalculate} disabled={calculating || !fobValue}
            className="w-full py-3 rounded-xl bg-[#D80E16] text-white font-bold text-sm hover:bg-[#b80c12] disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {calculating ? <><Loader2 className="w-4 h-4 animate-spin" /> Calculando...</> : <><Calculator className="w-4 h-4" /> Calcular Custo Total</>}
          </button>
        </div>
      )}

      {/* ── Step 3: Results ── */}
      {step === 3 && result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-green-600" />
              Resultado da Simulação
            </h2>
            <button onClick={() => setStep(2)} className="text-xs font-medium text-slate-600 hover:text-[#D80E16]">← Ajustar</button>
          </div>

          {/* Route header */}
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 text-center">
            <p className="text-sm font-black text-slate-800">
              {originCountry?.flag} {originCountry?.name} → {destCountry?.flag} {destCountry?.name}
            </p>
            <p className="text-xs text-slate-600 mt-1">HS {hsCode} — {hsDesc}</p>
          </div>

          {/* Cost breakdown - Receipt style */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Detalhamento de Custos</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {result.lines.map((line, i) => (
                <div key={i} className={cn(
                  "px-5 py-3 flex items-center gap-3",
                  line.isTotal && "bg-green-50 border-t-2 border-green-200",
                  line.isSubtotal && "bg-slate-50 font-bold"
                )}>
                  <div className={cn("w-3 h-3 rounded-full shrink-0", line.color)} />
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm", line.isTotal ? "font-black text-slate-900" : line.isSubtotal ? "font-bold text-slate-800" : "text-slate-700")}>
                      {line.label}
                    </p>
                    {line.note && (
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{line.note}</p>
                    )}
                  </div>
                  <span className={cn("text-sm whitespace-nowrap", line.isTotal ? "font-black text-green-700 text-lg" : line.isSubtotal ? "font-bold text-slate-900" : "font-bold text-slate-700")}>
                    USD {line.value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
              <p className="text-[11px] text-slate-600 uppercase font-bold">Markup sobre FOB</p>
              <p className={cn(
                "text-3xl font-black mt-1",
                result.totalMarkup > 30 ? "text-red-600" : result.totalMarkup > 15 ? "text-amber-600" : "text-green-600"
              )}>
                +{result.totalMarkup.toFixed(1)}%
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
              <p className="text-[11px] text-slate-600 uppercase font-bold">Custo Total</p>
              <p className="text-3xl font-black text-slate-900 mt-1">
                USD {result.totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Destination notes */}
          {result.destNotes && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">{result.destNotes}</p>
            </div>
          )}

          {/* Data source */}
          <p className="text-[10px] text-slate-500 text-center">
            Fonte tarifas: {result.dataSource} · Frete: estimativa · Dados reais de APIs oficiais
          </p>

          {/* Actions */}
          <button
            onClick={() => { setStep(1); setHsCode(""); setHsDesc(""); setProductQuery(""); setResult(null); setCalcError(""); }}
            className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-600 font-bold text-sm hover:border-[#D80E16] hover:text-[#D80E16] transition-all"
          >
            + Nova Simulação
          </button>
        </div>
      )}
    </div>
    </ProtectedFeature>
  );
}
