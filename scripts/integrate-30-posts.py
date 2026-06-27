#!/usr/bin/env python3
"""
Integration script for 30 blog posts — June 27 09:00 run.
Line-based insertion to avoid all offset bugs.
Usage: python3 scripts/integrate-30-posts.py
"""
import os

DATE = "2026-06-27"
BASE = "/home/nuh_tapinar/tmp-build/project-clean"

NEW_POSTS = [
    # ── Batch 1: Importação Especializada ──
    {"slug": "importacao-obras-arte-antiguidades-colecao", "title": "Importação de Obras de Arte, Antiguidades e Itens de Coleção: Regras e Tributação", "excerpt": "Guia completo para importar obras de arte, antiguidades e itens de coleção para o Brasil: classificação NCM, tributos incidentes, documentação exigida, IPI, ICMS e os requisitos do IPHAN para bens culturais.", "readTime": 14, "tags": ["Importação", "Obras de Arte", "Antiguidades", "IPHAN", "Tributação"]},
    {"slug": "importacao-instrumentos-musicais-guia-completo", "title": "Importação de Instrumentos Musicais: NCM, Tributação e Fornecedores", "excerpt": "Guia prático para importar instrumentos musicais: classificação NCM dos Capítulos 92 e 85, alíquotas de II e IPI, países com melhores preços, certificações INMETRO e como escolher fornecedores confiáveis.", "readTime": 13, "tags": ["Importação", "Instrumentos Musicais", "NCM", "INMETRO", "Fornecedores"]},
    {"slug": "importacao-aeronaves-pecas-manutencao-anac", "title": "Importação de Aeronaves e Peças: Guia Completo de Regulamentação ANAC", "excerpt": "Guia completo sobre importação de aeronaves, helicópteros e peças de manutenção: certificação ANAC, categoria experimental, tributação, Registro Aeronáutico Brasileiro (RAB) e despacho aduaneiro especial.", "readTime": 15, "tags": ["Importação", "Aeronaves", "ANAC", "Aviação", "Tributação"]},
    {"slug": "importacao-veiculos-antigos-classicos-colecao", "title": "Importação de Veículos Antigos e Clássicos: Guia do Colecionador", "excerpt": "Guia definitivo para importar veículos antigos e clássicos no Brasil: regras do DENATRAN, categoria de coleção, tributação reduzida, documentação de origem, anos de fabricação aceitos e custos totais do processo.", "readTime": 14, "tags": ["Importação", "Veículos Antigos", "Carros Clássicos", "DENATRAN", "Colecionador"]},
    {"slug": "importacao-produtos-luxo-relogios-joias", "title": "Importação de Produtos de Luxo: Relógios, Joias, Bolsas e Acessórios", "excerpt": "Guia completo para importar produtos de luxo no Brasil: classificação NCM de relógios, joias e acessórios, tributação elevada, regimes especiais, certificações de autenticidade e canais de venda no mercado brasileiro.", "readTime": 13, "tags": ["Importação", "Produtos de Luxo", "Joias", "Relógios", "Tributação"]},
    {"slug": "importacao-armas-municoes-regras-autorizacao", "title": "Importação de Armas e Munições: Regras, Licenças e Tributação", "excerpt": "Guia completo sobre importação de armas de fogo, munições e acessórios: licenciamento no Exército (Sigma), classificação NCM, documentação SIGMA, medidas de segurança, tributos e regras para pessoa física e jurídica.", "readTime": 15, "tags": ["Importação", "Armas", "Munições", "Exército", "Licenciamento"]},

    # ── Batch 2: Exportação e Serviços ──
    {"slug": "exportacao-servicos-educacionais-consultoria", "title": "Exportação de Serviços Educacionais: Cursos, Treinamentos e Consultoria Internacional", "excerpt": "Guia completo para exportar serviços educacionais brasileiros: cursos online presenciais, treinamentos corporativos e consultoria internacional para pessoas físicas e jurídicas no exterior com suporte legal.", "readTime": 14, "tags": ["Exportação", "Serviços", "Educação", "Consultoria", "Comércio Exterior"]},
    {"slug": "exportacao-servicos-medicos-saude-turismo", "title": "Exportação de Serviços Médicos e Turismo de Saúde: Guia Regulatório", "excerpt": "Guia completo para exportar serviços médicos e atrair turismo de saúde para o Brasil: regulamentação da ANVISA, convênios internacionais, procedimentos estéticos, transplantes e cirurgias eletivas.", "readTime": 14, "tags": ["Exportação", "Serviços Médicos", "Turismo de Saúde", "ANVISA", "Comércio Exterior"]},
    {"slug": "exportacao-alimentos-processados-certificacoes", "title": "Exportação de Alimentos Processados: Certificações, Mercados e Oportunidades", "excerpt": "Guia completo para exportar alimentos processados brasileiros: certificações internacionais (FDA, EU Organic, BRC, IFS), requisitos do MAPA, barreiras sanitárias, validade comercial e logística cold chain.", "readTime": 15, "tags": ["Exportação", "Alimentos Processados", "Certificações", "MAPA", "Mercados Internacionais"]},
    {"slug": "exportacao-agricultura-familiar-cooperativas", "title": "Exportação para Agricultura Familiar e Cooperativas: Oportunidades e Programas de Apoio", "excerpt": "Guia completo para agricultores familiares e cooperativas brasileiras exportarem: programas do MDA, Sebrae e MAPA, certificação orgânica, Selo Nacional da Agricultura Familiar, financiamento Pronaf e logística compartilhada.", "readTime": 14, "tags": ["Exportação", "Agricultura Familiar", "Cooperativas", "Agronegócio", "Programas de Apoio"]},
    {"slug": "exportacao-produtos-artesanais-brasil", "title": "Exportação de Produtos Artesanais Brasileiros: Caminhos e Desafios", "excerpt": "Guia completo para exportar artesanato brasileiro: certificação de origem, Programa do Artesanato Brasileiro, feiras internacionais, classificação NCM, barreiras fitossanitárias para peças naturais e estratégias de precificação.", "readTime": 13, "tags": ["Exportação", "Artesanato", "Cultura", "Pequenos Produtores", "Comércio Exterior"]},
    {"slug": "exportacao-produtos-reciclados-sustentaveis", "title": "Exportação de Produtos Reciclados e Sustentáveis: Regras e Mercados", "excerpt": "Guia completo para exportar materiais reciclados e produtos sustentáveis: licenciamento ambiental, classificação NCM de resíduos, regras IBAMA, certificações de conteúdo reciclado e mercados compradores internacionais.", "readTime": 14, "tags": ["Exportação", "Reciclagem", "Sustentabilidade", "IBAMA", "Economia Circular"]},

    # ── Batch 3: Gestão Estratégica ──
    {"slug": "controladoria-gestao-custos-resultados-comex", "title": "Controladoria para Comércio Exterior: Gestão de Custos e Resultados", "excerpt": "Guia completo de controladoria aplicada ao comércio exterior: indicadores de desempenho para importação e exportação, formação de custos completos, margem líquida internacional, análise de rentabilidade por produto e mercado.", "readTime": 15, "tags": ["Controladoria", "Gestão", "Custos", "Planejamento Financeiro", "Comércio Exterior"]},
    {"slug": "auditoria-aduaneira-interna-gestao-riscos", "title": "Auditoria Aduaneira Interna: Como Preparar sua Empresa e Evitar Multas", "excerpt": "Guia completo de auditoria aduaneira interna para importadores e exportadores: procedimentos de compliance, verificação de classificação NCM, valuation aduaneiro, conferência de drawdown e preparação para fiscalização da Receita Federal.", "readTime": 15, "tags": ["Auditoria", "Compliance", "Aduana", "Gestão de Riscos", "Fiscalização"]},
    {"slug": "reducao-custos-operacionais-comex-estrategias", "title": "Redução de Custos Operacionais no Comércio Exterior: 15 Estratégias Práticas", "excerpt": "Guia com 15 estratégias práticas para reduzir custos operacionais em importação e exportação: otimização tributária, escolha de incoterm, consolidação de carga, drawback e negociação de frete. Exemplos reais com economia comprovada.", "readTime": 14, "tags": ["Custos", "Operações", "Estratégia", "Otimização", "Comércio Exterior"]},
    {"slug": "terceirizacao-importacao-exportacao-trading", "title": "Terceirização de Importação e Exportação: Quando Contratar uma Trading Company", "excerpt": "Guia completo sobre terceirização de operações de comércio exterior: trading company vs comercial exportadora, vantagens da terceirização, custos envolvidos, due diligence na escolha do parceiro e modelos de contrato.", "readTime": 14, "tags": ["Terceirização", "Trading Company", "Importação", "Exportação", "Gestão"]},
    {"slug": "gestao-estoques-importacao-reposicao-curva-abc", "title": "Gestão de Estoques na Importação: Ponto de Reposição, Curva ABC e Estoques de Segurança", "excerpt": "Guia completo de gestão de estoques para importadores: cálculo de ponto de reposição considerando lead time internacional, Curva ABC aplicada a produtos importados, estoque de segurança contra atrasos e giro de estoque ideal.", "readTime": 15, "tags": ["Gestão de Estoques", "Importação", "Logística", "Planejamento", "Suprimentos"]},
    {"slug": "planejamento-tributario-estrategias-globais-comex", "title": "Planejamento Tributário Internacional: Estratégias Globais para Importadores e Exportadores", "excerpt": "Guia completo de planejamento tributário internacional no comércio exterior: regimes aduaneiros especiais, acordos de bitributação, preços de transferência, holding internacional, ZPE e estratégias legais de redução da carga tributária.", "readTime": 16, "tags": ["Planejamento Tributário", "Tributação", "Internacional", "Estratégia", "Compliance"]},

    # ── Batch 4: Tecnologia e Inovação ──
    {"slug": "marketing-conteudo-comex-exportadores-internacional", "title": "Marketing de Conteúdo para Exportadores: Como Atrair Clientes Internacionais", "excerpt": "Guia completo de marketing de conteúdo para exportadores brasileiros: SEO internacional, blog multilingue, LinkedIn para prospecção B2B, estudos de caso, webinars e como usar o analytics para atrair compradores do exterior.", "readTime": 14, "tags": ["Marketing de Conteúdo", "Exportação", "Marketing Digital", "SEO", "Vendas B2B"]},
    {"slug": "inteligencia-artificial-aplicada-comex-pratica", "title": "Inteligência Artificial no Comércio Exterior: Ferramentas e Casos de Uso Práticos", "excerpt": "Guia completo sobre aplicações de IA no comércio exterior: classificação NCM automática, previsão de demanda, análise de risco cambial, chatbots para despachantes, otimização de rotas logísticas e trade intelligence com machine learning.", "readTime": 15, "tags": ["Inteligência Artificial", "Tecnologia", "Inovação", "Automação", "Comércio Exterior"]},
    {"slug": "robotica-automacao-industrial-importacao-maquinas", "title": "Importação de Robôs e Máquinas de Automação Industrial: Guia Completo", "excerpt": "Guia completo para importar robôs industriais e máquinas de automação: classificação NCM dos capítulos 84 e 85, EX-tarifário para bens de capital, certificações de segurança, fornecedores globais e custos totais de importação.", "readTime": 15, "tags": ["Importação", "Robótica", "Automação Industrial", "EX-Tarifário", "Indústria 4.0"]},
    {"slug": "automacao-processos-rpa-comex-avancado", "title": "Automação de Processos com RPA no Comércio Exterior: Guia Tecnológico", "excerpt": "Guia completo de automação robótica de processos RPA aplicada ao comércio exterior: bots para Siscomex, emissão de DU-E e DI, conferência de documentos, monitoramento de parametrização aduaneira e cálculo automático de tributos.", "readTime": 14, "tags": ["RPA", "Automação", "Tecnologia", "Siscomex", "Inovação"]},
    {"slug": "plataformas-digitais-b2b-alibaba-tradekey-globalsources", "title": "Plataformas Digitais B2B para Exportação: Guia de Marketplaces Globais", "excerpt": "Guia completo dos principais marketplaces B2B globais para exportadores brasileiros: Alibaba, TradeKey, Global Sources, Made-in-China e EC21. Estratégias de cadastro, anúncio, negociação e logística integrada para cada plataforma.", "readTime": 15, "tags": ["Marketplaces", "B2B", "Exportação", "Alibaba", "Plataformas Digitais"]},
    {"slug": "api-integracao-sistemas-siscomex-gestao", "title": "APIs e Integração de Sistemas no Comércio Exterior: Guia para Conectar seu ERP ao Siscomex", "excerpt": "Guia completo sobre APIs e integração de sistemas no comércio exterior: conexão entre ERPs e o Siscomex, webservices da Receita Federal, integração com trading companies, logtechs e plataformas de trade finance.", "readTime": 15, "tags": ["APIs", "Integração", "ERP", "Siscomex", "Tecnologia"]},

    # ── Batch 5: Logística Avançada ──
    {"slug": "logistica-pereciveis-cadeia-frio-transporte-internacional", "title": "Logística de Perecíveis: Transporte Internacional de Alimentos na Cadeia do Frio", "excerpt": "Guia completo de logística cold chain para alimentos perecíveis no comércio exterior: containers reefer, documentação fitossanitária, monitoramento IoT de temperatura, termógrafos, certificações HACCP e prazos de validade internacional.", "readTime": 15, "tags": ["Logística", "Cadeia do Frio", "Perecíveis", "Alimentos", "Cold Chain"]},
    {"slug": "transporte-cargas-perigosas-imdg-iata-regras", "title": "Transporte de Cargas Perigosas: Regras IMDG, IATA e ADR para Importação e Exportação", "excerpt": "Guia completo para transporte de cargas perigosas no comércio exterior: classificação ONU, regras IMDG para marítimo, IATA DGR para aéreo, ADR para rodoviário, documentação MSDS, embalagens certificadas e treinamento obrigatório.", "readTime": 15, "tags": ["Cargas Perigosas", "IMDG", "IATA", "Logística", "Segurança"]},
    {"slug": "seguros-obrigatorios-comex-modalidades-cobertura", "title": "Seguros Obrigatórios no Comércio Exterior: Guia Completo de Modalidades e Coberturas", "excerpt": "Guia completo dos seguros obrigatórios e recomendados para importadores e exportadores: seguro internacional de carga (RCC), seguro de crédito à exportação, seguros obrigatórios por modo de transporte e coberturas adicionais.", "readTime": 14, "tags": ["Seguros", "Comércio Exterior", "Carga", "Risco", "Logística"]},
    {"slug": "praticas-logistica-verde-sustentabilidade-comex", "title": "Práticas de Logística Verde no Comércio Exterior: Guia de Sustentabilidade", "excerpt": "Guia completo sobre logística verde e sustentável no comércio exterior: redução de emissões de CO2, otimização de rotas, embalagens ecológicas, certificações ambientais, carbon footprint cálculo e relatórios ESG na supply chain internacional.", "readTime": 14, "tags": ["Logística Verde", "Sustentabilidade", "ESG", "Meio Ambiente", "Transporte"]},
    {"slug": "documentacao-embarque-erros-correcao-consequencias", "title": "Erros na Documentação de Embarque: Consequências e Como Corrigir sem Prejuízos", "excerpt": "Guia completo sobre os erros mais comuns na documentação de embarque internacional: conhecimento marítimo BL, fatura comercial, packing list e certificados de origem. Consequências legais e financeiras e procedimentos de correção.", "readTime": 14, "tags": ["Documentação", "Embarque", "Erros", "Correção", "Logística"]},
    {"slug": "carga-solta-conteinerizada-diferencas-quando-usar", "title": "Carga Solta vs Conteinerizada: Diferenças e Quando Usar Cada Modalidade", "excerpt": "Guia completo comparando carga solta LCL e carga conteinerizada FCL no comércio exterior: vantagens e desvantagens de cada modal, custos comparativos por volume, quando escolher LCL vs FCL, unitização e dicas de consolidação.", "readTime": 13, "tags": ["Carga Solta", "LCL", "FCL", "Conteinerização", "Logística"]},
]

