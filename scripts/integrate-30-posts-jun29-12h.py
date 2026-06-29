#!/usr/bin/env python3
"""
Integrate 30 new blog posts into postMeta.ts, postContentMap.ts, and prerender.mjs.
Line-based insertion — Jun 29 2026 12:00 run.
Clusters: Africa Remanescente, Digital Services, Infraestrutura Fronteiras, Educação, Tributação, Minerais Estratégicos
"""
import re, glob, subprocess

DATE = "2026-06-29"

POSTS = [
    # === Cluster A: África Remanescente (5) ===
    {
        "slug": "comercio-brasil-lesoto-textil-diamantes-essuatini",
        "title": "Comércio Brasil-Lesoto e Essuatíni: Têxtil, Diamantes e Oportunidades na África Austral",
        "excerpt": "Guia completo de comércio entre Brasil, Lesoto e Essuatíni: indústria têxtil de Lesoto (AGOA), diamantes, recursos hídricos (Katse Dam), açúcar de Essuatíni, refrigerantes Coca-Cola África, logística via Maputo, SACU e oportunidades para exportadores brasileiros na África Austral.",
        "name": "Comércio Brasil-Lesoto e Essuatíni — África Austral",
        "desc": "Guia completo de comércio entre Brasil, Lesoto e Essuatíni: indústria têxtil (AGOA), diamantes, recursos hídricos, açúcar, logística via Maputo, SACU e oportunidades para exportadores brasileiros na África Austral.",
        "readTime": 15,
        "tags": ["Lesoto", "Essuatíni", "África Austral", "Têxtil", "Diamantes", "Exportação", "Mercados Emergentes", "Comércio Exterior"]
    },
    {
        "slug": "comercio-brasil-djibuti-porto-logistica-cha-cafe",
        "title": "Comércio Brasil-Djibuti: Porto Estratégico, Logística e Comércio com o Chifre da África",
        "excerpt": "Guia completo de comércio entre Brasil e Djibuti: porto estratégico no Mar Vermelho, corredor Djibuti-Etiópia, ferrovia Adis Abeba-Djibuti, reexportação de chá e café etíope, Zona Franca de Djibuti, telecomunicações, COMESA e oportunidades para exportadores brasileiros.",
        "name": "Comércio Brasil-Djibuti — Porto e Logística",
        "desc": "Guia completo de comércio entre Brasil e Djibuti: porto estratégico no Mar Vermelho, corredor Djibuti-Etiópia, ferrovia Adis Abeba-Djibuti, Zona Franca, COMESA e oportunidades para exportadores brasileiros no Chifre da África.",
        "readTime": 14,
        "tags": ["Djibuti", "Chifre da África", "Portos", "Logística", "Exportação", "Mercados Emergentes", "Comércio Exterior"]
    },
    {
        "slug": "comercio-brasil-guine-bissau-castanha-caju-pesca",
        "title": "Comércio Brasil-Guiné-Bissau: Castanha de Caju, Pesca e Oportunidades na CPLP",
        "excerpt": "Guia completo de comércio entre Brasil e Guiné-Bissau: economia da castanha de caju (maior exportador africano), pesca artesanal e industrial, recursos florestais, CPLP e cooperação lusófona, portos de Bissau e Buba, biotecnologia agrícola e oportunidades para exportadores brasileiros.",
        "name": "Comércio Brasil-Guiné-Bissau — Caju e CPLP",
        "desc": "Guia completo de comércio entre Brasil e Guiné-Bissau: economia da castanha de caju (maior exportador africano), pesca, recursos florestais, CPLP e cooperação lusófona, portos e oportunidades para exportadores brasileiros.",
        "readTime": 14,
        "tags": ["Guiné-Bissau", "África Ocidental", "Caju", "Pesca", "CPLP", "Exportação", "Mercados Emergentes", "Comércio Exterior"]
    },
    {
        "slug": "comercio-brasil-eritreia-minerais-pesca-chifre-africa",
        "title": "Comércio Brasil-Eritreia: Minérios, Pesca e Oportunidades no Chifre da África",
        "excerpt": "Guia completo de comércio entre Brasil e Eritreia: mineração de ouro (Bisha mine) e potássio (Colluli), pesca no Mar Vermelho (1600 km de costa), portos de Massawa e Assab, economia pós-independência, logística e tributos no Chifre da África.",
        "name": "Comércio Brasil-Eritreia — Minérios e Pesca",
        "desc": "Guia completo de comércio entre Brasil e Eritreia: mineração de ouro e potássio, pesca no Mar Vermelho, portos de Massawa e Assab, logística e tributos no Chifre da África.",
        "readTime": 14,
        "tags": ["Eritreia", "Chifre da África", "Mineração", "Pesca", "Exportação", "Mercados Emergentes", "Comércio Exterior"]
    },
    {
        "slug": "liberia-comercio-brasil-maritimo-commodities-pavilhao",
        "title": "Comércio Brasil-Libéria: Pavilhão de Registro Naval, Commodities e Oportunidades na África Ocidental",
        "excerpt": "Guia completo de comércio entre Brasil e Libéria: segundo maior pavilhão de registro naval do mundo (Liberian Registry), commodities (borracha, minério de ferro, madeira), portos de Monróvia e Buchanan, investimentos ArcelorMittal, CEDEAO e oportunidades para exportadores brasileiros.",
        "name": "Comércio Brasil-Libéria — Registro Naval e Commodities",
        "desc": "Guia completo de comércio entre Brasil e Libéria: segundo maior pavilhão de registro naval do mundo (Liberian Registry), commodities (borracha, minério de ferro), portos, ArcelorMittal e CEDEAO.",
        "readTime": 14,
        "tags": ["Libéria", "África Ocidental", "Navegação", "Commodities", "Exportação", "Mercados Emergentes", "Comércio Exterior"]
    },
    # === Cluster B: Digital Services e Economia Criativa (5) ===
    {
        "slug": "servicos-ti-outsourcing-brasil-exportacao-software-internacional",
        "title": "Serviços de TI e Outsourcing: Como o Brasil Pode Exportar Software e Tecnologia para o Mundo",
        "excerpt": "Guia completo sobre exportação de serviços de TI brasileiros: desenvolvimento de software sob medida, outsourcing/BPO, fábricas de software, nearshoring para EUA/Europa, certificações CMMI/MPS.BR, Lei do Bem, PADIS, NBS/SISCOSERV e oportunidades em países lusófonos e América Latina.",
        "name": "Serviços de TI — Exportação de Software",
        "desc": "Guia completo sobre exportação de serviços de TI brasileiros: desenvolvimento de software sob medida, outsourcing/BPO, nearshoring, certificações CMMI/MPS.BR, Lei do Bem, PADIS e SISCOSERV.",
        "readTime": 16,
        "tags": ["TI", "Software", "Outsourcing", "Exportação", "Serviços", "Inovação", "Comércio Exterior"]
    },
    {
        "slug": "franquias-brasileiras-internacionalizacao-mercado-global",
        "title": "Franquias Brasileiras no Mercado Global: Como Internacionalizar sua Rede de Franquias",
        "excerpt": "Guia completo sobre internacionalização de franquias brasileiras: modelos de expansão (master franquia, joint venture), marcas brasileiras de sucesso no exterior, adaptação cultural, supply chain internacional, royalties, tributação de remessas, registro de marca e oportunidades em países lusófonos.",
        "name": "Franquias Brasileiras — Internacionalização",
        "desc": "Guia completo sobre internacionalização de franquias brasileiras: modelos de expansão, marcas de sucesso no exterior, royalties, tributação de remessas, registro de marca e oportunidades no mercado global.",
        "readTime": 15,
        "tags": ["Franquias", "Internacionalização", "Exportação", "Serviços", "Marca", "Comércio Exterior"]
    },
    {
        "slug": "economia-criativa-brasil-exportacao-design-moda-arquitetura",
        "title": "Economia Criativa Brasileira: Como Exportar Design, Moda e Arquitetura para o Mundo",
        "excerpt": "Guia completo sobre exportação de serviços de economia criativa brasileira: design gráfico e de produto, moda autoral, arquitetura e urbanismo, branding, NBS/SISCOSERV, tributação de serviços, propriedade intelectual internacional e participação em feiras globais.",
        "name": "Economia Criativa — Design, Moda e Arquitetura",
        "desc": "Guia completo sobre exportação de serviços de economia criativa brasileira: design, moda autoral, arquitetura, branding, NBS/SISCOSERV, propriedade intelectual e feiras internacionais.",
        "readTime": 16,
        "tags": ["Economia Criativa", "Design", "Moda", "Arquitetura", "Exportação", "Serviços", "Comércio Exterior"]
    },
    {
        "slug": "games-entretenimento-digital-brasil-exportacao-global",
        "title": "Games e Entretenimento Digital: Como o Brasil Pode Exportar sua Indústria Criativa Digital",
        "excerpt": "Guia completo sobre internacionalização da indústria brasileira de games: desenvolvedoras independentes, estúdios, publishing global (Steam, App Store), financiamento (Ancine/FSA), Lei do Bem, coprodução internacional, distribuição digital, animação/VFX e mercados-alvo.",
        "name": "Games e Entretenimento Digital — Exportação",
        "desc": "Guia completo sobre internacionalização da indústria brasileira de games: desenvolvedoras, publishing global, financiamento Ancine/FSA, coprodução, animação/VFX e distribuição digital.",
        "readTime": 15,
        "tags": ["Games", "Entretenimento Digital", "Exportação", "Criatividade", "Ancine", "Comércio Exterior"]
    },
    {
        "slug": "startups-brasileiras-internacionalizacao-mercado-global-scale-up",
        "title": "Startups Brasileiras no Mercado Global: Internacionalização, Scale-Up e Captação Internacional",
        "excerpt": "Guia completo sobre internacionalização de startups brasileiras: programas de aceleração (YC, 500 Startups), softlanding (Portugal, Miami, Berlim), captação internacional (VCs estrangeiros, SAFE), tributação offshore, Marco Legal das Startups e cases de sucesso.",
        "name": "Startups Brasileiras — Internacionalização Global",
        "desc": "Guia completo sobre internacionalização de startups brasileiras: aceleração, softlanding, captação internacional, tributação offshore, Marco Legal das Startups e cases de sucesso.",
        "readTime": 16,
        "tags": ["Startups", "Inovação", "Scale-Up", "Captação", "Exportação", "Empreendedorismo", "Comércio Exterior"]
    },
    # === Cluster C: Infraestrutura de Fronteiras e Recintos (5) ===
    {
        "slug": "aduanas-fronteira-brasileiras-recinto-alfandegado-zona-secundaria",
        "title": "Aduanas de Fronteira no Brasil: Como Funcionam os Recintos Alfandegados em Zona Secundária",
        "excerpt": "Guia completo sobre aduanas de fronteira brasileiras: recintos alfandegados em zona secundária, pontos de fronteira terrestre (Foz do Iguaçu, Uruguaiana, Chuí, Ponta Porã), controle aduaneiro integrado, trânsito aduaneiro internacional e vantagens logísticas para comércio regional.",
        "name": "Aduanas de Fronteira — Zona Secundária",
        "desc": "Guia completo sobre aduanas de fronteira brasileiras: recintos alfandegados em zona secundária, pontos de fronteira terrestre, controle aduaneiro e vantagens logísticas para comércio regional.",
        "readTime": 14,
        "tags": ["Aduanas", "Fronteira", "Zona Secundária", "Logística", "Importação", "Exportação", "Comércio Exterior"]
    },
    {
        "slug": "transito-aduaneiro-rodoviario-brasil-rdt-carimbo-procedimentos",
        "title": "Trânsito Aduaneiro Rodoviário no Brasil: RDT, Carimbo de Passagem e Procedimentos",
        "excerpt": "Guia completo sobre trânsito aduaneiro rodoviário: Regime de Trânsito Aduaneiro (RDT), carimbo de passagem em fronteira, veículos TIR, lacres aduaneiros, prazos, responsabilidades, infrações e multas, terminais de fronteira e procedimentos para Mercosul.",
        "name": "Trânsito Aduaneiro Rodoviário — RDT",
        "desc": "Guia completo sobre trânsito aduaneiro rodoviário: Regime de Trânsito Aduaneiro (RDT), carimbo de passagem, veículos TIR, lacres, prazos e procedimentos para importação e exportação via Mercosul.",
        "readTime": 15,
        "tags": ["Trânsito Aduaneiro", "RDT", "Fronteira", "Logística", "Mercosul", "Importação", "Exportação", "Comércio Exterior"]
    },
    {
        "slug": "entreposto-aduaneiro-brasil-regimes-especiais-industrializacao-importacao",
        "title": "Entreposto Aduaneiro no Brasil: Regimes Especiais, Industrialização e Importação sob Suspensão Tributária",
        "excerpt": "Guia completo sobre entreposto aduaneiro brasileiro: regimes de suspensão tributária, IN RFB 1.861/2018, industrialização sob controle aduaneiro, prazos de permanência, caução, drawback integrado, RECOF e vantagens para industrializadores que importam insumos.",
        "name": "Entreposto Aduaneiro — Regimes Especiais",
        "desc": "Guia completo sobre entreposto aduaneiro brasileiro: regimes de suspensão tributária, IN RFB 1.861/2018, industrialização sob controle aduaneiro, drawback integrado e RECOF.",
        "readTime": 16,
        "tags": ["Entreposto Aduaneiro", "Regimes Especiais", "Drawback", "Industrialização", "Importação", "Comércio Exterior"]
    },
    {
        "slug": "recinto-alfandegado-zona-secundaria-brasil-funcionamento-beneficios",
        "title": "Recinto Alfandegado em Zona Secundária: Funcionamento, Benefícios e Como Utilizar",
        "excerpt": "Guia completo sobre recinto alfandegado de zona secundária: tipos (porto seco, terminal alfandegado, CLIA), IN RFB 1.801/2019, OEA, armazenagem temporária, desembaraço no interior, vantagens de custo logístico e principais recintos em SP, MG, PR, SC e RS.",
        "name": "Recinto Alfandegado — Zona Secundária",
        "desc": "Guia completo sobre recinto alfandegado de zona secundária: tipos, IN RFB 1.801/2019, OEA, armazenagem temporária, desembaraço no interior e principais recintos no Brasil.",
        "readTime": 14,
        "tags": ["Recinto Alfandegado", "Porto Seco", "Zona Secundária", "Logística", "OEA", "Importação", "Exportação", "Comércio Exterior"]
    },
    {
        "slug": "regime-recof-industrializacao-exportacao-brasil-beneficios",
        "title": "RECOF: Regime Aduaneiro de Industrialização para Exportação — Guia Completo",
        "excerpt": "Guia completo sobre o RECOF (Regime Aduaneiro de Industrialização para Exportação): suspensão de tributos, habilitação, planta industrial aprovada, prestação de contas, balanço de insumos e comparação RECOF vs Drawback para eletrônicos, autopeças e máquinas.",
        "name": "RECOF — Regime de Industrialização",
        "desc": "Guia completo sobre o RECOF (Regime Aduaneiro de Industrialização para Exportação): suspensão de tributos, habilitação, planta industrial, prestação de contas e comparação com Drawback.",
        "readTime": 15,
        "tags": ["RECOF", "Regimes Especiais", "Industrialização", "Exportação", "Drawback", "Incentivos", "Comércio Exterior"]
    },
    # === Cluster D: Educação, Ciência e Tecnologia (5) ===
    {
        "slug": "intercambio-academico-internacional-capes-cnpq-bolsas-cooperacao",
        "title": "Intercâmbio Acadêmico e Bolsas CAPES/CNPq: Oportunidades Internacionais para Pesquisadores Brasileiros",
        "excerpt": "Guia completo sobre intercâmbio acadêmico internacional: bolsas CAPES (PDSE, PRINT), CNPq (SWE, PDE), programas de pós-graduação no exterior, acordos bilaterais (CAPES-Cofecub, DAAD, FIPSE) e cooperação Brasil-EUA, Europa e Ásia.",
        "name": "Intercâmbio Acadêmico — CAPES e CNPq",
        "desc": "Guia completo sobre intercâmbio acadêmico internacional: bolsas CAPES PDSE/PRINT, CNPq SWE/PDE, acordos bilaterais e cooperação científica internacional.",
        "readTime": 15,
        "tags": ["Intercâmbio", "CAPES", "CNPq", "Educação", "Pesquisa", "Cooperação", "Comércio Exterior"]
    },
    {
        "slug": "cooperacao-tecnica-internacional-brasil-paises-desenvolvimento-acordos",
        "title": "Cooperação Técnica Internacional do Brasil: Acordos, Programas e Oportunidades de Exportação de Conhecimento",
        "excerpt": "Guia completo sobre cooperação técnica internacional brasileira: ABC/MRE, cooperação Sul-Sul, CTPD, transferência de tecnologia (agricultura tropical, saúde pública, energia renovável), acordos com PALOP e América Latina, cases Embrapa, Fiocruz e SENAI.",
        "name": "Cooperação Técnica — Exportação de Conhecimento",
        "desc": "Guia completo sobre cooperação técnica internacional brasileira: ABC/MRE, cooperação Sul-Sul, transferência de tecnologia, acordos com PALOP e cases Embrapa, Fiocruz e SENAI.",
        "readTime": 15,
        "tags": ["Cooperação Técnica", "ABC/MRE", "Transferência de Tecnologia", "PALOP", "Embrapa", "Exportação", "Comércio Exterior"]
    },
    {
        "slug": "parques-tecnologicos-brasil-exportacao-inovacao-startups-globais",
        "title": "Parques Tecnológicos no Brasil: Inovação, Exportação de Tecnologia e Internacionalização de Startups",
        "excerpt": "Guia sobre parques tecnológicos brasileiros: estrutura e incentivos fiscais (Lei do Bem, PADIS), principais parques (Tecnopuc, Porto Digital, Sanca, BH-Tec, São José dos Campos), incubadoras, aceleradoras e conexão com Finep e BNDES.",
        "name": "Parques Tecnológicos — Inovação e Exportação",
        "desc": "Guia sobre parques tecnológicos brasileiros: incentivos fiscais (Lei do Bem, PADIS), principais parques, incubadoras, aceleradoras e conexão com Finep e BNDES.",
        "readTime": 15,
        "tags": ["Parques Tecnológicos", "Inovação", "Startups", "Lei do Bem", "Exportação", "Tecnologia", "Comércio Exterior"]
    },
    {
        "slug": "centros-pd-inovacao-brasil-exportacao-tecnologia-incentivos-fiscais",
        "title": "Centros de P&D no Brasil: Como Exportar Inovação e Tecnologia com Incentivos Fiscais",
        "excerpt": "Guia completo sobre centros de P&D exportadores: Lei do Bem (dedução de 160-200%), PADIS, Lei TIC, Rota 2030, Embrapii, contratos de transferência de tecnologia e licenciamento de patentes com cases brasileiros.",
        "name": "Centros de P&D — Incentivos e Exportação",
        "desc": "Guia completo sobre centros de P&D exportadores: Lei do Bem, PADIS, Lei TIC, Rota 2030, Embrapii, transferência de tecnologia e licenciamento de patentes.",
        "readTime": 14,
        "tags": ["P&D", "Inovação", "Lei do Bem", "Incentivos Fiscais", "Exportação", "Tecnologia", "Comércio Exterior"]
    },
    {
        "slug": "propriedade-intelectual-inovacao-comex-patentes-marcas-exportacao",
        "title": "Propriedade Intelectual e Inovação no Comércio Exterior: Patentes, Marcas e Exportação de Tecnologia",
        "excerpt": "Guia completo sobre PI no comex: patentes (INPI, PCT/OMPI), marcas (Protocolo de Madri), desenho industrial (Haia), indicação geográfica, licenciamento, TRIPS, proteção contra falsificação e classificação NCM de produtos protegidos por PI.",
        "name": "Propriedade Intelectual — Patentes e Marcas",
        "desc": "Guia completo sobre propriedade intelectual no comex: patentes INPI/PCT, marcas Protocolo de Madri, desenho industrial, licenciamento e proteção contra falsificação.",
        "readTime": 15,
        "tags": ["Propriedade Intelectual", "Patentes", "Marcas", "INPI", "OMPI", "Inovação", "Exportação", "Comércio Exterior"]
    },
    # === Cluster E: Tributação Internacional Avançada (5) ===
    {
        "slug": "precos-transferencia-lei-14596-brasil-comex-transfer-pricing",
        "title": "Preços de Transferência no Brasil: Lei 14.596/2023 e o Novo Marco do Transfer Pricing",
        "excerpt": "Guia completo sobre preços de transferência no Brasil: Lei 14.596/2023 (alinhamento OCDE), métodos PIC, PRL, CCL, TNMM e profit split, documentação obrigatória, transações com commodities e Country-by-Country Reporting.",
        "name": "Preços de Transferência — Lei 14.596/2023",
        "desc": "Guia completo sobre preços de transferência no Brasil: Lei 14.596/2023, métodos OCDE, documentação obrigatória, commodities e Country-by-Country Reporting.",
        "readTime": 16,
        "tags": ["Preços de Transferência", "Transfer Pricing", "Tributação", "OCDE", "Lei 14.596", "Comércio Exterior"]
    },
    {
        "slug": "thin-capitalization-brasil-endividamento-relacionado-comex-internacional",
        "title": "Thin Capitalization no Brasil: Regras de Endividamento entre Partes Relacionadas no Comércio Exterior",
        "excerpt": "Guia completo sobre thin capitalization: regras brasileiras (Lei 12.249/2010), ratio dívida/patrimônio líquido, dedutibilidade de juros, partes relacionadas no exterior, JCP e planejamento tributário internacional para captação externa.",
        "name": "Thin Capitalization — Endividamento Internacional",
        "desc": "Guia completo sobre thin capitalization: Lei 12.249/2010, ratio dívida/PL, dedutibilidade de juros, JCP e planejamento tributário para captação externa.",
        "readTime": 15,
        "tags": ["Thin Capitalization", "Tributação", "Endividamento", "Partes Relacionadas", "JCP", "Comércio Exterior"]
    },
    {
        "slug": "cfem-compensacao-financeira-minerios-exportacao-brasil-tributacao",
        "title": "CFEM na Exportação de Minérios: Compensação Financeira pela Exploração Mineral no Brasil",
        "excerpt": "Guia completo sobre CFEM (Compensação Financeira pela Exploração de Recursos Minerais): base de cálculo na exportação, alíquotas por substância mineral (ferro, ouro, bauxita, cobre, nióbio), Lei 13.540/2017 e classificação NCM de minérios.",
        "name": "CFEM — Tributação de Minérios",
        "desc": "Guia completo sobre CFEM na exportação de minérios: base de cálculo, alíquotas por substância mineral, Lei 13.540/2017 e classificação NCM de minérios.",
        "readTime": 14,
        "tags": ["CFEM", "Minérios", "Tributação", "Mineração", "Exportação", "Comércio Exterior"]
    },
    {
        "slug": "royalties-assistencia-tecnica-importacao-exportacao-tributacao-brasil",
        "title": "Royalties e Assistência Técnica no Comércio Exterior: Tributação de Remessas ao Exterior",
        "excerpt": "Guia completo sobre tributação de royalties e assistência técnica no comex: remessas ao exterior, IRRF (15-25%), CIDE (10%), PIS/COFINS Importação, acordos de bitributação, IN RFB 2.158/2022 e classificação NBS/SISCOSERV.",
        "name": "Royalties e Assistência Técnica — Tributação",
        "desc": "Guia completo sobre tributação de royalties e assistência técnica no comex: IRRF, CIDE, PIS/COFINS, acordos de bitributação e classificação NBS/SISCOSERV.",
        "readTime": 15,
        "tags": ["Royalties", "Assistência Técnica", "Tributação", "IRRF", "CIDE", "Bitributação", "Comércio Exterior"]
    },
    {
        "slug": "planejamento-tributario-internacional-acordos-bitributacao-treaty-shopping",
        "title": "Planejamento Tributário Internacional: Acordos de Bitributação, Treaty Shopping e Estruturas Offshore",
        "excerpt": "Guia completo sobre planejamento tributário internacional: acordos de bitributação do Brasil (30+ acordos), treaty shopping, permanent establishment, estruturas holding (Holanda, Luxemburgo, Espanha), CFE/CAF e compliance tributário.",
        "name": "Planejamento Tributário — Acordos e Offshore",
        "desc": "Guia completo sobre planejamento tributário internacional: acordos de bitributação, treaty shopping, estruturas holding, CFE/CAF e compliance tributário internacional.",
        "readTime": 16,
        "tags": ["Planejamento Tributário", "Bitributação", "Treaty Shopping", "Offshore", "Holding", "Comércio Exterior"]
    },
    # === Cluster F: Energia Nuclear, Minerais Estratégicos (5) ===
    {
        "slug": "uranio-brasil-ciclo-nuclear-exportacao-mineral-estrategico",
        "title": "Urânio Brasileiro: Ciclo Nuclear, Exportação e Potencial como Mineral Estratégico",
        "excerpt": "Guia completo sobre urânio no Brasil: reservas (3ª maior do mundo), mineração (INB Caetité/BA), ciclo do combustível nuclear, Angra I/II/III, NCM 2844, regras CNEN, TNP, mercado global e oportunidades para fornecedores brasileiros do setor nuclear.",
        "name": "Urânio Brasileiro — Ciclo Nuclear",
        "desc": "Guia completo sobre urânio no Brasil: reservas, mineração, ciclo do combustível nuclear, Angra I/II/III, regras de exportação e mercado global de urânio.",
        "readTime": 15,
        "tags": ["Urânio", "Energia Nuclear", "Mineração", "Exportação", "CNEN", "Minerais Estratégicos", "Comércio Exterior"]
    },
    {
        "slug": "terras-raras-minerais-criticos-brasil-cadeia-global-baterias",
        "title": "Terras-Raras e Minerais Críticos no Brasil: Oportunidades na Cadeia Global de Baterias e Tecnologia",
        "excerpt": "Guia completo sobre terras raras e minerais críticos no Brasil: elementos de terras raras, reservas brasileiras (Araxá, Catalão, Pitinga), classificação NCM Cap. 28-29, monopólio chinês e oportunidades em ímãs permanentes, baterias e veículos elétricos.",
        "name": "Terras-Raras — Minerais Críticos e Baterias",
        "desc": "Guia completo sobre terras raras e minerais críticos no Brasil: reservas, classificação NCM, monopólio chinês e oportunidades em ímãs, baterias e veículos elétricos.",
        "readTime": 15,
        "tags": ["Terras-Raras", "Minerais Críticos", "Baterias", "Mineração", "Exportação", "Veículos Elétricos", "Comércio Exterior"]
    },
    {
        "slug": "niobio-litio-brasil-exportacao-baterias-tecnologia-mercado-global",
        "title": "Nióbio e Lítio no Brasil: Exportação para Baterias, Tecnologia e Mercado Global",
        "excerpt": "Guia completo sobre nióbio e lítio brasileiros: CBMM (85% do mercado global), ferronióbio NCM 8112, lítio Sigma Lithium na Vale do Jequitinhonha, NCM 2836/2530, tributação e logística de exportação para cadeia de veículos elétricos.",
        "name": "Nióbio e Lítio — Baterias e Tecnologia",
        "desc": "Guia completo sobre nióbio e lítio brasileiros: CBMM, ferronióbio, lítio Sigma Lithium, classificação NCM, tributação e logística para cadeia de veículos elétricos.",
        "readTime": 14,
        "tags": ["Nióbio", "Lítio", "Baterias", "Mineração", "Exportação", "Veículos Elétricos", "Comércio Exterior"]
    },
    {
        "slug": "minerais-estrategicos-brasil-supply-chain-global-transicao-energetica",
        "title": "Minerais Estratégicos do Brasil: A Nova Rota da Seda Verde e a Transição Energética Global",
        "excerpt": "Guia completo sobre minerais estratégicos brasileiros na transição energética: cobalto, grafita, manganês, cobre, níquel, silício grau solar, fosfato, IRA (EUA), Critical Raw Materials Act (UE) e Parceria Brasil-EUA de Minerais Críticos.",
        "name": "Minerais Estratégicos — Transição Energética",
        "desc": "Guia completo sobre minerais estratégicos brasileiros na transição energética: cobalto, grafita, manganês, cobre, IRA, Critical Raw Materials Act e Parceria Brasil-EUA.",
        "readTime": 16,
        "tags": ["Minerais Estratégicos", "Transição Energética", "Supply Chain", "Mineração", "Exportação", "Comércio Exterior"]
    },
    {
        "slug": "energia-nuclear-brasil-cooperacao-internacional-tecnologia-smr",
        "title": "Energia Nuclear Brasileira: Cooperação Internacional, SMRs e Oportunidades de Exportação de Tecnologia",
        "excerpt": "Guia completo sobre cooperação nuclear brasileira: acordos (Argentina, França, EUA, China), pequenos reatores modulares (SMR), PROSUB, AMAZUL, CNEN, IPEN, CDTN, exportação de tecnologia nuclear e NCM de equipamentos nucleares.",
        "name": "Energia Nuclear — Cooperação e SMRs",
        "desc": "Guia completo sobre cooperação nuclear brasileira: acordos internacionais, SMRs, PROSUB, AMAZUL, CNEN e exportação de tecnologia nuclear.",
        "readTime": 14,
        "tags": ["Energia Nuclear", "SMR", "Cooperação", "CNEN", "Tecnologia", "Exportação", "Comércio Exterior"]
    },
]

def build_meta_entry(p):
    tags_str = ", ".join(f'"{t}"' for t in p["tags"])
    excerpt_escaped = p["excerpt"].replace('"', '\\"').replace("\\n", " ")
    return f'  {{ slug: "{p["slug"]}", title: "{p["title"]}", excerpt: "{excerpt_escaped}", date: "{DATE}", readTime: {p["readTime"]}, tags: [{tags_str}] }},'

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
print("INTEGRATING 30 BLOG POSTS — June 29 2026 12:00")
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
