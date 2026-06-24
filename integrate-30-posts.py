"""
Integration script for 30 new TRADEXA blog posts.
Inserts entries into postMeta.ts, postContentMap.ts, and prerender.mjs.
"""
import re
from datetime import datetime

BASE = "/home/nuh_tapinar/tmp-build/project-clean"

POSTS = [
    # Asia Emergente (8)
    {"slug": "exportar-para-bangladesh-vestuario-oportunidades", "title": "Como Exportar para Bangladesh: Guia de Vestuário e Oportunidades Comerciais", "excerpt": "Guia completo para exportar para Bangladesh: oportunidades no setor de vestuário, têxteis, acordos comerciais, logística, barreiras tarifárias e estratégias de entrada.", "tags": ["Exportação", "Bangladesh", "Vestuário", "Ásia", "Moda"]},
    {"slug": "exportar-para-paquistao-texteis-oportunidades", "title": "Exportar para o Paquistão: Oportunidades em Têxteis e Comércio Bilateral", "excerpt": "Guia completo sobre exportação para o Paquistão: setor têxtil, oportunidades comerciais, aspectos regulatórios, logística e ferramentas de inteligência.", "tags": ["Exportação", "Paquistão", "Têxteis", "Ásia", "Comércio Internacional"]},
    {"slug": "exportar-para-sri-lanka-cha-borracha-gemas", "title": "Exportar para o Sri Lanka: Oportunidades em Chá, Borracha, Gemas e Turismo", "excerpt": "Guia para exportar para o Sri Lanka: chá, borracha, gemas preciosas, turismo e hospitalidade. Oportunidades, logística e inteligência comercial.", "tags": ["Exportação", "Sri Lanka", "Ásia", "Commodities", "Gemologia"]},
    {"slug": "exportar-para-camboja-texteis-potencial", "title": "Exportar para o Camboja: Potencial Têxtil, Agronegócio e Construção", "excerpt": "Guia para exportar para o Camboja: setor têxtil, agronegócio, construção civil, logística e oportunidades com inteligência de mercado.", "tags": ["Exportação", "Camboja", "Têxteis", "Ásia", "Mercados Emergentes"]},
    {"slug": "importar-da-turquia-texteis-maquinario", "title": "Importar da Turquia: Têxteis, Maquinário e Produtos Siderúrgicos", "excerpt": "Guia completo para importar da Turquia: têxteis, maquinário industrial, produtos siderúrgicos, logística, tributos e inteligência comercial.", "tags": ["Importação", "Turquia", "Têxteis", "Maquinário", "Siderurgia"]},
    {"slug": "exportar-para-nepal-artesanato-oportunidades", "title": "Exportar para o Nepal: Artesanato, Turismo e Oportunidades Comerciais", "excerpt": "Guia completo para exportar para o Nepal: artesanato, turismo, oportunidades comerciais, logística e inteligência de mercado para o Himalaia.", "tags": ["Exportação", "Nepal", "Artesanato", "Ásia", "Mercados Emergentes"]},
    {"slug": "exportar-para-mongolia-minerios-oportunidades", "title": "Exportar para a Mongólia: Oportunidades em Minérios, Pecuária e Infraestrutura", "excerpt": "Guia para exportar para a Mongólia: minérios, pecuária, carne, infraestrutura, logística e inteligência comercial na Ásia Central.", "tags": ["Exportação", "Mongólia", "Minérios", "Ásia", "Mercados Emergentes"]},
    {"slug": "exportar-para-mianmar-agricultura-oportunidades", "title": "Exportar para Mianmar: Oportunidades em Agricultura, Mineração e Construção", "excerpt": "Guia completo para exportar para Mianmar: agricultura, mineração, construção civil, logística e ferramentas de inteligência de mercado.", "tags": ["Exportação", "Mianmar", "Agricultura", "Ásia", "Mineração"]},

    # Logística (8)
    {"slug": "transporte-multimodal-comex-vantagens", "title": "Transporte Multimodal no Comércio Exterior: Vantagens e Como Implementar", "excerpt": "Guia completo sobre transporte multimodal no comércio exterior: marco legal, diferenças do intermodal, vantagens, implementação e inteligência logística.", "tags": ["Logística", "Transporte Multimodal", "Comércio Exterior", "Supply Chain", "Custos"]},
    {"slug": "transportes-intermodal-brasil-vantagens", "title": "Transporte Intermodal no Brasil: Vantagens e Aplicações no Comex", "excerpt": "Guia sobre transporte intermodal no Brasil: matriz de transportes, vantagens, aplicações no agronegócio, indústria e tecnologia.", "tags": ["Logística", "Transporte Intermodal", "Brasil", "Supply Chain", "Custos"]},
    {"slug": "seguros-internacionais-carga-transporte", "title": "Seguros Internacionais de Carga: Tipos, Coberturas e Como Contratar", "excerpt": "Guia completo sobre seguros internacionais de carga: tipos de cobertura, cláusulas, contratação, sinistros e melhores práticas.", "tags": ["Logística", "Seguros", "Carga", "Transporte", "Gestão de Riscos"]},
    {"slug": "custos-logisticos-brasil-comparativo-exportacao", "title": "Custos Logísticos no Brasil: Comparativo e Estratégias de Redução", "excerpt": "Guia sobre custos logísticos no Brasil: breakdown comparativo, custo Brasil, gargalos e estratégias para reduzir despesas na exportação.", "tags": ["Logística", "Custos", "Brasil", "Exportação", "Supply Chain"]},
    {"slug": "rastreamento-carga-real-time-internacional", "title": "Rastreamento de Carga em Tempo Real: Tecnologias e Benefícios para o Comex", "excerpt": "Guia sobre rastreamento de carga em tempo real: IoT, GPS, blockchain, benefícios logísticos, desafios e tendências para o comex.", "tags": ["Logística", "Rastreamento", "IoT", "Supply Chain", "Tecnologia"]},
    {"slug": "inventarios-importacao-gestao-estoques", "title": "Gestão de Estoques na Importação: Métodos e Sistemas de Controle", "excerpt": "Guia sobre gestão de estoques na importação: métodos LEC, curva ABC, sistemas WMS, ERP, desafios brasileiros e melhores práticas.", "tags": ["Importação", "Estoques", "Gestão", "Supply Chain", "Logística"]},
    {"slug": "contratos-frete-internacional-clausulas", "title": "Contratos de Frete Internacional: Cláusulas Essenciais e Negociação", "excerpt": "Guia completo sobre contratos de frete internacional: fundamentos jurídicos, cláusulas essenciais, estratégias de negociação e inteligência.", "tags": ["Logística", "Frete", "Contratos", "Transporte", "Comex"]},
    {"slug": "otimizacao-rotas-transporte-maritimo", "title": "Otimização de Rotas no Transporte Marítimo: Estratégias e Ferramentas", "excerpt": "Guia sobre otimização de rotas marítimas: planejamento de escalas, ferramentas AIS, análise de custos e tendências para supply chain global.", "tags": ["Logística", "Rotas Marítimas", "Transporte", "Otimização", "Supply Chain"]},

    # Tecnologia (6)
    {"slug": "ciberseguranca-comercio-exterior-protecao", "title": "Cibersegurança no Comércio Exterior: Proteção de Dados e Transações", "excerpt": "Guia sobre cibersegurança no comex: ameaças digitais, LGPD, proteção de transações financeiras, boas práticas e ferramentas de defesa.", "tags": ["Tecnologia", "Cibersegurança", "Comércio Exterior", "Proteção de Dados", "LGPD"]},
    {"slug": "cloud-computing-comex-solucoes-digitais", "title": "Cloud Computing no Comex: Soluções Digitais para Importadores e Exportadores", "excerpt": "Guia sobre cloud computing no comex: SaaS, IaaS, benefícios, desafios de adoção e tendências para digitalização do setor.", "tags": ["Tecnologia", "Cloud Computing", "Comex", "Digitalização", "SaaS"]},
    {"slug": "big-data-inteligencia-mercado-internacional", "title": "Big Data na Inteligência de Mercado Internacional: Como Analisar Dados de Comércio", "excerpt": "Guia sobre big data na inteligência de mercado internacional: fontes de dados, análise preditiva, visualização e ferramentas TRADEXA.", "tags": ["Tecnologia", "Big Data", "Inteligência de Mercado", "Dados", "Comex"]},
    {"slug": "ia-generativa-comex-inovacao", "title": "IA Generativa no Comércio Exterior: Aplicações e Inovação para Importadores", "excerpt": "Guia sobre IA generativa no comex: automação de documentos, classificação NCM, análise de contratos e otimização de processos.", "tags": ["Tecnologia", "IA Generativa", "Inovação", "Comex", "Automação"]},
    {"slug": "api-integracao-dados-comex", "title": "APIs e Integração de Dados no Comex: Conectando Sistemas de Comércio Exterior", "excerpt": "Guia sobre APIs no comex: integração com Siscomex, ERPs, plataformas de inteligência, automação e arquitetura de dados.", "tags": ["Tecnologia", "API", "Integração", "Dados", "Comex"]},
    {"slug": "software-gestao-comex-erp-internacional", "title": "Software de Gestão para Comex: ERPs Internacionais e Nacionais Comparados", "excerpt": "Guia comparativo de ERPs para comex: SAP, Oracle, Totvs, Senior e soluções de inteligência de mercado para importadores.", "tags": ["Tecnologia", "ERP", "Software", "Gestão", "Comex"]},

    # Órgãos Anuentes (4)
    {"slug": "camex-camara-comercio-exterior-funcoes", "title": "CAMEX: Câmara de Comércio Exterior — Funções, Composição e Impacto no Comex", "excerpt": "Guia completo sobre a CAMEX: funções, composição, resoluções, impacto no comex brasileiro e como as empresas podem acompanhar as decisões.", "tags": ["Órgãos Anuentes", "CAMEX", "Comex", "Regulamentação", "Governo"]},
    {"slug": "mdic-ministerio-desenvolvimento-comex", "title": "MDIC: Ministério do Desenvolvimento — Papel no Comércio Exterior Brasileiro", "excerpt": "Guia sobre o MDIC e seu papel no comex brasileiro: secretarias, políticas comerciais, programas de apoio e inteligência de mercado.", "tags": ["Órgãos Anuentes", "MDIC", "Comex", "Governo", "Política Comercial"]},
    {"slug": "bndes-financiamento-exportacao", "title": "BNDES Financiamento à Exportação: Linhas de Crédito e Como Acessar", "excerpt": "Guia completo sobre financiamento BNDES-Exim: pré-embarque, pós-embarque, automático, balcão, taxas TLP, garantias e processo de aprovação.", "tags": ["Órgãos Anuentes", "BNDES", "Financiamento", "Exportação", "Crédito"]},
    {"slug": "anvisa-importacao-alimentos-regularizacao", "title": "ANVISA na Importação de Alimentos: Regularização, Rotulagem e Procedimentos", "excerpt": "Guia sobre regularização ANVISA para importação de alimentos: registro, notificação, rotulagem, procedimentos aduaneiros e adequação.", "tags": ["Órgãos Anuentes", "ANVISA", "Alimentos", "Importação", "Regularização"]},

    # Negócios (4)
    {"slug": "franquias-internacionais-exportacao-modelo-negocio", "title": "Franquias Internacionais: Exportação do Modelo de Negócio Brasileiro", "excerpt": "Guia sobre internacionalização de franquias brasileiras: modelos de expansão, contratos, aspectos legais, tributários e inteligência de mercado.", "tags": ["Negócios", "Franquias", "Exportação", "Internacionalização", "Modelo de Negócio"]},
    {"slug": "licenciamento-marcas-internacional", "title": "Licenciamento de Marcas no Mercado Internacional: Como Proteger e Monetizar", "excerpt": "Guia sobre licenciamento de marcas no exterior: registro internacional, contratos, royalties, proteção intelectual e estratégias de monetização.", "tags": ["Negócios", "Licenciamento", "Marcas", "Propriedade Intelectual", "Internacionalização"]},
    {"slug": "cooperacao-tecnica-internacional-empresas", "title": "Cooperação Técnica Internacional para Empresas: Oportunidades e Parcerias", "excerpt": "Guia sobre cooperação técnica internacional empresarial: modalidades, parcerias, financiamento multilateral e acesso à inovação global.", "tags": ["Negócios", "Cooperação", "Internacional", "Parcerias", "Inovação"]},
    {"slug": "associacoes-comerciais-comex-apoio", "title": "Associações Comerciais no Comex: Apoio ao Exportador e Networking Internacional", "excerpt": "Guia sobre associações comerciais no comex: AEB, CECIEx, Câmaras de Comércio, networking internacional e programas de apoio à exportação.", "tags": ["Negócios", "Associações", "Comex", "Exportador", "Networking"]},
]

