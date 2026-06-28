#!/usr/bin/env python3
"""
Integrate 30 new blog posts into postMeta.ts, postContentMap.ts, and prerender.mjs.
Line-based insertion to avoid known pitfalls.
"""
import re
from datetime import datetime

POSTS = [
    {
        "slug": "planejamento-estrategico-comex-ciclo-anual-metas",
        "title": "Planejamento Estratégico para Comex: Ciclo Anual e Metas",
        "excerpt": "Guia completo sobre planejamento estratégico para departamentos de comércio exterior. Saiba como definir metas anuais, KPIs, ciclo de revisão e orçamento para sua operação.",
        "readTime": 21,
        "name": "Planejamento Estratégico para Comex: Ciclo Anual e Metas",
        "desc": "Guia completo sobre planejamento estratégico para departamentos de comércio exterior: metas SMART, KPIs por processo, ciclo de revisão trimestral, orçamento e planos de ação.",
        "tags": ["Planejamento Estratégico", "Gestão", "Exportação", "Importação"],
    },
    {
        "slug": "analise-cenarios-comex-planejamento-mercados",
        "title": "Análise de Cenários no Comex: Planejamento para Incertezas",
        "excerpt": "Aprenda a aplicar análise de cenários na gestão de comércio exterior. Metodologia prática para antecipar riscos cambiais, tarifários e logísticos.",
        "readTime": 20,
        "name": "Análise de Cenários no Comex: Planejamento para Incertezas",
        "desc": "Metodologia prática para aplicar análise de cenários no comércio exterior: fatores críticos, construção de cenários, matriz de impactos e planos de contingência para importação e exportação.",
        "tags": ["Planejamento Estratégico", "Gestão de Riscos", "Câmbio", "Exportação"],
    },
    {
        "slug": "vendas-consultivas-b2b-internacional-estrategias",
        "title": "Vendas Consultivas B2B Internacional: Estratégias para Exportadores",
        "excerpt": "Guia completo de vendas consultivas para exportadores brasileiros: metodologia SPIN, diagnóstico, propostas de valor, negociação intercultural e fechamento.",
        "readTime": 22,
        "name": "Vendas Consultivas B2B Internacional: Estratégias",
        "desc": "Guia completo de vendas consultivas para exportadores brasileiros: metodologia SPIN, diagnóstico de necessidades, proposta de valor diferenciada e fechamento de contratos internacionais.",
        "tags": ["Vendas", "Exportação", "Marketing Internacional", "B2B"],
    },
    {
        "slug": "business-intelligence-dashboards-comex-kpis",
        "title": "Business Intelligence no Comex: Dashboards e KPIs Práticos",
        "excerpt": "Aprenda a criar dashboards e KPIs para operações de comércio exterior com Power BI, Tableau e ferramentas de visualização de dados.",
        "readTime": 22,
        "name": "Business Intelligence no Comex: Dashboards e KPIs",
        "desc": "Guia prático para criar dashboards e KPIs de comércio exterior: indicadores de performance, fontes de dados como Comex Stat, ferramentas de BI e automação de reports.",
        "tags": ["Business Intelligence", "Gestão", "KPIs", "Tecnologia"],
    },
    {
        "slug": "gestao-riscos-fornecedores-matriz-avaliacao",
        "title": "Gestão de Riscos em Fornecedores Internacionais: Matriz de Avaliação",
        "excerpt": "Guia prático para avaliar e gerenciar riscos em fornecedores internacionais com matriz de risco, due diligence e monitoramento contínuo.",
        "readTime": 31,
        "name": "Gestão de Riscos em Fornecedores Internacionais",
        "desc": "Guia prático para avaliar e gerenciar riscos em fornecedores internacionais: matriz de risco completa, due diligence, certificações, KPIs de monitoramento e planos de contingência.",
        "tags": ["Gestão de Riscos", "Fornecedores", "Importação", "Due Diligence", "Compliance"],
    },
    {
        "slug": "gestao-relacionamento-clientes-internacionais-crm",
        "title": "Gestão de Relacionamento com Clientes Internacionais",
        "excerpt": "Estratégias e ferramentas CRM para gestão de relacionamento com clientes no mercado internacional: segmentação e retenção.",
        "readTime": 29,
        "name": "Gestão de Relacionamento com Clientes Internacionais",
        "desc": "Guia completo de CRM internacional para exportadores: segmentação de clientes, comunicação intercultural, programas de fidelidade B2B, métricas de retenção e automação de marketing.",
        "tags": ["CRM", "Relacionamento", "Exportação", "Vendas", "Marketing Internacional"],
    },
    {
        "slug": "branding-internacional-exportadores-construir-marca",
        "title": "Branding Internacional para Exportadores: Como Construir Sua Marca",
        "excerpt": "Guia completo de branding internacional: posicionamento, identidade visual adaptável, comunicação cross-cultural e proteção jurídica da marca.",
        "readTime": 24,
        "name": "Branding Internacional para Exportadores",
        "desc": "Guia completo de branding internacional para exportadores brasileiros: posicionamento global, naming, identidade visual, storytelling, registro de marca no exterior e branding digital.",
        "tags": ["Branding", "Marketing Internacional", "Exportação"],
    },
    {
        "slug": "negociacao-intercultural-barreiras-culturais-comex",
        "title": "Negociação Intercultural: Superando Barreiras no Comércio Exterior",
        "excerpt": "Guia prático para negociação intercultural no comex: diferenças culturais, estilos de negociação por região e etiqueta empresarial global.",
        "readTime": 29,
        "name": "Negociação Intercultural no Comércio Exterior",
        "desc": "Guia prático para negociação intercultural no comércio exterior: dimensões culturais de Hofstede, estilos de negociação por região, etiqueta empresarial e checklist cultural.",
        "tags": ["Negociação", "Comunicação", "Exportação", "Importação", "Relações Internacionais"],
    },
    {
        "slug": "pos-venda-exportacao-servicos-assistencia",
        "title": "Pós-Venda na Exportação: Serviços e Assistência ao Cliente",
        "excerpt": "Guia completo de pós-venda na exportação: assistência técnica internacional, gestão de garantias, peças de reposição e fidelização.",
        "readTime": 24,
        "name": "Pós-Venda na Exportação: Serviços e Assistência",
        "desc": "Guia completo sobre pós-venda na exportação: modelos de assistência técnica internacional, gestão de garantias, peças de reposição, SLA e métricas de satisfação como NPS e CSAT.",
        "tags": ["Pós-Venda", "Exportação", "Serviços", "Relacionamento", "Logística"],
    },
    {
        "slug": "marketing-conteudo-internacional-exportadores-b2b",
        "title": "Marketing de Conteúdo Internacional para Exportadores B2B",
        "excerpt": "Guia prático de marketing de conteúdo B2B internacional: inbound marketing, conteúdo multilíngue, SEO internacional e geração de leads.",
        "readTime": 22,
        "name": "Marketing de Conteúdo Internacional para Exportadores",
        "desc": "Guia prático de marketing de conteúdo para exportadores: inbound marketing B2B, pesquisa de palavras-chave internacionais, SEO multilíngue e geração de leads qualificados no exterior.",
        "tags": ["Marketing de Conteúdo", "Marketing Digital", "Exportação", "B2B", "SEO"],
    },
    {
        "slug": "tesouraria-internacional-gestao-cambio-fluxo-caixa",
        "title": "Tesouraria Internacional: Gestão de Câmbio e Fluxo de Caixa",
        "excerpt": "Guia completo de tesouraria internacional para empresas de comex: gestão de câmbio, fluxo de caixa multimoeda e hedge cambial.",
        "readTime": 20,
        "name": "Tesouraria Internacional no Comex",
        "desc": "Guia completo de tesouraria internacional para empresas de comércio exterior: gestão de caixa multimoeda, hedge cambial, contas no exterior e otimização financeira das operações.",
        "tags": ["Tesouraria", "Câmbio", "Gestão Financeira", "Importação", "Exportação"],
    },
    {
        "slug": "precificacao-servicos-comex-estrategia-margem",
        "title": "Precificação de Serviços no Comex: Estratégia e Margem",
        "excerpt": "Aprenda a precificar serviços de comércio exterior: formação de preços, margem de contribuição e pacotes de serviços estratégicos.",
        "readTime": 18,
        "name": "Precificação de Serviços no Comex",
        "desc": "Guia sobre precificação estratégica de serviços de comércio exterior: custos diretos e indiretos, margem de contribuição, mark-up, precificação por valor e revisão periódica de preços.",
        "tags": ["Precificação", "Serviços", "Gestão", "Comex"],
    },
    {
        "slug": "custos-transacao-comex-comparativos-eficiencia",
        "title": "Custos de Transação no Comex: Comparativos e Eficiência",
        "excerpt": "Análise dos custos de transação no comex: tributos, taxas portuárias, frete, seguro e estratégias de redução com benchmarks setoriais.",
        "readTime": 17,
        "name": "Custos de Transação no Comex: Comparativos",
        "desc": "Análise completa dos custos de transação no comércio exterior: tributos, taxas portuárias, frete, seguros, custos financeiros, metodologia de cálculo e estratégias de redução.",
        "tags": ["Custos", "Importação", "Exportação", "Logística", "Planejamento Financeiro"],
    },
    {
        "slug": "contabilidade-internacional-ifrs-brgaap-diferencas",
        "title": "Contabilidade Internacional: IFRS vs BR GAAP no Comex",
        "excerpt": "Guia sobre IFRS vs BR GAAP na contabilidade de operações de comex: reconhecimento de receitas, conversão cambial e instrumentos financeiros.",
        "readTime": 15,
        "name": "Contabilidade Internacional IFRS vs BR GAAP",
        "desc": "Guia prático sobre as diferenças entre IFRS e BR GAAP na contabilidade de comércio exterior: efeitos cambiais, hedge accounting, tributos recuperáveis e demonstrações consolidadas.",
        "tags": ["Contabilidade", "IFRS", "BR GAAP", "Gestão Financeira", "Compliance"],
    },
    {
        "slug": "planejamento-sucessorio-trading-familiar-estrategias",
        "title": "Planejamento Sucessório em Trading Familiar: Estratégias",
        "excerpt": "Guia sobre planejamento sucessório para trading companies familiares: governança, estruturação patrimonial e preparação da nova geração.",
        "readTime": 21,
        "name": "Planejamento Sucessório em Trading Familiar",
        "desc": "Guia completo sobre planejamento sucessório para trading companies familiares: governança corporativa, protocolo familiar, holding patrimonial e preparação de sucessores no comex.",
        "tags": ["Planejamento Sucessório", "Trading", "Gestão", "Governança"],
    },
    {
        "slug": "acordos-nivel-servico-logistica-slas-internacionais",
        "title": "Acordos de Nível de Serviço em Logística Internacional",
        "excerpt": "Guia prático para criar SLAs em logística internacional: KPIs por modal, penalidades e negociação com operadores.",
        "readTime": 19,
        "name": "SLAs em Logística Internacional",
        "desc": "Guia prático para criar e gerenciar Acordos de Nível de Serviço em logística internacional: KPIs por modal, metas, penalidades, bônus e softwares de gestão de SLA.",
        "tags": ["Logística", "SLA", "Gestão de Contratos", "Operadores Logísticos"],
    },
    {
        "slug": "prevencao-perdas-avarias-carga-importacao",
        "title": "Prevenção de Perdas e Avarias na Importação",
        "excerpt": "Guia completo para prevenir perdas e avarias em cargas importadas: embalagem, seguros, vistorias e gestão de sinistros.",
        "readTime": 22,
        "name": "Prevenção de Perdas e Avarias na Importação",
        "desc": "Guia completo para prevenir perdas e avarias em cargas importadas: tipos de perdas, embalagem adequada, unitização, seguros, gestão de sinistros e checklist de prevenção.",
        "tags": ["Logística", "Seguros", "Importação", "Gestão de Riscos"],
    },
    {
        "slug": "garantia-estendida-produtos-exportados-servicos",
        "title": "Garantia Estendida para Produtos Exportados",
        "excerpt": "Guia sobre garantia estendida internacional: modelos de cobertura, aspectos legais, logística de peças e serviços pós-venda.",
        "readTime": 24,
        "name": "Garantia Estendida para Produtos Exportados",
        "desc": "Guia completo sobre garantia estendida para produtos exportados: modelos de cobertura, aspectos legais internacionais, precificação, provisão contábil e rede de assistência técnica.",
        "tags": ["Garantia", "Exportação", "Serviços", "Pós-Venda"],
    },
    {
        "slug": "amostras-comercio-exterior-envio-internacional-guia",
        "title": "Amostras no Comércio Exterior: Guia de Envio Internacional",
        "excerpt": "Guia sobre envio de amostras no comex: regimes aduaneiros, documentação, tributação e estratégias para exportadores.",
        "readTime": 23,
        "name": "Amostras no Comércio Exterior: Envio Internacional",
        "desc": "Guia completo sobre envio de amostras no comércio exterior: regimes aduaneiros para amostras, documentação, modalidades de envio, tributação, limites de valor e dicas práticas.",
        "tags": ["Amostras", "Logística", "Exportação", "Importação", "Courier"],
    },
    {
        "slug": "gestao-contratos-terceirizados-servicos-logisticos",
        "title": "Gestão de Contratos Terceirizados de Serviços Logísticos",
        "excerpt": "Guia para gestão de contratos logísticos terceirizados: cláusulas essenciais, negociação, SLA e renovação.",
        "readTime": 18,
        "name": "Gestão de Contratos Logísticos Terceirizados",
        "desc": "Guia prático para gestão de contratos de serviços logísticos terceirizados: modalidades contratuais, cláusulas essenciais, indicadores de desempenho e renovação de contratos.",
        "tags": ["Gestão de Contratos", "Logística", "Terceirização", "Operadores Logísticos", "Compliance"],
    },
    {
        "slug": "iso-14001-gestao-ambiental-fornecedores-cadeia",
        "title": "ISO 14001: Gestão Ambiental na Cadeia de Fornecedores",
        "excerpt": "Guia sobre ISO 14001 na gestão de fornecedores internacionais: requisitos, certificação, auditoria e integração com operações de comex.",
        "readTime": 22,
        "name": "ISO 14001 na Cadeia de Fornecedores",
        "desc": "Guia sobre implementação da ISO 14001 na gestão de fornecedores internacionais: requisitos da norma, seleção de fornecedores verdes, auditoria ambiental e certificação passo a passo.",
        "tags": ["ISO 14001", "Sustentabilidade", "Gestão Ambiental", "Fornecedores", "Compliance"],
    },
    {
        "slug": "esg-reporting-obrigacoes-relatorios-sustentabilidade",
        "title": "ESG Reporting: Obrigações e Relatórios de Sustentabilidade",
        "excerpt": "Guia completo de ESG reporting para empresas de comex: métricas ambientais, sociais e de governança com padrões GRI e SASB.",
        "readTime": 23,
        "name": "ESG Reporting no Comex",
        "desc": "Guia completo sobre ESG reporting para empresas de comércio exterior: frameworks GRI, SASB, TCFD e IFRS S1/S2, métricas ambientais, sociais e de governança e obrigações regulatórias.",
        "tags": ["ESG", "Sustentabilidade", "Governança", "Compliance", "Exportação"],
    },
    {
        "slug": "codigo-conduta-fornecedores-internacionais-comex",
        "title": "Código de Conduta para Fornecedores Internacionais",
        "excerpt": "Guia para criar e implementar código de conduta para fornecedores: princípios éticos, direitos trabalhistas e anticorrupção.",
        "readTime": 25,
        "name": "Código de Conduta para Fornecedores Internacionais",
        "desc": "Guia completo para criar e implementar um código de conduta para fornecedores internacionais: direitos trabalhistas OIT, meio ambiente, anticorrupção FCPA e monitoramento.",
        "tags": ["Código de Conduta", "Compliance", "Fornecedores", "Sustentabilidade", "Ética"],
    },
    {
        "slug": "governanca-corporativa-trading-companies-comex",
        "title": "Governança Corporativa para Trading Companies",
        "excerpt": "Guia de governança corporativa para trading companies: estrutura societária, conselho, compliance e gestão de riscos.",
        "readTime": 27,
        "name": "Governança Corporativa para Trading Companies",
        "desc": "Guia de implementação de práticas de governança corporativa em trading companies: estrutura societária, conselho de administração, compliance, gestão de riscos e código de ética.",
        "tags": ["Governança Corporativa", "Trading", "Gestão", "Compliance", "Ética"],
    },
    {
        "slug": "inovacao-aberta-startups-parcerias-comex",
        "title": "Inovação Aberta: Parcerias com Startups no Comércio Exterior",
        "excerpt": "Guia sobre inovação aberta e parcerias com startups logtech, tradetech e regtech para transformar operações de comex.",
        "readTime": 24,
        "name": "Inovação Aberta: Parcerias com Startups no Comex",
        "desc": "Guia sobre inovação aberta e parcerias com startups no comércio exterior: verticais logtech, tradetech e regtech, modelos de parceria e métricas de inovação para trading companies.",
        "tags": ["Inovação Aberta", "Startups", "Tecnologia", "Logtech", "Tradetech"],
    },
    {
        "slug": "treinamento-capacitacao-equipe-comex-continua",
        "title": "Treinamento e Capacitação Contínua da Equipe de Comex",
        "excerpt": "Guia completo sobre treinamento de equipes de comex: programas de capacitação, certificações e trilhas de aprendizado.",
        "readTime": 22,
        "name": "Treinamento e Capacitação da Equipe de Comex",
        "desc": "Guia completo sobre treinamento e desenvolvimento de equipes de comércio exterior: certificações CPC e CSCM, trilhas de aprendizado, avaliação de competências e retenção de talentos.",
        "tags": ["Treinamento", "Capacitação", "RH", "Gestão de Pessoas", "Comex"],
    },
    {
        "slug": "gestao-conhecimento-operacoes-comex-praticas",
        "title": "Gestão do Conhecimento em Operações de Comex",
        "excerpt": "Guia para implementar gestão do conhecimento no comex: captura e compartilhamento do conhecimento tácito e explícito nas operações.",
        "readTime": 26,
        "name": "Gestão do Conhecimento em Operações de Comex",
        "desc": "Guia prático para implementar gestão do conhecimento em departamentos de comércio exterior: ciclo SECI, ferramentas como wiki e SharePoint, captura e compartilhamento de conhecimento operacional.",
        "tags": ["Gestão do Conhecimento", "Operações", "Processos", "Capacitação", "Tecnologia"],
    },
    {
        "slug": "comunicacao-intercultural-equipes-internacionais",
        "title": "Comunicação Intercultural em Equipes Internacionais",
        "excerpt": "Guia sobre comunicação intercultural em equipes globais de comex: barreiras linguísticas, estilos e etiqueta digital.",
        "readTime": 24,
        "name": "Comunicação Intercultural em Equipes Internacionais",
        "desc": "Guia completo sobre comunicação intercultural em equipes globais de comércio exterior: modelos teóricos de Hall e Hofstede, estilos por região, etiqueta digital e gestão de conflitos multiculturais.",
        "tags": ["Comunicação", "Intercultural", "Equipes", "Gestão", "Relações Internacionais"],
    },
    {
        "slug": "networking-digital-prospeccao-clientes-exterior",
        "title": "Networking Digital: Prospecção de Clientes no Exterior",
        "excerpt": "Guia sobre networking digital para exportadores: LinkedIn, feiras virtuais e cold email para prospecção B2B internacional.",
        "readTime": 26,
        "name": "Networking Digital para Prospecção Internacional",
        "desc": "Guia completo de networking digital para exportadores brasileiros: LinkedIn para exportação, feiras virtuais, cold email estruturado e prospecção B2B com diretórios de importadores.",
        "tags": ["Networking", "Prospecção", "Vendas", "Exportação", "Marketing Digital"],
    },
    {
        "slug": "funil-vendas-internacional-leads-conversao",
        "title": "Funil de Vendas Internacional: Geração de Leads e Conversão",
        "excerpt": "Guia sobre funil de vendas B2B internacional: geração de leads, qualificação BANT, nutrição e métricas de conversão.",
        "readTime": 25,
        "name": "Funil de Vendas Internacional",
        "desc": "Guia completo sobre funil de vendas internacional para exportadores: estrutura TOFU/MOFU/BOFU, qualificação de leads com BANT e MEDDIC, nutrição e métricas de conversão CAC e LTV.",
        "tags": ["Funil de Vendas", "Leads", "Conversão", "Vendas", "Marketing Digital", "Exportação"],
    },
]

