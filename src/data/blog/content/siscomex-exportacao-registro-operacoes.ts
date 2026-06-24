export const content = `## O que é o Siscomex Exportação e como ele funciona

O Siscomex Exportação é o módulo do Sistema Integrado de Comércio Exterior dedicado ao registro, acompanhamento e controle de todas as operações de exportação realizadas por empresas brasileiras. Assim como o módulo de importação, ele é gerido pela Receita Federal do Brasil em parceria com a SECEX (Secretaria de Comércio Exterior) e integra o Portal Único de Comércio Exterior, iniciativa que modernizou e simplificou os processos aduaneiros no Brasil.

Para o exportador brasileiro, o Siscomex Exportação é a porta de entrada para o mercado internacional. É por meio dele que se registra a DU-E (Declaração Única de Exportação), se vincula a documentação da operação, se acompanha o despacho aduaneiro e se comprova a saída da mercadoria do território nacional. Sem o registro no Siscomex, a exportação não existe legalmente — a mercadoria não pode embarcar, o câmbio não pode ser fechado e os benefícios fiscais não podem ser usufruídos.

O sistema opera com base no conceito de fluxo contínuo, diferente do modelo antigo em que cada etapa era um processo estanque. Hoje, o exportador pode registrar a DU-E, vincular documentos, solicitar desembaraço e acompanhar tudo em tempo real por meio de um painel unificado. Essa integração reduziu significativamente o tempo médio de exportação, que caiu de cerca de 13 dias para menos de 24 horas na maioria das operações.

Neste guia completo, você aprenderá tudo sobre o Siscomex Exportação: como acessar o sistema, registrar suas operações, preencher a DU-E passo a passo, vincular documentos, interpretar as situações da declaração, cumprir prazos e evitar erros que podem comprometer o embarque da sua mercadoria.

## Acesso ao Siscomex Exportação: credenciamento e perfis de usuário

O acesso ao Siscomex Exportação segue o mesmo princípio do módulo de importação: é necessário possuir certificado digital válido (A1 ou A3) e estar credenciado no RADAR da Receita Federal. No entanto, o processo de habilitação para exportação é significativamente mais simplificado do que para importação.

### Credenciamento no RADAR para exportação

A empresa que deseja exportar precisa solicitar a habilitação no RADAR. Diferentemente da importação, que possui três modalidades (Expresso, Limitado e Ilimitado), a exportação não tem limite de valor — a empresa habilitada pode exportar qualquer montante. O processo de habilitação é feito eletronicamente pelo e-CAC (Centro Virtual de Atendimento) da Receita Federal.

O prazo médio para concessão da habilitação é de 5 a 15 dias úteis, desde que toda a documentação esteja correta. Os documentos exigidos incluem:

- Contrato social e alterações registradas na Junta Comercial.
- Comprovante de inscrição no CNPJ.
- Comprovante de endereço da matriz.
- Certificado digital do responsável legal.

Após a habilitação, a empresa deve indicar os usuários que terão acesso ao Siscomex Exportação. Os perfis disponíveis são:

- **Perfil Exportador**: Permite registrar DU-E, consultar operações e anexar documentos. É o perfil padrão para funcionários da empresa exportadora.
- **Perfil Despachante**: Permite operar em nome de terceiros. É utilizado por despachantes aduaneiros e agentes de carga que gerenciam exportações de múltiplos clientes.
- **Perfil Visualização**: Acesso apenas para consulta, sem permissão para registrar ou alterar declarações. Ideal para diretores e gerentes que precisam acompanhar as operações sem interagir com o sistema.

### Configuração técnica

Para acessar o Portal Único, o usuário precisa de um navegador atualizado (Chrome ou Firefox), do plugin de assinatura digital e da instalação do Java Runtime Environment (JRE) versão 8 ou superior. A Receita Federal recomenda o uso do sistema operacional Windows, mas o acesso também é possível via Linux e macOS com as devidas configurações.

O ambiente de homologação está disponível para testes e treinamentos. Utilize-o sempre que precisar testar novos processos, treinar equipes ou validar integrações com sistemas internos antes de realizar operações reais.

## A DU-E passo a passo: da criação ao desembaraço

A DU-E (Declaração Única de Exportação) é o documento central do Novo Processo de Exportação (NPE). Instituída pelo Decreto nº 8.229/2014 e implementada no âmbito do Portal Único, a DU-E substituiu a antiga RE (Registro de Exportação), a DDE (Declaração de Despacho de Exportação) e a DE (Declaração de Exportação), consolidando todas as informações da operação em um único documento eletrônico.

### Passo 1: Acessar o Portal Único e iniciar uma nova DU-E

No Portal Único (https://portalunico.siscomex.gov.br), selecione o módulo de Exportação e clique em "Nova Declaração". O sistema exibirá o formulário de preenchimento dividido em blocos lógicos.

### Passo 2: Preencher o cabeçalho da declaração

No bloco de cabeçalho, informe:

- **Dados do exportador**: CNPJ, razão social e endereço (preenchidos automaticamente com base no certificado digital).
- **Tipo de declaração**: Exportação definitiva, exportação temporária, reexportação, drawback, entre outros.
- **Modalidade de despacho**: Despacho normal (após a chegada da carga no recinto alfandegado) ou despacho antecipado (até 30 dias antes para via marítima, 15 dias para via aérea).
- **Local de despacho**: Porto, aeroporto ou recinto alfandegado onde a mercadoria será desembaraçada.
- **Via de transporte**: Marítima, aérea, rodoviária, ferroviária ou fluvial.

### Passo 3: Registrar as mercadorias

Para cada item a ser exportado, informe:

1. **NCM (Nomenclatura Comum do Mercosul)**: A classificação fiscal da mercadoria. Utilize o classificador NCM da TRADEXA para garantir a precisão da classificação — um código NCM incorreto pode gerar inconsistências no cálculo de tributos e na emissão de documentos fiscais.

2. **Descrição detalhada da mercadoria**: Seja específico. Em vez de "peças automotivas", prefira "pistões da categoria 8409 para motores de combustão interna, do tipo utilizado em veículos automotores, em aço forjado".

3. **Quantidade e unidade de medida**: Informe a quantidade comercial (unidades, kg, litros, etc.) e a quantidade estatística (sempre em kg).

4. **Valor da mercadoria**: Valor em dólares americanos (USD), conforme a fatura comercial. O câmbio utilizado será o da data do registro da DU-E.

5. **País de destino**: País para onde a mercadoria está sendo exportada.

6. **Condição de venda (Incoterm)**: Ex-factory, FOB, CIF, CPT, DAP, etc. O Incoterm determina a alçada de responsabilidade entre exportador e importador.

### Passo 4: Vincular documentos

Nesta etapa, você deve anexar todos os documentos da operação:

- Fatura Comercial (Commercial Invoice).
- Conhecimento de Embarque (Bill of Lading, Air Waybill ou CRT).
- Packing List (Romaneio de Carga).
- Certificado de Origem (se aplicável, para usufruir de benefícios tarifários).
- Documentos específicos exigidos por órgãos anuentes (ANVISA, MAPA, INMETRO, Exército, IBAMA, etc.).

A vinculação é feita diretamente no sistema, arrastando os arquivos ou selecionando-os no computador. O sistema aceita formatos PDF, XML e imagem (JPEG, PNG). Certifique-se de que os documentos estejam legíveis e dentro do prazo de validade.

### Passo 5: Revisar e assinar a declaração

Antes de registrar, revise todas as informações. O sistema oferece uma tela de resumo onde você pode conferir cada bloco. Após a revisão, clique em "Registrar Declaração" e assine digitalmente com seu certificado. A assinatura eletrônica é o ato que formaliza o registro da DU-E no Siscomex.

### Passo 6: Acompanhar o despacho aduaneiro

Após o registro, a DU-E entra em fila de análise. O painel do Siscomex Exportação permite acompanhar o status em tempo real. Você verá quando a declaração é selecionada para conferência, quando o desembaraço é autorizado e quando o embarque é confirmado.

## Situações da DU-E: registrada, desembaraçada e embarcada

Compreender as situações da DU-E é fundamental para gerenciar corretamente suas exportações. Cada situação representa uma etapa do ciclo de vida da declaração e tem implicações operacionais e fiscais.

### DU-E Registrada

A situação "Registrada" significa que a declaração foi registrada no Siscomex e aguarda a seleção para o canal de conferência. Neste momento, o sistema ainda está validando as informações prestadas. A DU-E registrada pode ser retificada pelo exportador, desde que não tenha sido selecionada para conferência.

### DU-E Selecionada para Conferência

Quando a DU-E é selecionada, o sistema define o canal de parametrização:

- **Canal Verde**: Desembaraço automático. A mercadoria pode ser embarcada imediatamente.
- **Canal Laranja**: Conferência documental. O exportador precisa apresentar os documentos originais para verificação.
- **Canal Vermelho**: Conferência documental e física. A mercadoria será inspecionada.

### DU-E Desembaraçada

A situação "Desembaraçada" é a autorização para embarque. A mercadoria pode ser carregada no veículo transportador. Este é o momento em que o exportador deve emitir a NF-e (Nota Fiscal Eletrônica) de exportação, se ainda não o fez.

O prazo para embarque após o desembaraço é de 30 dias para via marítima e 15 dias para via aérea e rodoviária. Caso o prazo expire sem o embarque, a DU-E é cancelada automaticamente e um novo registro precisará ser feito.

### DU-E Embarcada

A situação "Embarcada" confirma que a mercadoria saiu do território nacional. O sistema recebe a confirmação de embarque do operador portuário ou aeroportuário. Esta é a situação final da DU-E, essencial para:

- Comprovar a exportação para fins fiscais (isenção de ICMS, IPI, PIS e COFINS).
- Fechar o câmbio de exportação.
- Habilitar o drawback (suspensão de tributos).
- Gerar o registro de exportação para o Radar.

### DU-E Cancelada

Uma DU-E pode ser cancelada a qualquer momento antes do embarque, desde que não haja impedimentos fiscais. O cancelamento pode ser solicitado pelo exportador ou ocorrer automaticamente por decurso de prazo (30 dias marítimo, 15 dias aéreo/rodoviário sem embarque após o desembaraço).

### Gerenciamento de múltiplas DU-Es

Para empresas que exportam grandes volumes, gerenciar dezenas ou centenas de DU-Es simultaneamente é um desafio. O TRADEXA Smart Rank oferece painéis inteligentes que consolidam o status de todas as suas declarações em tempo real, com indicadores de tempo médio de desembaraço, gargalos operacionais e performance por produto e destino. Essa visão consolidada permite tomar decisões rápidas e corrigir rotas antes que problemas se agravem.

## Vinculação de documentos na DU-E: regras e boas práticas

A vinculação de documentos é uma das etapas mais críticas do registro da DU-E. Documentos incorretos ou inconsistentes são a principal causa de retenção em canais de conferência.

### Documentos obrigatórios

- **Fatura Comercial (Commercial Invoice)**: Deve conter a descrição da mercadoria (em português ou inglês), valor unitário e total, condições de venda (Incoterm), dados do exportador e do importador, e número da fatura. É recomendável que a fatura esteja em papel timbrado do exportador.

- **Conhecimento de Embarque**: O documento de transporte varia conforme a via:
  - Marítimo: Bill of Lading (BL) original ou HB/L (House Bill of Lading).
  - Aéreo: Air Waybill (AWB).
  - Rodoviário: Conhecimento de Transporte Rodoviário (CRT) ou Carta de Porte Internacional (CPI).
  - Ferroviário: Conhecimento de Transporte Ferroviário.

- **Packing List**: Relaciona volumes, pesos e dimensões. Essencial para conferência física.

### Documentos específicos por produto

- **Produtos de origem animal ou vegetal**: Certificado Fitossanitário (MAPA), Certificado Sanitário (ANVISA).
- **Produtos químicos controlados**: Declaração de Conteúdo (IBAMA/Exército).
- **Produtos com certificação INMETRO**: Laudo de Conformidade.
- **Produtos sujeitos a cotas**: Certificado de Origem (Mercosul, ALADI, SGP, etc.).

### Boas práticas de vinculação

1. **Padronize a nomenclatura dos arquivos**: Use o padrão "NUMERO_DU-E_TIPO_DOCUMENTO_DATA" (ex.: 25BR0001234567_INVOICE_20250315).

2. **Verifique a consistência das informações**: Cruze os dados da fatura com os do conhecimento de embarque e do packing list. Qualquer divergência — por menor que seja — pode gerar retenção no canal laranja.

3. **Digitalize com qualidade**: Documentos ilegíveis são considerados não apresentados. Use resolução mínima de 300 DPI em preto e branco.

4. **Mantenha os originais disponíveis**: Embora a vinculação seja eletrônica, a fiscalização pode solicitar os documentos originais a qualquer momento.

5. **Utilize certificados de origem digitais**: Quando possível, utilize certificados de origem eletrônicos, que são vinculados automaticamente ao Siscomex.

O diretório de importadores da TRADEXA, com mais de 3,8 milhões de empresas cadastradas, é uma ferramenta estratégica nesta etapa. Ao exportar para um novo comprador, consulte a base de dados para verificar o histórico de operações, a saúde financeira e a reputação do importador. Exportar para um importador desconhecido ou com histórico de inadimplência é um risco que pode comprometer não apenas a operação atual, mas todo o fluxo de caixa da empresa.

## Prazos críticos no Siscomex Exportação

O cumprimento de prazos é essencial para o sucesso de uma exportação. O Siscomex Exportação estabelece prazos específicos para cada etapa do processo, e o descumprimento pode resultar em multas, cancelamento da declaração e perda de benefícios fiscais.

### Prazo para registro da DU-E

A DU-E deve ser registrada antes do embarque da mercadoria. No despacho antecipado:

- **Via marítima**: Até 30 dias antes da data prevista de atracação.
- **Via aérea**: Até 15 dias antes da data prevista de voo.
- **Via rodoviária**: Até 15 dias antes da data prevista de chegada ao posto de fronteira.

No despacho normal (após a chegada da carga no recinto alfandegado), o prazo é de até 15 dias para registrar a DU-E contados da data de entrada da mercadoria no recinto.

### Prazo para desembaraço

Após o registro, o prazo para desembaraço varia conforme o canal:

- **Canal Verde**: Até 24 horas.
- **Canal Laranja**: De 2 a 5 dias úteis.
- **Canal Vermelho**: De 5 a 15 dias úteis.

### Prazo para embarque após desembaraço

- **Marítimo**: Até 30 dias.
- **Aéreo**: Até 15 dias.
- **Rodoviário**: Até 15 dias.

Após o vencimento do prazo sem embarque, a DU-E é automaticamente cancelada e o exportador precisa registrar uma nova declaração, pagando novamente as taxas e tributos incidentes.

### Prazo para comprovação de embarque

O exportador tem até 90 dias após a data de emissão da Nota Fiscal para comprovar o embarque da mercadoria. Essa comprovação é feita automaticamente pelo sistema quando a DU-E é atualizada para a situação "Embarcada".

### Prazo para fechamento de câmbio

O câmbio de exportação deve ser fechado no prazo estabelecido pelo Banco Central, que varia conforme a modalidade:

- **Exportação com cobertura cambial até 180 dias**: Prazo de 180 dias para fechamento.
- **Exportação com prazo superior a 180 dias**: Prazo de 360 dias.
- **Operações intercompany**: Prazo de 360 dias.

O não cumprimento dos prazos cambiais pode gerar multas aplicadas pelo Banco Central e complicações com a Receita Federal.

### Controle de prazos com ferramentas inteligentes

Gerenciar múltiplos prazos simultaneamente é desafiador. O TRADEXA Trade Intelligence oferece um painel de monitoramento que centraliza todos os prazos críticos das suas exportações: vencimento de DU-E, prazo para embarque, prazo para fechamento de câmbio, validade de certificados e licenças. O sistema envia alertas automáticos com antecedência configurável, permitindo que você tome ações corretivas antes que os prazos expirem.

Além disso, o Tarifário de 31 países da TRADEXA permite consultar as alíquotas de importação praticadas pelo país de destino, informações essenciais para precificar corretamente a exportação e para verificar se o importador está usufruindo de benefícios tarifários que tornem seu produto mais competitivo no mercado internacional.

## Erros comuns no registro de exportação e como evitá-los

Conhecer os erros mais frequentes no Siscomex Exportação é o primeiro passo para evitá-los. Abaixo, os principais equívocos cometidos por exportadores e as estratégias para preveni-los.

### Erro 1: NCM incorreta ou desatualizada

Uma NCM incorreta na DU-E pode gerar:
- Cálculo errado de tributos (quando aplicável).
- Impedimentos no despacho aduaneiro.
- Inconsistências na nota fiscal de exportação.
- Problemas no Drawback (se a empresa utiliza esse regime).

**Como evitar**: Utilize o classificador NCM da TRADEXA, que conta com inteligência artificial para sugerir a NCM mais adequada com base na descrição detalhada da mercadoria. A ferramenta é atualizada automaticamente com as alterações da TEC (Tarifa Externa Comum do Mercosul) e da Receita Federal.

### Erro 2: Documentação inconsistente

Divergências entre a fatura comercial, o conhecimento de embarque e o packing list são o motivo mais comum de retenção em canais de conferência. Exemplos típicos incluem:
- Valor total da fatura diferente do valor declarado na DU-E.
- Peso bruto do packing list diferente do peso do conhecimento de embarque.
- Descrição da mercadoria incompleta ou genérica.

**Como evitar**: Crie um protocolo interno de verificação cruzada de documentos. Antes de vincular os arquivos na DU-E, confira todos os campos críticos (descrição, valor, peso, quantidade) em todos os documentos.

### Erro 3: Não verificar a necessidade de licenciamento

Algumas mercadorias exigem licenciamento prévio ou autorização de órgãos anuentes mesmo na exportação. Produtos controlados pelo Exército (armas, munições, explosivos), pela ANVISA (medicamentos, produtos para saúde) e pelo IBAMA (produtos químicos controlados, madeira) são exemplos clássicos.

**Como evitar**: Consulte a lista de NCMs sujeitas a licenciamento no próprio Siscomex ou utilize o TRADEXA Trade Intelligence, que cruza automaticamente a NCM com a base de órgãos anuentes e sinaliza se há exigência de licenciamento para a operação.

### Erro 4: Atraso no registro da DU-E

Registrar a DU-E em cima da hora do embarque aumenta o risco de problemas. Se a declaração for selecionada para canal vermelho, a inspeção física pode atrasar o embarque e gerar custos adicionais.

**Como evitar**: Antecipe-se. Registre a DU-E assim que todos os documentos estiverem disponíveis. O despacho antecipado é seu aliado — use-o sempre que possível.

### Erro 5: Não conferir a validade dos certificados e licenças

Certificados de origem, licenças de exportação e outros documentos com prazo de validade expirado são rejeitados pelo sistema.

**Como evitar**: Mantenha uma agenda de validade de documentos. Configure alertas no TRADEXA Trade Intelligence para ser notificado com antecedência sobre vencimentos próximos.

### Erro 6: Ignorar as particularidades do país de destino

Cada país tem suas regras de importação. O que é permitido no Mercosul pode ser proibido na União Europeia ou nos Estados Unidos. Exportar sem conhecer as exigências do país de destino é um dos erros mais custosos.

**Como evitar**: Antes de fechar negócio, consulte o Tarifário de 31 países da TRADEXA para verificar alíquotas, barreiras tarifárias e exigências documentais do país de destino. O Mapa de Frete Marítimo também ajuda a identificar a rota mais eficiente e econômica para cada destino.

### Erro 7: Falha na contratação de câmbio

Deixar para contratar o câmbio na última hora pode inviabilizar a operação. O exportador precisa ter a cobertura cambial contratada antes do embarque.

**Como evitar**: Estabeleça uma rotina de fechamento de câmbio com prazos folgados em relação ao embarque. Mantenha linhas de crédito pré-aprovadas com seu banco de relacionamento.

## Como a TRADEXA impulsiona suas exportações

Exportar é um processo desafiador, mas as ferramentas certas fazem toda a diferença. A TRADEXA nasceu para ser a plataforma de inteligência de mercado que todo exportador brasileiro precisa para competir em escala global.

O **Classificador NCM Inteligente** elimina o erro humano na classificação fiscal, sugerindo o código NCM correto com base em inteligência artificial treinada em milhões de classificações já realizadas. Isso reduz drasticamente o risco de inconsistências na DU-E e acelera o desembaraço.

O **Tarifário de 31 países** é uma fonte de informação estratégica para qualquer exportador. Com ele, você consulta as alíquotas de importação praticadas pelos principais mercados compradores do Brasil, identifica oportunidades de redução de tarifas via acordos comerciais e precifica seus produtos de forma competitiva.

O **Diretório de Importadores** com mais de 3,8 milhões de empresas é a maior base de inteligência competitiva do Brasil. Você pode identificar potenciais compradores por NCM, país, volume de importação e frequência de operações. Imagine poder segmentar exatamente os importadores que compram o seu tipo de produto em cada país — isso é o que o diretório da TRADEXA oferece.

O **Smart Rank** ranqueia seus produtos, destinos e concorrentes com base em indicadores de desempenho. Você identifica rapidamente quais mercados estão crescendo, quais produtos têm maior demanda e como sua empresa se posiciona frente à concorrência.

O **Mapa de Frete Marítimo** oferece visibilidade completa das rotas de exportação, com dados de fretes praticados, tempo de trânsito, capacidades portuárias e frequência de navios. Use essa informação para negociar melhores condições com armadores e otimizar sua logística internacional.

O **Trade Intelligence** integra todos esses dados em um painel unificado, com alertas inteligentes, dashboards personalizados e relatórios exportáveis. Você monitora suas exportações em tempo real, identifica gargalos e toma decisões baseadas em dados concretos.

## Considerações finais

Dominar o Siscomex Exportação é o caminho para transformar sua empresa em uma exportadora de alto desempenho. Neste guia, você aprendeu desde os fundamentos do sistema até as técnicas avançadas de registro e gerenciamento de operações, passando pelo passo a passo completo da DU-E, a vinculação de documentos, as situações da declaração, os prazos críticos e as estratégias para evitar erros comuns.

O mercado internacional está mais acessível do que nunca para as empresas brasileiras. A modernização do Siscomex, com o Portal Único e a DU-E, reduziu drasticamente a burocracia e o tempo de exportação. No entanto, a complexidade do comércio exterior exige conhecimento técnico, atenção aos detalhes e, cada vez mais, o suporte de tecnologia especializada.

A TRADEXA é a parceira ideal para essa jornada. Com nossas ferramentas de classificação NCM, tarifário internacional, diretório de importadores, trade intelligence, smart rank e mapa de frete marítimo, você tem à disposição a inteligência de mercado mais completa do Brasil.

Invista em conhecimento, mantenha-se atualizado sobre as mudanças normativas, organize seus processos e conte com a tecnologia a seu favor. O mundo está de portas abertas para os produtos brasileiros — e o Siscomex Exportação é o passaporte para essa jornada.`;

export const keyPoints: string[] | undefined = undefined;
