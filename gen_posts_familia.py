#!/usr/bin/env python3
"""Generate posts-familia-imobiliario.ts with 20 blog posts (10 Família + 10 Imobiliário)."""

POSTS = []

def wp(slug, title, excerpt, content, date, tags):
    wc = len(content.split())
    assert wc >= 2000, f"'{slug}' only {wc} words (need 2000+)"
    POSTS.append({
        "slug": slug,
        "title": title,
        "excerpt": excerpt,
        "content": content,
        "date": date,
        "readTime": max(8, round(wc / 200)),
        "tags": tags,
    })

# ============ POST 1 ============
wp(
    slug="divorcio-consensual-extrajudicial",
    title="Divórcio Consensual Extrajudicial: Guia Completo com Procedimentos, Requisitos e Vantagens",
    excerpt="Guia completo sobre o divórcio consensual extrajudicial realizado em cartório. Requisitos legais, documentos necessários, prazos, custos, partilha de bens e diferenças para o divórcio judicial.",
    date="2025-10-15",
    tags=["Direito de Família", "Divórcio", "Extrajudicial", "Cartório", "Partilha de Bens"],
    content="""## O que é o Divórcio Consensual Extrajudicial

O divórcio consensual extrajudicial é uma modalidade de dissolução do casamento realizada inteiramente em cartório de notas, sem necessidade de processo judicial. Instituído pela Lei nº 11.441/2007, este procedimento revolucionou o direito de família brasileiro ao desburocratizar e agilizar o fim do casamento quando há consenso entre as partes.

Antes da referida lei, todo divórcio — fosse consensual ou litigioso — exigia obrigatoriamente a propositura de uma ação judicial. Isso sobrecarregava o Poder Judiciário e tornava o procedimento mais lento, caro e desgastante para os cônjuges. A possibilidade de realizar o divórcio em cartório representou um avanço significativo na desjudicialização das relações civis no Brasil, alinhando-se à tendência moderna de desafogar o Judiciário com mecanismos extrajudiciais eficientes.

## Requisitos Legais para o Divórcio Extrajudicial

Para que o divórcio consensual possa ser realizado em cartório, é necessário preencher alguns requisitos cumulativos que a lei estabelece de forma clara:

### 1. Consenso Mútuo e Irrevogável

O principal requisito é a concordância de ambos os cônjuges quanto à dissolução do casamento e quanto a todas as suas consequências. Não pode haver qualquer litígio ou divergência — seja sobre a partilha de bens, pensão alimentícia, guarda dos filhos ou uso do nome de casado. O consenso deve ser total e inequívoco, manifestado de forma livre e consciente por ambas as partes perante o tabelião.

### 2. Inexistência de Filhos Menores ou Incapazes

A lei exige que o casal não tenha filhos menores de idade (incluindo nascituros) ou maiores incapazes. Se houver filhos nessa condição, o divórcio extrajudicial não é possível, mesmo que haja consenso sobre guarda e pensão. Nesse caso, a via judicial é obrigatória, ainda que consensual (divórcio consensual judicial).

Existe, contudo, exceção importante: se os filhos menores já tiverem sido emancipados ou atingido a maioridade, o divórcio em cartório é plenamente possível. Também é possível se o casal não tiver filhos em comum ou se os filhos já forem maiores de idade civil.

### 3. Assistência de Advogado

O divórcio extrajudicial exige obrigatoriamente a presença de advogado. As partes podem contratar o mesmo advogado (comum) ou advogados distintos. O profissional será responsável por redigir a minuta do divórcio, orientar as partes sobre os termos e condições, e acompanhar a lavratura da escritura pública.

A participação do advogado é indispensável e sua ausência invalida o ato. Não há possibilidade de divórcio em cartório sem advogado, ao contrário do que algumas informações incorretas sugerem em meios informais.

### 4. Escritura Pública

O ato formaliza-se por meio de escritura pública lavrada em tabelionato de notas. As partes devem comparecer pessoalmente ao cartório, munidas de documentos e acompanhadas do advogado. O tabelião lerá a escritura, verificará a vontade livre e consciente dos cônjuges e colherá as assinaturas, dando fé pública ao ato.

## Documentos Necessários

Para realizar o divórcio extrajudicial, os seguintes documentos são exigidos pelos cartórios de notas:

- **Documentos pessoais:** RG, CPF e certidão de nascimento ou casamento atualizada (expedida há no máximo 90 dias) de ambos os cônjuges
- **Certidão de casamento atualizada:** Fundamental para comprovar o vínculo matrimonial e sua situação atual
- **Documentação dos bens:** Se houver partilha, é necessário apresentar documentos que comprovem a propriedade dos bens (matrículas atualizadas de imóveis, documentos de veículos, extratos bancários, contratos, etc.)
- **Certidões de ônus reais:** Para imóveis, certidão atualizada do registro de imóveis demonstrando a situação jurídica
- **Contrato pré-nupcial:** Se existir, deve ser apresentado para análise e cumprimento
- **Declaração de Imposto de Renda:** Geralmente solicitada para comprovar a situação patrimonial dos cônjuges
- **Comprovante de endereço:** De ambos os cônjuges, para qualificação completa

## Procedimento Passo a Passo

### Etapa 1: Contratação do Advogado

O primeiro passo é contratar um advogado especializado em direito de família. O profissional analisará a situação do casal, verificará a possibilidade do divórcio extrajudicial e orientará sobre os termos do acordo mais adequados às necessidades de ambos.

### Etapa 2: Elaboração da Minuta

Com base nas informações fornecidas pelos cônjuges, o advogado elaborará a minuta da escritura de divórcio, que conterá todos os termos do acordo: qualificação completa dos cônjuges, declaração de dissolução, partilha de bens, definição sobre o nome de casado, pensão alimentícia entre cônjuges se houver, e demais cláusulas acordadas.

### Etapa 3: Escolha do Cartório

O divórcio extrajudicial pode ser realizado em qualquer tabelionato de notas do Brasil, independentemente do domicílio das partes ou do local onde se realizou o casamento. Isso confere grande flexibilidade ao procedimento, permitindo que o casal escolha o cartório mais conveniente.

### Etapa 4: Agendamento e Comparecimento

Após escolher o cartório, as partes agendam a data para lavratura da escritura. No dia marcado, ambos os cônjuges devem comparecer pessoalmente ao tabelionato, acompanhados de seu advogado, portando os documentos originais necessários.

### Etapa 5: Lavratura da Escritura

O tabelião verificará a documentação, lerá a escritura em voz alta, certificar-se-á do livre consentimento das partes e procederá à lavratura no livro de notas. As partes e o advogado assinam a escritura, que passa a ter fé pública e eficácia legal.

### Etapa 6: Registro no Cartório de Registro Civil

Após a lavratura da escritura pública, é necessário levá-la a registro no Cartório de Registro Civil do 1º Ofício onde o casamento foi originalmente registrado. Esse registro é o que efetivamente produz efeitos perante terceiros e atualiza o estado civil dos divorciados.

### Etapa 7: Averbação nos Registros de Bens

Se houver partilha de imóveis, é necessário levar a escritura ao Cartório de Registro de Imóveis competente para averbação da transferência de propriedade. Em alguns casos, pode haver incidência de ITBI sobre a transmissão dos bens imóveis.

## Vantagens do Divórcio Extrajudicial

### Rapidez

Enquanto um divórcio judicial consensual pode levar de 30 a 90 dias para ser concluído, o extrajudicial pode ser resolvido em poucos dias — em alguns casos, até no mesmo dia. Isso porque não há necessidade de distribuição de ação, citação, audiência ou sentença.

### Menor Custo

Os custos cartorários são geralmente inferiores às custas processuais judiciais, especialmente quando somadas aos honorários advocatícios de um processo longo. Além disso, a ausência de longas tramitações reduz o tempo de trabalho do advogado, barateando o custo total.

### Menos Desgaste Emocional

O procedimento extrajudicial é menos solene e intimidador do que uma ação judicial. As partes não precisam comparecer a audiências ou depor em juízo, o que reduz significativamente o desgaste emocional e a exposição pública.

### Privacidade

O divórcio judicial é público — qualquer pessoa pode consultar os autos do processo. Já a escritura pública de divórcio, embora também seja um documento público, tem circulação mais restrita, conferindo maior privacidade ao casal.

### Segurança Jurídica

A escritura pública lavrada por tabelião tem fé pública e eficácia de título executivo extrajudicial. Isso significa que, se uma das partes descumprir o acordo, a outra pode executá-lo diretamente, sem necessidade de novo processo de conhecimento.

## Partilha de Bens no Divórcio Extrajudicial

A partilha de bens no divórcio extrajudicial segue as mesmas regras do divórcio judicial. O casal pode livremente acordar a divisão do patrimônio, respeitando o regime de bens adotado no casamento.

### Comunhão Parcial de Bens (regime legal)

Na comunhão parcial, apenas os bens adquiridos onerosamente durante o casamento se comunicam. Os bens adquiridos antes do casamento são particulares. Na partilha, cada cônjuge tem direito à metade dos bens comuns, salvo disposição em contrário no acordo.

### Comunhão Universal de Bens

Sob este regime, todos os bens — anteriores e posteriores ao casamento — são comuns e devem ser partilhados igualmente, salvo exceções legais como doações com cláusula de incomunicabilidade ou bens herdados com cláusula similar.

### Separação Total de Bens

Não há comunicação de bens, independentemente de quando foram adquiridos. Cada cônjuge mantém a propriedade exclusiva de seu patrimônio. Em caso de divórcio, não há partilha a ser realizada.

### Participação Final nos Aquestos

Regime complexo em que, durante o casamento, cada cônjuge administra seus bens separadamente, mas ao final os bens adquiridos onerosamente na constância do casamento são partilhados como se fossem comuns.

## Pensão Alimentícia entre Cônjuges

No divórcio extrajudicial, é possível estabelecer pensão alimentícia entre os cônjuges, desde que haja consenso. A pensão pode ser fixada em valor fixo mensal, percentual da renda, ou pagamento único. É importante observar que a renúncia ao direito de pedir alimentos deve ser expressa e inequívoca na escritura, sob pena de nulidade.

## Diferenças entre Divórcio Extrajudicial e Judicial

No extrajudicial, o órgão é o Cartório de Notas; não permite filhos menores; o prazo médio é de 5 a 15 dias; o custo é menor; a publicidade é restrita; e o advogado é obrigatório. No judicial consensual, o órgão é o Poder Judiciário; permite filhos menores; o prazo médio é de 30 a 90 dias; o custo é maior; e o processo é público.

## Casos em que o Divórcio Extrajudicial NÃO é Possível

Existem situações específicas em que o divórcio extrajudicial não pode ser utilizado: filhos menores ou incapazes, nascituro, falta de consenso sobre partilha, ausência de advogado, ou cônjuge incapaz. Em todos esses casos, a via judicial é obrigatória.

## Questões Práticas Relevantes

O divórcio extrajudicial pode ser realizado em qualquer cartório do Brasil, independentemente do domicílio. As partes podem comparecer ao mesmo cartório em datas diferentes para assinar a escritura ou utilizar procuração pública com poderes específicos.

Se houver imóvel financiado, a partilha exige cuidados especiais com a anuência do banco. Para casamento celebrado no exterior, é necessária prévia homologação da sentença estrangeira ou registro no consulado.

## Conclusão

O divórcio consensual extrajudicial é um instrumento jurídico eficiente, rápido e econômico para casais que desejam dissolver o casamento de forma amigável e sem filhos menores. Sua principal vantagem reside na desburocratização do procedimento, que reduz custos, prazos e desgaste emocional. Contudo, é fundamental contar com assessoria jurídica especializada para garantir que todos os aspectos legais sejam adequadamente tratados e que o acordo reflita os interesses de ambas as partes.

A escolha entre o divórcio extrajudicial e o judicial depende das circunstâncias específicas de cada casal, especialmente da existência de filhos menores ou incapazes. Em qualquer caso, o divórcio representa o exercício da autonomia privada e da liberdade individual, devendo ser conduzido com responsabilidade e respeito mútuo entre os envolvidos, preservando ao máximo a dignidade de cada um.
"""
)

