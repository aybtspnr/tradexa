#!/usr/bin/env python3
"""
Integration script for 30 new TRADEXA blog posts.
Inserts entries into postMeta.ts, postContentMap.ts, and prerender.mjs.
"""
import re

DATE = "2026-06-25"

# Each entry: (slug, title, excerpt, readTime, [tags])
NEW_POSTS = [
    # Country guides - Africa & Americas
    ("exportar-para-nicaragua-comercio", "Exportar para a Nicarágua: Agricultura, Têxteis e Oportunidades", "Guia completo para exportar para a Nicarágua: café, carne bovina, ouro, zona franca têxtil, logística na América Central e acordos comerciais para exportadores brasileiros.", 22, ["Exportação", "Nicarágua", "América Central", "Agricultura", "Têxteis"]),
    ("exportar-para-belize-oportunidades", "Exportar para Belize: Turismo, Pesca e Oportunidades no Caribe", "Guia completo para exportar para Belize: turismo, pesca, agricultura, logística no Caribe, acordos comerciais e oportunidades para exportadores brasileiros.", 21, ["Exportação", "Belize", "Caribe", "Turismo", "Pesca"]),
    ("exportar-para-guiana-francesa", "Exportar para a Guiana Francesa: Hub Europeu na América do Sul", "Guia completo para exportar para a Guiana Francesa: território francês na América do Sul, hub espacial, oportunidades em construção civil, alimentos e logística.", 12, ["Exportação", "Guiana Francesa", "América do Sul", "Europa", "Logística"]),
    ("exportar-para-timor-leste", "Exportar para Timor-Leste: Petróleo, Café e Oportunidades", "Guia completo para exportar para Timor-Leste: economia baseada em petróleo, café orgânico, reconstrução, logística no Sudeste Asiático e acordos comerciais.", 14, ["Exportação", "Timor-Leste", "Sudeste Asiático", "Petróleo", "Café"]),
    ("exportar-para-sudao-sul", "Exportar para o Sudão do Sul: Petróleo, Reconstrução e Oportunidades", "Guia completo para exportar para o Sudão do Sul: economia baseada em petróleo, oportunidades em reconstrução, infraestrutura, agricultura, logística e acordos comerciais.", 14, ["Exportação", "Sudão do Sul", "África", "Petróleo", "Reconstrução"]),
    ("exportar-para-republica-centro-africana", "Exportar para a República Centro-Africana: Desafios e Potencial", "Guia completo para exportar para a República Centro-Africana: economia, mineração, agricultura, oportunidades em reconstrução, logística e acordos comerciais.", 17, ["Exportação", "República Centro-Africana", "África", "Mineração", "Agricultura"]),
    ("exportar-para-burundi", "Exportar para o Burundi: Café, Agricultura e Oportunidades", "Guia completo para exportar para o Burundi: café arábica, agricultura familiar, mineração, oportunidades de comércio, logística na África Oriental e acordos comerciais.", 20, ["Exportação", "Burundi", "África", "Café", "Agricultura"]),
    ("exportar-para-lesoto", "Exportar para o Lesoto: Têxteis, Água e Oportunidades Comerciais", "Guia completo para exportar para o Lesoto: indústria têxtil preferencial, recursos hídricos, agricultura, logística no sul da África e acordos comerciais.", 20, ["Exportação", "Lesoto", "África", "Têxteis", "Comércio Exterior"]),
    ("exportar-para-essuatini", "Exportar para Essuatíni: Açúcar, Madeira e Agronegócio", "Guia completo para exportar para Essuatíni (antiga Suazilândia): indústria do açúcar, celulose, madeira, agricultura, logística no sul da África e acordos comerciais.", 17, ["Exportação", "Essuatíni", "África", "Açúcar", "Agronegócio"]),
    ("exportar-para-djibouti", "Exportar para Djibuti: Hub Logístico do Chifre da África", "Guia completo para exportar para Djibuti: hub logístico estratégico no Chifre da África, porto, zona franca, logística regional e oportunidades para exportadores brasileiros.", 17, ["Exportação", "Djibuti", "África", "Logística", "Porto"]),
    ("exportar-para-eritreia", "Exportar para a Eritreia: Mineração, Agricultura e Oportunidades", "Guia completo para exportar para a Eritreia: mineração, agricultura, pesca, logística no Chifre da África, portos e acordos comerciais para exportadores brasileiros.", 21, ["Exportação", "Eritreia", "África", "Mineração", "Agricultura"]),
    ("exportar-para-somalia", "Exportar para a Somália: Pecuária, Pesca e Reconstrução", "Guia completo para exportar para a Somália: pecuária, pesca, agricultura, oportunidades em reconstrução, logística e comércio no Chifre da África.", 20, ["Exportação", "Somália", "África", "Pecuária", "Reconstrução"]),
    ("exportar-para-liberia", "Exportar para a Libéria: Reconstrução, Borracha e Comércio", "Guia completo para exportar para a Libéria: borracha natural, minério de ferro, reconstrução pós-conflito, logística portuária e oportunidades na África Ocidental.", 19, ["Exportação", "Libéria", "África", "Borracha", "Reconstrução"]),
    ("exportar-para-serra-leoa", "Exportar para Serra Leoa: Mineração, Agricultura e Oportunidades", "Guia completo para exportar para Serra Leoa: diamantes, minério de ferro, agricultura, pesca, logística na África Ocidental e acordos comerciais.", 19, ["Exportação", "Serra Leoa", "África", "Mineração", "Agricultura"]),
    ("exportar-para-guine-bissau", "Exportar para Guiné-Bissau: Castanha de Caju, Pesca e Oportunidades", "Guia completo para exportar para Guiné-Bissau: castanha de caju, pesca, agricultura, logística na África Ocidental e acordos comerciais para exportadores brasileiros.", 19, ["Exportação", "Guiné-Bissau", "África", "Castanha de Caju", "Pesca"]),
    # Technology & Innovation
    ("big-data-comex-inteligencia", "Big Data no Comércio Exterior: Como Usar Inteligência de Mercado", "Guia completo sobre Big Data no comércio exterior: fontes de dados, análise de mercados, ferramentas de inteligência, trade intelligence e como decidir com base em dados.", 17, ["Comércio Exterior", "Big Data", "Inteligência de Mercado", "Dados", "Tecnologia"]),
    ("inteligencia-artificial-classificacao-ncm", "Inteligência Artificial na Classificação NCM: Guia de Aplicação", "Guia completo sobre como a inteligência artificial está revolucionando a classificação NCM: algoritmos, ferramentas, redução de erros fiscais e automação.", 16, ["Comércio Exterior", "NCM", "Inteligência Artificial", "Classificação Fiscal", "Tecnologia"]),
    ("blockchain-contratos-inteligentes-comex", "Blockchain e Contratos Inteligentes no Comércio Exterior", "Guia completo sobre blockchain e smart contracts no comércio exterior: cartas de crédito digitais, rastreabilidade, desembaraço aduaneiro e redução de custos.", 15, ["Comércio Exterior", "Blockchain", "Contratos Inteligentes", "Tecnologia", "Inovação"]),
    ("criptomoedas-pagamento-internacional", "Criptomoedas e Pagamentos Internacionais para Importadores", "Guia completo sobre criptomoedas para pagamentos internacionais no comércio exterior: stablecoins, remessas, câmbio, vantagens, riscos e regulação no Brasil.", 16, ["Comércio Exterior", "Criptomoedas", "Pagamento Internacional", "Câmbio", "Finanças"]),
    ("open-banking-cambio", "Open Banking no Mercado de Câmbio: O que Muda para o Comex", "Guia completo sobre open banking no mercado de câmbio brasileiro: quebra de monopólio bancário, novas plataformas de câmbio e benefícios para importadores e exportadores.", 11, ["Comércio Exterior", "Open Banking", "Câmbio", "Finanças", "Tecnologia"]),
    ("tecnologia-iot-cadeia-frio", "IoT na Cadeia do Frio: Monitoramento de Cargas Perecíveis", "Guia completo sobre IoT na cadeia do frio: sensores, monitoramento de contêineres refrigerados, redução de perdas, compliance sanitário e logística internacional.", 14, ["Comércio Exterior", "IoT", "Cadeia do Frio", "Logística", "Tecnologia"]),
    # Industry & Product Deep Dives
    ("cosmeticos-importacao-regulamentacao", "Importação de Cosméticos: Regulamentação ANVISA e NCM", "Guia completo para importar cosméticos no Brasil: registro ANVISA, classificação NCM, tributos, certificações, Boas Práticas de Fabricação e regularização de produtos.", 14, ["Importação", "Cosméticos", "ANVISA", "NCM", "Regulamentação"]),
    ("aco-importacao-dumping", "Importação de Aço e Dumping: Medidas Antidumping e Fornecedores", "Guia completo sobre importação de aço no Brasil: tipos de aço, classificação NCM, medidas antidumping, alíquotas, principais fornecedores internacionais e alternativas.", 16, ["Importação", "Aço", "Dumping", "Antidumping", "Siderurgia"]),
    ("biodiesel-exportacao-brasil", "Exportação de Biodiesel do Brasil: Mercados e Perspectivas", "Guia completo sobre exportação de biodiesel do Brasil: mercados compradores, certificações, especificações técnicas, logística portuária, ANP e RenovaBio.", 21, ["Exportação", "Biodiesel", "Biocombustíveis", "Energia", "Sustentabilidade"]),
    ("moda-sustentavel-exportacao-brasil", "Moda Sustentável Brasileira: Oportunidades de Exportação", "Guia completo para exportar moda sustentável do Brasil: tecidos ecológicos, certificações, mercado europeu e americano, feiras internacionais e logística.", 19, ["Exportação", "Moda Sustentável", "Têxteis", "Certificações", "Sustentabilidade"]),
    ("cesta-basica-importacao-reducao-custos", "Cesta Básica e Importação: Redução de Custos ao Consumidor", "Guia completo sobre o papel da importação na cesta básica brasileira: redução de custos, alimentos importados, tributos, acordos comerciais e benefícios ao consumidor.", 13, ["Importação", "Cesta Básica", "Alimentos", "Tributação", "Consumidor"]),
    ("produtos-eletronicos-china-qualidade", "Produtos Eletrônicos da China: Como Garantir Qualidade", "Guia completo para importar eletrônicos da China com qualidade: certificação INMETRO, compliance, inspeção de fábrica, garantia, logística e classificação NCM.", 15, ["Importação", "China", "Eletrônicos", "Qualidade", "INMETRO"]),
    ("fertilizantes-importacao-russia-bielorrusia", "Fertilizantes: Alternativas à Dependência de Rússia e Bielorrússia", "Guia completo sobre o mercado de fertilizantes no Brasil: dependência de Rússia e Bielorrússia, alternativas de fornecimento, classificação NCM e logística.", 24, ["Importação", "Fertilizantes", "Rússia", "Agronegócio", "Logística"]),
    ("latas-aluminio-reciclagem-comex", "Latas de Alumínio e Reciclagem no Comércio Exterior", "Guia completo sobre o comércio exterior de alumínio e reciclagem: exportação de sucata, importação de alumínio primário, logística, classificação NCM e sustentabilidade.", 22, ["Exportação", "Alumínio", "Reciclagem", "Sustentabilidade", "Logística"]),
    ("franquias-internacionais-comex", "Franquias Internacionais no Brasil: Como Importar Modelos de Negócio", "Guia completo sobre franquias internacionais no Brasil: importação de modelos de negócio, tributos, remessa de royalties, contratos, classificação NCM e oportunidades.", 19, ["Importação", "Franquias", "Negócios", "Tributação", "Royalties"]),
]

