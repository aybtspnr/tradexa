"""
Integration script for 30 new blog posts.
Inserts entries into postMeta.ts, postContentMap.ts, and scripts/prerender.mjs
Uses line-based insertion to avoid common pitfalls.
"""
import os
import re
from datetime import datetime

BASE = "/home/nuh_tapinar/tmp-build/project-clean"
DATE = "2026-06-27"

# Define all 30 new posts with metadata
POSTS = [
    ("exportar-paquistao-oportunidades", "Exportar para o Paquistão: Oportunidades e Parcerias Comerciais para o Brasil",
     "Guia completo para exportar para o Paquistão: relação bilateral, setores promissores, acordos comerciais, documentação, logística portuária de Karachi e estratégias de entrada no mercado paquistanês.",
     15, ["Exportação", "Paquistão", "Ásia", "Mercados Emergentes", "Comércio Exterior"]),
    
    ("exportar-bangladesh-texteis", "Exportar para Bangladesh: Têxteis, Parcerias e Oportunidades para o Brasil",
     "Guia completo para exportar para Bangladesh: setor têxtil, parcerias Brasil-Bangladesh, acordos comerciais, documentação, logística portuária de Chittagong e estratégias de exportação.",
     16, ["Exportação", "Bangladesh", "Têxteis", "Ásia", "Mercados Emergentes", "Comércio Exterior"]),
    
    ("exportar-vietna-competitividade", "Exportar para o Vietnã: Guia de Acesso ao Mercado e Competitividade",
     "Guia completo para exportar para o Vietnã: panorama econômico, relação bilateral com o Brasil, setores com potencial exportador, acordos comerciais e logística portuária.",
     14, ["Exportação", "Vietnã", "Ásia", "Mercados Emergentes", "Competitividade", "Comércio Exterior"]),
    
    ("exportar-turquia-hub-logistico", "Exportar para a Turquia: Hub Logístico Eurasiano e Oportunidades Comerciais",
     "Guia completo para exportar para a Turquia: relação comercial Brasil-Turquia, setores promissores, acordos, logística portuária de Istambul, documentação e certificações.",
     15, ["Exportação", "Turquia", "Hub Logístico", "Oriente Médio", "Comércio Exterior"]),
    
    ("importar-coreia-sul-eletronicos", "Importar da Coreia do Sul: Eletrônicos, Autopeças e Oportunidades Comerciais",
     "Guia completo para importar da Coreia do Sul: semicondutores, eletrônicos, autopeças, acordos bilaterais, classificação NCM, tributos e logística portuária de Busan e Incheon.",
     16, ["Importação", "Coreia do Sul", "Eletrônicos", "Autopeças", "Ásia", "Comércio Exterior"]),
    
    ("importar-taiwan-semicondutores", "Importar de Taiwan: Semicondutores, Máquinas Industriais e Estratégias",
     "Guia completo para importar de Taiwan: semicondutores, máquinas, componentes eletrônicos, classificação tarifária, tributos, logística portuária de Kaohsiung e due diligence.",
     16, ["Importação", "Taiwan", "Semicondutores", "Máquinas", "Eletrônicos", "Ásia", "Comércio Exterior"]),
    
    ("exportar-mexico-tlc-oportunidades", "Exportar para o México: Acordos Comerciais e Oportunidades para o Brasil",
     "Guia completo para exportar para o México: ACE 55, setores promissores, documentação, logística portuária de Veracruz e Manzanillo, certificações NOM e estratégias comerciais.",
     15, ["Exportação", "México", "Acordos Comerciais", "ACE 55", "América Latina", "Comércio Exterior"]),
    
    ("exportar-chile-portas-america-latina", "Exportar para o Chile: Guia Completo de Comércio e Oportunidades",
     "Guia completo para exportar para o Chile: ACE 35, hub logístico para Ásia-Pacífico, setores promissores, documentação, certificações e portos de Valparaíso e San Antonio.",
     15, ["Exportação", "Chile", "América Latina", "ACE 35", "Logística", "Comércio Exterior"]),
    
    ("exportar-colombia-mercado-andino", "Exportar para a Colômbia: Guia do Mercado Andino em Expansão",
     "Guia completo para exportar para a Colômbia: CAN e acordos, setores, documentação, logística portuária de Cartagena e Buenaventura, certificações e estratégias de acesso.",
     15, ["Exportação", "Colômbia", "Mercado Andino", "América Latina", "Logística", "Comércio Exterior"]),
    
    ("exportar-peru-comercio-logistica", "Exportar para o Peru: Comércio e Logística na Costa do Pacífico",
     "Guia completo para exportar para o Peru: ACE 58, setores promissores, documentação, logística portuária de Callao e Paita, certificações sanitárias e estratégias de acesso.",
     14, ["Exportação", "Peru", "América Latina", "Logística", "ACE 58", "Comércio Exterior"]),
    
    ("importar-india-farmaceuticos-texteis", "Importar da Índia: Farmacêuticos, Têxteis e Produtos Químicos",
     "Guia completo para importar da Índia: medicamentos, insumos farmacêuticos, têxteis, classificação NCM, tributos, registro ANVISA e logística portuária de Mumbai e Nhava Sheva.",
     16, ["Importação", "Índia", "Farmacêuticos", "Têxteis", "Químicos", "Ásia", "Comércio Exterior"]),
    
    ("exportar-indonesia-sudeste-asiatico", "Exportar para a Indonésia: Guia da Maior Economia do Sudeste Asiático",
     "Guia completo para exportar para a Indonésia: relação Brasil-Indonésia, setores promissores, acordo ASEAN, documentação, logística portuária e certificações SNI.",
     14, ["Exportação", "Indonésia", "Sudeste Asiático", "ASEAN", "Mercados Emergentes", "Comércio Exterior"]),
    
    ("transporte-ferroviario-comex-brasil", "Transporte Ferroviário no Comércio Exterior Brasileiro: Guia Completo",
     "Guia completo sobre transporte ferroviário no comércio exterior: principais ferrovias, concessões, corredores de exportação, integração com portos, vantagens e desafios logísticos.",
     15, ["Logística", "Transporte Ferroviário", "Ferrovias", "Infraestrutura", "Comércio Exterior"]),
    
    ("armazenagem-alfandegada-tipos", "Armazenagem Alfandegada no Brasil: Tipos, Regimes e Vantagens",
     "Guia completo sobre armazenagem alfandegada: tipos de recintos, regimes especiais, EADI, portos secos e benefícios para importadores e exportadores brasileiros.",
     15, ["Armazenagem", "Logística", "Alfândega", "EADI", "Portos Secos", "Comércio Exterior"]),
    
    ("logistica-reversa-comercio-internacional", "Logística Reversa no Comércio Internacional: Guia Prático",
     "Guia completo sobre logística reversa no comércio internacional: devoluções, recall, reparos, regimes aduaneiros para retorno de mercadorias e custos logísticos.",
     16, ["Logística Reversa", "Logística", "Comércio Internacional", "Devoluções", "Regimes Aduaneiros", "Comércio Exterior"]),
    
    ("transporte-multimodal-brasil-eficiencia", "Transporte Multimodal no Brasil: Eficiência Logística no Comércio Exterior",
     "Guia completo sobre transporte multimodal no Brasil: conceitos, OTM, vantagens, documentação, seguros e casos práticos de integração modal para exportação e importação.",
     16, ["Transporte Multimodal", "Logística", "OTM", "Infraestrutura", "Eficiência", "Comércio Exterior"]),
    
    ("porto-santos-guia-operacoes", "Porto de Santos: Guia Completo de Operações e Logística Portuária",
     "Guia completo sobre o Porto de Santos: terminais, operadores, mercadorias, acesso rodoviário e ferroviário, agendamento, taxas portuárias e dicas para importadores e exportadores.",
     15, ["Porto de Santos", "Logística Portuária", "Portos", "Infraestrutura", "Exportação", "Importação", "Comércio Exterior"]),
    
    ("zpe-brasil-vantagens-processo", "ZPE (Zonas de Processamento de Exportação) no Brasil: Vantagens e Processo",
     "Guia completo sobre Zonas de Processamento de Exportação no Brasil: incentivos fiscais, regimes aduaneiros especiais, implantação, ZPEs existentes e como instalar sua empresa.",
     14, ["ZPE", "Zonas de Processamento de Exportação", "Incentivos Fiscais", "Exportação", "Regimes Aduaneiros", "Comércio Exterior"]),
    
    ("admissao-temporaria-brasil", "Regime de Admissão Temporária no Brasil: Guia Completo",
     "Guia completo sobre Admissão Temporária no Brasil: modalidades, procedimentos, garantias, documentação, tributos suspensos, prazos e aplicações para importadores.",
     14, ["Admissão Temporária", "Regimes Aduaneiros", "Importação", "Tributação", "SISCOMEX", "Comércio Exterior"]),
    
    ("recof-sped-desenvolvimento", "RECOF-SPED: Regime Especial de Drawback Simplificado",
     "Guia completo sobre RECOF-SPED: benefícios, habilitação, obrigações acessórias, integração SPED, controle de estoque e vantagens para exportadores brasileiros.",
     14, ["RECOF", "SPED", "Drawback", "Regimes Aduaneiros", "Exportação", "SISCOMEX", "Comércio Exterior"]),
    
    ("extarifario-bens-capital-informatica", "Ex-Tarifário: Redução do Imposto de Importação para Bens de Capital e Informática",
     "Guia completo sobre Ex-Tarifário: redução do II para bens de capital e informática, processo de aprovação, documentação, prazos e estratégias de redução de custos.",
     15, ["Ex-Tarifário", "Redução de Imposto", "Bens de Capital", "Informática", "Importação", "Tributação", "Comércio Exterior"]),
    
    ("regime-tributacao-simplificada", "Regime de Tributação Simplificada (RTS) na Importação: Guia Prático",
     "Guia completo sobre o Regime de Tributação Simplificada na importação: modalidades, limite de valor, alíquotas, procedimentos no SISCOMEX e vantagens para PMEs importadoras.",
     13, ["RTS", "Tributação Simplificada", "Importação", "PME", "SISCOMEX", "Despacho Aduaneiro", "Comércio Exterior"]),
    
    ("pis-cofins-importacao-recolhimento", "PIS e COFINS na Importação: Guia de Cálculo e Recolhimento",
     "Guia completo sobre PIS-Importação e COFINS-Importação: bases de cálculo, alíquotas, regimes cumulativo e não cumulativo, créditos e obrigações acessórias.",
     15, ["PIS", "COFINS", "Importação", "Tributação", "Cálculo Tributário", "Obrigações Acessórias", "Comércio Exterior"]),
    
    ("transito-aduaneiro-modal-rodoviario", "Trânsito Aduaneiro: Modal Rodoviário, Documentação e Procedimentos",
     "Guia completo sobre trânsito aduaneiro rodoviário: DTA, documentos, garantias, prazos, responsabilidades e procedimentos para movimentação de cargas sob controle aduaneiro.",
     14, ["Trânsito Aduaneiro", "DTA", "Transporte Rodoviário", "Carga", "Aduana", "SISCOMEX", "Comércio Exterior"]),
    
    ("oea-operador-economico-autorizado", "OEA (Operador Econômico Autorizado): Vantagens e Etapas da Certificação",
     "Guia completo sobre o programa OEA no Brasil: modalidades, benefícios, processo de certificação, documentação, prazos e requisitos de manutenção.",
     13, ["OEA", "Operador Econômico Autorizado", "Certificação", "Aduana", "Segurança", "Comércio Exterior"]),
    
    ("licencas-importacao-tipos", "Licenças de Importação (LI): Tipos, Procedimentos e Documentação",
     "Guia completo sobre Licenças de Importação no Brasil: LI automática e não automática, órgãos anuentes, SISCOMEX, documentos e prazos de validade.",
     14, ["Licença de Importação", "LI", "SISCOMEX", "Anuentes", "Importação", "Documentação", "Comércio Exterior"]),
    
    ("barreiras-tecnicas-comercio-exterior-guia", "Barreiras Técnicas ao Comércio Exterior: Guia Completo para Exportadores",
     "Guia completo sobre barreiras técnicas ao comércio exterior: TBT da OMC, regulamentações, certificações compulsórias, ensaios e estratégias de conformidade para exportadores.",
     15, ["Barreiras Técnicas", "TBT", "OMC", "Certificações", "Regulamentação", "Exportação", "Comércio Exterior"]),
    
    ("direito-aduaneiro-infracoes", "Infrações Aduaneiras: Penalidades, Defesa e Prevenção",
     "Guia completo sobre infrações aduaneiras no Brasil: tipos de penalidades, multas, perdimento, processo administrativo fiscal, defesa e estratégias de prevenção.",
     14, ["Direito Aduaneiro", "Infrações", "Penalidades", "Multas", "Perdimento", "Defesa", "Comércio Exterior"]),
    
    ("propriedade-intelectual-patentes-marcas-comex", "Propriedade Intelectual no Comércio Exterior: Patentes, Marcas e Indicações Geográficas",
     "Guia completo sobre propriedade intelectual no comércio exterior: patentes, marcas, indicações geográficas, registro no INPI e estratégias para exportadores brasileiros.",
     15, ["Propriedade Intelectual", "Patentes", "Marcas", "INPI", "Indicações Geográficas", "Exportação", "Comércio Exterior"]),
    
    ("protecionismo-comercial-tarifas", "Protecionismo Comercial: Tarifas, Cotas, Subsídios e Estratégias de Navegação",
     "Guia completo sobre protecionismo comercial: tarifas, cotas, subsídios, barreiras não tarifárias, antidumping e estratégias para exportadores brasileiros no comércio internacional.",
     15, ["Protecionismo", "Tarifas", "Cotas", "Subsídios", "Antidumping", "OMC", "Exportação", "Comércio Exterior"]),
]