# ============ POST 2 ============
wp(
    slug="divorcio-litigioso",
    title="Divórcio Litigioso: Procedimento, Prazos, Custos e Aspectos Controversos",
    excerpt="Guia completo sobre o divórcio litigioso. Quando é necessário, como funciona o procedimento judicial, prazos estimados, custas processuais, partilha de bens contenciosa e guarda dos filhos.",
    date="2025-10-22",
    tags=["Direito de Família", "Divórcio Litigioso", "Processo Judicial", "Partilha de Bens", "Guarda"],
    content="""## O que é o Divórcio Litigioso

O divórcio litigioso é a modalidade de dissolução do casamento realizada por meio de ação judicial quando não há consenso entre os cônjuges sobre um ou mais aspectos da separação. Diferentemente do divórcio consensual — que pode ser extrajudicial ou judicial — no litigioso as partes não chegam a um acordo sobre questões como partilha de bens, guarda dos filhos, pensão alimentícia ou uso do nome de casado, sendo necessário que o juiz decida os pontos controversos.

O divórcio litigioso é regido pelo Código de Processo Civil (Lei nº 13.105/2015) e pelo Código Civil (Lei nº 10.406/2002), e representa a via tradicional para a dissolução do casamento quando a via consensual se mostra inviável. Sua natureza adversarial implica maior desgaste emocional e financeiro, além de prazos mais longos.

## Quando o Divórcio Litigioso é Necessário

### Falta de Consenso sobre a Partilha de Bens

A divergência quanto à divisão do patrimônio comum é uma das causas mais frequentes de litígio. Desentendimentos sobre a avaliação de bens, a existência de bens a partilhar, a interpretação do regime de bens ou a ocultação de ativos podem inviabilizar o acordo. Bens como imóveis, veículos, aplicações financeiras, empresas e direitos autorais frequentemente geram disputas acirradas.

### Disputa pela Guarda dos Filhos

A determinação do regime de guarda — compartilhada ou unilateral — e a definição da residência principal dos filhos são pontos comuns de discordância. Pais que desejam a guarda unilateral frequentemente recorrem ao divórcio litigioso quando não há consenso. A disputa pela guarda é geralmente o aspecto mais sensível e desgastante do processo.

### Divergência sobre Pensão Alimentícia

A fixação do valor, da forma de pagamento e da duração da pensão alimentícia pode gerar controvérsias significativas. O alimentante tende a defender valores mais baixos, enquanto o alimentando busca valores mais elevados. A ausência de consenso sobre o binômio necessidade-possibilidade leva à judicialização da questão.

### Discussão sobre o Uso do Nome de Casado

Embora menos frequente, a divergência sobre a alteração ou manutenção do nome de casado também pode justificar o divórcio litigioso, especialmente quando um dos cônjuges deseja manter o nome e o outro se opõe.

### Ausência de um dos Cônjuges

Se um dos cônjuges se recusa a participar do divórcio ou está em local ignorado, o divórcio litigioso com citação por edital pode ser a única via possível para dissolver o vínculo matrimonial.

## Procedimento do Divórcio Litigioso

### Petição Inicial

O divórcio litigioso inicia-se com a petição inicial, na qual o autor expõe os fatos que fundamentam o pedido de dissolução do casamento, especifica os pontos controversos e formula os pedidos. A petição deve ser instruída com a certidão de casamento, documentos pessoais, comprovantes de patrimônio e demais provas dos fatos alegados.

### Citação do Réu

Após o despacho inicial, o réu é citado para apresentar defesa no prazo de 15 dias úteis. A citação pode ser pessoal (por oficial de justiça ou correio), por edital (se o réu estiver em local incerto ou não sabido) ou por hora certa. A revelia ocorre se o réu não contestar.

### Contestação e Reconvenção

O réu pode apresentar contestação, rebatendo os pedidos do autor e apresentando sua versão dos fatos. Também pode oferecer reconvenção, formulando pedidos próprios contra o autor. É comum que em divórcios litigiosos ambos os cônjuges formulem pedidos de guarda, pensão e partilha.

### Audiência de Mediação ou Conciliação

O juiz designará audiência de mediação ou conciliação, na qual as partes, acompanhadas de advogados, tentarão chegar a um acordo com a ajuda de um mediador ou conciliador. Muitos divórcios que começam como litigiosos terminam em acordo nesta fase, evitando a instrução probatória.

### Fase Probatória

Se não houver acordo, abre-se a fase de produção de provas. Podem ser realizadas prova documental complementar, prova testemunhal com oitiva de testemunhas, prova pericial com avaliação de bens e estudos sociais ou psicológicos, e depoimento pessoal das partes.

### Alegações Finais e Sentença

Encerrada a instrução, as partes apresentam alegações finais e o juiz profere sentença, decidindo todos os pontos controvertidos. Da sentença cabe apelação ao tribunal, o que pode prolongar significativamente o processo.

## Prazos no Divórcio Litigioso

O divórcio litigioso não tem prazo fixo, mas as fases típicas têm durações estimadas: fase postulatória de 30 a 60 dias, audiência de conciliação de 30 a 90 dias após a contestação, fase probatória de 60 a 180 dias, alegações finais e sentença de 30 a 90 dias, e recursos de 6 a 12 meses adicionais. O tempo total médio varia de 6 meses a 2 anos.

## Custas Processuais e Honorários

### Custas Judiciais

As custas processuais variam conforme o estado e o valor da causa, incluindo taxa de distribuição da ação, custas de citação, publicações de editais, perícias, taxa de sentença e custas recursais.

### Honorários Advocatícios

Os honorários advocatícios em divórcios litigiosos são geralmente mais elevados que nos consensuais, podendo ser fixos, por hora, de êxito ou de sucumbência, este último fixado pelo juiz em favor do advogado da parte vencedora.

## Partilha de Bens no Divórcio Litigioso

A partilha de bens no divórcio litigioso é um dos pontos mais complexos e controversos, exigindo análise minuciosa do regime de bens e das provas apresentadas. São partilháveis imóveis, veículos, aplicações financeiras, empresas e direitos autorais, entre outros. Não se partilham bens adquiridos antes do casamento na comunhão parcial, bens recebidos por doação ou herança com cláusula de incomunicabilidade, e bens de uso pessoal.

## Guarda dos Filhos no Divórcio Litigioso

A definição da guarda dos filhos é frequentemente o ponto mais sensível do divórcio litigioso, decidido com base no princípio do melhor interesse da criança. A guarda compartilhada é a regra desde a Lei nº 13.058/2014, sendo a guarda unilateral exceção aplicável quando um dos pais não reúne condições ou há risco à criança.

## Aspectos Polêmicos

O divórcio pode ser decretado independentemente da partilha de bens. Em caso de cônjuge em local ignorado, prossegue com citação por edital. Em casos de violência doméstica, pode ser acompanhado de medidas protetivas. A partilha de empresas familiares é particularmente complexa.

## Estratégias para Evitar o Divórcio Litigioso

Mesmo quando o divórcio litigioso parece inevitável, a mediação familiar e a advocacia colaborativa podem facilitar um acordo e reduzir o conflito. Acordos parciais sobre questões menos controvertidas também podem reduzir o escopo do litígio.

## Conclusão

O divórcio litigioso é a via judicial necessária quando o consenso não é possível. Embora seja mais demorado, caro e desgastante que o consensual, é essencial para garantir a dissolução justa do casamento mesmo na ausência de acordo. A assessoria jurídica especializada é fundamental para orientar sobre riscos, custos e estratégias disponíveis para minimizar o conflito.
"""
)

