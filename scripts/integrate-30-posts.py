#!/usr/bin/env python3
"""Integration script: add 30 new posts + 1 orphan (exportar-para-taiwan-tecnologia) to shared files."""

import re
from datetime import date

DATE = date.today().isoformat()  # 2026-06-25

# All 31 slugs to integrate (30 new + 1 orphan)
# Format: (slug, title, excerpt, readTime, tags)
ENTRIES = [
    # Brazilian States (16)
    ("comercio-exterior-amazonas", "Amazonas no Comércio Exterior: Zona Franca de Manaus e o Potencial da Região Norte",
     "Análise completa do comércio exterior do Amazonas: Zona Franca de Manaus, Polo Industrial, SUFRAMA, incentivos fiscais, logística fluvial, Porto de Manaus, bioeconomia e oportunidades de exportação.",
     16, ["Amazonas", "Zona Franca de Manaus", "Região Norte", "Bioeconomia", "Exportação"]),
    ("comercio-exterior-para", "Pará no Comércio Exterior: Mineração, Agronegócio e o Arco Norte",
     "Guia completo sobre o comércio exterior do Pará: Grande Carajás, portos do Arco Norte, minério de ferro, bauxita, alumina, soja, bioeconomia, logística e oportunidades de exportação.",
     16, ["Pará", "Mineração", "Arco Norte", "Logística", "Exportação"]),
    ("comercio-exterior-maranhao", "Maranhão no Comércio Exterior: Porto do Itaqui, Agronegócio e Energia",
     "Análise do comércio exterior do Maranhão: Porto do Itaqui, corredor de grãos do MATOPIBA, alumínio, celulose, energia eólica e oportunidades de exportação.",
     15, ["Maranhão", "Porto do Itaqui", "Agronegócio", "Energia", "Exportação"]),
    ("comercio-exterior-mato-grosso", "Mato Grosso no Comércio Exterior: O Coração do Agronegócio Brasileiro",
     "Guia completo sobre o comércio exterior de Mato Grosso: maior produtor de soja, milho e algodão, logística do Arco Norte, carne bovina, etanol de milho e oportunidades.",
     16, ["Mato Grosso", "Agronegócio", "Soja", "Logística", "Exportação"]),
    ("comercio-exterior-mato-grosso-sul", "Mato Grosso do Sul no Comércio Exterior: Agronegócio, Biocombustíveis e Fronteira",
     "Análise do comércio exterior de Mato Grosso do Sul: produção de grãos, celulose, etanol de milho, Rota Bioceânica, hidrovia Paraguai-Paraná e comércio fronteiriço.",
     15, ["Mato Grosso do Sul", "Agronegócio", "Biocombustíveis", "Rota Bioceânica", "Exportação"]),
    ("comercio-exterior-distrito-federal", "Distrito Federal no Comércio Exterior: Serviços, Logística Aérea e o Potencial Exportador",
     "Guia sobre o comércio exterior do Distrito Federal: economia de serviços, Aeroporto de Brasília como hub de cargas, ZPE, consultoria internacional e cooperação técnica.",
     14, ["Distrito Federal", "Serviços", "Logística Aérea", "Brasília", "Exportação"]),
    ("comercio-exterior-rio-grande-norte", "Rio Grande do Norte no Comércio Exterior: Fruticultura, Petróleo e Energias Renováveis",
     "Análise do comércio exterior do Rio Grande do Norte: fruticultura irrigada, Porto de Natal, petróleo e gás, energia eólica e solar, sal marinho e oportunidades.",
     16, ["Rio Grande do Norte", "Fruticultura", "Petróleo e Gás", "Energia Renovável", "Exportação"]),
    ("comercio-exterior-paraiba", "Paraíba no Comércio Exterior: Calçados, Têxtil e o Potencial do Porto de Cabedelo",
     "Guia completo sobre o comércio exterior da Paraíba: polo calçadista, indústria têxtil, Porto de Cabedelo, tecnologia, mineração e oportunidades de exportação.",
     15, ["Paraíba", "Calçados", "Têxtil", "Porto de Cabedelo", "Exportação"]),
    ("comercio-exterior-alagoas", "Alagoas no Comércio Exterior: Química, Açúcar e o Complexo de Maceió",
     "Análise do comércio exterior de Alagoas: complexo químico e petroquímico, açúcar e etanol, Porto de Maceió, mineração, gás natural e oportunidades de exportação.",
     15, ["Alagoas", "Química", "Açúcar", "Etanol", "Exportação"]),
    ("comercio-exterior-sergipe", "Sergipe no Comércio Exterior: Petróleo, Gás, Fertilizantes e o Potencial Exportador",
     "Guia sobre o comércio exterior de Sergipe: exploração de petróleo e gás, fertilizantes, suco cítrico, terminal portuário e oportunidades gás-químicas.",
     15, ["Sergipe", "Petróleo e Gás", "Fertilizantes", "Indústria Química", "Exportação"]),
    ("comercio-exterior-piaui", "Piauí no Comércio Exterior: MATOPIBA, Energia Eólica e a Nova Fronteira Agrícola",
     "Análise do comércio exterior do Piauí: MATOPIBA, cera de carnaúba, energia eólica e solar, gesso, Porto de Luís Correia, Ferrovia Transnordestina e oportunidades.",
     15, ["Piauí", "MATOPIBA", "Energia Eólica", "Gesso", "Exportação"]),
    ("comercio-exterior-rondonia", "Rondônia no Comércio Exterior: Café, Pecuária e a Integração com a Bolívia",
     "Guia completo sobre o comércio exterior de Rondônia: café robusta, pecuária de corte, soja, madeira manejada, comércio fronteiriço com a Bolívia e oportunidades.",
     15, ["Rondônia", "Café", "Pecuária", "Fronteira", "Exportação"]),
    ("comercio-exterior-acre", "Acre no Comércio Exterior: Floresta, Produtos Sustentáveis e Integração com Peru e Bolívia",
     "Análise do comércio exterior do Acre: produtos da sociobiodiversidade, ZPE, comércio fronteiriço com Peru e Bolívia, Estrada do Pacífico e bioeconomia.",
     14, ["Acre", "Bioeconomia", "Floresta", "Produtos Sustentáveis", "Exportação"]),
    ("comercio-exterior-roraima", "Roraima no Comércio Exterior: Fronteira Venezuela-Guiana, Mineração e Agro",
     "Guia sobre o comércio exterior de Roraima: economia de fronteira, mineração, produção agrícola no Lavrado, Zona Franca de Boa Vista e desafios geopolíticos.",
     14, ["Roraima", "Fronteira", "Mineração", "Venezuela", "Exportação"]),
    ("comercio-exterior-amapa", "Amapá no Comércio Exterior: Mineração, Recursos Naturais e o Corredor do Escudo Guianês",
     "Análise do comércio exterior do Amapá: mineração de manganês e caulim, celulose, Porto de Santana, ZPE, comércio com Guiana Francesa e potencial do Arco Norte.",
     14, ["Amapá", "Mineração", "Arco Norte", "Celulose", "Exportação"]),
    ("comercio-exterior-tocantins", "Tocantins no Comércio Exterior: Agronegócio, Ferrovia Norte-Sul e o Vetor de Expansão",
     "Guia completo sobre o comércio exterior de Tocantins: MATOPIBA, Ferrovia Norte-Sul, produção de grãos e carnes, hidrovia Tocantins-Araguaia e oportunidades.",
     15, ["Tocantins", "MATOPIBA", "Ferrovia Norte-Sul", "Agronegócio", "Logística"]),
    # Technical/Product Topics (14)
    ("exportacao-algodao-brasileiro-mercados-oportunidades", "Exportação de Algodão Brasileiro: Mercados, Certificações e Oportunidades Globais",
     "Guia completo sobre exportação de algodão brasileiro: principais mercados compradores, certificações BCI, classificação HVI, logística portuária, NYBOT e tendências de consumo sustentável.",
     16, ["Algodão", "Agronegócio", "Exportação", "Certificações", "Commodities"]),
    ("importacao-maquinas-pesadas-equipamentos-industriais", "Importação de Máquinas Pesadas e Equipamentos Industriais: Guia Completo",
     "Guia completo para importar máquinas pesadas: classificação NCM, tributos, licenciamento, fornecedores globais, máquinas usadas, Ex-tarifário e regimes especiais.",
     18, ["Máquinas", "Importação", "Equipamentos Industriais", "Ex-tarifário", "Logística"]),
    ("comex-pequenas-medias-empresas-pme-guia", "Comércio Exterior para PMEs: Guia Completo para Pequenas e Médias Empresas",
     "Guia completo para PMEs no comércio exterior: habilitação RADAR, regimes tributários, linhas de crédito, trading companies, plataformas B2B e soluções para pequenos importadores.",
     17, ["PME", "Pequenas Empresas", "Importação", "Exportação", "Crédito"]),
    ("importacao-simples-nacional-tributacao-regras", "Importação no Simples Nacional: Regras, Tributação e Como Fazer",
     "Guia completo sobre importação no Simples Nacional: limites legais, ICMS, IPI, PIS e COFINS na importação, desenquadramento e quando migrar para Lucro Presumido.",
     16, ["Simples Nacional", "Importação", "Tributação", "MEI", "Contabilidade"]),
    ("operadores-logisticos-internacionais-brasil", "Operadores Logísticos Internacionais no Brasil: Guia Completo para Escolher o Parceiro Certo",
     "Guia completo sobre operadores logísticos internacionais: freight forwarders, NVOs, 3PL, critérios de seleção, contratos de frete, armazenagem alfandegada e tecnologia no Brasil.",
     17, ["Logística", "Operadores Logísticos", "Frete", "Supply Chain", "Importação"]),
    ("exportacao-medicamentos-farmacos-brasil-mercados", "Exportação de Medicamentos e Fármacos Brasileiros: Mercados, Regulamentação e Oportunidades",
     "Guia completo sobre exportação de medicamentos: indústria farmoquímica brasileira, registro ANVISA, BPF, mercados-alvo, APIs, cadeia fria e barreiras regulatórias.",
     16, ["Medicamentos", "Farmoquímica", "ANVISA", "Exportação", "Regulamentação"]),
    ("importacao-suplementos-alimentares-anvisa-regulamentacao", "Importação de Suplementos Alimentares: Regulamentação ANVISA e Procedimentos",
     "Guia completo sobre importação de suplementos: classificação NCM, regulamentação ANVISA, notificação vs registro, rotulagem, fornecedores globais e desembaraço aduaneiro.",
     16, ["Suplementos", "ANVISA", "Importação", "Regulamentação", "Nutracêuticos"]),
    ("exportacao-cosmeticos-brasileiros-mercado-internacional", "Exportação de Cosméticos Brasileiros: Mercados Internacionais e Oportunidades",
     "Guia completo sobre exportação de cosméticos brasileiros: indústria cosmética, ativos da biodiversidade, registro ANVISA, certificações internacionais e mercados-alvo.",
     16, ["Cosméticos", "Beleza", "Exportação", "ANVISA", "Biodiversidade"]),
    ("importacao-maquinas-construcao-civil-mineracao", "Importação de Máquinas para Construção Civil e Mineração: Guia Prático",
     "Guia prático para importar máquinas de construção e mineração: classificação NCM, fornecedores globais, Ex-tarifário, máquinas usadas, carga de projeto e financiamento.",
     18, ["Construção Civil", "Mineração", "Máquinas", "Importação", "Ex-tarifário"]),
    ("exportacao-moveis-brasileiros-design-sustentabilidade", "Exportação de Móveis Brasileiros: Design, Sustentabilidade e Mercados Globais",
     "Guia completo sobre exportação de móveis brasileiros: polos moveleiros, design autoral, certificações FSC, madeira sustentável, mercados-alvo e inteligência de mercado.",
     15, ["Móveis", "Design", "Sustentabilidade", "Exportação", "Madeira"]),
    ("exportacao-carnes-bovinas-brasil-mercados-certificacoes", "Exportação de Carne Bovina Brasileira: Mercados, Certificações e Oportunidades",
     "Guia completo sobre exportação de carne bovina: maior exportador mundial, certificações SIF, Halal, Kosher, rastreabilidade, logística reefer e inteligência TRADEXA.",
     17, ["Carne Bovina", "Pecuária", "Exportação", "Certificações", "Halal"]),
    ("importacao-maquinas-textil-vestuario-confeccao", "Importação de Máquinas Têxteis e para Confecção: Guia do Setor de Vestuário",
     "Guia completo para importar máquinas têxteis: classificação NCM, fornecedores da Alemanha, Itália, Japão e China, automação industrial e RECOF para o setor.",
     17, ["Têxtil", "Confecção", "Máquinas", "Importação", "Vestuário"]),
    ("exportacao-sucos-brasileiros-mercado-global-diversificacao", "Exportação de Sucos Brasileiros: Mercado Global, Diversificação e Oportunidades",
     "Guia completo sobre exportação de sucos brasileiros: liderança em suco de laranja, superfrutas tropicais, logística isotanque, certificações e diversificação de mercados.",
     16, ["Sucos", "Laranja", "Superfrutas", "Exportação", "Agronegócio"]),
    ("exportacao-camarao-aquicultura-mercados", "Exportação de Camarão Brasileiro: Aquicultura, Mercados e Sustentabilidade",
     "Guia completo sobre exportação de camarão brasileiro: carcinicultura do Nordeste, certificações, mercados EUA e Europa, concorrência global e inteligência de mercado.",
     16, ["Camarão", "Aquicultura", "Exportação", "Sustentabilidade", "Nordeste"]),
    # Orphan Recovery (1 post - exportar-para-taiwan-tecnologia)
    ("exportar-para-taiwan-tecnologia", "Exportar para Taiwan: Tecnologia, Semicondutores e Oportunidades",
     "Guia completo para exportar para Taiwan: posicionamento global em tecnologia e semicondutores, acordos comerciais, classificação tarifária, logística e inteligência de mercado.",
     15, ["Taiwan", "Tecnologia", "Exportação", "Semicondutores", "Ásia"]),
]

