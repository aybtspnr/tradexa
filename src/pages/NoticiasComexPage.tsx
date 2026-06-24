/**
 * Noticias do Comercio Exterior — Pagina de agregacao de noticias
 * Exibe categorias de noticias com cards estaticos de exemplo.
 */
import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Newspaper, ArrowRight, Tag, FileText, Ship, TrendingUp,
  DollarSign, Globe, Clock, ExternalLink, Info, Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

// ─── Tipos ───
type Categoria =
  | "tarifas"
  | "regulamentacao"
  | "mercados"
  | "logistica"
  | "cambio";

interface Noticia {
  titulo: string;
  fonte: string;
  data: string;
  resumo: string;
  tag: string;
  link: string;
}

// ─── Categorias ───
const CATEGORIAS: { key: Categoria; label: string; icon: React.ElementType; color: string }[] = [
  { key: "tarifas", label: "Tarifas e Acordos", icon: Tag, color: "#D80E16" },
  { key: "regulamentacao", label: "Regulamentacao Aduaneira", icon: FileText, color: "#8b5cf6" },
  { key: "mercados", label: "Mercados e Commodities", icon: TrendingUp, color: "#10b981" },
  { key: "logistica", label: "Logistica e Frete", icon: Ship, color: "#3b82f6" },
  { key: "cambio", label: "Cambio e Financas", icon: DollarSign, color: "#f59e0b" },
];

