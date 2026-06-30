#!/usr/bin/env python3
"""Integrate 30 new TRADEXA blog posts (June 30 2026). Line-based insertion, zero duplicates."""

import os, re

BASE = "/home/nuh_tapinar/tmp-build/project-clean"
DATE = "2026-06-30"

# Slug → (title, excerpt, [tags], word_count)
POSTS = [
    ("exportacao-refrigerantes-brasil-mercados-oportunidades", "Exportação de Refrigerantes e Bebidas Não Alcoólicas Brasileiras: Mercados e Oportunidades", "Guia completo sobre exportação de refrigerantes brasileiros: guaraná, água de coco, isotônicos, NCM 2202, registro MAPA/ANVISA, logística e mercados internacionais (América Latina, EUA, Europa, África) para bebidas não alcoólicas.", ["Exportação", "Bebidas", "Refrigerantes", "ANVISA", "Mercados Internacionais", "Comércio Exterior"]),
    ("exportacao-biscoitos-massas-panificacao-brasil", "Exportação de Biscoitos, Massas Alimentícias e Produtos de Panificação", "Guia completo sobre exportação de biscoitos, massas e panificação brasileiros: cream crackers, macarrão, pães, NCM 1905/1902, certificações ANVISA/MAPA, shelf life, logística e mercados globais.", ["Exportação", "Alimentos", "Biscoitos", "Massas", "Panificação", "ANVISA", "Comércio Exterior"]),
    ("exportacao-chocolates-confeitaria-brasil-mercados", "Exportação de Chocolates, Balas e Produtos de Confeitaria Brasileiros", "Guia completo sobre exportação de chocolates e confeitaria brasileiros: Garoto, Nestlé, Lacta, Dori, NCM 1806/1704, certificações Kosher/Halal, logística refrigerada e mercados globais para doces brasileiros.", ["Exportação", "Chocolates", "Confeitaria", "Alimentos", "ANVISA", "Mercados Internacionais", "Comércio Exterior"]),
    ("exportacao-conservas-compotas-geleias-brasil", "Exportação de Conservas, Compotas e Geleias Brasileiras", "Guia completo sobre exportação de conservas, compotas e geleias brasileiras: palmito, milho, ervilha, doces em pasta, NCM 2001/2005/2007/2008, certificações BRC/IFS/FSSC 22000, MAPA e mercados globais.", ["Exportação", "Conservas", "Alimentos Processados", "MAPA", "Certificações", "Mercados Internacionais", "Comércio Exterior"]),
    ("exportacao-hortalicas-processadas-brasil", "Exportação de Hortaliças Processadas e Minimamente Processadas do Brasil", "Guia completo sobre exportação de hortaliças processadas brasileiras: congeladas, desidratadas, enlatadas, NCM 0710/0712/2002-2005, MAPA, GlobalGAP/BRC/IFS, logística de cold chain e mercados internacionais.", ["Exportação", "Hortaliças", "Alimentos Processados", "Agronegócio", "MAPA", "Logística", "Comércio Exterior"]),
    ("exportacao-oleos-essenciais-aromaticos-brasil", "Exportação de Óleos Essenciais e Produtos Aromáticos Brasileiros", "Guia completo sobre exportação de óleos essenciais brasileiros: laranja, citronela, pau-rosa, copaíba, andiroba, NCM 3301/3302, ANVISA/ANP, IFRA, certificações orgânicas e mercados globais (EUA, França, Alemanha, Suíça, Japão).", ["Exportação", "Óleos Essenciais", "Aromáticos", "Cosméticos", "ANVISA", "Certificações", "Comércio Exterior"]),
    ("exportacao-tintas-vernizes-esmaltes-brasil", "Exportação de Tintas, Vernizes e Esmaltes: Como o Brasil Pode Conquistar o Mercado Global", "Guia completo sobre exportação de tintas, vernizes e esmaltes brasileiros: Suvinil, Coral, Sherwin-Williams, Renner, NCM 3208/3209/3210/3214, INMETRO, VOC regulations, logística de perigosos e mercados globais.", ["Exportação", "Tintas", "Química", "INMETRO", "Vernizes", "Regulamentação", "Comércio Exterior"]),
    ("exportacao-saboes-sabonetes-higiene-brasil", "Exportação de Sabões, Sabonetes e Produtos de Higiene Pessoal do Brasil", "Guia completo sobre exportação de sabões, sabonetes e produtos de higiene brasileiros: Natura, Granado, Phebo, NCM 3401/3305/3306/3307, ANVISA, GMP, INMETRO e mercados globais (América Latina, África, Portugal, EUA).", ["Exportação", "Higiene", "Cosméticos", "ANVISA", "Sabonetes", "Sabões", "Comércio Exterior"]),
    ("exportacao-sal-marinho-industrial-brasil", "Exportação de Sal Marinho e Sal Industrial Brasileiro: Mercados e Logística", "Guia completo sobre exportação de sal marinho e industrial brasileiro: produção solar no RN, sal-gema, NCM 2501, usos industriais (cloro-soda, alimentício, ração), logística granel/ensacado e concorrência global com Chile, México e Austrália.", ["Exportação", "Sal", "Mineração", "Logística", "Rio Grande do Norte", "Mercados", "Comércio Exterior"]),
    ("exportacao-areia-industrial-caulim-argilas", "Exportação de Areia Industrial, Caulim e Argilas Especiais Brasileiras", "Guia completo sobre exportação de minerais industriais brasileiros: areia silicosa, caulim da Amazônia, bentonita, ball clay, talco, feldspato, NCM 2505/2507/2508, logística e mercados globais.", ["Exportação", "Minerais Industriais", "Caulim", "Areia", "Argilas", "Mineração", "Comércio Exterior"]),
    ("exportacao-gesso-drywall-prefabricados-brasil", "Exportação de Gipsita, Gesso e Pré-fabricados para Construção Civil", "Guia completo sobre exportação de gipsita e gesso brasileiros: reservas de Araripina/PE, drywall Knauf/Saint-Gobain, NCM 2520/6808/6809, logística e mercados globais para prefabricados de gesso.", ["Exportação", "Gesso", "Drywall", "Construção Civil", "Mineração", "Materiais de Construção", "Comércio Exterior"]),
    ("exportacao-telhas-tijolos-ceramica-vermelha", "Exportação de Telhas, Tijolos e Cerâmica Vermelha Brasileira", "Guia completo sobre exportação de cerâmica vermelha brasileira: telhas, tijolos, blocos cerâmicos de Santa Gertrudes/SP, Criciúma/SC, NCM 6901-6905, certificações ABNT/INMETRO e mercados globais.", ["Exportação", "Cerâmica", "Telhas", "Tijolos", "Construção Civil", "Materiais de Construção", "Comércio Exterior"]),
    ("exportacao-sementes-mudas-propagacao-brasil", "Exportação de Sementes, Mudas e Material de Propagação Vegetal do Brasil", "Guia completo sobre exportação de sementes e mudas brasileiras: soja, milho, algodão, hortaliças, NCM 1209/0602, MAPA/Renasem, certificação ISTA, fitossanitário, cultivares protegidas e mercados globais.", ["Exportação", "Sementes", "Mudas", "Agronegócio", "MAPA", "Fitossanitário", "Comércio Exterior"]),
    ("exportacao-flores-ornamentais-tropicais-brasil", "Exportação de Flores Tropicais e Plantas Ornamentais Brasileiras", "Guia completo sobre exportação de flores tropicais e plantas ornamentais brasileiras: helicônias, antúrios, orquídeas, Veiling Holambra, NCM 0602/0603/0604, MAPA, CITES, logística aérea refrigerada e mercados globais (EUA, Holanda, Alemanha, Japão, Reino Unido).", ["Exportação", "Flores", "Plantas Ornamentais", "Agronegócio", "MAPA", "Logística", "Comércio Exterior"]),
    ("exportacao-ovos-avicultura-postura-brasil", "Exportação de Ovos e Produtos Avícolas de Postura do Brasil", "Guia completo sobre exportação de ovos brasileiros: ovos in natura, processados, incubáveis, NCM 0407/0408, MAPA/SIF, áreas livres de Newcastle e IA, logística refrigerada e mercados (Oriente Médio, Japão, África, América Latina, Europa).", ["Exportação", "Ovos", "Avicultura", "Agronegócio", "MAPA", "Logística", "Comércio Exterior"]),
    ("exportacao-caprinos-ovinos-carne-leite-brasil", "Exportação de Caprinos e Ovinos: Carne, Leite e Derivados", "Guia completo sobre exportação de caprinos e ovinos brasileiros: carne, leite, queijos coalho, peles, lã, NCM 0204/0406/4105/4106/5101, MAPA/SIF, certificação halal e mercados (Oriente Médio, África, Caribe, Europa, EUA).", ["Exportação", "Caprinos", "Ovinos", "Agronegócio", "Carne", "Leite", "Comércio Exterior"]),
    ("exportacao-calcario-brita-agregados-construcao", "Exportação de Calcário, Brita e Agregados para Construção Civil no Mercado Global", "Guia completo sobre exportação de agregados para construção brasileiros: calcário, brita, pedra britada, NCM 2515/2516/2517, logística marítima granel (Panamax/Supramax), portos (Santos, Vitória, RJ) e concorrência global com Noruega, Canadá e México.", ["Exportação", "Calcário", "Brita", "Agregados", "Construção Civil", "Mineração", "Comércio Exterior"]),
    ("exportacao-fibras-txteis-naturais-brasil", "Exportação de Fibras Têxteis Naturais Brasileiras (exceto Algodão)", "Guia completo sobre exportação de fibras têxteis naturais brasileiras: sisal (PB), juta, malva, rami, curauá, piassava, seda, lã, NCM 5303/5304/5001/5101/5302, certificações OEKO-TEX/GOTS e mercados globais.", ["Exportação", "Fibras Têxteis", "Sisal", "Juta", "Têxtil", "Sustentabilidade", "Comércio Exterior"]),
    ("exportacao-couros-peles-industrializados-brasil", "Exportação de Couros e Peles Industrializados do Brasil", "Guia completo sobre exportação de couros industrializados brasileiros: wet blue, crust, acabado, couros exóticos (jacaré, avestruz, cobra), NCM 4104/4105/4106/4107/4113, LWG Gold/Silver, REACH e mercados globais (Itália, China, EUA, Vietnã, Alemanha).", ["Exportação", "Couros", "Peles", "Industrialização", "LWG", "Sustentabilidade", "Comércio Exterior"]),
    ("exportacao-algodao-colorido-organico-brasil", "Exportação de Algodão Colorido e Orgânico do Brasil: Inovação no Agronegócio", "Guia completo sobre exportação de algodão colorido e orgânico brasileiro: BRS Rubi/Safira/Jade da Embrapa, Natural Cotton Color, orgânico da Bahia/MT, NCM 5201, certificações GOTS/OCS/Fair Trade e moda sustentável global.", ["Exportação", "Algodão Colorido", "Algodão Orgânico", "Agronegócio", "Sustentabilidade", "Moda", "Comércio Exterior"]),
    ("exportacao-drones-vants-brasil-mercados", "Exportação de Drones e VANTS Brasileiros: Mercados e Regulamentação", "Guia completo sobre exportação de drones brasileiros: Xmobots, SkyDrones, ARPAC, NCM 8806/852580, ANAC RBAC-E 94, ANATEL, DECEA, controle de exportação PROTEGER e mercados (América Latina, África, EUA, Europa, Oriente Médio).", ["Exportação", "Drones", "VANTs", "Tecnologia", "ANAC", "Regulamentação", "Comércio Exterior"]),
    ("exportacao-robos-industriais-automacao-brasil", "Exportação de Robôs Industriais e Sistemas de Automação do Brasil", "Guia completo sobre exportação de robôs industriais brasileiros: Atech, Intelbrás, Gestum, Smar, NCM 847950/847989/848340/853710, Indústria 4.0, Lei do Bem, mercados (América Latina, EUA, Europa, África) e logística de máquinas pesadas.", ["Exportação", "Robôs", "Automação", "Indústria 4.0", "Tecnologia", "Inovação", "Comércio Exterior"]),
    ("exportacao-impressoras-3d-manufatura-aditiva-brasil", "Exportação de Impressoras 3D e Equipamentos de Manufatura Aditiva do Brasil", "Guia completo sobre exportação de impressoras 3D brasileiras: Moura 3D, GTMax, Klin, Print3D, NCM 847759/847780/848640, FDM/SLA/DLS/SLS/metálica, ISO/ASTM 52900 e mercados (América Latina, EUA, Europa, África).", ["Exportação", "Impressão 3D", "Manufatura Aditiva", "Tecnologia", "Inovação", "Indústria 4.0", "Comércio Exterior"]),
    ("exportacao-realidade-virtual-aumentada-brasil", "Exportação de Soluções de Realidade Virtual e Aumentada do Brasil", "Guia completo sobre exportação de soluções VR/AR brasileiras: Tátil Design, ARVORE, iSimulate, NCM 8528/847141/950450, aplicações industriais (óleo e gás, mineração, aviação, saúde) e mercados (EUA, América Latina, Europa, Oriente Médio).", ["Exportação", "Realidade Virtual", "Realidade Aumentada", "Tecnologia", "Inovação", "Software", "Comércio Exterior"]),
    ("exportacao-software-saas-cloud-brasil", "Exportação de Software, SaaS e Cloud Computing do Brasil: Guia Completo", "Guia completo sobre exportação de software brasileiro: Totvs, VTEX, RD Station, LogComex, NCM 8523/847141, Siscoserv, LGPD, Lei do Bem, modelos SaaS/licenciamento, Stripe/Pagar.me, mercados (América Latina, EUA, Europa, África, Ásia) e localização.", ["Exportação", "Software", "SaaS", "Cloud Computing", "Tecnologia", "Siscoserv", "Comércio Exterior"]),
    ("exportacao-equipamentos-hospitalares-alta-tecnologia", "Exportação de Equipamentos Médico-Hospitalares de Alta Tecnologia do Brasil", "Guia completo sobre exportação de equipamentos médico-hospitalares brasileiros: Drager, GE, Philips, VMI, DIXTAL, NCM 9018/9019/9020/9021/9022, ANVISA RDC 16/2013, ISO 13485, FDA, CE, GMP e mercados globais.", ["Exportação", "Equipamentos Hospitalares", "Saúde", "ANVISA", "ISO 13485", "Tecnologia Médica", "Comércio Exterior"]),
    ("exportacao-equipamentos-energia-renovavel-brasil", "Exportação de Equipamentos para Energia Renovável: Oportunidades para o Brasil", "Guia completo sobre exportação de equipamentos de energia renovável brasileiros: painéis solares BYD/WEG, turbinas eólicas, inversores, NCM 841011/850231/854140/854143, INMETRO/IEC 61215 e mercados (América Latina, África, EUA, Europa, Austrália).", ["Exportação", "Energia Renovável", "Solar", "Eólica", "Equipamentos", "Sustentabilidade", "Comércio Exterior"]),
    ("exportacao-embalagens-plasticas-industriais-brasil", "Exportação de Embalagens Plásticas e Industriais do Brasil", "Guia completo sobre exportação de embalagens plásticas brasileiras: filmes flexíveis, garrafas, bombonas, big bags, NCM 3920/3921/3923/6305, ANVISA contato com alimentos, ISO 22000/BRC Packaging, sustentabilidade PCR e mercados (América Latina, EUA, Europa, África).", ["Exportação", "Embalagens", "Plásticos", "Indústria", "Sustentabilidade", "Reciclagem", "Comércio Exterior"]),
    ("exportacao-cerveja-industrial-brasil-mercados", "Exportação de Cerveja Brasileira em Escala Industrial: Mercados Globais", "Guia completo sobre exportação de cerveja industrial brasileira: AmBev (Brahma, Skol, Antarctica), Heineken Brasil, Petrópolis (Itaipava), NCM 220300, MAPA, logística refrigerada, shelf life e mercados globais (América Latina, África, EUA, Europa, Portugal).", ["Exportação", "Cerveja", "Bebidas", "MAPA", "Logística", "AmBev", "Comércio Exterior"]),
    ("exportacao-vinhos-brasileiros-premium-mercados", "Exportação de Vinhos Brasileiros Premium: Mercados, Regiões e Certificações", "Guia completo sobre exportação de vinhos premium brasileiros: Miolo, Aurora, Salton, Casa Valduga, Cave Geisse, Vale dos Vinhedos DO, NCM 2204, MAPA, certificações sustentáveis e mercados globais (EUA, Reino Unido, Alemanha, Japão).", ["Exportação", "Vinhos", "Bebidas", "Vale dos Vinhedos", "MAPA", "Premium", "Comércio Exterior"]),
]

