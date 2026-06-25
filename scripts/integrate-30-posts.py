#!/usr/bin/env python3
"""
Integration script for 30 new blog posts (June 25 06:00).
Updates postMeta.ts, postContentMap.ts, and prerender.mjs.
"""
import re, subprocess

DATE = "2026-06-25"

POSTS = [
  ("exportacao-suco-laranja-brasil", "Exportação de Suco de Laranja do Brasil: Mercados, Certificações e Processos", "Guia completo sobre exportação de suco de laranja do Brasil: principais destinos, exigências fitossanitárias, certificações internacionais, logística portuária e tendências de mercado.", 16, ["Exportação", "Suco de Laranja", "Agronegócio", "Certificações", "Logística"]),
  ("exportacao-etanol-combustivel-brasil", "Exportação de Etanol Brasileiro: Mercados, Logística e Regulamentação", "Guia completo sobre exportação de etanol do Brasil: tipos de etanol, mercados compradores, logística portuária, certificações e regulação da ANP.", 14, ["Exportação", "Etanol", "Biocombustíveis", "ANP", "Energia"]),
  ("exportacao-acucar-brasil", "Exportação de Açúcar do Brasil: Mercados, Tipos e Logística Internacional", "Guia completo sobre exportação de açúcar do Brasil: tipos VHP, cristal e refinado, processo produtivo, certificações, logística portuária e mercados globais.", 15, ["Exportação", "Açúcar", "Agronegócio", "Commodities", "Logística"]),
  ("exportacao-petroleo-brasil-regras", "Exportação de Petróleo Brasileiro: Regulação, Mercados e Logística", "Guia completo sobre exportação de petróleo do Brasil: pré-sal, tipos de petróleo, regulação ANP, mercados compradores, logística e tributação.", 14, ["Exportação", "Petróleo", "Pré-Sal", "ANP", "Energia"]),
  ("exportacao-frango-congelado-brasil", "Exportação de Carne de Frango do Brasil: Mercados, Certificações e Logística", "Guia completo sobre exportação de frango do Brasil: maiores produtores, certificações sanitárias, habilitação MAPA, mercados compradores e logística portuária.", 14, ["Exportação", "Carne de Frango", "Agronegócio", "Certificações", "MAPA"]),
  ("exportacao-calcados-brasil-mercados", "Exportação de Calçados Brasileiros: Mercados, Processos e Oportunidades", "Guia completo sobre exportação de calçados do Brasil: polos produtores, mercados internacionais, certificações e processos aduaneiros.", 14, ["Exportação", "Calçados", "Indústria", "Franca", "Moda"]),
  ("exportacao-energia-renovavel-brasil", "Exportação de Energia Renovável do Brasil: Fontes, Mercados e Perspectivas", "Guia completo sobre exportação de energia renovável do Brasil: hidrelétrica, eólica, solar, hidrogênio verde e perspectivas para o mercado internacional.", 16, ["Exportação", "Energia Renovável", "Sustentabilidade", "Hidrogênio Verde", "Inovação"]),
  ("importacao-veiculos-eletricos-brasil", "Importação de Veículos Elétricos no Brasil: NCM, Tributação e Regras", "Guia completo sobre importação de veículos elétricos no Brasil: classificação NCM, tributos, regras Inmetro e CONAMA, certificações e infraestrutura.", 16, ["Importação", "Veículos Elétricos", "NCM", "Inmetro", "Tributação"]),
  ("importacao-brinquedos-seguranca-inmetro", "Importação de Brinquedos no Brasil: Regulamentação Inmetro, NCM e Segurança", "Guia completo sobre importação de brinquedos no Brasil: classificação NCM, certificação Inmetro, etiquetagem, segurança infantil e tributos.", 15, ["Importação", "Brinquedos", "Inmetro", "NCM", "Segurança"]),
  ("importacao-pneus-ncm-regulamentacao", "Importação de Pneus no Brasil: NCM, Regulamentação e Mercado", "Guia completo sobre importação de pneus no Brasil: classificação NCM, regras Inmetro, tributos, mercados fornecedores e logística.", 14, ["Importação", "Pneus", "NCM", "Inmetro", "Logística"]),
  ("importacao-laticinios-regras-mapa", "Importação de Laticínios no Brasil: Regras MAPA, NCM e Mercado", "Guia completo sobre importação de laticínios no Brasil: registro MAPA, classificação NCM, certificações sanitárias, tributos e oportunidades.", 15, ["Importação", "Laticínios", "MAPA", "NCM", "Certificações"]),
  ("importacao-pescados-regulamentacao-mapa", "Importação de Pescados no Brasil: Regulamentação MAPA, NCM e Controle Sanitário", "Guia completo sobre importação de pescados no Brasil: registro MAPA, classificação NCM, inspeção sanitária e certificações.", 14, ["Importação", "Pescados", "MAPA", "NCM", "Sanitário"]),
  ("marketing-exportacao-estrategias-digitais", "Marketing Digital para Exportação: Estratégias e Ferramentas", "Guia completo sobre marketing digital para exportação: SEO internacional, LinkedIn Ads, Google Ads B2B, marketplaces B2B e feiras virtuais.", 15, ["Exportação", "Marketing Digital", "SEO", "Comércio Exterior", "Inovação"]),
  ("precos-transferencia-comex-tributacao", "Preços de Transferência no Comércio Exterior: Regras e Compliance", "Guia completo sobre preços de transferência no comex: métodos PIC, PRL, CAP, CCL, documentação, penalidades e compliance tributário.", 15, ["Tributação", "Preços de Transferência", "Compliance", "Comex", "Contabilidade"]),
  ("exportar-para-luxemburgo-financas", "Exportar para Luxemburgo: Finanças, Logística e Oportunidades", "Guia completo para exportar para Luxemburgo: hub financeiro europeu, logística, acordos comerciais e setores promissores.", 14, ["Exportação", "Luxemburgo", "Europa", "Finanças", "Logística"]),
  ("exportar-para-montenegro-comercio", "Exportar para Montenegro: Comércio, Logística e Oportunidades", "Guia completo para exportar para Montenegro: economia dos Bálcãs, portos, acordos comerciais e setores promissores.", 13, ["Exportação", "Montenegro", "Bálcãs", "Europa", "Logística"]),
  ("exportar-para-cazaquistao-minerios", "Exportar para o Cazaquistão: Minérios, Agricultura e Oportunidades", "Guia completo para exportar para o Cazaquistão: economia, recursos minerais, agronegócio e acordos comerciais.", 14, ["Exportação", "Cazaquistão", "Ásia Central", "Minérios", "Agricultura"]),
  ("exportar-para-uzbequistao-agricultura", "Exportar para o Uzbequistão: Agricultura, Têxteis e Oportunidades", "Guia completo para exportar para o Uzbequistão: economia emergente, algodão, agricultura e oportunidades.", 14, ["Exportação", "Uzbequistão", "Ásia Central", "Agricultura", "Têxteis"]),
  ("exportar-para-haiti-reconstrucao", "Exportar para o Haiti: Reconstrução, Oportunidades e Comércio", "Guia completo para exportar para o Haiti: economia em reconstrução, setores promissores, logística portuária e riscos.", 14, ["Exportação", "Haiti", "Caribe", "Reconstrução", "Logística"]),
  ("exportar-para-fiji-turismo", "Exportar para Fiji: Turismo, Agricultura e Oportunidades no Pacífico", "Guia completo para exportar para Fiji: economia insular, turismo, agricultura e acordos comerciais no Pacífico Sul.", 14, ["Exportação", "Fiji", "Pacífico", "Turismo", "Agricultura"]),
  ("exportar-para-papua-nova-guine", "Exportar para Papua-Nova Guiné: Recursos Naturais e Oportunidades", "Guia completo para exportar para Papua-Nova Guiné: recursos minerais, petróleo, gás e acordos comerciais.", 13, ["Exportação", "Papua-Nova Guiné", "Oceania", "Recursos Naturais", "Mineração"]),
  ("exportar-para-seychelles-turismo", "Exportar para Seychelles: Turismo, Pesca e Oportunidades Comerciais", "Guia completo para exportar para Seychelles: economia insular, turismo de luxo, pesca atuneira e acordos comerciais.", 13, ["Exportação", "Seychelles", "África", "Turismo", "Pesca"]),
  ("exportar-para-mauricio-financas", "Exportar para Maurício: Finanças, Têxteis e Oportunidades", "Guia completo para exportar para Maurício: hub financeiro, têxteis, zona franca e acordos comerciais.", 14, ["Exportação", "Maurício", "África", "Finanças", "Zona Franca"]),
  ("exportar-para-ruanda-tecnologia", "Exportar para Ruanda: Tecnologia, Inovação e Oportunidades na África", "Guia completo para exportar para Ruanda: hub tecnológico africano, agricultura, logística e ambiente de negócios.", 13, ["Exportação", "Ruanda", "África", "Tecnologia", "Inovação"]),
  ("exportar-para-cabo-verde-oportunidades", "Exportar para Cabo Verde: Turismo, Serviços e Oportunidades", "Guia completo para exportar para Cabo Verde: hub logístico atlântico, turismo, serviços e acordos.", 14, ["Exportação", "Cabo Verde", "África", "Turismo", "Logística"]),
  ("exportar-para-sao-tome-principe", "Exportar para São Tomé e Príncipe: Agricultura, Turismo e Oportunidades", "Guia completo para exportar para São Tomé e Príncipe: economia insular, cacau, turismo e acordos.", 13, ["Exportação", "São Tomé e Príncipe", "África", "Agricultura", "Turismo"]),
  ("exportar-para-togo-comercio", "Exportar para o Togo: Comércio, Porto e Oportunidades na África", "Guia completo para exportar para o Togo: Porto de Lomé, hub logístico, commodities e agronegócio.", 14, ["Exportação", "Togo", "África", "Logística", "Porto"]),
  ("certificacao-globalgap-exportacao", "Certificação GlobalGAP para Exportação de Alimentos: Guia Completo", "Guia completo sobre certificação GlobalGAP para frutas e verduras: requisitos, etapas, custos e benefícios.", 14, ["Exportação", "Certificação", "GlobalGAP", "Agricultura", "Qualidade"]),
  ("seguros-credito-exportacao-proex", "Seguro de Crédito à Exportação: Proex e Soluções de Proteção", "Guia completo sobre seguro de crédito à exportação no Brasil: Proex Equalização, seguro privado, coberturas e como contratar.", 15, ["Exportação", "Seguro", "Crédito", "Proex", "Financiamento"]),
  ("exportar-para-maldivas-turismo", "Exportar para Maldivas: Turismo de Luxo, Construção e Oportunidades", "Guia completo para exportar para as Maldivas: turismo de luxo, materiais de construção, alimentos premium e oportunidades.", 14, ["Exportação", "Maldivas", "Turismo", "Oceano Índico", "Luxo"]),
]