# ============ POST 3 ============
wp(
    slug="guarda-compartilhada",
    title="Guarda Compartilhada: Direitos, Deveres, Funcionamento Prático e Aspectos Legais",
    excerpt="Guia completo sobre guarda compartilhada no Brasil. O que diz a lei, como funciona na prática, direitos e deveres de cada genitor, cálculo de pensão, residência principal e muito mais.",
    date="2025-11-05",
    tags=["Direito de Família", "Guarda Compartilhada", "Filhos", "Responsabilidade Parental", "Convivência"],
    content="""## O que é Guarda Compartilhada

A guarda compartilhada é o regime de guarda no qual ambos os genitores exercem conjuntamente a responsabilidade parental sobre os filhos, compartilhando as decisões importantes relativas à educação, saúde, moradia, lazer e demais aspectos da vida da criança. Instituída pela Lei nº 11.698/2008 e posteriormente reformulada pela Lei nº 13.058/2014, a guarda compartilhada é atualmente a regra no direito de família brasileiro, aplicando-se sempre que ambos os genitores estiverem aptos a exercê-la.

Diferentemente do que muitos pensam, a guarda compartilhada não significa necessariamente que a criança passará tempo igual na casa de cada genitor. O que se compartilha é a autoridade parental — as decisões — e não necessariamente o tempo de convivência física, que pode ser ajustado conforme as circunstâncias de cada família. Este é um dos pontos que mais geram confusão entre os pais e mesmo entre operadores do direito menos familiarizados com a matéria.

## Fundamentos Legais

A guarda compartilhada está prevista nos artigos 1.583 a 1.590 do Código Civil, com as alterações introduzidas pela Lei nº 13.058/2014. Os principais pontos da lei estabelecem que a guarda compartilhada é a regra, devendo ser aplicada sempre que ambos os genitores estiverem aptos a exercer o poder familiar. A decisão deve sempre priorizar o melhor interesse da criança, e a guarda compartilhada pode ser afastada se um dos genitores não tiver condições de exercê-la ou se houver risco à integridade física ou psicológica da criança. A guarda unilateral é exceção, aplicando-se apenas quando a compartilhada for inviável.

## Guarda Compartilhada vs. Guarda Alternada

É comum confundir guarda compartilhada com guarda alternada, mas são conceitos distintos. Na guarda compartilhada, ambos os genitores participam das decisões importantes, mas a criança tem uma residência principal (base) e visita o outro genitor periodicamente. Na guarda alternada, a criança alterna períodos de convivência exclusiva com cada genitor, e as decisões são tomadas pelo genitor com quem a criança está no momento. A guarda alternada não é vedada pela lei brasileira, mas é menos comum e geralmente desaconselhada para crianças pequenas.

## Como Funciona na Prática

### Residência Principal

Na guarda compartilhada, a criança tem uma residência principal, que é considerada seu lar de referência. É nela que a criança mantém seu quarto, seus pertences e sua rotina escolar. O outro genitor tem direito a visitas amplas e participação ativa na vida da criança. O estabelecimento da residência principal depende de fatores como proximidade da escola, proximidade do trabalho dos genitores, rede de apoio familiar, rotina da criança e disponibilidade de cada genitor.

### Tempo de Convivência

O tempo de convivência com cada genitor deve ser estabelecido de forma a atender ao melhor interesse da criança, considerando idade, rotina escolar e extracurricular, distância entre as residências, disponibilidade dos genitores e vontade da criança, se tiver idade e maturidade para manifestá-la. Não há fórmula pronta, e cada caso é único.

### Decisões Compartilhadas

As principais decisões que devem ser tomadas em conjunto pelos genitores incluem escolha da escola, autorização para viagens internacionais, tratamentos médicos de maior complexidade, prática de atividades extracurriculares, opção religiosa, mudança de residência para outra cidade ou estado, e inclusão em planos de saúde.

### Comunicação entre Genitores

A comunicação entre os genitores é fundamental para o sucesso da guarda compartilhada. Recomenda-se estabelecer canais de comunicação claros e objetivos, priorizar o diálogo sobre a criança, evitar conflitos na frente dos filhos, utilizar aplicativos de coparentalidade quando a comunicação for difícil, e manter registros de decisões importantes.

## Guarda Compartilhada e Pensão Alimentícia

A guarda compartilhada não elimina a obrigação alimentar. Ambos os genitores devem contribuir para o sustento dos filhos. Na guarda compartilhada, presume-se que ambos contribuem diretamente para as despesas durante o período de convivência. No entanto, se houver diferença significativa de renda, pode ser fixada pensão alimentícia complementar.

As despesas ordinárias (alimentação, vestuário, transporte, moradia) são rateadas entre os genitores, considerando a proporção de suas rendas. As despesas extraordinárias (médicas, odontológicas, escolares, cursos) são divididas igualmente ou proporcionalmente à renda, salvo disposição em contrário no acordo ou decisão judicial.

## Direitos e Deveres dos Genitores

Os genitores têm direito de participar das decisões importantes sobre a vida dos filhos, ter livre acesso às informações escolares e médicas, convocar reuniões escolares, viajar com os filhos respeitando o direito de convivência do outro genitor, e ser consultado sobre mudanças na rotina. Têm o dever de contribuir para o sustento, participar ativamente da criação e educação, respeitar o direito de convivência do outro genitor, manter o outro informado sobre questões relevantes, promover o convívio saudável com o outro genitor, e não alienar o filho contra o outro.

## Guarda Compartilhada e Alienação Parental

A guarda compartilhada é uma das principais ferramentas para prevenir e combater a alienação parental. Quando ambos os genitores participam ativamente da vida dos filhos, é mais difícil que um deles consiga alienar a criança contra o outro. A Lei de Alienação Parental (Lei nº 12.318/2010) prevê a guarda compartilhada como uma das medidas aplicáveis.

## Guarda Compartilhada em Casos Especiais

A guarda compartilhada pode ser afastada em casos de violência doméstica. Pode ser exercida mesmo quando os genitores moram em cidades diferentes, com adaptações no tempo de convivência. Com genitor no exterior, exige adaptações significativas e uso de tecnologia para manutenção do contato.

## Elaboração do Acordo de Guarda Compartilhada

Um acordo bem elaborado deve conter definição da residência principal, estabelecimento do tempo de convivência, definição das responsabilidades, forma de contribuição para despesas, plano de parentalidade detalhando a rotina, disposições sobre férias e datas especiais, regras para comunicação e previsão de mediação para conflitos futuros.

## Plano de Parentalidade

O plano de parentalidade detalha a rotina da criança e as responsabilidades de cada genitor. Embora não obrigatório, é altamente recomendado e pode incluir rotina semanal detalhada, cronograma de férias e feriados, distribuição de despesas, regras de comunicação, procedimento para tomada de decisões e disposições sobre educação, saúde e religião.

## Modificação do Regime de Guarda

O regime pode ser modificado se houver mudança significativa nas circunstâncias: mudança de cidade de um dos genitores, perda de condições de exercer a guarda, descumprimento reiterado do acordo, mudança na idade da criança que exija adaptação, ou manifestação da vontade da criança.

## Conclusão

A guarda compartilhada é o regime prioritário no direito de família brasileiro, refletindo a evolução da sociedade e a valorização da coparentalidade. Seu sucesso depende da capacidade dos genitores de cooperar e se comunicar de forma respeitosa, sempre priorizando o melhor interesse da criança. Oferece benefícios significativos para o desenvolvimento emocional e psicológico dos filhos, que mantêm vínculo próximo com ambos os genitores. Exige maturidade, flexibilidade e compromisso com o bem-estar dos filhos.
"""
)