def calc_read_time(words):
    return max(1, round(words / 200))

def insert_before_marker(lines, marker, start_from_end=True):
    if start_from_end:
        for i in range(len(lines) - 1, -1, -1):
            if lines[i].strip() == marker:
                return i
    else:
        for i in range(len(lines)):
            if lines[i].strip() == marker:
                return i
    raise ValueError(f"Marker '{marker}' not found")

def fix_missing_comma(lines, close_idx):
    entry = lines[close_idx - 1].rstrip("\n")
    if entry.endswith("}") and not entry.endswith("},"):
        lines[close_idx - 1] = entry + ",\n"
        print(f"️  Fixed missing comma on last entry at line {close_idx}")
    return lines

# Get word counts from content files
word_counts = {}
for slug, _, _, _ in POSTS:
    path = os.path.join(BASE, f"src/data/blog/content/{slug}.ts")
    if os.path.exists(path):
        with open(path) as f:
            word_counts[slug] = len(f.read().split())
    else:
        print(f"⚠ WARNING: Content file for {slug} not found!")
        word_counts[slug] = 2000  # fallback

# ═══ 1. postMeta.ts ═══
print("=== 1. postMeta.ts ===")
meta_path = os.path.join(BASE, "src/data/blog/postMeta.ts")
with open(meta_path) as f:
    meta_lines = f.readlines()
