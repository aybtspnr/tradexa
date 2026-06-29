#!/usr/bin/env python3
"""
Integrate 30 new blog posts into postMeta.ts, postContentMap.ts, and prerender.mjs.
Line-based insertion — battle-tested Jun 28-29 2026.
Run from project-clean/ directory.
"""
import re, glob, subprocess

DATE = "2026-06-29"

POSTS = [
    # === Cluster 1: Dispositivos Médicos e Saúde ===
    {
        "slug": "dispositivos-medicos-classificacao-anvisa-importacao-brasil",
        "title": "Dispositivos Médicos: Classificação ANVISA e Regras de Importação no Brasil",
        "excerpt": "Guia completo sobre classificação ANVISA de dispositivos médicos (RDC 830/2023), registro vs notificação, BPF, CBPF, tributação NCM e processo de importação de materiais médico-hospitalares no Brasil.",
        "name": "Dispositivos Médicos — Classificação ANVISA e Importação",
        "desc": "Guia completo sobre classificação ANVISA de dispositivos médicos (RDC 830/2023), registro vs notificação, BPF, CBPF, tributação NCM e processo de importação de materiais médico-hospitalares no Brasil.",
        "readTime": 14,
        "tags": ["Dispositivos Médicos", "ANVISA", "Importação", "Saúde", "Comércio Exterior"]
    },
    {
        "slug": "equipamentos-hospitalares-importacao-brasil-ncm-tributacao",
        "title": "Equipamentos Hospitalares: Importação, NCM e Tributação no Brasil",
        "excerpt": "Guia completo para importar equipamentos hospitalares: classificação NCM (Capítulos 84, 85, 90), tributação II/IPI/PIS/COFINS/ICMS, certificação INMETRO e ANVISA, fornecedores globais e logística.",
        "name": "Equipamentos Hospitalares — Importação e NCM",
        "desc": "Guia completo para importar equipamentos hospitalares: classificação NCM (Capítulos 84, 85, 90), tributação II/IPI/PIS/COFINS/ICMS, certificação INMETRO e ANVISA, fornecedores globais e logística.",
        "readTime": 14,
        "tags": ["Importação", "Equipamentos Hospitalares", "INMETRO", "ANVISA", "Saúde", "Comércio Exterior"]
    },
    {
        "slug": "proteses-orteses-importacao-brasil-classificacao-regulacao",
        "title": "Próteses e Órteses: Importação, Classificação Regulatória e Tributação no Brasil",
        "excerpt": "Guia completo sobre importação de próteses e órteses: classificação ANVISA classe II/III, NCM 9021, registro sanitário, BPF, ensaios clínicos, tributação e rastreabilidade de implantes no Brasil.",
        "name": "Próteses e Órteses — Importação e Regulação ANVISA",
        "desc": "Guia completo sobre importação de próteses e órteses: classificação ANVISA classe II/III, NCM 9021, registro sanitário, BPF, ensaios clínicos, tributação e rastreabilidade de implantes no Brasil.",
        "readTime": 15,
        "tags": ["Próteses", "Órteses", "ANVISA", "Importação", "Saúde", "Comércio Exterior"]
    },
    {
        "slug": "kits-diagnosticos-laboratoriais-importacao-brasil-anvisa",
        "title": "Kits de Diagnóstico Laboratorial: Importação no Brasil e Regulação ANVISA",
        "excerpt": "Guia sobre importação de kits para diagnóstico in vitro (IVD): classificação ANVISA I a IV, NCM 3822 e 3002, registro vs notificação, BPF específicas, validação de fornecedores e tributação.",
        "name": "Kits de Diagnóstico — Importação e Regulação ANVISA",
        "desc": "Guia sobre importação de kits para diagnóstico in vitro (IVD): classificação ANVISA I a IV, NCM 3822 e 3002, registro vs notificação, BPF específicas, validação de fornecedores e tributação.",
        "readTime": 15,
        "tags": ["Kits de Diagnóstico", "ANVISA", "Importação", "Saúde", "Laboratório", "Comércio Exterior"]
    },
    {
        "slug": "ortopedia-tecnica-importacao-materiais-hospitalares",
        "title": "Ortopedia Técnica: Importação de Materiais Hospitalares e Equipamentos Ortopédicos",
        "excerpt": "Guia completo sobre importação de materiais ortopédicos: implantes, placas, parafusos, próteses de quadril/joelho, NCM 9021, certificações ISO 13485 e rastreabilidade de implantes no Brasil.",
        "name": "Ortopedia Técnica — Importação de Materiais Hospitalares",
        "desc": "Guia completo sobre importação de materiais ortopédicos: implantes, placas, parafusos, próteses de quadril/joelho, NCM 9021, certificações ISO 13485 e rastreabilidade de implantes no Brasil.",
        "readTime": 14,
        "tags": ["Ortopedia", "Implantes", "Importação", "ANVISA", "Saúde", "Comércio Exterior"]
    },
    # === Cluster 2: Portos Brasileiros ===
    {
        "slug": "porto-rio-grande-oportunidades-importacao-exportacao",
        "title": "Porto do Rio Grande: Oportunidades de Importação e Exportação no Sul do Brasil",
        "excerpt": "Guia sobre o Porto do Rio Grande (RS): complexo portuário, dragagem, terminais especializados, principais cargas (soja, celulose, fertilizantes), incentivos estaduais e inteligência logística.",
        "name": "Porto do Rio Grande — Oportunidades no Sul do Brasil",
        "desc": "Guia sobre o Porto do Rio Grande (RS): complexo portuário, dragagem, terminais especializados, principais cargas (soja, celulose, fertilizantes), incentivos estaduais e inteligência logística.",
        "readTime": 14,
        "tags": ["Portos", "Rio Grande", "Logística", "Exportação", "Importação", "Comércio Exterior"]
    },
    {
        "slug": "porto-pecem-ceara-infraestrutura-logistica-comex",
        "title": "Porto do Pecém (CE): Infraestrutura e Logística no Comércio Exterior do Nordeste",
        "excerpt": "Guia sobre o Complexo do Pecém: terminal de contêineres, ZPE Ceará, hub de hidrogênio verde, incentivos fiscais, conexão ferroviária e cargas estratégicas do Nordeste brasileiro.",
        "name": "Porto do Pecém — Infraestrutura Logística no Nordeste",
        "desc": "Guia sobre o Complexo do Pecém: terminal de contêineres, ZPE Ceará, hub de hidrogênio verde, incentivos fiscais, conexão ferroviária e cargas estratégicas do Nordeste brasileiro.",
        "readTime": 15,
        "tags": ["Portos", "Pecém", "Ceará", "Logística", "Exportação", "Comércio Exterior"]
    },
    {
        "slug": "porto-vitoria-tubarao-exportacao-minerios-granito",
        "title": "Porto de Vitória e Tubarão: Exportação de Minérios, Granito e Café",
        "excerpt": "Guia sobre o Complexo Vitória/Tubarão (ES): maior terminal de minério de ferro do mundo, granito ornamental, café conilon/arábica, infraestrutura ferroviária EFVM e inteligência de trade.",
        "name": "Porto de Vitória e Tubarão — Minérios e Café",
        "desc": "Guia sobre o Complexo Vitória/Tubarão (ES): maior terminal de minério de ferro do mundo, granito ornamental, café conilon/arábica, infraestrutura ferroviária EFVM e inteligência de trade.",
        "readTime": 14,
        "tags": ["Portos", "Vitória", "Tubarão", "Minérios", "Café", "Comércio Exterior"]
    },
    {
        "slug": "porto-salvador-aratu-bahia-logistica-nordeste",
        "title": "Porto de Salvador e Aratu (BA): Logística e Comércio Exterior no Nordeste",
        "excerpt": "Guia sobre o complexo portuário baiano: Porto de Salvador (contêineres) e Aratu (granéis), CODEBA, polo petroquímico de Camaçari, ZPE e cabotagem no Nordeste brasileiro.",
        "name": "Porto de Salvador e Aratu — Logística na Bahia",
        "desc": "Guia sobre o complexo portuário baiano: Porto de Salvador (contêineres) e Aratu (granéis), CODEBA, polo petroquímico de Camaçari, ZPE e cabotagem no Nordeste brasileiro.",
        "readTime": 14,
        "tags": ["Portos", "Salvador", "Aratu", "Bahia", "Logística", "Comércio Exterior"]
    },
    {
        "slug": "portos-secos-estacoes-aduaneiras-funcionamento",
        "title": "Portos Secos no Brasil: Estações Aduaneiras de Interior e Seu Funcionamento",
        "excerpt": "Guia completo sobre portos secos (EADI): funcionamento como recinto alfandegado, desembaraço no interior, regimes especiais, principais unidades em SP/MG/PR/SC/RS e vantagens logísticas.",
        "name": "Portos Secos — Estações Aduaneiras de Interior",
        "desc": "Guia completo sobre portos secos (EADI): funcionamento como recinto alfandegado, desembaraço no interior, regimes especiais, principais unidades em SP/MG/PR/SC/RS e vantagens logísticas.",
        "readTime": 15,
        "tags": ["Portos Secos", "EADI", "Logística", "Desembaraço Aduaneiro", "Importação", "Comércio Exterior"]
    },
    # === Cluster 3: Países Africanos ===
    {
        "slug": "comercio-brasil-comores-oportunidades-africa",
        "title": "Comércio Brasil-Ilhas Comores: Oportunidades no Oceano Índico Africano",
        "excerpt": "Guia de comércio entre Brasil e Comores: economia do arquipélago (baunilha, cravo, ylang-ylang), oportunidades para exportadores brasileiros, logística e acordos na África Oriental.",
        "name": "Comércio Brasil-Comores — Oportunidades na África",
        "desc": "Guia de comércio entre Brasil e Comores: economia do arquipélago (baunilha, cravo, ylang-ylang), oportunidades para exportadores brasileiros, logística e acordos na África Oriental.",
        "readTime": 12,
        "tags": ["Comores", "África", "Exportação", "Mercados Emergentes", "Comércio Exterior"]
    },
    {
        "slug": "comercio-brasil-niger-recursos-naturais-minerais",
        "title": "Comércio Brasil-Níger: Recursos Naturais, Mineração e Oportunidades Comerciais",
        "excerpt": "Guia de comércio entre Brasil e Níger: urânio (7º maior produtor), petróleo, agricultura, logística pelo Porto de Cotonou, acordos CEDEAO e oportunidades para exportação brasileira no Sahel.",
        "name": "Comércio Brasil-Níger — Mineração e Oportunidades",
        "desc": "Guia de comércio entre Brasil e Níger: urânio (7º maior produtor), petróleo, agricultura, logística pelo Porto de Cotonou, acordos CEDEAO e oportunidades para exportação brasileira no Sahel.",
        "readTime": 12,
        "tags": ["Níger", "África", "Mineração", "Exportação", "Mercados Emergentes", "Comércio Exterior"]
    },
    {
        "slug": "comercio-brasil-mali-agricultura-recursos-minerais",
        "title": "Comércio Brasil-Mali: Agricultura, Recursos Minerais e Oportunidades na África Ocidental",
        "excerpt": "Guia de comércio entre Brasil e Mali: ouro (3º maior produtor africano), algodão, agricultura, logística por Dacar/Abidjan, desafios de segurança e oportunidades pós-conflito no Sahel.",
        "name": "Comércio Brasil-Mali — Agricultura e Mineração",
        "desc": "Guia de comércio entre Brasil e Mali: ouro (3º maior produtor africano), algodão, agricultura, logística por Dacar/Abidjan, desafios de segurança e oportunidades pós-conflito no Sahel.",
        "readTime": 13,
        "tags": ["Mali", "África", "Mineração", "Exportação", "Agronegócio", "Comércio Exterior"]
    },
    {
        "slug": "comercio-brasil-sudao-oportunidades-agricolas-minerais",
        "title": "Comércio Brasil-Sudão: Oportunidades Agrícolas, Minerais e Comerciais",
        "excerpt": "Guia de comércio entre Brasil e Sudão: goma arábica (maior produtor), gergelim, ouro, petróleo, Porto de Port Sudan, acordos COMESA e oportunidades na reconstrução pós-conflito.",
        "name": "Comércio Brasil-Sudão — Oportunidades no Nordeste Africano",
        "desc": "Guia de comércio entre Brasil e Sudão: goma arábica (maior produtor), gergelim, ouro, petróleo, Porto de Port Sudan, acordos COMESA e oportunidades na reconstrução pós-conflito.",
        "readTime": 13,
        "tags": ["Sudão", "África", "Agricultura", "Mineração", "Exportação", "Comércio Exterior"]
    },
    {
        "slug": "comercio-brasil-guine-equatorial-oportunidades",
        "title": "Comércio Brasil-Guiné Equatorial: Petróleo, Gás e Oportunidades na África Central",
        "excerpt": "Guia de comércio entre Brasil e Guiné Equatorial (CPLP): petróleo e gás (OPEP), importação de alimentos, logística no Golfo da Guiné, oportunidades para agroindústria brasileira na África lusófona.",
        "name": "Comércio Brasil-Guiné Equatorial — Petróleo e CPLP",
        "desc": "Guia de comércio entre Brasil e Guiné Equatorial (CPLP): petróleo e gás (OPEP), importação de alimentos, logística no Golfo da Guiné, oportunidades para agroindústria brasileira na África lusófona.",
        "readTime": 12,
        "tags": ["Guiné Equatorial", "África", "CPLP", "Petróleo", "Exportação", "Comércio Exterior"]
    },
    # === Cluster 4: Compliance e Direito Aduaneiro ===
    {
        "slug": "direito-aduaneiro-infracao-multa-processo",
        "title": "Direito Aduaneiro: Infrações, Multas e Processo Administrativo Fiscal",
        "excerpt": "Guia completo sobre direito aduaneiro brasileiro: classificação de infrações (DL 37/66), multas (Lei 10.833/03), PAF etapas, denúncia espontânea, prescrição e estratégias para evitar autuações fiscais.",
        "name": "Direito Aduaneiro — Infrações, Multas e PAF",
        "desc": "Guia completo sobre direito aduaneiro brasileiro: classificação de infrações (DL 37/66), multas (Lei 10.833/03), PAF etapas, denúncia espontânea, prescrição e estratégias para evitar autuações fiscais.",
        "readTime": 15,
        "tags": ["Direito Aduaneiro", "Infrações", "Multas", "Compliance", "Importação", "Comércio Exterior"]
    },
    {
        "slug": "due-diligence-importador-compliance-cadeia",
        "title": "Due Diligence de Importadores: Compliance na Cadeia de Suprimentos Internacional",
        "excerpt": "Guia de due diligence para importadores: verificação de sanções (OFAC, ONU), background check de fornecedores, certificações ESG, Lei Anticorrupção 12.846/13 e rastreabilidade na cadeia global.",
        "name": "Due Diligence de Importadores — Compliance Internacional",
        "desc": "Guia de due diligence para importadores: verificação de sanções (OFAC, ONU), background check de fornecedores, certificações ESG, Lei Anticorrupção 12.846/13 e rastreabilidade na cadeia global.",
        "readTime": 14,
        "tags": ["Due Diligence", "Compliance", "Importação", "Fornecedores", "ESG", "Comércio Exterior"]
    },
    {
        "slug": "investigacao-fraude-aduaneira-controle",
        "title": "Investigação de Fraude Aduaneira: Controle, Fiscalização e Consequências",
        "excerpt": "Guia sobre fraude aduaneira no Brasil: subfaturamento, superfaturamento, falsificação de NCM, contrabando e descaminho, fiscalização RFB, canais de parametrização e penalidades criminais.",
        "name": "Investigação de Fraude Aduaneira — Controle e Fiscalização",
        "desc": "Guia sobre fraude aduaneira no Brasil: subfaturamento, superfaturamento, falsificação de NCM, contrabando e descaminho, fiscalização RFB, canais de parametrização e penalidades criminais.",
        "readTime": 14,
        "tags": ["Fraude Aduaneira", "Fiscalização", "RFB", "Compliance", "Importação", "Comércio Exterior"]
    },
    {
        "slug": "prevencao-lavagem-dinheiro-comex-placa",
        "title": "Prevenção à Lavagem de Dinheiro no Comércio Exterior: Regras e Controles PLD/FT",
        "excerpt": "Guia de PLD no comex: Lei 9.613/98, COAF, operações suspeitas (superfaturamento, triangularização), due diligence KYC/KYE, comunicações obrigatórias e penalidades por não conformidade.",
        "name": "Prevenção à Lavagem de Dinheiro no Comex — PLD/FT",
        "desc": "Guia de PLD no comex: Lei 9.613/98, COAF, operações suspeitas (superfaturamento, triangularização), due diligence KYC/KYE, comunicações obrigatórias e penalidades por não conformidade.",
        "readTime": 14,
        "tags": ["Lavagem de Dinheiro", "PLD", "COAF", "Compliance", "Importação", "Comércio Exterior"]
    },
    {
        "slug": "conduta-etica-codigo-fornecedores-cadeia-internacional",
        "title": "Conduta Ética e Código de Fornecedores na Cadeia Internacional: Compliance e Reputação",
        "excerpt": "Guia de conduta ética para cadeias internacionais: código de fornecedores, Lei Anticorrupção 12.846/13, FCPA, UK Bribery Act, trabalho análogo à escravidão e riscos reputacionais no comex.",
        "name": "Conduta Ética — Código de Fornecedores no Comex",
        "desc": "Guia de conduta ética para cadeias internacionais: código de fornecedores, Lei Anticorrupção 12.846/13, FCPA, UK Bribery Act, trabalho análogo à escravidão e riscos reputacionais no comex.",
        "readTime": 14,
        "tags": ["Conduta Ética", "Fornecedores", "Compliance", "Anticorrupção", "ESG", "Comércio Exterior"]
    },
    # === Cluster 5: Economia Digital e Criptoativos ===
    {
        "slug": "real-digital-impacto-contratos-internacionais-cambio",
        "title": "Real Digital e Drex: Impacto nos Contratos Internacionais e Operações de Câmbio no Comex",
        "excerpt": "Guia sobre o Drex (CBDC brasileira): diferença para criptomoedas, smart contracts em câmbio, tokenização de contratos de exportação/importação, Pix Internacional e impacto no trade finance.",
        "name": "Real Digital e Drex — Impacto no Câmbio e Contratos",
        "desc": "Guia sobre o Drex (CBDC brasileira): diferença para criptomoedas, smart contracts em câmbio, tokenização de contratos de exportação/importação, Pix Internacional e impacto no trade finance.",
        "readTime": 13,
        "tags": ["Real Digital", "Drex", "Câmbio", "CBDC", "Trade Finance", "Comércio Exterior"]
    },
    {
        "slug": "tokenizacao-mercadorias-comex-blockchain-comercio",
        "title": "Tokenização de Mercadorias no Comércio Exterior: Blockchain e Novas Fronteiras",
        "excerpt": "Guia sobre tokenização de mercadorias no comex: tokenização de carga e recebíveis, trade finance blockchain, contratos inteligentes em LC, e-BL tokenizado e futuro da tokenização de commodities.",
        "name": "Tokenização de Mercadorias — Blockchain no Comex",
        "desc": "Guia sobre tokenização de mercadorias no comex: tokenização de carga e recebíveis, trade finance blockchain, contratos inteligentes em LC, e-BL tokenizado e futuro da tokenização de commodities.",
        "readTime": 13,
        "tags": ["Tokenização", "Blockchain", "Trade Finance", "Inovação", "Commodities", "Comércio Exterior"]
    },
    {
        "slug": "stablecoin-trade-finance-moedas-digitais",
        "title": "Stablecoins e Moedas Digitais no Trade Finance: O Futuro dos Pagamentos Internacionais",
        "excerpt": "Guia sobre stablecoins (USDC, USDT, DAI) no comex: pagamentos cross-border, câmbio digital, regulação brasileira (BCB), tributação de criptoativos e comparação com canais tradicionais de pagamento.",
        "name": "Stablecoins no Trade Finance — Pagamentos Internacionais",
        "desc": "Guia sobre stablecoins (USDC, USDT, DAI) no comex: pagamentos cross-border, câmbio digital, regulação brasileira (BCB), tributação de criptoativos e comparação com canais tradicionais de pagamento.",
        "readTime": 14,
        "tags": ["Stablecoins", "Trade Finance", "Criptomoedas", "Câmbio", "Pagamentos", "Comércio Exterior"]
    },
    {
        "slug": "fintech-cambio-remessa-transferencia-internacional",
        "title": "Fintechs de Câmbio: Remessa Internacional e Transferências no Comércio Exterior",
        "excerpt": "Guia sobre fintechs de câmbio no Brasil: Husky, Wise, Remessa Online, Payoneer; autorização BCB, IOF, contrato de câmbio eletrônico e vantagens frente a bancos tradicionais para remessas comerciais.",
        "name": "Fintechs de Câmbio — Remessa e Transferência Internacional",
        "desc": "Guia sobre fintechs de câmbio no Brasil: Husky, Wise, Remessa Online, Payoneer; autorização BCB, IOF, contrato de câmbio eletrônico e vantagens frente a bancos tradicionais para remessas comerciais.",
        "readTime": 14,
        "tags": ["Fintech", "Câmbio", "Remessa", "Transferência Internacional", "BCB", "Comércio Exterior"]
    },
    {
        "slug": "pagamento-internacional-digital-cartoes-wallet",
        "title": "Pagamento Internacional Digital: Cartões, Wallets e Meios Digitais no Comércio Exterior",
        "excerpt": "Guia de pagamentos digitais no comex: cartão corporativo B2B, multi-currency wallets, Pix Internacional, IOF por modalidade e comparativo de custos (wire vs cartão vs wallet vs stablecoin).",
        "name": "Pagamento Internacional Digital — Cartões e Wallets",
        "desc": "Guia de pagamentos digitais no comex: cartão corporativo B2B, multi-currency wallets, Pix Internacional, IOF por modalidade e comparativo de custos (wire vs cartão vs wallet vs stablecoin).",
        "readTime": 13,
        "tags": ["Pagamentos Digitais", "Cartões", "Wallets", "Fintech", "Câmbio", "Comércio Exterior"]
    },
    # === Cluster 6: Mudanças Climáticas e Resiliência ===
    {
        "slug": "mudancas-climaticas-cadeias-suprimentos-impacto",
        "title": "Mudanças Climáticas e Cadeias de Suprimentos: Impactos no Comércio Exterior Brasileiro",
        "excerpt": "Guia sobre impactos das mudanças climáticas no comex brasileiro: secas na Amazônia e navegação fluvial, quebra de safras, CBAM da UE, precificação de carbono e riscos de transição nas exportações.",
        "name": "Mudanças Climáticas — Impacto nas Cadeias de Suprimentos",
        "desc": "Guia sobre impactos das mudanças climáticas no comex brasileiro: secas na Amazônia e navegação fluvial, quebra de safras, CBAM da UE, precificação de carbono e riscos de transição nas exportações.",
        "readTime": 15,
        "tags": ["Mudanças Climáticas", "Cadeia de Suprimentos", "CBAM", "Carbono", "Exportação", "Comércio Exterior"]
    },
    {
        "slug": "seguro-parametrico-comex-riscos-naturais",
        "title": "Seguro Paramétrico no Comércio Exterior: Cobertura Contra Riscos Naturais e Climáticos",
        "excerpt": "Guia sobre seguro paramétrico no comex: diferença do seguro tradicional, parâmetros (vento, precipitação, ondas), aplicações em safras agrícolas, logística portuária e cadeia do frio para exportação.",
        "name": "Seguro Paramétrico — Riscos Naturais no Comex",
        "desc": "Guia sobre seguro paramétrico no comex: diferença do seguro tradicional, parâmetros (vento, precipitação, ondas), aplicações em safras agrícolas, logística portuária e cadeia do frio para exportação.",
        "readTime": 14,
        "tags": ["Seguro Paramétrico", "Riscos Climáticos", "Agronegócio", "Exportação", "Logística", "Comércio Exterior"]
    },
    {
        "slug": "continuidade-negocios-internacional-disrupcao-cadeia",
        "title": "Continuidade de Negócios Internacional: Estratégias Contra Disrupções na Cadeia de Suprimentos",
        "excerpt": "Guia de BCP para comex: diversificação de fornecedores, near-shoring, estoque de segurança, cláusulas de force majeure, planos de contingência logísticos e certificação ISO 22301 para resiliência global.",
        "name": "Continuidade de Negócios — Estratégias Contra Disrupções",
        "desc": "Guia de BCP para comex: diversificação de fornecedores, near-shoring, estoque de segurança, cláusulas de force majeure, planos de contingência logísticos e certificação ISO 22301 para resiliência global.",
        "readTime": 14,
        "tags": ["Continuidade de Negócios", "BCP", "Disrupção", "Fornecedores", "Logística", "Comércio Exterior"]
    },
    {
        "slug": "eventos-climaticos-extremos-logistica-portuaria",
        "title": "Eventos Climáticos Extremos e Logística Portuária: Riscos e Adaptação no Brasil",
        "excerpt": "Guia sobre eventos climáticos extremos nos portos brasileiros: ressacas no Sul, secas na Amazônia, enchentes no RS, infraestrutura resiliente, sistemas de alerta e planos de contingência portuária.",
        "name": "Eventos Climáticos Extremos — Riscos na Logística Portuária",
        "desc": "Guia sobre eventos climáticos extremos nos portos brasileiros: ressacas no Sul, secas na Amazônia, enchentes no RS, infraestrutura resiliente, sistemas de alerta e planos de contingência portuária.",
        "readTime": 15,
        "tags": ["Eventos Climáticos", "Portos", "Logística", "Riscos", "Infraestrutura", "Comércio Exterior"]
    },
    {
        "slug": "sustentabilidade-adaptacao-cadeias-comex-riscos-climaticos",
        "title": "Sustentabilidade e Adaptação: Estratégias Climáticas para Cadeias de Comércio Exterior",
        "excerpt": "Guia de adaptação climática para o comex: descarbonização logística, créditos de carbono (SBCE), compliance com EUDR, rastreabilidade de emissões, selos verdes e supply chain finance sustentável.",
        "name": "Sustentabilidade e Adaptação — Estratégias Climáticas",
        "desc": "Guia de adaptação climática para o comex: descarbonização logística, créditos de carbono (SBCE), compliance com EUDR, rastreabilidade de emissões, selos verdes e supply chain finance sustentável.",
        "readTime": 15,
        "tags": ["Sustentabilidade", "Adaptação Climática", "Carbono", "EUDR", "ESG", "Comércio Exterior"]
    },
]