def build_meta_entry(p):
    """Build a postMeta.ts entry. NO content field (code-split format)."""
    tags_str = ", ".join(f'"{t}"' for t in p[4])
    return f'  {{ slug: "{p[0]}", title: "{p[1]}", excerpt: "{p[2]}", date: "{DATE}", readTime: {p[3]}, tags: [{tags_str}] }},'

def build_prerender_entry(p):
    """Build a prerender.mjs BLOG_POSTS entry."""
    return f'  {{ slug: "{p[0]}", name: "{p[1]}", desc: "{p[2]}" }},'

def insert_before_marker(lines, marker):
    """Find the last occurrence of marker in lines list."""
    for i in range(len(lines) - 1, -1, -1):
        if lines[i].strip() == marker:
            return i
    # Fallback: search from start
    for i in range(len(lines) - 1, -1, -1):
        if marker in lines[i]:
            return i
    raise ValueError(f"Marker '{marker}' not found")

def integrate_postmeta():
    path = "src/data/blog/postMeta.ts"
    with open(path) as f:
        lines = f.readlines()
    pos = insert_before_marker(lines, "];")
    entries = [build_meta_entry(p) + "\n" for p in NEW_POSTS]
    for entry in reversed(entries):
        lines.insert(pos, entry)
    with open(path, "w") as f:
        f.writelines(lines)
    print(f"✅ postMeta.ts: inserted {len(NEW_POSTS)} entries at line {pos}")