def build_meta_entry(p):
    tags_str = ", ".join(f'"{t}"' for t in p["tags"])
    return f'  {{ slug: "{p["slug"]}", title: "{p["title"]}", excerpt: "{p["excerpt"]}", date: "{DATE}", readTime: {p["readTime"]}, tags: [{tags_str}] }},'

def build_prerender_entry(p):
    return f'  {{ slug: "{p["slug"]}", name: "{p["title"]}", desc: "{p["excerpt"]}" }},'

def insert_before_line(lines, marker):
    for i in range(len(lines) - 1, -1, -1):
        if lines[i].strip() == marker:
            return i
    raise ValueError(f"Marker '{marker}' not found in file")

def insert_before_map(lines):
    """Find }; that closes the map object (near getPostContent)."""
    for i in range(len(lines) - 1, -1, -1):
        if lines[i].strip() == "};":
            # Verify proximity to getPostContent
            for j in range(i + 1, min(i + 4, len(lines))):
                if "export async function getPostContent" in lines[j]:
                    return i
    raise ValueError("Could not find map }; near getPostContent")

# Step 1: postMeta.ts
meta_path = os.path.join(BASE, "src/data/blog/postMeta.ts")
with open(meta_path) as f:
    meta_lines = f.readlines()
pos = insert_before_line(meta_lines, "];")
entries = [build_meta_entry(p) for p in NEW_POSTS]
for j, entry in enumerate(entries):
    meta_lines.insert(pos + j, entry + "\n")
