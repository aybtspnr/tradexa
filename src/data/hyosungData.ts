// Dados REAIS — COMEXSTAT IMP 2026 (Jan-Mai)
// FOB + VL_FRETE + VL_SEGURO = CIF

export interface MonthlyData { month: number; fob: number; cif: number; kg: number; avgPriceKg: number; }
export interface YearData { year: string; totalFob: number; totalCif: number; totalKg: number; avgPriceKg: number; monthly: MonthlyData[]; countries: CountryData[]; states: StateData[]; }
export interface CountryData { country: string; fob: number; cif: number; kg: number; avgPriceKg: number; share: number; }
export interface StateData { state: string; fob: number; cif: number; kg: number; avgPriceKg: number; }
export interface NcmData { ncm: string; description: string; years: Record<string, YearData>; }

export const YEARS = ["2025", "2026"] as const;
export const NCM_LIST = ["54024520", "54024400", "54023119", "54041100"] as const;
export const HYOSUNG_PASSWORD = "2405";

// NCM 54024520 — Fios de náilon ou poliamidas (67 decitex)
// 2026 REAL: FOB=23,007,193, CIF=23,527,364, KG=6,591,749

const data_54024520_2025 = {
  year: "2025", totalFob: 23007193, totalCif: 23527364, totalKg: 6591749, avgPriceKg: 3.49,
  monthly: [
    // 2025 — placeholder (buscar IMP_2025.csv)
    { month: 1, fob: 4601439, cif: 4705473, kg: 1318350, avgPriceKg: 3.49 },
  ],
  countries: [],
  states: [],
};

const data_54024520_2026 = {
  year: "2026", totalFob: 23007193, totalCif: 23527364, totalKg: 6591749, avgPriceKg: 3.49,
  monthly: [
          { month: 1, fob: 4302236, cif: 4404986, kg: 1290379, avgPriceKg: 3.33 },
          { month: 2, fob: 4914956, cif: 5013434, kg: 1405029, avgPriceKg: 3.50 },
          { month: 3, fob: 3609568, cif: 3667283, kg: 993305, avgPriceKg: 3.63 },
          { month: 4, fob: 5660277, cif: 5759054, kg: 1520934, avgPriceKg: 3.72 },
          { month: 5, fob: 4520156, cif: 4682607, kg: 1382102, avgPriceKg: 3.27 },
  ],
  countries: [
          { country: "Israel", fob: 13649483, cif: 13707649, kg: 2482551, avgPriceKg: 5.50, share: 58.3 },
          { country: "Vietnã", fob: 5492928, cif: 5773269, kg: 2383596, avgPriceKg: 2.30, share: 24.5 },
          { country: "China", fob: 2129602, cif: 2230100, kg: 1008941, avgPriceKg: 2.11, share: 9.5 },
          { country: "Indonésia", fob: 618694, cif: 648821, kg: 269436, avgPriceKg: 2.30, share: 2.8 },
          { country: "Taiwan", fob: 553014, cif: 579488, kg: 245159, avgPriceKg: 2.26, share: 2.5 },
          { country: "EUA", fob: 334735, cif: 350511, kg: 148839, avgPriceKg: 2.25, share: 1.5 },
          { country: "Índia", fob: 118287, cif: 126221, kg: 48267, avgPriceKg: 2.45, share: 0.5 },
          { country: "Coreia do Sul", fob: 98581, cif: 98997, kg: 1966, avgPriceKg: 50.14, share: 0.4 },
          { country: "Países Baixos", fob: 11869, cif: 12308, kg: 2994, avgPriceKg: 3.96, share: 0.1 },
  ],
  states: [
          { state: "São Paulo", fob: 16385596, cif: 16639844, kg: 4094870, avgPriceKg: 4.00 },
          { state: "Santa Catarina", fob: 4013253, cif: 4205556, kg: 1833032, avgPriceKg: 2.19 },
          { state: "Minas Gerais", fob: 1991312, cif: 2005997, kg: 384997, avgPriceKg: 5.17 },
          { state: "Paraíba", fob: 315222, cif: 351308, kg: 142651, avgPriceKg: 2.21 },
          { state: "Ceará", fob: 301810, cif: 324659, kg: 136199, avgPriceKg: 2.22 },
  ],
};

// NCM 54024400 — Fios de elastômeros (spandex/elastano)
// 2026 REAL: FOB=12,504,582, CIF=12,927,353, KG=3,373,739

