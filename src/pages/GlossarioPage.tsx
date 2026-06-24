import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, BookOpen, ArrowRight, Sparkles, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

interface GlossaryTerm {
  term: string;
  definition: string;
  link?: string;
  linkLabel?: string;
}

const glossaryTerms: GlossaryTerm[] = [
  { term: "ADIANTAMENTO DE CAPITAIS EXTERIOR (ACE)", definition: "Modalidade de financiamento ao exportador, concedido por instituição financeira autorizada, destinado a antecipar recursos para a produção de bens a serem exportados. O prazo máximo é de 360 dias.", link: "/blog/como-fazer-exportacao-passo-a-passo", linkLabel: "Guia de Exportação" },
  { term: "ADUANA", definition: "Repartição pública responsável pela fiscalização e controle do comércio exterior. No Brasil, as principais aduanas estão localizadas em portos, aeroportos e fronteiras terrestres. É onde ocorre o desembaraço aduaneiro das mercadorias.", link: "/blog/desembaraco-aduaneiro-como-funciona", linkLabel: "Desembaraço Aduaneiro" },
  { term: "ALADI (Associação Latino-Americana de Integração)", definition: "Organização regional que reúne 13 países da América Latina para promover a integração econômica e comercial. O Brasil é membro fundador. A ALADI gerencia os Acordos de Complementação Econômica (ACE).", link: "/blog/margem-preferencia-acordos-comerciais", linkLabel: "Acordos Comerciais" },
  { term: "ALÍQUOTA", definition: "Percentual aplicado sobre a base de cálculo de um imposto. No comércio exterior, existem alíquotas para II (Imposto de Importação), IPI, PIS-Importação, COFINS-Importação e ICMS, que variam conforme o NCM do produto.", link: "/blog/calcular-imposto-importacao-brasil", linkLabel: "Guia de Alíquotas" },
  { term: "ATA CARNET", definition: "Documento aduaneiro internacional que permite a entrada temporária de mercadorias em países estrangeiros sem pagamento de impostos. Válido por 12 meses, é usado em feiras, amostras comerciais e equipamentos profissionais.", link: "/blog/ata-carnet-admissao-temporaria", linkLabel: "ATA Carnet" },
  { term: "BONIFICAÇÃO", definition: "Desconto ou presentação concedida pelo exportador ao importador, sem cobrança adicional. Pode ser em mercadorias, amostras gratuitas ou descontos comerciais. Deve ser declarada na fatura comercial.", link: "/blog/documentos-importacao-exportacao", linkLabel: "Documentos" },
  { term: "CÂMBIO", definition: "Operação de compra ou venda de moeda estrangeira. No comércio exterior, o câmbio é necessário para pagamentos internacionais. O Banco Central regula as operações de câmbio e define as regras para conversão de moedas.", link: "/blog/spread-cambial-importacao", linkLabel: "Spread Cambial" },
  { term: "CARTA DE CRÉDITO", definition: "Instrumento financeiro emitido por um banco, garantindo o pagamento ao exportador cumpridas as condições estipuladas. É o meio de pagamento mais seguro no comércio internacional, especialmente entre partes que ainda não possuem confiança mútua.", link: "/blog/carta-de-credito-importacao", linkLabel: "Carta de Crédito" },
  { term: "CIDE (Contribuição de Intervenção no Domínio Econômico)", definition: "Tributo federal que incide sobre importações de determinados produtos, especialmente combustíveis e petroquímicos. A alíquota varia conforme o produto e pode ser de 0% a 300%.", link: "/blog/calcular-imposto-importacao-brasil", linkLabel: "Tributos" },
  { term: "CIF (Cost, Insurance and Freight)", definition: "Incoterm que indica que o preço da mercadoria inclui custo, seguro e frete até o porto de destino. O vendedor é responsável pela contratação do transporte e seguro até a chegada ao porto de destino.", link: "/blog/incoterms-2026-guia-importacao-exportacao", linkLabel: "Guia Incoterms" },
  { term: "CMC (Conhecimento de Transporte Multimodal de Carga)", definition: "Documento que comprova o contrato de transporte multimodal de mercadorias. Diferente do conhecimento de embarque convencional, o CMC cobre o transporte utilizando dois ou mais modais (marítimo, rodoviário, ferroviário).", link: "/blog/transporte-multimodal-cargas", linkLabel: "Transporte Multimodal" },
  { term: "COFINS (Contribuição para Financiamento da Seguridade Social)", definition: "Tributo federal que incide sobre a importação de mercadorias. A alíquota de COFINS-Importação é de 7,6% para a maioria dos produtos. Pode ser cumulativa ou não cumulativa conforme o regime tributário da empresa.", link: "/blog/calcular-imposto-importacao-brasil", linkLabel: "PIS/COFINS" },
  { term: "CONHECIMENTO DE EMBARQUE (Bill of Lading)", definition: "Documento emitido pela transportadora marítima que comprova o recebimento da mercadoria para transporte. Funciona como recibo, contrato de transporte e título de propriedade da carga.", link: "/blog/documentos-importacao-exportacao", linkLabel: "Docs de Transporte" },
  { term: "COMEX", definition: "Sigla para Comércio Exterior. Refere-se ao conjunto de atividades de importação e exportação de bens e serviços entre países. Abrange logística, tributação, documentação e regulamentação.", link: "/blog/comex-stat-dados-comercio-exterior", linkLabel: "Dados COMEX" },
  { term: "DESPACHANTE ADUANEIRO", definition: "Profissional habilitado perante a Receita Federal para representar empresas e pessoas físicas nos procedimentos de desembaraço aduaneiro. É responsável pela correta classificação fiscal e apresentação de documentos.", link: "/blog/despachante-aduaneiro-quanto-custa", linkLabel: "Despachante Aduaneiro" },
  { term: "DRAWBACK", definition: "Regime aduaneiro que permite a importação de mercadorias com suspensão dos tributos pagos na importação, desde que os produtos sejam exportados posteriormente. Existem três modalidades: suspensão, isenção e restituição.", link: "/blog/drawback-regime-aduaneiro-exportacao", linkLabel: "Guia Drawback" },
  { term: "DRAWBACK SETORIAL", definition: "Variante do drawback que abrange um setor inteiro da economia. Permite a importação de insumos com isenção de impostos para posterior exportação, beneficiando toda a cadeia produtiva do setor.", link: "/blog/drawback-regime-aduaneiro-exportacao", linkLabel: "Drawback Setorial" },
  { term: "DTA (Documento de Transferência de Aduana)", definition: "Documento utilizado para transferir mercadorias de um regime aduaneiro para outro, como do depósito alfandegado para o aduaneiro. Fundamental na movimentação interna de mercadorias entre recintos aduaneiros.", link: "/blog/dta-documento-transito-aduaneiro", linkLabel: "DTA" },
  { term: "EX-TARIFÁRIO", definition: "Benefício fiscal concedido a importadores de máquinas e equipamentos que não possuem similar nacional. Permite a redução da alíquota do Imposto de Importação de até 14% para 2%, a critério do Ministério da Economia.", link: "/blog/ex-tarifario-como-solicitar", linkLabel: "Ex-tarifário" },
  { term: "FCI (Ficha de Conteúdo de Importação)", definition: "Documento que informa a composição de um produto importado, incluindo informações sobre o processo de produção e a parcela de conteúdo estrangeiro. É exigida em operações com benefícios fiscais.", link: "/blog/documentos-importacao-exportacao", linkLabel: "Documentos" },
  { term: "FOB (Free on Board)", definition: "Incoterm que indica que o vendedor é responsável pela entrega da mercadoria a bordo do navio no porto de embarque. A partir desse momento, todos os custos e riscos são do comprador.", link: "/blog/incoterms-2026-guia-importacao-exportacao", linkLabel: "Guia Incoterms" },
  { term: "GATT (General Agreement on Tariffs and Trade)", definition: "Acordo Geral sobre Tarifas e Comércio, precursor da OMC. Estabeleceu regras para a redução de barreiras tarifárias e não tarifárias no comércio internacional. Foi sucedido pela OMC em 1995.", link: "/blog/margem-preferencia-acordos-comerciais", linkLabel: "Acordos Comerciais" },
  { term: "HS CODE (Harmonized System)", definition: "Código de 6 dígitos padronizado internacionalmente pela OMA para classificação de mercadorias. Base do sistema NCM brasileiro e HTS americano. Usado em 200+ países para classificação fiscal e estatísticas comerciais.", link: "/blog/classificacao-ncm-guia-completo", linkLabel: "Classificação NCM" },
  { term: "ICMS (Imposto sobre Circulação de Mercadorias e Serviços)", definition: "Imposto estadual que incide sobre importações, com alíquota que varia de 4% a 18% conforme o estado. O ICMS-Importação é recolhido antes do desembaraço aduaneiro. Alguns estados oferecem redução de base de cálculo.", link: "/blog/icms-importacao-estados-brasil", linkLabel: "ICMS por Estado" },
  { term: "IGM (Instrumento de Garantia de Mercadoria)", definition: "Documento que comprova a existência de seguro de transporte para a mercadoria importada. É exigido em determinadas situações pelo Banco Central e pela Receita Federal.", link: "/blog/seguro-internacional-carga-importacao-exportacao", linkLabel: "Seguro" },
  { term: "II (Imposto de Importação)", definition: "Tributo federal que incide sobre mercadorias importadas. A alíquota varia conforme o NCM do produto, podendo ir de 0% a 35%. É calculado sobre o valor aduaneiro (CIF + despesas aduaneiras).", link: "/blog/calcular-imposto-importacao-brasil", linkLabel: "Guia de Impostos" },
  { term: "IPI (Imposto sobre Produtos Industrializados)", definition: "Tributo federal que incide sobre produtos industrializados, tanto nacionais quanto importados. A alíquota varia conforme o NCM. Para importação, é calculado sobre o valor aduaneiro acrescido do II.", link: "/blog/calcular-imposto-importacao-brasil", linkLabel: "Guia de Impostos" },
  { term: "INCOTERMS", definition: "Termos Internacionais de Comércio, definidos pela Câmara de Comércio Internacional (ICC). Estabelecem as responsabilidades entre comprador e vendedor em operações de comércio internacional. Existem 11 incoterms vigentes (2020).", link: "/blog/incoterms-2026-guia-importacao-exportacao", linkLabel: "Guia Incoterms" },
  { term: "INMETRO (Instituto Nacional de Metrologia)", definition: "Órgão federal responsável pela regulamentação de produtos que exigem certificação obrigatória. Produtos como brinquedos, eletroeletrônicos e equipamentos de segurança precisam de certificação INMETRO para importação.", link: "/blog/anvisa-inmetro-importacao-regulamentacoes", linkLabel: "Regulamentações" },
  { term: "INVESTIM", definition: "Sistema eletrônico que controla as operações de financiamento ao comércio exterior, como cartas de crédito, empréstimos e seguros. É gerido pela Carteira de Comércio Exterior do Banco do Brasil.", link: "/blog/carta-de-credito-importacao", linkLabel: "Carta de Crédito" },
  { term: "LEILÃO DE MERCADORIAS", definition: "Procedimento aduaneiro para comercialização de mercadorias apreendidas ou abandonadas. As mercadorias são vendidas ao maior lance em leilão público, geralmente organizado pela Receita Federal.", link: "/blog/leilao-receita-federal-mercadorias", linkLabel: "Leilão" },
  { term: "MERCOSUL", definition: "Mercado Comum do Sul, bloco econômico formado por Brasil, Argentina, Paraguai e Uruguai (Venezuela suspensa). Promove a livre circulação de bens, serviços e pessoas entre os países-membros, com tarifa zero para produtos originários.", link: "/blog/margem-preferencia-acordos-comerciais", linkLabel: "Acordos Comerciais" },
  { term: "NCM (Nomenclatura Comum do Mercosul)", definition: "Sistema de classificação de mercadorias com 8 dígitos, baseado no HS Code internacional. O código NCM determina as alíquotas de impostos, regulamentações e benefícios fiscais para cada produto importado ou exportado no Brasil.", link: "/blog/classificacao-ncm-guia-completo", linkLabel: "Guia NCM Completo" },
  { term: "NF-E (Nota Fiscal Eletrônica)", definition: "Documento fiscal eletrônico que deve ser emitido em todas as operações de circulação de mercadorias. No comércio exterior, a NF-e de importação é emitida após o desembaraço aduaneiro.", link: "/blog/nota-fiscal-importacao", linkLabel: "NF-e" },
  { term: "OEA (Operador Econômico Autorizado)", definition: "Certificação concedida pela Receita Federal a empresas que atendem critérios de segurança e conformidade. Empresas OEA usufruem de benefícios como agilidade no desembaraço aduaneiro e menor intervenção física.", link: "/blog/operador-economico-autorizado-oea", linkLabel: "OEA" },
  { term: "OMC (Organização Mundial do Comércio)", definition: "Organização internacional que regulamenta as regras do comércio entre países. Sucedeu o GATT em 1995. Administra acordos comerciais, resolve disputas e promove negociações multilaterais.", link: "/blog/margem-preferencia-acordos-comerciais", linkLabel: "OMC" },
  { term: "PIS (Programa de Integração Social)", definition: "Tributo federal que incide sobre a importação de mercadorias. A alíquota de PIS-Importação é de 2,10% para a maioria dos produtos. Pode ser cumulativo ou não cumulativo.", link: "/blog/calcular-imposto-importacao-brasil", linkLabel: "PIS/COFINS" },
  { term: "RECOF (Regime de Creditamento de Tributos)", definition: "Regime que permite o creditamento de PIS e COFINS para empresas exportadoras, reduzindo o custo da exportação. Existem duas modalidades: RECOF-SPED e RECOF-Exportação.", link: "/blog/regimes-aduaneiros-especiais-recof-repetro", linkLabel: "RECOF" },
  { term: "REGIME ADUANEIRO", definition: "Conjunto de normas e procedimentos que regulamentam a entrada e saída de mercadorias de um território aduaneiro. No Brasil, existem regimes como depósito, importação temporária, drawback e entreposto.", link: "/blog/regimes-aduaneiros-especiais-recof-repetro", linkLabel: "Regimes Aduaneiros" },
  { term: "REPETRO (Regime Especial de Tributação)", definition: "Regime que permite a importação de bens destinados à exploração de atividades de exploração, apuração, desenvolvimento e produção de petróleo e gás natural com suspensão dos tributos. Empresas do setor petrolífero são os principais beneficiários.", link: "/blog/regimes-aduaneiros-especiais-recof-repetro", linkLabel: "REPETRO" },
  { term: "RESEX (Regime Especial de Simplificação)", definition: "Regime aduaneiro que simplifica os procedimentos de importação para micro e pequenas empresas, com redução de exigências documentais e facilidades no desembaraço aduaneiro.", link: "/blog/regimes-aduaneiros-especiais-recof-repetro", linkLabel: "Regimes Aduaneiros" },
  { term: "RGI (Regras Gerais de Interpretação)", definition: "Conjunto de 6 regras estabelecidas pela OMA para orientar a classificação de mercadorias no Sistema Harmonizado. São fundamentais para determinar o código NCM correto de um produto.", link: "/blog/classificacao-ncm-guia-completo", linkLabel: "Classificação NCM" },
  { term: "SISCOMEX (Sistema Integrado de Comércio Exterior)", definition: "Sistema informatizado que integra todos os órgãos envolvidos no comércio exterior brasileiro. Permite o registro de declarações, licenciamento e controle aduaneiro. O acesso é feito via portal Único Siscomex.", link: "/blog/desembaraco-aduaneiro-como-funciona", linkLabel: "Siscomex" },
  { term: "SPREAD CAMBIAL", definition: "Diferença entre a taxa de câmbio de compra e de venda de moeda estrangeira. Representa o custo da operação cambial para o importador/exportador. Pode ser reduzido com negociação e volume de operações.", link: "/blog/spread-cambial-importacao", linkLabel: "Spread Cambial" },
  { term: "TR (Taxa de Remessa)", definition: "Taxa cobrada pelo Banco Central do Brasil sobre remessas financeiras internacionais. Atualmente é de 0,38% para operações comuns e pode variar conforme o tipo de transação.", link: "/blog/spread-cambial-importacao", linkLabel: "Câmbio" },
  { term: "TUP (Taxa Única Portuária)", definition: "Taxa cobrada pelos portos organizados pela União pela utilização de instalações portuárias. É calculada com base no peso ou volume da mercadoria embarcada ou desembarcada.", link: "/blog/portos-brasil-infraestrutura-logistica", linkLabel: "Portos" },
  { term: "VALOR ADUANEIRO", definition: "Base de cálculo para aplicação dos tributos na importação. É composto pelo valor CIF (custo, seguro e frete) acrescido de despesas aduaneiras como taxas, direitos e contribuições. O II e o IPI são calculados sobre este valor.", link: "/blog/calcular-imposto-importacao-brasil", linkLabel: "Valor Aduaneiro" },
  { term: "VAF (Valor Aduaneiro de Franquia)", definition: "Valor mínimo da mercadoria abaixo do qual não se cobra o Imposto de Importação. Cada país define seus limites de franquia. No Brasil, a franquia para encomendas postais é de até US$ 50.", link: "/blog/calcular-imposto-importacao-brasil", linkLabel: "Valor Aduaneiro" },
  { term: "ZONA FRANCA DE MANAUS (ZFM)", definition: "Regime especial de comércio exterior que oferece incentivos fiscais para empresas que se instalem em Manaus e região. Permite importação com isenção ou redução de impostos federais e estaduais.", link: "/blog/icms-importacao-estados-brasil", linkLabel: "Zona Franca" },
  // ── NOVOS TERMOS ──
  { term: "AFRMM (Adicional ao Frete para Renovação da Marinha Mercante)", definition: "Tributo federal que incide sobre o frete marítimo internacional. A alíquota é de 25% para navegação de longo curso e 10% para cabotagem. O AFRMM é destinado ao desenvolvimento da marinha mercante e da indústria naval brasileira.", link: "/blog/quanto-custa-container-maritimo", linkLabel: "Custos de Container" },
  { term: "AWB (Air Waybill / Conhecimento Aéreo)", definition: "Documento de transporte aéreo internacional que comprova o contrato de transporte entre o embarcador e a companhia aérea. Funciona como recibo da mercadoria, certificado de seguro e guia para desembaraço aduaneiro.", link: "/blog/frete-aereo-internacional", linkLabel: "Frete Aéreo" },
  { term: "BOOKING NOTE (Reserva de Carga)", definition: "Documento que formaliza a reserva de espaço em um navio para transporte de mercadorias. Contém informações como data de embarque, tipo de container, peso, volume e portos de origem e destino.", link: "/blog/frete-maritimo-como-funciona", linkLabel: "Frete Marítimo" },
  { term: "CAPATAZIA", definition: "Serviço portuário de movimentação de mercadorias entre o terminal portuário e o costado do navio. Inclui estiva, desestiva, recebimento e conferência de cargas. A taxa de capatazia é cobrada pelo operador portuário.", link: "/blog/portos-brasil-infraestrutura-logistica", linkLabel: "Portos" },
  { term: "CERTIFICADO DE ORIGEM", definition: "Documento que atesta a origem das mercadorias para fins de preferência tarifária em acordos comerciais. Necessário para obter redução de alíquotas no Mercosul, ALADI e outros blocos.", link: "/blog/certificado-de-origem-brasil", linkLabel: "Certificado de Origem" },
  { term: "CRT (Conhecimento de Transporte Rodoviário)", definition: "Documento fiscal que acompanha o transporte rodoviário de cargas. No comércio exterior, o CRT é utilizado para movimentação de mercadorias entre o porto/aeroporto e o armazém do importador.", link: "/blog/frete-rodoviario-cargas", linkLabel: "Frete Rodoviário" },
  { term: "DEMURRAGE (Sobrestadia Portuária)", definition: "Taxa cobrada quando o container ultrapassa o tempo gratuito de permanência no terminal portuário. O demurrage é cobrado pelo armador e varia conforme o tipo de container e a localização do terminal.", link: "/blog/frete-maritimo-como-funciona", linkLabel: "Frete Marítimo" },
  { term: "DEPÓSITO ALFANDEGADO CERTIFICADO", definition: "Recinto alfandegado onde as mercadorias importadas ou a serem exportadas ficam armazenadas sob controle aduaneiro. O depositário é responsável pela guarda e preservação das cargas.", link: "/blog/portos-brasil-infraestrutura-logistica", linkLabel: "Portos" },
  { term: "DI (Declaração de Importação)", definition: "Documento eletrônico que formaliza o registro da importação no Siscomex. Contém todas as informações da operação: identificação do importador, NCM dos produtos, valor aduaneiro, tributos e regimes aduaneiros aplicados.", link: "/blog/desembaraco-aduaneiro-como-funciona", linkLabel: "Desembaraço" },
  { term: "DTA (Documento de Transferência de Aduana)", definition: "Documento utilizado para transferir mercadorias de um regime aduaneiro para outro, como do depósito alfandegado para o aduaneiro. Fundamental na movimentação interna de mercadorias entre recintos aduaneiros.", link: "/blog/dta-documento-transito-aduaneiro", linkLabel: "DTA" },
  { term: "ENTREPOSTO ADUANEIRO", definition: "Regime aduaneiro especial que permite o armazenamento de mercadorias importadas ou a exportar com suspensão do pagamento de tributos. O entreposto pode ser industrial, comercial ou de distribuição.", link: "/blog/regimes-aduaneiros-especiais-recof-repetro", linkLabel: "Regimes Aduaneiros" },
  { term: "ETA/ETD (Estimated Time of Arrival/Departure)", definition: "Estimativas de horário de chegada (ETA) e saída (ETD) da embarcação no porto. Utilizadas no planejamento logístico para coordenar o desembarque, transporte e armazenagem das mercadorias.", link: "/blog/frete-maritimo-como-funciona", linkLabel: "Frete Marítimo" },
  { term: "FCL (Full Container Load)", definition: "Modalidade de transporte onde o container é carregado exclusivamente com mercadorias de um único embarcador. O frete é cobrado por container cheio, com preço fixo independentemente do peso ou volume da carga.", link: "/blog/frete-maritimo-como-funciona", linkLabel: "FCL/LCL" },
  { term: "GRI (General Rate Increase)", definition: "Aumento geral de tarifas de frete marítimo aplicado por armadores em rotas específicas. O GRI é anunciado com antecedência e impacta diretamente os custos de importação e exportação.", link: "/blog/frete-maritimo-como-funciona", linkLabel: "Frete Marítimo" },
  { term: "HAWB (House Air Waybill)", definition: "Conhecimento aéreo emitido por um agente de carga ou consolidador, que agrupa mercadorias de vários embarcadores em um único embarque. Complementa o MAWB (Master Air Waybill) da companhia aérea.", link: "/blog/frete-aereo-internacional", linkLabel: "Frete Aéreo" },
  { term: "LA (Licenciamento Ambiental para Importação)", definition: "Autorização prévia exigida pelo IBAMA para importação de produtos que possam causar impacto ambiental, como defensivos agrícolas, produtos químicos e resíduos. Essencial para cumprir a legislação ambiental brasileira.", link: "/blog/anvisa-inmetro-importacao-regulamentacoes", linkLabel: "Regulamentações" },
  { term: "LCL (Less than Container Load)", definition: "Modalidade de transporte onde mercadorias de diferentes embarcadores compartilham o mesmo container. Ideal para cargas menores que não justificam o custo de um container inteiro. O frete é calculado por metro cúbico ou tonelada.", link: "/blog/frete-maritimo-como-funciona", linkLabel: "FCL/LCL" },
  { term: "MARPOL (International Convention for the Prevention of Pollution from Ships)", definition: "Convenção internacional para prevenção da poluição por navios. Estabelece regras para descarte de resíduos, emissões e operações portuárias. O cumprimento do MARPOL é fiscalizado pelas autoridades portuárias.", link: "/blog/marpol-convencao-poluicao-navios", linkLabel: "MARPOL" },
  { term: "MDF-E (Manifesto Eletrônico de Documentos Fiscais)", definition: "Documento fiscal eletrônico obrigatório no transporte rodoviário interestadual de cargas. No comércio exterior, o MDF-e vincula os conhecimentos de transporte e permite o rastreamento da carga.", link: "/blog/frete-rodoviario-cargas", linkLabel: "Frete Rodoviário" },
  { term: "NVOCC (Non-Vessel Operating Common Carrier)", definition: "Operador de transporte que emite conhecimento de embarque próprio sem possuir navios. Consolida cargas de diversos clientes e negocia espaço com armadores, oferecendo fretes mais competitivos.", link: "/blog/nvocc-agente-carga", linkLabel: "NVOCC" },
  { term: "PACKING LIST (Romaneio de Carga)", definition: "Documento que detalha o conteúdo da embalagem de embarque, incluindo quantidade, peso, volume e descrição de cada item. Essencial para a conferência da carga na importação, exportação e desembaraço aduaneiro.", link: "/blog/documentos-importacao-exportacao", linkLabel: "Documentos" },
  { term: "PARAMETRIZAÇÃO ADUANEIRA", definition: "Sistema de gerenciamento de risco da Receita Federal que define o canal de conferência das declarações de importação: verde (desembaraço automático), amarelo (documental), vermelho (físico) e cinza (fiscalização especial).", link: "/blog/desembaraco-aduaneiro-como-funciona", linkLabel: "Desembaraço" },
  { term: "PORTO SECO (Estação Aduaneira do Interior)", definition: "Recinto alfandegado localizado fora da zona primária (portos e aeroportos). Permite o desembaraço aduaneiro de mercadorias importadas ou a exportar em áreas de maior concentração industrial.", link: "/blog/portos-brasil-infraestrutura-logistica", linkLabel: "Portos" },
  { term: "SHIPPING INSTRUCTION", definition: "Instrução de embarque fornecida pelo exportador ao agente de carga ou armador. Contém detalhes da mercadoria, documentos exigidos, instruções especiais de manuseio e dados para emissão do conhecimento de embarque.", link: "/blog/frete-maritimo-como-funciona", linkLabel: "Frete Marítimo" },
  { term: "SISCOMEX EXPORTAÇÃO", definition: "Módulo do Siscomex destinado ao registro e controle das exportações brasileiras. Permite o registro da Declaração Única de Exportação (DUE), vinculação de documentos e acompanhamento do despacho aduaneiro de exportação.", link: "/blog/desembaraco-aduaneiro-como-funciona", linkLabel: "Siscomex" },
  { term: "SISCOMEX IMPORTACÃO", definition: "Módulo do Siscomex para registro e controle das importações brasileiras. Permite o registro da Declaração de Importação (DI), pagamento de tributos, licenciamento e acompanhamento do despacho aduaneiro.", link: "/blog/desembaraco-aduaneiro-como-funciona", linkLabel: "Siscomex" },
  { term: "TAXA SISCOMEX", definition: "Taxa cobrada pela Receita Federal para cada Declaração de Importação (DI) ou Declaração Única de Exportação (DUE) registrada. O valor é atualmente de R$ 30,00 por declaração e R$ 10,00 por adição de NCM.", link: "/blog/desembaraco-aduaneiro-como-funciona", linkLabel: "Siscomex" },
  { term: "THC (Terminal Handling Charge)", definition: "Taxa de movimentação de containers no terminal portuário. O THC cobre os custos de movimentação entre o navio e o pátio, incluindo estiva, desestiva e armazenagem inicial. É cobrado pelo operador portuário.", link: "/blog/quanto-custa-container-maritimo", linkLabel: "Custos Portuários" },
  { term: "THC (Terminal Handling Charge) — Importação", definition: "Taxa portuária específica para importação, cobrada pela movimentação do container do navio até o pátio do terminal. Varia conforme o porto, tipo de container e operador. Impacta diretamente o custo CIF da mercadoria.", link: "/blog/quanto-custa-container-maritimo", linkLabel: "Custos Portuários" },
  { term: "VISTORIA ADUANEIRA", definition: "Procedimento de fiscalização física da mercadoria importada pela Receita Federal. Pode ser realizada no canal vermelho (conferência física) ou cinza (fiscalização especial), incluindo verificação de peso, volume e classificação fiscal.", link: "/blog/desembaraco-aduaneiro-como-funciona", linkLabel: "Desembaraço" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.02 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function GlossarioPage() {
  const [search, setSearch] = useState("");

  useSeo({
    title: "Glossário de Comércio Exterior | TRADEXA",
    description: "Mais de 80 termos essenciais do comércio exterior explicados: NCM, HS Code, drawback, OEA, AFRMM, THC, demurrage, incoterms, Siscomex e muito mais.",
    canonical: "https://www.tradexa.com.br/glossario",
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "DefinedTermSet",
      name: "Glossário de Comércio Exterior",
      description:
        "Dicionário completo com mais de 80 termos do comércio exterior brasileiro.",
    },
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return glossaryTerms;
    const q = search.toLowerCase();
    return glossaryTerms.filter(
      (t) =>
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q)
    );
  }, [search]);

  const grouped = useMemo(() => {
    const map = new Map<string, GlossaryTerm[]>();
    filtered.forEach((t) => {
      const letter = t.term.charAt(0).toUpperCase();
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(t);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <SiteLayout>
      <div className="min-h-screen bg-white text-slate-800">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#D80E16]/5 to-white pt-24 pb-16">
          <div className="absolute inset-0 pointer-events-none">
            <ParticleCanvasThemed opacity={0.15} particleCount={30} color="216,14,22" connectionDist={120} />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-[#D80E16]/5 border border-[#D80E16]/20 rounded-full px-4 py-1.5 mb-6">
                <BookOpen className="w-4 h-4 text-[#D80E16]" />
                <span className="text-sm text-[#D80E16] font-medium">Glossário COMEX</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                Dicionário de <span className="text-[#D80E16]">Comércio Exterior</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8">
                Mais de 60 termos essenciais explicados para importadores, exportadores e profissionais do comex.
              </p>
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar termo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-12 pr-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#D80E16]/50 transition-colors"
                />
              </div>
              <p className="text-sm text-slate-400 mt-3">{filtered.length} termos encontrados</p>
            </motion.div>
          </div>
        </section>

        {/* Letter Index */}
        <section className="max-w-4xl mx-auto px-4 mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {allLetters.map((letter) => {
              const hasTerms = grouped.some(([l]) => l === letter);
              return (
                <a
                  key={letter}
                  href={`#letter-${letter}`}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                    hasTerms
                      ? "bg-[#D80E16]/10 text-[#D80E16] hover:bg-[#D80E16]/20 border border-[#D80E16]/30"
                      : "bg-white/5 text-slate-500 cursor-default"
                  }`}
                >
                  {letter}
                </a>
              );
            })}
          </div>
        </section>

        {/* Terms */}
        <section className="max-w-4xl mx-auto px-4 pb-24">
          {grouped.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Nenhum termo encontrado para "{search}"</p>
            </div>
          ) : (
            <motion.div variants={container} initial="hidden" animate="show">
              {grouped.map(([letter, terms]) => (
                <div key={letter} id={`letter-${letter}`} className="mb-12 scroll-mt-24">
                  <h2 className="text-3xl font-extrabold text-[#D80E16] mb-6 flex items-center gap-3">
                    <span className="w-12 h-12 rounded-xl bg-[#D80E16]/5 border border-[#D80E16]/20 flex items-center justify-center">
                      {letter}
                    </span>
                  </h2>
                  <div className="space-y-4">
                    {terms.map((t) => (
                      <motion.div
                        key={t.term}
                        variants={item}
                        className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 hover:border-[#D80E16]/40 transition-colors group"
                      >
                        <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-[#D80E16] transition-colors">
                          {t.term}
                        </h3>
                        <p className="text-slate-500 text-sm leading-relaxed">{t.definition}</p>
                        {t.link && (
                          <Link
                            to={t.link}
                            className="inline-flex items-center gap-1.5 mt-3 text-sm text-[#D80E16] hover:text-[#b80c12] transition-colors"
                          >
                            {t.linkLabel || "Saiba mais"}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </section>

        {/* CTA */}
        <section className="relative py-20 bg-gradient-to-b from-slate-50 to-[#D80E16]/5">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-extrabold mb-4">
              Precisa classificar um <span className="text-[#D80E16]">produto</span>?
            </h2>
            <p className="text-slate-500 mb-8 max-w-xl mx-auto">
              Use o Classificador NCM da TRADEXA para descobrir o código correto do seu produto em segundos.
            </p>
            <Link
              to="/landing/ncm-classifier"
              className="inline-flex items-center gap-2 bg-[#D80E16] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#b80c12] transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              Classificar Produto
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
