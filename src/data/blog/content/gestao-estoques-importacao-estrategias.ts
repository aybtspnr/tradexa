export const content = `## A Importância da Gestão de Estoques na Importação

A gestão de estoques na importação é um dos pilares mais críticos e, paradoxalmente, mais negligenciados do comércio exterior brasileiro. Enquanto importadores dedicam atenção intensa à negociação de preços com fornecedores, à escolha da rota marítima mais econômica e à classificação fiscal correta das mercadorias, a gestão dos estoques resultantes desse processo muitas vezes fica em segundo plano — um erro que pode custar caro.

Importar não é como comprar localmente. O lead time é medido em semanas ou meses, não em dias. As variáveis são inúmeras: greves portuárias, congestionamentos alfandegários, variações cambiais, problemas de produção no fornecedor, navios que atrasam, contêineres que são inspecionados, documentação que precisa ser corrigida. Cada uma dessas variáveis pode transformar um estoque planejado em um pesadelo operacional.

Para o importador brasileiro, a equação é especialmente desafiadora. O Brasil combina burocracia aduaneira complexa, infraestrutura logística deficiente em diversos pontos, carga tributária elevada e um mercado consumidor exigente que não aceita prazos longos. Nesse cenário, uma gestão de estoques eficiente não é um luxo — é uma condição de sobrevivência competitiva.

Neste artigo, vamos explorar em profundidade as estratégias, ferramentas e melhores práticas para gerenciar estoques na importação. Abordaremos desde conceitos fundamentais como lead time e ponto de ressuprimento até técnicas avançadas como dimensionamento de estoque de segurança, gestão de sazonalidade e integração com sistemas WMS e ERP. Ao final, você terá um roteiro completo para transformar a gestão de estoques da sua importação em uma vantagem competitiva real.

## Os Desafios Únicos da Gestão de Estoques na Importação

Antes de mergulharmos nas estratégias, é essencial entender por que a gestão de estoques na importação é fundamentalmente diferente da gestão de estoques de produtos nacionais.

### Lead Times Longos e Variáveis

Enquanto um fornecedor nacional entrega em 24 a 72 horas, um importador depende de prazos que facilmente ultrapassam 60, 90 ou até 120 dias. Esse lead time inclui:

- Tempo de produção do fornecedor (15 a 45 dias)
- Transporte interno no país de origem (2 a 7 dias)
- Processos de exportação no país de origem (3 a 10 dias)
- Transporte marítimo ou aéreo internacional (15 a 40 dias)
- Processos de importação no Brasil (5 a 30 dias)
- Transporte interno no Brasil (2 a 10 dias)

Cada etapa está sujeita a variações. Um navio pode atrasar por mau tempo. A alfândega pode reter a carga para inspeção. O porto pode estar congestionado. O resultado é que o lead time real dificilmente coincide com o lead time planejado.

### Custos de Carregamento Elevados

O capital investido em estoque importado fica imobilizado por muito mais tempo. Se um produto nacional fica 15 dias em estoque médio, um produto importado pode ficar 90 a 120 dias. Isso significa que o custo de carregamento — juros, armazenagem, seguros, obsolescência — é significativamente maior.

### Imprevisibilidade da Demanda

Projetar demanda para 3 a 4 meses à frente é intrinsecamente mais difícil do que projetar para 15 dias. Mudanças no mercado, na economia, no comportamento do consumidor ou na concorrência podem tornar obsoleta uma previsão feita no momento do pedido de importação.

### Complexidade Logística

A gestão de estoques importados envolve múltiplos pontos de armazenagem (fornecedor, terminal portuário, recinto alfandegário, centro de distribuição), múltiplos modais de transporte e múltiplos intervenientes (despachante, agente de carga, transportador, seguradora).

### Restrições de Lote Mínimo

Diferentemente de compras nacionais, onde é possível pedir pequenas quantidades com frequência, a importação geralmente exige lotes mínimos elevados (contêiner fechado, quantidade mínima por SKU, moagem ou produção dedicada). Isso força o importador a comprar mais do que o necessário no curto prazo.

## Conceitos Fundamentais para Gestão de Estoques na Importação

Para gerenciar eficientemente estoques importados, é preciso dominar alguns conceitos fundamentais. Vamos revisá-los com foco nas particularidades da importação.

### Lead Time de Reposição

O lead time de reposição na importação é o tempo total entre a decisão de comprar e a disponibilidade do produto para venda no Brasil. Ele se decompõe em:

- **Lead time de suprimento:** tempo que o fornecedor leva para produzir e disponibilizar a mercadoria
- **Lead time de transporte:** tempo de trânsito internacional + nacional
- **Lead time aduaneiro:** tempo de liberação na alfândega brasileira
- **Lead time de recebimento:** tempo para conferência, armazenagem e disponibilização no sistema

A soma desses componentes define o lead time total, que pode variar de 30 a 150 dias dependendo da origem, do modal e da complexidade do produto.

### Estoque de Segurança

O estoque de segurança é a quantidade extra mantida para proteger contra variações na demanda e no lead time. Na importação, o estoque de segurança precisa ser maior que em operações nacionais justamente pela maior variabilidade de ambos os fatores.

O cálculo do estoque de segurança para importação pode ser feito pela fórmula:

Estoque de Segurança = Z × σ × √(LT)

Onde:
- Z = fator de segurança (1,28 para 90% de nível de serviço; 1,65 para 95%; 2,33 para 99%)
- σ = desvio-padrão da demanda no período
- LT = lead time médio em períodos

Na prática, muitos importadores experientes adotam uma abordagem mais conservadora, multiplicando o estoque de segurança calculado por um fator de ajuste que considera a sazonalidade, a criticidade do produto e a confiabilidade histórica do fornecedor e da rota.

### Ponto de Ressuprimento

O ponto de ressuprimento (ou ponto de pedido) é o nível de estoque que dispara um novo pedido de compra. Ele é calculado como:

Ponto de Ressuprimento = (Demanda Média Diária × Lead Time Médio) + Estoque de Segurança

Para importação, a grande questão é que o lead time é longo e o pedido não pode ser fracionado facilmente. Se o ponto de ressuprimento é mal dimensionado, o importador pode ficar sem estoque (ruptura) durante meses até a chegada de um novo lote.

### Giro de Estoque

O giro de estoque mede quantas vezes o estoque é renovado em um período. Quanto maior o giro, menor o capital imobilizado. Na importação, o giro tende a ser menor que em operações nacionais devido ao lead time longo e aos lotes mínimos elevados.

Giro de Estoque = Custo dos Produtos Vendidos / Estoque Médio no Período

Um giro saudável para importação varia por setor, mas geralmente fica entre 3 e 8 vezes ao ano. Giro abaixo de 3 sugere excesso de estoque ou produtos de baixa rotatividade. Giro acima de 8 pode indicar risco de ruptura.

### Cobertura de Estoque

A cobertura (ou dias de estoque) indica por quantos dias o estoque atual é suficiente para atender à demanda projetada. Na importação, a cobertura ideal deve ser maior que o lead time total de reposição, acrescido de uma margem de segurança.

Cobertura (dias) = Estoque Atual / Demanda Média Diária

Para produtos importados, a cobertura mínima recomendada é de 1,5 a 2 vezes o lead time total. Se o lead time é de 90 dias, o estoque deve cobrir de 135 a 180 dias de demanda.

## Estratégias para Reduzir Custos de Estoque na Importação

Reduzir custos de estoque na importação sem comprometer o nível de serviço é o objetivo central da gestão eficiente. Vamos explorar as principais estratégias.

### Segmentação ABC com Foco em Importação

A classificação ABC (ou análise de Pareto) é uma ferramenta poderosa, mas precisa ser adaptada para a realidade da importação. Os critérios tradicionais (valor de consumo) devem ser complementados por:

- **Lead time de reposição:** Produtos com lead time muito longo merecem atenção especial, mesmo que tenham valor de consumo menor
- **Criticidade para o negócio:** Produtos essenciais para a operação ou para clientes estratégicos devem ter maior cobertura
- **Sazonalidade:** Produtos com demanda sazonal requerem tratamento diferenciado
- **Custo de obsolescência:** Produtos com prazo de validade curto ou risco de descontinuidade não devem ter estoques elevados

Para importadores brasileiros, a plataforma TRADEXA oferece dashboards de trade intelligence que facilitam a segmentação ABC com base em dados reais de importação, permitindo visualizar claramente quais produtos consomem mais capital e merecem prioridade na gestão.

### Lote Econômico de Compra (LEC) na Importação

O Lote Econômico de Compra encontra o ponto ótimo entre custos de pedido e custos de carregamento. Na importação, o LEC precisa considerar:

- **Custos de pedido:** Taxas de abertura de crédito documentário, honorários de despachante, taxas portuárias, frete internacional
- **Custos de carregamento:** Juros sobre capital imobilizado, armazenagem, seguros, risco de obsolescência
- **Restrições de lote mínimo:** Contêiner fechado (20' ou 40'), quantidades mínimas por SKU

A fórmula adaptada:

LEC = √(2 × D × Cp / Ca)

Onde:
- D = demanda anual em unidades
- Cp = custo total de realizar um pedido de importação
- Ca = custo anual de carregamento por unidade

### Consolidação de Pedidos e Compartilhamento de Contêineres

Uma estratégia eficaz para reduzir custos é consolidar pedidos de múltiplos fornecedores em um único contêiner. Isso pode ser feito através de:

- **Consolidação interna:** quando o importador compra de múltiplos fornecedores no mesmo país e consolida as cargas antes do embarque
- **Compartilhamento com outros importadores:** quando dois ou mais importadores dividem um contêiner, rateando os custos fixos
- **Operadores logísticos com programas de consolidação:** muitos 3PLs oferecem programas regulares de consolidação para clientes

### Cross-Docking Internacional

O cross-docking é uma técnica onde a mercadoria recebida é imediatamente preparada para expedição, sem passar por armazenagem prolongada. Na importação, o cross-docking pode ser aplicado de duas formas:

- **Cross-docking no porto de destino:** a carga é recebida, desconsolidada e imediatamente expedida para os destinos finais
- **Cross-docking em centro de distribuição:** a carga é recebida no CD, fracionada e expedida em até 24-48 horas

Essa técnica reduz drasticamente os custos de armazenagem e acelera o fluxo de mercadorias, mas exige coordenação precisa entre chegada do contêiner e programação de entregas.

### Diferimento de Tributos e Redução do Custo de Carregamento

Estratégias tributárias podem reduzir significativamente o custo de carregamento do estoque importado. Algumas alternativas:

- **Drawback integrado:** permite importar com suspensão de tributos para posterior industrialização e exportação
- **Recof (Regime Aduaneiro de Entreposto Industrial):** suspensão de tributos na importação de insumos para industrialização
- **Entreposto aduaneiro:** armazenagem em recinto alfandegado com suspensão de tributos até a internalização
- **Importação sob regime de admissão temporária:** para bens que serão reexportados após uso temporário

Cada regime tem requisitos específicos e deve ser avaliado com auxílio de consultoria especializada em comércio exterior.

## Estratégias para Evitar Rupturas de Estoque

A ruptura de estoque na importação é particularmente danosa porque o lead time de reposição é longo — uma vez que o estoque acaba, pode levar meses para ser recomposto. As consequências incluem perda de vendas, insatisfação de clientes, dano à reputação e, em casos extremos, penalidades contratuais.

### Dimensionamento Robusto do Estoque de Segurança

Como vimos anteriormente, o estoque de segurança para importação deve considerar não apenas a variação da demanda, mas também a variação do lead time. Uma abordagem mais completa é:

ES = Z × √(LT × σ²d + d² × σ²LT)

Onde:
- d = demanda média
- σd = desvio-padrão da demanda
- LT = lead time médio
- σLT = desvio-padrão do lead time

Essa fórmula considera tanto a incerteza da demanda quanto a incerteza do lead time, que são as duas maiores fontes de risco na importação.

### Revisão Periódica com Ajuste Sazonal

O estoque de segurança não deve ser estático. Recomenda-se revisá-lo a cada 3 a 6 meses, ajustando-o conforme:

- Mudanças no padrão de demanda
- Desempenho recente do fornecedor (confiabilidade de entrega)
- Variações observadas no lead time
- Novas rotas logísticas disponíveis
- Mudanças no cenário econômico

### Monitoramento em Tempo Real com Alertas Automáticos

Sistemas de gestão modernos permitem configurar alertas automáticos quando o estoque se aproxima do ponto de ressuprimento ou do estoque de segurança. Para importadores, esses alertas são críticos porque o tempo de reação é limitado — quando o estoque atinge o ponto de ressuprimento, é preciso agir imediatamente.

### Fornecedores Alternativos e Rotas de Contingência

Depender de um único fornecedor ou de uma única rota logística é um risco elevado. Importadores experientes mantêm:

- Pelo menos dois fornecedores qualificados por categoria de produto, quando possível
- Rotas alternativas (marítima, aérea) para situações de emergência
- Estoques de segurança dedicados para produtos críticos
- Acordos com operadores logísticos para fretes expressos em contingência

## Sistemas de Controle: WMS e ERP na Gestão de Estoques

A tecnologia é indispensável para gerenciar estoques importados de forma eficiente. Dois sistemas se destacam: o ERP (Enterprise Resource Planning) e o WMS (Warehouse Management System).

### ERP para Gestão de Estoques

O ERP é o sistema central de gestão do importador. Para a gestão de estoques, as funcionalidades críticas incluem:

- **Controle de múltiplos depósitos:** permite gerenciar estoques em diferentes localizações (CD próprio, recintos alfandegados, entrepostos)
- **Rastreabilidade por lote e validade:** essencial para produtos com prazo de validade ou recall
- **Curva ABC multidimensional:** classificação por valor, giro, lead time e criticidade
- **Cálculo automático de ponto de ressuprimento e estoque de segurança**
- **Previsão de demanda com modelos estatísticos:** média móvel, suavização exponencial, Holt-Winters para sazonalidade
- **Integração com comércio exterior:** módulo que conecta dados de importação (pedido, embarque, desembaraço) ao estoque disponível

### WMS para Operação de Armazém

O WMS é o sistema especializado na gestão física do armazém. Para importadores, as funcionalidades mais relevantes são:

- **Endereçamento dinâmico:** otimiza a alocação de produtos no armazém com base na rotatividade
- **Controle de recebimento por ASN (Advanced Shipping Notice):** pré-avisos de embarque que preparam o armazém para receber a mercadoria
- **Picking inteligente:** roteirização de separação, picking por onda, por zona ou por lote
- **Cross-docking integrado:** planejamento de recebimento e expedição simultâneos
- **Inventário cíclico:** contagens programadas sem paralisação da operação
- **Integração com RFID e código de barras:** rastreabilidade total dos itens

### Integração WMS ↔ ERP

A integração entre WMS e ERP é fundamental para a visibilidade em tempo real dos estoques. As principais interfaces incluem:

- Saldos de estoque atualizados (sincronização a cada 5-15 minutos ou em tempo real)
- Movimentações de entrada, saída e transferência
- Ordens de separação geradas no ERP e executadas no WMS
- Conferência de recebimento (conciliação entre pedido e carga recebida)
- Rastreamento de lotes e validades

Para importadores brasileiros, a TRADEXA oferece conectividade que integra dados de comércio exterior com ERPs e WMS, permitindo que o importador tenha visibilidade completa da cadeia — desde o pedido ao fornecedor até a entrega ao cliente final.

## Gestão de Sazonalidade na Importação

A sazonalidade é um dos maiores desafios da gestão de estoques importados. Produtos com demanda sazonal (brinquedos na época de Natal, moda praia no verão, material escolar em janeiro) exigem planejamento ainda mais rigoroso.

### O Desafio do Lead Time Sazonal

Se um brinquedo tem pico de vendas em outubro-novembro, o importador precisa ter o estoque disponível no Brasil até setembro. Considerando um lead time de 90 dias (3 meses) da Ásia, o pedido precisa ser feito em junho — ou seja, 5 a 6 meses antes da venda. A previsão de demanda precisa ser feita com essa antecedência, o que é extremamente desafiador.

### Estratégias para Sazonalidade

**Pedidos Escalonados com Opção de Cancelamento:** Negociar com o fornecedor a possibilidade de cancelar ou reduzir parte do pedido com pouca multa, caso a demanda projetada não se confirme.

**Produção sob Encomenda com Antecedência:** Para produtos sazonais com lead time muito longo, a produção pode começar antes mesmo de todos os pedidos estarem confirmados.

**Estoque de Segurança Sazonal:** O estoque de segurança para períodos sazonais deve ser calculado separadamente, considerando o desvio-padrão da demanda no período sazonal (que costuma ser maior que na demanda regular).

**Mix de Produtos com Diferentes Sazonalidades:** Manter um portfólio diversificado com produtos de diferentes sazonalidades ajuda a equilibrar a ocupação de capital e a capacidade de armazenagem ao longo do ano.

**Utilização de Trade Intelligence:** Ferramentas como as oferecidas pela TRADEXA permitem analisar dados históricos de importação de mais de 3,8 milhões de empresas para identificar padrões sazonais, antecipar tendências e calibrar as previsões de demanda com mais precisão.

## Custos de Armazenagem e Otimização

Os custos de armazenagem representam uma parcela significativa do custo total de estoque na importação. Otimizar esses custos é essencial para a rentabilidade.

### Tipos de Custos de Armazenagem

- **Armazenagem física (aluguel):** pode variar de R$ 15 a R$ 80/m²/mês, dependendo da localização, qualidade da instalação e serviços incluídos
- **Movimentação interna:** custos de recebimento, estocagem, separação e expedição
- **Seguros:** seguro de mercadorias, responsabilidade civil, incêndio
- **Utilidades:** energia elétrica (especialmente para câmaras frias), água, telecomunicações
- **Mão de obra:** equipe de armazém, supervisão, administração
- **Sistemas:** licenças de WMS, manutenção de equipamentos

### Estratégias de Otimização

**Layout Eficiente:** Um layout bem projetado reduz distâncias percorridas, acelera a movimentação e aumenta a capacidade de armazenagem em 20% a 40%.

**Endereçamento por Rotatividade:** Produtos de alto giro devem ficar próximos à área de expedição. Produtos de baixo giro, nas áreas mais distantes ou superiores.

**Verticalização:** Utilizar prateleiras e porta-paletes de altura adequada ao pé-direito do armazém pode dobrar a capacidade de armazenagem sem aumentar a área locada.

**Inventário Cíclico vs. Inventário Geral:** O inventário cíclico (contagens rotativas de pequenas amostras) reduz a paralisação da operação e mantém a acurácia do estoque acima de 98% sem os custos de um inventário geral.

**WMS com Regras de Alocação Inteligente:** Sistemas modernos podem alocar automaticamente os produtos nas posições mais eficientes, considerando peso, rotatividade, compatibilidade e lotes.

## Métricas e KPIs para Gestão de Estoques na Importação

O que não é medido não é gerenciado. Para uma gestão eficaz, é fundamental acompanhar indicadores específicos.

### Acurácia do Estoque

Mede a concordância entre o estoque físico e o estoque registrado no sistema. Idealmente, deve estar acima de 98%. Abaixo de 95%, indica problemas graves de controle.

Acurácia = (Estoque Físico / Estoque no Sistema) × 100%

### Nível de Serviço (Fill Rate)

Percentual de pedidos atendidos integralmente com o estoque disponível. Para importadores, o ideal é trabalhar com níveis acima de 95%.

Fill Rate = (Pedidos Atendidos Integralmente / Total de Pedidos) × 100%

### Cobertura de Estoque

Já mencionada anteriormente, a cobertura deve ser monitorada semanalmente para produtos importados. Cobertura abaixo do lead time total é um sinal de alerta.

### Giro de Estoque

Também já discutido, o giro deve ser acompanhado por categoria de produto, não apenas no agregado. Produtos com giro muito baixo merecem análise de viabilidade.

### Dias de Estoque em Trânsito

Mede o tempo médio que as mercadorias passam em trânsito, desde o embarque no fornecedor até a disponibilidade no CD. Reduções nesse indicador têm impacto direto na redução de capital imobilizado.

### Custo de Carregamento como Percentual do Estoque Médio

Considera juros, armazenagem, seguros e obsolescência como percentual do valor médio do estoque. Para importação, esse custo pode chegar a 25-35% ao ano, e o ideal é mantê-lo abaixo de 20%.

## A TRADEXA como Aliada na Gestão de Estoques

A TRADEXA é a plataforma de inteligência em comércio exterior que oferece ferramentas essenciais para importadores brasileiros otimizarem sua gestão de estoques.

### Classificação NCM por Inteligência Artificial

A classificação correta da NCM (Nomenclatura Comum do Mercosul) é o primeiro passo para uma importação sem problemas. Um erro de classificação pode resultar em multas, atrasos na liberação e até apreensão da mercadoria. A IA da TRADEXA automatiza esse processo, reduzindo erros e acelerando o desembaraço aduaneiro.

### Dados Tarifários de 31 Países

Com a TRADEXA, o importador pode simular cenários de importação de diferentes origens, considerando tarifas, impostos e acordos comerciais. Isso permite otimizar as decisões de sourcing e reduzir custos de importação.

### Diretório de 3,8 Milhões de Importadores

O maior diretório de importadores do mundo permite que o importador faça benchmark de suas práticas de gestão de estoques, compare prazos e custos com concorrentes e identifique oportunidades de melhoria.

### Dashboards de Trade Intelligence

Os dashboards da TRADEXA oferecem visualização clara e em tempo real dos principais indicadores da gestão de estoques:

- Giro de estoque por produto, categoria e fornecedor
- Cobertura de estoque e projeção de rupturas
- Lead time real vs. planejado
- Custos de carregamento e armazenagem
- Análise de sazonalidade e tendências

### Mapas de Frete Marítimo

A visualização das principais rotas marítimas, com custos e tempos de trânsito, ajuda o importador a planejar com mais precisão os prazos de reposição e a identificar rotas alternativas em caso de contingência.

## Implementação Prática: Roteiro para Gestão de Estoques na Importação

Para importadores que desejam implementar ou aprimorar sua gestão de estoques, recomendamos o seguinte roteiro:

### Passo 1: Diagnóstico (1 mês)

1. Levantar dados históricos de demanda, lead time e estoques dos últimos 12 a 24 meses
2. Calcular os indicadores atuais: giro, cobertura, nível de serviço, acurácia
3. Identificar os produtos com maior valor de estoque (curva A)
4. Mapear os bottlenecks logísticos e aduaneiros que afetam o lead time
5. Avaliar a qualidade dos dados disponíveis nos sistemas atuais

### Passo 2: Modelagem (1 a 2 meses)

1. Definir os parâmetros de gestão para cada categoria de produto:
   - Nível de serviço alvo (95-99% conforme criticidade)
   - Estoque de segurança calculado com dados históricos
   - Ponto de ressuprimento definido
   - Lote econômico de compra calculado
2. Ajustar os parâmetros para produtos sazonais
3. Definir alertas automáticos para pontos críticos
4. Documentar as políticas de gestão de estoques

### Passo 3: Sistematização (2 a 3 meses)

1. Configurar o ERP com os parâmetros definidos
2. Integrar WMS com ERP (se ainda não estiver integrado)
3. Implementar dashboards de acompanhamento
4. Treinar a equipe nos novos processos e ferramentas
5. Definir rotinas de revisão periódica dos parâmetros

### Passo 4: Operação e Melhoria Contínua

1. Acompanhar os indicadores semanalmente
2. Realizar revisões trimestrais dos parâmetros
3. Conduzir auditorias periódicas de acurácia de estoque
4. Alimentar o sistema com dados de desempenho real para refinar os modelos
5. Buscar continuamente oportunidades de redução de lead time e custos

## Conclusão

A gestão de estoques na importação é uma disciplina complexa que combina conceitos clássicos de supply chain com as particularidades do comércio exterior brasileiro. Dominar essa disciplina é o que separa importadores bem-sucedidos daqueles que lutam constantemente com rupturas ou estoques excessivos.

Os pilares de uma gestão eficiente são:

1. **Conhecimento profundo do lead time** e de suas variáveis
2. **Dimensionamento científico do estoque de segurança** considerando tanto a variabilidade da demanda quanto a do lead time
3. **Definição precisa do ponto de ressuprimento** para cada categoria de produto
4. **Utilização de sistemas integrados** (ERP + WMS) com dados em tempo real
5. **Segmentação inteligente** com tratamento diferenciado por criticidade e valor
6. **Monitoramento contínuo de KPIs** com revisão periódica dos parâmetros
7. **Uso de inteligência de dados** para antecipar tendências e mitigar riscos

A TRADEXA oferece o ecossistema de ferramentas que o importador brasileiro precisa para implementar todos esses pilares. Com classificação NCM automatizada por IA, dados tarifários de 31 países, acesso ao maior diretório de importadores do mundo e dashboards de trade intelligence, a TRADEXA transforma dados brutos em decisões estratégicas de gestão de estoques.

Visite tradexa.com.br e descubra como a TRADEXA pode ajudar sua empresa a reduzir custos de estoque, evitar rupturas e aumentar a competitividade no mercado brasileiro.`;

export const keyPoints: string[] | undefined = undefined;
