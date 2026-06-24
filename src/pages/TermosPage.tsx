"use client";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";

export default function TermosPage() {
  useSeo({
    title: "Termos de Uso — TRADEXA",
    description: "Termos e condições de uso da plataforma TRADEXA. Inteligência de mercado para comércio exterior com dados atualizados.",
    keywords: "termos de uso tradexa, condições tradexa, contrato tradexa",
    canonical: "https://www.tradexa.com.br/termos",
  });

  return (
    <SiteLayout>
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
            <Badge className="mb-4 font-bold text-[11px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-0 bg-[#D80E16]/8 text-[#D80E16]">Legal</Badge>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F111A] mb-4">Termos de Uso</h1>
            <p className="text-[#5E6278]">Última atualização: 29 de Maio de 2026</p>
          </motion.div>

          <div className="prose prose-slate max-w-none space-y-10 text-[#5E6278] leading-relaxed text-sm md:text-base">

            {/* 1. INTRODUÇÃO */}
            <div>
              <h2 className="text-xl font-extrabold text-[#0F111A] mb-4">1. Introdução e Aceitação</h2>
              <p className="mb-3">Bem-vindo à TRADEXA. Estes Termos de Uso ("Termos") constituem um contrato legal vinculante entre você ("Usuário", "você") e a TRADEXA ("TRADEXA", "nós", "nosso"), com sede em Florianópolis, Santa Catarina, Brasil.</p>
              <p className="mb-3">Ao acessar, navegar, cadastrar-se ou utilizar qualquer serviço, ferramenta, funcionalidade, API, dado, relatório, conteúdo ou material disponibilizado através do website www.tradexa.com.br e seus subdomínios, aplicativos móveis, extensões ou qualquer outra interface digital operada pela TRADEXA (coletivamente, a "Plataforma"), você declara ter lido, compreendido e concordado integralmente com estes Termos.</p>
              <p className="mb-3">A utilização da Plataforma é condicionada à sua aceitação plena e irrestrita destes Termos. Caso você não concorde com qualquer disposição aqui contida, não utilize a Plataforma e não prossiga com o cadastro. A continuidade do acesso após a publicação de alterações nestes Termos constitui aceitação tácita das modificações.</p>
              <p className="mb-3">Você declara ser maior de 18 (dezoito) anos ou ter capacidade civil plena para contratar, e que todas as informações fornecidas durante o cadastro e uso da Plataforma são verdadeiras, precisas, atuais e completas.</p>
              <p>Estes Termos incorporam por referência nossa Política de Privacidade, disponível em www.tradexa.com.br/privacidade, que descreve como coletamos, utilizamos, armazenamos e compartilhamos informações pessoais e dados de uso.</p>
            </div>

            {/* 2. DESCRIÇÃO DOS SERVIÇOS */}
            <div>
              <h2 className="text-xl font-extrabold text-[#0F111A] mb-4">2. Descrição Detalhada dos Serviços</h2>
              <p className="mb-3">A TRADEXA é uma plataforma de inteligência de mercado para comércio exterior que oferece as seguintes categorias de serviços e ferramentas:</p>

              <h3 className="text-base font-extrabold text-[#0F111A] mt-5 mb-2">2.1. Serviços Comerciais (entrega humana)</h3>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li><strong>Pesquisa de Mercado para Exportação:</strong> Análise de potencial de mercado por país-produto, incluindo benchmark de preços FOB/CIF, mapeamento de concorrentes, identificação de canais de distribuição, barreiras regulatórias e viabilidade logística, com base em dados atualizados de comércio exterior.</li>
                <li><strong>Pesquisa de Compradores Internacionais:</strong> Identificação e qualificação de compradores no exterior utilizando dados de importação de múltiplos países, complementados por bases comerciais proprietárias e verificação humana de contatos, com entrega de lista qualificada contendo volume de importação, histórico, concorrentes fornecedores e informações de contato verificadas.</li>
                <li><strong>Cotação de Frete Internacional:</strong> Comparação de cotações de frete marítimo, aéreo e rodoviário com múltiplos armadores, agentes de carga e transportadores internacionais, incluindo comparativo all-in, tracking e suporte documental para operações de importação e exportação.</li>
                <li><strong>Despacho Aduaneiro:</strong> Assessoria completa em processos de importação e exportação no Brasil, com cobertura nacional através de despachantes aduaneiros credenciados, incluindo classificação fiscal NCM, licenciamento (ANVISA, MAPA, INMETRO, Exército, ANATEL, IBAMA e demais órgãos anuentes), desembaraço e suporte documental.</li>
                <li><strong>Fulfillment Internacional:</strong> Serviços de armazenagem, picking, packing, etiquetagem e distribuição B2B/B2C no Brasil e exterior, com centros operacionais em São Paulo, Santa Catarina e Miami (EUA), incluindo preparação para marketplaces (FBA, Mercado Livre, Amazon), integração com plataformas de e-commerce e logística reversa.</li>
                <li><strong>Representação Comercial no Brasil:</strong> Atuação como representante comercial local para empresas estrangeiras, incluindo prospecção ativa de clientes, participação em feiras e eventos do setor, gestão de pipeline comercial, suporte operacional e backoffice compartilhado.</li>
                <li><strong>Auditoria de Classificação Fiscal:</strong> Revisão completa dos códigos NCM utilizados pela empresa do Usuário, com análise individual de cada produto frente às Notas Explicativas do Sistema Harmonizado (NESH), decisões da Receita Federal do Brasil, soluções de consulta, jurisprudência administrativa e identificação de oportunidades de redução tributária legal através de ex-tarifários, regimes especiais e reclassificações.</li>
              </ul>

              <h3 className="text-base font-extrabold text-[#0F111A] mt-5 mb-2">2.2. Ferramentas de Autoatendimento (self-service)</h3>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li><strong>Gerador de Documentos:</strong> Criação automatizada de documentos para comércio exterior (fatura proforma, packing list, carta de crédito, certificado de origem) com preenchimento inteligente baseado nos dados fornecidos pelo Usuário.</li>
                <li><strong>Calculadora ACC/ACE:</strong> Simulação de custos de Adiantamento sobre Contrato de Câmbio e Adiantamento sobre Cambiais Entregues para operações de exportação, com base em parâmetros de valor, prazo e taxas de câmbio.</li>
                <li><strong>Calculadora de Precificação:</strong> Ferramenta de consulta de preços de referência para exportação baseada em dados históricos de comércio exterior, com comparativo por país de destino.</li>
                <li><strong>Calculadora de Drawback:</strong> Simulador de recuperação de impostos (II, IPI, PIS, COFINS) através dos regimes de Drawback Suspensão, Isenção e Restituição, com estimativas baseadas em alíquotas vigentes e percentual de exportação informado.</li>
                <li><strong>Comparador de Portos:</strong> Análise comparativa dos principais portos brasileiros com base em custos operacionais, tempo médio de desembaraço, eficiência, volume movimentado e perfil de cargas.</li>
                <li><strong>Simulador de Acordos Comerciais:</strong> Ferramenta de estimativa de economia tarifária utilizando acordos de preferência comercial do Brasil (Mercosul, ACE, ALC) com base em alíquotas e regras de origem.</li>
                <li><strong>Calendário Aduaneiro:</strong> Calendário anual com feriados nos principais portos mundiais, períodos de pico de demanda, janelas ideais de importação/exportação e alertas sazonais.</li>
                <li><strong>Conformidade Regulatória:</strong> Ferramenta de verificação de requisitos regulatórios por país e produto, incluindo certificações, licenças, barreiras técnicas e sanitárias aplicáveis à exportação.</li>
              </ul>

              <h3 className="text-base font-extrabold text-[#0F111A] mt-5 mb-2">2.3. Plataforma de Dados e Inteligência</h3>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li><strong>Classificador IA NCM:</strong> Sistema de classificação fiscal automatizada utilizando inteligência artificial para sugestão de códigos NCM e HS a partir da descrição do produto.</li>
                <li><strong>Tarifário Global:</strong> Base de dados de alíquotas de importação para 31 países, com atualização periódica baseada em fontes atualizadas (tarifas NMF e preferenciais).</li>
                <li><strong>Mapa de Importadores:</strong> Ferramenta de visualização geográfica e busca de importadores globais por país, produto e volume, com dados históricos de importação.</li>
                <li><strong>Supply Chain Map:</strong> Visualização interativa de cadeias de suprimento globais, rotas comerciais, origem-destino de produtos e fluxos logísticos.</li>
                <li><strong>Frete Marítimo:</strong> Mapa interativo de rotas marítimas com informações de trânsito, armadores, frequência e estimativas de custo.</li>
                <li><strong>Export Simulator e Country Comparison:</strong> Ferramentas de simulação e comparação de mercados para exportação baseadas em dados históricos e projeções.</li>
                <li><strong>Smart Rank, AI Search, HTS Lookup EUA, NCM Comparison:</strong> Ferramentas avançadas de busca, ranqueamento e comparação de dados de comércio exterior com suporte de inteligência artificial e processamento de linguagem natural.</li>
              </ul>

              <p className="mb-3">A disponibilidade de cada serviço e ferramenta depende do plano contratado (Essential, Growth, Professional ou Business), conforme descrito na página de planos (www.tradexa.com.br/pricing). A TRADEXA reserva-se o direito de modificar, suspender ou descontinuar qualquer serviço ou ferramenta a qualquer momento, mediante comunicação prévia aos Usuários afetados com pelo menos 30 (trinta) dias de antecedência.</p>
              <p>A TRADEXA não é uma empresa de consultoria jurídica, contábil ou fiscal. Todas as informações, análises, relatórios e recomendações fornecidas através da Plataforma têm caráter informativo e não substituem a consulta a profissionais qualificados nas respectivas áreas.</p>
            </div>

            {/* 3. CADASTRO */}
            <div>
              <h2 className="text-xl font-extrabold text-[#0F111A] mb-4">3. Cadastro, Conta e Verificação</h2>
              <p className="mb-3">Para acessar determinados recursos da Plataforma, você deverá criar uma conta fornecendo: nome completo ou razão social, endereço de e-mail válido, número de telefone, CNPJ (opcional para pessoa física) e demais informações solicitadas no formulário de cadastro. Você declara que todas as informações fornecidas são verdadeiras, precisas e atualizadas.</p>
              <p className="mb-3">Você é o único responsável por manter a confidencialidade de suas credenciais de acesso (e-mail e senha) e por todas as atividades que ocorram sob sua conta. Você concorda em notificar imediatamente a TRADEXA sobre qualquer uso não autorizado de sua conta ou qualquer outra violação de segurança através do e-mail help@tradexa.com.br.</p>
              <p className="mb-3">A TRADEXA reserva-se o direito de, a seu exclusivo critério, recusar o cadastro, suspender ou encerrar contas que: (a) fornecerem informações falsas, incompletas ou desatualizadas; (b) violarem qualquer disposição destes Termos; (c) estiverem envolvidas em atividades fraudulentas, ilegais ou que possam causar danos à TRADEXA ou a terceiros; (d) utilizarem a Plataforma de forma abusiva ou excessiva que comprometa a estabilidade dos sistemas; (e) tentarem realizar engenharia reversa, descompilação ou extração não autorizada de dados.</p>
              <p className="mb-3">Cada conta é pessoal e intransferível. Você não poderá ceder, transferir, sublicenciar ou compartilhar suas credenciais de acesso com terceiros não autorizados, exceto quando expressamente permitido pelo plano contratado (múltiplos usuários).</p>
              <p>Para planos empresariais (Professional e Business), a TRADEXA poderá solicitar documentação adicional para verificação da empresa, incluindo comprovante de inscrição no CNPJ, comprovante de endereço comercial e identificação dos representantes legais.</p>
            </div>

            {/* 4. PLANOS E PAGAMENTOS */}
            <div>
              <h2 className="text-xl font-extrabold text-[#0F111A] mb-4">4. Planos, Preços, Pagamentos e Renovação</h2>
              <p className="mb-3">A TRADEXA oferece diferentes planos de assinatura com funcionalidades, limites de uso e preços específicos, conforme detalhado na página de planos. Os preços são exibidos em Reais (BRL) e podem ser alterados mediante comunicação prévia de 30 (trinta) dias.</p>
              <p className="mb-3">Os pagamentos são processados através de provedores de pagamento terceirizados (Mercado Pago, Stripe ou outros que venham a ser integrados). A TRADEXA não armazena dados completos de cartão de crédito — estas informações são processadas diretamente pelos gateways de pagamento em ambiente seguro (PCI-DSS).</p>
              <p className="mb-3">As assinaturas são renovadas automaticamente ao final de cada ciclo de cobrança (mensal ou anual, conforme contratado), salvo cancelamento expresso pelo Usuário com pelo menos 48 (quarenta e oito) horas de antecedência do vencimento. O cancelamento pode ser realizado através das configurações da conta na Plataforma.</p>
              <p className="mb-3">Em caso de downgrade de plano, as novas condições e limites passarão a valer a partir do ciclo de cobrança seguinte. Não há reembolso proporcional por downgrade realizado durante o ciclo vigente. Em caso de upgrade, a diferença proporcional será cobrada e as novas funcionalidades disponibilizadas imediatamente.</p>
              <p className="mb-3">A TRADEXA poderá oferecer períodos de teste gratuito para planos pagos. Ao final do período de teste, caso o Usuário não cancele a assinatura, a cobrança será iniciada automaticamente conforme o plano selecionado. É responsabilidade do Usuário gerenciar o cancelamento antes do término do período de teste caso não deseje prosseguir com o plano pago.</p>
              <p>A falta de pagamento por 3 (três) dias consecutivos após o vencimento poderá resultar na suspensão temporária do acesso aos recursos pagos. Após 15 (quinze) dias de inadimplência, a conta poderá ser convertida automaticamente para o plano gratuito (Essential), com a consequente perda de acesso a dados, relatórios e funcionalidades exclusivas dos planos pagos.</p>
            </div>

            {/* 5. USO ACEITÁVEL */}
            <div>
              <h2 className="text-xl font-extrabold text-[#0F111A] mb-4">5. Uso Aceitável e Restrições</h2>
              <p className="mb-3">Você concorda em utilizar a Plataforma exclusivamente para fins lícitos e em conformidade com estes Termos, a legislação brasileira aplicável e os regulamentos internacionais de comércio. É expressamente vedado:</p>
              <ol type="a" className="list-[lower-alpha] pl-5 space-y-2 mb-4">
                <li>Revender, redistribuir, sublicenciar, alugar, compartilhar, publicar, retransmitir ou de qualquer forma disponibilizar a terceiros não autorizados os dados, relatórios, análises, algoritmos, classificações ou qualquer output gerado pela Plataforma, exceto quando expressamente autorizado pelo plano contratado.</li>
                <li>Realizar raspagem automatizada de dados (web scraping), mineração de dados, extração em massa, ou qualquer forma de coleta sistemática de dados da Plataforma utilizando robôs, spiders, crawlers, scripts ou qualquer método automatizado sem autorização prévia, expressa e por escrito da TRADEXA.</li>
                <li>Utilizar a Plataforma para desenvolver, treinar ou aperfeiçoar produtos ou serviços concorrentes, incluindo modelos de inteligência artificial, sistemas de classificação fiscal, bases de dados de comércio exterior ou qualquer produto que concorra direta ou indiretamente com a TRADEXA.</li>
                <li>Realizar engenharia reversa, descompilar, desmontar, modificar, adaptar, traduzir ou criar obras derivadas do software, algoritmos, bases de dados ou qualquer componente da Plataforma.</li>
                <li>Utilizar a Plataforma para fins ilegais, fraudulentos, difamatórios, abusivos, ou que violem direitos de terceiros, incluindo direitos de propriedade intelectual, privacidade ou imagem.</li>
                <li>Burlar, desativar ou interferir em recursos de segurança da Plataforma, incluindo autenticação, controle de acesso, limitação de uso, proteção contra cópia ou qualquer mecanismo que restrinja o uso não autorizado.</li>
                <li>Utilizar a Plataforma para transmitir vírus, malware, cavalos de Troia, worms, bombas lógicas ou qualquer código malicioso que possa danificar, interceptar ou interferir nos sistemas da TRADEXA ou de terceiros.</li>
                <li>Violar leis e regulamentos de controle de exportação, sanções econômicas, embargos comerciais ou restrições de comércio internacional impostas pelo Brasil, EUA, União Europeia, ONU ou qualquer jurisdição aplicável.</li>
                <li>Criar múltiplas contas para burlar limites de uso do plano gratuito, obter períodos de teste adicionais ou qualquer outra forma de fraude contra os sistemas de cobrança e controle de uso da TRADEXA.</li>
                <li>Utilizar os dados da Plataforma para discriminação ilícita, criação de perfis abusivos ou qualquer forma de tratamento de dados que viole a LGPD ou legislações de proteção de dados aplicáveis.</li>
              </ol>
              <p>A violação de qualquer uma destas restrições poderá resultar na suspensão imediata da conta, rescisão contratual, cobrança de multa compensatória e indenização por perdas e danos, sem prejuízo das medidas judiciais cabíveis.</p>
            </div>

            {/* 6. PROPRIEDADE INTELECTUAL */}
            <div>
              <h2 className="text-xl font-extrabold text-[#0F111A] mb-4">6. Propriedade Intelectual e Direitos sobre os Dados</h2>
              <p className="mb-3">Todos os direitos de propriedade intelectual relativos à Plataforma, incluindo mas não se limitando a: software, código-fonte e código-objeto, algoritmos, modelos de inteligência artificial e machine learning, bases de dados compiladas e tratadas, estruturas de dados, interfaces de usuário, design, elementos visuais, logotipos, marcas, nomes de domínio, textos, gráficos, ícones, imagens, vídeos, materiais educacionais e qualquer conteúdo original produzido pela TRADEXA, são de propriedade exclusiva da TRADEXA ou de seus respectivos licenciadores, estando protegidos pelas leis brasileiras de direitos autorais (Lei 9.610/98), propriedade industrial (Lei 9.279/96) e demais legislações aplicáveis, incluindo tratados internacionais.</p>
              <p className="mb-3">O acesso e uso da Plataforma não transfere ao Usuário nenhum direito de propriedade intelectual, seja a que título for, sobre qualquer elemento da Plataforma. É concedida ao Usuário uma licença limitada, não exclusiva, intransferível e revogável para acessar e utilizar a Plataforma exclusivamente para os fins previstos nestes Termos e de acordo com o plano contratado.</p>
              <p className="mb-3">Os dados brutos de comércio exterior utilizados pela Plataforma são obtidos de fontes atualizadas públicas e bases de dados governamentais. A TRADEXA detém direitos autorais sobre a compilação, tratamento, formatação, estruturação, classificação, aprimoramento, enriquecimento com dados proprietários e apresentação destes dados, constituindo base de dados protegida nos termos do art. 87 da Lei 9.609/98 e do art. 7º, XIII, da Lei 9.610/98.</p>
              <p className="mb-3">O Usuário mantém a titularidade sobre os dados e conteúdos que inserir na Plataforma (descrições de produtos, listas de NCMs, informações de contatos de compradores enviadas por upload, etc.). No entanto, ao inserir tais dados na Plataforma, o Usuário concede à TRADEXA uma licença mundial, perpétua, irrevogável, sublicenciável e isenta de royalties para utilizar, modificar, reproduzir, adaptar, compilar, anonimizar, agregar, criar obras derivadas, armazenar, processar, analisar e explorar comercialmente tais dados e conteúdos, para fins de aprimoramento dos serviços da Plataforma, desenvolvimento de novos produtos, estudos estatísticos, análises de mercado e inteligência comercial.</p>
              <p className="mb-3">Os dados de uso da Plataforma, incluindo mas não se limitando a: consultas realizadas (NCMs, HS codes, países, produtos pesquisados), páginas acessadas, tempo de navegação, funcionalidades utilizadas, interações com a interface, preferências de uso, padrões de comportamento e dados analíticos, pertencem exclusivamente à TRADEXA e poderão ser utilizados para fins comerciais, estatísticos, analíticos, de desenvolvimento de produtos e de inteligência de mercado, de forma agregada e anonimizada, sem identificação individual do Usuário perante terceiros.</p>
              <p>A TRADEXA poderá utilizar, de forma agregada, anonimizada e não identificável, os dados de consultas, padrões de busca e preferências dos Usuários para aprimorar algoritmos, treinar modelos de inteligência artificial, gerar insights de mercado, publicar estudos setoriais anonimizados e desenvolver novas funcionalidades, sem que isso configure violação de direitos do Usuário ou de terceiros.</p>
            </div>

            {/* 7. DADOS DO USUÁRIO */}
            <div>
              <h2 className="text-xl font-extrabold text-[#0F111A] mb-4">7. Tratamento de Dados e Consentimento para Fins Comerciais</h2>
              <p className="mb-3">O tratamento de dados pessoais realizado pela TRADEXA é regido pela Política de Privacidade, disponível em www.tradexa.com.br/privacidade, que integra estes Termos para todos os fins legais. Ao aceitar estes Termos, você também declara ter lido e concordado com a Política de Privacidade.</p>
              <p className="mb-3">O Usuário expressamente consente e autoriza que a TRADEXA: (a) colete, armazene, processe, analise e utilize dados de navegação, consultas, preferências, interações e padrões de uso da Plataforma; (b) crie perfis estatísticos e analíticos agregados e anonimizados; (c) utilize tais dados para fins de inteligência comercial, desenvolvimento de produtos, precificação de serviços, benchmarking setorial e publicações de mercado; (d) compartilhe dados agregados e anonimizados com parceiros comerciais, clientes corporativos, instituições de pesquisa, órgãos setoriais e para fins de relações públicas e marketing institucional.</p>
              <p className="mb-3">A TRADEXA não compartilhará dados pessoais identificáveis (nome, e-mail, CPF/CNPJ, telefone) com terceiros para fins de marketing sem o consentimento expresso e específico do Usuário, ressalvadas as hipóteses legais de compartilhamento previstas na LGPD (Lei 13.709/2018), tais como cumprimento de obrigação legal, execução de políticas públicas, proteção da vida ou segurança física, e tutela da saúde.</p>
              <p>Em caso de operações societárias envolvendo a TRADEXA, tais como fusão, aquisição, incorporação, cisão, venda de ativos ou reestruturação, os dados dos Usuários, incluindo dados pessoais e dados de uso, poderão ser transferidos como parte dos ativos da empresa, resguardados os direitos dos titulares previstos na legislação aplicável.</p>
            </div>

            {/* 8. SIGILO E CONFIDENCIALIDADE */}
            <div>
              <h2 className="text-xl font-extrabold text-[#0F111A] mb-4">8. Sigilo e Confidencialidade</h2>
              <p className="mb-3">O Usuário reconhece que poderá ter acesso a informações confidenciais da TRADEXA, incluindo mas não se limitando a: algoritmos proprietários, métodos de processamento de dados, bases de dados compiladas, modelos de precificação, estratégias comerciais e know-how técnico. O Usuário concorda em manter estrito sigilo sobre tais informações, não as divulgar a terceiros e não as utilizar para qualquer finalidade diversa do uso autorizado da Plataforma.</p>
              <p>Da mesma forma, a TRADEXA compromete-se a tratar como confidenciais as informações comerciais sensíveis do Usuário que forem compartilhadas no contexto dos serviços de consultoria (Pesquisa de Mercado, Pesquisa de Compradores, Auditoria Fiscal e demais serviços de entrega humana), não as divulgando a terceiros não autorizados, ressalvado o disposto na cláusula 7 acima quanto a dados agregados e anonimizados.</p>
            </div>

            {/* 9. LIMITAÇÃO DE RESPONSABILIDADE */}
            <div>
              <h2 className="text-xl font-extrabold text-[#0F111A] mb-4">9. Limitação de Responsabilidade e Isenções</h2>
              <p className="mb-3">A Plataforma e todos os seus serviços, ferramentas, dados, relatórios, análises e conteúdos são fornecidos "no estado em que se encontram" (as is) e "conforme disponibilidade", sem garantias de qualquer tipo, expressas ou implícitas, incluindo mas não se limitando a garantias de comercialização, adequação a finalidade específica, precisão, atualidade, completude, disponibilidade ininterrupta ou ausência de erros.</p>
              <p className="mb-3">A TRADEXA envida seus melhores esforços para manter os dados atualizados e precisos, utilizando fontes atualizadas governamentais e processos internos de verificação. No entanto, a TRADEXA não garante e não se responsabiliza por: (a) erros, omissões, imprecisões ou desatualizações nos dados de comércio exterior, tarifas, classificações fiscais (NCM/HS), dados de importadores, informações portuárias ou qualquer outro dado disponibilizado; (b) decisões comerciais, financeiras, tributárias, logísticas, jurídicas ou de qualquer natureza tomadas pelo Usuário com base nas informações da Plataforma; (c) prejuízos, perdas ou danos decorrentes do uso ou da impossibilidade de uso da Plataforma, incluindo lucros cessantes, perda de oportunidades comerciais, danos emergentes, danos morais ou danos indiretos de qualquer natureza.</p>
              <p className="mb-3">Em nenhuma hipótese a responsabilidade total da TRADEXA, seja por contrato, ato ilícito (incluindo negligência), responsabilidade objetiva ou qualquer outra teoria jurídica, excederá o valor total pago pelo Usuário à TRADEXA nos 6 (seis) meses imediatamente anteriores ao evento que deu origem à reclamação. Para Usuários do plano gratuito (Essential), a responsabilidade da TRADEXA limita-se a R$ 100,00 (cem reais).</p>
              <p className="mb-3">A TRADEXA não se responsabiliza por: (a) indisponibilidade temporária da Plataforma decorrente de manutenção programada, falhas de infraestrutura de terceiros (hospedagem, CDN, DNS), ataques cibernéticos, casos fortuitos ou força maior; (b) perda de dados decorrente de falhas nos dispositivos do Usuário, problemas de conectividade ou uso inadequado da Plataforma; (c) conteúdo de sites de terceiros acessados através de links disponibilizados na Plataforma.</p>
              <p>As limitações de responsabilidade estabelecidas nesta cláusula aplicam-se na máxima extensão permitida pela legislação brasileira. Algumas jurisdições não permitem a exclusão de garantias implícitas ou a limitação de responsabilidade por danos incidentais ou consequenciais, de modo que as limitações acima podem não se aplicar integralmente ao Usuário.</p>
            </div>

            {/* 10. INDENIZAÇÃO */}
            <div>
              <h2 className="text-xl font-extrabold text-[#0F111A] mb-4">10. Indenização</h2>
              <p>Você concorda em indenizar, defender e isentar a TRADEXA, seus administradores, diretores, empregados, prestadores de serviços, parceiros, agentes e representantes de e contra quaisquer reclamações, demandas, ações judiciais, danos, perdas, custos e despesas (incluindo honorários advocatícios razoáveis) decorrentes de: (a) violação destes Termos; (b) uso inadequado, fraudulento ou ilegal da Plataforma; (c) violação de direitos de terceiros, incluindo direitos de propriedade intelectual; (d) informações falsas, imprecisas ou desatualizadas fornecidas pelo Usuário; (e) conduta dolosa ou culposa do Usuário no uso da Plataforma.</p>
            </div>

            {/* 11. CANCELAMENTO */}
            <div>
              <h2 className="text-xl font-extrabold text-[#0F111A] mb-4">11. Cancelamento, Suspensão e Encerramento</h2>
              <p className="mb-3">O Usuário poderá cancelar sua conta a qualquer momento através das configurações da Plataforma ou mediante solicitação por escrito para help@tradexa.com.br. O cancelamento de planos pagos entra em vigor ao final do ciclo de cobrança corrente, não havendo reembolso proporcional do período já pago, salvo nas hipóteses de vício ou defeito na prestação do serviço, conforme previsto no Código de Defesa do Consumidor (Lei 8.078/90).</p>
              <p className="mb-3">A TRADEXA reserva-se o direito de suspender ou encerrar a conta do Usuário, a qualquer momento e sem aviso prévio, nas seguintes hipóteses: (a) violação de qualquer disposição destes Termos; (b) determinação judicial ou de autoridade competente; (c) solicitação do Usuário; (d) inatividade da conta por período superior a 12 (doze) meses em planos gratuitos; (e) encerramento ou descontinuação da Plataforma.</p>
              <p className="mb-3">Após o cancelamento ou encerramento da conta: (a) o Usuário perderá o acesso a todos os recursos, dados e funcionalidades da Plataforma; (b) os dados de consultas e relatórios gerados permanecerão armazenados por 90 (noventa) dias, período durante o qual o Usuário poderá solicitar a exportação de seus dados; (c) após 90 (noventa) dias, todos os dados pessoais e conteúdos do Usuário serão permanentemente excluídos, ressalvados os dados agregados e anonimizados já incorporados às bases de inteligência da TRADEXA e as obrigações legais de retenção de dados (fiscais, contábeis, etc.).</p>
              <p>Nenhuma disposição destes Termos que por sua natureza deva subsistir ao encerramento da conta (incluindo, sem limitação, propriedade intelectual, limitação de responsabilidade, indenização, foro e lei aplicável) será afetada pelo cancelamento ou encerramento da conta.</p>
            </div>

            {/* 12. MODIFICAÇÕES */}
            <div>
              <h2 className="text-xl font-extrabold text-[#0F111A] mb-4">12. Alterações dos Termos</h2>
              <p className="mb-3">A TRADEXA reserva-se o direito de modificar estes Termos a qualquer momento, a seu exclusivo critério, para refletir alterações nos serviços, na legislação aplicável, nas práticas de mercado ou por qualquer outra razão comercial razoável.</p>
              <p className="mb-3">Alterações significativas serão comunicadas aos Usuários por e-mail com pelo menos 30 (trinta) dias de antecedência e publicadas na Plataforma. Alterações não significativas (como correções ortográficas, ajustes de formatação ou esclarecimentos que não alterem substancialmente direitos e obrigações) entrarão em vigor imediatamente após a publicação.</p>
              <p className="mb-3">O uso continuado da Plataforma após a entrada em vigor das alterações constitui aceitação tácita dos novos Termos. Caso você não concorde com as alterações, deverá cessar o uso da Plataforma e cancelar sua conta antes da entrada em vigor das modificações.</p>
              <p>Recomendamos que você revise periodicamente estes Termos para manter-se informado sobre as condições aplicáveis ao uso da Plataforma. O histórico de versões anteriores estará disponível mediante solicitação.</p>
            </div>

            {/* 13. DISPOSIÇÕES GERAIS */}
            <div>
              <h2 className="text-xl font-extrabold text-[#0F111A] mb-4">13. Disposições Gerais</h2>
              <p className="mb-3"><strong>13.1. Integralidade do Acordo.</strong> Estes Termos, juntamente com a Política de Privacidade e os documentos incorporados por referência, constituem o acordo integral entre você e a TRADEXA com relação ao uso da Plataforma, substituindo quaisquer entendimentos, acordos ou comunicações anteriores, verbais ou escritos.</p>
              <p className="mb-3"><strong>13.2. Independência das Disposições.</strong> Se qualquer disposição destes Termos for considerada inválida, ilegal ou inexequível por um tribunal competente, as demais disposições permanecerão em pleno vigor e efeito. A disposição inválida será substituída por uma disposição válida que mais se aproxime da intenção econômica original das partes.</p>
              <p className="mb-3"><strong>13.3. Tolerância e Renúncia.</strong> A falta de exercício, pela TRADEXA, de qualquer direito ou disposição destes Termos não constituirá renúncia a tal direito ou disposição. A renúncia a qualquer violação não constituirá renúncia a violações subsequentes.</p>
              <p className="mb-3"><strong>13.4. Cessão.</strong> O Usuário não poderá ceder ou transferir seus direitos e obrigações decorrentes destes Termos sem o consentimento prévio e por escrito da TRADEXA. A TRADEXA poderá ceder ou transferir estes Termos, no todo ou em parte, a qualquer momento, mediante notificação ao Usuário.</p>
              <p className="mb-3"><strong>13.5. Comunicações.</strong> Ao se cadastrar na Plataforma, você concorda em receber comunicações eletrônicas da TRADEXA, incluindo e-mails transacionais (confirmação de cadastro, alterações de plano, notificações de segurança), comunicados sobre a Plataforma, newsletters e materiais informativos. Você poderá cancelar a assinatura de comunicações de marketing a qualquer momento através do link de descadastramento presente nos e-mails ou nas configurações da conta. Comunicações transacionais e de segurança não podem ser canceladas.</p>
              <p className="mb-3"><strong>13.6. Força Maior.</strong> A TRADEXA não será responsável por falhas ou atrasos no cumprimento de suas obrigações quando decorrentes de eventos fora de seu controle razoável, incluindo, sem limitação: desastres naturais, epidemias, pandemias, atos governamentais, guerras, terrorismo, distúrbios civis, greves, interrupções de energia ou telecomunicações, ataques cibernéticos e falhas de provedores de infraestrutura.</p>
              <p><strong>13.7. Lei Aplicável e Foro.</strong> Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da Comarca de Florianópolis, Estado de Santa Catarina, para dirimir quaisquer controvérsias decorrentes destes Termos, com renúncia expressa a qualquer outro foro, por mais privilegiado que seja.</p>
            </div>

            {/* 14. CONTATO */}
            <div>
              <h2 className="text-xl font-extrabold text-[#0F111A] mb-4">14. Contato e Encarregado de Dados</h2>
              <p className="mb-3">Para questões relacionadas a estes Termos, incluindo dúvidas sobre direitos e obrigações, solicitações de versões anteriores ou notificações extrajudiciais:</p>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
                <p><strong>TRADEXA</strong></p>
                <p>E-mail: help@tradexa.com.br</p>
                <p>Endereço: Florianópolis, Santa Catarina, Brasil</p>
                <p>Encarregado de Proteção de Dados (DPO): help@tradexa.com.br</p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