pos = insert_before_marker(meta_lines, "];")
meta_lines = fix_missing_comma(meta_lines, pos)
meta_entries = []
for slug, title, excerpt, tags in POSTS:
    rt = calc_read_time(word_counts.get(slug, 2500))
    tags_str = ", ".join(f'"{t}"' for t in tags)
    entry = f'  {{ slug: "{slug}", title: "{title}", excerpt: "{excerpt}", date: "{DATE}", readTime: {rt}, tags: [{tags_str}] }}'
    meta_entries.append(entry)
for j, entry in enumerate(meta_entries):
    meta_lines.insert(pos + j, entry + ",\n")
with open(meta_path, "w") as f:
    f.writelines(meta_lines)
meta_count = sum(1 for l in meta_lines if 'slug:' in l)
print(f"  postMeta now has {meta_count} slug entries")

# ═══ 2. postContentMap.ts ═══
print("=== 2. postContentMap.ts ===")
map_path = os.path.join(BASE, "src/data/blog/postContentMap.ts")
with open(map_path) as f:
    map_lines = f.readlines()
close_map = None
for i in range(len(map_lines) - 1, -1, -1):
    if map_lines[i].strip() == "};":
        for j in range(i + 1, min(i + 4, len(map_lines))):
            if "export async function getPostContent" in map_lines[j]:
                close_map = i
                break
        if close_map is not None:
            break
