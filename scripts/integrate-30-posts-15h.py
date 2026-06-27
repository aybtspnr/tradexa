"""
Integration script for 30 new blog posts (June 27 15:00 batch).
Inserts entries into postMeta.ts, postContentMap.ts, and scripts/prerender.mjs
Uses line-based insertion to avoid common pitfalls.
"""
import os
import re
from datetime import datetime
from pathlib import Path
from collections import Counter

BASE = "/home/nuh_tapinar/tmp-build/project-clean"
DATE = "2026-06-27"

# Define all 30 new posts with metadata
POSTS = [
    # Cluster 1: Câmbio e Finanças Internacionais (6)
    ("mercado-cambio-brasil-operacoes", "Mercado de Câmbio no Brasil: Tipos de Operações e Contratos Cambiais",
     "Guia completo sobre o mercado de câmbio brasileiro: operações de câmbio manual, pronto e futuro, contratos cambiais, CACE, PCC e regras do Banco Central para importadores e exportadores.",
     16, ["Câmbio", "Mercado de Câmbio", "Banco Central", "Contratos Cambiais", "Finanças Internacionais", "Importação", "Exportação"]),

    ("hedge-cambial-protecao-importadores", "Hedge Cambial: Como se Proteger da Oscilação do Dólar nas Operações de Comex",
     "Estratégias de hedge cambial para importadores e exportadores: NDF, swap cambial, contrato futuro, operações de dólar via B3 e proteção natural contra oscilação cambial no comércio exterior.",
     17, ["Câmbio", "Hedge Cambial", "Derivativos", "Proteção Cambial", "Finanças", "Importação", "Exportação"]),

    ("cace-exportacao-registro-cambio", "CACE: Certificado de Câmbio para Exportação — Guia Completo",
     "Guia completo sobre o CACE: o que é, quando emitir, prazos, contratos de câmbio vinculados, regras do Banco Central e procedimentos no Siscomex para exportadores brasileiros.",
     15, ["Câmbio", "CACE", "Exportação", "Banco Central", "Contrato de Câmbio", "Siscomex"]),

    ("performance-bond-garantia-contratual", "Performance Bond e Garantias Contratuais Internacionais: Guia para Exportadores",
     "Guia completo sobre performance bond, bid bond e advance payment bond: tipos de garantias contratuais exigidas em licitações e contratos internacionais, como emitir e custos.",
     15, ["Garantias", "Performance Bond", "Bid Bond", "Contratos Internacionais", "Exportação", "Licitações"]),

    ("contrato-cambio-futuro-protecao", "Contrato de Câmbio Futuro: Proteção Cambial para Importadores e Exportadores",
     "Guia completo sobre contrato de câmbio futuro: como funciona a proteção cambial, operações de hedge na B3, contratos de dólar futuro, diferenças do NDF e estratégias práticas para empresas.",
     17, ["Câmbio", "Contrato Futuro", "Derivativos", "Hedge Cambial", "B3", "Importação", "Exportação"]),

    ("carta-credito-standby-garantia", "Carta de Crédito Standby (SBLC): Garantia Financeira Internacional",
     "Guia sobre Standby Letter of Credit (SBLC): o que é, diferenças da carta de crédito documentária, usos como garantia, custos, emissão bancária e aplicações no comércio exterior brasileiro.",
     16, ["Carta de Crédito", "SBLC", "Standby", "Garantias", "Trade Finance", "Banco", "Importação", "Exportação"]),

    # Cluster 2: Inovação e Tecnologia Logística (6)
    ("inteligencia-artificial-classificacao-aduaneira", "Inteligência Artificial na Classificação Aduaneira e NCM: O Futuro do Comex",
     "Como a inteligência artificial está transformando a classificação fiscal de produtos: sistemas de IA para NCM, machine learning na aduana, redução de erros e automação no comércio exterior.",
     15, ["Inteligência Artificial", "NCM", "Classificação Fiscal", "Tecnologia", "Aduana", "Inovação", "Comex"]),

    ("blockchain-trade-finance-comex", "Blockchain no Trade Finance: Revolução dos Documentos Digitais no Comércio Exterior",
     "Como a blockchain está revolucionando o trade finance: carta de crédito digital, smart contracts, tokenização de documentos, rastreabilidade e redução de fraudes no comércio exterior.",
     16, ["Blockchain", "Trade Finance", "Tecnologia", "Documentos Digitais", "Smart Contracts", "Inovação", "Comex"]),

    ("iot-monitoramento-carga-internacional", "IoT no Monitoramento de Carga Internacional: Visibilidade em Tempo Real",
     "Como a Internet das Coisas (IoT) transforma o monitoramento de cargas internacionais: sensores inteligentes, rastreamento em tempo real, cadeia de frio e segurança na logística.",
     15, ["IoT", "Monitoramento", "Logística", "Tecnologia", "Rastreamento", "Cadeia de Frio", "Inovação"]),

    ("logistica-4-0-brasil-transformacao", "Logística 4.0 no Brasil: Transformação Digital nas Operações de Comércio Exterior",
     "Guia completo sobre Logística 4.0 no Brasil: tecnologias como IA, IoT, big data, automação portuária, WMS inteligente, digitalização de processos aduaneiros e cases de transformação digital.",
     16, ["Logística 4.0", "Transformação Digital", "Tecnologia", "Automação", "Portos", "Armazenagem", "Inovação"]),

    ("robotica-armazem-logistica-internacional", "Robótica em Armazéns: Automação Logística Internacional no Brasil",
     "Guia sobre robótica em armazéns e centros de distribuição: AGVs, AS/RS, picking automatizado, WMS integrado, redução de custos operacionais e eficiência na logística internacional.",
     15, ["Robótica", "Armazenagem", "Automação", "Logística", "WMS", "Centro de Distribuição", "Inovação"]),

    ("drone-carga-logistica-entrega", "Drones para Carga e Logística: O Futuro do Transporte Internacional",
     "Como drones e veículos aéreos não tripulados estão revolucionando a logística de carga: entregas de última milha, transporte de suprimentos, regulação ANAC, desafios e perspectivas.",
     13, ["Drones", "Logística", "Transporte Aéreo", "Tecnologia", "ANAC", "Inovação", "Carga"]),

    # Cluster 3: Regimes Aduaneiros Avançados (6)
    ("repetro-regime-especial-petroleo-gas", "REPETRO: Regime Especial para a Indústria de Petróleo e Gás no Comex",
     "Guia completo sobre o REPETRO: regime aduaneiro especial para petróleo e gás, suspensão de tributos na importação de bens, benefícios, REPETRO-SPED e Industrialização e como aderir.",
     16, ["REPETRO", "Petróleo e Gás", "Regimes Aduaneiros", "Tributação", "Importação", "Receita Federal", "ANP"]),

    ("ex-tarifario-bens-informatica-telecom", "Ex-tarifário de Bens de Informática e Telecomunicações (BIT): Guia Completo",
     "Guia completo sobre o Ex-tarifário para Bens de Informática e Telecomunicações (BIT): redução de alíquotas do IPI, produtos contemplados, processo de aprovação na CAMEX e benefícios.",
     15, ["Ex-tarifário", "BIT", "Informática", "Telecomunicações", "IPI", "CAMEX", "Importação", "Incentivos Fiscais"]),

    ("ex-tarifario-bens-de-capital-bk", "Ex-tarifário de Bens de Capital (BK): Redução de Custos na Importação de Máquinas",
     "Guia sobre o Ex-tarifário de Bens de Capital (BK): redução do Imposto de Importação para máquinas e equipamentos sem similar nacional, processo na CAMEX e benefícios para indústria.",
     15, ["Ex-tarifário", "BK", "Bens de Capital", "Máquinas", "Importação", "CAMEX", "Indústria", "Incentivos Fiscais"]),

    ("porto-seco-estacao-aduaneira-interior", "Porto Seco (EADI): Estação Aduaneira do Interior — Guia Prático",
     "Guia completo sobre Porto Seco (EADI): o que é, como funciona, vantagens do desembaraço no interior, tipos de recintos alfandegados, serviços, custos e como escolher a melhor opção.",
     14, ["Porto Seco", "EADI", "Recinto Alfandegado", "Desembaraço Aduaneiro", "Logística", "Armazenagem", "Comex"]),

    ("licenciamento-ambiental-importacao", "Licenciamento Ambiental na Importação: Regras do IBAMA para Produtos Importados",
     "Guia completo sobre licenciamento ambiental na importação: produtos controlados pelo IBAMA, CTF, DOF, SISCOMEX, produtos florestais, químicos controlados e pneus usados.",
     14, ["Licenciamento Ambiental", "IBAMA", "Importação", "Regulamentação", "Sustentabilidade", "Compliance", "Produtos Controlados"]),

    ("reciclagem-exportacao-materiais", "Reciclagem e Exportação de Materiais Recicláveis: Regras e Mercados Internacionais",
     "Guia completo sobre exportação de materiais recicláveis: regras do IBAMA, licenciamento ambiental, classificação NCM de resíduos, principais mercados compradores e logística internacional.",
     14, ["Reciclagem", "Exportação", "Sustentabilidade", "IBAMA", "Resíduos", "Materiais Recicláveis", "Economia Circular"]),

    # Cluster 4: Geopolítica e Acordos Comerciais (6)
    ("brics-novos-membros-oportunidades", "BRICS+: Novos Membros e Oportunidades para o Comércio Exterior Brasileiro",
     "Análise da expansão do BRICS com novos membros: impactos no comércio exterior brasileiro, oportunidades comerciais, acordos em moedas locais e novos mercados para exportadores.",
     15, ["BRICS", "Geopolítica", "Comércio Exterior", "Brasil", "Mercados Emergentes", "Acordos Comerciais", "Exportação"]),

    ("desdolarizacao-comercio-brics", "Desdolarização no Comércio Exterior: Moedas Locais nos BRICS e o Futuro das Transações",
     "Análise da desdolarização no comércio exterior: uso de moedas locais entre BRICS, yuan e real em transações, mecanismos de compensação cambial e impactos para exportadores brasileiros.",
     16, ["Desdolarização", "Moedas Locais", "BRICS", "Câmbio", "Comércio Exterior", "Yuan", "Finanças Internacionais"]),

    ("acordos-comerciais-nova-geracao", "Acordos Comerciais de Nova Geração: OMC Plus, Sustentabilidade e Comércio Digital",
     "Guia sobre acordos comerciais de nova geração: OMC Plus, capítulos de sustentabilidade, comércio digital, barreiras não tarifárias e regras de origem modernizadas para exportadores brasileiros.",
     15, ["Acordos Comerciais", "OMC", "Sustentabilidade", "Comércio Digital", "Barreiras Não Tarifárias", "Exportação", "Regras de Origem"]),

    ("mercosul-ue-acordo-desafios", "Acordo Mercosul-UE: Desafios e Oportunidades na Reta Final",
     "Análise completa do acordo Mercosul-União Europeia: status atual, capítulos de sustentabilidade, compras governamentais, regras de origem, cronograma tarifário e impactos setoriais no Brasil.",
     16, ["Mercosul", "União Europeia", "Acordo Comercial", "Exportação", "Importação", "Sustentabilidade", "Comércio Exterior"]),

    ("exportar-bahrein-portal-golfo", "Exportar para o Bahrein: Centro Financeiro e Portal Comercial do Golfo Arábico",
     "Guia para exportar para o Bahrein: economia diversificada, centro financeiro do Golfo, setores promissores, certificações, logística e acordos comerciais com o Brasil.",
     14, ["Bahrein", "Exportação", "Oriente Médio", "Golfo Arábico", "Comércio Exterior", "Oportunidades", "Logística"]),

    ("compras-governamentais-internacionais", "Compras Governamentais Internacionais: Como Exportar para Órgãos Públicos no Exterior",
     "Guia completo sobre compras governamentais internacionais: licitações públicas, Acordo de Compras Governamentais da OMC, Government Procurement Agreement e como participar como fornecedor brasileiro.",
     15, ["Compras Governamentais", "Licitações", "GPA", "OMC", "Exportação", "Contratos Públicos", "Mercados Internacionais"]),

    # Cluster 5: Contratos, Seguros e Propriedade Intelectual (6)
    ("garantias-contratuais-bid-bond", "Garantias Contratuais na Exportação: Bid Bond e Advance Payment Bond",
     "Guia completo sobre garantias contratuais na exportação: Bid Bond, Performance Bond, Advance Payment Bond, Retention Bond, como emitir via bancos e seguradoras, custos e documentos exigidos.",
     15, ["Garantias", "Bid Bond", "Advance Payment Bond", "Performance Bond", "Contratos", "Exportação", "Seguros"]),

    ("seguro-transporte-internacional-carga", "Seguro Internacional de Transporte de Cargas: Coberturas e Riscos",
     "Guia completo sobre seguro internacional de cargas: coberturas básicas e adicionais, riscos cobertos e excluídos, contratação, custos, regulação SUSEP e Instituto de Cláusulas de Carga.",
     15, ["Seguro", "Transporte de Carga", "Logística", "Riscos", "Coberturas", "Importação", "Exportação"]),

    ("arbitragem-internacional-contratos-comex", "Arbitragem Internacional em Contratos de Comércio Exterior: Guia Prático",
     "Guia completo sobre arbitragem internacional no comércio exterior: cláusulas compromissórias, câmaras arbitrais (CCI, CAM-CCBC), lei aplicável, execução de sentenças e vantagens sobre o judiciário.",
     15, ["Arbitragem", "Contratos Internacionais", "Solução de Disputas", "CCI", "Comércio Exterior", "Legal", "Exportação", "Importação"]),

    ("patentes-importacao-protecao-intelectual", "Patentes na Importação: Proteção Intelectual e Barreiras Aduaneiras",
     "Guia sobre propriedade intelectual na importação: patentes, marcas, direitos autorais, medidas de fronteira, INPI, retenção pela Receita Federal e procedimentos legais na importação.",
     15, ["Patentes", "Propriedade Intelectual", "Importação", "INPI", "Barreiras", "Aduana", "Marcas", "Compliance"]),

    ("propriedade-intelectual-comex-marcas", "Propriedade Intelectual no Comércio Exterior: Registro de Marcas e Proteção Aduaneira",
     "Guia completo sobre propriedade intelectual no comércio exterior: registro internacional de marcas (Protocolo de Madri), patentes, indicações geográficas e medidas de fronteira.",
     15, ["Propriedade Intelectual", "Marcas", "Patentes", "Registro de Marcas", "Aduana", "Exportação", "Importação", "INPI"]),

    ("logistica-reversa-internacional-importacao", "Logística Reversa Internacional: Devolução e Retorno de Mercadorias na Importação",
     "Guia completo sobre logística reversa internacional: devolução de mercadorias importadas, reexportação, procedimentos aduaneiros para retorno, drawback e custos envolvidos.",
     14, ["Logística Reversa", "Devolução", "Reexportação", "Drawback", "Importação", "Logística", "Comex"]),
]


def build_meta_entry(slug, title, excerpt, read_time, tags):
    tags_str = ", ".join(f'"{t}"' for t in tags)
    return f'  {{ slug: "{slug}", title: "{title}", excerpt: "{excerpt}", date: "{DATE}", readTime: {read_time}, tags: [{tags_str}] }},'


def build_map_entry(slug):
    return f'  "{slug}": () => import("./content/{slug}"),'


def build_prerender_entry(slug, name, desc):
    return f'  {{ slug: "{slug}", name: "{name}", desc: "{desc}" }},'


def insert_before_marker(lines, marker, search_from_end=True):
    if search_from_end:
        for i in range(len(lines) - 1, -1, -1):
            if lines[i].strip() == marker:
                return i
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

blog_end = None
for i in range(len(pre_lines) - 1, -1, -1):
    if pre_lines[i].strip() == "];":
        blog_end = i
        break

if blog_end is None:
    print("  ❌ Could not find BLOG_POSTS closing ];")
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

# Check for duplicates
meta_list = []
for l in open(meta_path):
    m = re.search(r'slug: "([^"]+)"', l)
    if m and 'slug: string' not in l:
        meta_list.append(m.group(1))
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
