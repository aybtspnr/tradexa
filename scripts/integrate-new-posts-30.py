#!/usr/bin/env python3
"""
Integration script for 30 new blog posts.
Run after ALL batches complete.
Inserts entries into postMeta.ts, postContentMap.ts, and prerender.mjs
using line-specific methods (NOT regex replace) to avoid known bugs.
"""
import os
import re
import sys

BASE = "/home/nuh_tapinar/tmp-build/project-clean"
DATE = "2026-06-26"

# ─── POSTS DATA ────────────────────────────────────────────────────
POSTS = [
    # Cluster A: Países
    {
        "slug": "exportar-para-islandia-pesca-turismo-energia",
        "title": "Exportar para a Islândia: Oportunidades em Pesca, Turismo e Energia Renovável",
        "excerpt": "Guia completo para exportar para a Islândia: pescados e frutos do mar, turismo, energia geotérmica, certificações exigidas, acordos comerciais com o EFTA e como a TRADEXA pode ajudar na prospecção de compradores islandeses.",
        "readTime": 14,
        "tags": ["Exportação", "Islândia", "Pesca", "Energia Renovável", "Europa", "EFTA", "Comércio Exterior"],
        "desc": "Guia completo para exportar para a Islândia: pescados e frutos do mar, turismo, energia geotérmica, certificações, acordos EFTA, logística e análise de mercado com TRADEXA.",
    },
    {
        "slug": "exportar-para-libia-reconstrucao-oportunidades",
        "title": "Exportar para a Líbia: Oportunidades na Reconstrução e Infraestrutura",
        "excerpt": "Guia sobre exportação para a Líbia: oportunidades em reconstrução, infraestrutura, petróleo e gás, certificações halal, logística no norte da África e como empresas brasileiras podem aproveitar o mercado líbio.",
        "readTime": 13,
        "tags": ["Exportação", "Líbia", "África", "Petróleo e Gás", "Reconstrução", "Infraestrutura", "Comércio Exterior"],
        "desc": "Guia de exportação para a Líbia: oportunidades em reconstrução, infraestrutura, petróleo e gás, certificações halal, logística norte-africana e estratégias de entrada para empresas brasileiras.",
    },
    {
        "slug": "exportar-para-laos-agricultura-hidreletricas",
        "title": "Exportar para Laos: Agricultura, Turismo e Hidrelétricas no Sudeste Asiático",
        "excerpt": "Guia completo para exportar para o Laos: agricultura, geração de energia hidrelétrica, turismo, relações com a ASEAN, logística no Mekong e oportunidades para máquinas, alimentos e tecnologia brasileira.",
        "readTime": 13,
        "tags": ["Exportação", "Laos", "Sudeste Asiático", "Agricultura", "ASEAN", "Energia", "Comércio Exterior"],
        "desc": "Guia para exportar para o Laos: agricultura, energia hidrelétrica, turismo, relações ASEAN, logística fluvial no Mekong e oportunidades para máquinas e tecnologia agrícola brasileira.",
    },
    {
        "slug": "exportar-para-brunei-petroleo-gas-oportunidades",
        "title": "Exportar para Brunei: Petróleo, Gás e Oportunidades Estratégicas no Bornéu",
        "excerpt": "Guia completo de exportação para Brunei: economia baseada em petróleo e gás, oportunidades em infraestrutura, alimentos halal, comércio com a ASEAN, logística no Bornéu e como utilizar a TRADEXA para encontrar compradores.",
        "readTime": 13,
        "tags": ["Exportação", "Brunei", "Sudeste Asiático", "Petróleo e Gás", "ASEAN", "Halal", "Comércio Exterior"],
        "desc": "Guia de exportação para Brunei Darussalam: petróleo e gás, alimentos halal, infraestrutura, comércio ASEAN, logística no Bornéu e estratégias para empresas brasileiras no sudeste asiático.",
    },
    {
        "slug": "exportar-para-macau-turismo-jogos-financas",
        "title": "Exportar para Macau: Turismo, Jogos e Serviços Financeiros na Ásia",
        "excerpt": "Guia completo sobre exportação para Macau: economia do turismo e jogos, centro financeiro asiático, oportunidades para alimentos, bebidas, construção e como a plataforma TRADEXA auxilia na prospecção de mercados na RAEM.",
        "readTime": 13,
        "tags": ["Exportação", "Macau", "Ásia", "Turismo", "Finanças", "Alimentos", "Comércio Exterior"],
        "desc": "Guia de exportação para Macau: turismo e jogos, centro financeiro, oportunidades para alimentos, bebidas, construção, logística chinesa e estratégias de prospecção com inteligência TRADEXA.",
    },
    # Cluster B: Financiamento, Câmbio e Pagamentos
    {
        "slug": "alibaba-com-exportadores-guia-vendas-b2b",
        "title": "Alibaba.com para Exportadores Brasileiros: Guia Completo de Vendas B2B",
        "excerpt": "Guia prático para exportadores brasileiros venderem no Alibaba.com: criação de perfil, otimização de produtos, negociação com compradores chineses, meios de pagamento, Trade Assurance e como integrar com a inteligência de mercado TRADEXA.",
        "readTime": 14,
        "tags": ["Exportação", "Alibaba", "E-commerce", "Vendas B2B", "China", "Marketing Digital", "Comércio Exterior"],
        "desc": "Guia para exportadores brasileiros venderem no Alibaba.com: criação de perfil, otimização de produtos, negociação, Trade Assurance, meios de pagamento e integração com a plataforma TRADEXA.",
    },
    {
        "slug": "carta-credito-letter-credit-guia-completo",
        "title": "Carta de Crédito (Letter of Credit): Guia Completo para Importação e Exportação",
        "excerpt": "Guia completo sobre carta de crédito no comércio exterior: tipos de LC (à vista, diferida, confirmada), documentos exigidos, checklists por modalidade, custos, prazos, riscos e como usar a TRADEXA para validar contrapartes.",
        "readTime": 15,
        "tags": ["Carta de Crédito", "Letter of Credit", "Pagamentos", "Financiamento", "Bancos", "Importação", "Exportação", "Comércio Exterior"],
        "desc": "Guia completo sobre carta de crédito no comércio exterior: tipos de LC, documentos, checklists, custos, prazos, riscos e validação de contrapartes com a plataforma TRADEXA.",
    },
    {
        "slug": "acc-ace-adiantamento-contrato-cambio-exportacao",
        "title": "ACC e ACE: Adiantamento de Contrato de Câmbio na Exportação Passo a Passo",
        "excerpt": "Guia completo sobre ACC (Adiantamento de Contrato de Câmbio) e ACE (Adiantamento de Cambiais Entregues): como funcionam, diferenças, linhas de crédito, custos, fluxo documental e como financiar sua exportação com esses instrumentos.",
        "readTime": 13,
        "tags": ["ACC", "ACE", "Câmbio", "Financiamento", "Exportação", "Bancos", "Contrato de Câmbio", "Comércio Exterior"],
        "desc": "Guia completo sobre ACC e ACE na exportação: como funcionam, diferenças, linhas de crédito, custos, fluxo documental e financiamento de operações de comércio exterior.",
    },
    {
        "slug": "swap-cambial-hedge-protecao-dolar-exportacao",
        "title": "Swap Cambial e Hedge: Como se Proteger da Variação do Dólar no Comex",
        "excerpt": "Guia prático sobre swap cambial e hedge no comércio exterior para proteger sua empresa contra a volatilidade do câmbio: NDF, swap cambial tradicional, operações com opções, custos e estratégias para importadores e exportadores.",
        "readTime": 14,
        "tags": ["Swap Cambial", "Hedge", "Câmbio", "Derivativos", "Proteção Cambial", "NDF", "Finanças", "Comércio Exterior"],
        "desc": "Guia sobre swap cambial e hedge no comércio exterior: proteção contra volatilidade cambial, NDF, opções, custos e estratégias para importadores e exportadores brasileiros.",
    },
    {
        "slug": "precos-transferencia-operacoes-comex-compliance",
        "title": "Preços de Transferência no Comércio Exterior: Guia de Compliance 2026",
        "excerpt": "Guia completo sobre preços de transferência nas operações de comércio exterior com partes relacionadas: métodos PIC, PRL, CPL, documentação obrigatória, multas e como a TRADEXA auxilia no compliance fiscal internacional.",
        "readTime": 14,
        "tags": ["Preços de Transferência", "Transfer Pricing", "Tributação", "Compliance", "Partes Relacionadas", "Receita Federal", "Comércio Exterior"],
        "desc": "Guia completo sobre preços de transferência no comex: métodos PIC, PRL, CPL, documentação obrigatória, multas e compliance fiscal internacional com a plataforma TRADEXA.",
    },
    # Cluster C: Logística Especializada
    {
        "slug": "seguro-internacional-carga-maritima-cobertura",
        "title": "Seguro Internacional de Cargas Marítimas: Tipos, Cobertura e Contratação",
        "excerpt": "Guia completo sobre seguro internacional de cargas marítimas: coberturas básicas e adicionais, apólice do Instituto de Londres A B C, franquias, prêmios, procedimentos em caso de avaria e como contratar o seguro ideal para sua carga.",
        "readTime": 14,
        "tags": ["Seguro", "Carga Marítima", "Logística", "Transporte Marítimo", "Avaria", "Riscos", "Comércio Exterior"],
        "desc": "Guia sobre seguro internacional de cargas marítimas: coberturas A-B-C, franquias, prêmios, procedimentos de avaria e contratação do seguro ideal para importação e exportação.",
    },
    {
        "slug": "transporte-aereo-cargas-internacionais-guia",
        "title": "Transporte Aéreo de Cargas Internacionais: Guia Completo para Importadores",
        "excerpt": "Guia completo sobre transporte aéreo de cargas internacionais: tipos de carga (general, perecível, perigosa, valiosa), documentação AWB, custos por kg, restrições IATA-DGR, tempos de trânsito e como escolher entre aéreo e marítimo.",
        "readTime": 14,
        "tags": ["Transporte Aéreo", "Carga Aérea", "IATA", "AWB", "Logística", "Importação", "Exportação", "Comércio Exterior"],
        "desc": "Guia sobre transporte aéreo de cargas internacionais: tipos de carga, AWB, custos por kg, restrições IATA-DGR, prazos e como escolher entre modal aéreo e marítimo para sua operação.",
    },
    {
        "slug": "portos-secos-eadi-armazenagem-alfandegada",
        "title": "Portos Secos e EADI: Armazenagem Alfandegada no Interior do Brasil",
        "excerpt": "Guia completo sobre portos secos e EADI no Brasil: funcionamento, vantagens fiscais e logísticas, serviços oferecidos, diferenças entre EADI privada e pública, localizações estratégicas e como reduzir custos com armazenagem alfandegada.",
        "readTime": 14,
        "tags": ["Portos Secos", "EADI", "Armazenagem Alfandegada", "Logística", "Recintos Alfandegados", "Despacho Aduaneiro", "Comércio Exterior"],
        "desc": "Guia sobre portos secos e EADI no Brasil: funcionamento, vantagens fiscais e logísticas, serviços, localizações estratégicas e redução de custos com armazenagem alfandegada interiorizada.",
    },
    {
        "slug": "courier-remessas-expressas-internacionais-guia",
        "title": "Couriers e Remessas Expressas Internacionais: Guia Prático para Empresas",
        "excerpt": "Guia prático sobre courier internacional e remessas expressas para empresas: DHL, FedEx, UPS, TNT, diferenças para frete marítimo e aéreo convencional, tributação em courier, prazos e quando cada modalidade compensa.",
        "readTime": 13,
        "tags": ["Courier", "Remessas Expressas", "DHL", "FedEx", "Logística", "Transporte", "E-commerce", "Comércio Exterior"],
        "desc": "Guia prático sobre courier internacional para empresas: DHL, FedEx, UPS, diferenças para fretes convencionais, tributação em courier, prazos e quando compensa cada modalidade.",
    },
    {
        "slug": "logistica-reversa-internacional-devolucoes-recalls",
        "title": "Logística Reversa Internacional: Devoluções, Recalls e Sustentabilidade",
        "excerpt": "Guia completo sobre logística reversa internacional para exportadores: processos de devolução, recall de produtos, barreiras alfandegárias para retorno, custos de reverse logistics, acordos de assistência técnica e integração com ESG.",
        "readTime": 14,
        "tags": ["Logística Reversa", "Recalls", "Devoluções", "Sustentabilidade", "ESG", "Exportação", "Assistência Técnica", "Comércio Exterior"],
        "desc": "Guia sobre logística reversa internacional: processos de devolução, recall de produtos, barreiras alfandegárias para retorno, custos de reverse logistics e integração com práticas ESG.",
    },
    # Cluster D: Setores Específicos
    {
        "slug": "exportacao-papel-celulose-mercado-internacional",
        "title": "Exportação de Papel e Celulose: Mercados e Oportunidades",
        "excerpt": "Guia completo sobre exportação de papel e celulose do Brasil: principais empresas do setor, classificação NCM Capítulo 47 e 48, certificações FSC e CERFLOR, mercados compradores, logística portuária e tendências de preço.",
        "readTime": 13,
        "tags": ["Papel e Celulose", "Exportação", "FSC", "CERFLOR", "NCM", "Sustentabilidade", "Agronegócio", "Comércio Exterior"],
        "desc": "Guia sobre exportação de papel e celulose do Brasil: principais players, classificação NCM 47/48, certificações FSC, mercados compradores, logística portuária e tendências globais.",
    },
    {
        "slug": "exportacao-ferro-aco-siderurgia-mercados-ncm",
        "title": "Exportação de Ferro e Aço: Mercados, NCM e Regulamentação",
        "excerpt": "Guia completo para exportação de ferro-gusa, aço e derivados siderúrgicos: classificação NCM Capítulo 72 e 73, certificações, mercados compradores, barreiras comerciais (antidumping), logística e vantagens competitivas do aço brasileiro.",
        "readTime": 14,
        "tags": ["Siderurgia", "Ferro e Aço", "Exportação", "NCM", "Mineração", "Antidumping", "Industrial", "Comércio Exterior"],
        "desc": "Guia completo para exportação de ferro e aço: classificação NCM 72/73, certificações, mercados, barreiras antidumping, logística e vantagens competitivas da siderurgia brasileira.",
    },
    {
        "slug": "cervejas-artesanais-brasileiras-exportacao-mercado",
        "title": "Cervejas Artesanais Brasileiras: Como Exportar para o Mundo",
        "excerpt": "Guia para exportação de cervejas artesanais brasileiras: classificação NCM 2203, certificações, registros MAPA, tributação PIS/COFINS, mercado internacional de craft beer, logística e estratégias de posicionamento de marca global.",
        "readTime": 13,
        "tags": ["Cerveja Artesanal", "Bebidas", "Exportação", "MAPA", "NCM", "Craft Beer", "Marketing", "Comércio Exterior"],
        "desc": "Guia para exportar cervejas artesanais brasileiras: classificação NCM 2203, certificações MAPA, mercado internacional craft beer, logística e posicionamento de marca global.",
    },
    {
        "slug": "niobio-litio-mineracao-brasileira-nova-economia",
        "title": "Nióbio e Lítio: A Nova Fronteira da Mineração Brasileira nas Exportações",
        "excerpt": "Guia completo sobre exportação de nióbio e lítio do Brasil: classificação NCM, reservas nacionais, principais empresas, mercados compradores, regulação da ANM, benefícios fiscais, logística mineral e impacto na nova economia global.",
        "readTime": 13,
        "tags": ["Nióbio", "Lítio", "Mineração", "Exportação", "ANM", "Tecnologia", "Energia Limpa", "NCM", "Comércio Exterior"],
        "desc": "Guia sobre exportação de nióbio e lítio do Brasil: classificação NCM, reservas, empresas, mercados, regulação ANM e impacto na nova economia global de baterias e tecnologia.",
    },
    {
        "slug": "exportacao-acucar-etanol-mercados-regulamentacao",
        "title": "Exportação de Açúcar e Etanol: Mercados, Regulamentação e Tendências",
        "excerpt": "Guia completo sobre exportação de açúcar e etanol do Brasil: classificação NCM, certificações, mercados compradores, logística portuária, precificação internacional, ICE Futures, barreiras tarifárias e impacto dos biocombustíveis na matriz global.",
        "readTime": 14,
        "tags": ["Açúcar", "Etanol", "Biocombustíveis", "Exportação", "Agronegócio", "NCM", "Commodities", "Energia", "Comércio Exterior"],
        "desc": "Guia sobre exportação de açúcar e etanol do Brasil: classificação NCM, certificações, mercados compradores, logística portuária, precificação ICE Futures e tendências globais de biocombustíveis.",
    },
    # Cluster E: Marketing e Vendas Digitais
    {
        "slug": "amazon-global-selling-vendedores-brasileiros-guia",
        "title": "Amazon Global Selling para Brasileiros: Guia Prático de Vendas no Exterior",
        "excerpt": "Guia completo para vender na Amazon Global Selling: criação de conta, listing de produtos, logística FBA, tributação de exportação via marketplace, adequação de produtos, precificação em dólar e estratégias para vender nos EUA, Europa e Ásia.",
        "readTime": 14,
        "tags": ["Amazon", "Global Selling", "E-commerce", "Marketplace", "Exportação", "Logística FBA", "Marketing Digital", "Comércio Exterior"],
        "desc": "Guia para vender na Amazon Global Selling: criação de conta, FBA, tributação, adequação de produtos, precificação em dólar e estratégias para vender nos EUA, Europa e Ásia.",
    },
    {
        "slug": "tiktok-instagram-marketing-visual-exportacao",
        "title": "TikTok e Instagram para Exportar: Marketing Visual Internacional",
        "excerpt": "Guia prático de marketing visual internacional para exportadores: como usar TikTok e Instagram para prospecção B2B, conteúdo em inglês, estratégias de alcance internacional, anúncios segmentados por país e cases de sucesso brasileiros.",
        "readTime": 13,
        "tags": ["Marketing Digital", "TikTok", "Instagram", "Redes Sociais", "Exportação", "Vendas B2B", "Comércio Exterior"],
        "desc": "Guia de marketing visual internacional: TikTok e Instagram para prospecção B2B, conteúdo em inglês, anúncios segmentados por país e cases de exportadores brasileiros.",
    },
    {
        "slug": "estrategias-precificacao-internacional-precos-exportacao",
        "title": "Precificação Internacional: Como Definir Preços de Exportação",
        "excerpt": "Guia completo sobre estratégias de precificação internacional para exportadores: cálculo do preço base, mark-up, elasticidade por mercado, estratégias diferenciadas por país, projeções cambiais, análise de concorrência global e uso de dados TRADEXA.",
        "readTime": 14,
        "tags": ["Precificação", "Pricing", "Exportação", "Estratégia", "Margem", "Câmbio", "Inteligência de Mercado", "Comércio Exterior"],
        "desc": "Guia sobre estratégias de precificação internacional: cálculo do preço base, mark-up, elasticidade por mercado, projeções cambiais e análise de concorrência com dados TRADEXA.",
    },
    {
        "slug": "linkedin-prospeccao-internacional-vendas-b2b",
        "title": "LinkedIn para Vendas B2B Internacionais: Guia de Prospecção",
        "excerpt": "Guia completo para usar o LinkedIn na prospecção de compradores internacionais: otimização de perfil exportador, Sales Navigator, estratégias de InMail, conteúdo em inglês para autoridade, warm lead generation e integração com CRM.",
        "readTime": 13,
        "tags": ["LinkedIn", "Prospecção", "Vendas B2B", "Marketing Digital", "Exportação", "Sales Navigator", "Comércio Exterior"],
        "desc": "Guia de LinkedIn para prospecção internacional B2B: Sales Navigator, InMail, otimização de perfil exportador, conteúdo em inglês e warm lead generation para compradores globais.",
    },
    # Cluster F: Compliance e Legal
    {
        "slug": "acordos-evitar-dupla-tributacao-comercio-exterior",
        "title": "Acordos para Evitar a Dupla Tributação no Comércio Exterior",
        "excerpt": "Guia completo sobre acordos de bitributação no comércio exterior: países com acordo com o Brasil, alíquotas de IRRF reduzidas, procedimentos para usufruir dos benefícios, documentação CED e CERT, treaty shopping e planejamento tributário internacional.",
        "readTime": 14,
        "tags": ["Bitributação", "Dupla Tributação", "Acordos Fiscais", "Tributação", "Planejamento Tributário", "Receita Federal", "Exportação", "Comércio Exterior"],
        "desc": "Guia sobre acordos para evitar dupla tributação no comércio exterior: países signatários, alíquotas reduzidas, CED/CERT, treaty shopping e planejamento tributário internacional.",
    },
    {
        "slug": "lgpd-protecao-dados-comercio-exterior-internacional",
        "title": "LGPD no Comércio Exterior: Proteção de Dados em Operações Internacionais",
        "excerpt": "Guia sobre LGPD e proteção de dados no comércio exterior: adequação de contratos internacionais, transferência de dados para o exterior, cláusulas-padrão, cross-border data flows, GDPR comparado, sanções da ANPD e boas práticas para exportadores.",
        "readTime": 14,
        "tags": ["LGPD", "Proteção de Dados", "GDPR", "Compliance", "Contratos", "ANPD", "Importação", "Exportação", "Comércio Exterior"],
        "desc": "Guia sobre LGPD no comércio exterior: adequação de contratos internacionais, transferência de dados, GDPR comparado, sanções da ANPD e boas práticas para exportadores brasileiros.",
    },
    {
        "slug": "prevencao-lavagem-dinheiro-compliance-importacao-exportacao",
        "title": "Prevenção à Lavagem de Dinheiro no Comércio Exterior",
        "excerpt": "Guia completo sobre prevenção à lavagem de dinheiro no comércio exterior: PLD/FTP, due diligence de contrapartes, KYC, operações suspeitas, obrigações legais, Coaf, multas, compliance program e como a TRADEXA auxilia na verificação de parceiros comerciais.",
        "readTime": 14,
        "tags": ["Lavagem de Dinheiro", "PLD", "Compliance", "KYC", "Due Diligence", "COAF", "Importação", "Exportação", "Comércio Exterior"],
        "desc": "Guia sobre prevenção à lavagem de dinheiro no comex: PLD/FTP, due diligence, KYC, operações suspeitas, Coaf, compliance program e verificação de parceiros com TRADEXA.",
    },
    {
        "slug": "ciberseguranca-protecao-dados-digitais-comex",
        "title": "Cibersegurança no Comércio Exterior: Proteção Digital para Empresas",
        "excerpt": "Guia completo sobre cibersegurança para empresas de comércio exterior: proteção de dados de transações, phishing em e-mails de importação, segurança em plataformas digitais, boas práticas de TI para exportadores e como prevenir fraudes internacionais.",
        "readTime": 13,
        "tags": ["Cibersegurança", "Segurança Digital", "Fraudes", "Tecnologia", "Proteção de Dados", "Importação", "Exportação", "Comércio Exterior"],
        "desc": "Guia de cibersegurança para empresas de comex: proteção de transações, phishing, segurança em plataformas digitais, boas práticas de TI e prevenção de fraudes internacionais.",
    },
    # Cluster G: Gestão
    {
        "slug": "custo-logistico-total-importacao-calculo-metodologia",
        "title": "Custo Logístico Total na Importação: Metodologia de Cálculo Passo a Passo",
        "excerpt": "Guia completo para calcular o custo logístico total da importação: frete marítimo, seguro, taxas portuárias, armazenagem, desembaraço, capatazia, THC, demurrage, terminal handling e planilha prática para precificação de importados.",
        "readTime": 14,
        "tags": ["Custo Logístico", "Importação", "Frete", "Taxas Portuárias", "Demurrage", "THC", "Capatazia", "Gestão", "Comércio Exterior"],
        "desc": "Guia para calcular o custo logístico total da importação: frete, seguro, taxas portuárias, demurrage, capatazia, THC e planilha prática completa para precificação de produtos importados.",
    },
    {
        "slug": "analise-viabilidade-importacao-planilha-metodologia",
        "title": "Análise de Viabilidade de Importação: Guia com Planilha Prática",
        "excerpt": "Guia completo de análise de viabilidade para importação: metodologia DFC, cálculo de margem líquida, break-even, projeção de vendas, custos ocultos, tributação total, análise de sensibilidade cambial e planilha prática para tomada de decisão.",
        "readTime": 14,
        "tags": ["Viabilidade", "Importação", "Planilha", "Gestão", "Margem", "Câmbio", "Tributação", "Análise Financeira", "Comércio Exterior"],
        "desc": "Guia de análise de viabilidade de importação: metodologia DFC, margem líquida, break-even, custos ocultos, análise de sensibilidade cambial e planilha prática para tomada de decisão.",
    },
]