def integrate_postcontentmap():
    path = "src/data/blog/postContentMap.ts"
    with open(path) as f:
        lines = f.readlines()
    # Find the }; that closes the map object (before getPostContent)
    close_map = None
    for i in range(len(lines) - 1, -1, -1):
        if lines[i].strip() == "};":
            # Verify by checking for getPostContent nearby
            for j in range(i + 1, min(i + 4, len(lines))):
                if "export async function getPostContent" in lines[j]:
                    close_map = i
                    break
            if close_map is not None:
                break
    if close_map is None:
        raise ValueError("Could not find map closing }; before getPostContent")
    entries = [f'  "{p[0]}": () => import("./content/{p[0]}"),\n' for p in NEW_POSTS]
    for entry in reversed(entries):
        lines.insert(close_map, entry)
    with open(path, "w") as f:
        f.writelines(lines)
    print(f"✅ postContentMap.ts: inserted {len(NEW_POSTS)} entries at line {close_map}")

def integrate_prerender():
    path = "scripts/prerender.mjs"
    with open(path) as f:
        lines = f.readlines()
    # Find the last ]; in the file (BLOG_POSTS closing)
    blog_end = None
    for i in range(len(lines) - 1, -1, -1):
        if lines[i].strip() == "];":
            blog_end = i
            break
    if blog_end is None:
        raise ValueError("Could not find BLOG_POSTS closing ];")
    entries = [build_prerender_entry(p) + "\n" for p in NEW_POSTS]
    for entry in reversed(entries):
        lines.insert(blog_end, entry)
    with open(path, "w") as f:
        f.writelines(lines)
    print(f"✅ prerender.mjs: inserted {len(NEW_POSTS)} entries before line {blog_end}")