def build_meta_entry(slug, title, excerpt, read_time, tags):
    tags_str = ", ".join(f'"{t}"' for t in tags)
    return f'  {{ slug: "{slug}", title: "{title}", excerpt: "{excerpt}", date: "{DATE}", readTime: {read_time}, tags: [{tags_str}] }},'


def build_map_entry(slug):
    return f'  "{slug}": () => import("./content/{slug}"),'


def build_prerender_entry(slug, name, desc):
    return f'  {{ slug: "{slug}", name: "{name}", desc: "{desc}" }},'


def insert_before_marker(lines, marker, search_from_end=True):
    """Find the last occurrence of marker and return its index."""
    if search_from_end:
        for i in range(len(lines) - 1, -1, -1):
            if lines[i].strip() == marker:
                return i
    else:
        for i in range(len(lines) - 1, -1, -1):
            if lines[i].strip() == marker:
                return i
    # fallback: linear scan
    for i, line in enumerate(lines):
        if line.strip() == marker:
            return i
    raise ValueError(f"Marker '{marker}' not found in file")


# 1. INTEGRATE postMeta.ts
print("=" * 60)
print("1. Integrating postMeta.ts...")
meta_path = os.path.join(BASE, "src/data/blog/postMeta.ts")
with open(meta_path) as f:
    meta_lines = f.readlines()