const data_54024400_2025 = {
  year: "2025", totalFob: 12504582, totalCif: 12927353, totalKg: 3373739, avgPriceKg: 3.71,
  monthly: [
    // 2025 — placeholder (buscar IMP_2025.csv)
    { month: 1, fob: 2500916, cif: 2585471, kg: 674748, avgPriceKg: 3.71 },
  ],
  countries: [],
  states: [],
};

const data_54024400_2026 = {
  year: "2026", totalFob: 12504582, totalCif: 12927353, totalKg: 3373739, avgPriceKg: 3.71,
  monthly: [
          { month: 1, fob: 2342612, cif: 2419494, kg: 593387, avgPriceKg: 3.95 },
          { month: 2, fob: 2701780, cif: 2800898, kg: 710233, avgPriceKg: 3.80 },
          { month: 3, fob: 3240468, cif: 3327236, kg: 900453, avgPriceKg: 3.60 },
          { month: 4, fob: 1673720, cif: 1737077, kg: 488084, avgPriceKg: 3.43 },
          { month: 5, fob: 2546002, cif: 2642648, kg: 681582, avgPriceKg: 3.74 },
  ],
  countries: [
          { country: "China", fob: 7252829, cif: 7483603, kg: 2224223, avgPriceKg: 3.26, share: 57.9 },
          { country: "Vietnã", fob: 2228351, cif: 2301187, kg: 614979, avgPriceKg: 3.62, share: 17.8 },
          { country: "EUA", fob: 949448, cif: 978613, kg: 191653, avgPriceKg: 4.95, share: 7.6 },
          { country: "Tailândia", fob: 576763, cif: 624653, kg: 107919, avgPriceKg: 5.34, share: 4.8 },
          { country: "Coreia do Sul", fob: 469186, cif: 473806, kg: 56200, avgPriceKg: 8.35, share: 3.7 },
          { country: "Índia", fob: 437233, cif: 456167, kg: 122991, avgPriceKg: 3.55, share: 3.5 },
          { country: "628", fob: 258511, cif: 259757, kg: 21058, avgPriceKg: 12.28, share: 2.0 },
          { country: "Japão", fob: 244142, cif: 258274, kg: 22733, avgPriceKg: 10.74, share: 2.0 },
          { country: "Países Baixos", fob: 37242, cif: 37465, kg: 6458, avgPriceKg: 5.77, share: 0.3 },
          { country: "Colômbia", fob: 31862, cif: 34311, kg: 4013, avgPriceKg: 7.94, share: 0.3 },
          { country: "776", fob: 19015, cif: 19517, kg: 1512, avgPriceKg: 12.58, share: 0.2 },
  ],
  states: [
          { state: "Santa Catarina", fob: 5974706, cif: 6172824, kg: 1644617, avgPriceKg: 3.63 },
          { state: "São Paulo", fob: 2260946, cif: 2349068, kg: 339324, avgPriceKg: 6.66 },
          { state: "Mato Grosso do Sul", fob: 2096959, cif: 2157676, kg: 712656, avgPriceKg: 2.94 },
          { state: "Rondônia", fob: 1305550, cif: 1350529, kg: 445812, avgPriceKg: 2.93 },
          { state: "Minas Gerais", fob: 475815, cif: 489457, kg: 119814, avgPriceKg: 3.97 },
          { state: "Ceará", fob: 270063, cif: 282522, kg: 75990, avgPriceKg: 3.55 },
          { state: "Pernambuco", fob: 118707, cif: 123366, kg: 34800, avgPriceKg: 3.41 },
          { state: "Rio Grande do Sul", fob: 1836, cif: 1911, kg: 726, avgPriceKg: 2.53 },
  ],
};

// NCM 54023119 — Fios texturizados de náilon (até 50 tex)
// 2026 REAL: FOB=60,165,919, CIF=62,482,676, KG=25,124,004

const data_54023119_2025 = {
  year: "2025", totalFob: 60165919, totalCif: 62482676, totalKg: 25124004, avgPriceKg: 2.39,
  monthly: [
    // 2025 — placeholder (buscar IMP_2025.csv)
    { month: 1, fob: 12033184, cif: 12496535, kg: 5024801, avgPriceKg: 2.39 },
  ],
  countries: [],
  states: [],
};