DATE = "2026-06-24"

def escape_meta(s):
    return s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n").replace("\r", "")

def make_tags(tags):
    return ", ".join(f'"{t}"' for t in tags)

# 1. postMeta.ts
print("=== PostMeta.ts Integration ===")
meta_path = f"{BASE}/src/data/blog/postMeta.ts"
with open(meta_path) as f:
    meta_content = f.read()

meta_entries = []
for p in POSTS:
    tags_str = make_tags(p["tags"])
    rt = max(12, min(18, len(p["excerpt"]) // 12))
    entry = f'  {{ slug: "{p["slug"]}", title: "{escape_meta(p["title"])}", excerpt: "{escape_meta(p["excerpt"])}", date: "{DATE}", readTime: {rt}, tags: [{tags_str}] }}'
    meta_entries.append(entry)

# Insert before the closing ];
close_idx = meta_content.rfind("];\n")
if close_idx == -1:
    close_idx = meta_content.rfind("];")
if close_idx == -1:
    raise ValueError("Could not find ]; in postMeta.ts")

new_meta = meta_content[:close_idx] + ",\n" + ",\n".join(meta_entries) + "\n" + meta_content[close_idx:]
with open(meta_path, "w") as f:
    f.write(new_meta)

meta_count = sum(1 for l in new_meta.split("\n") if 'slug:' in l and 'string;' not in l)
print(f"✅ postMeta.ts: {meta_count} entries")

# 2. postContentMap.ts
print("\n=== PostContentMap.ts Integration ===")
map_path = f"{BASE}/src/data/blog/postContentMap.ts"
with open(map_path) as f:
    lines = f.readlines()

# Find the map's closing };
close_map = None
for i in range(len(lines) - 1, -1, -1):
    if lines[i].strip() == "};":
        for j in range(i + 1, min(i + 4, len(lines))):
            if "getPostContent" in lines[j]:
                close_map = i
                break
        if close_map is not None:
            break

if close_map is None:
    raise ValueError("Could not find map closing }; in postContentMap.ts")

# Insert entries
for p in reversed(POSTS):
    entry = f'  "{p["slug"]}": () => import("./content/{p["slug"]}"),\n'
    lines.insert(close_map, entry)

with open(map_path, "w") as f:
    f.writelines(lines)

map_count = sum(1 for l in lines if '() => import' in l)
print(f"✅ postContentMap.ts: {map_count} entries")
# Verify getPostContent still exists
gpc_count = sum(1 for l in lines if 'getPostContent' in l)
print(f"   getPostContent exports: {gpc_count}")

# 3. prerender.mjs
print("\n=== Prerender.mjs Integration ===")
prerender_path = f"{BASE}/scripts/prerender.mjs"
with open(prerender_path) as f:
    prerender_lines = f.readlines()

# Find last ]; (closing BLOG_POSTS array)
blog_end = None
for i in range(len(prerender_lines) - 1, -1, -1):
    if prerender_lines[i].strip() == "];":
        blog_end = i
        break

if blog_end is None:
    raise ValueError("Could not find BLOG_POSTS closing ]; in prerender.mjs")

prerender_entries = []
for p in POSTS:
    desc = escape_meta(p["excerpt"])
    name = escape_meta(p["title"])
    entry = f'  {{ slug: "{p["slug"]}", name: "{name}", desc: "{desc}" }},'
    prerender_entries.append(entry)

for entry in reversed(prerender_entries):
    prerender_lines.insert(blog_end, entry + "\n")

with open(prerender_path, "w") as f:
    f.writelines(prerender_lines)

# Count BLOG_POSTS slugs
prerender_content = "".join(prerender_lines)
prerender_slugs = len(re.findall(r'slug: "([^"]+)"', prerender_content))
print(f"✅ prerender.mjs: ~{prerender_slugs} slug entries")

print("\n=== Integration Complete ===")
print(f"Meta entries: {meta_count}")
print(f"Content map entries: {map_count}")
print(f"Content files: $(ls {BASE}/src/data/blog/content/*.ts | wc -l)")