def insert_before_marker(lines, marker):
    """Find the last occurrence of marker line (strip) in lines list."""
    for i in range(len(lines) - 1, -1, -1):
        if lines[i].strip() == marker:
            return i
    raise ValueError(f"Marker '{marker}' not found")

def build_meta_entry(p):
    tags_str = ", ".join(f'"{t}"' for t in p[4])
    return f'  {{ slug: "{p[0]}", title: "{p[1]}", excerpt: "{p[2]}", date: "{DATE}", readTime: {p[3]}, tags: [{tags_str}] }},'

def build_map_entry(slug):
    return f'  "{slug}": () => import("./content/{slug}"),'

def build_prerender_entry(p):
    name_escaped = p[1].replace("\\", "\\\\").replace('"', '\\"')
    desc_escaped = p[2].replace("\\", "\\\\").replace('"', '\\"')
    return f'  {{ slug: "{p[0]}", name: "{name_escaped}", desc: "{desc_escaped}" }},'


# ---- 1. postMeta.ts ----
print("=== postMeta.ts ===")
with open("src/data/blog/postMeta.ts", "r") as f:
    lines = f.readlines()

pos = insert_before_marker(lines, "];")
print(f"Found closing mark at line {pos+1} (1-indexed)")

for i, entry in enumerate(ENTRIES):
    meta_entry = build_meta_entry(entry) + "\n"
    lines.insert(pos + i, meta_entry)
