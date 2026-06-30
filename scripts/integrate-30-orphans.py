#!/usr/bin/env python3
"""Integrate 30 orphan content files into postMeta.ts and postContentMap.ts.
Content files and prerender entries already exist — just need meta + map entries."""
import os

BASE = "/home/nuh_tapinar/tmp-build/project-clean"
DATE = "2026-06-30"

# Orphan data: (slug, title, excerpt, [tags], readTime)
# title/excerpt from prerender entries, tags assigned by topic cluster
ORPHANS = [
    ("acordo-mercosul-ue-negociacoes-brasil-parceria", "Acordo Mercosul-UE: Oportunidades para Exportadores Brasileiros",
     "Análise completa do acordo Mercosul-UE: cronograma de redução tarifária, regras de origem, setores mais beneficiados e impactos para exportadores brasileiros.",
     ["Acordos", "Mercosul", "UE", "Exportação", "Comércio Exterior"], 14),
    ("acos-especiais-brasil-exportacao-automotivo-petroleo", "Aços Especiais Brasileiros: Exportação para Indústria Automotiva e Petrolífera",
     "Panorama completo da exportação de aços especiais brasileiros: ligas metálicas para indústria automotiva, petrolífera e bens de capital com certificações internacionais.",
     ["Exportação", "Aço", "Automotivo", "Petróleo", "Siderurgia"], 18),
    ("adiantamento-contrato-cambio-exportador-capital-giro", "ACC e ACE: Adiantamento de Contrato de Câmbio para Exportadores",
     "Guia completo sobre ACC e ACE para exportadores brasileiros: financiamento pré-embarque e pós-embarque, custos, requisitos, benefícios fiscais e operacionalização bancária.",
     ["ACC", "ACE", "Câmbio", "Financiamento", "Exportação"], 18),
    ("barreiras-tecnicas-comerciais-ue-exportacao-brasileira", "Barreiras Técnicas e Regulatórias da UE para Exportações Brasileiras",
     "Guia completo sobre barreiras técnicas e regulatórias da UE para exportações brasileiras: certificações CE, REACH, normas sanitárias e estratégias de adequação comercial.",
     ["Barreiras", "UE", "Certificações", "Exportação", "Comércio Exterior"], 21),
    ("brics-nova-moeda-comercio-desdolarizacao-brasil", "BRICS e Desdolarização: Perspectivas para o Comércio Exterior Brasileiro",
     "Análise completa da iniciativa dos BRICS por alternativas de pagamento: impacto da desdolarização, BRICS Pay e perspectivas para exportadores brasileiros.",
     ["BRICS", "Desdolarização", "Câmbio", "Comércio Exterior", "Geopolítica"], 18),
    ("cartas-credito-standby-comex-garantias-operacoes", "Cartas de Crédito Standby no Comércio Exterior: Garantias e Operações",
     "Guia completo sobre cartas de crédito standby no comércio exterior brasileiro: funcionamento, diferenças para LC documentária, aplicações em garantias e custos operacionais.",
     ["Standby LC", "Garantias", "Câmbio", "Trade Finance", "Importação"], 14),
    ("certificacoes-ue-produtos-agricolas-brasil-exportacao", "Certificações da UE para Exportação de Produtos Agrícolas Brasileiros",
     "Guia completo sobre certificações da UE para exportação agrícola brasileira: orgânica, GlobalGAP, Rainforest Alliance, rastreabilidade e conformidade com o EUDR.",
     ["Certificações", "UE", "Agronegócio", "Exportação", "Sustentabilidade"], 18),
    ("comercio-brasil-alemanha-setores-oportunidades", "Comércio Brasil-Alemanha: Setores, Oportunidades e Acordos",
     "Análise completa das relações comerciais Brasil-Alemanha: principais produtos, oportunidades em máquinas, químicos, autopeças e cooperação tecnológica bilateral.",
     ["Alemanha", "Comércio Bilateral", "Exportação", "Máquinas", "Autopeças"], 17),
    ("comercio-brasil-india-farmacos-petroleo-oportunidades", "Comércio Brasil-Índia: Fármacos, Petróleo e Oportunidades",
     "Análise completa das relações comerciais Brasil-Índia: petróleo, fármacos, açúcar, minérios, acordos bilaterais e oportunidades setoriais para exportadores brasileiros.",
     ["Índia", "Comércio Bilateral", "Fármacos", "Petróleo", "Exportação"], 17),
    ("compliance-digital-lgpd-comex-protecao-dados", "Compliance Digital no Comércio Exterior: LGPD e Proteção de Dados",
     "Guia completo sobre compliance digital no comércio exterior brasileiro: adequação à LGPD, proteção de dados em operações internacionais e segurança da informação.",
     ["LGPD", "Compliance", "Proteção de Dados", "Digital", "Exportação"], 18),
    ("cosmeticos-brasil-exportacao-mercado-internacional", "Cosméticos Brasileiros: Exportação para o Mercado Internacional",
     "Guia completo sobre exportação de cosméticos brasileiros: mercado global de beleza, regulamentação ANVISA, certificações internacionais e oportunidades nos principais mercados.",
     ["Cosméticos", "Exportação", "ANVISA", "Beleza", "Mercados Internacionais"], 16),
    ("cursos-online-brasil-exportacao-educacao-distancia", "Exportação de Cursos Online Brasileiros: EAD no Mercado Global",
     "Guia completo sobre exportação de cursos online brasileiros: mercado global de EAD, plataformas internacionais, certificações e aspectos tributários da educação a distância.",
     ["Educação", "EAD", "Cursos Online", "Exportação", "Tecnologia"], 12),
    ("dispositivos-medicos-importacao-anvisa-classificacao", "Importação de Dispositivos Médicos: Classificação ANVISA e Regularização",
     "Guia completo sobre importação de dispositivos médicos no Brasil: classificação de risco RDC 830/2023, registro ANVISA, certificação INMETRO e regularização aduaneira.",
     ["Dispositivos Médicos", "ANVISA", "Importação", "Regulamentação", "Saúde"], 15),
    ("educacao-superior-brasileira-internacionalizacao-alunos", "Internacionalização do Ensino Superior Brasileiro: Atração de Alunos Estrangeiros",
     "Análise completa da internacionalização do ensino superior brasileiro: atração de alunos estrangeiros, intercâmbio acadêmico, convênios e impacto econômico.",
     ["Educação", "Ensino Superior", "Internacionalização", "Intercâmbio", "Exportação"], 19),
    ("exportacao-aco-brasil-mercado-global-siderurgia", "Exportação de Aço do Brasil: Mercado Global da Siderurgia",
     "Guia completo sobre exportação de aço brasileiro: principais mercados, tipos de produtos siderúrgicos, logística portuária e competitividade internacional da siderurgia nacional.",
     ["Exportação", "Aço", "Siderurgia", "Logística", "Mineração"], 20),
    ("exportacao-equipamentos-hospitalares-mercado-global", "Exportação de Equipamentos Hospitalares Brasileiros para o Mercado Global",
     "Guia completo sobre exportação de equipamentos hospitalares brasileiros: mercados emergentes, certificações CE/FDA, INMETRO e financiamento à exportação do setor.",
     ["Exportação", "Equipamentos Hospitalares", "Saúde", "Certificações", "Mercados Internacionais"], 17),
    ("exportacao-ferro-gusa-brasil-mercados-internacionais", "Exportação de Ferro-Gusa Brasileiro: Mercados e Logística Internacional",
     "Panorama completo da exportação de ferro-gusa do Brasil, processo produtivo, classificação NCM, carvão vegetal como diferencial e principais destinos no mercado global.",
     ["Exportação", "Ferro-Gusa", "Siderurgia", "Mineração", "Logística"], 18),
    ("fintechs-cambio-comercio-exterior-pagamentos-internacionais", "Fintechs de Câmbio: Revolução nos Pagamentos Internacionais do Comércio Exterior",
     "Panorama completo das fintechs de câmbio no Brasil transformando pagamentos internacionais do comércio exterior com taxas competitivas, processos digitais e inovação.",
     ["Fintechs", "Câmbio", "Pagamentos", "Trade Finance", "Exportação"], 15),
    ("fundo-garantia-exportacao-fge-risco-pais", "Fundo de Garantia à Exportação (FGE): Cobertura de Risco-País",
     "Guia completo sobre o Fundo de Garantia à Exportação: cobertura de risco-país, risco comercial e extraordinário, seguro de crédito e ACC/ACE com garantia soberana.",
     ["FGE", "Garantias", "Risco-País", "Exportação", "Financiamento"], 18),
    ("importacao-medicamentos-insumos-farmaceuticos-brasil", "Importação de Medicamentos e Insumos Farmacêuticos no Brasil",
     "Guia completo sobre importação de medicamentos no Brasil: registro ANVISA, classificação NCM, licenciamento de importação, tributação e boas práticas de distribuição.",
     ["Importação", "Medicamentos", "ANVISA", "Fármacos", "Saúde"], 15),
    ("industria-farmaceutica-brasileira-inovacao-exportacao", "Indústria Farmacêutica Brasileira: Inovação e Exportação Global",
     "Análise completa da indústria farmacêutica brasileira: inovação, exportação para América Latina, África, EUA e Europa, registros sanitários e parcerias estratégicas.",
     ["Exportação", "Fármacos", "Inovação", "Saúde", "Indústria"], 15),
    ("laminados-aco-brasil-exportacao-qualidade-normas", "Laminados de Aço: Exportação Brasileira com Qualidade e Normas Internacionais",
     "Guia completo sobre exportação de laminados de aço do Brasil: bobinas, chapas, vergalhões, certificações de qualidade e adequação às normas técnicas internacionais.",
     ["Exportação", "Aço", "Laminados", "Siderurgia", "Normas Técnicas"], 18),
    ("logistica-cross-border-ecommerce-desafios-solucoes-brasil", "Logística Cross-Border para E-commerce: Desafios e Soluções para Exportadores",
     "Guia completo sobre logística cross-border para e-commerce no Brasil: transporte internacional, desembaraço aduaneiro, tributação de remessas e prazos de entrega.",
     ["Logística", "Cross-Border", "E-commerce", "Exportação", "Transporte"], 19),
    ("marketplace-internacional-exportacao-brasil-vendedor-global", "Marketplaces Internacionais: Como Exportar como Vendedor Global",
     "Guia completo para exportadores brasileiros venderem em marketplaces internacionais: Amazon, Mercado Livre, Alibaba, eBay com logística, tributação e regularização aduaneira.",
     ["Marketplaces", "E-commerce", "Exportação", "Vendas Online", "Logística"], 21),
    ("meios-pagamento-digitais-comex-pix-crypto-brasil", "Meios de Pagamento Digitais no Comércio Exterior: Pix, Criptomoedas e Mais",
     "Análise completa dos meios de pagamento digitais no comércio exterior brasileiro: Pix internacional, criptomoedas, stablecoins, Drex e soluções fintech cross-border.",
     ["Pagamentos", "Pix", "Criptomoedas", "Câmbio", "Fintechs"], 19),
    ("plataformas-b2b-digitais-exportacao-brasil-negocios", "Plataformas B2B Digitais: Conectando Exportadores Brasileiros ao Mundo",
     "Guia completo sobre plataformas B2B digitais para exportação brasileira: conexão com compradores, matchmaking, prospecção digital e inteligência comercial.",
     ["Plataformas B2B", "Exportação", "Digital", "Prospecção", "Negócios"], 16),
    ("portugues-lingua-estrangeira-ensino-internacionalizacao", "Ensino de Português como Língua Estrangeira: Internacionalização e Oportunidades",
     "Análise completa do ensino de português como língua estrangeira: certificação CELPE-Bras, oportunidades para escolas, intercâmbio educacional e impacto econômico.",
     ["Educação", "Português", "Idiomas", "Internacionalização", "Exportação"], 14),
    ("regulamento-deflorestacao-ue-impacto-exportacao-brasil", "EUDR: Regulamento Antidesmatamento da UE e Impacto nas Exportações Brasileiras",
     "Guia completo sobre o EUDR e seu impacto em exportações brasileiras de soja, café, carne, couro e madeira, due diligence, rastreabilidade e geolocalização.",
     ["EUDR", "Sustentabilidade", "UE", "Exportação", "Regulamentação"], 15),
    ("servicos-financeiros-comex-cambio-trade-finance", "Serviços Financeiros para o Comércio Exterior: Câmbio e Trade Finance",
     "Guia completo sobre serviços financeiros para comércio exterior brasileiro: operações de câmbio, trade finance, financiamentos, cartas de crédito e soluções bancárias.",
     ["Trade Finance", "Câmbio", "Financiamento", "Exportação", "Bancos"], 15),
    ("tubos-aco-brasil-exportacao-oleo-gas", "Exportação de Tubos de Aço do Brasil para Indústria de Óleo e Gás",
     "Guia completo sobre exportação de tubos de aço do Brasil para a indústria de óleo e gás: tipos seamless, ERW, LSAW, certificações API e principais mercados compradores.",
     ["Exportação", "Tubos", "Aço", "Óleo e Gás", "Siderurgia"], 20),
]


