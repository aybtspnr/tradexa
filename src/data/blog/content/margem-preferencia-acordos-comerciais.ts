export const content = `## O que é Margem de Preferência?

A margem de preferência é um percentual de redução da tarifa de importação que um país concede aos produtos originários de outro país com o qual mantém acordo comercial. Quanto maior a margem, menor será o imposto pago.

**Fórmula:**
Tarifa Preferencial = Tarifa MFN × (1 - Margem de Preferência)

**Exemplo:**
- Tarifa MFN: 14%
- Margem de preferência: 50%
- Tarifa preferencial: 14% × (1 - 0,50) = **7%**

## Acordos Comerciais do Brasil

### Mercosul (Argentina, Uruguai, Paraguai)
O Mercosul é o principal bloco econômico do Brasil. Dentro do bloco, a maioria dos produtos tem tarifa zero (100% de margem de preferência).

- **Produtos intrazona (códigos NCM 01-97):** Margem de 100% (tarifa zero)
- **Exceções:** Açúcar, automóveis (regime de adequação gradual)
- **Origem:** Produto com 60% de conteúdo regional

### ACE (Acordos de Complementação Econômica)
Acordos bilaterais entre o Mercosul e países sul-americanos:

| Acordo | Países | Margem Típica | Produtos |
|--------|--------|--------------|----------|
| ACE 35 | Chile | 50-100% | Todos os produtos |
| ACE 36 | Bolívia | 60-100% | Produtos industriais |
| ACE 58 | Peru | 40-100% | Agricultura e indústria |
| ACE 59 | Colômbia | 30-100% | Indústria química, têxtil |
| ACE 72 | México (automotivo) | 30-100% | Veículos e autopeças |

### SGP (Sistema Geral de Preferências)
Países desenvolvidos concedem margens de preferência unilaterais a países em desenvolvimento, incluindo o Brasil:

- **EUA (SGP):** 3.500 produtos com margem de 0-100%
- **União Europeia (SPG):** Margens variáveis para produtos agrícolas e industriais
- **Japão (SGP):** Margens para 200+ produtos

## Como Calcular a Margem

### Passo 1: Identifique o código NCM/SH do produto
O primeiro passo é ter o código de 6 a 8 dígitos do produto.

### Passo 2: Verifique a tarifa MFN do país de destino
Consulte a tarifa MFN (Most Favored Nation) para aquele NCM.

### Passo 3: Consulte o acordo bilateral
Verifique se existe acordo entre o Brasil e o país de destino, e qual a margem de preferência para o NCM do produto.

### Passo 4: Calcule a tarifa efetiva
Aplique a margem de preferência sobre a tarifa MFN.

**Exemplo prático: Exportação de suco de laranja para o Chile**
- NCM: 2009.11.00
- Tarifa MFN Chile: 6%
- Acordo: ACE 35 Chile-Mercosul
- Margem de preferência: 100% (para este NCM)
- **Tarifa efetiva: 0%** ✅

> **Consulte tarifas e acordos:** Use o [Tarifário Global](/global-tariff) da TRADEXA. Informe o NCM e o país de destino para ver a tarifa MFN e as preferenciais aplicáveis.

## Documentação para Comprovar Origem

Para usufruir da margem de preferência, é necessário comprovar a origem brasileira do produto:

### Certificado de Origem (CO)
Documento oficial que atesta que o produto foi fabricado no Brasil:

- **Digital (emissão eletrônica):** Para Mercosul e ACEs — 100% digital desde 2024
- **Físico:** Para SGP e países sem acordo digital
- **Declaração na fatura:** Para alguns acordos, a declaração na própria fatura comercial é suficiente

### Regras de Origem

Cada acordo tem suas próprias regras de origem. As mais comuns:

1. **Salto tarifário:** O produto deve ser classificado em posição diferente da posição dos insumos importados
2. **Conteúdo regional (RVC):** Percentual mínimo de conteúdo regional (geralmente 40% a 60%)
3. **Processo produtivo específico:** O produto precisa passar por determinados processos produtivos no Brasil
4. **Valor agregado:** O valor agregado no Brasil deve representar um percentual mínimo

## Acordos em Negociação

### Mercosul-União Europeia
O acordo entre Mercosul e UE (ainda não ratificado) criará a maior zona de livre comércio do mundo. Benefícios esperados:

- Margens de 80-100% para produtos industriais brasileiros
- Redução gradual de tarifas agrícolas europeias
- Quotas preferenciais para carne, açúcar e etanol
- Acesso a 450 milhões de consumidores

### Novo Mercosul-Singapura
Acordo assinado em 2025, em fase de ratificação:
- Margens preferenciais para 80% dos produtos
- Regras de origem flexíveis
- Inclusão de comércio digital e serviços

## Dicas para Aproveitar Acordos

1. **Mapeie acordos disponíveis** para seu produto e país de destino
2. **Calcule a economia real** considerando a margem de preferência
3. **Prepare a documentação de origem** com antecedência
4. **Consulte as regras de origem** — mudanças podem afetar a elegibilidade
5. **Acompanhe novos acordos** — o Brasil negocia atualmente com Canadá, Coreia do Sul e Indonésia
6. **Use o Certificado de Origem Digital** — mais rápido e menos burocrático

> **Encontre os melhores mercados:** Use o [Smart Rank](/landing/export-opportunities) da TRADEXA para descobrir quais países oferecem as melhores margens de preferência para seus produtos.

## Ferramentas TRADEXA Relacionadas

- **[Oportunidades de Exportação](/landing/export-opportunities)** — Smart Rank que identifica países com as melhores margens de preferência para cada NCM.
- **[Explorador Global](/landing/global-explorer)** — Visualize acordos comerciais, tarifas preferenciais e compare condições de acesso a mercados.
- **[Guia de Exportação](/guia-exportacao)** — Passo a passo para aproveitar acordos comerciais, com orientações sobre certificado de origem e documentação.

> **Explore novos mercados com inteligência de dados** — [teste grátis em tradexa.com.br](https://tradexa.com.br)`;
export const keyPoints: string[] | undefined = undefined;