def build_meta_entry(p):
    tags_str = ", ".join(f'"{t}"' for t in p["tags"])
    return f'  {{ slug: "{p["slug"]}", title: "{p["title"]}", excerpt: "{p["excerpt"]}", date: "{DATE}", readTime: {p["readTime"]}, tags: [{tags_str}] }},'

def build_map_entry(slug):
    return f'  "{slug}": () => import("./content/{slug}"),'

def build_prerender_entry(p):
    desc_escaped = p["desc"].replace('"', '\\"')
    return f'  {{ slug: "{p["slug"]}", name: "{p["name"]}", desc: "{desc_escaped}" }},'

def insert_before_marker(lines, marker):
    for i in range(len(lines) - 1, -1, -1):
        if lines[i].strip() == marker:
            return i
    raise ValueError(f"Marker '{marker}' not found")

print("=" * 60)
print("INTEGRATING 30 BLOG POSTS — JUNE 29 2026")
print("=" * 60)

# --- 1. Integrate into postMeta.ts ---
print("\n[1/3] Updating postMeta.ts...")
with open("src/data/blog/postMeta.ts", "r") as f:
    lines = f.readlines()
pos = insert_before_marker(lines, "];")
for j, p in enumerate(POSTS):
    entry = build_meta_entry(p) + "\n"
    lines.insert(pos + j, entry)
