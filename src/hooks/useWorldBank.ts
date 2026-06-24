import { useState, useEffect } from "react";
import { worldbank, extractIndicatorValue } from "@/services/worldbank";

// Mapeamento de nomes portugueses para ISO2
const ISO2_MAP: Record<string, string> = {
  "Estados Unidos": "US", "Alemanha": "DE", "França": "FR", "Japão": "JP",
  "China": "CN", "Reino Unido": "GB", "Itália": "IT", "Espanha": "ES",
  "Portugal": "PT", "Argentina": "AR", "México": "MX", "Chile": "CL",
  "Colômbia": "CO", "Coreia do Sul": "KR", "Índia": "IN", "Paquistão": "PK",
  "Bangladesh": "BD", "Vietnã": "VN", "Indonésia": "ID", "Tailândia": "TH",
  "Turquia": "TR", "Rússia": "RU", "África do Sul": "ZA", "Arábia Saudita": "SA",
  "Emirados Árabes Unidos": "AE", "Israel": "IL", "Austrália": "AU", "Canadá": "CA",
  "Suíça": "CH", "Suécia": "SE", "Bélgica": "BE", "Países Baixos": "NL",
  "Áustria": "AT", "Polônia": "PL", "Noruega": "NO", "Dinamarca": "DK",
  "Finlândia": "FI", "Irlanda": "IE", "Nova Zelândia": "NZ", "Cingapura": "SG",
  "Malásia": "MY", "Brasil": "BR",
};

interface WorldBankIndicators {
  gdp: number | null;
  gdpPerCapita: number | null;
  imports: number | null;
  loading: boolean;
}

export function useWorldBank(countryNamePt: string | null): WorldBankIndicators {
  const [indicators, setIndicators] = useState<WorldBankIndicators>({
    gdp: null, gdpPerCapita: null, imports: null, loading: false,
  });

  useEffect(() => {
    if (!countryNamePt) return;
    const iso2 = ISO2_MAP[countryNamePt];
    if (!iso2) return;

    let cancelled = false;
    setIndicators((prev) => ({ ...prev, loading: true }));

    Promise.all([
      worldbank.getGDP(iso2),
      worldbank.getGDPPerCapita(iso2),
      worldbank.getImports(iso2),
    ]).then(([gdpData, gdpPcData, importsData]) => {
      if (cancelled) return;
      setIndicators({
        gdp: extractIndicatorValue(gdpData),
        gdpPerCapita: extractIndicatorValue(gdpPcData),
        imports: extractIndicatorValue(importsData),
        loading: false,
      });
    }).catch(() => {
      if (!cancelled) setIndicators((prev) => ({ ...prev, loading: false }));
    });

    return () => { cancelled = true; };
  }, [countryNamePt]);

  return indicators;
}
