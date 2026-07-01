import { 
  Ship, Truck, Globe, Package, Warehouse, ShoppingCart, 
  Zap, Truck as TruckIcon, Layers, FileText, Building2, 
  ArrowLeftRight, CreditCard, BarChart3, Box, Calculator, Percent,
  Navigation, Activity, Anchor, Radar, TrendingUp
} from "lucide-react";

export const stats = [
  { value: "10", label: "Frentes de Serviço Integradas", icon: Layers, color: "from-red-500 to-rose-600" },
  { value: "4", label: "Modais Conectáveis", icon: TruckIcon, color: "from-blue-500 to-cyan-600" },
  { value: "7", label: "Mercados Prioritários", icon: Globe, color: "from-green-500 to-emerald-600" },
  { value: "1", label: "Plataforma Unificada", icon: Zap, color: "from-amber-500 to-orange-600" },
];

export const services = [
  {
    id: "freight",
    icon: Ship,
    title: "Fretes Internacionais",
    shortDesc: "Marítimo, aéreo, rodoviário e multimodal em uma operação coordenada",
    fullDesc: "A Tradexa orquestra cotações, execução, parceiros e documentos com mais contexto operacional desde a demanda inicial. Oferecemos soluções completas para importação e exportação, trabalhando com os melhores armadores e carriers do mercado.",
    benefits: "Decisão mais clara entre custo, prazo e complexidade por modal",
    integration: "Integra com importação, couriers, tracking e hubs no destino",
    features: [
      "FCL (Container Completo)",
      "LCL (Carga Consolidada)",
      "Frete Aéreo Expresso",
      "Rodoviário Internacional",
      "Door-to-Door",
      "Rastreamento em tempo real"
    ],
    color: "from-blue-500 to-cyan-600",
    bgColor: "bg-blue-50",
    route: "/services/freight"
  },
  {
    id: "import",
    icon: FileText,
    title: "Importações e Radar",
    shortDesc: "Apoio regulatório e operacional para destravar operações de importação",
    fullDesc: "Estruture radar, compliance e desenho da jornada de entrada no Brasil com conexão imediata à execução logística. Nossa equipe especializada cuida de toda a burocracia para você focar no seu negócio.",
    benefits: "Mais previsibilidade para início ou revisão de operações importadoras",
    integration: "Integra com fretes, impostos, representação e distribuição local",
    features: [
      "Habilitação de Radar",
      "Classificação Fiscal (NCM)",
      "Licenças de Importação",
      "Desembaraço Aduaneiro",
      "Compliance Regulatório",
      "Consultoria Especializada"
    ],
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-purple-50",
    route: "/services/import"
  },
  {
    id: "market-intelligence",
    icon: BarChart3,
    title: "Market Entry Intelligence",
    shortDesc: "Transformamos dados de comércio exterior em decisões estratégicas",
    fullDesc: "A partir do NCM ou descrição do produto, entregamos uma visão completa do mercado brasileiro: volume, concorrência, preços praticados, origens, canais de entrada e viabilidade real de operação. Antes de investir em logística, estoque ou estrutura, você entende exatamente onde está entrando — com dados.",
    benefits: "Não entregamos apenas análise — conectamos o insight diretamente à operação logística e comercial",
    integration: "Integra com fretes, importação, fulfillment e representação comercial",
    features: [
      "Análise por NCM ou produto",
      "Panorama de importação/exportação",
      "Mapeamento de concorrentes",
      "Benchmark de preços (FOB/CIF)",
      "Barreiras regulatórias (ANVISA, MAPA, INMETRO)",
      "Viabilidade logística e tributária"
    ],
    color: "from-teal-500 to-emerald-600",
    bgColor: "bg-teal-50",
    route: "/services/market-intelligence"
  },
  {
    id: "import-tax-calculator",
    icon: Calculator,
    title: "Calculadora de Impostos",
    shortDesc: "Calcule II, IPI, PIS, COFINS e ICMS automaticamente pelo código NCM",
    fullDesc: "Saiba exatamente quanto pagará de impostos antes de importar. Nossa calculadora usa o código NCM da mercadoria para calcular automaticamente todos os tributos: Imposto de Importação (II), IPI, PIS, COFINS e ICMS. Base de dados atualizada constantemente com a legislação vigente.",
    benefits: "Planejamento financeiro preciso sem surpresas na hora do desembaraço",
    integration: "Integra com importação, fretes, classificação fiscal e compliance",
    features: [
      "Cálculo por código NCM",
      "II (Imposto de Importação)",
      "IPI (Produtos Industrializados)",
      "PIS/COFINS Importação",
      "ICMS por estado",
      "Relatório detalhado"
    ],
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50",
    route: "/services/import-tax-calculator"
  },
  {
    id: "couriers",
    icon: Package,
    title: "Couriers B2B / B2C",
    shortDesc: "Remessas expressas com descontos, inteligência de carrier e visão cross-border",
    fullDesc: "Projetos urgentes, recorrentes ou digitais entram no mesmo fluxo comercial com lógica de SLA e custo por operação. Trabalhamos com DHL, FedEx, UPS e outros carriers premium.",
    benefits: "Mais velocidade sem perder governança e integração com o restante da operação",
    integration: "Integra com e-commerce, impostos, pós-venda e fulfillment",
    features: [
      "Descontos Corporativos",
      "Coleta Door-to-Door",
      "Rastreamento Integrado",
      "Gestão de Contas",
      "Relatórios Analíticos",
      "Suporte Dedicado"
    ],
    color: "from-orange-500 to-red-600",
    bgColor: "bg-orange-50",
    route: "/services/couriers"
  },
  {
    id: "ecommerce",
    icon: ShoppingCart,
    title: "E-commerce Internacional",
    shortDesc: "Cross-border, canais e pedidos conectados à execução logística",
    fullDesc: "Venda em novos mercados com uma visão única de canais, estoque, couriers, impostos e presença local. Integração nativa com Shopify, WooCommerce, Vtex e outros platforms.",
    benefits: "Mais aderência entre operação digital, entrega e experiência do consumidor",
    integration: "Integra com hubs, representação, couriers e cálculo de impostos",
    features: [
      "Integração com Marketplaces",
      "Gestão de Pedidos",
      "Cálculo de Impostos",
      "Checkout Internacional",
      "Experiência Localizada",
      "Analytics de Vendas"
    ],
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50",
    route: "/services/ecommerce"
  },
  {
    id: "fulfillment",
    icon: Warehouse,
    title: "Fulfillment no Destino",
    shortDesc: "Estoque, armazenagem, expedição e distribuição como parte do ecossistema",
    fullDesc: "Estruture hubs no destino para reduzir atrito comercial, aproximar o produto do mercado e sustentar escala. Nossa rede está presente em 7 países estratégicos.",
    benefits: "Mais velocidade de entrega e governança de estoque por país",
    integration: "Integra com e-commerce, fretes, couriers e envios pequenos",
    features: [
      "Armazenagem Segura",
      "Pick & Pack",
      "Gestão de Estoque",
      "Expedição Rápida",
      "Devoluções",
      "Relatórios em Tempo Real"
    ],
    color: "from-red-500 to-rose-600",
    bgColor: "bg-red-50",
    route: "/services/fulfillment"
  },
  {
    id: "representation",
    icon: Building2,
    title: "Representação Comercial / Operacional",
    shortDesc: "Entrada no exterior ou no Brasil com apoio local e execução coordenada",
    fullDesc: "Combine presença comercial, parceiros, estrutura operacional e backoffice para entrar em novos mercados com mais consistência. Nossa rede de parceiros locais está pronta para apoiar sua expansão.",
    benefits: "Menos fragmentação entre expansão comercial e execução logística",
    integration: "Integra com fulfillment, finance, envios pequenos e importação",
    features: [
      "Representação Local",
      "Parcerias Estratégicas",
      "Backoffice Compartilhado",
      "Suporte Operacional",
      "Networking Empresarial",
      "Consultoria de Mercado"
    ],
    color: "from-slate-600 to-slate-800",
    bgColor: "bg-slate-50",
    route: "/services/representation"
  },
  {
    id: "small-shipments",
    icon: Box,
    title: "Envios Pequenos",
    shortDesc: "Cargas fracionadas até 30kg com propostas de múltiplos transportadores",
    fullDesc: "Envios fracionados de até 30kg com múltiplas ofertas de transportadores verificados. Compare preços, prazos e avaliações antes de escolher. Ideal para e-commerce, amostras e pequenos volumes.",
    benefits: "Economia de até 40% com consolidação de cargas e múltiplas propostas",
    integration: "Integra com truckers, financeiro, tracking e hubs locais",
    features: [
      "Cargas Fracionadas (até 30kg)",
      "Múltiplas Propostas",
      "Compare Preços e Prazos",
      "Rastreamento GPS",
      "Seguro de Carga",
      "Sem Fidelidade"
    ],
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50",
    route: "/services/small-shipments"
  },
  {
    id: "trucker",
    icon: Truck,
    title: "Caminhoneiro / Operação Rodoviária",
    shortDesc: "Entrada dedicada para cargas, propostas e operação rodoviária conectada",
    fullDesc: "Capte disponibilidade, região e perfil da frota de forma mais clara para alimentar o fluxo certo da plataforma. Conectamos transportadores a oportunidades de carga em todo o país.",
    benefits: "Melhor roteamento de demanda para capacidade operacional real",
    integration: "Integra com envios pequenos, fretes e pagamentos",
    features: [
      "Cadastro de Frota",
      "Propostas de Carga",
      "Pagamento Seguro",
      "Rastreamento em Tempo Real",
      "Suporte 24/7",
      "Programa de Benefícios"
    ],
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50",
    route: "/services/trucker"
  },
];