with open("src/data/blog/postMeta.ts", "w") as f:
    f.writelines(lines)
meta_count = sum(1 for l in lines if l.strip().startswith("{ slug:"))
print(f"  postMeta.ts now has {meta_count} entries")

# --- 2. Integrate into postContentMap.ts ---
print("\n[2/3] Updating postContentMap.ts...")
with open("src/data/blog/postContentMap.ts", "r") as f:
    lines = f.readlines()
close_map = None
for i in range(len(lines) - 1, -1, -1):
    if lines[i].strip() == "};":
        for j in range(i + 1, min(i + 5, len(lines))):
            if "export async function getPostContent" in lines[j]:
                close_map = i
                break
    if close_map is not None:
        break
if close_map is None:
    print("  Could not find map closing };")
    exit(1)
for j, p in enumerate(POSTS):
    entry = build_map_entry(p["slug"]) + "\n"
    lines.insert(close_map + j, entry)
with open("src/data/blog/postContentMap.ts", "w") as f:
    f.writelines(lines)
map_count = sum(1 for l in lines if ": () => import" in l and "getPostContent" not in l)
print(f"  postContentMap.ts now has {map_count} entries")

# --- 3. Integrate into prerender.mjs ---
print("\n[3/3] Updating scripts/prerender.mjs...")
with open("scripts/prerender.mjs", "r") as f:
    content = f.read()