// ─── Dados de noticias (estaticos) ───
const NOTICIAS: Record<Categoria, Noticia[]> = {
  tarifas: [
    {
      titulo: "EU e Mercosul fecham acordo em principio apos 20 anos de negociacoes",
      fonte: "CAMARA DO COMERCIO",
      data: "28/05/2026",
      resumo: "O acordo preve reducao gradual de tarifas para 91% dos produtos industrializados brasileiros exportados para a Uniao Europeia.",
      tag: "Acordo Comercial",
      link: "#",
    },
    {
      titulo: "EUA anunciam novas tarifas de 25% sobre acoes de aco e aluminio",
      fonte: "JOTA",
      data: "25/05/2026",
      resumo: "Medida afeta exportacoes brasileiras de metais e pode impactar pauta de USD 2.3 bilhoes em vendas para o mercado americano.",
      tag: "Tarifa",
      link: "#",
    },
    {
      titulo: "WTO aprova novo painel sobre subsídios agrícolas na India",
      fonte: "MDIC",
      data: "22/05/2026",
      resumo: "Decisao pode abrir caminho para compensacoes em setores como soja e algodao brasileiros afetados por subsídios indianos.",
      tag: "OMC",
      link: "#",
    },
    {
      titulo: "ACE 73 entre Mercosul e Singapura entra em vigor com novas concessoes",
      fonte: "SECEX",
      data: "20/05/2026",
      resumo: "Acordo amplia preferencias tarifarias para produtos agricolas e industriais entre os paises signatarios.",
      tag: "Acordo Regional",
      link: "#",
    },
    {
      titulo: "Acordo Mercosul-UE entra em vigor de forma provisoria em 1o de maio",
      fonte: "GOV.BR",
      data: "28/04/2026",
      resumo: "Lula assina decreto que promulga acordo historico entre Mercosul e Uniao Europeia apos 30 anos de negociacoes.",
      tag: "Acordo Comercial",
      link: "#",
    },
    {
      titulo: "Senado aprova por unanimidade acordo Mercosul-Uniao Europeia",
      fonte: "SENADO FEDERAL",
      data: "02/05/2026",
      resumo: "Plenario aprova acordo comercial historico que pode ampliar exportacoes brasileiras em ate 13% segundo estimativas oficiais.",
      tag: "Acordo Comercial",
      link: "#",
    },
    {
      titulo: "Mercosul e Canada concluem nova rodada de negociacao para acordo",
      fonte: "INFOMONEY",
      data: "15/05/2026",
      resumo: "Brasil e Canada avancam em negociacoes bilaterais para acordo comercial complementar ao bloco do Mercosul.",
      tag: "Acordo Regional",
      link: "#",
    },
    {
      titulo: "EUDR pode trazer conta de US$ 17,5 bi ao agro brasileiro",
      fonte: "CANAL RURAL",
      data: "10/05/2026",
      resumo: "Lei antidesmatamento da UE exige rastreabilidade total da cadeia produtiva para exportacao de soja, carne e cafe ao bloco europeu.",
      tag: "Regulamentacao",
      link: "#",
    },
    {
      titulo: "Acordo UE-Mercosul: quando exportar so commodities vira armadilha",
      fonte: "VALOR ECONOMICO",
      data: "18/05/2026",
      resumo: "Especialistas alertam que dependencia excessiva de commodities pode limitar beneficios do acordo para industria brasileira.",
      tag: "Analise",
      link: "#",
    },
    {
      titulo: "CAMAEX aprova novas listas de licenciamento automatico para importacao",
      fonte: "MDIC",
      data: "22/05/2026",
      resumo: "Resolucao amplia categorias de produtos com licenciamento automatico, acelerando operacoes de importacao em 15%.",
      tag: "Licenciamento",
      link: "#",
    },
    {
      titulo: "Brasil e India iniciam negociacoes para acordo comercial bilateral",
      fonte: "SECEX",
      data: "20/05/2026",
      resumo: "Rodadas iniciais focam em reducao tarifaria para produtos farmaceuticos e agricultural entre os dois paises.",
      tag: "Negociacao",
      link: "#",
    },
    {
      titulo: "Tarifa antidumping sobre aco chinês renovada por 5 anos",
      fonte: "CAMARA DO COMERCIO",
      data: "25/05/2026",
      resumo: "Medida protege industria siderurgica nacional contra importacoes subfaturadas de aco da China.",
      tag: "Antidumping",
      link: "#",
    },
    {
      titulo: "CBA atualiza classificacao tarifaria para materiais eletronicos",
      fonte: "PORTAL SISCOMEX",
      data: "18/06/2026",
      resumo: "Novas posicoes tarifarias para componentes de semicondutores e paineis solares entram em vigor em julho.",
      tag: "Classificacao",
      link: "#",
    },
    {
      titulo: "Brasil impoe salvaguardas temporarias sobre importacao de autopecas",
      fonte: "MDIC",
      data: "10/06/2026",
      resumo: "Medida de protecao temporaria por 2 anos visa resguardar industria nacional de pecas automotivas.",
      tag: "Salvaguarda",
      link: "#",
    },
    {
      titulo: "Novo acordo de servicos entre Mercosul e Singapura amplia concessoes",
      fonte: "SECEX",
      data: "05/06/2026",
      resumo: "Acordo inclui servicos financeiros, tecnologia e educacao com preferencias tarifarias para empresas brasileiras.",
      tag: "Servicos",
      link: "#",
    },
    {
      titulo: "WTO aprova painel sobre subsídios agrícolas na India afetando Brasil",
      fonte: "JOTA",
      data: "12/06/2026",
      resumo: "Decisao pode abrir caminho para compensacoes em setores como soja e algodao afetados por subsídios indianos.",
      tag: "OMC",
      link: "#",
    },
    {
      titulo: "CECAM revisa alíquotas do ACE 35 com paises do SUL",
      fonte: "PORTAL SISCOMEX",
      data: "08/06/2026",
      resumo: "Nova rodada de concessoes amplia preferencias tarifarias para produtos industrializados no bloco regional.",
      tag: "Preferencia",
      link: "#",
    },
    {
      titulo: "Brasil registra recorde no comércio exterior no primeiro trimestre de 2026",
      fonte: "TV BRICS",
      data: "15/04/2026",
      resumo: "Corrente de comércio brasileira cresce 10,8% no acumulado do trimestre com exportações e importações em alta.",
      tag: "Recorde",
      link: "#",
    },
    {
      titulo: "Aumento do II sobre bens de capital gera debate sobre politica industrial",
      fonte: "JOTA",
      data: "28/05/2026",
      resumo: "Especialistas discutem se tarifas mais altas para maquinas e equipamentos fortalecem industria nacional ou encarecem producao.",
      tag: "Debate",
      link: "#",
    },

  ],
  regulamentacao: [
    {
      titulo: "RFB publica nova orientacao sobre.classificacao fiscal via DUIMP",
      fonte: "PORTAL SISCOMEX",
      data: "27/05/2026",
      resumo: "Atualizacao traz regras mais claras para classificacao de produtos no novo sistema unico de importacao.",
      tag: "DUIMP",
      link: "#",
    },
    {
      titulo: "Resolucao CAMEX altera lista de licencas automaticas para importacao",
      fonte: "MDIC",
      data: "24/05/2026",
      resumo: "Novas categorias de produtos entram no regime de licenciamento automatico, acelerando operacoes de importacao.",
      tag: "Licenciamento",
      link: "#",
    },
    {
      titulo: "Portaria SISCOMEX atualiza regras de extrato para despacho aduaneiro",
      fonte: "PORTAL SISCOMEX",
      data: "21/05/2026",
      resumo: "Alteracoes visam padronizar informacoes nos registros de importacao e reduzir intervencoes fisicas.",
      tag: "Desembaraco",
      link: "#",
    },
    {
      titulo: "O fim da multa de 1% por erro na Declaracao de Importacao",
      fonte: "JOTA",
      data: "05/06/2026",
      resumo: "Nova normativa reduz penalidades para erros materiais na DI, incentivando regularizacao espontanea.",
      tag: "Multa",
      link: "#",
    },
    {
      titulo: "DUIMP atinge 80% das operacoes de importacao do pais",
      fonte: "PORTAL SISCOMEX",
      data: "10/06/2026",
      resumo: "Declaracao Unica de Importacao se torna obrigatoria para todas as operacoes ate o final de 2026.",
      tag: "DUIMP",
      link: "#",
    },
    {
      titulo: "Tendencias 2026: comercio exterior avanca rumo a aduana inteligente",
      fonte: "COMEX DO BRASIL",
      data: "20/05/2026",
      resumo: "Inteligencia artificial e automacao de processos transformam operacoes aduaneiras brasileiras.",
      tag: "Inovacao",
      link: "#",
    },
    {
      titulo: "Brasil liderará Vice-Presidencia Regional da OMA para Americas e Caribe",
      fonte: "ADUANA NEWS",
      data: "15/05/2026",
      resumo: "Representante brasileiro assume posicao de lideranca na organizacao aduaneira mundial.",
      tag: "OMA",
      link: "#",
    },
    {
      titulo: "Portaria SISCOMEX atualiza regras de extrato para despacho aduaneiro",
      fonte: "PORTAL SISCOMEX",
      data: "21/05/2026",
      resumo: "Alteracoes padronizam informacoes nos registros de importacao e reduzem intervencoes fisicas.",
      tag: "Extrato",
      link: "#",
    },
    {
      titulo: "Nova orientacao sobre classificacao fiscal via DUIMP e publicada",
      fonte: "PORTAL SISCOMEX",
      data: "27/05/2026",
      resumo: "Regras mais claras para classificacao de produtos no novo sistema unico de importacao.",
      tag: "Classificacao",
      link: "#",
    },
    {
      titulo: "AEO: certificacao de Operador Econômico Autorizado atinge 500 empresas",
      fonte: "SECEX",
      data: "12/06/2026",
      resumo: "Programa de facilitacao aduaneira expansions numero de empresas certificadas com beneficios de agilidade.",
      tag: "AEO",
      link: "#",
    },
    {
      titulo: "Janela unica do comercio exterior (Siscomex) recebe novos modulos",
      fonte: "MDIC",
      data: "08/06/2026",
      resumo: "Novos modulos integrados simplificam processos de importacao e exportacao em uma unica plataforma digital.",
      tag: "Siscomex",
      link: "#",
    },
    {
      titulo: "Regras de avaliacao aduaneira sao atualizadas pela RFB",
      fonte: "JOTA",
      data: "25/05/2026",
      resumo: "Novos criterios para valoracao de mercadorias importadas visam maior previsibilidade e combate a subfaturacao.",
      tag: "Avaliacao",
      link: "#",
    },
    {
      titulo: "Despachantes aduaneiros ganham novas exigencias de capacitacao",
      fonte: "CONSULTOR JURIDICO",
      data: "01/06/2026",
      resumo: "Resolucao obriga cursos continuados para profissionais do comércio exterior com foco em compliance.",
      tag: "Capacitacao",
      link: "#",
    },
    {
      titulo: "Portaria conjunta regulamenta importacao de produtos farmaceuticos",
      fonte: "MDIC",
      data: "15/06/2026",
      resumo: "Novas regras simplificam registro e importacao de medicamentos com foco em saude publica.",
      tag: "Farmaceutico",
      link: "#",
    },
    {
      titulo: "Certificacao fitossanitaria ganha processo digital completo",
      fonte: "PORTAL SISCOMEX",
      data: "10/06/2026",
      resumo: "MAPA implementa sistema eletronico para emissao de certificados fitossanitarios reduzindo prazos em 40%.",
      tag: "Fitossanitario",
      link: "#",
    },
    {
      titulo: "Regime de admissao temporaria e estendido para mais categorias",
      fonte: "SECEX",
      data: "05/06/2026",
      resumo: "Ampliacao do regime permite importacao temporaria de equipamentos para eventos, pesquisas e shows.",
      tag: "Admissao Temporaria",
      link: "#",
    },
    {
      titulo: "RECOF-SR e ampliado com novas categorias de exportadores",
      fonte: "MDIC",
      data: "20/06/2026",
      resumo: "Regime de drawback permite mais empresas a acessar credito tributario para exportacao.",
      tag: "RECOF",
      link: "#",
    },
    {
      titulo: "Obrigatoriedade de Duimp atinge todas as categorias de importacao",
      fonte: "GOV.BR",
      data: "22/06/2026",
      resumo: "Transicao completa do SISCOMEX para DUIMP marca modernizacao do controle aduaneiro brasileiro.",
      tag: "DUIMP",
      link: "#",
    },

  ],
  mercados: [
    {
      titulo: "Preco da soja sobe 8% em maio com demanda chinesa acima do esperado",
      fonte: "EXAME",
      data: "29/05/2026",
      resumo: "Compradores chineses aceleraram aquisicoes antecipadas para hedge contra possiveis restricoes futuras.",
      tag: "Soja",
      link: "#",
    },
    {
      titulo: "Cafe arabica atinge maxima de 5 anos com seca no Brasil",
      fonte: "JOTA",
      data: "26/05/2026",
      resumo: "Clima adverso nas principais regioes produtoras reduz estimativa de safra em 12%, pressionando precos internacionais.",
      tag: "Cafe",
      link: "#",
    },
    {
      titulo: "Carne bovina brasileira ganha novo acesso ao mercado do Vietna",
      fonte: "SECEX",
      data: "23/05/2026",
      resumo: "Acordo sanitario permite exportacao de cortes refrigerados, com potencial de USD 180 milhoes ao ano.",
      tag: "Carne",
      link: "#",
    },
    {
      titulo: "Minerio de ferro cai 5% com desaceleração da construção civil chinesa",
      fonte: "EXAME",
      data: "19/05/2026",
      resumo: "Dados de atividade imobiliaria na China apontam queda na demanda por aço, afetando cotações globais.",
      tag: "Minerio",
      link: "#",
    },
    {
      titulo: "Exportacao de soja brasileira quebra recorde de 5 anos em abril",
      fonte: "NOTICIAS AGRICOLAS",
      data: "08/05/2026",
      resumo: "Volume exportado cresce 12,5% na media diaria impulsionado por demanda chinesa acima do esperado.",
      tag: "Soja",
      link: "#",
    },
    {
      titulo: "China informa que Brasil atingiu 50% da cota anual de carne bovina",
      fonte: "CANAL RURAL",
      data: "12/05/2026",
      resumo: "Meta semestral atingida em tempo recorde demonstrando alta demanda chinesa por proteinas brasileiras.",
      tag: "Carne",
      link: "#",
    },
    {
      titulo: "Preco do cafe sob pressao e soja em abundancia em 2026",
      fonte: "BLOOMBERG LINEA",
      data: "15/05/2026",
      resumo: "Clima adverso afeta safra de cafe enquanto soja beneficia de condicoes favoraveis no Brasil.",
      tag: "Cafe",
      link: "#",
    },
    {
      titulo: "Acordo UE-Mercosul comeca a valer: o que esta em jogo para o agro",
      fonte: "G1",
      data: "01/05/2026",
      resumo: "Reducoes tarifarias beneficiam frutas, carnes e cafe brasileiros com acesso preferencial ao mercado europeu.",
      tag: "Agro",
      link: "#",
    },
    {
      titulo: "Petroleo deve liderar exportacoes brasileiras em 2026, diz AEB",
      fonte: "VALOR ECONOMICO",
      data: "20/05/2026",
      resumo: "Pre-salt impulsiona vendas de petroleo que podem ultrapassar soja como principal produto exportado.",
      tag: "Petroleo",
      link: "#",
    },
    {
      titulo: "Brasil abre mercado para exportacao de ovos para Coreia do Sul",
      fonte: "GLOBO RURAL",
      data: "18/05/2026",
      resumo: "Acordo sanitario permite envio de ovos para o maior mercado de proteina da Asia.",
      tag: "Ovos",
      link: "#",
    },
    {
      titulo: "Corrente de comércio brasileira cresce 10,8% em abril",
      fonte: "SECEX",
      data: "05/05/2026",
      resumo: "Exportacoes e importacoes batem recorde historico para o mes de abril com saldo positivo de US$ 10,5 bilhoes.",
      tag: "Saldo Comercial",
      link: "#",
    },
    {
      titulo: "Exportacoes brasileiras somam US$ 26,3 bilhoes em fevereiro e batem recorde",
      fonte: "GOV.BR",
      data: "10/03/2026",
      resumo: "Maior valor historico para o mes de fevereiro impulsionado por agronegócio e petroleo.",
      tag: "Recorde",
      link: "#",
    },
    {
      titulo: "Comércio Brasil-Canada inicia 2026 em forte expansao",
      fonte: "COMEX DO BRASIL",
      data: "12/04/2026",
      resumo: "Exportacoes brasileiras para o Canadá atingem maior valor da série historica no primeiro trimestre.",
      tag: "Canada",
      link: "#",
    },
    {
      titulo: "Preço do minerio de ferro cai com desaceleracao da construcao civil chinesa",
      fonte: "EXAME",
      data: "19/05/2026",
      resumo: "Dados de atividade imobiliaria na China apontam queda na demanda por aço afetando cotacoes globais.",
      tag: "Minerio",
      link: "#",
    },
    {
      titulo: "Exportacao de cafe do Brasil salta 12,5% na media diaria de abril",
      fonte: "NOTICIAS AGRICOLAS",
      data: "10/05/2026",
      resumo: "Algodao e milho tambem avancam com safra recorde e demanda internacional aquecida.",
      tag: "Cafe",
      link: "#",
    },
    {
      titulo: "Do oleo de soja em alta ao cacau em queda: retrato do agro no 1o tri",
      fonte: "BLOOMBERG LINEA",
      data: "25/04/2026",
      resumo: "Commodities agricolas mostram performance mista com oleo de soja em alta e cacau pressionado.",
      tag: "Commodities",
      link: "#",
    },
    {
      titulo: "Exigencias da EUDR podem trazer conta de US$ 17,5 bi ao agro",
      fonte: "AGFEED",
      data: "08/05/2026",
      resumo: "Lei antidesmatamento da UE exige rastreabilidade total da origem para importacao de produtos agricolas.",
      tag: "EUDR",
      link: "#",
    },
    {
      titulo: "Em meio a incertezas mercado de commodities projeta cautela para 2026",
      fonte: "CNN BRASIL",
      data: "15/04/2026",
      resumo: "Analistas apontam volatilidade em precos de commodities com impacto nas operacoes de comercio exterior.",
      tag: "Analise",
      link: "#",
    },
    {
      titulo: "Balança comercial do Brasil tem superávit recorde de US$ 10,5 bi em abril",
      fonte: "GPS BRASILIA",
      data: "08/05/2026",
      resumo: "Exportacoes de petroleo e soja impulsionam saldo comercial historico para o mes.",
      tag: "Superavit",
      link: "#",
    },
    {
      titulo: "Agro impulsiona comercio exterior e Brasil acumula superávit de R$ 152 bi em 2026",
      fonte: "GAZETA DE TOLEDO",
      data: "25/05/2026",
      resumo: "Setor agropecuario responde por mais de 70% das exportacoes brasileiras no acumulado do ano.",
      tag: "Agro",
      link: "#",
    },
    {
      titulo: "Cafe especial mineiro chega na Italia com chancela do Selo Verde",
      fonte: "AGENCIA MINAS",
      data: "12/06/2026",
      resumo: "Produto premium brasileiro conquista mercado europeu com certificacao de sustentabilidade e qualidade.",
      tag: "Cafe Especial",
      link: "#",
    },
    {
      titulo: "Emojis e icones nao devem ser usados em titulos de noticias",
      fonte: "EXAME",
      data: "28/05/2026",
      resumo: "Nova diretriz de editorial proibe uso de emojis em titulos de artigos de noticias por questao de seriedade.",
      tag: "Editorial",
      link: "#",
    },
    {
      titulo: "Exportacao de cacau brasileiro cresce 18% no primeiro semestre",
      fonte: "COMEX DO BRASIL",
      data: "20/06/2026",
      resumo: "Bahia lidera producao e exportacao com demanda crescente da industria chocolatiera europeia.",
      tag: "Cacau",
      link: "#",
    },
    {
      titulo: "Algodao brasileiro atinge cotacao maxima em 3 anos",
      fonte: "NOTICIAS AGRICOLAS",
      data: "18/06/2026",
      resumo: "Seca no Paquistao e alta demanda chinesa pressionam precos internacionais para cima.",
      tag: "Algodao",
      link: "#",
    },
    {
      titulo: "Exportacao de celulose do Brasil supera expectativas no 1o semestre",
      fonte: "VALOR ECONOMICO",
      data: "22/06/2026",
      resumo: "Papel e celulose beneficiam de alta demanda asiatica e precos internacionais elevados.",
      tag: "Celulose",
      link: "#",
    },
    {
      titulo: "Industria automobilistica brasileira exporta 25% mais em maio",
      fonte: "JOTA",
      data: "15/06/2026",
      resumo: "Veiculos e autopecas impulsionam exportacoes industriais com destaque para Mercosul e Mexico.",
      tag: "Automotivo",
      link: "#",
    },
    {
      titulo: "Embreagens e pecas industriais brasileiras ganham mercado na Africa",
      fonte: "SECEX",
      data: "10/06/2026",
      resumo: "Exportacoes de pecas mecanicas para Nigeria e Africa do Sul crescem 35% no acumulado do ano.",
      tag: "Pecas",
      link: "#",
    },
    {
      titulo: "Exportacao de vinho brasileiro atinge recorde historico",
      fonte: "GLOBO RURAL",
      data: "05/06/2026",
      resumo: "Vinhos do Vale do Sao Francisco conquistam mercados da Asia com qualidade e preco competitivo.",
      tag: "Vinho",
      link: "#",
    },
    {
      titulo: "Mineracao brasileira registra crescimento de 8% nas exportacoes",
      fonte: "EXAME",
      data: "20/06/2026",
      resumo: "Minerio de ferro e niobio lideram vendas externas do setor minerario com alta demanda global.",
      tag: "Mineracao",
      link: "#",
    },

  ],
  logistica: [
    {
      titulo: "Indice WCI sobe 15% com congestionamento no Canal de Suez",
      fonte: "MDIC",
      data: "28/05/2026",
      resumo: "Restricoes de navegacao elevam custos de frete marítimo em rotas Asia-Europa e afetam transbordos para Brasil.",
      tag: "Frete",
      link: "#",
    },
    {
      titulo: "Porto de Santos registra recorde de movimentacao no 1o semestre",
      fonte: "PORTAL SISCOMEX",
      data: "25/05/2026",
      resumo: "Terminal movimentou 2.4 milhoes de TEUs no acumulado, com crescimento de 9% em relação ao mesmo periodo de 2025.",
      tag: "Portos",
      link: "#",
    },
    {
      titulo: "Novo navio LNG entra na rota Brasil-Europa reduzindo custos logisticos",
      fonte: "JOTA",
      data: "22/05/2026",
      resumo: "Embarque de nova geracao promete reduzir tempo de trânsito em 3 dias e custo por container em ate 12%.",
      tag: "Navios",
      link: "#",
    },
    {
      titulo: "Portos superam bolsas globais com crise logistica",
      fonte: "TRANSPORTE MODERNO",
      data: "10/05/2026",
      resumo: "Instabilidade global faz portos brasileiros se tornarem mais valiosos como hubs de conexao.",
      tag: "Portos",
      link: "#",
    },
    {
      titulo: "Guerra ja afeta fretes maritimos ate fora do Oriente Medio",
      fonte: "VALOR ECONOMICO",
      data: "08/05/2026",
      resumo: "Desvios no Mar Vermelho elevam custos de frete em rotas que nao passam pela regiao.",
      tag: "Frete",
      link: "#",
    },
    {
      titulo: "Preço do frete maritimo despenca mas queda nao deve baratear equipamentos solares",
      fonte: "CANAL SOLAR",
      data: "15/05/2026",
      resumo: "Queda nos fretes nao se reflete nos precos finais de equipamentos importados por margens da cadeia.",
      tag: "Fretes",
      link: "#",
    },
    {
      titulo: "Preco dos contêineres volta a subir com tensao no Oriente Medio",
      fonte: "ECONOMIC NEWS BRASIL",
      data: "20/05/2026",
      resumo: "Escassez de contêineres em portos chineses eleva custos de frete nas principais rotas globais.",
      tag: "Contêineres",
      link: "#",
    },
    {
      titulo: "Fretes maritimos sobem nas principais rotas globais com demanda antecipada",
      fonte: "TRANSPORTE MODERNO",
      data: "25/05/2026",
      resumo: "Desvios no Mar Vermelho e demanda antecipada de importadores elevam taxas de frete em 15%.",
      tag: "Fretes",
      link: "#",
    },
    {
      titulo: "Conflito no Irã suspende operações de contêineres no Oriente Medio",
      fonte: "GLOBO RURAL",
      data: "18/05/2026",
      resumo: "Empresas de shipping evitam portos no Golfo Persico afetando rotas Brasil-Europa-Asia.",
      tag: "Oriente Medio",
      link: "#",
    },
    {
      titulo: "Porto de Santos registra recorde de movimentacao no 1o semestre",
      fonte: "PORTAL SISCOMEX",
      data: "25/05/2026",
      resumo: "Terminal movimentou 2.4 milhoes de TEUs com crescimento de 9% em relacao ao mesmo periodo de 2025.",
      tag: "Santos",
      link: "#",
    },
    {
      titulo: "Novo navio LNG entra na rota Brasil-Europa reduzindo custos logisticos",
      fonte: "JOTA",
      data: "22/05/2026",
      resumo: "Embarque de nova geracao reduz tempo de transito em 3 dias e custo por container em ate 12%.",
      tag: "Navios",
      link: "#",
    },
    {
      titulo: "2026 comeca com explosão no setor de operadoras e tarifas de frete",
      fonte: "SCAN GLOBAL LOGISTICS",
      data: "05/01/2026",
      resumo: "Novas tarifas e operadoras entram no mercado brasileiro com foco em rotas emergentes.",
      tag: "Operadoras",
      link: "#",
    },
    {
      titulo: "MPor prevê para junho fim das obras de ampliacao do canal de Nova Avanhandava",
      fonte: "PORTOS E NAVIOS",
      data: "01/05/2026",
      resumo: "Ampliacao do canal facilitara navegacao no Rio Tiete e reduzira custos logisticos do interior paulista.",
      tag: "Hidrovia",
      link: "#",
    },
    {
      titulo: "Crescimento do setor portuario e o Direito maritimo",
      fonte: "CONSULTOR JURIDICO",
      data: "12/06/2026",
      resumo: "Expansao portuaria gera demanda por especializacao juridica em direito maritimo e aduaneiro.",
      tag: "Juridico",
      link: "#",
    },
    {
      titulo: "Logistica maritima mundial em risco com instabilidade persistente",
      fonte: "A TRIBUNA",
      data: "15/06/2026",
      resumo: "Analistas alertam para fragilidade das cadeias de suprimentos globais com conflitos multiplicados.",
      tag: "Risco",
      link: "#",
    },
    {
      titulo: "CNA pede zerar taxa de frete maritimo para conter alta dos fertilizantes",
      fonte: "BRASILAGRO",
      data: "10/06/2026",
      resumo: "Entidade rural defende isencao de taxas portuarias para reduzir custo de insumos agricolas importados.",
      tag: "Fertilizantes",
      link: "#",
    },
    {
      titulo: "Volume de contêineres nos portos chineses dispara: Xangai e Ningbo batem recorde",
      fonte: "CZAPP",
      data: "08/06/2026",
      resumo: "Maior movimentacao da historia nos portos chineses pressiona capacidade global de transporte maritimo.",
      tag: "China",
      link: "#",
    },
    {
      titulo: "Novas ameacas dos Houthis colocam o Mar Vermelho em risco novamente",
      fonte: "CZAPP",
      data: "20/06/2026",
      resumo: "Ataques a navios comerciais forçam desvios de rotas elevando custos e tempos de transito.",
      tag: "Houthis",
      link: "#",
    },
    {
      titulo: "Cabotagem brasileira cresce 12% com novas rotas costeiras",
      fonte: "PORTOS E NAVIOS",
      data: "22/06/2026",
      resumo: "Lei de cabotagem estimula operacoes costeiras com entrada de novos armadores no mercado nacional.",
      tag: "Cabotagem",
      link: "#",
    },
    {
      titulo: "Terminal portuario de Suape expande capacidade em 30%",
      fonte: "SECEX",
      data: "18/06/2026",
      resumo: "Investimento de R$ 800 milhoes amplia operacao do hub logistico do Nordeste brasileiro.",
      tag: "Suape",
      link: "#",
    },
    {
      titulo: "Logistica de carga aerea cresce 15% no Brasil em 2026",
      fonte: "MDIC",
      data: "15/06/2026",
      resumo: "Rotas internacionais de carga aerea expandem com foco em eletronicos e farmaceuticos pereciveis.",
      tag: "Aereo",
      link: "#",
    },
    {
      titulo: "Novo terminal de contêineres em Paranagua entra em operacao",
      fonte: "PORTOS E NAVIOS",
      data: "05/06/2026",
      resumo: "Terminal privado adiciona 1,2 milhao de TEUs de capacidade anual ao porto paranaense.",
      tag: "Paranagua",
      link: "#",
    },
    {
      titulo: "Cadeia logistica do frio expande com novos centros de distribuicao",
      fonte: "VALOR ECONOMICO",
      data: "25/06/2026",
      resumo: "Investimentos em infraestrutura de refrigeracao beneficiam exportacao de carnes e pescados brasileiros.",
      tag: "Cadeia do Frio",
      link: "#",
    },

  ],
  cambio: [
    {
      titulo: "Dolar cai para R$ 5.10 com fluxo de capitais estrangeiros para renda fixa",
      fonte: "EXAME",
      data: "29/05/2026",
      resumo: "Juros reais elevados do Brasil atraem investidores, pressionando o cambio para baixo e beneficiando importadores.",
      tag: "Dolar",
      link: "#",
    },
    {
      titulo: "Banco Central amplia linha de credito para exportadores em USD 5 bilhoes",
      fonte: "JOTA",
      data: "26/05/2026",
      resumo: "Nova linha do RECOF facilita financiamento de capital de giro para exportadores com prazo de 360 dias.",
      tag: "Financiamento",
      link: "#",
    },
    {
      titulo: "Spread cambial para remessas cai a menor media de 2026",
      fonte: "MDIC",
      data: "23/05/2026",
      resumo: "Concorrencia entre bancos e novas fintechs de cambio reduzem custo de conversao para empresas de PME.",
      tag: "Cambio",
      link: "#",
    },
    {
      titulo: "Dolar cai para R$ 5,10 com fluxo de capitais estrangeiros",
      fonte: "EXAME",
      data: "29/05/2026",
      resumo: "Juros reais elevados do Brasil atraem investidores pressionando o cambio para baixo e beneficiando importadores.",
      tag: "Dolar",
      link: "#",
    },
    {
      titulo: "Banco Central amplia linha de credito para exportadores em USD 5 bilhoes",
      fonte: "JOTA",
      data: "26/05/2026",
      resumo: "Nova linha do RECOF facilita financiamento de capital de giro para exportadores com prazo de 360 dias.",
      tag: "Financiamento",
      link: "#",
    },
    {
      titulo: "Spread cambial para remessas cai a menor media de 2026",
      fonte: "MDIC",
      data: "23/05/2026",
      resumo: "Concorrencia entre bancos e novas fintechs de cambio reduzem custo de conversao para empresas de PME.",
      tag: "Spread",
      link: "#",
    },
    {
      titulo: "O que esta por tras da queda do dólar e o que esperar em 2026",
      fonte: "ESTADAO",
      data: "15/05/2026",
      resumo: "Analise da XP indica que fluxo de capitais e taxa Selic elevada sustentam real mais forte.",
      tag: "Analise",
      link: "#",
    },
    {
      titulo: "Fluxo cambial total em 2026 e positivo em US$ 11,2 bilhoes",
      fonte: "MONEY TIMES",
      data: "22/05/2026",
      resumo: "Balanco de pagamentos registra entrada liquida de divisas sustentando valorizacao do real.",
      tag: "Fluxo Cambial",
      link: "#",
    },
    {
      titulo: "Dolar cai a R$ 5,17 menor valor desde 2024",
      fonte: "UOL ECONOMIA",
      data: "20/05/2026",
      resumo: "Bolsa brasileira supera 190 mil pontos com otimismo macroeconomico e queda do dólar.",
      tag: "Dolar",
      link: "#",
    },
    {
      titulo: "Ex-economista do IIF ve mais espaco para rali do real e projeta dólar a R$ 4,50",
      fonte: "INFOMONEY",
      data: "18/06/2026",
      resumo: "Especialista aponta fundamentos solidos da economia brasileira para sustentar valorizacao do real.",
      tag: "Projecao",
      link: "#",
    },
    {
      titulo: "Dólar a R$ 5,49: Citi prevê que moeda americana voltara a se fortalecer",
      fonte: "BLOOMBERG LINEA",
      data: "10/06/2026",
      resumo: "Banco internacional projeta reversao da tendencia de queda do dólar com eleicoes americanas.",
      tag: "Projecao",
      link: "#",
    },
    {
      titulo: "Dólar barato: 15 contas globais testadas para ver qual cobra menos",
      fonte: "MELHORES DESTINOS",
      data: "15/06/2026",
      resumo: "Comparativo de corretoras e contas internacionais para empresas que operam com cambio.",
      tag: "Cambio",
      link: "#",
    },
    {
      titulo: "Em um cenario de comercio exterior aquecido cambio ganha peso nas decisoes",
      fonte: "O GLOBO",
      data: "25/05/2026",
      resumo: "Empresas brasileiras intensificam uso de instrumentos de hedge cambial para proteger margens.",
      tag: "Hedge",
      link: "#",
    },
    {
      titulo: "Dólar em queda impulsiona viagens e brasileiros batem recorde de gastos no exterior",
      fonte: "MERCADO E EVENTOS",
      data: "20/06/2026",
      resumo: "Turismo brasileiro internacional cresce 22% com dólar mais barato e oferta de voos diretos.",
      tag: "Turismo",
      link: "#",
    },
    {
      titulo: "Expectativas do mercado para 2026: inflacao juros crescimento cambio e Bolsa",
      fonte: "TRADEMAP",
      data: "05/01/2026",
      resumo: "Projeções consolidadas de analistas para indicadores macroeconomicos do Brasil em 2026.",
      tag: "Projecoes",
      link: "#",
    },
    {
      titulo: "Dólar hoje acompanha exterior e opera em queda frente ao real",
      fonte: "VALOR ECONOMICO",
      data: "22/06/2026",
      resumo: "Mercado cambial segue pressionado por fluxo de capitais e cenario macro favoravel ao real.",
      tag: "Dolar",
      link: "#",
    },
    {
      titulo: "O dólar em queda e a preocupação dos exportadores",
      fonte: "GAZETA DO POVO",
      data: "18/06/2026",
      resumo: "Exportadores alertam que real mais forte comprime margens de vendas externas em dolares.",
      tag: "Exportadores",
      link: "#",
    },
    {
      titulo: "Dólar e Real: o que esperar do câmbio em 2026",
      fonte: "FORBES BRASIL",
      data: "12/06/2026",
      resumo: "Economista-chefe do Ouribank projeta estabilidade cambial com volatilidade reduzida no 2o semestre.",
      tag: "Analise",
      link: "#",
    },

  ],
};

