export type OperationCountry = {
  code: string;
  name: string;
  flag: string;
  region: string;
  focus: string;
  services: string[];
};

export const operationCountries: OperationCountry[] = [
  {
    code: "BR",
    name: "Brasil",
    flag: "🇧🇷",
    region: "América do Sul",
    focus: "Entrada regulatória, operação local, distribuição nacional e representação para empresas estrangeiras.",
    services: ["Fulfillment", "E-commerce", "Representação", "Distribuição"],
  },
  {
    code: "DE",
    name: "Alemanha",
    flag: "🇩🇪",
    region: "Europa Central",
    focus: "Hub estratégico para armazenagem, distribuição e expansão comercial na União Europeia.",
    services: ["Fulfillment", "Cross-border", "Distribuição", "E-commerce"],
  },
  {
    code: "RO",
    name: "Romênia",
    flag: "🇷🇴",
    region: "Leste Europeu",
    focus: "Operação competitiva para expansão em mercados emergentes e apoio logístico regional.",
    services: ["Fulfillment", "Distribuição", "Expansão regional"],
  },
  {
    code: "TR",
    name: "Turquia",
    flag: "🇹🇷",
    region: "Europa / Ásia",
    focus: "Ponto de conexão entre Europa, Oriente Médio e Ásia para operações flexíveis de estoque e distribuição.",
    services: ["Fulfillment", "Cross-border", "Distribuição"],
  },
  {
    code: "US",
    name: "Estados Unidos",
    flag: "🇺🇸",
    region: "América do Norte",
    focus: "Estrutura para sellers, marcas e operações de e-commerce com escala regional e integração a marketplaces.",
    services: ["Fulfillment", "E-commerce", "Marketplace ops", "Distribuição"],
  },
  {
    code: "MX",
    name: "México",
    flag: "🇲🇽",
    region: "América do Norte",
    focus: "Base para entrada comercial na América Latina e distribuição regional com custo competitivo.",
    services: ["Fulfillment", "E-commerce", "Distribuição"],
  },
  {
    code: "CL",
    name: "Chile",
    flag: "🇨🇱",
    region: "América do Sul",
    focus: "Operação para expansão sul-americana com apoio a armazenagem, distribuição e entrada comercial.",
    services: ["Fulfillment", "Representação", "Distribuição"],
  },
];