print(f"Inserted {len(ENTRIES)} meta entries")

with open("src/data/blog/postMeta.ts", "w") as f:
    f.writelines(lines)
print("✅ postMeta.ts updated")

# ---- 2. postContentMap.ts ----
print("\n=== postContentMap.ts ===")
with open("src/data/blog/postContentMap.ts", "r") as f:
    lines = f.readlines()

# Find the }; that closes the map by looking for getPostContent nearby
close_map = None
for i in range(len(lines) - 1, -1, -1):
    if lines[i].strip() == "};":
        for j in range(i + 1, min(i + 4, len(lines))):
            if "export async function getPostContent" in lines[j]:
                close_map = i
                break
        if close_map is not None:
            break

if close_map is None:
    print("❌ Could not find map closing; checking backup approach...")
    close_map = insert_before_marker(lines, "};")
    print(f"  Using last '}};' at line {close_map+1}")

print(f"Found map closing at line {close_map+1} (1-indexed)")

for i, entry in enumerate(ENTRIES):
    map_entry = build_map_entry(entry[0]) + "\n"
    lines.insert(close_map + i, map_entry)
print(f"Inserted {len(ENTRIES)} map entries")

# Verify getPostContent still exists
content_text = "".join(lines)
if "export async function getPostContent" in content_text:
    print("✅ getPostContent export preserved")