export const journeys = [
  {
    title: "Importador / Exportador",
    description: "Entre pela demanda e receba o desenho certo entre frete, radar, tributos e representação",
    modules: ["FRETES", "IMPORTAÇÃO", "IMPOSTOS"],
    icon: Globe,
    color: "from-blue-500 to-cyan-600"
  },
  {
    title: "Operação de E-commerce",
    description: "Conecte canais, pedidos, couriers, representação local e fulfillment sem separar a jornada",
    modules: ["CROSS-BORDER", "COURIERS", "CANAIS"],
    icon: ShoppingCart,
    color: "from-green-500 to-emerald-600"
  },
  {
    title: "Projeto de Fulfillment",
    description: "Ative estoque no destino, expedição e distribuição local como base de expansão",
    modules: ["ESTOQUES", "SLA", "DISTRIBUIÇÃO"],
    icon: Warehouse,
    color: "from-red-500 to-rose-600"
  },
  {
    title: "Envios Fracionados",
    description: "Registre envios de até 30kg e receba múltiplas propostas de transportadores",
    modules: ["CARGAS", "PROPOSTAS", "TRACKING"],
    icon: Box,
    color: "from-blue-500 to-indigo-600"
  },
  {
    title: "Caminhoneiro",
    description: "Mostre perfil operacional, capacidade e região para entrar no fluxo certo de cargas",
    modules: ["CARGAS", "PROPOSTAS", "PAGAMENTOS"],
    icon: TruckIcon,
    color: "from-slate-600 to-slate-800"
  },
  {
    title: "Parceiro Logístico / Comercial",
    description: "Ative uma frente de representação ou operação híbrida para ampliar cobertura",
    modules: ["PARCERIAS", "REPRESENTAÇÃO", "EXECUÇÃO"],
    icon: Globe,
    color: "from-purple-500 to-pink-600"
  },
];