# ============ POST 4 ============
wp(
    slug="guarda-unilateral",
    title="Guarda Unilateral: Quando se Aplica, Direitos, Deveres e Aspectos Jurídicos Essenciais",
    excerpt="Guia completo sobre guarda unilateral no direito brasileiro. Quando é aplicada, direitos e deveres do genitor guardião e não guardião, pensão alimentícia, convivência e aspectos práticos.",
    date="2025-11-19",
    tags=["Direito de Família", "Guarda Unilateral", "Filhos", "Poder Familiar", "Convivência"],
    content="""## O que é Guarda Unilateral

A guarda unilateral é o regime de guarda no qual apenas um dos genitores detém a guarda do filho, sendo responsável por todas as decisões cotidianas relativas à vida da criança. O outro genitor, chamado de genitor não guardião, exerce o direito de convivência por meio de visitas e mantém o dever de fiscalizar a criação e educação do filho, além da obrigação de prestar alimentos.

Com a entrada em vigor da Lei nº 13.058/2014, a guarda compartilhada tornou-se a regra geral no direito de família brasileiro, e a guarda unilateral passou a ser a exceção, aplicável apenas quando a guarda compartilhada se mostra inviável ou contrária ao melhor interesse da criança. Esta mudança legislativa representou uma virada paradigmática, pois anteriormente a guarda unilateral era a regra e a compartilhada era vista como exceção.

## Quando a Guarda Unilateral é Aplicada

### Inviabilidade da Guarda Compartilhada

A guarda unilateral é determinada quando a guarda compartilhada se mostra inviável. São exemplos de inviabilidade a distância geográfica excessiva entre as residências dos genitores que impeça a participação efetiva de ambos na rotina diária da criança, a absoluta impossibilidade de comunicação entre os genitores com conflitos tão intensos que inviabilizam a tomada conjunta de decisões, o desinteresse manifesto de um dos genitores em exercer a guarda ou participar ativamente da vida do filho, e a conduta inadequada de um dos genitores que coloque em risco a integridade física ou psicológica da criança.

### Risco à Integridade da Criança

A guarda unilateral pode ser aplicada quando há histórico de violência doméstica praticada por um dos genitores, uso abusivo de álcool ou drogas, suspeita ou confirmação de abuso sexual, ou transtorno mental não tratado que comprometa a capacidade de cuidar da criança.

### Vontade da Criança

Quando a criança, com idade e maturidade suficientes, manifesta preferência por residir com um dos genitores, o juiz pode considerar essa vontade, especialmente se demonstrada de forma consistente e fundamentada.

## Direitos e Deveres do Genitor Guardião

### Direitos do Guardião

O genitor que detém a guarda unilateral tem o direito de decidir sobre as questões cotidianas da vida da criança, escolher a escola e os profissionais de saúde, autorizar ou não atividades extracurriculares, definir a rotina diária, representar legalmente a criança em todos os atos da vida civil, administrar os valores recebidos a título de pensão alimentícia e manter a residência da criança em seu lar.

### Deveres do Guardião

O genitor guardião deve prover moradia, alimentação, saúde, educação e lazer, zelar pela integridade física e psicológica da criança, garantir o direito de convivência do genitor não guardião, manter o genitor não guardião informado sobre questões relevantes, não dificultar o contato entre a criança e o genitor não guardião, e prestar contas sobre a utilização da pensão alimentícia.

## Direitos e Deveres do Genitor Não Guardião

### Direitos do Não Guardião

O genitor que não detém a guarda tem direito ao convívio regular com o filho conforme estabelecido, ser informado sobre questões relevantes relativas à saúde, educação e bem-estar da criança, participar de decisões importantes, fiscalizar a criação e educação do filho, requerer informações escolares e médicas, e ter livre acesso à criança em casos de urgência.

### Deveres do Não Guardião

O genitor não guardião deve prestar alimentos, respeitar a rotina e a autoridade do genitor guardião, não interferir nas decisões cotidianas, manter comportamento adequado durante as visitas, devolver a criança no horário e local estabelecidos, e contribuir para as despesas extraordinárias.

## Regime de Convivência (Visitas)

O regime de visitas típico na guarda unilateral inclui finais de semana alternados (quinzenais), um dia na semana para visitas intermediárias, metade das férias escolares, feriados alternados e datas especiais. Em casos excepcionais, as visitas podem ser acompanhadas por terceiros ou ocorrer em casa de acolhimento, especialmente quando há risco de alienação parental ou conduta inadequada do genitor não guardião.

## Guarda Unilateral e Pensão Alimentícia

Na guarda unilateral, o genitor não guardião é obrigado a prestar alimentos ao filho. O valor é fixado com base no binômio necessidade-possibilidade: a necessidade é comprovada pelo genitor guardião e demonstrada pelas despesas da criança, enquanto a possibilidade é a capacidade financeira do genitor não guardião.

A pensão pode ser fixada como percentual da renda líquida do alimentante (mais comum), valor fixo em moeda corrente, prestação in natura (moradia, plano de saúde, escola) ou combinação de formas.

## Guarda Unilateral e Alienação Parental

A guarda unilateral pode ser tanto causa quanto consequência da alienação parental. A guarda unilateral concentra poderes nas mãos do genitor guardião, o que pode facilitar comportamentos alienantes. Em casos de alienação parental grave, a guarda unilateral pode ser transferida para o genitor alienado como forma de proteger a criança.

## Modificação da Guarda

São motivos para modificação da guarda unilateral: descumprimento reiterado do regime de convivência, mudança de cidade do genitor guardião que dificulte o convívio, conduta inadequada do genitor guardião, melhoria das condições do genitor não guardião, vontade manifesta da criança, e falecimento ou incapacidade superveniente do genitor guardião.

## Guarda Unilateral e Responsabilidade Civil

O genitor guardião responde civilmente pelos atos dos filhos menores. O genitor não guardião também pode ser responsabilizado se concorrer para o ato ilícito ou se estiver em período de convivência quando o ato ocorreu.

## Guarda Unilateral e Viagens

Na guarda unilateral, o genitor guardião pode viajar com a criança dentro do território nacional sem necessidade de autorização do outro genitor, salvo disposição em contrário. Viagens internacionais requerem autorização de ambos os genitores, independentemente do regime de guarda.

## Aspectos Psicológicos da Guarda Unilateral

A guarda unilateral pode ter impactos psicológicos significativos na criança, incluindo sentimento de perda do convívio diário com um dos genitores, possível idealização do genitor ausente, culpa por escolher um genitor em detrimento do outro, maior dependência emocional do genitor guardião, e dificuldade de adaptação às transições. Para mitigar esses efeitos, recomenda-se manter rotina estável, estimular o convívio regular com o genitor não guardião, evitar discursos negativos sobre o outro genitor, buscar apoio psicológico quando necessário, e promover a participação do genitor não guardião na vida escolar e extracurricular.

## Conclusão

A guarda unilateral, embora seja atualmente exceção no direito de família brasileiro, cumpre função importante ao oferecer solução para situações nas quais a guarda compartilhada não é viável. O genitor não guardião não é excluído da vida do filho — mantém direitos e deveres significativos. Para que seja bem-sucedida, é essencial que o genitor guardião respeite o direito de convivência do outro genitor e que ambos priorizem o bem-estar da criança acima de seus conflitos pessoais.
"""
)