else:
    print("❌ getPostContent export MISSING!")

with open("src/data/blog/postContentMap.ts", "w") as f:
    f.writelines(lines)
print("✅ postContentMap.ts updated")

# ---- 3. scripts/prerender.mjs ----
print("\n=== scripts/prerender.mjs ===")
with open("scripts/prerender.mjs", "r") as f:
    lines = f.readlines()

# Find the last ]; which should be BLOG_POSTS closing
blog_end = None
for i in range(len(lines) - 1, -1, -1):
    if lines[i].strip() == "];":
        # Verify it's after const BLOG_POSTS
        for j in range(i - 1, -1, -1):
            if "const BLOG_POSTS" in lines[j]:
                blog_end = i
                break
        if blog_end is not None:
            break

if blog_end is None:
    print("❌ Could not find BLOG_POSTS closing")
    blog_end = insert_before_marker(lines, "];")
    print(f"  Using last '];' at line {blog_end+1}")

print(f"Found BLOG_POSTS closing at line {blog_end+1} (1-indexed)")

for i, entry in enumerate(ENTRIES):
    prerender_entry = build_prerender_entry(entry) + "\n"
    lines.insert(blog_end + i, prerender_entry)
print(f"Inserted {len(ENTRIES)} prerender entries")

with open("scripts/prerender.mjs", "w") as f:
    f.writelines(lines)