DATE = "2026-06-28"

def build_meta_entry(p):
    tags_str = ", ".join(f'"{t}"' for t in p["tags"])
    return f'  {{ slug: "{p["slug"]}", title: "{p["title"]}", excerpt: "{p["excerpt"]}", date: "{DATE}", readTime: {p["readTime"]}, tags: [{tags_str}] }},'

def build_map_entry(slug):
    return f'  "{slug}": () => import("./content/{slug}"),'

def build_prerender_entry(p):
    desc_escaped = p["desc"].replace('"', '\\"')
    return f'  {{ slug: "{p["slug"]}", name: "{p["name"]}", desc: "{desc_escaped}" }},'

def insert_before_marker(lines, marker):
    """Find the LAST occurrence of marker (closing ] or }); """
    for i in range(len(lines) - 1, -1, -1):
        if lines[i].strip() == marker:
            return i
    raise ValueError(f"Marker '{marker}' not found")

def insert_before_last_closing(lines, marker):
    """Find the last marker in file (for prerender.mjs which has multiple ); arrays)."""
    idx = None
    for i in range(len(lines) - 1, -1, -1):
        if lines[i].strip() == marker:
            idx = i
            break
    if idx is None:
        raise ValueError(f"Marker '{marker}' not found")
    return idx

print("=" * 60)
print("INTEGRATING 30 NEW BLOG POSTS")
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
print(f"  ✅ postMeta.ts now has {meta_count} entries")