export const markets = [
  { flag: "🇧🇷", country: "Brasil", region: "AMÉRICA DO SUL", status: "ATIVO", description: "Entrada regulatória, operação local, distribuição nacional e representação" },
  { flag: "🇩🇪", country: "Alemanha", region: "EUROPA CENTRAL", status: "ATIVO", description: "Hub estratégico para armazenagem, distribuição e expansão comercial na UE" },
  { flag: "🇷🇴", country: "Romênia", region: "LESTE EUROPEU", status: "ATIVO", description: "Operação competitiva para expansão em mercados emergentes" },
  { flag: "🇹🇷", country: "Turquia", region: "EUROPA / ÁSIA", status: "ATIVO", description: "Ponto de conexão entre Europa, Oriente Médio e Ásia" },
  { flag: "🇺🇸", country: "Estados Unidos", region: "AMÉRICA DO NORTE", status: "ATIVO", description: "Estrutura para sellers, marcas e operações de e-commerce" },
  { flag: "🇲🇽", country: "México", region: "AMÉRICA DO NORTE", status: "ATIVO", description: "Base para entrada comercial na América Latina" },
  { flag: "🇨🇱", country: "Chile", region: "AMÉRICA DO SUL", status: "ATIVO", description: "Operação para expansão sul-americana com apoio logístico" },
];