with open(meta_path, "w") as f:
    f.writelines(meta_lines)
print(f"✅ postMeta.ts: {len(NEW_POSTS)} entries inserted")

# Step 2: postContentMap.ts
map_path = os.path.join(BASE, "src/data/blog/postContentMap.ts")
with open(map_path) as f:
    map_lines = f.readlines()
close_map = insert_before_map(map_lines)
map_entries = [f'  "{p["slug"]}": () => import("./content/{p["slug"]}"),' for p in NEW_POSTS]
for j, entry in enumerate(map_entries):
    map_lines.insert(close_map + j, entry + "\n")
with open(map_path, "w") as f:
    f.writelines(map_lines)
print(f"✅ postContentMap.ts: {len(NEW_POSTS)} entries inserted")

# Step 3: prerender.mjs — BLOG_POSTS (last ];)
pre_path = os.path.join(BASE, "scripts/prerender.mjs")
with open(pre_path) as f:
    pre_lines = f.readlines()
last_close = insert_before_line(pre_lines, "];")
entries = [build_prerender_entry(p) for p in NEW_POSTS]
for j, entry in enumerate(entries):
    pre_lines.insert(last_close + j, entry + "\n")
with open(pre_path, "w") as f:
    f.writelines(pre_lines)
print(f"✅ prerender.mjs: {len(NEW_POSTS)} entries inserted")

print("\n✅ Integration complete! Verify with:")
print("  grep -c 'slug:' src/data/blog/postMeta.ts")
print("  grep -c ': () => import' src/data/blog/postContentMap.ts")
print("  grep -c 'desc:' scripts/prerender.mjs")