def main():
    print("=== Integration Script for 30 Posts ===\n")

    # ─── 1. INTEGRATE postMeta.ts ─────────────────────────────────────
    meta_path = f"{BASE}/src/data/blog/postMeta.ts"
    with open(meta_path, "r") as f:
        meta_lines = f.readlines()

    # Find the ]; closing the blogPostsMeta array (line-based)
    close_pos = None
    for i in range(len(meta_lines) - 1, -1, -1):
        if meta_lines[i].strip() == "];":
            close_pos = i
            break

    if close_pos is None:
        print("ERROR: Could not find ]; in postMeta.ts")
        sys.exit(1)

    meta_entries = []
    for p in POSTS:
        tags_str = ", ".join(f'"{t}"' for t in p["tags"])
        entry = f'  {{ slug: "{p["slug"]}", title: "{p["title"]}", excerpt: "{p["excerpt"]}", date: "{DATE}", readTime: {p["readTime"]}, tags: [{tags_str}] }},'
        meta_entries.append(entry)

    # Insert before the closing ];
    for j, entry in enumerate(meta_entries):
        meta_lines.insert(close_pos + j, entry + "\n")

    with open(meta_path, "w") as f:
        f.writelines(meta_lines)
    print(f"✅ postMeta.ts: {len(POSTS)} entries inserted (total: {close_pos + len(POSTS)})")

    # ─── 2. INTEGRATE postContentMap.ts ───────────────────────────────
    map_path = f"{BASE}/src/data/blog/postContentMap.ts"
    with open(map_path, "r") as f:
        map_lines = f.readlines()

    # Find the }; that closes the map object (before getPostContent)
    close_map = None
    for i in range(len(map_lines) - 1, -1, -1):
        if map_lines[i].strip() == "};":
            # Verify this is the map's }; by checking for getPostContent nearby
            for j in range(i + 1, min(i + 4, len(map_lines))):
                if "export async function getPostContent" in map_lines[j]:
                    close_map = i
                    break
            if close_map is not None:
                break

    if close_map is None:
        print("ERROR: Could not find map }; in postContentMap.ts")
        sys.exit(1)

    map_entries = []
    for p in POSTS:
        map_entries.append(f'  "{p["slug"]}": () => import("./content/{p["slug"]}"),')

    for j, entry in enumerate(map_entries):
        map_lines.insert(close_map + j, entry + "\n")

    with open(map_path, "w") as f:
        f.writelines(map_lines)
    print(f"✅ postContentMap.ts: {len(POSTS)} entries inserted")

    # ─── 3. INTEGRATE prerender.mjs ───────────────────────────────────
    prerender_path = f"{BASE}/scripts/prerender.mjs"
    with open(prerender_path, "r") as f:
        pre_lines = f.readlines()

    # The last ]; in the file is always BLOG_POSTS closing
    pre_close = None
    for i in range(len(pre_lines) - 1, -1, -1):
        if pre_lines[i].strip() == "];":
            pre_close = i
            break

    if pre_close is None:
        print("ERROR: Could not find ]; in prerender.mjs")
        sys.exit(1)

    prerender_entries = []
    for p in POSTS:
        safe_name = p["title"]
        safe_desc = p["desc"]
        entry = f'  {{ slug: "{p["slug"]}", name: "{safe_name}", desc: "{safe_desc}" }},'
        prerender_entries.append(entry)

    for j, entry in enumerate(prerender_entries):
        pre_lines.insert(pre_close + j, entry + "\n")

    with open(prerender_path, "w") as f:
        f.writelines(pre_lines)
    print(f"✅ prerender.mjs: {len(POSTS)} entries inserted")

    # ─── VERIFICATION ─────────────────────────────────────────────────
    print("\n=== VERIFICATION ===")
    print(f"postMeta entries:  {grep_count(meta_path, 'slug:')}")
    print(f"content files:     {len(os.listdir(f'{BASE}/src/data/blog/content/'))}")
    print(f"contentMap entries: {grep_count(map_path, ': () => import')}")
    print(f"prerender entries: {count_prerender(prerender_path)}")

    # Check no content field in postMeta
    with open(meta_path) as f:
        if "content:.*import" in f.read():
            print("❌ WARNING: content field with import found in postMeta!")
        else:
            print("✅ No content fields in postMeta (code-split format)")

    # Check getPostContent preserved
    if "export async function getPostContent" in open(map_path).read():
        print("✅ getPostContent preserved in contentMap")
    else:
        print("❌ CRITICAL: getPostContent missing from contentMap!")

    print("\nDone!")

def grep_count(path, pattern):
    import re
    count = 0
    with open(path) as f:
        for line in f:
            if re.search(pattern, line):
                count += 1
    return count

def count_prerender(path):
    with open(path) as f:
        lines = f.readlines()
    in_blog = False
    count = 0
    for line in lines:
        if "const BLOG_POSTS" in line:
            in_blog = True
        if in_blog and "slug:" in line:
            count += 1
        if in_blog and line.strip() == "];":
            in_blog = False
    return count

if __name__ == "__main__":
    main()