pos = insert_before_marker(meta_lines, "];")
meta_entries = []
for p in POSTS:
    meta_entries.append(build_meta_entry(p[0], p[1], p[2], p[3], p[4]))

for i, entry in enumerate(meta_entries):
    meta_lines.insert(pos + i, entry + "\n")

with open(meta_path, "w") as f:
    f.writelines(meta_lines)

meta_count = sum(1 for l in meta_lines if 'slug: "' in l and 'slug: string' not in l)
print(f"  ✅ postMeta.ts: {meta_count} entries")


# 2. INTEGRATE postContentMap.ts
print("2. Integrating postContentMap.ts...")
map_path = os.path.join(BASE, "src/data/blog/postContentMap.ts")
with open(map_path) as f:
    map_lines = f.readlines()

# Find the }; that closes the map by checking for getPostContent nearby
close_map = None
for i in range(len(map_lines) - 1, -1, -1):
    if map_lines[i].strip() == "};":
        for j in range(i + 1, min(i + 4, len(map_lines))):
            if "export async function getPostContent" in "".join(map_lines[j:j+3]):
                close_map = i
                break
        if close_map is not None:
            break

if close_map is None:
    print("  ❌ Could not find map closing };")
    exit(1)

map_entries = []
for p in POSTS:
    map_entries.append(build_map_entry(p[0]))