const data_54023119_2026 = {
  year: "2026", totalFob: 60165919, totalCif: 62482676, totalKg: 25124004, avgPriceKg: 2.39,
  monthly: [
          { month: 1, fob: 11049088, cif: 11449613, kg: 4566664, avgPriceKg: 2.42 },
          { month: 2, fob: 11755228, cif: 12164150, kg: 5100459, avgPriceKg: 2.30 },
          { month: 3, fob: 14218784, cif: 14660093, kg: 6044588, avgPriceKg: 2.35 },
          { month: 4, fob: 9968185, cif: 10344251, kg: 4045190, avgPriceKg: 2.46 },
          { month: 5, fob: 13174634, cif: 13864569, kg: 5367103, avgPriceKg: 2.45 },
  ],
  countries: [
          { country: "China", fob: 36233120, cif: 37730838, kg: 16619231, avgPriceKg: 2.18, share: 60.4 },
          { country: "Vietnã", fob: 10236482, cif: 10653721, kg: 4173166, avgPriceKg: 2.45, share: 17.1 },
          { country: "Taiwan", fob: 7715605, cif: 8039283, kg: 3194484, avgPriceKg: 2.42, share: 12.9 },
          { country: "Israel", fob: 4244463, cif: 4260801, kg: 565381, avgPriceKg: 7.51, share: 6.8 },
          { country: "Índia", fob: 802153, cif: 825428, kg: 283699, avgPriceKg: 2.83, share: 1.3 },
          { country: "Indonésia", fob: 360009, cif: 376461, kg: 146787, avgPriceKg: 2.45, share: 0.6 },
          { country: "776", fob: 174796, cif: 182195, kg: 63458, avgPriceKg: 2.75, share: 0.3 },
          { country: "Turquia", fob: 179282, cif: 181745, kg: 12783, avgPriceKg: 14.03, share: 0.3 },
          { country: "455", fob: 138659, cif: 143975, kg: 56376, avgPriceKg: 2.46, share: 0.2 },
          { country: "275", fob: 27682, cif: 27855, kg: 2949, avgPriceKg: 9.39, share: 0.0 },
          { country: "Japão", fob: 16249, cif: 20174, kg: 208, avgPriceKg: 78.12, share: 0.0 },
          { country: "607", fob: 16508, cif: 17306, kg: 2048, avgPriceKg: 8.06, share: 0.0 },
          { country: "Países Baixos", fob: 15455, cif: 15922, kg: 3113, avgPriceKg: 4.96, share: 0.0 },
          { country: "Coreia do Sul", fob: 4606, cif: 6103, kg: 275, avgPriceKg: 16.75, share: 0.0 },
          { country: "351", fob: 850, cif: 869, kg: 46, avgPriceKg: 18.48, share: 0.0 },
  ],
  states: [
          { state: "Santa Catarina", fob: 48247275, cif: 50217729, kg: 21497893, avgPriceKg: 2.24 },
          { state: "São Paulo", fob: 7440535, cif: 7584196, kg: 1905191, avgPriceKg: 3.91 },
          { state: "Ceará", fob: 1870167, cif: 1960608, kg: 751639, avgPriceKg: 2.49 },
          { state: "Rio Grande do Sul", fob: 1028398, cif: 1079469, kg: 406045, avgPriceKg: 2.53 },
          { state: "Minas Gerais", fob: 541306, cif: 567409, kg: 240455, avgPriceKg: 2.25 },
          { state: "Rio de Janeiro", fob: 538839, cif: 555063, kg: 187324, avgPriceKg: 2.88 },
          { state: "Pernambuco", fob: 364967, cif: 375445, kg: 92979, avgPriceKg: 3.93 },
          { state: "Bahia", fob: 134432, cif: 142757, kg: 42478, avgPriceKg: 3.16 },
  ],
};

// NCM 54041100 — Monofilamentos de elastômeros (≥67 decitex)
// 2026 REAL: FOB=292,577, CIF=314,259, KG=61,094

const data_54041100_2025 = {
  year: "2025", totalFob: 292577, totalCif: 314259, totalKg: 61094, avgPriceKg: 4.79,
  monthly: [
    // 2025 — placeholder (buscar IMP_2025.csv)
    { month: 1, fob: 58515, cif: 62852, kg: 12219, avgPriceKg: 4.79 },
  ],
  countries: [],
  states: [],
};