def insert_before_marker(lines, marker):
    """Find marker from end of file."""
    for i in range(len(lines) - 1, -1, -1):
        if lines[i].strip() == marker:
            return i
    raise ValueError(f"Marker '{marker}' not found")


def fix_missing_comma(lines, close_idx):
    """Fix missing trailing comma on entry just before marker."""
    entry = lines[close_idx - 1].rstrip("\n")
    if entry.endswith("}") and not entry.endswith("},"):
        lines[close_idx - 1] = entry + ",\n"
        print(f"  Fixed missing comma on last entry at line {close_idx}")
    return lines


# ═══ 1. postMeta.ts ═══
print("=== 1. postMeta.ts ===")
meta_path = os.path.join(BASE, "src/data/blog/postMeta.ts")
with open(meta_path) as f:
    meta_lines = f.readlines()

pos = insert_before_marker(meta_lines, "];")
meta_lines = fix_missing_comma(meta_lines, pos)

meta_entries = []
for slug, title, excerpt, tags, read_time in ORPHANS:
    tags_str = ", ".join(f'"{t}"' for t in tags)
    entry = f'  {{ slug: "{slug}", title: "{title}", excerpt: "{excerpt}", date: "{DATE}", readTime: {read_time}, tags: [{tags_str}] }}'
    meta_entries.append(entry)

