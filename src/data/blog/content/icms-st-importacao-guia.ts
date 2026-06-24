export const content = `## O que é ICMS-ST na Importação?
O ICMS-ST (ICMS por Substituição Tributária) é um regime em que o ICMS devido por uma empresa em relação a suas vendas é recolhido antecipadamente por outro contribuinte da cadeia — geralmente o importador ou o primeiro contribuinte da cadeia de circulação. Na importação, o ICMS-ST significa que o importador recolhe não apenas o ICMS relativo à sua própria importação, mas também o ICMS que seria devido pelos destinatários intermediários até o consumidor final.
Esse regime é aplicado quando a mercadoria importada se enquadra em algum dos programas de substituição tributária estadual. Cada estado define quais produtos estão sujeitos ao ICMS-ST, as alíquotas e as margens de valor agregado (MVA) aplicáveis.
## Como Incide o ICMS-ST na Importação
### Base de Cálculo da ST
A base de cálculo do ICMS-ST na importação é ampliada para incluir o valor que seria praticado na operação subsequente (venda para o próximo contribuinte ou para o consumidor final).
**Fórmula:**
Base ST = (Valor CIF + II + IPI + PIS + COFINS + Outros) x (1 + MVA) / (1 - Alíquota ICMS)
Onde:
- **MVA (Margem de Valor Agregado):** Percentual definido por cada estado que estima a margem de lucro e os tributos incidentes na operação subsequente
- **Alíquota ICMS:** Alíquota do estado de destino
### Exemplo Prático
Importação de eletrodoméstico para São Paulo:
- Valor CIF: R$ 1.000
- II (14%): R$ 140
- IPI (15%): R$ 171
- PIS (2,1%): R$ 27
- COFINS (9,65%): R$ 124
- MVA (40%): Percentual definido pela SEFAZ/SP
- Base ST: (1.000 + 140 + 171 + 27 + 124) x 1,40 = R$ 2.051,80
- ICMS-ST (18%): R$ 2.051,80 x 18% = R$ 369,32
- ICMS próprio (18%): Calculado normalmente
- **Total ICMS a recolher:** ICMS próprio + ICMS-ST
## Variações Estaduais
Cada estado brasileiro possui sua própria regulamentação do ICMS-ST, o que gera significativa complexidade:
### São Paulo
- MVA para eletroeletrônicos: 40% a 60%
- Alíquota: 18%
- ICMS-ST recolhido no momento do desembaraço aduaneiro
- Exige GNRE (Guia Nacional de Recolhimento de Tributos Estaduais)
### Minas Gerais
- MVA para alimentos: 30% a 50%
- Alíquota: 18%
- ICMS-Garantido obrigatório para importadores eventuais
- Prazo para recolhimento: antes do desembaraço
### Paraná
- MVA para bebidas: 50% a 80%
- Alíquota: 19% (alíquota interna mais alta)
- Controle rigoroso de cadeia de substituição
### Rio Grande do Sul
- MVA para produtos farmacêuticos: 25% a 45%
- Alíquota: 17%
- Exige registro prévio na SEFAZ/RS
### Rio de Janeiro
- MVA para vestuário: 40% a 70%
- Alíquota: 20% (alíquota interna)
- ICMS-ST recolhido junto com o ICMS próprio
## Produtos Mais Afetados
- Eletroeletrônicos (TVs, celulares, computadores)
- Bebidas (refrigerantes, cervejas, destilados)
- Alimentos processados
- Produtos farmacêuticos
- Combustíveis
- Automóveis e autopeças
- Produtos de higiene e limpeza
## Problemas Comuns
### 1. MVA Desatualizado
Os estados atualizam as MVAs periodicamente. Usar uma MVA desatualizada gera recolhimento incorreto e risco de autuação.
**Como resolver:** Consulte sempre a MVA vigente na SEFAZ do estado de destino antes de calcular o ICMS-ST.
### 2. Divergência entre MVA Importação e MVA Interestadual
Alguns estados utilizam MVAs diferentes para importação e para operações interestaduais. Confundir os dois gera diferença de apuração.
### 3. Falta de GNRE
O recolhimento do ICMS-ST na importação exige a emissão de GNRE (Guia Nacional de Recolhimento de Tributos Estaduais) antes do desembaraço. A ausência da GNRE impede a liberação da mercadoria.
### 4. Crédito de ST
O importador que recolhe o ICMS-ST tem direito a crédito do valor pago. No entanto, o aproveitamento desse crédito depende de a empresa ser contribuinte do ICMS no estado de destino e utilizar a mercadoria em operações tributadas.
## Calcule seus Custos
O cálculo do ICMS-ST é complexo e varia significativamente entre estados. Utilize a [Calculadora de Incoterms](/ferramentas/calculadora-incoterms) da TRADEXA para calcular o custo total de importação incluindo todos os tributos federais e estaduais. A ferramenta apresenta o custo CIF completo, auxiliando no planejamento financeiro da operação.
Acompanhe as atualizações das MVAs e regulamentações estaduais em nossa seção de [Notícias de Comércio Exterior](/noticias). Mantemos informações sobre mudanças nas alíquotas e nos programas de substituição tributária.
## Ferramentas TRADEXA Relacionadas

- **[Classificador NCM com IA](/landing/ncm-classifier)** — Encontre o NCM correto e veja alíquotas atualizadas
- **[Tarifário Global](/landing/tariff-calculator)** — Consulte tarifas de importação de 31 países
- **[Calculadora de Drawback](/ferramentas/calculadora-drawback)** — Simule quanto você pode recuperar em impostos

> Simplifique sua gestão tributária no comex — [teste grátis em tradexa.com.br](https://tradexa.com.br)
`;
export const keyPoints: string[] | undefined = undefined;