# ============ POST 5 ============
wp(
    slug="pensao-alimenticia-calculo",
    title="Pensão Alimentícia: Guia Completo de Cálculo, Atualização, Execução e Revisão",
    excerpt="Guia completo sobre pensão alimentícia no Brasil. Como é calculado o valor, binômio necessidade-possibilidade, trato sucessivo, execução, revisão, exoneração e aspectos práticos essenciais.",
    date="2025-12-03",
    tags=["Direito de Família", "Pensão Alimentícia", "Cálculo", "Execução de Alimentos", "Revisão"],
    content="""## O que é Pensão Alimentícia

A pensão alimentícia é uma obrigação legal de prestar alimentos a alguém que não tem condições de prover o próprio sustento. No direito de família brasileiro, os alimentos compreendem não apenas a alimentação no sentido estrito, mas tudo o que é necessário para a subsistência digna da pessoa: moradia, saúde, educação, vestuário, lazer e assistência moral.

A obrigação alimentar está prevista nos artigos 1.694 a 1.710 do Código Civil e é regida por princípios específicos que orientam tanto a fixação do valor quanto sua execução e revisão. O direito aos alimentos é fundamentado no princípio da solidariedade familiar e na dignidade da pessoa humana.

## Fundamentos Legais dos Alimentos

### Obrigação Recíproca

O dever de prestar alimentos é recíproco entre pais e filhos e extensível a todos os ascendentes, descendentes e irmãos. Isso significa que tanto os pais podem exigir alimentos dos filhos quanto os filhos dos pais, desde que preenchidos os requisitos legais de necessidade de quem pede e possibilidade de quem paga.

### Caráter Personalíssimo

A obrigação alimentar é personalíssima — não se transmite aos herdeiros e não pode ser objeto de cessão ou compensação. O direito de exigir alimentos também é personalíssimo e se extingue com a morte do alimentando ou do alimentante.

### Alimentos Provisórios e Definitivos

Os alimentos provisórios são fixados liminarmente pelo juiz antes da instrução probatória, com base em prova pré-constituída de parentesco e necessidade. Os alimentos definitivos são fixados na sentença após a instrução probatória.

## Binômio Necessidade-Possibilidade

O valor da pensão alimentícia é fixado com base no binômio necessidade-possibilidade, previsto no artigo 1.694, §1º do Código Civil. A necessidade deve ser comprovada por quem pede os alimentos, não se presumindo, exceto para filhos menores. A necessidade é analisada considerando despesas comprovadas, condição social da família, padrão de vida que a criança teria se os genitores estivessem juntos, e necessidades especiais.

A possibilidade deve ser comprovada por quem paga os alimentos, avaliada com base nos rendimentos comprovados, capacidade potencial de gerar renda, patrimônio, obrigações financeiras já existentes e número de dependentes.

## Metodologia de Cálculo da Pensão

### Percentual sobre a Renda Líquida

A forma mais comum de fixação da pensão é o percentual sobre a renda líquida do alimentante. Os percentuais típicos variam de 15% a 25% para um filho, 25% a 35% para dois filhos, e 30% a 40% para três ou mais filhos.

### Valor Fixo

Alternativamente, a pensão pode ser fixada em valor fixo, especialmente quando a renda do alimentante é variável, o alimentante é profissional liberal ou autônomo, as necessidades do alimentando são bem delimitadas, ou há acordo entre as partes.

### Valor Fixo + Percentual

A combinação de valor fixo com percentual é comum quando o alimentante tem renda fixa mais variável, as despesas básicas são cobertas pelo valor fixo, e o percentual incide sobre verbas adicionais como 13º salário, férias, bônus e PLR.

### Renda Líquida para Cálculo

A renda líquida considerada inclui salário bruto menos descontos obrigatórios, pró-labore, horas extras habituais, comissões e gratificações, 13º salário, férias, PLR, aluguéis e rendimentos de investimentos. Não entram no cálculo descontos facultativos, despesas de trabalho necessárias e verbas indenizatórias.

## Trato Sucessivo e Atualização

A pensão alimentícia é uma prestação de trato sucessivo — deve ser paga periodicamente e é permanentemente atualizável. A correção monetária é essencial para preservar o valor real da pensão, sendo o INPC o índice mais utilizado na jurisprudência.

### Revisão da Pensão

A pensão pode ser revista a qualquer tempo se houver alteração na situação financeira de qualquer das partes. A revisão para majoração ocorre quando o alimentando prova aumento de suas necessidades ou quando o alimentante tem aumento significativo de renda. A revisão para redução ocorre quando o alimentante prova redução de sua capacidade financeira ou quando o alimentando tem redução de suas necessidades.

## Execução de Alimentos

Existem dois rituais de execução. A execução pelo rito da prisão civil (Art. 528, CPC) é aplicável para as três prestações anteriores ao ajuizamento, com procedimento que pode levar à prisão civil por 1 a 3 meses em regime fechado. A execução pelo rito da expropriação é aplicável para prestações mais antigas, com penhora de bens e hasta pública.

## Exoneração da Pensão Alimentícia

A obrigação pode ser extinta pela maioridade civil (que não extingue automaticamente a obrigação se o alimentando estiver cursando ensino superior), conclusão do curso superior, emprego do alimentando com renda suficiente, casamento ou união estável do alimentando, indignidade, ou morte do alimentante ou alimentando.

## Pensão Alimentícia em Casos Especiais

Os alimentos gravídicos podem ser requeridos durante a gestação desde a Lei nº 11.804/2008. Os alimentos entre cônjuges são excepcionais e temporários. A obrigação pode ser estendida aos avós (alimentos avoengos) se os genitores não tiverem condições. O filho pode ser obrigado a prestar alimentos aos pais idosos.

## Aspectos Práticos e Processuais

A ação de alimentos segue o rito especial da Lei nº 5.478/1968, com procedimento sumário e célere, possibilidade de fixação de alimentos provisórios, citação para audiência em 5 dias e julgamento em até 30 dias. As partes podem celebrar acordo homologado judicialmente.

## Conclusão

A pensão alimentícia é um dos institutos mais importantes do direito de família. O cálculo adequado, a correta atualização e a execução eficiente são essenciais para garantir a subsistência digna do alimentando. A fixação exige análise cuidadosa das necessidades e da capacidade financeira, com vistas ao equilíbrio entre a proteção do necessitado e a manutenção das condições de subsistência do obrigado. O descumprimento é tratado com rigor pelo ordenamento jurídico.
"""
)