def verify():
    print("\n=== Post-Integration Verification ===")
    meta_count = 0
    for slug, _, _, _, _ in NEW_POSTS:
        pass
    
    # Counts
    meta = sum(1 for _ in open("src/data/blog/postMeta.ts") if 'slug:' in _)
    files = len([1 for _ in __import__('pathlib').Path("src/data/blog/content").glob("*.ts")])
    content_map = sum(1 for _ in open("src/data/blog/postContentMap.ts") if '() => import' in _)
    prerender_section = False
    prerender_count = 0
    with open("scripts/prerender.mjs") as f:
        for line in f:
            if "const BLOG_POSTS" in line:
                prerender_section = True
            if prerender_section and 'slug:' in line:
                prerender_count += 1
            if prerender_section and line.strip() == "];":
                break
    
    print(f"  postMeta: {meta}")
    print(f"  content/: {files}")
    print(f"  contentMap: {content_map}")
    print(f"  prerender BLOG_POSTS: {prerender_count}")
    
    # Check NO content field in postMeta
    content_fields = sum(1 for _ in open("src/data/blog/postMeta.ts") if 'content:' in _ and 'import' in _)
    print(f"  content fields in postMeta (must be 0): {content_fields}")
    
    # Check no duplicate slugs
    import subprocess
    dups = subprocess.run(
        "grep -oP 'slug: \"\\K[^\"]+' src/data/blog/postMeta.ts | sort | uniq -d",
        shell=True, capture_output=True, text=True
    ).stdout.strip()
    print(f"  Duplicate slugs: {'NONE' if not dups else dups}")
    
    # Check our 30 new slugs exist in all files
    print("\n=== Per-slug sync check (first/last 5) ===")
    for slug, title, _, _, _ in NEW_POSTS[:5] + [("...", "", "", 0, [])] + NEW_POSTS[-5:]:
        if slug == "...":
            print("  ...")
            continue
        meta_ok = sum(1 for _ in open("src/data/blog/postMeta.ts") if f'"{slug}"' in _)
        content_ok = __import__('pathlib').Path(f"src/data/blog/content/{slug}.ts").exists()
        map_ok = sum(1 for _ in open("src/data/blog/postContentMap.ts") if slug in _ and '() => import' in _)
        prerender_ok = sum(1 for _ in open("scripts/prerender.mjs") if f'slug: "{slug}"' in _)
        status = "✅" if (meta_ok and content_ok and map_ok and prerender_ok) else "❌"
        print(f"  {status} {slug} — m:{meta_ok} c:{content_ok} p:{map_ok} r:{prerender_ok}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--verify":
        verify()
    else:
        integrate_postmeta()
        integrate_postcontentmap()
        integrate_prerender()
        print("\n✅ Integration complete! Run with --verify to check.")