const data_54041100_2026 = {
  year: "2026", totalFob: 292577, totalCif: 314259, totalKg: 61094, avgPriceKg: 4.79,
  monthly: [
          { month: 1, fob: 62574, cif: 64812, kg: 13723, avgPriceKg: 4.56 },
          { month: 2, fob: 1057, cif: 1067, kg: 156, avgPriceKg: 6.78 },
          { month: 3, fob: 77254, cif: 80393, kg: 14707, avgPriceKg: 5.25 },
          { month: 4, fob: 17863, cif: 18280, kg: 1878, avgPriceKg: 9.51 },
          { month: 5, fob: 133829, cif: 149707, kg: 30630, avgPriceKg: 4.37 },
  ],
  countries: [
          { country: "China", fob: 268396, cif: 288209, kg: 59642, avgPriceKg: 4.50, share: 91.7 },
          { country: "Colômbia", fob: 12897, cif: 13273, kg: 1012, avgPriceKg: 12.74, share: 4.2 },
          { country: "Turquia", fob: 11284, cif: 12777, kg: 440, avgPriceKg: 25.65, share: 4.1 },
  ],
  states: [
          { state: "Paraná", fob: 177789, cif: 184504, kg: 40416, avgPriceKg: 4.40 },
          { state: "Minas Gerais", fob: 87560, cif: 90651, kg: 18794, avgPriceKg: 4.66 },
          { state: "São Paulo", fob: 13656, cif: 25121, kg: 870, avgPriceKg: 15.70 },
          { state: "Rio Grande do Norte", fob: 12897, cif: 13273, kg: 1012, avgPriceKg: 12.74 },
          { state: "Santa Catarina", fob: 675, cif: 710, kg: 2, avgPriceKg: 337.50 },
  ],
};

export const hyosungData: Record<string, NcmData> = {
  "54024520": {
    ncm: "54024520",
    description: "Fios de náilon ou poliamidas (67 decitex)",
    years: {
      "2025": data_54024520_2025,
      "2026": data_54024520_2026,
    },
  },
  "54024400": {
    ncm: "54024400",
    description: "Fios de elastômeros (spandex/elastano)",
    years: {
      "2025": data_54024400_2025,
      "2026": data_54024400_2026,
    },
  },
  "54023119": {
    ncm: "54023119",
    description: "Fios texturizados de náilon (até 50 tex)",
    years: {
      "2025": data_54023119_2025,
      "2026": data_54023119_2026,
    },
  },
  "54041100": {
    ncm: "54041100",
    description: "Monofilamentos de elastômeros (≥67 decitex)",
    years: {
      "2025": data_54041100_2025,
      "2026": data_54041100_2026,
    },
  },
};
export interface TradeMapCompany {
  name: string;
  country: string;
  city: string;
  categories: string;
  website: string;
}

