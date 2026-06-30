#!/usr/bin/env python3
"""
Integrate 30 new blog posts into postMeta.ts, postContentMap.ts, and prerender.mjs.
Line-based insertion — June 30 2026 run.
Clusters: Steel & Metallurgy, Financial Services, EU Trade, E-commerce, Health & Pharma, Education & BRICS
"""
import re, glob, subprocess

DATE = "2026-06-30"

POSTS = [
    # === Cluster A: Steel & Metallurgy (5) ===
    {
        "slug": "exportacao-aco-brasil-mercado-global-siderurgia",
        "title": "Exportação de Aço do Brasil: Mercado Global e Perspectivas da Siderurgia Nacional",
        "excerpt": "Guia completo sobre a exportação de aço brasileiro, principais mercados, tipos de produtos siderúrgicos, logística portuária e competitividade internacional da siderurgia nacional.",
        "name": "Exportação de Aço do Brasil — Mercado Global",
        "desc": "Guia completo sobre exportação de aço brasileiro: principais mercados, tipos de produtos siderúrgicos, logística portuária e competitividade internacional da siderurgia nacional.",
        "readTime": 16,
        "tags": ["Siderurgia", "Exportação", "Aço", "Metalurgia", "Comércio Exterior"]
    },
    {
        "slug": "exportacao-ferro-gusa-brasil-mercados-internacionais",
        "title": "Ferro-Gusa Brasileiro no Comércio Exterior: Produção e Mercados Internacionais",
        "excerpt": "Panorama completo da exportação de ferro-gusa do Brasil, processo produtivo, classificação NCM, carvão vegetal como diferencial competitivo, principais destinos e perspectivas do mercado global.",
        "name": "Ferro-Gusa Brasileiro — Mercados",
        "desc": "Panorama completo da exportação de ferro-gusa do Brasil, processo produtivo, classificação NCM, carvão vegetal como diferencial e principais destinos no mercado global.",
        "readTime": 15,
        "tags": ["Siderurgia", "Exportação", "Ferro-Gusa", "Metalurgia", "Mercado Global"]
    },
    {
        "slug": "laminados-aco-brasil-exportacao-qualidade-normas",
        "title": "Laminados de Aço na Exportação Brasileira: Qualidade e Normas Internacionais",
        "excerpt": "Guia completo sobre exportação de laminados de aço do Brasil, bobinas, chapas e vergalhões, processos produtivos, certificações de qualidade e adequação às normas internacionais.",
        "name": "Laminados de Aço — Qualidade",
        "desc": "Guia completo sobre exportação de laminados de aço do Brasil: bobinas, chapas, vergalhões, certificações de qualidade e adequação às normas técnicas internacionais.",
        "readTime": 15,
        "tags": ["Siderurgia", "Exportação", "Laminados", "Aço", "Qualidade", "Normas Técnicas"]
    },
    {
        "slug": "acos-especiais-brasil-exportacao-automotivo-petroleo",
        "title": "Aços Especiais Brasileiros na Exportação para Indústria Automotiva e Petrolífera",
        "excerpt": "Panorama completo da exportação de aços especiais do Brasil, ligas metálicas para indústria automotiva, petrolífera e bens de capital, certificações e oportunidades globais.",
        "name": "Aços Especiais — Automotivo e Óleo",
        "desc": "Panorama completo da exportação de aços especiais brasileiros: ligas metálicas para indústria automotiva, petrolífera e bens de capital com certificações internacionais.",
        "readTime": 15,
        "tags": ["Siderurgia", "Exportação", "Aços Especiais", "Automotivo", "Petróleo e Gás"]
    },
    {
        "slug": "tubos-aco-brasil-exportacao-oleo-gas",
        "title": "Tubos de Aço na Exportação Brasileira: Mercado de Óleo e Gás",
        "excerpt": "Guia completo sobre exportação de tubos de aço do Brasil para a indústria de óleo e gás, tipos seamless, ERW e LSAW, certificações API e principais mercados compradores mundiais.",
        "name": "Tubos de Aço — Óleo e Gás",
        "desc": "Guia completo sobre exportação de tubos de aço do Brasil para a indústria de óleo e gás: tipos seamless, ERW, LSAW, certificações API e principais mercados compradores.",
        "readTime": 16,
        "tags": ["Siderurgia", "Tubos de Aço", "Óleo e Gás", "Exportação", "Certificações API"]
    },
    # === Cluster B: Financial Services & Trade Finance (5) ===
    {
        "slug": "servicos-financeiros-comex-cambio-trade-finance",
        "title": "Serviços Financeiros no Comércio Exterior: Câmbio e Trade Finance no Brasil",
        "excerpt": "Guia completo sobre serviços financeiros para comércio exterior brasileiro: operações de câmbio, trade finance, financiamentos à exportação, cartas de crédito e soluções bancárias.",
        "name": "Serviços Financeiros — Trade Finance",
        "desc": "Guia completo sobre serviços financeiros para comércio exterior brasileiro: operações de câmbio, trade finance, financiamentos, cartas de crédito e soluções bancárias.",
        "readTime": 14,
        "tags": ["Serviços Financeiros", "Câmbio", "Trade Finance", "Comércio Exterior", "Financiamento"]
    },
    {
        "slug": "fintechs-cambio-comercio-exterior-pagamentos-internacionais",
        "title": "Fintechs de Câmbio no Brasil: Revolução nos Pagamentos Internacionais do Comex",
        "excerpt": "Panorama completo das fintechs de câmbio no Brasil e como estão transformando pagamentos internacionais do comércio exterior com taxas competitivas, processos digitais e inovação regulatória.",
        "name": "Fintechs de Câmbio — Pagamentos",
        "desc": "Panorama completo das fintechs de câmbio no Brasil transformando pagamentos internacionais do comércio exterior com taxas competitivas, processos digitais e inovação.",
        "readTime": 14,
        "tags": ["Fintechs", "Câmbio", "Pagamentos Internacionais", "Comércio Exterior", "Inovação Financeira"]
    },
    {
        "slug": "cartas-credito-standby-comex-garantias-operacoes",
        "title": "Cartas de Crédito Standby no Comércio Exterior: Garantias para Operações Internacionais",
        "excerpt": "Guia completo sobre cartas de crédito standby no comércio exterior brasileiro, funcionamento, diferenças para LC documentária, aplicações em garantias contratuais e custos operacionais.",
        "name": "Standby LC — Garantias Internacionais",
        "desc": "Guia completo sobre cartas de crédito standby no comércio exterior brasileiro: funcionamento, diferenças para LC documentária, aplicações em garantias e custos operacionais.",
        "readTime": 13,
        "tags": ["Cartas de Crédito", "Standby LC", "Garantias Internacionais", "Trade Finance", "Comércio Exterior"]
    },
    {
        "slug": "adiantamento-contrato-cambio-exportador-capital-giro",
        "title": "Adiantamento de Contrato de Câmbio (ACC): Capital de Giro para o Exportador Brasileiro",
        "excerpt": "Guia completo sobre ACC e ACE, linhas de financiamento pré-embarque e pós-embarque para exportadores brasileiros, custos, requisitos, benefícios fiscais e operacionalização bancária.",
        "name": "ACC e ACE — Capital de Giro",
        "desc": "Guia completo sobre ACC e ACE para exportadores brasileiros: financiamento pré-embarque e pós-embarque, custos, requisitos, benefícios fiscais e operacionalização bancária.",
        "readTime": 15,
        "tags": ["ACC", "ACE", "Financiamento à Exportação", "Câmbio", "Capital de Giro"]
    },
    {
        "slug": "fundo-garantia-exportacao-fge-risco-pais",
        "title": "Fundo de Garantia à Exportação (FGE): Cobertura de Risco-País para Exportadores",
        "excerpt": "Guia completo sobre o Fundo de Garantia à Exportação, cobertura de risco-país, risco comercial e extraordinário, seguro de crédito à exportação e ACC/ACE com garantia soberana.",
        "name": "FGE — Risco-País",
        "desc": "Guia completo sobre o Fundo de Garantia à Exportação: cobertura de risco-país, risco comercial e extraordinário, seguro de crédito e ACC/ACE com garantia soberana.",
        "readTime": 15,
        "tags": ["FGE", "Fundo de Garantia", "Exportação", "Seguro de Crédito", "Risco-País"]
    },
    # === Cluster C: EU Trade Regulations (5) ===
    {
        "slug": "acordo-mercosul-ue-negociacoes-brasil-parceria",
        "title": "Acordo Mercosul-União Europeia: Impactos e Oportunidades para o Brasil",
        "excerpt": "Análise completa do acordo Mercosul-UE, cronograma de redução tarifária, regras de origem, setores mais beneficiados e impactos para exportadores e importadores brasileiros.",
        "name": "Acordo Mercosul-UE — Oportunidades",
        "desc": "Análise completa do acordo Mercosul-UE: cronograma de redução tarifária, regras de origem, setores mais beneficiados e impactos para exportadores brasileiros.",
        "readTime": 14,
        "tags": ["Mercosul", "União Europeia", "Acordo Comercial", "Tarifas", "Exportação"]
    },
    {
        "slug": "regulamento-deflorestacao-ue-impacto-exportacao-brasil",
        "title": "Regulamento Antidesmatamento da UE: Impacto nas Exportações Brasileiras",
        "excerpt": "Guia completo sobre o EUDR, como afeta exportações brasileiras de soja, café, carne, couro e madeira, requisitos de due diligence, rastreabilidade e sistemas de geolocalização.",
        "name": "EUDR — Exportações Brasileiras",
        "desc": "Guia completo sobre o EUDR e seu impacto em exportações brasileiras de soja, café, carne, couro e madeira, due diligence, rastreabilidade e geolocalização.",
        "readTime": 15,
        "tags": ["EUDR", "Desmatamento", "Rastreabilidade", "Exportação", "Regulamentação UE", "Sustentabilidade"]
    },
    {
        "slug": "barreiras-tecnicas-comerciais-ue-exportacao-brasileira",
        "title": "Barreiras Técnicas e Comerciais da União Europeia para Exportações Brasileiras",
        "excerpt": "Guia completo sobre barreiras técnicas, sanitárias e regulatórias impostas pela União Europeia às exportações brasileiras, certificações CE, REACH, normas técnicas e estratégias de adequação.",
        "name": "Barreiras Técnicas UE — Exportação",
        "desc": "Guia completo sobre barreiras técnicas e regulatórias da UE para exportações brasileiras: certificações CE, REACH, normas sanitárias e estratégias de adequação comercial.",
        "readTime": 16,
        "tags": ["Barreiras Comerciais", "União Europeia", "Exportação", "Certificações", "Regulamentação Técnica"]
    },
    {
        "slug": "certificacoes-ue-produtos-agricolas-brasil-exportacao",
        "title": "Certificações da União Europeia para Produtos Agrícolas Brasileiros",
        "excerpt": "Guia completo sobre certificações exigidas pela UE para exportação agrícola brasileira, orgânica, GlobalGAP, Rainforest Alliance, rastreabilidade e conformidade com o EUDR.",
        "name": "Certificações UE — Produtos Agrícolas",
        "desc": "Guia completo sobre certificações da UE para exportação agrícola brasileira: orgânica, GlobalGAP, Rainforest Alliance, rastreabilidade e conformidade com o EUDR.",
        "readTime": 15,
        "tags": ["Certificações", "União Europeia", "Produtos Agrícolas", "Exportação", "Sustentabilidade"]
    },
    {
        "slug": "comercio-brasil-alemanha-setores-oportunidades",
        "title": "Comércio Brasil-Alemanha: Principais Setores e Oportunidades Bilaterais",
        "excerpt": "Análise completa das relações comerciais Brasil-Alemanha, principais produtos exportados e importados, oportunidades em máquinas, químicos, autopeças e cooperação tecnológica bilateral.",
        "name": "Comércio Brasil-Alemanha",
        "desc": "Análise completa das relações comerciais Brasil-Alemanha: principais produtos, oportunidades em máquinas, químicos, autopeças e cooperação tecnológica bilateral.",
        "readTime": 14,
        "tags": ["Brasil-Alemanha", "Comércio Bilateral", "Exportação", "Importação", "Cooperação"]
    },
    # === Cluster D: Digital Trade & E-commerce (5) ===
    {
        "slug": "marketplace-internacional-exportacao-brasil-vendedor-global",
        "title": "Marketplaces Internacionais: Como Exportar pelo Brasil como Vendedor Global",
        "excerpt": "Guia completo para exportadores brasileiros venderem em marketplaces internacionais como Amazon, Mercado Livre, Alibaba e eBay, incluindo logística, tributação e regularização aduaneira.",
        "name": "Marketplaces — Vendedor Global",
        "desc": "Guia completo para exportadores brasileiros venderem em marketplaces internacionais: Amazon, Mercado Livre, Alibaba, eBay com logística, tributação e regularização aduaneira.",
        "readTime": 16,
        "tags": ["Marketplaces", "E-commerce", "Exportação", "Vendas Online", "Logística Internacional"]
    },
    {
        "slug": "logistica-cross-border-ecommerce-desafios-solucoes-brasil",
        "title": "Logística Cross-Border no E-commerce: Desafios e Soluções para o Brasil",
        "excerpt": "Guia completo sobre logística cross-border para e-commerce no Brasil, transporte internacional, desembaraço aduaneiro, tributação de remessas internacionais, armazenagem e prazos de entrega.",
        "name": "Cross-Border — Logística",
        "desc": "Guia completo sobre logística cross-border para e-commerce no Brasil: transporte internacional, desembaraço aduaneiro, tributação de remessas e prazos de entrega.",
        "readTime": 16,
        "tags": ["Logística", "Cross-Border", "E-commerce", "Transporte Internacional", "Desembaraço Aduaneiro"]
    },
    {
        "slug": "meios-pagamento-digitais-comex-pix-crypto-brasil",
        "title": "Meios de Pagamento Digitais no Comércio Exterior: Pix, Crypto e Novas Fronteiras",
        "excerpt": "Análise completa dos meios de pagamento digitais no comércio exterior brasileiro, Pix internacional, criptomoedas, stablecoins, Drex e soluções fintech para transações cross-border.",
        "name": "Pagamentos Digitais — Pix e Crypto",
        "desc": "Análise completa dos meios de pagamento digitais no comércio exterior brasileiro: Pix internacional, criptomoedas, stablecoins, Drex e soluções fintech cross-border.",
        "readTime": 14,
        "tags": ["Pagamentos Digitais", "Pix", "Criptomoedas", "Câmbio", "Fintechs", "Comércio Exterior"]
    },
    {
        "slug": "compliance-digital-lgpd-comex-protecao-dados",
        "title": "Compliance Digital e LGPD no Comércio Exterior: Proteção de Dados Internacionais",
        "excerpt": "Guia completo sobre compliance digital no comércio exterior brasileiro, adequação à LGPD, proteção de dados em operações internacionais, contratos eletrônicos e segurança da informação.",
        "name": "Compliance Digital — LGPD",
        "desc": "Guia completo sobre compliance digital no comércio exterior brasileiro: adequação à LGPD, proteção de dados em operações internacionais e segurança da informação.",
        "readTime": 14,
        "tags": ["Compliance Digital", "LGPD", "Proteção de Dados", "Comércio Exterior", "Segurança da Informação"]
    },
    {
        "slug": "plataformas-b2b-digitais-exportacao-brasil-negocios",
        "title": "Plataformas B2B Digitais para Exportação: Conectando Negócios Brasileiros ao Mundo",
        "excerpt": "Guia completo sobre plataformas B2B digitais para exportação brasileira, conexão com compradores internacionais, ferramentas de matchmaking, prospecção digital e inteligência comercial.",
        "name": "Plataformas B2B — Exportação",
        "desc": "Guia completo sobre plataformas B2B digitais para exportação brasileira: conexão com compradores, matchmaking, prospecção digital e inteligência comercial.",
        "readTime": 14,
        "tags": ["Plataformas B2B", "Exportação", "Prospecção", "Inteligência Comercial", "Negócios Internacionais"]
    },
    # === Cluster E: Health & Pharma (5) ===
    {
        "slug": "importacao-medicamentos-insumos-farmaceuticos-brasil",
        "title": "Importação de Medicamentos e Insumos Farmacêuticos no Brasil: Guia Regulatório",
        "excerpt": "Guia completo sobre importação de medicamentos e insumos farmacêuticos no Brasil, registro ANVISA, classificação NCM, licenciamento, tributação e boas práticas de distribuição.",
        "name": "Importação Farmacêutica — ANVISA",
        "desc": "Guia completo sobre importação de medicamentos no Brasil: registro ANVISA, classificação NCM, licenciamento de importação, tributação e boas práticas de distribuição.",
        "readTime": 15,
        "tags": ["Medicamentos", "Insumos Farmacêuticos", "Importação", "ANVISA", "Regulação Sanitária"]
    },
    {
        "slug": "dispositivos-medicos-importacao-anvisa-classificacao",
        "title": "Dispositivos Médicos na Importação Brasileira: Registro ANVISA e Classificação de Risco",
        "excerpt": "Guia completo sobre importação de dispositivos médicos no Brasil, classificação de risco pela RDC 830/2023, registro ANVISA, certificação INMETRO e regularização aduaneira.",
        "name": "Dispositivos Médicos — ANVISA",
        "desc": "Guia completo sobre importação de dispositivos médicos no Brasil: classificação de risco RDC 830/2023, registro ANVISA, certificação INMETRO e regularização aduaneira.",
        "readTime": 15,
        "tags": ["Dispositivos Médicos", "Importação", "ANVISA", "Classificação de Risco", "Regulação Sanitária"]
    },
    {
        "slug": "exportacao-equipamentos-hospitalares-mercado-global",
        "title": "Exportação de Equipamentos Hospitalares do Brasil: Conquistando o Mercado Global",
        "excerpt": "Guia completo sobre exportação de equipamentos hospitalares brasileiros, oportunidades em mercados emergentes, certificações CE e FDA, INMETRO e financiamento à exportação do setor.",
        "name": "Equipamentos Hospitalares — Exportação",
        "desc": "Guia completo sobre exportação de equipamentos hospitalares brasileiros: mercados emergentes, certificações CE/FDA, INMETRO e financiamento à exportação do setor.",
        "readTime": 15,
        "tags": ["Equipamentos Hospitalares", "Exportação", "Certificações", "Saúde", "Mercado Global"]
    },
    {
        "slug": "industria-farmaceutica-brasileira-inovacao-exportacao",
        "title": "Indústria Farmacêutica Brasileira: Inovação e Exportação para Mercados Globais",
        "excerpt": "Análise completa da indústria farmacêutica brasileira, capacidade de inovação, exportação de medicamentos para América Latina, África, mercados regulados EUA e Europa e parcerias estratégicas.",
        "name": "Indústria Farmacêutica — Exportação",
        "desc": "Análise completa da indústria farmacêutica brasileira: inovação, exportação para América Latina, África, EUA e Europa, registros sanitários e parcerias estratégicas.",
        "readTime": 14,
        "tags": ["Indústria Farmacêutica", "Exportação", "Inovação", "Medicamentos", "Saúde Global"]
    },
    {
        "slug": "cosmeticos-brasil-exportacao-mercado-internacional",
        "title": "Cosméticos Brasileiros na Exportação: Produtos, Mercados e Regulamentação ANVISA",
        "excerpt": "Guia completo sobre exportação de cosméticos brasileiros, mercado global de beleza, regulamentação ANVISA, certificações internacionais e oportunidades em América Latina, EUA e Europa.",
        "name": "Cosméticos — Exportação Global",
        "desc": "Guia completo sobre exportação de cosméticos brasileiros: mercado global de beleza, regulamentação ANVISA, certificações internacionais e oportunidades nos principais mercados.",
        "readTime": 14,
        "tags": ["Cosméticos", "Exportação", "Beleza", "ANVISA", "Mercado Internacional"]
    },
    # === Cluster F: Education, Knowledge Trade & BRICS (5) ===
    {
        "slug": "educacao-superior-brasileira-internacionalizacao-alunos",
        "title": "Internacionalização da Educação Superior Brasileira: Atração de Alunos Estrangeiros",
        "excerpt": "Análise completa da internacionalização do ensino superior brasileiro, programas de atração de alunos estrangeiros, intercâmbio acadêmico, convênios e impacto econômico do setor educacional.",
        "name": "Educação Superior — Internacionalização",
        "desc": "Análise completa da internacionalização do ensino superior brasileiro: atração de alunos estrangeiros, intercâmbio acadêmico, convênios e impacto econômico.",
        "readTime": 15,
        "tags": ["Educação Superior", "Internacionalização", "Intercâmbio", "Alunos Estrangeiros", "Cooperação Acadêmica"]
    },
    {
        "slug": "cursos-online-brasil-exportacao-educacao-distancia",
        "title": "Cursos Online Brasileiros na Exportação: Educação a Distância para o Mundo",
        "excerpt": "Guia completo sobre exportação de cursos online brasileiros, oportunidades no mercado global de EAD, plataformas internacionais, certificações e aspectos tributários e regulatórios.",
        "name": "Cursos Online — EAD Global",
        "desc": "Guia completo sobre exportação de cursos online brasileiros: mercado global de EAD, plataformas internacionais, certificações e aspectos tributários da educação a distância.",
        "readTime": 12,
        "tags": ["Cursos Online", "EAD", "Exportação de Serviços", "Educação a Distância", "Mercado Global"]
    },
    {
        "slug": "portugues-lingua-estrangeira-ensino-internacionalizacao",
        "title": "Português como Língua Estrangeira: Ensino, Certificação e Internacionalização",
        "excerpt": "Análise completa do ensino de português como língua estrangeira no mundo, certificação CELPE-Bras, oportunidades para escolas brasileiras, intercâmbio educacional e impacto econômico.",
        "name": "Português — Língua Estrangeira",
        "desc": "Análise completa do ensino de português como língua estrangeira: certificação CELPE-Bras, oportunidades para escolas, intercâmbio educacional e impacto econômico.",
        "readTime": 13,
        "tags": ["Português", "Língua Estrangeira", "Ensino", "CELPE-Bras", "Internacionalização"]
    },
    {
        "slug": "brics-nova-moeda-comercio-desdolarizacao-brasil",
        "title": "BRICS e a Nova Moeda para o Comércio: Desdolarização e Alternativas para o Brasil",
        "excerpt": "Análise completa da iniciativa dos BRICS por mecanismos alternativos de pagamento, impacto da desdolarização para exportadores brasileiros, BRICS Pay e perspectivas do comércio entre membros.",
        "name": "BRICS — Desdolarização",
        "desc": "Análise completa da iniciativa dos BRICS por alternativas de pagamento: impacto da desdolarização, BRICS Pay e perspectivas para exportadores brasileiros.",
        "readTime": 15,
        "tags": ["BRICS", "Moeda", "Desdolarização", "Comércio Internacional", "Geopolítica"]
    },
    {
        "slug": "comercio-brasil-india-farmacos-petroleo-oportunidades",
        "title": "Comércio Brasil-Índia: Fármacos, Petróleo e Oportunidades Bilaterais",
        "excerpt": "Análise completa das relações comerciais Brasil-Índia, petróleo e derivados, fármacos e medicamentos, açúcar, minérios, acordos bilaterais e oportunidades para exportadores brasileiros.",
        "name": "Comércio Brasil-Índia",
        "desc": "Análise completa das relações comerciais Brasil-Índia: petróleo, fármacos, açúcar, minérios, acordos bilaterais e oportunidades setoriais para exportadores brasileiros.",
        "readTime": 15,
        "tags": ["Brasil-Índia", "Comércio Bilateral", "Fármacos", "Petróleo", "Oportunidades"]
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
print("INTEGRATING 30 BLOG POSTS — June 30 2026")
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