for i, entry in enumerate(map_entries):
    map_lines.insert(close_map + i, entry + "\n")

with open(map_path, "w") as f:
    f.writelines(map_lines)

map_count = sum(1 for l in map_lines if "() => import" in l)
print(f"  ✅ postContentMap.ts: {map_count} entries (getPostContent: {'✅' if any('getPostContent' in l for l in map_lines) else '❌'})")


# 3. INTEGRATE prerender.mjs
print("3. Integrating scripts/prerender.mjs...")
pre_path = os.path.join(BASE, "scripts/prerender.mjs")
with open(pre_path) as f:
    pre_lines = f.readlines()

# Find last ]; in file (which is BLOG_POSTS closing)
blog_end = None
for i in range(len(pre_lines) - 1, -1, -1):
    if pre_lines[i].strip() == "];":
        blog_end = i
        break

if blog_end is None:
    print("  ❌ Could not find BLOG_POSTS closing ]];")
    exit(1)

prerender_entries = []
for p in POSTS:
    prerender_entries.append(build_prerender_entry(p[0], p[1], p[2]))

for i, entry in enumerate(prerender_entries):
    pre_lines.insert(blog_end + i, entry + "\n")

with open(pre_path, "w") as f:
    f.writelines(pre_lines)

pre_count = sum(1 for l in pre_lines if 'slug: "' in l and "name:" in l)
print(f"  ✅ prerender.mjs: BLOG_POSTS entries now at ~{pre_count}")