export const trademapImporters: TradeMapCompany[] = [
  { name: "VATIS", country: "Belgium", city: "Lochristi", categories: "886", website: "" },
  { name: "Elit International Trade Ltd.", country: "Türkiye", city: "Kayseri", categories: "674", website: "" },
  { name: "DKSH Schweiz AG", country: "Switzerland", city: "Zürich", categories: "558", website: "http://www.dksh.ch" },
  { name: "COPATEX", country: "Switzerland", city: "Cham", categories: "530", website: "" },
  { name: "Median Polska S.A.", country: "Poland", city: "Mysłowice", categories: "480", website: "" },
  { name: "ENRICO FIORILLO S.R.L.", country: "Italy", city: "LIVORNO", categories: "376", website: "" },
  { name: "Princess Auto Ltd", country: "Canada", city: "Winnipeg", categories: "364", website: "http://www.princessauto.com" },
  { name: "Bayer Taiwan Co Ltd", country: "Taipei, Chinese", city: "Taipei City", categories: "265", website: "" },
  { name: "Fercos - Indústria de Termocolantes, Lda", country: "Portugal", city: "RIO TINTO", categories: "258", website: "" },
  { name: "CNBM International Corporation", country: "China", city: "Beijing", categories: "255", website: "http://www.cnbmintl.com" },
  { name: "NAN YA PLASTICS CORPORATION", country: "Taipei, Chinese", city: "Kaohsiung City", categories: "239", website: "http://www.npc.com.tw" },
  { name: "New Wide Enterprise Co., Ltd.", country: "Taipei, Chinese", city: "Taipei City", categories: "229", website: "http://www.new-wide.com" },
  { name: "Concordia Textiles NV", country: "Belgium", city: "Waregem", categories: "225", website: "http://www.concordia.be" },
  { name: "EUROFIEL CONFECCIÓN, S.A.", country: "Spain", city: "Picassent", categories: "185", website: "" },
  { name: "Bonar B.V.", country: "Netherlands", city: "Arnhem", categories: "184", website: "http://www.bonar.com" },
  { name: "NAN YA PLASTICS CORPORATION AMERICA", country: "United States of America", city: "Livingston", categories: "183", website: "http://www.npc.com.tw" },
  { name: "SUNGHYUN TRADE", country: "Korea, Republic of", city: "Seoul", categories: "178", website: "" },
  { name: "A. MOLINA & C. S.P.A.", country: "Italy", city: "GORNATE-OLONA", categories: "175", website: "" },
  { name: "Südwolle GmbH & Co. KG", country: "Germany", city: "Schwaig", categories: "171", website: "http://www.suedwolle.de" },
  { name: "Arville Textiles Ltd", country: "United Kingdom", city: "Wetherby", categories: "164", website: "http://www.arville.com" },
  { name: "FIL MAN MADE GROUP S.R.L.", country: "Italy", city: "MILANO", categories: "153", website: "" },
  { name: "Borgstena Textile Portugal, Lda", country: "Portugal", city: "VILA DAS AVES", categories: "152", website: "" },
  { name: "Hyundai Fiber Co., Ltd.", country: "Korea, Republic of", city: "Busan", categories: "145", website: "" },
  { name: "TORAY INTERNATIONAL INC.", country: "Japan", city: "Tokyo", categories: "142", website: "http://www.toray.com" },
  { name: "ABALIOGLU TEKSTIL SANAYI A.S.", country: "Türkiye", city: "Denizli", categories: "138", website: "http://www.abalioglusutekstil.com.tr" },
  { name: "Teijin Frontier Co., Ltd.", country: "Japan", city: "Osaka", categories: "135", website: "http://www.teijin.co.jp" },
  { name: "KORTEKS TEKSTIL SAN. VE TIC. A.S.", country: "Türkiye", city: "Bursa", categories: "131", website: "" },
  { name: "SIRTI S.P.A.", country: "Italy", city: "CASTEL GOFFREDO", categories: "126", website: "" },
  { name: "Sinterama S.P.A.", country: "Italy", city: "SANDIGLIANO", categories: "122", website: "http://www.sinterama.it" },
  { name: "Radici Partecipazioni S.p.A.", country: "Italy", city: "GANDINO", categories: "118", website: "http://www.radicigroup.com" },
];

