export const content = `## Calculadora de Imposto de Importação: Entenda Como Funciona

Cada mercadoria importada para o Brasil passa por uma carga tributária que inclui **5 impostos principais**. Calcular corretamente cada um é essencial para não ter surpresas no desembaraço e para precificar corretamente seus produtos.

## Os 5 Tributos na Importação Brasileira

### II — Imposto de Importação

O **Imposto de Importação (II)** é um tributo federal que incide diretamente sobre o **valor CIF** (Cost, Insurance and Freight) da mercadoria. Ele é o principal imposto na importação e tem caráter extrafiscal — serve para proteger a indústria nacional.

**Fórmula:**
II = Valor CIF × (Alíquota II / 100)

**Características:**
- Base de cálculo: Valor CIF
- Alíquota: Variável por NCM, de 0% a 35%
- Média para bens industrializados: ~14%
- Alguns produtos têm isenção (livros, remédios, equipamentos médicos)

### IPI — Imposto sobre Produtos Industrializados

O **IPI** é cobrado sobre a soma do valor CIF com o II. É um imposto seletivo — produtos supérfluos (cigarros, bebidas) pagam mais, enquanto produtos essenciais pagam menos ou nada.

**Fórmula:**
IPI = (Valor CIF + II) × (Alíquota IPI / 100)

**Características:**
- Base de cálculo: Valor CIF + II
- Alíquota: De 0% a 330%
- Típico para bens industrializados: 5% a 15%
- Cigarros e bebidas alcoólicas: 100% a 330%

### PIS e COFINS — Contribuições para Financiamento da Seguridade Social

O **PIS** (Programa de Integração Social) e a **COFINS** (Contribuição para o Financiamento da Seguridade Social) são contribuições federais que incidem sobre o valor CIF.

**Regime Comum (Cumulativo):**
- PIS: 1,65%
- COFINS: 7,6%
- Total: 9,25% sobre o valor CIF

**Regime Especial (Não Cumulativo):**
- PIS: 2,1%
- COFINS: 9,65%
- Total: 11,75% sobre o valor CIF

> A maioria das importações segue o regime comum, menos oneroso.

### ICMS — Imposto sobre Circulação de Mercadorias

O **ICMS** é estadual e tem uma particularidade importante: é calculado **"por dentro"**, ou seja, o imposto incide sobre ele mesmo. Isso faz com que a alíquota efetiva seja maior que a nominal.

**Fórmula:**
Base ICMS = (Valor CIF + II + IPI + PIS + COFINS + Taxas) / (1 - Alíquota ICMS)
ICMS = Base ICMS × Alíquota ICMS

**Alíquotas por região (2026):**
- Sudeste (SP, RJ, MG, RS, PR, SC): **18%**
- Nordeste, Centro-Oeste e outros: **17%**
- Operações interestaduais: **12%** ou **4%**

## Exemplo Prático de Cálculo

Vamos calcular os impostos para uma importação com os seguintes dados:

**Dados da importação:**
- Valor FOB: US$ 10.000
- Frete: US$ 1.000
- Seguro: US$ 200
- **Valor CIF: US$ 11.200**
- II: 14% | IPI: 10% | ICMS (SP): 18%

**Cálculo passo a passo:**

1. **II:** US$ 11.200 × 14% = **US$ 1.568**
2. **IPI:** (US$ 11.200 + US$ 1.568) × 10% = **US$ 1.277**
3. **PIS:** US$ 11.200 × 2,1% = **US$ 235**
4. **COFINS:** US$ 11.200 × 9,65% = **US$ 1.081**
5. **ICMS:** (11.200 + 1.568 + 1.277 + 235 + 1.081) / (1 - 0,18) × 0,18 = **US$ 3.079**

**Total de tributos:** US$ 7.240 (65% do valor CIF)

## Custos Aduaneiros Adicionais

Além dos 5 tributos principais, há custos operacionais:
- **Taxa SISCOMEX:** ~R$ 185 por DI (Declaração de Importação)
- **AFRMM:** 25% do valor do frete marítimo
- **THC:** Taxa de movimentação portuária
- **Despacho aduaneiro:** Honorários do despachante (R$ 1.000 a 3.000)
- **Armazenagem:** Taxas do terminal alfandegado

## Use a Calculadora da TRADEXA

Para calcular automaticamente todos os tributos da sua importação, use a **[Calculadora de Imposto de Importação da TRADEXA](/global-tariff)**. Basta informar:

1. **Código NCM** do produto
2. **Valor CIF** em dólar ou real
3. **Estado de destino** no Brasil

A ferramenta calcula II, IPI, PIS, COFINS e ICMS automaticamente e mostra o custo total landed da mercadoria.

> **Simule agora:** Acesse o [Calculadora de Imposto de Importação](/global-tariff) da TRADEXA e descubra quanto você vai pagar de tributos na sua próxima importação.

> **🔧 Ferramentas Relacionadas: [Calculadora de Importação](/landing/calculadora-importacao) | [Calculadora de Tarifas](/landing/tariff-calculator)**
> Calcule automaticamente todos os tributos da sua importação — II, IPI, PIS, COFINS e ICMS — em segundos.
> [Teste agora →](/landing/calculadora-importacao) | [Ver tarifas →](/landing/tariff-calculator)
## Ferramentas TRADEXA Relacionadas

- **[Classificador NCM com IA](/landing/ncm-classifier)** — Classifique produtos em segundos
- **[Calculadora de Importação](/ferramentas/calculadora-importacao)** — Simule todos os custos de uma importação
- **[Guia de Importação](/guia-importacao)** — Guia completo do processo de importação

> Simplifique seu comércio exterior com dados reais — [teste grátis em tradexa.com.br](https://tradexa.com.br)
`;
export const keyPoints: string[] | undefined = undefined;