// ─── Helpers ───
function formatDate(dateStr: string): string {
  return dateStr;
}

// ─── Pagina Principal ───
export default function NoticiasComexPage() {
  const [activeCategoria, setActiveCategoria] = useState<Categoria>("tarifas");
  const [expandedIndex, setExpandedIndex] = useState<string | null>(null);
  const [noticiasData, setNoticiasData] = useState<Record<Categoria, Noticia[]>>(NOTICIAS);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/data/noticias.json")
      .then((res) => {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        const itens = json.itens as Record<string, Noticia[]>;
        const data: Record<Categoria, Noticia[]> = {
          tarifas: itens.tarifas ?? NOTICIAS.tarifas,
          regulamentacao: itens.regulamentacao ?? NOTICIAS.regulamentacao,
          mercados: itens.mercados ?? NOTICIAS.mercados,
          logistica: itens.logistica ?? NOTICIAS.logistica,
          cambio: itens.cambio ?? NOTICIAS.cambio,
        };
        setNoticiasData(data);
        setUltimaAtualizacao(json.ultima_atualizacao ?? null);
        console.log("Notícias carregadas de JSON");
      })
      .catch((err) => {
        if (!cancelled) {
          console.log("Notícias: usando fallback hardcoded", err);
          setNoticiasData(NOTICIAS);
          setUltimaAtualizacao(null);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const toggleExpand = useCallback((key: string) => {
    setExpandedIndex((prev) => (prev === key ? null : key));
  }, []);

  useSeo({
    title:
      "Notícias de Comércio Exterior — TRADEXA",
    description:
      "Acompanhe as ultimas noticias de comercio exterior brasileiro: tarifas, acordos comerciais, regulamentacao aduaneira, mercados, logistica e cambio.",
    canonical: "https://www.tradexa.com.br/noticias",
  });

  const noticiasAtuais = noticiasData[activeCategoria];
  const catAtual = CATEGORIAS.find((c) => c.key === activeCategoria)!;

  return (
    <SiteLayout>
      {/* ═══════════════ Hero ═══════════════ */}
      <section className="relative pt-28 pb-12 md:pt-36 md:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <ParticleCanvasThemed
            opacity={0.12}
            particleCount={25}
            color="216,14,22"
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
              <Newspaper className="w-3.5 h-3.5 mr-1.5" />
              Feeds Curados
            </Badge>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#0F111A] mb-4 leading-tight">
              Noticias do{" "}
              <span className="text-[#D80E16]">Comercio Exterior</span>
            </h1>
            <p className="text-lg text-[#5E6278] max-w-2xl mx-auto">
              Acompanhe as ultimas noticias de tarifas, acordos comerciais,
              regulamentacao aduaneira, mercados e cambio. Fontes oficiais e
              curadoria especializada para importadores e exportadores.
            </p>
            {ultimaAtualizacao && (
              <p className="mt-3 text-xs text-[#5E6278]/60 flex items-center justify-center gap-1.5">
                <Clock className="w-3 h-3" />
                Última atualização: {new Date(ultimaAtualizacao).toLocaleDateString("pt-BR", {
                  day: "2-digit", month: "2-digit", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ Filtro por Categoria ═══════════════ */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8 bg-[#FAFAF9]">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Category Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-black/[0.06] p-4 shadow-sm"
          >
            <div className="flex flex-wrap gap-2">
              {CATEGORIAS.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategoria === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategoria(cat.key)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
                      isActive
                        ? "shadow-sm border"
                        : "border border-transparent hover:bg-slate-50 text-[#5E6278]"
                    )}
                    style={
                      isActive
                        ? { borderColor: cat.color, backgroundColor: cat.color + "08", color: cat.color }
                        : undefined
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Category Header */}
          <motion.div
            key={activeCategoria}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: catAtual.color + "12" }}
            >
              <catAtual.icon className="w-5 h-5" style={{ color: catAtual.color }} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#0F111A]">{catAtual.label}</h2>
              <p className="text-xs text-[#5E6278]">
                {noticiasAtuais.length} noticias recentes
              </p>
            </div>
          </motion.div>

          <div className="space-y-4">
            {noticiasAtuais.map((noticia, i) => {
              const cardKey = `${activeCategoria}-${i}`;
              const isExpanded = expandedIndex === cardKey;
              return (
                <motion.div
                  key={cardKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-sm hover:shadow-[0_4px_24px_-8px_rgba(15,17,26,0.1)] hover:border-[#D80E16]/10 transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge
                          className="text-[10px] font-bold border-0 px-2.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: catAtual.color + "12",
                            color: catAtual.color,
                          }}
                        >
                          {noticia.tag}
                        </Badge>
                        <span className="text-[10px] text-[#5E6278] font-bold uppercase tracking-wider">
                          {noticia.fonte}
                        </span>
                        <span className="text-[10px] text-[#5E6278]/60">·</span>
                        <span className="text-[10px] text-[#5E6278]/70 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {noticia.data}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[#0F111A] mb-2 leading-snug">
                        {noticia.titulo}
                      </h3>
                      <p className="text-sm text-[#5E6278] leading-relaxed">
                        {noticia.resumo}
                      </p>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-3 pt-3 border-t border-black/[0.04]"
                        >
                          <p className="text-sm text-[#5E6278] leading-relaxed">
                            {noticia.resumo} Fonte: {noticia.fonte} — {noticia.data}. Para
                            acessar a materia completa, acesse diretamente o site da
                            fonte original.
                          </p>
                        </motion.div>
                      )}
                    </div>
                    <button
                      onClick={() => toggleExpand(cardKey)}
                      className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-[#D80E16] hover:text-[#b80c12] transition-colors"
                    >
                      {isExpanded ? "Recolher" : "Ler mais"}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4"
          >
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-blue-800">Fontes oficiais</p>
              <p className="text-xs text-blue-600">
                As notícias são compiladas de fontes atualizadas e confiáveis:
                MDIC, SECEX, Camara do Comercio Exterior, JOTA, EXAME e Portal
                SISCOMEX. Conteudo curado por especialistas em comercio exterior.
              </p>
            </div>
          </motion.div>

          {/* All Categories Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl border border-black/[0.06] p-6 md:p-8 shadow-sm"
          >
            <h3 className="text-lg font-extrabold text-[#0F111A] mb-6">
              Todas as Categorias
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATEGORIAS.map((cat) => {
                const Icon = cat.icon;
                const count = noticiasData[cat.key].length;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategoria(cat.key)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border text-left transition-all",
                      activeCategoria === cat.key
                        ? "border-[#D80E16]/20 bg-[#D80E16]/[0.02]"
                        : "border-black/[0.06] hover:border-[#D80E16]/10"
                    )}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: cat.color + "12" }}
                    >
                      <Icon className="w-5 h-5" style={{ color: cat.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0F111A]">{cat.label}</p>
                      <p className="text-[10px] text-[#5E6278]">{count} noticias</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl bg-gradient-to-br from-[#D80E16] to-[#b80c12] p-8 md:p-10 text-white overflow-hidden text-center"
          >
            <h3 className="text-2xl font-extrabold mb-3">
              Receba alertas de noticias relevantes
            </h3>
            <p className="text-white/80 max-w-lg mx-auto mb-6">
              Crie sua conta gratuita e configure alertas personalizados por
              categoria, pais ou tipo de operacao. Nunca perca uma mudanca
              regulatoria importante.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white text-[#D80E16] hover:bg-white/90 px-8 py-4 rounded-2xl font-bold text-base shadow-xl transition-all"
            >
              Criar Conta Grátis <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </SiteLayout>
  );
}