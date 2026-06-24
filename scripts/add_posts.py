#!/usr/bin/env python3
"""Append 10 new blog posts to posts.ts"""
import re

posts_file = "/mnt/d/dyad/TRADEXA-MARKET-INTELLIGENCE/src/data/blog/posts.ts"

new_posts = """  {
    slug: "o-que-e-ncm-significado",
    title:
      "O Que é NCM? Significado, Estrutura e Como Usar",
    excerpt:
      "Entenda o que é NCM (Nomenclatura Comum do Mercosul), como funciona a estrutura do código de 8 dígitos e como classificar produtos corretamente.",
    content: `## O Que Significa NCM?

NCM significa **Nomenclatura Comum do Mercosul**. É o sistema de classificação fiscal de mercadorias adotado pelo Brasil e pelos países do Mercosul.

Todo produto importado ou exportado no Brasil precisa de um código NCM. Esse código determina alíquotas de impostos, regulamentações e benefícios fiscais.

## Estrutura do Código NCM (8 Dígitos)

- **XX** — Capítulo: Ex: 84 — Máquinas
- **XXXX** — Posição: Ex: 8471 — Computadores
- **XXXXXX** — Subposição (= SH): Ex: 847130 — Portáteis
- **XXXXXXXX** — Item NCM: Ex: 84713011 — Notebooks

## Diferença entre NCM, HS e HTS

- **HS** — 6 dígitos, padrão internacional
- **NCM** — 8 dígitos, Brasil e Mercosul
- **HTS** — 8-10 dígitos, Estados Unidos

[Classifique seu produto com IA →](/ai-search)
[Veja a lista completa de NCM →](/landing/lista-ncm)""",
    date: "2026-05-27",
    readTime: 8,
    tags: ["o que é NCM", "significado NCM", "código NCM", "classificação fiscal"],
  },
  {
    slug: "despachante-aduaneiro-quanto-custa",
    title:
      "Despachante Aduaneiro: O Que É, Quanto Custa e Como Contratar",
    excerpt:
      "Saiba o que faz um despachante aduaneiro, quanto cobram por desembaraço e como escolher o profissional certo para sua importação.",
    content: `## O Que é Despachante Aduaneiro?

O despachante aduaneiro é o profissional habilitado pela Receita Federal para representar empresas junto aos órgãos fiscalizadores.

## Quanto Custa?

| Serviço | Faixa de Preço |
|---------|---------------|
| Desembaraço simples | R$ 800 a R$ 1.500 |
| Desembaraço complexo | R$ 1.500 a R$ 3.000 |
| Consultoria aduaneira | R$ 300 a R$ 800/hora |

## Como Escolher?

- Verifique registro na Junta Comercial
- Pça referências de outros importadores
- Compare valores de 2-3 despachantes
- Verifique se atua no seu ramo

[Leia mais sobre desembaraço →](/blog/desembaraco-aduaneiro-como-funciona)""",
    date: "2026-05-27",
    readTime: 10,
    tags: ["despachante aduaneiro", "custo despachante", "desembaraço", "importação"],
  },
  {
    slug: "agente-de-carga-o-que-e",
    title:
      "Agente de Carga: O Que É, Funções e Como Escolher",
    excerpt:
      "Entenda a diferença entre agente de carga e despachante aduaneiro, quanto custa e como o agente facilita sua importação.",
    content: `## O Que é Agente de Carga?

O agente de carga (freight forwarder) organiza todo o transporte internacional da sua mercadoria.

## Diferença para Despachante

| Aspecto | Agente de Carga | Despachante |
|---------|----------------|-------------|
| Foco | Transporte logístico | Documentação aduaneira |
| Responsabilidade | Carga e frete | Desembaraço e tributos |

## Quanto Custa?

- Taxa de intermediação: 10-15% do frete
- Ou valor fixo por container: R$ 300 a R$ 800

[Veja cotações de frete →](/maritime-freight-map)""",
    date: "2026-05-27",
    readTime: 8,
    tags: ["agente de carga", "logística", "importação", "exportação"],
  },
  {
    slug: "como-importar-dos-eua-brasil",
    title:
      "Como Importar dos Estados Unidos para o Brasil em 2026",
    excerpt:
      "Guia completo para importar dos EUA: fornecedores, HTS, tarifas, frete e documentação necessária.",
    content: `## Passo a Passo

### 1. Identifique o Produto e NCM
Classifique no NCM (8 dígitos) e HTS (10 dígitos americanos).

### 2. Encontre Fornecedores
- Alibaba, ThomasNet, Global Sources
- Feiras: NSSF, ASD Market Week

### 3. Calcule Custos Totais
- FOB + frete + seguro + II + IPI + PIS + COFINS + ICMS

### 4. Documentação
- Invoice, Packing List, Bill of Lading, Certificado de Origem

[Compare tarifas Brasil-EUA →](/us-trade)
[Calcule impostos →](/global-tariff)""",
    date: "2026-05-27",
    readTime: 12,
    tags: ["importar dos EUA", "importação americana", "HTS", "comércio Brasil-EUA"],
  },
  {
    slug: "importar-eletronicos-china",
    title:
      "Como Importar Eletrônicos da China para o Brasil",
    excerpt:
      "Guia prático para importar eletrônicos da China: ANATEL, INMETRO, NCM e custos totais.",
    content: `## Regulamentação

- **ANATEL** — Certificação para equipamentos com transmissor
- **INMETRO** — Para produtos de segurança
- **NCM** — Geralmente 8471 ou 8517

## Custos Típicos

- Frete marítimo: R$ 2.000-4.000 por container
- II: 0-16% dependendo do NCM
- ICMS: 18% (SP)

## Dicas

- Use Alibaba Trade Assurance
- Peça amostras antes do pedido grande
- Verifique certificações ANATEL

[Classifique com IA →](/ai-search)
[Compare tarifas →](/global-tariff)""",
    date: "2026-05-27",
    readTime: 12,
    tags: ["importar eletrônicos", "china", "ANATEL", "INMETRO"],
  },
  {
    slug: "carta-de-credito-importacao",
    title:
      "Carta de Crédito na Importação: Como Funciona e Quando Usar",
    excerpt:
      "Entenda como funciona a carta de crédito internacional, quando usar e custos para pagamento de importação.",
    content: `## O Que é Carta de Crédito?

Instrumento financeiro emitido por banco que garante pagamento ao exportador.

## Quando Usar?

- Compra com fornecedor novo
- Valores acima de USD 50.000
- País de risco político

## Custo

- Taxa bancária: 1-3% do valor
- Comissão de confirmação: 0,5-2%

[Documentação completa →](/blog/documentos-importacao-exportacao)""",
    date: "2026-05-27",
    readTime: 10,
    tags: ["carta de crédito", "pagamento internacional", "importação"],
  },
  {
    slug: "importar-roupas-revender-brasil",
    title:
      "Como Importar Roupas para Revender no Brasil",
    excerpt:
      "Guia completo para importar roupas da China, Turquia e Bangladesh: fornecedores, tributos e dicas.",
    content: `## Principais Fornecedores

| País | Especialidade | MOQ |
|------|--------------|-----|
| China | Moda rápida | 100-500 peças |
| Turquia | Moda feminina | 200-1000 peças |
| Bangladesh | Camisetas | 500-2000 peças |

## NCM Típico

- 6109 — Camisetas
- 6204 — Vestuário feminino
- 6205 — Vestuário masculino

[Encontre fornecedores →](/landing/importadores)
[Calcule impostos →](/global-tariff)""",
    date: "2026-05-27",
    readTime: 12,
    tags: ["importar roupas", "moda importada", "revender", "e-commerce"],
  },
  {
    slug: "importar-maquinario-industrial",
    title:
      "Como Importar Maquinário Industrial para o Brasil",
    excerpt:
      "Guia para importar máquinas industriais: ex-tarifário, redução de II e logística.",
    content: `## Por Que Importar Maquinário?

Muitas máquinas não têm similar nacional, permitindo **ex-tarifário** (II de 14% para 2%).

## Ex-Tarifário

- Reduz II de 14% para 2%
- Prazo: 60-90 dias
- Documentação: laudo técnico + catálogo

## Logística

- Cargas pesadas: container flat rack
- Prazo: 30-60 dias

[Consulte tarifas →](/global-tariff)""",
    date: "2026-05-27",
    readTime: 10,
    tags: ["importar maquinário", "equipamentos industriais", "ex-tarifário"],
  },
  {
    slug: "frete-aereo-vs-maritimo",
    title:
      "Frete Aéreo vs Marítimo: Qual Vale Mais a Pena?",
    excerpt:
      "Compare frete aéreo e marítimo: custos, prazos e quando usar cada modal.",
    content: `## Comparativo

| Fator | Aéreo | Marítimo |
|-------|-------|----------|
| Preço/kg | R$ 15-30 | R$ 2-5 |
| Prazo | 3-7 dias | 20-40 dias |
| Peso máx | 100 kg/vol | Sem limite |

## Quando Usar Aéreo?

- Produtos de alto valor/baixo peso
- Prazo apertado
- Amostras

## Quando Usar Marítimo?

- Grandes volumes
- Produtos de baixo valor
- Sem urgência

[Veja rotas no mapa →](/maritime-freight-map)""",
    date: "2026-05-27",
    readTime: 8,
    tags: ["frete aéreo", "frete marítimo", "comparação", "logística"],
  },
  {
    slug: "como-fazer-exportacao-passo-a-passo",
    title:
      "Como Fazer Exportação Passo a Passo para Iniciantes",
    excerpt:
      "Guia completo para quem quer exportar: cadastro DECEX, NCM, documentação e câmbio.",
    content: `## Passo a Passo

### 1. Cadastro no DECEX
- Acesse o Siscomex
- Cadastre-se como exportador
- Obtenha o RAD

### 2. Classifique o Produto
- NCM (8 dígitos)
- Consulte regulamentações

### 3. Encontre Compradores
- Feiras internacionais
- Plataformas B2B

### 4. Negocie
- Defina Incoterm (FOB, CIF, etc.)
- Calcule preço de exportação

### 5. Documentação
- Nota Fiscal de Exportação
- Certificado de Origem
- Conhecimento de Embarque

[Wizard de exportação →](/landing/export-wizard)
[Melhores países →](/smart-rank)""",
    date: "2026-05-27",
    readTime: 15,
    tags: ["como exportar", "exportação Brasil", "iniciantes"],
  },
"""

# Read current file
with open(posts_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Insert before the last ];
insert_point = content.rfind('];')
if insert_point == -1:
    print("ERROR: Could not find ]; in posts.ts")
else:
    new_content = content[:insert_point] + new_posts + "];\n"
    with open(posts_file, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Added 10 posts successfully")