# ============ POST 6 ============
wp(
    slug="investigacao-paternidade-dna",
    title="Investigação de Paternidade com DNA: Procedimento Judicial, Exame, Prazos e Efeitos Jurídicos",
    excerpt="Guia completo sobre investigação de paternidade com DNA no Brasil. Como funciona o exame de DNA, procedimento judicial, efeitos do reconhecimento, prazos prescricionais e direitos do filho.",
    date="2025-12-17",
    tags=["Direito de Família", "Investigação de Paternidade", "DNA", "Filiação", "Reconhecimento"],
    content="""## O que é Investigação de Paternidade

A investigação de paternidade é a ação judicial destinada a estabelecer o vínculo de filiação entre uma pessoa e seu suposto pai biológico. Com o avanço da tecnologia genética, o exame de DNA (ácido desoxirribonucleico) tornou-se o meio de prova mais preciso e confiável para demonstrar a paternidade, com índice de acerto superior a 99,9%, revolucionando o direito de família e permitindo que milhares de pessoas exerçam o direito fundamental ao conhecimento de sua origem genética.

O direito ao conhecimento da origem genética é um direito fundamental da personalidade, decorrente do princípio da dignidade da pessoa humana e do direito à identidade, ambos previstos na Constituição Federal de 1988. A ausência do nome do pai no registro de nascimento afeta não apenas a esfera jurídica, mas também a formação da identidade pessoal e social do indivíduo.

## Fundamentos Legais

O direito ao reconhecimento da paternidade está fundamentado no artigo 227 da Constituição Federal, que estabelece o dever da família, da sociedade e do Estado de assegurar à criança e ao adolescente o direito à convivência familiar e à dignidade. O Estatuto da Criança e do Adolescente (Lei nº 8.069/1990) dispõe sobre o direito à convivência familiar e ao reconhecimento de filiação em seus artigos 20 a 27. O Código Civil (Lei nº 10.406/2002) trata da filiação e das relações de parentesco nos artigos 1.596 a 1.610. A Lei nº 8.560/1992 regula a investigação de paternidade dos filhos havidos fora do casamento, e a Lei nº 12.004/2009 permite a realização do exame de DNA na ação de investigação.

No casamento, existe a presunção legal de paternidade em relação ao marido da mãe (pater is est quem nuptiae demonstrant), que pode ser elidida por prova em contrário. Para os filhos havidos fora do casamento, não há presunção, sendo necessário o reconhecimento voluntário ou a investigação judicial.

## O Exame de DNA

O exame de DNA compara o perfil genético do suposto pai, do filho e, quando possível, da mãe. As amostras biológicas podem ser obtidas por sangue (método tradicional) ou saliva (swab bucal, método mais moderno e menos invasivo). Em casos excepcionais, utilizam-se cabelo, unhas ou outros tecidos.

A cadeia de custódia é o procedimento que garante a integridade e a confiabilidade da amostra, desde a coleta até a análise, incluindo identificação segura dos envolvidos, coleta em ambiente controlado, acondicionamento e lacração adequados, transporte seguro, recebimento e processamento controlados, e armazenamento adequado.

O resultado é expresso em probabilidade de paternidade, que deve ser igual ou superior a 99,9% para comprovação. Em caso de exclusão, a probabilidade é de 0%. Se o suposto pai faleceu, é possível realizar o exame indireto com amostras de parentes consanguíneos ou mediante exumação.

## Procedimento da Ação de Investigação de Paternidade

A ação é proposta pelo filho contra o suposto pai, com pedido de realização do exame de DNA, declaração de paternidade, alteração do registro civil e alimentos. O réu é citado para contestar, e a revelia ocorre se não contestar.

A recusa do suposto pai em realizar o exame de DNA gera a presunção de paternidade. A jurisprudência do STJ é pacífica: a recusa ao exame, aliada a outros indícios de paternidade, autoriza a procedência da ação.

Além do exame de DNA, outras provas podem ser produzidas: prova testemunhal, documental, pericial e indiciária. A sentença que declara a paternidade produz efeitos como reconhecimento do vínculo de filiação, direito ao nome, direito à convivência familiar, direito a alimentos, direitos sucessórios e previdenciários.

## Efeitos do Reconhecimento da Paternidade

O filho reconhecido passa a ter todos os direitos inerentes à filiação: direito ao nome com inclusão do sobrenome do pai, direito à convivência familiar com o pai e sua família extensa, direito a alimentos, direitos sucessórios com participação na herança, e direitos previdenciários como pensão por morte.

O pai reconhecido assume todos os deveres do poder familiar: sustento, guarda e convivência, educação, assistência moral e representação legal. O reconhecimento pode gerar efeitos patrimoniais significativos como pagamento de alimentos retroativos desde a citação e participação na herança.

## Prescrição e Decadência

A ação de investigação de paternidade é imprescritível para o filho, nos termos do artigo 27 do ECA e do artigo 1.606 do Código Civil. A ação negatória de paternidade tem prazo decadencial de 4 anos contados do registro de nascimento.

## Investigação de Paternidade e Multiparentalidade

A multiparentalidade é o reconhecimento jurídico de mais de dois vínculos parentais simultâneos, já reconhecido pelo STJ e STF em casos excepcionais, especialmente quando há vínculo socioafetivo consolidado paralelamente ao vínculo biológico. A paternidade socioafetiva decorre da convivência, do afeto e do tratamento como filho, independentemente do vínculo biológico.

## Conclusão

A investigação de paternidade com DNA é o instrumento jurídico mais eficaz para o reconhecimento do vínculo de filiação biológica. O direito à filiação é imprescritível e o Estado tem o dever de facilitar o acesso ao exame de DNA. A recusa ao exame gera presunção de paternidade, e o reconhecimento produz efeitos jurídicos abrangentes. A evolução da jurisprudência, com o reconhecimento da multiparentalidade e da paternidade socioafetiva, demonstra a complexidade das relações de filiação na sociedade contemporânea.
"""
)

# ============ POST 7 ============
wp(
    slug="uniao-estavel-formalizacao",
    title="União Estável: Formalização, Requisitos, Efeitos Jurídicos e Conversão em Casamento",
    excerpt="Guia completo sobre união estável no Brasil. Requisitos para caracterização, formalização em cartório, direitos e deveres dos companheiros, conversão em casamento e aspectos práticos.",
    date="2026-01-07",
    tags=["Direito de Família", "União Estável", "Formalização", "Escritura Pública", "Conversão em Casamento"],
    content="""## O que é União Estável

A união estável é a entidade familiar formada pela convivência pública, contínua e duradoura entre duas pessoas, estabelecida com o objetivo de constituição de família. Reconhecida pela Constituição Federal de 1988 em seu artigo 226, §3º, a união estável é uma das formas de família previstas no ordenamento jurídico brasileiro, ao lado do casamento e da família monoparental.

Diferentemente do casamento, a união estável não exige formalidade prévia para sua constituição — ela se forma pelo simples fato da convivência com as características legais. No entanto, a formalização por escritura pública ou contrato particular é altamente recomendada para dar segurança jurídica à relação e evitar litígios futuros sobre a existência da união e seus efeitos patrimoniais.

## Requisitos para Caracterização da União Estável

### Convivência Pública (Notoriedade)

A relação deve ser pública, ou seja, as pessoas devem se apresentar como companheiras perante a sociedade. A relação não pode ser oculta ou secreta. A notoriedade se demonstra pela apresentação como companheiros em eventos sociais, declaração conjunta em documentos, realização de viagens e atividades públicas como casal, e conhecimento da relação por familiares, amigos e vizinhos.

### Convivência Contínua e Duradoura

A relação deve ser estável e duradoura, sem interrupções significativas. A lei não fixa prazo mínimo, mas a jurisprudência entende que o período de convivência deve ser significativo, geralmente superior a um ano.

### Objetivo de Constituição de Família

O elemento mais importante é o objetivo de constituir família. A simples coabitação ou o namoro não caracterizam união estável. O que diferencia o namoro da união estável é o projeto familiar comum, o que inclui planos de vida conjuntos, compartilhamento de responsabilidades e tratamento recíproco como família.

### Inexistência de Impedimentos

Não podem manter união estável pessoas casadas (salvo se separadas de fato ou judicialmente), ascendentes com descendentes, afins em linha reta, colaterais até o terceiro grau e pessoas menores de 16 anos. Pessoas separadas de fato podem manter união estável.

## Formalização da União Estável

### Escritura Pública Declaratória de União Estável

A forma mais segura de formalizar a união estável é por meio de escritura pública lavrada em tabelionato de notas. A escritura pública é um documento com fé pública que declara a existência da união estável e estabelece o regime de bens aplicável. Os documentos necessários incluem RG, CPF, comprovante de residência, certidão de casamento com averbação de divórcio se houver casamento anterior, e certidão de óbito do ex-cônjuge se viúvo.

A escritura contém a qualificação completa dos companheiros, declaração da existência da união estável, data de início, regime de bens adotado e cláusulas especiais.

### Contrato Particular de União Estável

Alternativamente, a união estável pode ser formalizada por contrato particular, válido entre as partes, que deve ser registrado em cartório de títulos e documentos para produzir efeitos perante terceiros.

### Reconhecimento Administrativo

A união estável pode ser reconhecida administrativamente para fins específicos como INSS para pensão por morte, Imposto de Renda para declaração conjunta, plano de saúde para inclusão como dependente, e previdência privada para habilitação como beneficiário.

## Regime de Bens na União Estável

Na ausência de contrato escrito, aplica-se o regime da comunhão parcial de bens, nos termos do artigo 1.725 do Código Civil. Comunicam-se os bens adquiridos onerosamente na constância da união, mas não se comunicam os adquiridos antes, recebidos por doação ou herança, ou adquiridos com valores exclusivos de um dos companheiros.

Os companheiros podem escolher outro regime por contrato: comunhão universal, separação total ou participação final nos aquestos. A união estável confere maior liberdade na escolha do regime, que não precisa seguir as mesmas formalidades do pacto antenupcial.

## Direitos e Deveres dos Companheiros

Os companheiros têm deveres recíprocos de lealdade e respeito, assistência moral e material, guarda, sustento e educação dos filhos comuns, e contribuição para as despesas do lar. Têm direitos patrimoniais recíprocos como meação dos bens comuns, direito real de habitação, alimentos entre companheiros e participação em sociedade empresarial.

O companheiro tem direito a pensão por morte, auxílio-reclusão, salário-família e reabilitação profissional como dependente previdenciário. Na sucessão, o companheiro sobrevivente tem direito à herança, direito real de habitação e administração provisória do espólio.

## Dissolução da União Estável

A dissolução consensual pode ser extrajudicial por escritura pública se não houver filhos menores ou incapazes, ou judicial por ação consensual. A dissolução litigiosa ocorre quando não há consenso sobre partilha de bens, guarda dos filhos ou pensão alimentícia.

## Conversão da União Estável em Casamento

Os companheiros podem converter a união estável em casamento por requerimento ao juiz de casamentos, dispensando o processo de habilitação tradicional. A conversão não altera o regime de bens vigente durante a união.

## Conclusão

A união estável é uma entidade familiar plenamente reconhecida pela Constituição Federal, com direitos e deveres equivalentes aos do casamento. A formalização por escritura pública é o instrumento mais seguro para proteger os direitos dos companheiros. A escolha entre união estável e casamento depende das circunstâncias de cada casal, sendo fundamental buscar orientação jurídica para formalizar adequadamente a relação e proteger o patrimônio e os interesses envolvidos.
"""
)