# --- 2. Integrate into postContentMap.ts ---
print("\n[2/3] Updating postContentMap.ts...")
with open("src/data/blog/postContentMap.ts", "r") as f:
    lines = f.readlines()
# Find the map closing }; that is followed by getPostContent
close_map = None
for i in range(len(lines) - 1, -1, -1):
    if lines[i].strip() == "};":
        # Verify this is map's }; by checking for getPostContent nearby
        for j in range(i + 1, min(i + 5, len(lines))):
            if "export async function getPostContent" in lines[j]:
                close_map = i
                break
    if close_map is not None:
        break
if close_map is None:
    print("  ❌ Could not find map closing };")
    exit(1)
for j, p in enumerate(POSTS):
    entry = build_map_entry(p["slug"]) + "\n"
    lines.insert(close_map + j, entry)
with open("src/data/blog/postContentMap.ts", "w") as f:
    f.writelines(lines)
map_count = sum(1 for l in lines if ": () => import" in l and "getPostContent" not in l)
print(f"  ✅ postContentMap.ts now has {map_count} entries (preserving getPostContent)")

# Verify getPostContent was preserved
grep_result = [l for l in lines if "getPostContent" in l]
if len(grep_result) >= 2:
    print(f"  ✅ getPostContent export preserved")
else:
    print("  ❌ getPostContent may be missing!")