if close_map is None:
    print("ERROR: Could not find contentMap closing }; with getPostContent proximity")
    exit(1)
map_lines = fix_missing_comma(map_lines, close_map)
for slug, _, _, _ in POSTS:
    map_lines.insert(close_map, f'  "{slug}": () => import("./content/{slug}"),\n')
    close_map += 1
with open(map_path, "w") as f:
    f.writelines(map_lines)
# Clean trailing backslash artifacts
map_content = open(map_path).read()
if ', \\\\\n' in map_content:
    map_content = map_content.replace(', \\\\\n', ',\n')
    open(map_path, 'w').write(map_content)
    print("  Cleaned trailing backslashes")
map_count = sum(1 for l in open(map_path) if '=> import' in l)
print(f"  contentMap now has {map_count} map entries")
gp = sum(1 for l in open(map_path) if 'getPostContent' in l)
print(f"  getPostContent references: {gp}")

# ═══ 3. prerender.mjs BLOG_POSTS ═══
print("=== 3. prerender.mjs ===")
pre_path = os.path.join(BASE, "scripts/prerender.mjs")
with open(pre_path) as f:
    pre_lines = f.readlines()
pre_end = None
for i in range(len(pre_lines) - 1, -1, -1):
    if pre_lines[i].strip() == "];":
        pre_end = i
        break
if pre_end is None:
    print("ERROR: Could not find '];' in prerender.mjs")
    exit(1)
pre_lines = fix_missing_comma(pre_lines, pre_end)
pre_entries = []
for slug, title, excerpt, _ in POSTS:
    name = title if len(title) <= 70 else title[:67] + "..."
    pre_entries.append(f'  {{ slug: "{slug}", name: "{name}", desc: "{excerpt[:155]}" }}')
for j, entry in enumerate(pre_entries):
    pre_lines.insert(pre_end + j, entry + ",\n")
with open(pre_path, "w") as f:
    f.writelines(pre_lines)
pre_count = sum(1 for line in open(pre_path) if 'slug:' in line and 'BLOG_POSTS' not in line)
print(f"  prerender BLOG_POSTS updated. Total slug lines: {pre_count}")

print(f"\n=== Integration Complete ===")
print(f"  Content files: {len(os.listdir(os.path.join(BASE, 'src/data/blog/content')))}")
print(f"  postMeta: {sum(1 for l in open(meta_path) if 'slug:' in l)}")
print(f"  contentMap entries: {sum(1 for l in open(map_path) if '=> import' in l)}")
print(f"  getPostContent preserved: {sum(1 for l in open(map_path) if 'getPostContent' in l)}")