# ============ POST 8 ============
wp(
    slug="alienacao-parental",
    title="Alienação Parental: Identificação, Consequências Jurídicas e Medidas de Combate",
    excerpt="Guia completo sobre alienação parental no Brasil. O que é, como identificar os sinais, consequências legais, medidas judiciais aplicáveis, tratamento e prevenção.",
    date="2026-01-21",
    tags=["Direito de Família", "Alienação Parental", "Síndrome da Alienação Parental", "Guarda", "Convivência Familiar"],
    content="""## O que é Alienação Parental

A alienação parental é um fenômeno psicológico e jurídico no qual um dos genitores (alienador) desenvolve comportamentos que visam afastar a criança do outro genitor (alienado), prejudicando o vínculo afetivo entre eles. A síndrome da alienação parental, conceito desenvolvido pelo psiquiatra americano Richard Gardner, descreve o conjunto de sintomas apresentados pela criança vítima desse processo.

No Brasil, a alienação parental é regulada pela Lei nº 12.318/2010, que define o conceito, estabelece as condutas caracterizadoras e prevê as consequências jurídicas para o genitor alienador. A lei representa um marco na proteção dos direitos da criança e do adolescente à convivência familiar saudável.

## Condutas Caracterizadoras de Alienação Parental

A Lei nº 12.318/2010, em seu artigo 2º, elenca exemplos de atos de alienação parental. Incluem-se a desqualificação do genitor com menosprezo de suas qualidades e críticas públicas, a atribuição da culpa pela separação, e comentários negativos sobre sua personalidade ou comportamento.

A dificultação da convivência ocorre quando se criam obstáculos para as visitas, muda-se de endereço sem comunicar o genitor, ou se omitem informações sobre a rotina da criança. A interferência na afetividade inclui impedir a manifestação de afeto, apresentar novo companheiro como substituto, substituir o nome do genitor por apelidos depreciativos, e eliminar fotografias ou lembranças.

As falsas acusações são particularmente graves: acusar falsamente o genitor de abuso sexual ou maus-tratos, atribuir comportamentos inadequados que não ocorreram, denunciar a órgãos de proteção com informações falsas, e induzir a criança a relatar situações falsas.

A omissão de informações inclui não informar sobre eventos importantes, ocultar endereço ou telefone, não permitir participação em reuniões escolares, e não compartilhar boletins e informações de saúde. A transferência de responsabilidades ocorre quando se delegam ao genitor alienado todas as responsabilidades, exigindo que ele resolva problemas criados pelo alienador.

## Sinais de Alienação Parental na Criança

A criança vítima de alienação parental pode apresentar rejeição injustificada e intensa ao genitor alienado, discurso repetitivo idêntico ao do genitor alienador, ausência de ambivalência afetiva com visão totalmente negativa de um genitor e totalmente positiva do outro, uso de palavras e expressões típicas do genitor alienador, justificativas frágeis para a rejeição, medo injustificado, resistência em visitar o genitor alienado, e transtornos de ansiedade, depressão ou comportamento.

A síndrome evolui em fases: na fase leve, a criança faz comentários negativos mas ainda aceita a convivência; na fase moderada, intensifica a campanha de desqualificação e resiste às visitas; na fase grave, recusa terminantemente o contato com pânico e hostilidade.

## Consequências da Alienação Parental

Para a criança, as consequências psicológicas incluem confusão de identidade e lealdade, baixa autoestima, sentimento de culpa, ansiedade e depressão, dificuldade de confiar em relacionamentos futuros, comportamento manipulador, transtorno de conduta e risco de abuso de substâncias na adolescência.

Para o genitor alienador, a lei prevê advertência, ampliação do regime de convivência em favor do genitor alienado, multa diária por descumprimento, acompanhamento psicológico, mudança de guarda para o genitor alienado ou guarda compartilhada, e até suspensão ou perda do poder familiar em casos extremos.

## Procedimento Judicial

A ação pode ser iniciada pelo genitor alienado, Ministério Público, Conselho Tutelar ou qualquer pessoa com legítimo interesse. O juiz pode conceder medidas urgentes como fixação de regime de convivência provisório, determinação de acompanhamento psicológico, proibição de mudança de endereço, e busca e apreensão da criança.

A prova pericial pode incluir estudo social, avaliação psicológica das partes, perícia na criança e visita domiciliar. Na sentença, o juiz pode julgar procedente ou improcedente a acusação, aplicar medidas ao alienador, alterar o regime de guarda e determinar tratamento psicológico.

## Prevenção da Alienação Parental

A guarda compartilhada é uma das principais ferramentas de prevenção, pois ambos os genitores participam ativamente da criação dos filhos. A mediação familiar ajuda os genitores a superar conflitos e estabelecer comunicação saudável. A orientação psicológica para genitores em separação pode prevenir comportamentos alienantes. Um acordo de convivência bem elaborado reduz os espaços para comportamentos alienantes.

## Alienação Parental e Responsabilidade Civil

O genitor alienado pode requerer indenização por danos morais contra o genitor alienador, reconhecida pela jurisprudência. Danos materiais como despesas com advogado e tratamentos também podem ser requeridos. A criança também pode requerer indenização pelos danos sofridos.

## Conclusão

A alienação parental é uma forma de violência psicológica contra a criança que atinge seu direito fundamental à convivência familiar. A Lei nº 12.318/2010 fornece instrumentos para sua identificação e combate, mas a prevenção é sempre a melhor estratégia. O combate exige atuação coordenada de advogados, psicólogos, assistentes sociais e magistrados, todos orientados pelo princípio do melhor interesse da criança.
"""
)

