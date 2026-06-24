export const content = `## Tributos na Importação Brasileira

Importar para o Brasil envolve uma carga tributária composta por 5 tributos principais. Entender cada um é essencial para calcular o custo real da mercadoria importada.

## II — Imposto de Importação

O Imposto de Importação (II) é federal e incide sobre o valor CIF (Cost, Insurance and Freight) da mercadoria.

**Base de cálculo:** Valor CIF (produto + frete + seguro)
**Alíquota:** Variável por NCM, de 0% a 35% (média de 14% para bens industrializados)
**Natureza:** Extrafiscal (proteção da indústria nacional)

Fórmula: II = Valor CIF × (Alíquota II / 100)

## IPI — Imposto sobre Produtos Industrializados

Incide sobre o valor CIF + II.

**Base de cálculo:** Valor CIF + II
**Alíquota:** De 0% a 330% (bebidas e cigarros), típico 5%-15%
**Natureza:** Seletivo (maior para supérfluos, menor para essenciais)

Fórmula: IPI = (Valor CIF + II) × (Alíquota IPI / 100)

## PIS e COFINS — Contribuições Sociais

**Regime comum (cumulativo):** PIS 1,65% + COFINS 7,6% sobre valor CIF
**Regime especial (não cumulativo):** PIS 2,1% + COFINS 9,65%

A maioria das importações segue o regime comum.

## ICMS — Imposto sobre Circulação de Mercadorias

O ICMS é estadual e seu cálculo inclui o próprio imposto na base (cálculo "por dentro").

**Base de cálculo:** (Valor CIF + II + IPI + PIS + COFINS) / (1 - Alíquota ICMS)

As alíquotas variam por estado:
- **SP, RJ, MG, RS, PR, SC:** 18%
- **ES, GO, MS, MT, DF, BA, PE, CE:** 17%
- **Demais estados:** 17%
- **Operações interestaduais:** 12% ou 4%

## Custos Aduaneiros Adicionais

Além dos tributos, considere:
- **Taxa SISCOMEX:** ~R$ 185 por declaração
- **AFRMM:** 25% do valor do frete marítimo
- **THC (Terminal Handling Charge):** Taxa portuária de movimentação
- **Despacho aduaneiro:** Honorários do despachante (~R$ 1.000-3.000)
- **Armazenagem:** Taxas do terminal alfandegado

## Exemplo Prático

Importação de uma máquina (NCM 84713011) com:
- Valor FOB: US$ 10.000
- Frete: US$ 1.000
- Seguro: US$ 200
- Valor CIF: US$ 11.200
- II: 14% | IPI: 10% | ICMS SP: 18%

| Tributo | Base | Alíquota | Valor |
|---------|------|----------|-------|
| II | US$ 11.200 | 14% | US$ 1.568 |
| IPI | US$ 12.768 | 10% | US$ 1.277 |
| PIS | US$ 11.200 | 2,1% | US$ 235 |
| COFINS | US$ 11.200 | 9,65% | US$ 1.081 |
| ICMS | US$ 30.307 | 18% | US$ 5.455 |

**Custo total landed:** US$ 19.816 (77% de tributação sobre o CIF)

> **Simule sua própria importação:** Use a [Calculadora de Imposto de Importação](/landing/tariff-calculator) da TRADEXA. Informe o NCM, valor e estado — nossa calculadora faz todo o cálculo automaticamente.

---

## Como Usar a Calculadora de Tarifas da TRADEXA

A [Calculadora de Imposto de Importação](/landing/tariff-calculator) da TRADEXA foi projetada para simplificar todo o processo de estimativa de custos de importação. Veja o passo a passo:

**Passo 1 — Acesse a calculadora:** Navegue até a página [Calculadora de Tarifas](/landing/tariff-calculator) no site da TRADEXA. A interface exibe campos organizados em três seções: dados do produto, valores da operação e local de destino.

**Passo 2 — Informe o NCM:** Digite o código NCM de 8 dígitos do seu produto. A calculadora valida automaticamente o código e carrega as alíquotas vigentes de II e IPI diretamente da base oficial da Receita Federal (TIPI). Caso não saiba o NCM, use o buscador inteligente que pesquisa por descrição do produto.

**Passo 3 — Preencha os valores da operação:** Insira o valor FOB da mercadoria em dólares (US$), o valor do frete internacional e o seguro. O sistema calcula automaticamente o valor CIF.

**Passo 4 — Selecione o estado de destino:** Escolha a unidade federativa onde a mercadoria será desembaraçada. A alíquota de ICMS é ajustada automaticamente conforme o estado selecionado — SP 18%, RJ 18%, ES 17%, e assim por diante.

**Passo 5 — Escolha o regime de PIS/COFINS:** Selecione entre regime cumulativo (PIS 1,65% + COFINS 7,6%) ou não cumulativo (PIS 2,1% + COFINS 9,65%). O regime depende da classificação fiscal do seu produto e do regime tributário da sua empresa.

**Passo 6 — Visualize o resultado:** A calculadora exibe uma tabela detalhada com cada tributo, sua base de cálculo, alíquota e valor em US$ e R$. O custo total landed é exibido em destaque, com a taxa de câmbio do dia aplicada automaticamente.

> **Dica:** A calculadora permite salvar simulações e comparar cenários lado a lado — por exemplo, importar pelo porto de Santos vs. Paranaguá, ou desembaraçar em SP vs. Santa Catarina.

## Erros Comuns no Cálculo de Tributos

Mesmo importadores experientes cometem erros que podem distorcer significativamente a estimativa de custos. Os mais frequentes são:

**Erro 1 — Esquecer o cálculo "por dentro" do ICMS:** Este é o erro mais comum. O ICMS é calculado por dentro, ou seja, o próprio imposto integra a base de cálculo. Muitos iniciantes calculam ICMS × valor CIF, quando na verdade a fórmula é: Base ICMS = (CIF + II + IPI + PIS + COFINS) / (1 - alíquota). O erro pode subestimar o ICMS em até 40%.

**Erro 2 — Aplicar alíquota errada de ICMS:** Cada estado tem sua própria alíquota. Além disso, operações interestaduais têm alíquotas reduzidas (12% ou 4%). Confundir a alíquota interna do estado de destino com a interestadual é comum.

**Erro 3 — Ignorar o AFRMM:** O Adicional ao Frete para Renovação da Marinha Mercante é 25% sobre o valor do frete marítimo. Muitos importadores esquecem essa taxa, que pode representar centenas ou milhares de dólares.

**Erro 4 — Não considerar armazenagem e demurrage:** Os terminais alfandegados cobram armazenagem a partir do primeiro dia. Se a liberação da carga atrasa por falta de documentos, os custos de armazenagem e demurrage de container podem superar o próprio frete.

**Erro 5 — Confundir PIS/COFINS cumulativo com não cumulativo:** Produtos diferentes podem ter regimes diferentes. O regime não cumulativo (alíquotas maiores) dá direito a créditos, mas o cumulativo (alíquotas menores) não. A escolha errada impacta diretamente o fluxo de caixa.

**Erro 6 — Usar taxa de câmbio desatualizada:** O câmbio usado para conversão de dólar para real deve ser o da data do registro da DI (Declaração de Importação). Uma variação de 2% no câmbio pode alterar o custo total em milhares de reais.

## Comparativo ICMS por Estado

O ICMS é o tributo que mais varia entre os estados brasileiros. Confira um comparativo detalhado:

**Estados com alíquota de 18%:**
- São Paulo (SP), Rio de Janeiro (RJ), Minas Gerais (MG), Rio Grande do Sul (RS), Paraná (PR), Santa Catarina (SC)

**Estados com alíquota de 17%:**
- Espírito Santo (ES), Goiás (GO), Mato Grosso do Sul (MS), Mato Grosso (MT), Distrito Federal (DF), Bahia (BA), Pernambuco (PE), Ceará (CE), Alagoas (AL), Amazonas (AM), Pará (PA), Maranhão (MA), Paraíba (PB), Piauí (PI), Rio Grande do Norte (RN), Rondônia (RO), Roraima (RR), Sergipe (SE), Tocantins (TO), Acre (AP)

**Alíquotas interestaduais:**
- 12% para operações entre estados do Sul, Sudeste (exceto ES) e DF
- 7% para operações do Sul/Sudeste para Norte, Nordeste, Centro-Oeste e ES
- 4% para operações com produtos importados (Resolução 13/2012 do Senado)

**Impacto prático:** Importar um produto de US$ 50.000 CIF com ICMS de 18% (SP) vs. 17% (ES) pode representar uma diferença de mais de R$ 5.000 no custo total. Por isso, a escolha do porto de desembaraço é uma decisão estratégica que vai além da logística.

## PIS/COFINS: Regimes Aprofundados

**Regime Cumulativo (PIS 1,65% + COFINS 7,6%):**
- Aplicável a empresas no Lucro Presumido
- Sem direito a crédito de PIS/COFINS na aquisição de insumos
- Alíquota total: 9,25% sobre o valor CIF
- Produtos comuns: a maioria dos bens industrializados e matérias-primas

**Regime Não Cumulativo (PIS 2,1% + COFINS 9,65%):**
- Aplicável a empresas no Lucro Real
- Direito a crédito de PIS/COFINS na aquisição de insumos, energia elétrica, aluguéis, etc.
- Alíquota total: 11,75% sobre o valor CIF
- Vantagem: o crédito gerado na importação pode ser compensado com débitos de PIS/COFINS das vendas internas

**Produtos com regimes especiais:**
- Medicamentos: alíquotas reduzidas (PIS 0% + COFINS 0% em alguns casos)
- Combustíveis: monofásico (incidência concentrada no produtor/importador)
- Veículos: PIS/COFINS com alíquotas diferenciadas

## Exemplos de Custo Total Landed

**Exemplo 1 — Eletrônicos (NCM 84713012 - Notebooks):**
- Valor FOB: US$ 50.000
- Frete: US$ 3.000 | Seguro: US$ 500 → CIF: US$ 53.500
- II: 16% | IPI: 15% | ICMS SP: 18% | PIS/COFINS cumulativo
- II: US$ 8.560 | IPI: US$ 9.309 | PIS: US$ 883 | COFINS: US$ 4.067
- Base ICMS: US$ 92.258 | ICMS: US$ 16.606
- **Custo total landed: ~US$ 92.925** (74% de tributação sobre o CIF)

**Exemplo 2 — Vestuário (NCM 62046200 - Calças femininas):**
- Valor FOB: US$ 20.000
- Frete: US$ 2.500 | Seguro: US$ 300 → CIF: US$ 22.800
- II: 35% (proteção têxtil) | IPI: 10% | ICMS MG: 18% | PIS/COFINS não cumulativo
- II: US$ 7.980 | IPI: US$ 3.078 | PIS: US$ 479 | COFINS: US$ 2.200
- Base ICMS: US$ 44.895 | ICMS: US$ 8.081
- **Custo total landed: ~US$ 44.618** (96% de tributação sobre o CIF)

**Exemplo 3 — Máquinas industriais (NCM 84571000 - Centros de usinagem):**
- Valor FOB: US$ 200.000
- Frete: US$ 15.000 | Seguro: US$ 2.000 → CIF: US$ 217.000
- II: 0% (bem de capital sem similar nacional) | IPI: 5% | ICMS PR: 18%
- II: US$ 0 | IPI: US$ 10.850 | PIS: US$ 3.581 | COFINS: US$ 16.441
- Base ICMS: US$ 309.015 | ICMS: US$ 55.623
- **Custo total landed: ~US$ 303.495** (40% de tributação sobre o CIF)

> **Conclusão:** A carga tributária na importação brasileira varia enormemente conforme o produto, o estado de destino e o regime tributário da empresa. Use a [Calculadora de Imposto de Importação](/landing/tariff-calculator) da TRADEXA para simular seu cenário específico com precisão e tomar decisões mais informadas.

---

## Landing Page Desty: Calculadora de Imposto de Importação como Ferramenta de Geração de Leads

A [Calculadora de Imposto de Importação](/landing/tariff-calculator) da TRADEXA foi construída sobre a plataforma **Desty** — uma poderosa ferramenta de criação de landing pages otimizadas para conversão. Isso significa que, além de calcular tributos, a página funciona como um canal de geração de leads qualificados para empresas de comércio exterior.

### Por que a Desty é a Plataforma Ideal?

A **Desty** oferece recursos que tornam a calculadora muito mais do que uma simples ferramenta:

- **Formulários inteligentes:** Ao realizar uma simulação, o usuário pode optar por receber o relatório completo por e-mail. Isso gera leads com alto nível de intenção — afinal, quem está calculando imposto de importação é um potencial comprador de serviços de assessoria aduaneira, despacho ou consultoria tributária.

- **Segmentação automática:** Cada simulação é acompanhada de metadados (NCM consultado, valor da operação, estado de destino). Isso permite segmentar leads por perfil — importadores de eletrônicos vs. máquinas vs. têxteis, por exemplo — e direcionar comunicações personalizadas.

- **Integração com CRM:** Os leads capturados na landing page Desty são automaticamente enviados para o CRM da TRADEXA, permitindo que a equipe comercial faça follow-up no momento certo — quando o importador está ativamente pesquisando custos tributários.

- **Testes A/B:** A Desty permite testar diferentes versões da página (CTAs, headlines, layouts) para maximizar a taxa de conversão. A TRADEXA utiliza testes contínuos para otimizar a experiência do usuário.

- **Analytics embutido:** Métricas como tempo na página, taxa de preenchimento, abandono de formulário e taxa de conversão são monitoradas em tempo real, permitindo ajustes rápidos na estratégia de conteúdo.

### Como a Calculadora Gera Leads na Prática

O fluxo de conversão na landing page Desty funciona em 3 etapas:

1. **Atração:** O usuário chega à página através de busca orgânica (artigos como este), anúncios Google Ads ou redes sociais. O título "Calculadora de Imposto de Importação" e o design limpo da Desty transmitem autoridade e confiança.

2. **Engajamento:** O usuário interage com a calculadora, inserindo dados reais da sua importação. Cada campo preenchido aumenta o comprometimento — após ver o resultado detalhado, o usuário quer salvar ou compartilhar a simulação.

3. **Conversão:** Ao clicar em "Receber relatório por e-mail" ou "Falar com um especialista", o usuário fornece voluntariamente seus dados de contato. A landing page Desty então dispara um e-mail automático com o relatório em PDF e aciona a equipe comercial da TRADEXA para um follow-up personalizado.

### Exemplo de Lead Qualificado Gerado pela Desty

Um importador de máquinas agrícolas acessa a calculadora, insere o NCM 84335100 (colheitadeiras), valor FOB de US$ 150.000, origem EUA, destino MT (ICMS 17%). A simulação mostra todos os tributos e o custo total landed. Interessado, o usuário fornece e-mail e telefone para receber o relatório completo.

**Lead gerado:**
- Perfil: Importador de máquinas agrícolas
- Ticket médio: US$ 150.000 por operação
- Necessidade: Assessoria para desembaraço em MT
- Urgência: Alta (está cotando equipamentos agora)

Este lead vale muito mais do que um lead genérico — a Desty permite capturar não apenas o contato, mas todo o contexto da necessidade comercial.

> **Quer gerar leads qualificados para seu negócio de comércio exterior?** A [Calculadora de Imposto de Importação](/landing/tariff-calculator) da TRADEXA, construída na plataforma Desty, pode ser personalizada para sua empresa. Entre em contato para saber mais.
## Ferramentas TRADEXA Relacionadas

- **[Classificador NCM com IA](/landing/ncm-classifier)** — Classifique produtos em segundos
- **[Calculadora de Importação](/ferramentas/calculadora-importacao)** — Simule todos os custos de uma importação
- **[Guia de Importação](/guia-importacao)** — Guia completo do processo de importação

> Simplifique seu comércio exterior com dados reais — [teste grátis em tradexa.com.br](https://tradexa.com.br)
`;
export const keyPoints: string[] | undefined = undefined;