end_idx = content.rfind("\n];")
if end_idx == -1:
    print("  Could not find ]; in prerender.mjs")
    exit(1)
prerender_insert = ""
for p in POSTS:
    prerender_insert += build_prerender_entry(p) + "\n"
new_content = content[:end_idx+1] + "\n" + prerender_insert + content[end_idx+1:]
with open("scripts/prerender.mjs", "w") as f:
    f.write(new_content)
blog_start = new_content.find("const BLOG_POSTS")
blog_section = new_content[blog_start:new_content.find("];", blog_start) + 2]
count_in_blog = blog_section.count("slug:")
print(f"  prerender.mjs BLOG_POSTS now has {count_in_blog} entries")

# --- Final verification ---
print("\n" + "=" * 60)
print("FINAL VERIFICATION")
print("=" * 60)
meta = sum(1 for l in open("src/data/blog/postMeta.ts") if l.strip().startswith("{ slug:"))
files = len([1 for f in glob.glob("src/data/blog/content/*.ts")])
map_count = sum(1 for l in open("src/data/blog/postContentMap.ts") if ": () => import" in l and "getPostContent" not in l)
print(f"  postMeta:       {meta}")
print(f"  content files:  {files}")
print(f"  contentMap:     {map_count}")
if meta == files == map_count:
    print("  ✅ TRIPLET IN SYNC!")
else:
    print("  ❌ MISMATCH!")
    exit(1)

result = subprocess.run(["grep", "-c", "content:.*import", "src/data/blog/postMeta.ts"], capture_output=True, text=True)
content_fields = int(result.stdout.strip())
print(f"  postMeta content fields: {content_fields} (should be 0)")
if content_fields > 0:
    print("  ❌ CONTENT FIELDS FOUND!")
    exit(1)

result = subprocess.run(["grep", "-c", "getPostContent", "src/data/blog/postContentMap.ts"], capture_output=True, text=True)
getpc = int(result.stdout.strip())
print(f"  getPostContent exports: {getpc} (should be 1)")
if getpc != 1:
    print("  ❌ getPostContent MISSING!")
    exit(1)

print("\n✅ ALL CHECKS PASSED — ready for deploy!")
