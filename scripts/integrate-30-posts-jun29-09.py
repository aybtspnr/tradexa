#!/usr/bin/env python3
"""
Integrate 30 new blog posts into postMeta.ts, postContentMap.ts, and prerender.mjs.
Line-based insertion — battle-tested Jun 29 2026 09:00 run.
"""
import re, glob, subprocess

DATE = "2026-06-29"

POSTS = [
    # === Cluster 1: Pacífico Sul (microestados) ===
    {
        "slug": "comercio-brasil-kiribati-pesca-atum-oportunidades",
        "title": "Comércio Brasil-Kiribati: Oportunidades em Pesca, Atum e Comércio no Pacífico Central",
        "excerpt": "Guia completo de comércio entre Brasil e Kiribati: pesca de atum na ZEE de Kiribati, licenças de pesca, economia de copra e fosfato, logística no Pacífico Central, acordos PNA e oportunidades para exportadores brasileiros no arquipélago da Micronésia.",
        "name": "Comércio Brasil-Kiribati — Pesca e Atum",
        "desc": "Guia completo de comércio entre Brasil e Kiribati: pesca de atum na ZEE de Kiribati, licenças de pesca, economia de copra e fosfato, logística no Pacífico Central, acordos PNA e oportunidades para exportadores brasileiros.",
        "readTime": 15,
        "tags": ["Kiribati", "Pacífico", "Pesca", "Atum", "Exportação", "Mercados Emergentes", "Comércio Exterior"]
    },
    {
        "slug": "comercio-brasil-tuvalu-mudancas-climaticas-economia-digital",
        "title": "Comércio Brasil-Tuvalu: Desafios Climáticos, Domínio .tv e Oportunidades Digitais",
        "excerpt": "Guia de comércio entre Brasil e Tuvalu: economia digital do domínio .tv (US$ 10M/ano), impacto das mudanças climáticas, licenças de pesca, ajuda internacional, oportunidades para cooperação Sul-Sul e parcerias comerciais no Pacífico.",
        "name": "Comércio Brasil-Tuvalu — Domínio .tv e Clima",
        "desc": "Guia de comércio entre Brasil e Tuvalu: economia digital do domínio .tv (US$ 10M/ano), impacto das mudanças climáticas, licenças de pesca, ajuda internacional, oportunidades para cooperação Sul-Sul e parcerias comerciais no Pacífico.",
        "readTime": 15,
        "tags": ["Tuvalu", "Pacífico", "Mudanças Climáticas", "Economia Digital", "Exportação", "Mercados Emergentes", "Comércio Exterior"]
    },
    {
        "slug": "comercio-brasil-nauru-fosfato-offshore-financeiro",
        "title": "Comércio Brasil-Nauru: Fosfato, Centro Offshore e Oportunidades no Pacífico Central",
        "excerpt": "Guia de comércio entre Brasil e Nauru: história da mineração de fosfato, centro financeiro offshore, detenção australiana de refugiados, economia pós-fosfato, acordos PNA de pesca e oportunidades comerciais no microestado do Pacífico Central.",
        "name": "Comércio Brasil-Nauru — Fosfato e Offshore",
        "desc": "Guia de comércio entre Brasil e Nauru: história da mineração de fosfato, centro financeiro offshore, detenção australiana de refugiados, economia pós-fosfato, acordos PNA de pesca e oportunidades comerciais no Pacífico Central.",
        "readTime": 14,
        "tags": ["Nauru", "Pacífico", "Fosfato", "Offshore", "Pesca", "Mercados Emergentes", "Comércio Exterior"]
    },
    {
        "slug": "comercio-brasil-palau-turismo-investimentos-pacifico",
        "title": "Comércio Brasil-Palau: Turismo de Mergulho, Investimentos Estrangeiros e Parcerias no Pacífico",
        "excerpt": "Guia de comércio entre Brasil e Palau: turismo de mergulho (Rock Islands, Lago das Águas-Vivas), acordo de associação livre com EUA (Compact), zona econômica exclusiva, pesca de atum, investimentos estrangeiros e oportunidades para o Brasil no arquipélago do Pacífico Ocidental.",
        "name": "Comércio Brasil-Palau — Turismo e Investimentos",
        "desc": "Guia de comércio entre Brasil e Palau: turismo de mergulho (Rock Islands, Lago das Águas-Vivas), acordo de associação livre com EUA (Compact), zona econômica exclusiva, investimentos estrangeiros e oportunidades para o Brasil no Pacífico Ocidental.",
        "readTime": 14,
        "tags": ["Palau", "Pacífico", "Turismo", "Pesca", "Investimentos", "Mercados Emergentes", "Comércio Exterior"]
    },
    {
        "slug": "comercio-brasil-ilhas-marshall-pesca-acordos-navegacao",
        "title": "Comércio Brasil-Ilhas Marshall: Pesca, Acordos de Navegação e Oportunidades no Pacífico",
        "excerpt": "Guia de comércio entre Brasil e Ilhas Marshall: ZEE de 2 milhões km², licenças de pesca de atum (PNA/US Treaty), registro internacional de navios (RMI Shipping Registry), base militar US Army e oportunidades para exportação brasileira no Pacífico.",
        "name": "Comércio Brasil-Ilhas Marshall — Pesca e Navegação",
        "desc": "Guia de comércio entre Brasil e Ilhas Marshall: ZEE de 2 milhões km², licenças de pesca de atum (PNA/US Treaty), registro internacional de navios (RMI Shipping Registry), base militar US Army e oportunidades para exportação brasileira no Pacífico.",
        "readTime": 14,
        "tags": ["Ilhas Marshall", "Pacífico", "Pesca", "Navegação", "Exportação", "Mercados Emergentes", "Comércio Exterior"]
    },
    {
        "slug": "comercio-brasil-microestados-pacifico-oportunidades",
        "title": "Microestados do Pacífico: Oportunidades Comerciais e Parcerias com o Brasil",
        "excerpt": "Guia abrangente sobre os microestados do Pacífico (Kiribati, Tuvalu, Nauru, Palau, Ilhas Marshall, Micronésia): economias insulares, oportunidades para exportadores brasileiros, logística regional, acordos PNA e Fórum das Ilhas do Pacífico.",
        "name": "Microestados do Pacífico — Oportunidades Comerciais",
        "desc": "Guia abrangente sobre os microestados do Pacífico: economias insulares, oportunidades para exportadores brasileiros, logística regional, acordos PNA e Fórum das Ilhas do Pacífico.",
        "readTime": 15,
        "tags": ["Pacífico", "Microestados", "Pesca", "Exportação", "Fórum Pacífico", "Mercados Emergentes", "Comércio Exterior"]
    },
    # === Cluster 2: Caribe/Américas Menores ===
    {
        "slug": "comercio-brasil-antigua-barbuda-turismo-servicos",
        "title": "Comércio Brasil-Antígua e Barbuda: Turismo, Serviços Financeiros e Oportunidades no Caribe",
        "excerpt": "Guia de comércio entre Brasil e Antígua e Barbuda: economia do turismo caribenho, centro financeiro offshore, ZEE de 110 mil km², pesca, agricultura (abacaxi black pineapple), logística e OECO no Caribe Oriental.",
        "name": "Comércio Brasil-Antígua e Barbuda — Turismo e Serviços",
        "desc": "Guia de comércio entre Brasil e Antígua e Barbuda: economia do turismo caribenho, centro financeiro offshore, ZEE de 110 mil km², pesca, agricultura, logística e OECO no Caribe Oriental.",
        "readTime": 14,
        "tags": ["Antígua e Barbuda", "Caribe", "Turismo", "Offshore", "Exportação", "Mercados Emergentes", "Comércio Exterior"]
    },
    {
        "slug": "comercio-brasil-granada-especiarias-noz-moscada-cacau",
        "title": "Comércio Brasil-Granada: Especiarias, Noz-Moscada e Oportunidades na Ilha das Especiarias",
        "excerpt": "Guia de comércio entre Brasil e Granada (Ilha das Especiarias): produção de noz-moscada (2º maior do mundo), cacau orgânico, turismo de mergulho, ZEE caribenha, CARICOM e oportunidades para exportação brasileira no Caribe Oriental.",
        "name": "Comércio Brasil-Granada — Especiarias e Cacau",
        "desc": "Guia de comércio entre Brasil e Granada: produção de noz-moscada (2º maior do mundo), cacau orgânico, turismo de mergulho, ZEE caribenha, CARICOM e oportunidades para exportação brasileira no Caribe Oriental.",
        "readTime": 14,
        "tags": ["Granada", "Caribe", "Especiarias", "Cacau", "Exportação", "Mercados Emergentes", "Comércio Exterior"]
    },
    {
        "slug": "comercio-brasil-dominica-recursos-naturais-caribe",
        "title": "Comércio Brasil-Dominica: Recursos Naturais, Vulcões e Oportunidades na Ilha da Natureza Caribenha",
        "excerpt": "Guia de comércio entre Brasil e Dominica: economia baseada em recursos naturais, turismo ecológico, fontes termais, banana orgânica, cidadania por investimento (CBI), ZEE caribenha e oportunidades para exportação brasileira.",
        "name": "Comércio Brasil-Dominica — Recursos Naturais",
        "desc": "Guia de comércio entre Brasil e Dominica: economia baseada em recursos naturais, turismo ecológico, fontes termais, banana orgânica, cidadania por investimento e oportunidades para exportação brasileira no Caribe.",
        "readTime": 14,
        "tags": ["Dominica", "Caribe", "Recursos Naturais", "CBI", "Exportação", "Mercados Emergentes", "Comércio Exterior"]
    },
    {
        "slug": "comercio-brasil-sao-cristovao-nevis-offshore-investimentos",
        "title": "Comércio Brasil-São Cristóvão e Nevis: Centro Offshore, Cidadania por Investimento e Oportunidades",
        "excerpt": "Guia de comércio entre Brasil e São Cristóvão e Nevis: programa de cidadania por investimento (CBI) mais antigo do mundo, centro financeiro offshore, economia do turismo caribenho e oportunidades para empresários brasileiros.",
        "name": "Comércio Brasil-St. Kitts e Nevis — Offshore e CBI",
        "desc": "Guia de comércio entre Brasil e São Cristóvão e Nevis: programa de cidadania por investimento (CBI) mais antigo do mundo, centro financeiro offshore, economia do turismo caribenho e oportunidades para empresários brasileiros.",
        "readTime": 14,
        "tags": ["São Cristóvão e Nevis", "Caribe", "Offshore", "CBI", "Investimentos", "Mercados Emergentes", "Comércio Exterior"]
    },
    {
        "slug": "comercio-brasil-santa-lucia-turismo-banana-servicos",
        "title": "Comércio Brasil-Santa Lúcia: Turismo, Banana e Serviços no Caribe Oriental",
        "excerpt": "Guia de comércio entre Brasil e Santa Lúcia: economia turística (Pitons), produção de banana e cacau, serviços financeiros offshore, ZEE, CARICOM, porto de Castries e oportunidades para exportação brasileira no Caribe.",
        "name": "Comércio Brasil-Santa Lúcia — Turismo e Banana",
        "desc": "Guia de comércio entre Brasil e Santa Lúcia: economia turística (Pitons), produção de banana e cacau, serviços financeiros offshore, ZEE, CARICOM e oportunidades para exportação brasileira no Caribe.",
        "readTime": 13,
        "tags": ["Santa Lúcia", "Caribe", "Turismo", "Banana", "Exportação", "Mercados Emergentes", "Comércio Exterior"]
    },
    {
        "slug": "comercio-brasil-sao-vicente-granadinas-navegacao",
        "title": "Comércio Brasil-São Vicente e Granadinas: Navegação, Iatismo e Oportunidades no Caribe",
        "excerpt": "Guia de comércio entre Brasil e São Vicente e Granadinas: arquipélago de 32 ilhas, economia de turismo náutico (iatismo), produção de banana, araruta (arrowroot), centro internacional de serviços financeiros e oportunidades no Caribe.",
        "name": "Comércio Brasil-São Vicente — Navegação e Iatismo",
        "desc": "Guia de comércio entre Brasil e São Vicente e Granadinas: arquipélago de 32 ilhas, economia de turismo náutico (iatismo), araruta e oportunidades para exportação brasileira no Caribe.",
        "readTime": 14,
        "tags": ["São Vicente e Granadinas", "Caribe", "Turismo Náutico", "Navegação", "Exportação", "Mercados Emergentes", "Comércio Exterior"]
    },
    # === Cluster 3: Biocombustíveis, Bioeconomia e Recuperação ===
    {
        "slug": "etanol-celulosico-brasil-biocombustivel-avancado",
        "title": "Etanol Celulósico (E2G): O Biocombustível Avançado Brasileiro e Seu Potencial de Exportação",
        "excerpt": "Guia completo sobre etanol celulósico (E2G) no Brasil: tecnologia de produção a partir de bagaço e palha de cana, plantas comerciais (GranBio, Raízen), certificações e potencial de exportação global.",
        "name": "Etanol Celulósico (E2G) — Biocombustível Avançado",
        "desc": "Guia completo sobre etanol celulósico (E2G) no Brasil: tecnologia de produção a partir de bagaço e palha de cana, plantas comerciais (GranBio, Raízen), certificações e potencial de exportação global.",
        "readTime": 16,
        "tags": ["Etanol Celulósico", "E2G", "Biocombustíveis", "Inovação", "Exportação", "Sustentabilidade", "Comércio Exterior"]
    },
    {
        "slug": "biometano-biogas-brasil-potencial-exportacao",
        "title": "Biometano e Biogás no Brasil: Geração de Energia e Potencial de Exportação no Mercado Global",
        "excerpt": "Guia completo sobre biometano e biogás no Brasil: produção a partir de resíduos do agronegócio, plantas de purificação, redes de gasodutos, certificações internacionais e oportunidades de exportação.",
        "name": "Biometano e Biogás — Potencial de Exportação",
        "desc": "Guia completo sobre biometano e biogás no Brasil: produção a partir de resíduos do agronegócio, plantas de purificação, certificações internacionais e oportunidades de exportação de créditos de carbono.",
        "readTime": 16,
        "tags": ["Biometano", "Biogás", "Biocombustíveis", "Energia Renovável", "Sustentabilidade", "Exportação", "Comércio Exterior"]
    },
    {
        "slug": "algas-biocombustiveis-brasil-inovacao",
        "title": "Algas como Fonte de Biocombustíveis: Inovação Brasileira e Potencial de Exportação",
        "excerpt": "Guia completo sobre biocombustíveis de algas no Brasil: microalgas e macroalgas para biodiesel, bioetanol e bioquerosene de aviação, cultivo em fotobiorreatores, biorrefinarias integradas e perspectivas de exportação.",
        "name": "Biocombustíveis de Algas — Inovação Brasileira",
        "desc": "Guia completo sobre biocombustíveis de algas no Brasil: microalgas e macroalgas para biodiesel, bioetanol e bioquerosene de aviação, biorrefinarias integradas e perspectivas de exportação.",
        "readTime": 16,
        "tags": ["Algas", "Biocombustíveis", "Microalgas", "Inovação", "Biorrefinaria", "Sustentabilidade", "Comércio Exterior"]
    },
    {
        "slug": "bioplasticos-brasil-exportacao-mercados-sustentaveis",
        "title": "Bioplásticos Brasileiros: Produção, Certificação e Oportunidades no Mercado Global Sustentável",
        "excerpt": "Guia completo sobre bioplásticos no Brasil: PLA, PHB, amido termoplástico, certificações de biodegradabilidade (ABNT, ASTM, EN 13432), mercado de plásticos compostáveis e exportação para a União Europeia.",
        "name": "Bioplásticos Brasileiros — Mercado Global",
        "desc": "Guia completo sobre bioplásticos no Brasil: PLA, PHB, amido termoplástico, certificações de biodegradabilidade, mercado de plásticos compostáveis e exportação para a União Europeia.",
        "readTime": 15,
        "tags": ["Bioplásticos", "PLA", "PHB", "Sustentabilidade", "Exportação", "Certificações", "Comércio Exterior"]
    },
    {
        "slug": "bioinsumos-agricultura-brasil-exportacao-mercados",
        "title": "Bioinsumos na Agricultura Brasileira: Produção, Regulação e Mercado de Exportação",
        "excerpt": "Guia completo sobre bioinsumos agrícolas no Brasil: inoculantes, biofertilizantes, biofungicidas, marco regulatório (Lei 13.948/2019), MAPA, Embrapa, mercado global de biológicos e exportação para América Latina e África.",
        "name": "Bioinsumos Agrícolas — Produção e Exportação",
        "desc": "Guia completo sobre bioinsumos agrícolas no Brasil: inoculantes, biofertilizantes, marco regulatório, MAPA, Embrapa, mercado global de biológicos e exportação para América Latina e África.",
        "readTime": 15,
        "tags": ["Bioinsumos", "Agricultura", "Biológicos", "Exportação", "Embrapa", "MAPA", "Sustentabilidade", "Comércio Exterior"]
    },
    {
        "slug": "recuperacao-areas-degradadas-brasil-tecnologia-bioeconomia",
        "title": "Recuperação de Áreas Degradadas no Brasil: Tecnologia, Serviços e Potencial de Exportação na Bioeconomia",
        "excerpt": "Guia completo sobre recuperação de áreas degradadas no Brasil: técnicas de restauração ecológica, bioengenharia do solo, reflorestamento, PSA, código florestal, créditos de carbono e consultoria brasileira exportável.",
        "name": "Recuperação de Áreas Degradadas — Bioeconomia",
        "desc": "Guia completo sobre recuperação de áreas degradadas no Brasil: técnicas de restauração ecológica, bioengenharia do solo, reflorestamento, PSA, créditos de carbono e consultoria brasileira exportável.",
        "readTime": 16,
        "tags": ["Recuperação", "Áreas Degradadas", "Bioeconomia", "Restauração Ecológica", "PSA", "Créditos de Carbono", "Comércio Exterior"]
    },
    # === Cluster 4: Infraestrutura, Logística e Transportes ===
    {
        "slug": "comex-brasil-hidrovias-investimento-logistica-interior",
        "title": "Hidrovias Brasileiras: Investimento em Logística Fluvial e o Futuro do Comércio Exterior no Interior do Brasil",
        "excerpt": "Guia completo sobre hidrovias brasileiras no comércio exterior: Hidrovia do Madeira, Tietê-Paraná, Tocantins-Araguaia, São Francisco, Paraguai-Paraná, investimentos em eclusas e dragagem e escoamento de grãos do Centro-Oeste.",
        "name": "Hidrovias Brasileiras — Logística Fluvial",
        "desc": "Guia completo sobre hidrovias brasileiras no comércio exterior: Hidrovia do Madeira, Tietê-Paraná, Tocantins-Araguaia, São Francisco, investimentos em eclusas e escoamento de grãos do Centro-Oeste.",
        "readTime": 15,
        "tags": ["Hidrovias", "Logística", "Escoamento", "Grãos", "Exportação", "Navegação Interior", "Infraestrutura", "Comércio Exterior"]
    },
    {
        "slug": "br-163-soja-escoamento-norte-brasil-logistica",
        "title": "BR-163 e o Escoamento da Soja do Centro-Oeste para o Norte do Brasil: Logística e Impacto no Comércio Exterior",
        "excerpt": "Guia completo sobre a BR-163 (Cuiabá-Santarém): corredor logístico do agronegócio, escoamento de soja e milho para os portos de Miritituba e Santarém, desafios de pavimentação e impacto na exportação brasileira.",
        "name": "BR-163 — Corredor Logístico do Agronegócio",
        "desc": "Guia completo sobre a BR-163: corredor logístico do agronegócio, escoamento de soja e milho para Miritituba e Santarém, desafios de pavimentação e impacto na exportação brasileira.",
        "readTime": 14,
        "tags": ["BR-163", "Logística", "Agronegócio", "Soja", "Milho", "Exportação", "Santarém", "Miritituba", "Comércio Exterior"]
    },
    {
        "slug": "ferrovia-ferrograo-impacto-logistico-escoamento-graos",
        "title": "Ferrogrão (Ferrovia EF-170): Impacto Logístico no Escoamento de Grãos e no Comércio Exterior Brasileiro",
        "excerpt": "Guia completo sobre a Ferrovia Ferrogrão (EF-170): traçado Sinop-Miritituba, redução de custos logísticos, impactos ambientais na Amazônia, licenciamento e comparação com BR-163 e hidrovia Tapajós.",
        "name": "Ferrogrão (EF-170) — Ferrovia do Agronegócio",
        "desc": "Guia completo sobre a Ferrovia Ferrogrão (EF-170): traçado Sinop-Miritituba, redução de custos logísticos, impactos ambientais na Amazônia e comparação com BR-163 e hidrovia Tapajós.",
        "readTime": 14,
        "tags": ["Ferrogrão", "EF-170", "Ferrovia", "Logística", "Soja", "Escoamento", "Infraestrutura", "Comércio Exterior"]
    },
    {
        "slug": "terminal-uso-privativo-tup-logistica-portuaria",
        "title": "Terminais de Uso Privativo (TUP) no Brasil: Regulação, Operação e Impacto na Logística Portuária",
        "excerpt": "Guia completo sobre Terminais de Uso Privativo (TUP) no Brasil: Lei 12.815/2013, autorização ANTAQ, principais TUPs, investimentos privados, eficiência operacional e impacto na competitividade das exportações.",
        "name": "TUP — Terminais de Uso Privativo",
        "desc": "Guia completo sobre Terminais de Uso Privativo (TUP) no Brasil: Lei 12.815/2013, autorização ANTAQ, principais TUPs e impacto na competitividade das exportações brasileiras.",
        "readTime": 15,
        "tags": ["TUP", "Terminal Privativo", "Portos", "Logística", "ANTAQ", "Investimento", "Infraestrutura", "Exportação", "Comércio Exterior"]
    },
    {
        "slug": "hidrovia-tiete-parana-logistica-interior-comex",
        "title": "Hidrovia Tietê-Paraná: Logística Fluvial no Coração do Brasil e Seu Papel no Comércio Exterior",
        "excerpt": "Guia completo sobre a Hidrovia Tietê-Paraná: sistema de eclusas, portos fluviais, escoamento de grãos, farelo de soja, açúcar e contêineres, comparação com transporte rodoviário e impacto no comércio exterior do Centro-Sul.",
        "name": "Hidrovia Tietê-Paraná — Logística Fluvial",
        "desc": "Guia completo sobre a Hidrovia Tietê-Paraná: sistema de eclusas, portos fluviais, escoamento de grãos e contêineres, comparação com transporte rodoviário e impacto no comércio exterior do Centro-Sul.",
        "readTime": 14,
        "tags": ["Tietê-Paraná", "Hidrovia", "Logística", "Grãos", "Exportação", "Navegação Interior", "Eclusas", "Comércio Exterior"]
    },
    {
        "slug": "navegacao-costeira-cabotagem-brasil-inovacao-regulacao",
        "title": "Navegação Costeira e Cabotagem no Brasil: Inovação, Regulação e Potencial para o Comércio Exterior",
        "excerpt": "Guia completo sobre cabotagem no Brasil: Lei 14.301/2022 (BR do Mar), renovação da frota, cabotagem feeder para importação e exportação, incentivos fiscais e perspectivas de crescimento até 2030.",
        "name": "Cabotagem no Brasil — BR do Mar e Inovação",
        "desc": "Guia completo sobre cabotagem no Brasil: Lei 14.301/2022 (BR do Mar), renovação da frota, cabotagem feeder, incentivos fiscais (REPORT, RECOF) e perspectivas de crescimento para 2030.",
        "readTime": 15,
        "tags": ["Cabotagem", "Navegação Costeira", "BR do Mar", "Logística", "Portos", "Exportação", "Sustentabilidade", "Comércio Exterior"]
    },
    # === Cluster 5: Serviços Avançados e Economia Moderna ===
    {
        "slug": "servicos-engenharia-brasil-projetos-infraestrutura",
        "title": "Engenharia Brasileira no Exterior: Projetos de Infraestrutura e Consultoria como Serviço Exportável",
        "excerpt": "Guia completo sobre exportação de serviços de engenharia brasileira: projetos de infraestrutura, consultoria em gestão de projetos, empresas brasileiras na África e América Latina, financiamento BNDES e contratos internacionais.",
        "name": "Engenharia Brasileira — Serviços Exportáveis",
        "desc": "Guia completo sobre exportação de serviços de engenharia brasileira: projetos de infraestrutura, consultoria, empresas na África e América Latina, financiamento BNDES e contratos internacionais.",
        "readTime": 16,
        "tags": ["Engenharia", "Serviços", "Infraestrutura", "Exportação", "Consultoria", "Projetos", "BNDES", "Comércio Exterior"]
    },
    {
        "slug": "servicos-ti-outsourcing-brasil-exportacao-global",
        "title": "Serviços de TI e Outsourcing: Como o Brasil Está se Posicionando como Exportador Global de Tecnologia",
        "excerpt": "Guia completo sobre exportação de serviços de TI do Brasil: desenvolvimento de software, outsourcing, hubs de inovação, certificações internacionais, incentivos fiscais e comparação com Índia e Europa Oriental.",
        "name": "TI e Outsourcing — Brasil Exportador Global",
        "desc": "Guia completo sobre exportação de serviços de TI do Brasil: desenvolvimento de software, outsourcing, hubs de inovação, certificações internacionais e comparação com Índia e Europa Oriental.",
        "readTime": 16,
        "tags": ["TI", "Outsourcing", "Software", "Exportação", "Tecnologia", "Cibersegurança", "Cloud", "Inovação", "Comércio Exterior"]
    },
    {
        "slug": "conteudo-digital-educacional-brasil-exportacao",
        "title": "Conteúdo Digital Educacional: Oportunidades de Exportação de Tecnologia Educacional Brasileira",
        "excerpt": "Guia completo sobre exportação de conteúdo digital educacional do Brasil: EdTechs, plataformas de EAD, cursos online, gamificação, realidade virtual para educação e oportunidades em países lusófonos.",
        "name": "Conteúdo Digital Educacional — EdTech Export",
        "desc": "Guia completo sobre exportação de conteúdo digital educacional do Brasil: EdTechs, plataformas de EAD, cursos online, gamificação e oportunidades em países lusófonos.",
        "readTime": 14,
        "tags": ["Educação", "Conteúdo Digital", "EdTech", "EAD", "Exportação", "Tecnologia Educacional", "Lusofonia", "Comércio Exterior"]
    },
    {
        "slug": "servicos-juridicos-internacionais-arbitragem-brasil",
        "title": "Serviços Jurídicos Internacionais e Arbitragem: Como o Brasil Pode Expandir sua Advocacia no Exterior",
        "excerpt": "Guia completo sobre exportação de serviços jurídicos brasileiros: direito empresarial internacional, arbitragem comercial, consultoria em direito aduaneiro e compliance, e oportunidades em países lusófonos e América Latina.",
        "name": "Serviços Jurídicos — Arbitragem e Advocacia Global",
        "desc": "Guia completo sobre exportação de serviços jurídicos brasileiros: direito empresarial internacional, arbitragem comercial, compliance aduaneiro e oportunidades em países lusófonos e América Latina.",
        "readTime": 15,
        "tags": ["Serviços Jurídicos", "Arbitragem", "Advocacia", "Exportação", "Direito Internacional", "Compliance", "Comércio Exterior"]
    },
    {
        "slug": "consultoria-gestao-comex-exportacao-servicos",
        "title": "Consultoria em Comércio Exterior e Gestão Empresarial: Oportunidades de Exportação de Serviços Brasileiros",
        "excerpt": "Guia completo sobre exportação de serviços de consultoria brasileira: comércio exterior, supply chain, inteligência de mercado, due diligence, capacitação e oportunidades em África, América Latina e Oriente Médio.",
        "name": "Consultoria Comex — Serviços Exportáveis",
        "desc": "Guia completo sobre exportação de serviços de consultoria brasileira: comércio exterior, supply chain, inteligência de mercado, due diligence e oportunidades em mercados emergentes.",
        "readTime": 14,
        "tags": ["Consultoria", "Comex", "Gestão", "Serviços", "Exportação", "Supply Chain", "Capacitação", "Mercados Emergentes", "Comércio Exterior"]
    },
    {
        "slug": "exportacao-cafe-especial-brasileiro-sustentabilidade",
        "title": "Café Especial Brasileiro no Mercado Global: Certificações, Sustentabilidade e Estratégias de Exportação",
        "excerpt": "Guia completo sobre exportação de café especial brasileiro: classificações SCAA, terroir brasileiro, certificações, branding para mercados premium, logística de grãos verdes especiais e diferenciação por microlotes.",
        "name": "Café Especial Brasileiro — Exportação Premium",
        "desc": "Guia completo sobre exportação de café especial brasileiro: classificações SCAA, terroir brasileiro, certificações, branding para mercados premium e diferenciação por microlotes.",
        "readTime": 15,
        "tags": ["Café Especial", "Café Gourmet", "Exportação", "SCAA", "Certificações", "Sustentabilidade", "Agronegócio", "Comércio Exterior"]
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
print("INTEGRATING 30 BLOG POSTS — JUNE 29 09:00")
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
