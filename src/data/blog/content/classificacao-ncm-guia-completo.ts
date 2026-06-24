export const content = `## O que é a Classificação NCM?

A Nomenclatura Comum do Mercosul (NCM) é o sistema de classificação de mercadorias adotado pelo Brasil e demais países do Mercosul. Ela é baseada no Sistema Harmonizado (SH), administrado pela Organização Mundial das Alfândegas (OMA).

Cada produto importado ou exportado no Brasil precisa ser classificado em um código NCM de 8 dígitos. Esse código determina:

- As alíquotas de impostos federais (II, IPI, PIS, COFINS)
- O ICMS estadual aplicável
- Regulamentações específicas (ANVISA, INMETRO, DECEX)
- Benefícios fiscais como drawback e ex-tarifário
- Estatísticas oficiais de comércio exterior

## Estrutura do Código NCM

O código NCM tem 8 dígitos, organizados em 4 níveis:

- **XX** — Capítulo (2 dígitos): Ex: 84 — Máquinas e aparelhos mecânicos
- **XXXX** — Posição (4 dígitos): Ex: 8471 — Máquinas automáticas para processamento de dados
- **XXXXXX** — Subposição (6 dígitos = código SH internacional): Ex: 847130 — Máquinas portáteis de peso ≤ 10kg
- **XXXXXXXX** — Item NCM (8 dígitos, específico do Mercosul): Ex: 84713011 — Notebooks

Os 6 primeiros dígitos são idênticos em todos os 200+ países que adotam o SH. Os 2 últimos são específicos do Mercosul.

## Diferença entre NCM, HS e HTS

- **HS (Harmonized System)** — Código de 6 dígitos, padrão internacional. Usado para tarifas OMC e estatísticas globais.
- **NCM (Nomenclatura Comum do Mercosul)** — Código de 8 dígitos usado no Brasil, Argentina, Paraguai e Uruguai.
- **HTS (Harmonized Tariff Schedule)** — Código de 8 a 10 dígitos usado pelos Estados Unidos para tarifas de importação.

Ao exportar para os EUA, por exemplo, você precisa do HS (6 dígitos) e também do HTS (10 dígitos) para calcular tarifas americanas. A TRADEXA oferece classificação tripla — NCM, HS e HTS — em uma única consulta com IA.

## Erros Comuns na Classificação NCM

1. **Descrição genérica demais** — "Peças para máquinas" sem especificar o tipo de máquina
2. **Confundir matéria-prima com produto acabado** — Uma camiseta de algodão não classifica na mesma posição que fio de algodão
3. **Ignorar Regras Gerais de Interpretação (RGI)** — A RGI 1 determina que a classificação começa pelo texto da posição
4. **Não considerar Notas de Seção e Capítulo** — Exclusões e inclusões específicas por capítulo

## Como a IA Pode Ajudar na Classificação

A classificação NCM exige conhecimento técnico da tabela e atualização constante. Ferramentas de inteligência artificial como o Classificador NCM da TRADEXA podem:

- Processar descrições em linguagem natural (português, inglês, espanhol)
- Sugerir múltiplos códigos com nível de confiança
- Exibir alíquotas completas para cada sugestão
- Aprender com correções do usuário ao longo do tempo

> **Dica:** Use o [Classificador NCM com IA da TRADEXA](/landing/ncm-classifier) para classificar seus produtos em segundos. Descreva o produto em português e receba NCM, HS e HTS automaticamente.

## Consequências de uma Classificação Incorreta

Classificar errado pode gerar:
- Pagamento a maior ou menor de impostos
- Multas de até 75% do valor dos tributos
- Retenção da mercadoria na alfândega
- Processos administrativos e judiciais

Por isso, investir em uma classificação precisa é essencial para qualquer operação de comércio exterior.

## Uso do Classificador NCM com IA da TRADEXA: Passo a Passo

O Classificador NCM com IA da TRADEXA foi desenvolvido para tornar a classificação fiscal mais rápida e precisa. Veja o passo a passo completo:

**1. Acesse o Classificador**
Vá até a página do [Classificador NCM com IA](/landing/ncm-classifier) e crie uma conta gratuita se ainda não tiver.

**2. Descreva o Produto em Linguagem Natural**
Digite a descrição detalhada do produto em português, inglês ou espanhol. Quanto mais específico, melhor. Exemplos:
- "Notebook ultrafino com processador Intel Core i7, 16GB RAM, SSD 512GB, tela 15.6 polegadas Full HD"
- "Bombas centrífugas para líquidos, monobloco, vazão 50m³/h, motor elétrico trifásico"

**3. Receba Sugestões com Nível de Confiança**
A IA processa a descrição e retorna os 5 códigos mais prováveis, ordenados por nível de confiança (de 0% a 100%). Cada sugestão inclui:
- Código NCM de 8 dígitos
- Código HS internacional de 6 dígitos
- Código HTS americano de 10 dígitos (quando aplicável)
- Alíquotas completas de II, IPI, PIS, COFINS e ICMS

**4. Compare e Selecione**
Analise as opções e selecione a mais adequada com base nas Regras Gerais de Interpretação (RGI), Notas de Seção e Capítulo, e seu conhecimento do produto.

**5. Valide com Especialista (Opcional)**
Para operações de alto valor, você pode solicitar a validação manual por um especialista TRADEXA, que analisa a classificação proposta e emite um parecer técnico.

**6. Exporte o Relatório**
O sistema gera um relatório completo em PDF ou CSV com todos os dados da classificação, pronto para ser utilizado na Declaração de Importação e demais documentos aduaneiros.

> **Dica profissional:** Quanto mais detalhada a descrição, mais precisa é a classificação. Inclua sempre material de fabricação, função principal, aplicação específica e características técnicas relevantes.

## Processo de Validação NCM

A validação do código NCM é uma etapa crítica que deve seguir estas fases:

**Validação Automática no SISCOMEX**
O sistema verifica se o código NCM informado existe na tabela vigente e se está ativo para operações de comércio exterior.

**Validação de Consistência**
A descrição do produto deve ser compatível com o capítulo e a posição NCM selecionados. Por exemplo, um produto descrito como "calçado esportivo" não pode ser classificado no Capítulo 84 (máquinas).

**Validação Regulatória (Órgãos Anuentes)**
Dependendo do NCM, órgãos como ANVISA, INMETRO, DECEX, IBAMA e MAPA verificam se o produto atende às regulamentações específicas antes de permitir o licenciamento.

**Validação Tributária**
Confirmação automática das alíquotas aplicáveis ao código informado, incluindo benefícios fiscais, ex-tarifários e regimes especiais.

**Validação Pós-Desembaraço**
A Receita Federal pode reclassificar o produto até 5 anos após a importação em processo de auditoria fiscal. Manter a documentação técnica que justifique a classificação é essencial.

A TRADEXA oferece validação em tempo real durante o processo de classificação, alertando sobre inconsistências antes do registro da DI e evitando retificações posteriores.

## NCM por Setor Específico

### Setor Automotivo
O setor automotivo concentra-se principalmente no **Capítulo 87** (Veículos automóveis, tratores, ciclos e outros). As classificações mais comuns incluem:
- **8703** — Automóveis de passageiros (incluindo SUVs e picapes)
- **8704** — Veículos para transporte de mercadorias
- **8708** — Partes e acessórios para veículos automotivos
- **8407** — Motores de pistão por ignição por centelha
- **8483** — Eixos, engrenagens e transmissões
- **4011** — Pneumáticos novos para veículos

**Atenção:** Peças automotivas exigem cuidado redobrado. Uma pastilha de freio (NCM 68138100) é classificada de forma diferente de um disco de freio (NCM 87083000). Erro comum: classificar peças de borracha no Capítulo 40 quando deveriam estar no Capítulo 87 como parte específica de veículo.

### Setor Eletrônico
O **Capítulo 85** (Máquinas e aparelhos elétricos) é o mais utilizado, mas o **Capítulo 84** também é relevante para equipamentos de TI:
- **8471** — Computadores, servidores e unidades de armazenamento
- **8517** — Telefones, smartphones e equipamentos de comunicação
- **8523** — Discos, fitas e memórias semicondutoras
- **8542** — Circuitos integrados e microeletrônicos
- **8528** — Monitores e projetores
- **8415** — Máquinas e aparelhos de ar condicionado

A rápida evolução tecnológica exige atenção: um smartphone com funcionalidades de IA pode exigir classificação diferente de um modelo anterior. Consulte sempre as Notas Explicativas do SH (NESH) atualizadas.

### Setor Farmacêutico
O **Capítulo 30** (Produtos farmacêuticos) e **Capítulo 29** (Produtos químicos orgânicos) são predominantes:
- **3002** — Vacinas, soros e hemoderivados
- **3003** — Medicamentos em doses (para venda a granel)
- **3004** — Medicamentos em formas farmacêuticas (comprimidos, cápsulas, injetáveis)
- **3005** — Algodão, gaze e ataduras
- **2936-2942** — Vitaminas, pró-vitaminas e hormônios

Cada medicamento tem classificação específica baseada no princípio ativo e na forma farmacêutica. A ANVISA exige que o registro do produto esteja alinhado com o NCM informado na importação.

### Setor de Alimentos
Os alimentos distribuem-se entre os Capítulos 1 a 24 e exigem atenção ao grau de processamento:
- **0201-0210** — Carnes e miudezas comestíveis (frescas, refrigeradas ou congeladas)
- **0401-0410** — Laticínios, ovos e mel natural
- **1001-1008** — Cereais (arroz, trigo, milho, cevada)
- **1501-1518** — Gorduras, óleos e ceras animais/vegetais
- **1901-1905** — Preparações à base de cereais, massas e produtos de panificação
- **2001-2009** — Preparações de frutas, hortaliças e outros vegetais

**Exemplo prático:** Tomate fresco classifica no Capítulo 07 (0702), enquanto molho de tomate classifica no Capítulo 21 (2103). O grau de processamento industrial determina a classificação correta.

### Setor Têxtil
A classificação têxtil abrange os Capítulos 50 a 63, divididos por tipo de fibra e nível de processamento:
- **Capítulo 50** — Seda
- **Capítulo 51** — Lã e pelos finos
- **Capítulo 52** — Algodão
- **Capítulo 53** — Fibras têxteis vegetais (linho, juta, sisal)
- **Capítulo 54** — Filamentos sintéticos ou artificiais
- **Capítulo 55** — Fibras sintéticas ou artificiais descontínuas
- **Capítulo 61** — Vestuário de malha
- **Capítulo 62** — Vestuário de tecido plano
- **Capítulo 63** — Outros artigos têxteis confeccionados

**Regra fundamental:** Vestuário de malha (tricot) classifica-se no Capítulo 61, enquanto vestuário de tecido plano (tecido convencional) classifica-se no Capítulo 62 — independentemente do material de fabricação.

## Fiscalização e Penalidades por Classificação Incorreta

A Receita Federal mantém fiscalização rigorosa sobre a classificação NCM, com operações de auditoria cada vez mais frequentes. Entre 2023 e 2026, o foco tem sido em NCMs de alta incidência de erro, especialmente dos Capítulos 84, 85, 87 e 90.

**Penalidades aplicáveis:**
- **Multa de 75%** sobre a diferença de tributos quando a classificação incorreta é considerada erro culposo (sem intenção de fraudar)
- **Multa agravada de 225%** quando há indício de dolo, fraude ou simulação
- **Apreensão da mercadoria** até a regularização da classificação, com custos de armazenagem por conta do importador
- **Representação fiscal para fins penais** em casos de falsidade ideológica (artigo 299 do Código Penal)
- **Inabilitação temporária do importador** no RADAR (Siscomex) por até 2 anos em casos reincidentes
- **Responsabilidade solidária** do despachante aduaneiro e do agente de carga quando comprovada participação no erro

**Como se proteger:** Mantenha um dossiê técnico de cada classificação, contendo laudos técnicos, catálogos do fabricante, certificados de análise e correspondência com o exportador sobre a composição do produto.

## NCM para Exportação: Requisitos por País de Destino

Ao exportar, a classificação correta é igualmente importante, mas cada país tem seu próprio sistema de desdobramento do SH:

| Destino | Sistema | Dígitos | Base |
|---------|---------|---------|------|
| Brasil (Mercosul) | NCM | 8 | SH + Mercosul |
| Argentina, Paraguai, Uruguai | NCM | 8 | SH + Mercosul |
| Estados Unidos | HTS (Harmonized Tariff Schedule) | 8-10 | SH + USITC |
| União Europeia | TARIC | 10 | SH + Comissão Europeia |
| China | HS China | 10 | SH + Aduanas Chinesas |
| Japão | HS Japan | 9 | SH + Alfândega Japonesa |
| Canadá | Customs Tariff | 8-10 | SH + CBSA |
| Austrália | Customs Tariff | 8 | SH + ABF |
| Demais países | HS | 6 | SH (padrão OMA) |

**Importante:** Os 6 primeiros dígitos (HS internacional) são idênticos em todos os 200+ países signatários do SH. A divergência começa a partir do 7º dígito. A TRADEXA oferece classificação tripla automática — NCM (8 dígitos), HS (6 dígitos) e HTS (10 dígitos) — em uma única consulta, facilitando operações em qualquer mercado.

## Estrutura dos Capítulos NCM

A NCM é organizada em 21 Seções e 97 Capítulos (dos quais 93 estão atualmente em uso), seguindo a estrutura do SH:

| Seção | Capítulos | Descrição |
|-------|-----------|-----------|
| I | 1-5 | Animais vivos e produtos do reino animal |
| II | 6-14 | Produtos do reino vegetal |
| III | 15 | Gorduras, óleos e ceras |
| IV | 16-24 | Produtos das indústrias alimentares |
| V | 25-27 | Produtos minerais |
| VI | 28-38 | Produtos das indústrias químicas |
| VII | 39-40 | Plástico e borracha |
| VIII | 41-43 | Peles, couros e obras |
| IX | 44-46 | Madeira e obras de madeira |
| X | 47-49 | Papel, celulose e obras |
| XI | 50-63 | Têxteis e obras |
| XII | 64-67 | Calçados, chapéus e guarda-chuvas |
| XIII | 68-70 | Obras de pedra, vidro e cerâmica |
| XIV | 71 | Pérolas, pedras preciosas |
| XV | 72-83 | Metais comuns e obras |
| XVI | 84-85 | Máquinas e equipamentos mecânicos/elétricos |
| XVII | 86-89 | Veículos e equipamentos de transporte |
| XVIII | 90-92 | Instrumentos de precisão, relojoaria |
| XIX | 93 | Armas e munições |
| XX | 94-96 | Mercadorias diversas |
| XXI | 97 | Obras de arte e antiguidades |

## Atualizações NCM em 2026

A NCM é atualizada anualmente com base nas emendas aprovadas pela Organização Mundial das Alfândegas (OMA). Em 2026, as principais alterações incluem:

- **Capítulo 84** — Novos códigos para impressoras 3D (fabricação aditiva), robôs colaborativos (cobots) e equipamentos de automação inteligente
- **Capítulo 85** — Revisão completa dos códigos de baterias para veículos elétricos, módulos fotovoltaicos e semicondutores de potência; novos NCMs para dispositivos IoT e wearables
- **Capítulo 90** — Novos códigos para dispositivos médicos inteligentes com IA embarcada, sensores ópticos avançados e equipamentos de telemedicina
- **Capítulo 38** — Atualização nos códigos de produtos químicos sustentáveis e biodegradáveis
- **Capítulo 95** — Novos NCMs para brinquedos eletrônicos com conectividade
- **Produtos de dupla finalidade** — Novas subposições para controlar melhor produtos que podem ter uso civil e militar

É fundamental consultar a Tabela de Incidência do IPI (TIPI) atualizada anualmente pelo Decreto Federal, que incorpora todas as alterações da NCM e reflete nas alíquotas de IPI.

> **🔧 Ferramentas Relacionadas: [Classificador NCM com IA](/landing/ncm-classifier) | [HTS Lookup](/hts-lookup)**
> Classifique seus produtos automaticamente em NCM, HS e HTS com inteligência artificial em segundos.
> [Teste agora →](/landing/ncm-classifier) | [Consultar HTS →](/hts-lookup)
## Ferramentas TRADEXA Relacionadas

- **[Classificador NCM com IA](/landing/ncm-classifier)** — Classifique produtos em segundos
- **[Calculadora de Importação](/ferramentas/calculadora-importacao)** — Simule todos os custos de uma importação
- **[Guia de Importação](/guia-importacao)** — Guia completo do processo de importação

> Simplifique seu comércio exterior com dados reais — [teste grátis em tradexa.com.br](https://tradexa.com.br)
`;
export const keyPoints: string[] | undefined = undefined;