# 4. VERIFICATION
print("\n" + "=" * 60)
print("4. VERIFICATION")
print("=" * 60)

# Count all
from pathlib import Path
content_dir = Path(BASE) / "src/data/blog/content"
content_files = list(content_dir.glob("*.ts"))
print(f"\n  content/ files: {len(content_files)}")

meta_slugs = set()
for l in open(meta_path):
    m = re.search(r'slug: "([^"]+)"', l)
    if m and 'slug: string' not in l:
        meta_slugs.add(m.group(1))
print(f"  postMeta slugs: {len(meta_slugs)}")

map_slugs = set()
for l in open(map_path):
    m = re.search(r'"([^"]+)": \(\) => import', l)
    if m:
        map_slugs.add(m.group(1))
print(f"  contentMap slugs: {len(map_slugs)}")

print(f"\n  postMeta == contentMap: {'✅' if meta_slugs == map_slugs else '❌ MISMATCH'}")
print(f"  contentFiles == postMeta: {'✅' if len(content_files) >= len(meta_slugs) else '❌'} ")
print(f"  No duplicates in meta: {'✅' if len(meta_slugs) == len(open(meta_path).readlines()) else '⚠️'}")
# Check for duplicates
meta_list = []
for l in open(meta_path):
    m = re.search(r'slug: "([^"]+)"', l)
    if m and 'slug: string' not in l:
        meta_list.append(m.group(1))
from collections import Counter
dupes = {k: v for k, v in Counter(meta_list).items() if v > 1}
if dupes:
    print(f"  ❌ DUPLICATE slugs: {dupes}")
else:
    print(f"  ✅ No duplicate slugs in postMeta")

# Check all new slugs are in all 3 places
print(f"\n  Checking 30 new slugs across all files...")
all_ok = True
for p in POSTS:
    slug = p[0]
    in_meta = slug in meta_slugs
    in_map = slug in map_slugs
    in_content = (content_dir / f"{slug}.ts").exists()
    ok = in_meta and in_map and in_content
    if not ok:
        print(f"  ❌ {slug}: meta={'✅' if in_meta else '❌'} map={'✅' if in_map else '❌'} content={'✅' if in_content else '❌'}")
        all_ok = False

if all_ok:
    print(f"  ✅ All 30 new slugs present in postMeta, contentMap, and content/")
else:
    print(f"  ⚠️ Some slugs missing — investigate above")

print("\n" + "=" * 60)
print("INTEGRATION COMPLETE")
print("=" * 60)