def escape_meta(s):
    """Escape backticks and backslashes for TypeScript template literal."""
    return s.replace("\\", "\\\\").replace("`", "\\`")

def build_meta_entry(p):
    slug, title, excerpt, read_time, tags = p
    tags_str = ", ".join(f'"{t}"' for t in tags)
    return f'  {{ slug: "{slug}", title: "{escape_meta(title)}", excerpt: "{escape_meta(excerpt)}", date: "{DATE}", readTime: {read_time}, tags: [{tags_str}] }},'

def build_content_map_entry(p):
    slug = p[0]
    return f'  "{slug}": () => import("./content/{slug}"),'

def build_prerender_entry(p):
    slug, title, excerpt = p[0], p[1], p[2]
    # Truncate name to 60 chars with ...
    name = title if len(title) <= 60 else title[:57] + "..."
    return f'  {{ slug: "{slug}", name: "{escape_meta(name)}", desc: "{escape_meta(excerpt)}" }},'

# ---- postMeta.ts ----
with open("src/data/blog/postMeta.ts", "r") as f:
    meta_content = f.read()

# Find the last ]; to insert before
meta_end = meta_content.rfind("\n];")
if meta_end == -1:
    meta_end = meta_content.rfind("];")

entries = "\n".join(build_meta_entry(p) for p in POSTS)
new_meta = meta_content[:meta_end] + "\n" + entries + "\n" + meta_content[meta_end:]