# --- 3. Integrate into prerender.mjs ---
print("\n[3/3] Updating scripts/prerender.mjs...")
with open("scripts/prerender.mjs", "r") as f:
    content = f.read()

# Use backwards search from end to find the LAST ]; (BLOG_POSTS array)
end_idx = content.rfind("\n];")
if end_idx == -1:
    print("  ❌ Could not find ]; in prerender.mjs")
    exit(1)

# Append entries between last entry and final ];
prerender_insert = ""
for p in POSTS:
    prerender_insert += build_prerender_entry(p) + "\n"

new_content = content[:end_idx+1] + "\n" + prerender_insert + content[end_idx+1:]
with open("scripts/prerender.mjs", "w") as f:
    f.write(new_content)
prerender_count = sum(1 for l in new_content.split("\n") if "slug:" in l and "const BLOG_POSTS" in content[:content.index("const BLOG_POSTS")])
# Better count
blog_start = new_content.find("const BLOG_POSTS")
blog_section = new_content[blog_start:new_content.find("];", blog_start) + 2]
count_in_blog = blog_section.count("slug:")
print(f"  ✅ prerender.mjs BLOG_POSTS now has {count_in_blog} entries")

# --- Final verification ---
print("\n" + "=" * 60)
print("FINAL VERIFICATION")
print("=" * 60)
meta = sum(1 for l in open("src/data/blog/postMeta.ts") if l.strip().startswith("{ slug:"))
files = len([1 for f in __import__('glob').glob("src/data/blog/content/*.ts")])
map_count = sum(1 for l in open("src/data/blog/postContentMap.ts") if ": () => import" in l and "getPostContent" not in l)
print(f"  postMeta:     {meta}")
print(f"  content files: {files}")
print(f"  contentMap:   {map_count}")
if meta == files == map_count:
    print("\n  ✅ TRIPLET IN SYNC!")
else:
    print(f"\n  ❌ MISMATCH!")

# Verify no content field in postMeta
import subprocess
result = subprocess.run(["grep", "-c", "content:.*import", "src/data/blog/postMeta.ts"], capture_output=True, text=True)
content_fields = int(result.stdout.strip())
print(f"  postMeta content fields: {content_fields} (should be 0)")