export const trademapExporters: TradeMapCompany[] = [
  { name: "VATIS", country: "Belgium", city: "Lochristi", categories: "886", website: "" },
  { name: "Newcastle Optical Engineering Ltd", country: "United Kingdom", city: "Wallsend", categories: "830", website: "" },
  { name: "Elit International Trade Ltd.", country: "Türkiye", city: "Kayseri", categories: "674", website: "" },
  { name: "DKSH Schweiz AG", country: "Switzerland", city: "Zürich", categories: "558", website: "http://www.dksh.ch" },
  { name: "Median Polska S.A.", country: "Poland", city: "Mysłowice", categories: "480", website: "" },
  { name: "Vavex 1990 s.r.o.", country: "Czech Republic", city: "Příbram", categories: "383", website: "" },
  { name: "ENRICO FIORILLO S.R.L.", country: "Italy", city: "LIVORNO", categories: "376", website: "" },
  { name: "SVITAP J.H.J. spol. s r.o.", country: "Czech Republic", city: "Svitavy", categories: "348", website: "http://www.svitap.cz" },
  { name: "Wrights Plastics", country: "United Kingdom", city: "West Bromwich", categories: "302", website: "" },
  { name: "Allis Welding Services", country: "United Kingdom", city: "Newcastle upon Tyne", categories: "294", website: "" },
  { name: "NAN YA PLASTICS CORPORATION", country: "Taipei, Chinese", city: "Kaohsiung City", categories: "239", website: "http://www.npc.com.tw" },
  { name: "New Wide Enterprise Co., Ltd.", country: "Taipei, Chinese", city: "Taipei City", categories: "229", website: "http://www.new-wide.com" },
  { name: "Concordia Textiles NV", country: "Belgium", city: "Waregem", categories: "225", website: "http://www.concordia.be" },
  { name: "Shanghai Textile Decoration Corporation Group", country: "China", city: "Shanghai", categories: "198", website: "" },
  { name: "EUROFIEL CONFECCIÓN, S.A.", country: "Spain", city: "Picassent", categories: "185", website: "" },
  { name: "Bonar B.V.", country: "Netherlands", city: "Arnhem", categories: "184", website: "http://www.bonar.com" },
  { name: "SUNGHYUN TRADE", country: "Korea, Republic of", city: "Seoul", categories: "178", website: "" },
  { name: "Südwolle GmbH & Co. KG", country: "Germany", city: "Schwaig", categories: "171", website: "http://www.suedwolle.de" },
  { name: "Arville Textiles Ltd", country: "United Kingdom", city: "Wetherby", categories: "164", website: "http://www.arville.com" },
  { name: "FIL MAN MADE GROUP S.R.L.", country: "Italy", city: "MILANO", categories: "153", website: "" },
  { name: "Borgstena Textile Portugal, Lda", country: "Portugal", city: "VILA DAS AVES", categories: "152", website: "" },
  { name: "TORAY INTERNATIONAL INC.", country: "Japan", city: "Tokyo", categories: "142", website: "http://www.toray.com" },
  { name: "Teijin Frontier Co., Ltd.", country: "Japan", city: "Osaka", categories: "135", website: "http://www.teijin.co.jp" },
  { name: "KORTEKS TEKSTIL SAN. VE TIC. A.S.", country: "Türkiye", city: "Bursa", categories: "131", website: "" },
  { name: "SIRTI S.P.A.", country: "Italy", city: "CASTEL GOFFREDO", categories: "126", website: "" },
  { name: "Sinterama S.P.A.", country: "Italy", city: "SANDIGLIANO", categories: "122", website: "http://www.sinterama.it" },
  { name: "Radici Partecipazioni S.p.A.", country: "Italy", city: "GANDINO", categories: "118", website: "http://www.radicigroup.com" },
  { name: "Hyosung TNC Corporation", country: "Korea, Republic of", city: "Seoul", categories: "98", website: "http://www.hyosungtnc.com" },
  { name: "Zhejiang GuXianDao Polyester Dope Dyed Yarn Co., Ltd.", country: "China", city: "Shaoxing", categories: "87", website: "" },
  { name: "Indorama Ventures Public Company Limited", country: "Thailand", city: "Bangkok", categories: "76", website: "http://www.indoramaventures.com" },
];


export function normalizeCountry(raw: string): string {
  const map: Record<string, string> = {
    "Taipei, Chinese": "Taiwan",
    "Korea, Republic of": "Coreia do Sul",
    "United States of America": "EUA",
    "United Kingdom": "Reino Unido",
    "Netherlands": "Holanda",
    "Germany": "Alemanha",
    "Spain": "Espanha",
    "Switzerland": "Suíça",
    "Czech Republic": "Rep. Tcheca",
    "Thailand": "Tailândia",
    "Japan": "Japão",
    "China": "China",
    "India": "Índia",
    "Belgium": "Bélgica",
    "Italy": "Itália",
    "Poland": "Polônia",
    "Portugal": "Portugal",
    "Canada": "Canadá",
    "Türkiye": "Turquia",
    "France": "França",
    "Denmark": "Dinamarca",
    "Romania": "Romênia",
    "United Arab Emirates": "EAU",
  };
  return map[raw] || raw;
}

export function getTotals(year: string) {
  let totalFob = 0;
  let totalCif = 0;
  let totalKg = 0;
  for (const ncm of NCM_LIST) {
    const d = hyosungData[ncm];
    const yd = d?.years[year];
    if (yd) {
      totalFob += yd.totalFob;
      totalCif += yd.totalCif;
      totalKg += yd.totalKg;
    }
  }
  return { totalFob, totalCif, totalKg, avgPriceKg: totalKg > 0 ? totalFob / totalKg : 0 };
}

export const STATE_NAMES: Record<string, string> = {
  SP: "São Paulo",
  SC: "Santa Catarina",
  PR: "Paraná",
  RS: "Rio Grande do Sul",
  MG: "Minas Gerais",
  RJ: "Rio de Janeiro",
  BA: "Bahia",
  AM: "Amazonas",
};

export const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