with open("src/data/blog/postMeta.ts", "w") as f:
    f.write(new_meta)

print(f"✅ postMeta.ts: inserted {len(POSTS)} entries")

# ---- postContentMap.ts ----
with open("src/data/blog/postContentMap.ts", "r") as f:
    map_lines = f.readlines()

# Find the }; that closes the map object (checking for getPostContent nearby)
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
    print("❌ Could not find postContentMap closing };")
else:
    for j, p in enumerate(POSTS):
        map_lines.insert(close_map + j, build_content_map_entry(p) + "\n")
    with open("src/data/blog/postContentMap.ts", "w") as f:
        f.writelines(map_lines)
    print(f"✅ postContentMap.ts: inserted {len(POSTS)} entries")

# ---- prerender.mjs ----
with open("scripts/prerender.mjs", "r") as f:
    pr_lines = f.readlines()

# Find last ]; in the file (BLOG_POSTS closing)
blog_end = None
for i in range(len(pr_lines) - 1, -1, -1):
    if pr_lines[i].strip() == "];":
        blog_end = i
        break

if blog_end is None:
    print("❌ Could not find BLOG_POSTS closing ];")
else:
    for j, p in enumerate(POSTS):
        pr_lines.insert(blog_end + j, build_prerender_entry(p) + "\n")
    with open("scripts/prerender.mjs", "w") as f:
        f.writelines(pr_lines)
    print(f"✅ prerender.mjs: inserted {len(POSTS)} entries")