# ============ POST 9 ============
wp(
    slug="planejamento-sucessorio",
    title="Planejamento Sucessório: Instrumentos, Estratégias e Aspectos Jurídicos Essenciais",
    excerpt="Guia completo sobre planejamento sucessório no Brasil. Testamento, doação em vida, holding familiar, pacto antenupcial, partilha em vida e estratégias para redução de custos e conflitos.",
    date="2026-02-04",
    tags=["Direito Sucessório", "Planejamento Sucessório", "Testamento", "Holding Familiar", "Doação"],
    content="""## O que é Planejamento Sucessório

O planejamento sucessório é o conjunto de estratégias jurídicas adotadas por uma pessoa ainda em vida para organizar a destinação de seu patrimônio após sua morte, com o objetivo de reduzir conflitos entre herdeiros, minimizar custos tributários e processuais, e garantir a realização de sua vontade.

Diferentemente do que muitos pensam, o planejamento sucessório não é apenas para pessoas de grande fortuna. Qualquer pessoa que possua bens e queira organizar sua sucessão de forma eficiente pode se beneficiar do planejamento sucessório. O planejamento adequado evita disputas familiares, reduz custas judiciais e impostos, e proporciona tranquilidade para a família.

## Instrumentos de Planejamento Sucessório

### Testamento

O testamento é o instrumento clássico de planejamento sucessório. Por meio dele, o testador dispõe de seus bens para após sua morte, respeitando a legítima dos herdeiros necessários. Existem três tipos principais no Brasil.

O testamento público é lavrado por tabelião em livro de notas, na presença de duas testemunhas. É o mais seguro e recomendado por ficar sob guarda do cartório. O testamento cerrado é escrito pelo testador ou por outra pessoa a seu rogo, entregue ao tabelião em envelope lacrado na presença de duas testemunhas, oferecendo maior sigilo. O testamento particular é escrito pelo testador e lido na presença de três testemunhas, sendo menos formal mas mais sujeito a impugnações.

O testamento vital não trata de bens, mas manifesta a vontade da pessoa sobre tratamentos médicos em caso de doença terminal ou incapacidade.

### Doação em Vida

A doação em vida é uma estratégia eficaz que permite a transferência de bens aos herdeiros ainda em vida. A doação com reserva de usufruto permite que o doador transfira a propriedade mas mantenha o direito de usar e fruir do bem enquanto viver. A doação com cláusula de reversão estabelece que o bem retorna se o donatário falecer antes do doador. As cláusulas de incomunicabilidade e impenhorabilidade protegem o bem doado.

### Holding Familiar

A holding familiar é uma sociedade criada para administrar o patrimônio da família. Suas vantagens incluem centralização da administração, profissionalização da gestão, redução de custos tributários, prevenção de conflitos, continuidade dos negócios e proteção patrimonial. Pode ser imobiliária, empresarial ou mista.

### Pacto Antenupcial

O pacto antenupcial, celebrado antes do casamento, pode conter disposições sobre escolha do regime de bens, doações entre os nubentes, renúncia a direitos sucessórios e administração de bens.

### Partilha em Vida

A partilha em vida é a divisão voluntária do patrimônio entre os herdeiros realizada pelo titular ainda em vida, regulada pelo artigo 2.018 do Código Civil. Exige capacidade do doador, concordância de todos os herdeiros necessários, respeito à legítima e observância das formalidades legais.

## Aspectos Tributários

O ITCMD é o imposto estadual incidente sobre transmissão de bens por herança ou doação, com alíquotas entre 2% e 8% conforme cada estado. Estratégias para redução incluem doação em vida com reserva de usufruto e holding familiar. O planejamento também deve considerar o Imposto de Renda sobre ganho de capital e rendimentos.

## Prevenção de Conflitos

Os principais conflitos decorrem de desigualdade na distribuição, falta de comunicação, participação de herdeiros na administração, interpretação divergente do testamento e bens indivisíveis. Estratégias de prevenção incluem cláusulas testamentárias específicas, partilha equilibrada, mediação familiar e nomeação de testamenteiro de confiança.

## Planejamento Sucessório e Empresas Familiares

O planejamento de empresas familiares deve incluir protocolo familiar, acordo de quotistas ou acionistas, conselho de família, regras para entrada e saída de sócios, e profissionalização da gestão. A sucessão na empresa pode ser planejada com programa de desenvolvimento de sucessores, testamento com disposições específicas, holding familiar, seguro de vida e fundo de liquidez.

## Casos Especiais

Na união estável, o planejamento é especialmente importante devido à menor proteção legal do companheiro. Nas famílias recompostas, é essencial para garantir tratamento justo a todos os filhos. Para filhos com deficiência, devem-se considerar criação de fundo, nomeação de curador e doação com usufruto vitalício. Para bens no exterior, é necessário considerar a lei aplicável e a tributação internacional.

## Conclusão

O planejamento sucessório é um investimento na paz familiar e na segurança patrimonial. Quanto mais cedo for iniciado, maiores as possibilidades de otimização. A escolha dos instrumentos adequados depende do patrimônio, composição familiar, objetivos pessoais e situação tributária. A assessoria jurídica especializada é fundamental para identificar a melhor estratégia e implementá-la de forma segura e eficaz.
"""
)

# ============ POST 10 ============
wp(
    slug="adocao",
    title="Adoção no Brasil: Procedimento, Requisitos, Prazos e Tipos de Adoção",
    excerpt="Guia completo sobre adoção no Brasil. Requisitos legais, procedimento judicial, prazos, estágio de convivência, adoção internacional, adoção tardia e direitos do adotado.",
    date="2026-02-18",
    tags=["Direito de Família", "Adoção", "Guarda", "Filiação", "ECA"],
    content="""## O que é Adoção

A adoção é o ato jurídico pelo qual uma pessoa passa a integrar a família de outra pessoa de forma irrevogável, com todos os direitos e deveres de filho, rompendo-se o vínculo com a família biológica (salvo impedimentos matrimoniais). Regulada pelos artigos 1.618 a 1.629 do Código Civil e pelos artigos 39 a 52-D do Estatuto da Criança e do Adolescente (ECA), a adoção é a forma mais completa de colocação de criança ou adolescente em família substituta.

A adoção é regida pelo princípio do melhor interesse da criança e do adolescente, e seu objetivo principal é garantir o direito à convivência familiar a crianças e adolescentes que não podem permanecer com suas famílias biológicas por razões como abandono, violência, negligência ou impossibilidade de exercício do poder familiar.

## Requisitos para Adotar

### Requisitos Subjetivos

O adotante deve ter pelo menos 18 anos, ser civilmente capaz e ter, no mínimo, 16 anos a mais que o adotando. Deve demonstrar idoneidade moral para exercer o poder familiar, estabilidade familiar (sozinho em adoção unilateral, ou em união estável ou casamento em adoção conjunta), e vínculo afetivo construído durante o estágio de convivência.

### Requisitos Objetivos

A diferença mínima de idade é de 16 anos. Exige-se consentimento dos pais biológicos ou destituição do poder familiar, consentimento do adotando se maior de 12 anos, e prévia inscrição no Cadastro Nacional de Adoção (CNA) ou cadastro estadual.

## Procedimento de Adoção

### Inscrição no Cadastro

O candidato procura a Vara da Infância e Juventude e manifesta interesse. Passa por entrevista inicial com a equipe técnica, apresenta documentação pessoal e certidões, participa de curso de preparação sobre aspectos legais, psicológicos e sociais da adoção, e realiza avaliação psicossocial.

### Habilitação

Após avaliação, o juiz profere sentença de habilitação autorizando o candidato a adotar. O candidato habilitado é inscrito no Cadastro Nacional de Adoção e aguarda ser chamado conforme ordem cronológica e compatibilidade com o perfil da criança.

### Estágio de Convivência

É o período durante o qual a criança convive com os candidatos sob supervisão da equipe técnica. Para crianças até 1 ano, o prazo mínimo é de 30 dias; acima de 1 ano, 45 dias. Para adolescentes, o prazo pode ser reduzido.

### Sentença de Adoção

Após o estágio, a equipe técnica elabora relatório conclusivo e o Ministério Público manifesta-se. O juiz profere sentença de adoção, irrecorrível, que produz efeitos imediatos. Com a sentença, é emitido novo registro de nascimento sem menção à adoção.

## Tipos de Adoção

A adoção conjunta é realizada por um casal. A adoção unilateral é realizada por uma única pessoa. A adoção por casal homoafetivo é reconhecida pelo STJ e STF. A adoção tardia é de crianças com mais de 3 anos ou adolescentes, que enfrentam maior dificuldade de colocação.

A adoção internacional é de criança brasileira por estrangeiro, regulada pela Convenção de Haia de 1993, exigindo habilitação no país de origem, autorização judicial, laudo da autoridade central estrangeira, estágio de convivência no Brasil e visto específico.

A adoção de maiores de 18 anos segue o rito do Código Civil. A adoção de irmãos pela mesma família é priorizada para evitar separação. Crianças com deficiência têm prioridade na adoção.

## Direitos do Adotado

O adotado tem os mesmos direitos do filho biológico: direito ao nome com novo registro de nascimento, convivência familiar, alimentos, direitos sucessórios, educação e saúde. Tem direito de conhecer sua origem biológica após completar 18 anos. A adoção é irrevogável.

## Adoção e Devolução

Devolução é a devolução da criança ao sistema de acolhimento pela família adotante, causando danos psicológicos graves. Pode ser prevenida com preparação adequada, acompanhamento pós-adoção e grupos de apoio.

## Conclusão

A adoção é um ato de amor e responsabilidade que transforma a vida de crianças e adolescentes. O procedimento é rigoroso para garantir o melhor interesse da criança. A adoção tardia e a adoção de irmãos são opções que poucos consideram mas que podem trazer imensa realização. O direito brasileiro avançou significativamente, mas ainda há desafios como a morosidade dos processos e a necessidade de maior suporte pós-adoção.
"""
)

print(f"10 Família posts created. Word counts:")
for p in POSTS:
    wc = len(p["content"].split())
    print(f"  {p['slug']}: {wc} words")
print(f"\nTotal: {len(POSTS)} posts")