export const platformModules = [
  { title: "Fretes + Couriers", status: "OPERANDO", color: "from-blue-500 to-cyan-600", icon: Ship },
  { title: "Impostos Automáticos", status: "BASE PRONTA", color: "from-green-500 to-emerald-600", icon: FileText },
  { title: "Fulfillment no Destino", status: "ESCALÁVEL", color: "from-red-500 to-rose-600", icon: Warehouse },
  { title: "Tracking + Financeiro", status: "INTEGRADO", color: "from-amber-500 to-orange-600", icon: CreditCard },
];

export const serviceLinks = [
  { label: "Fretes Internacionais", route: "/services/freight", icon: Ship },
  { label: "Importação e Radar", route: "/services/import", icon: FileText },
  { label: "Market Intelligence", route: "/services/market-intelligence", icon: BarChart3 },
  { label: "Calculadora de Impostos", route: "/services/import-tax-calculator", icon: Calculator },
  { label: "Couriers B2B/B2C", route: "/services/couriers", icon: Package },
  { label: "E-commerce", route: "/services/ecommerce", icon: ShoppingCart },
  { label: "Fulfillment", route: "/services/fulfillment", icon: Warehouse },
  { label: "Representação", route: "/services/representation", icon: Building2 },
  { label: "Envios Pequenos", route: "/services/small-shipments", icon: Box },
];

export const toolGroups = [
  {
    label: "Logística & Tracking",
    items: [
      { label: "Track & Trace", route: "/track-trace", icon: Navigation },
      { label: "Supply Chain Map", route: "/supply-chain", icon: Activity },
      { label: "Frete Marítimo", route: "/maritime-freight-map", icon: Ship },
      { label: "Global Port Activity", route: "/port-activity", icon: Anchor },
    ],
  },
  {
    label: "Inteligência de Mercado",
    items: [
      { label: "Export Import Data", route: "/export-import-data", icon: BarChart3 },
      { label: "Perfil Global Empresa", route: "/company-global-profile", icon: Building2 },
      { label: "Radar de Concorrência", route: "/radar-concorrencia", icon: Radar },
      { label: "Comparador Global", route: "/global-trade-comparison", icon: ArrowLeftRight },
    ],
  },
  {
    label: "Dados & Tarifas",
    items: [
      { label: "Tarifas Globais", route: "/global-tariff", icon: Percent },
      { label: "NCM Global Dashboard", route: "/ncm-global-dashboard", icon: BarChart3 },
    ],
  },
];

export const infoLinks = [
  { label: "Sobre Nós", route: "/sobre", icon: Globe },
  { label: "Blog", route: "/blog", icon: FileText },
  { label: "Glossário", route: "/glossario", icon: Layers },
  { label: "Recursos", route: "/recursos", icon: Zap },
  { label: "Trabalhe Conosco", route: "/trabalhe-conosco", icon: Building2 },
  { label: "Contato", route: "/contato", icon: CreditCard },
  { label: "Termos de Uso", route: "/termos", icon: Package },
  { label: "Privacidade", route: "/privacidade", icon: Warehouse },
];