for j, entry in enumerate(meta_entries):
    meta_lines.insert(pos + j, entry + ",\n")

with open(meta_path, "w") as f:
    f.writelines(meta_lines)

meta_count = sum(1 for l in open(meta_path) if 'slug:' in l)
print(f"  postMeta now has {meta_count} slug entries")

# ═══ 2. postContentMap.ts ═══
print("=== 2. postContentMap.ts ===")
map_path = os.path.join(BASE, "src/data/blog/postContentMap.ts")
with open(map_path) as f:
    map_lines = f.readlines()

# Find map closing }; with getPostContent proximity check
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

print(f"  Found map close at line {close_map}")
map_lines = fix_missing_comma(map_lines, close_map)

for slug, _, _, _, _ in ORPHANS:
    map_lines.insert(close_map, f'  "{slug}": () => import("./content/{slug}"),\n')
    close_map += 1

with open(map_path, "w") as f:
    f.writelines(map_lines)

# Clean trailing backslash artifacts
map_content = open(map_path).read()
if ', \\\\\\\n' in map_content:
    map_content = map_content.replace(', \\\\\\\n', ',\n')
    open(map_path, 'w').write(map_content)
    print("  Cleaned trailing backslashes")

map_count = sum(1 for l in open(map_path) if '=> import' in l)
gp = sum(1 for l in open(map_path) if 'getPostContent' in l)
print(f"  contentMap now has {map_count} map entries")
print(f"  getPostContent references: {gp}")

# ═══ 3. Verify ═══
print("\n=== Verification ===")
content_count = len(os.listdir(os.path.join(BASE, "src/data/blog/content")))
meta_final = sum(1 for l in open(meta_path) if 'slug:' in l)
map_final = sum(1 for l in open(map_path) if '=> import' in l)

print(f"  Content files: {content_count}")
print(f"  postMeta slugs: {meta_final}")
print(f"  contentMap entries: {map_final}")

if meta_final == map_final == content_count:
    print("  ✅ ALL IN SYNC")
else:
    print(f"  ⚠️ MISMATCH: meta={meta_final} map={map_final} content={content_count}")

# No content field check
content_fields = sum(1 for l in open(meta_path) if 'content:.*import' in l or 'content: `' in l)
print(f"  Content fields in postMeta: {content_fields} (should be 0)")

print("\n✅ Integration complete!")