# Verification
print("\n=== Verification ===")
import subprocess
meta_count = subprocess.run(["grep", "-cP", 'slug:\\s+"', "src/data/blog/postMeta.ts"], capture_output=True, text=True).stdout.strip()
map_count = subprocess.run(["grep", "-cP", ':\\s*\\(\\)\\s*=>\\s*import', "src/data/blog/postContentMap.ts"], capture_output=True, text=True).stdout.strip()
pr_count = subprocess.run(["bash", "-c", "awk '/^const BLOG_POSTS/,/^];/' scripts/prerender.mjs | grep -c 'slug:'"], capture_output=True, text=True).stdout.strip()
content_count = subprocess.run(["bash", "-c", "ls src/data/blog/content/*.ts | wc -l"], capture_output=True, text=True).stdout.strip()

print(f"Content files: {content_count}")
print(f"postMeta: {meta_count}")
print(f"contentMap: {map_count}")
print(f"prerender BLOG_POSTS: {pr_count}")

# Check for content field in postMeta
content_field = subprocess.run(["grep", "-c", "content:.*import", "src/data/blog/postMeta.ts"], capture_output=True, text=True).stdout.strip()
print(f"content fields in postMeta: {content_field} (should be 0)")

# Check for trailing backslashes
bs = subprocess.run(["bash", "-c", "grep -c ',\\\\$' src/data/blog/postContentMap.ts 2>/dev/null; echo $?"], capture_output=True, text=True).stdout.strip()
print(f"Trailing backslashes in contentMap: {'CLEAN' if '1' in bs else 'CHECK'}")