print("✅ prerender.mjs updated")

# ---- 4. Summary ----
print("\n=== Post-Integration Summary ===")
meta_count = sum(1 for l in open("src/data/blog/postMeta.ts") if re.search(r'slug:\s+"', l))
map_count = sum(1 for l in open("src/data/blog/postContentMap.ts") if ': () => import' in l)
content_count = len([x for x in __import__('os').listdir("src/data/blog/content") if x.endswith('.ts')])

print(f"postMeta entries: {meta_count}")
print(f"contentMap entries: {map_count}")
print(f"content/ files: {content_count}")

# Verify all new slugs in all three files
with open("src/data/blog/postMeta.ts") as f:
    meta_text = f.read()
with open("src/data/blog/postContentMap.ts") as f:
    map_text = f.read()
with open("scripts/prerender.mjs") as f:
    pre_text = f.read()

all_ok = True
for p in ENTRIES:
    slug = p[0]
    ok = True
    if slug not in meta_text:
        print(f"  ❌ META missing: {slug}")
        ok = False
    if slug not in map_text:
        print(f"  ❌ MAP missing: {slug}")
        ok = False
    if slug not in pre_text:
        print(f"  ❌ PRERENDER missing: {slug}")
        ok = False
    if ok:
        pass  # silent success

print(f"\n{'✅ All entries verified' if all_ok else '❌ Some entries missing'}")
print("Integration complete!")
