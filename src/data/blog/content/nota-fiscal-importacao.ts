export const content = `### O Que é a Nota Fiscal de Importação?

A Nota Fiscal de Importação (NF-e de Importação) é o documento fiscal eletrônico que registra a entrada de mercadorias estrangeiras no Brasil. Ela é emitida pelo importador após o desembaraço aduaneiro e serve como comprovante da operação para fins fiscais e contábeis.

Diferente da Nota Fiscal de compra nacional, a NF-e de importação inclui informações específicas como: número da Declaração de Importação (DI), valor aduaneiro, tributos pagos na importação e o país de origem da mercadoria.

## Como é Gerada

A NF-e de importação é gerada no sistema estadual de Nota Fiscal Eletrônica (NF-e) após o desembaraço aduaneiro. O processo ocorre em etapas:

1. **Desembaraço aduaneiro** — A Receita Federal libera a mercadoria
2. **Recolhimento de tributos** — II, IPI, PIS, COFINS e ICMS são pagos
3. **Emissão da NF-e** — O importador emite a NF-e no sistema estadual
4. **Registro no Siscomex** — A NF-e é vinculada à DI no portal Único

O prazo para emissão da NF-e varia conforme o estado, mas geralmente é de até 30 dias após o desembaraço.

## Campos Importantes

A NF-e de importação possui campos específicos que devem ser preenchidos corretamente:

- **CFOP 3102** — Compra para comercialização (importação direta)
- **CFOP 3127** — Compra para comercialização (via intermediário)
- **CNPJ do Importador** — Deve ser o mesmo da DI
- **Código NCM** — Mesmo código da Declaração de Importação
- **Valor Aduaneiro** — Valor CIF em reais (conforme câmbio da DI)
- **II, IPI, PIS, COFINS** — Valores pagos na importação

## Validação e Consulta

A NF-e de importação pode ser validada no site da SEFAZ do estado. Para consultar: acesse o portal da SEFAZ, informe a chave de acesso (44 dígitos) e verifique se a nota está autorizada.

A chave de acesso é composta por: UF (2 dígitos) + AAMM (4 dígitos) + CNPJ (14 dígitos) + modelo (2 dígitos) + série (3 dígitos) + número (9 dígitos) + código aleatório (8 dígitos) + dígito verificador (1 dígito).

## Relação com a DI

A NF-e de importação deve obrigatoriamente estar vinculada à Declaração de Importação (DI). O número da DI é informado no campo "informações complementares" da NF-e. Essa vinculação é essencial para: comprovar a origem da mercadoria, validar o crédito de ICMS e atender a auditorias fiscais.

## Erros Comuns

- **CFOP errado** — Usar 1xxx (nacional) em vez de 3xxx (importação)
- **Valor divergente** — NF-e com valor diferente do valor aduaneiro
- **NCM incompatível** — Código NCM diferente da DI
- **Prazo excedido** — Emissão da NF-e após o prazo permitido

> **Mantenha a conformidade** usando as ferramentas da TRADEXA para classificar produtos e calcular custos de importação corretamente.

## Tipos de NF-e na Importação

Existem dois tipos principais de NF-e relacionados a operações de importação:

**NF-e de Importação (modelo 55):**
É a nota fiscal emitida pelo importador no momento da entrada da mercadoria no estabelecimento, após o desembaraço aduaneiro. Utiliza CFOPs da série 3xxx (importação) e registra todos os tributos pagos na operação. É o documento que oficializa a internalização da mercadoria estrangeira no patrimônio do importador.

**NF-e Complementar de Importação:**
Emitida quando há necessidade de complementar valores ou tributos não registrados na NF-e original. Situações comuns incluem:
- Diferença de câmbio apurada após a emissão da NF-e original
- ICMS-ST complementar devido em operações interestaduais
- Erro no valor aduaneiro informado originalmente
- Ajuste de NCM que resulte em tributos adicionais

A NF-e complementar utiliza CFOP específico conforme a natureza da complementação e deve referenciar a NF-e original.

## ICMS ST na NF-e de Importação

O ICMS Substituição Tributária (ICMS-ST) pode incidir sobre operações de importação, especialmente para produtos sujeitos a este regime no estado de destino. O importador deve:

1. **Recolher o ICMS próprio** — Incidente sobre a operação de importação (base de cálculo = valor CIF + II + IPI + outras despesas)
2. **Recolher o ICMS-ST** — Quando o produto estiver sujeito à substituição tributária na venda para o consumidor final
3. **Destacar ambos na NF-e** — O ICMS próprio no campo específico e o ICMS-ST no campo de informações complementares

Exemplo: Importação de perfumes (sujeitos a ICMS-ST em São Paulo). O importador paga o ICMS próprio na importação (18% sobre a base alargada) e também o ICMS-ST referente à margem de valor agregado (MVA) na revenda. Esses valores devem constar na NF-e de importação para que o adquirente possa se creditar do imposto.

## MDF-e Vinculado à NF-e de Importação

O Manifesto Eletrônico de Documentos Fiscais (MDF-e) é obrigatório para o transporte interestadual de cargas. No contexto da importação:

- Quando a mercadoria é transportada do porto ou aeroporto até o estabelecimento do importador em outro estado, o MDF-e deve referenciar a NF-e de importação
- O MDF-e substitui o antigo manifesto de carga em papel e agiliza a fiscalização nas estradas
- A vinculação entre MDF-e e NF-e de importação é obrigatória para trânsito interestadual
- A ausência do MDF-e pode gerar multa de até 50% do valor da mercadoria para o transportador

O importador deve emitir ou solicitar ao transportador a emissão do MDF-e antes do início do transporte da carga desembaraçada. O manifesto deve conter o número da NF-e de importação e o CFOP correspondente.

## Autorização SEFAZ e Validação da NF-e

Toda NF-e de importação precisa ser autorizada pela SEFAZ do estado do importador antes da circulação da mercadoria. O processo de autorização segue estas etapas:

1. **Transmissão do XML** para a SEFAZ de origem via Web Service (NF-e)
2. **Validação de regras fiscais** — A SEFAZ verifica a consistência dos dados (CNPJ, CFOP, NCM, tributos, valores)
3. **Autorização de uso** — A SEFAZ retorna um protocolo de autorização com número, data e hora
4. **Download do XML autorizado** — O importador deve baixar e armazenar o XML da NF-e autorizada

Sem a autorização da SEFAZ, a NF-e é considerada inidônea e não produz efeitos fiscais. A circulação da mercadoria com NF-e não autorizada configura crime de sonegação fiscal, sujeito a multa de 75% a 150% do valor dos tributos devidos.

## Danfe da NF-e de Importação

O Documento Auxiliar da Nota Fiscal Eletrônica (Danfe) é a representação impressa simplificada da NF-e. Para a NF-e de importação, o Danfe deve conter:

- **Destaque do valor aduaneiro** (valor CIF em reais, convertido pela taxa de câmbio da DI)
- **Detalhamento dos tributos** — II, IPI, PIS, COFINS e ICMS pagos na importação
- **Número da Declaração de Importação (DI)** vinculada
- **CFOP** — 3102 (importação direta), 3127 (importação por conta e ordem) ou 3551 (importação para industrialização)
- **Código NCM** e descrição detalhada da mercadoria
- **País de origem** do produto

O Danfe deve acompanhar o transporte da mercadoria até o destino final, juntamente com a DI e o conhecimento de embarque, sob pena de retenção da carga em fiscalização de trânsito.

## Armazenamento Digital do XML

A legislação brasileira exige que o importador mantenha armazenados os arquivos XML das NF-e de importação por, no mínimo, **5 anos** a contar da data de emissão. Os requisitos incluem:

- O XML deve ser armazenado no formato original, sem modificações ou adulterações
- Deve ser possível recuperar e apresentar o arquivo à fiscalização em até 48 horas, sob pena de multa
- O armazenamento pode ser feito em nuvem ou servidores locais, desde que com backup e segurança adequados
- Recomenda-se manter também o protocolo de autorização da SEFAZ em arquivo separado
- A perda do arquivo XML original inviabiliza a comprovação da operação em caso de auditoria fiscal

## Erros Comuns e Como Evitá-los

- **CFOP errado** — Usar 1xxx (nacional) em vez de 3xxx (importação). Verifique: 3102 para importação direta para comercialização, 3127 para importação por conta e ordem de terceiros
- **Valor divergente** — NF-e com valor diferente do valor aduaneiro da DI. A diferença pode ocorrer por variação cambial — neste caso, emita NF-e complementar de ajuste
- **NCM incompatível** — Código NCM diferente da DI causa rejeição pela SEFAZ e multa de 1% do valor da mercadoria
- **Prazo excedido** — Emissão da NF-e após o prazo permitido pelo estado (geralmente 30 dias do desembaraço). Cada estado tem prazo específico; perder o prazo implica rejeição da NF-e
- **CNPJ divergente** — O CNPJ do emitente da NF-e deve ser exatamente o mesmo do importador constante na DI
- **Ausência do número da DI** — O campo de informações complementares sem o número da DI invalida a vinculação fiscal e impede o creditamento de ICMS
## Como Corrigir uma NF-e de Importação Rejeitada

Quando a SEFAZ rejeita a NF-e de importação, é necessário corrigir os erros e reenviar:

### Passo a passo para correção:
1. **Acesse o Web Service da SEFAZ** — Consulte a situação da NF-e usando a chave de acesso ou CNPJ
2. **Identifique o motivo da rejeição** — O protocolo de rejeição informa o código e a descrição do erro (ex: código 236 = CNPJ do emitente não autorizado)
3. **Faça a correção no XML** — Utilize seu sistema emissor de NF-e para corrigir o campo apontado (NCM, CFOP, valor, CNPJ, etc.)
4. **Gere um novo XML corrigido** — O sistema gerará um novo número de protocolo
5. **Reenvie para autorização** — Transmita o XML corrigido via Web Service
6. **Prazo para correção:** Até 30 dias da primeira rejeição, dependendo do estado
7. **Em caso de erro persistente** — Solicite suporte técnico da SEFAZ via central de atendimento ou e-mail

### Erro grave: NF-e já autorizada com dados errados
Se a NF-e foi autorizada mas você percebeu erro posteriormente:
1. **NF-e de importação NÃO pode ser cancelada** se a mercadoria já circulou. Se ainda não circulou, o cancelamento é possível
2. **Se a mercadoria já circulou**, a solução é emitir uma **NF-e complementar** de ajuste
3. **Para NCM errado**, solicite retificação na Receita Federal da DI correspondente E emita NF-e complementar com o NCM correto
4. **Para valor divergente**, emita NF-e complementar com o valor da diferença (positiva ou negativa)
5. **Mantenha toda documentação** — Guarde a NF-e original, a complementar e as comunicações com a SEFAZ por 5 anos

## Integração com SPED Fiscal

A NF-e de importação alimenta o SPED (Sistema Público de Escrituração Digital):

**Registros principais no SPED Fiscal:**
- **Registro C100** — Nota Fiscal de entrada (importação), com CFOP 3xxx
- **Registro C170** — Itens da NF-e, com NCM, quantidade e valores individuais
- **Registro C190** — Apuração de ICMS por CFOP e alíquota
- **Registro C195** — Apuração de IPI
- **Registro 0200** — Cadastro dos produtos importados com NCM correto

**Obrigatoriedade:** Todas as empresas contribuintes do ICMS e IPI devem entregar a EFD ICMS/IPI (SPED Fiscal) mensalmente. A NF-e de importação deve constar na escrituração do mês correspondente ao desembaraço.

**Prazos para entrega do SPED:**
- Mês de referência + 25 dias (ex: NF-e de janeiro deve estar no SPED até 25 de fevereiro)
- Empresas no Simples Nacional têm prazos próprios (até abril do ano seguinte)

**Multa por atraso ou omissão:** 0,5% do valor da receita bruta (mínimo R$ 500), além de multa específica por NF-e omitida (R$ 5.000 por mês).

## NF-e de Importação no Simples Nacional

Empresas optantes pelo Simples Nacional têm regras específicas:

**Emissão da NF-e:**
- Devem emitir NF-e de importação normalmente, com CFOP 3xxx
- O ICMS é recolhido separadamente (não está incluído na guia DAS do Simples)
- A alíquota de ICMS é a do estado de destino (alíquota cheia, sem redução)

**Creditamento:**
- Empresas do Simples NÃO podem se creditar do ICMS pago na importação
- Isso significa que o ICMS da importação se torna custo efetivo (não recuperável)
- Exceção: empresas do Simples que também atuam como MEI (Microempreendedor Individual) têm regras ainda mais restritivas

**Cuidado extra:** Empresas do Simples que importam acima de determinado volume anual podem ser desenquadradas do regime. O limite é de R$ 4.800.000 anuais para importação + receita nacional combinadas.

## NF-e de Importação para E-commerce Cross-Border

O Remessa Conforme (programa de importação simplificada) trouxe mudanças na emissão de NF-e para e-commerce:

**Para plataformas aderentes (AliExpress, Shopee, Shein, etc.):**
- A plataforma emite uma NF-e consolidada de importação (não por pedido individual)
- O consumidor final NÃO emite NF-e de entrada (exceto se for contribuinte do ICMS)
- O ICMS de 20% é recolhido pela plataforma na fonte
- A plataforma entrega a declaração consolidada no Siscomex

**Para marketplaces não aderentes:**
- Cada remessa gera uma DI individual
- O consumidor pode precisar emitir NF-e de entrada (se contribuinte)
- O processo é similar à importação tradicional, com desembaraço simplificado

**Para o importador pessoa jurídica via e-commerce:**
- Compras acima de US$ 50 exigem NF-e de importação normal
- A base é o valor total da compra (produto + frete + seguro)
- O ICMS e demais tributos são recolhidos no desembaraço

## Vínculo entre NF-e e Comprovante de Importação (CI)

O Comprovante de Importação (CI) é um documento emitido pela Receita Federal que atesta a conclusão do despacho aduaneiro. A NF-e de importação deve estar vinculada ao CI:

**Como funciona:**
1. O despachante aduaneiro registra a DI e os tributos são pagos
2. Após o desembaraço, a Receita emite o CI (disponível no Portal Único Siscomex)
3. O importador emite a NF-e de importação baseada nos dados do CI
4. O número do CI deve constar nas informações complementares da NF-e

**Importante:** O CI substitui a DI para fins de comprovação do desembaraço após a conclusão. A NF-e deve refletir exatamente os valores do CI, que são os valores finais homologados pela fiscalização.

**Ferramentas TRADEXA Relacionadas:**
- [Classificador NCM com IA](/landing/ncm-classifier) — Garanta o NCM correto na sua NF-e e evite rejeições e multas
- [Calculadora de Importação](/ferramentas/calculadora-importacao) — Calcule todos os tributos antes de emitir a NF-e para garantir valores corretos
- [Guia de Importação](/guia-importacao) — Guia completo do processo de importação, do pedido ao desembaraço

> Simplifique sua gestão tributária no comex — teste grátis em tradexa.com.br`;
export const keyPoints: string[] | undefined = undefined;
