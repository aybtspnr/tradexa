"use client";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";

export default function PrivacidadePage() {
  useSeo({
    title: "Política de Privacidade — TRADEXA",
    description: "Política de privacidade da TRADEXA. Como coletamos, usamos, armazenamos e protegemos seus dados de acordo com a LGPD.",
    keywords: "privacidade tradexa, política privacidade, LGPD tradexa, proteção dados, tratamento dados pessoais",
    canonical: "https://www.tradexa.com.br/privacidade",
  });

  return (
    <SiteLayout>
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
            <Badge className="mb-4 font-bold text-[11px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-0 bg-[#D80E16]/8 text-[#D80E16]">Privacidade</Badge>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F111A] mb-4">Política de Privacidade</h1>
            <p className="text-[#5E6278]">Última atualização: 29 de Maio de 2026</p>
          </motion.div>

          <div className="prose prose-slate max-w-none space-y-10 text-[#5E6278] leading-relaxed text-sm md:text-base">

            {/* 1. INTRODUÇÃO */}
            <div>
              <h2 className="text-xl font-extrabold text-[#0F111A] mb-4">1. Introdução e Compromisso</h2>
              <p className="mb-3">A TRADEXA, com sede em Florianópolis, Santa Catarina, Brasil ("TRADEXA", "nós", "nosso"), está comprometida com a proteção da privacidade e dos dados pessoais de seus Usuários ("você", "titular"), em conformidade com a Lei Geral de Proteção de Dados Pessoais — LGPD (Lei nº 13.709/2018), o Marco Civil da Internet (Lei nº 12.965/2014), o Código de Defesa do Consumidor (Lei nº 8.078/1990) e demais legislações aplicáveis.</p>
              <p className="mb-3">Esta Política de Privacidade descreve de forma transparente, clara e detalhada: (a) quais dados pessoais e informações coletamos; (b) como e para quais finalidades os utilizamos; (c) com quem os compartilhamos; (d) como os armazenamos e protegemos; (e) por quanto tempo os mantemos; (f) quais são seus direitos como titular de dados; e (g) como você pode exercer esses direitos.</p>
              <p className="mb-3">Ao utilizar a Plataforma TRADEXA (www.tradexa.com.br e subdomínios), criar uma conta, contratar nossos serviços, preencher formulários, interagir com nossas ferramentas ou de qualquer forma fornecer seus dados pessoais, você declara estar ciente e concordar com os termos desta Política de Privacidade, autorizando expressamente o tratamento de seus dados pessoais conforme aqui descrito.</p>
              <p>Caso você não concorde com qualquer disposição desta Política, não utilize a Plataforma e não forneça seus dados pessoais. Esta Política de Privacidade integra e complementa os Termos de Uso da TRADEXA, disponíveis em www.tradexa.com.br/termos.</p>
            </div>

            {/* 2. DEFINIÇÕES */}
            <div>
              <h2 className="text-xl font-extrabold text-[#0F111A] mb-4">2. Definições e Conceitos</h2>
              <p className="mb-3">Para os fins desta Política, adotam-se as definições estabelecidas no art. 5º da Lei 13.709/2018 (LGPD), destacando-se:</p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li><strong>Dado Pessoal:</strong> Qualquer informação relacionada a pessoa natural identificada ou identificável.</li>
                <li><strong>Dado Pessoal Sensível:</strong> Dado pessoal sobre origem racial ou étnica, convicção religiosa, opinião política, filiação a sindicato ou a organização de caráter religioso, filosófico ou político, dado referente à saúde ou à vida sexual, dado genético ou biométrico.</li>
                <li><strong>Titular:</strong> Pessoa natural a quem se referem os dados pessoais que são objeto de tratamento.</li>
                <li><strong>Controlador:</strong> Pessoa natural ou jurídica a quem competem as decisões referentes ao tratamento de dados pessoais. Para os fins desta Política, a Controladora é a TRADEXA.</li>
                <li><strong>Operador:</strong> Pessoa natural ou jurídica que realiza o tratamento de dados pessoais em nome do Controlador.</li>
                <li><strong>Encarregado (DPO):</strong> Pessoa indicada pelo Controlador para atuar como canal de comunicação entre o Controlador, os titulares dos dados e a Autoridade Nacional de Proteção de Dados (ANPD).</li>
                <li><strong>Tratamento:</strong> Toda operação realizada com dados pessoais, como coleta, produção, recepção, classificação, utilização, acesso, reprodução, transmissão, distribuição, processamento, arquivamento, armazenamento, eliminação, avaliação, controle da informação, modificação, comunicação, transferência, difusão ou extração.</li>
                <li><strong>Anonimização:</strong> Utilização de meios técnicos razoáveis pelos quais um dado perde a possibilidade de associação, direta ou indireta, a um indivíduo.</li>
              </ul>
            </div>

            {/* 3. DADOS COLETADOS */}
            <div>
              <h2 className="text-xl font-extrabold text-[#0F111A] mb-4">3. Quais Dados Coletamos</h2>
              <p className="mb-3">A TRADEXA coleta apenas os dados estritamente necessários para fornecer, operar, manter, melhorar e personalizar nossos serviços. A coleta ocorre de forma transparente, mediante consentimento ou com fundamento nas bases legais previstas na LGPD.</p>

              <h3 className="text-base font-extrabold text-[#0F111A] mt-5 mb-2">3.1. Dados Fornecidos Ativamente por Você</h3>
              <p className="mb-3">Quando você interage com a Plataforma, podemos coletar:</p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li><strong>Dados de Cadastro:</strong> Nome completo ou razão social, endereço de e-mail, número de telefone, cargo/função (opcional), nome da empresa (opcional), CNPJ (opcional), setor de atuação (opcional), país de origem (opcional), preferências de idioma.</li>
                <li><strong>Dados de Perfil Profissional:</strong> Informações sobre tipo de operação (importador, exportador, ambos, prestador de serviço), modais utilizados (marítimo, aéreo, rodoviário, courier), regiões de atuação, produtos de interesse, faixas de NCM consultadas, porte da empresa, volume aproximado de operações.</li>
                <li><strong>Dados de Pagamento:</strong> Para processamento de assinaturas pagas, coletamos dados de cobrança (nome do titular do cartão, endereço de cobrança). Dados completos de cartão de crédito (número, CVV, data de validade) são processados diretamente pelos provedores de pagamento (Mercado Pago, Stripe) e não são armazenados pela TRADEXA.</li>
                <li><strong>Dados de Comunicação:</strong> Conteúdo de mensagens enviadas através de formulários de contato, e-mails para help@tradexa.com.br, interações com nossa equipe de suporte e consultores comerciais, incluindo histórico de conversas, solicitações, reclamações e feedbacks.</li>
                <li><strong>Dados de Serviços:</strong> Informações fornecidas no contexto de serviços de consultoria, como listas de produtos, NCMs a serem auditados, descrições detalhadas de mercadorias, volumes de exportação/importação, países-alvo e documentação comercial.</li>
                <li><strong>Currículos e Dados Profissionais:</strong> Caso você se candidate a vagas através do link "Trabalhe Conosco", coletaremos os dados fornecidos no currículo e formulário de candidatura.</li>
              </ul>

              <h3 className="text-base font-extrabold text-[#0F111A] mt-5 mb-2">3.2. Dados Coletados Automaticamente</h3>
              <p className="mb-3">Quando você acessa e utiliza a Plataforma, podemos coletar automaticamente:</p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li><strong>Dados de Uso e Navegação:</strong> Páginas visitadas, tempo de permanência em cada página, funcionalidades e ferramentas utilizadas, sequência de cliques (clickstream), consultas realizadas (NCMs, HS codes, países, produtos pesquisados), filtros aplicados, relatórios gerados, documentos baixados.</li>
                <li><strong>Dados Técnicos e de Dispositivo:</strong> Endereço IP (Internet Protocol), tipo e versão do navegador, sistema operacional, resolução de tela, idioma do navegador, fuso horário, identificadores de dispositivo, tipo de dispositivo (desktop, mobile, tablet).</li>
                <li><strong>Dados de Localização Geográfica Aproximada:</strong> País, estado/região e cidade inferidos a partir do endereço IP, para fins de análise estatística, prevenção de fraudes e cumprimento de requisitos legais regionais. Não coletamos dados de localização precisa (GPS).</li>
                <li><strong>Dados de Origem de Tráfego:</strong> URL de referência (referrer), termos de busca utilizados em mecanismos de pesquisa para chegar à Plataforma, campanhas de marketing que originaram o acesso, fonte de tráfego (orgânico, pago, direto, social, e-mail).</li>
                <li><strong>Cookies e Tecnologias Similares:</strong> Conforme detalhado na Seção 6 desta Política.</li>
              </ul>

              <h3 className="text-base font-extrabold text-[#0F111A] mt-5 mb-2">3.3. Dados que NÃO Coletamos</h3>
              <p>A TRADEXA não coleta intencionalmente: (a) dados pessoais sensíveis (origem racial, convicções religiosas, opiniões políticas, dados de saúde, dados biométricos, dados genéticos); (b) dados de crianças e adolescentes menores de 18 anos; (c) dados de cartão de crédito completos (número, CVV); (d) dados de navegação em sites de terceiros não relacionados à Plataforma; (e) dados de geolocalização precisa (GPS). Caso algum destes dados seja inadvertidamente coletado, serão imediatamente excluídos.</p>
            </div>

            {/* 4. FINALIDADES */}
            <div>
              <h2 className="text-xl font-extrabold text-[#0F111A] mb-4">4. Como Utilizamos Seus Dados — Finalidades e Bases Legais</h2>
              <p className="mb-3">Todo tratamento de dados pessoais realizado pela TRADEXA possui fundamento em uma das bases legais previstas no art. 7º da LGPD, conforme detalhado a seguir:</p>

              <h3 className="text-base font-extrabold text-[#0F111A] mt-5 mb-2">4.1. Execução de Contrato e Procedimentos Preliminares (Art. 7º, V)</h3>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>Criar, gerenciar e manter sua conta na Plataforma.</li>
                <li>Processar pagamentos de assinaturas e gerenciar ciclos de cobrança.</li>
                <li>Fornecer acesso às funcionalidades e limites do plano contratado.</li>
                <li>Controlar o uso de recursos e aplicar limites de consultas por plano.</li>
                <li>Prestar os serviços comerciais contratados (Pesquisa de Mercado, Pesquisa de Compradores, Cotação de Frete, Despacho Aduaneiro, Fulfillment, Representação Comercial, Auditoria Fiscal).</li>
                <li>Emitir notas fiscais, faturas e comprovantes de pagamento.</li>
                <li>Enviar comunicações transacionais essenciais (confirmação de cadastro, alterações de plano, notificações de segurança, alertas de vencimento).</li>
              </ul>

              <h3 className="text-base font-extrabold text-[#0F111A] mt-5 mb-2">4.2. Consentimento (Art. 7º, I)</h3>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>Envio de newsletters, informativos setoriais, materiais educacionais e conteúdos de marketing sobre comércio exterior.</li>
                <li>Envio de comunicações promocionais sobre novos serviços, ferramentas, planos e ofertas especiais.</li>
                <li>Convites para participação em pesquisas de satisfação, pesquisas de mercado e testes de novas funcionalidades (beta testing).</li>
                <li>Utilização de dados de uso e navegação para personalização da experiência na Plataforma (recomendações de ferramentas e conteúdos).</li>
                <li>Processamento de currículos e dados de candidatura para fins de recrutamento e seleção.</li>
              </ul>

              <h3 className="text-base font-extrabold text-[#0F111A] mt-5 mb-2">4.3. Legítimo Interesse (Art. 7º, IX)</h3>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li><strong>Aprimoramento da Plataforma:</strong> Analisar padrões de uso, comportamento de navegação e interações para identificar oportunidades de melhoria, corrigir erros, otimizar a interface do usuário e desenvolver novas funcionalidades.</li>
                <li><strong>Inteligência Comercial e Análise de Mercado:</strong> Utilizar dados agregados e anonimizados de consultas, buscas e preferências dos Usuários para gerar insights de mercado, identificar tendências de comércio exterior, desenvolver benchmarks setoriais e publicar estudos e relatórios de mercado.</li>
                <li><strong>Treinamento de Modelos de IA:</strong> Utilizar dados de consultas e classificações para treinar, validar e aprimorar nossos algoritmos de inteligência artificial, incluindo o Classificador IA NCM, sistemas de busca inteligente e modelos de recomendação.</li>
                <li><strong>Segurança e Prevenção de Fraudes:</strong> Monitorar atividades na Plataforma para detectar, investigar e prevenir acessos não autorizados, fraudes, abusos dos Termos de Uso, raspagem automatizada de dados e outras atividades ilícitas ou violadoras.</li>
                <li><strong>Defesa de Direitos:</strong> Utilizar dados para exercício regular de direitos em processos judiciais, administrativos ou arbitrais, incluindo defesa em reclamações e litígios.</li>
                <li><strong>Análise de Negócios:</strong> Produzir análises estatísticas agregadas sobre uso da Plataforma, desempenho de serviços, métricas de retenção e crescimento para tomada de decisões estratégicas e operacionais.</li>
                <li><strong>Marketing e Prospecção Comercial:</strong> Identificar potenciais Usuários e clientes com base em dados públicos de mercado, realizar análises de perfil para segmentação e direcionamento de campanhas, e mensurar a eficácia de ações de marketing.</li>
              </ul>

              <h3 className="text-base font-extrabold text-[#0F111A] mt-5 mb-2">4.4. Obrigação Legal e Regulatória (Art. 7º, II)</h3>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>Cumprir obrigações fiscais, contábeis e tributárias (emissão e guarda de notas fiscais, escrituração contábil).</li>
                <li>Atender a requisições de autoridades judiciais, administrativas, policiais e regulatórias competentes.</li>
                <li>Cumprir determinações da Autoridade Nacional de Proteção de Dados (ANPD).</li>
                <li>Manter registros de acesso e logs conforme exigido pelo Marco Civil da Internet (Art. 15 da Lei 12.965/2014) e pela LGPD.</li>
                <li>Reportar incidentes de segurança envolvendo dados pessoais às autoridades competentes e aos titulares afetados, conforme exigido pelo art. 48 da LGPD.</li>
              </ul>

              <h3 className="text-base font-extrabold text-[#0F111A] mt-5 mb-2">4.5. Uso Comercial de Dados Agregados e Anonimizados</h3>
              <p className="mb-3">A TRADEXA reserva-se expressamente o direito de utilizar, reproduzir, adaptar, compilar, analisar, publicar, licenciar, comercializar e explorar economicamente dados agregados, anonimizados, estatísticos e insights derivados dos dados de uso e consultas realizadas na Plataforma, sem qualquer ônus ou obrigação para com os Usuários.</p>
              <p>Este uso comercial de dados agregados e anonimizados inclui, exemplificativamente: (a) publicação de relatórios setoriais de comércio exterior; (b) desenvolvimento e comercialização de índices e indicadores de mercado; (c) fornecimento de inteligência de mercado para clientes corporativos e institucionais; (d) criação de benchmarks comparativos por setor, país e produto; (e) análises de tendências de importação e exportação; (f) estudos de viabilidade de mercado. Em nenhuma hipótese o Usuário individual será identificado ou identificável perante terceiros neste contexto.</p>
            </div>

            {/* 5. COMPARTILHAMENTO */}
            <div>
              <h2 className="text-xl font-extrabold text-[#0F111A] mb-4">5. Compartilhamento de Dados com Terceiros</h2>
              <p className="mb-3">A TRADEXA não vende, aluga ou comercializa dados pessoais identificáveis de seus Usuários. O compartilhamento de dados ocorre apenas nas situações e com as finalidades descritas abaixo, sempre observando os princípios da LGPD:</p>

              <h3 className="text-base font-extrabold text-[#0F111A] mt-5 mb-2">5.1. Prestadores de Serviço e Operadores</h3>
              <p className="mb-3">Compartilhamos dados com prestadores de serviços terceirizados que atuam como Operadores, exclusivamente para viabilizar a prestação dos serviços da Plataforma:</p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li><strong>Supabase Inc.:</strong> Infraestrutura de banco de dados, autenticação de usuários e armazenamento de dados. Os dados são hospedados em servidores localizados nos Estados Unidos (região AWS us-east-1), com cláusulas contratuais padrão que garantem nível adequado de proteção conforme o art. 33 da LGPD.</li>
                <li><strong>Vercel Inc.:</strong> Hospedagem e distribuição de conteúdo (CDN) da Plataforma. Dados de navegação (IP, user-agent) podem ser processados para fins de entrega de conteúdo e segurança.</li>
                <li><strong>Mercado Pago / Stripe:</strong> Processamento de pagamentos de assinaturas, sem acesso da TRADEXA aos dados completos de cartão de crédito.</li>
                <li><strong>Resend:</strong> Serviço de envio de e-mails transacionais e notificações (confirmações de cadastro, alterações de plano, comunicações de segurança).</li>
                <li><strong>Plataformas de Analytics:</strong> Ferramentas de análise de uso da Plataforma, com dados agregados e anonimizados para compreensão do comportamento de navegação e melhoria contínua.</li>
              </ul>

              <h3 className="text-base font-extrabold text-[#0F111A] mt-5 mb-2">5.2. Parceiros Comerciais e Serviços Integrados</h3>
              <p className="mb-3">Em determinados serviços, podemos compartilhar dados com parceiros comerciais para viabilizar a prestação do serviço contratado:</p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li><strong>Despachantes Aduaneiros:</strong> Para execução do serviço de Despacho Aduaneiro, os dados da operação e documentos comerciais são compartilhados com o despachante responsável.</li>
                <li><strong>Armadores e Agentes de Carga:</strong> Para Cotação de Frete, dados da carga (tipo, volume, origem, destino, NCM) são compartilhados para obtenção de cotações.</li>
                <li><strong>Operadores Logísticos e Centros de Distribuição:</strong> Para serviços de Fulfillment, dados dos produtos e volumes são compartilhados com os operadores logísticos parceiros.</li>
                <li><strong>Consultores e Especialistas:</strong> Para serviços de pesquisa de mercado e auditoria fiscal, dados são compartilhados com especialistas para elaboração de análises e relatórios.</li>
              </ul>

              <h3 className="text-base font-extrabold text-[#0F111A] mt-5 mb-2">5.3. Autoridades e Obrigações Legais</h3>
              <p className="mb-3">Poderemos compartilhar dados pessoais quando exigido por lei, determinação judicial, requisição de autoridade administrativa competente, ou para: (a) cumprir obrigação legal ou regulatória; (b) proteger os direitos, a propriedade ou a segurança da TRADEXA, de seus Usuários ou do público em geral; (c) detectar, prevenir ou investigar fraudes, questões de segurança ou atividades ilegais; (d) exercer defesa em processos judiciais, administrativos ou arbitrais.</p>

              <h3 className="text-base font-extrabold text-[#0F111A] mt-5 mb-2">5.4. Operações Societárias</h3>
              <p>Em caso de reorganização societária, fusão, aquisição, incorporação, cisão, joint venture, venda de ativos, financiamento ou operação similar envolvendo a TRADEXA, os dados pessoais sob nosso controle, incluindo bases de dados de Usuários, poderão ser transferidos como parte dos ativos da empresa, assegurados os direitos dos titulares previstos na legislação brasileira e comunicado aos Usuários sobre a transferência e identidade do novo Controlador.</p>
            </div>

            {/* 6. COOKIES */}
            <div>
              <h2 className="text-xl font-extrabold text-[#0F111A] mb-4">6. Cookies e Tecnologias de Rastreamento</h2>
              <p className="mb-3">Cookies são pequenos arquivos de texto armazenados no seu navegador que permitem reconhecer seu dispositivo, lembrar preferências e analisar padrões de navegação. A TRADEXA utiliza cookies para as seguintes finalidades:</p>

              <h3 className="text-base font-extrabold text-[#0F111A] mt-5 mb-2">6.1. Cookies Estritamente Necessários (Essenciais)</h3>
              <p className="mb-3">Estes cookies são indispensáveis para o funcionamento da Plataforma e não podem ser desativados em nossos sistemas. Incluem cookies de sessão para autenticação de usuários logados, manutenção de estado durante a navegação, proteção contra ataques CSRF (Cross-Site Request Forgery) e balanceamento de carga. Não armazenam informações pessoais identificáveis além do estritamente necessário para a segurança e funcionamento da sessão.</p>

              <h3 className="text-base font-extrabold text-[#0F111A] mt-5 mb-2">6.2. Cookies de Desempenho e Análise</h3>
              <p className="mb-3">Utilizamos cookies analíticos para compreender como os Usuários interagem com a Plataforma, incluindo páginas mais visitadas, tempo de permanência, funcionalidades mais utilizadas e padrões de navegação. Estes dados são coletados de forma agregada e anônima, e nos ajudam a medir e melhorar o desempenho da Plataforma.</p>

              <h3 className="text-base font-extrabold text-[#0F111A] mt-5 mb-2">6.3. Cookies de Funcionalidade e Preferências</h3>
              <p className="mb-3">Estes cookies permitem lembrar escolhas que você faz na Plataforma, como preferências de idioma, região, configurações de exibição e personalização da interface, proporcionando uma experiência mais personalizada.</p>

              <h3 className="text-base font-extrabold text-[#0F111A] mt-5 mb-2">6.4. Cookies de Terceiros</h3>
              <p className="mb-3">Não utilizamos cookies de redes de publicidade de terceiros, cookies de rastreamento comportamental (behavioral tracking) para fins de marketing, ou cookies de mídia social para criação de perfis de segmentação publicitária. Não integramos pixels de rastreamento do Facebook, Google Ads, LinkedIn ou outras plataformas de publicidade que rastreiam usuários entre sites.</p>

              <h3 className="text-base font-extrabold text-[#0F111A] mt-5 mb-2">6.5. Gerenciamento de Cookies</h3>
              <p>A maioria dos navegadores permite gerenciar cookies através das configurações de privacidade, incluindo opções para: bloquear todos os cookies, aceitar apenas cookies de primeira parte, excluir cookies ao fechar o navegador, navegar em modo anônimo/privado. Note que o bloqueio de cookies essenciais pode impedir o funcionamento adequado da Plataforma, incluindo a impossibilidade de realizar login e acessar funcionalidades de conta.</p>
            </div>

            {/* 7. ARMAZENAMENTO E SEGURANÇA */}
            <div>
              <h2 className="text-xl font-extrabold text-[#0F111A] mb-4">7. Armazenamento, Segurança e Transferência Internacional</h2>
              <p className="mb-3">Seus dados pessoais são armazenados em infraestrutura de nuvem segura do Supabase, hospedada em servidores localizados nos Estados Unidos (região AWS us-east-1), com mecanismos de redundância, backup automático e recuperação de desastres. A Supabase Inc. mantém certificações SOC 2 Type II e ISO 27001, demonstrando conformidade com padrões internacionais de segurança da informação.</p>
              <p className="mb-3">Implementamos medidas técnicas e organizacionais de segurança para proteger seus dados contra acessos não autorizados, destruição acidental ou ilícita, perda, alteração, comunicação ou qualquer forma de tratamento inadequado, incluindo: (a) criptografia de dados em trânsito (TLS 1.3); (b) criptografia de dados em repouso (AES-256); (c) hashing de senhas com algoritmos robustos (bcrypt/scrypt); (d) controle de acesso baseado em funções (RBAC); (e) autenticação de dois fatores (2FA) para acesso administrativo; (f) monitoramento contínuo de segurança e detecção de intrusão; (g) testes periódicos de penetração e varredura de vulnerabilidades; (h) políticas internas de segurança e treinamento de equipe; (i) acordos de confidencialidade com todos os prestadores de serviço com acesso a dados.</p>
              <p className="mb-3">Em caso de incidente de segurança que possa acarretar risco ou dano relevante aos titulares de dados, a TRADEXA comunicará os titulares afetados e a Autoridade Nacional de Proteção de Dados (ANPD) em prazo razoável, conforme definido pela ANPD, incluindo a natureza dos dados afetados, informações sobre os titulares envolvidos, indicação das medidas de segurança utilizadas para proteção dos dados, os riscos relacionados ao incidente e as medidas adotadas para mitigar os efeitos do incidente.</p>
              <p>Considerando que a internet não é um ambiente completamente seguro e que nenhum sistema de segurança é infalível, a TRADEXA não pode garantir segurança absoluta. O Usuário também tem papel fundamental na proteção de seus dados: (a) utilize uma senha forte e única para sua conta TRADEXA; (b) não compartilhe suas credenciais com terceiros; (c) mantenha seu dispositivo e software atualizados; (d) desconecte-se da Plataforma ao usar dispositivos compartilhados; (e) comunique imediatamente à TRADEXA qualquer acesso não autorizado ou uso suspeito de sua conta.</p>
            </div>

            {/* 8. RETENÇÃO */}
            <div>
              <h2 className="text-xl font-extrabold text-[#0F111A] mb-4">8. Retenção e Exclusão de Dados</h2>
              <p className="mb-3">A TRADEXA mantém os dados pessoais apenas pelo período estritamente necessário para cumprir as finalidades para as quais foram coletados, observados os princípios da necessidade, adequação e finalidade previstos na LGPD, e respeitando os prazos legais de retenção.</p>
              <p className="mb-3"><strong>Dados da Conta Ativa:</strong> Enquanto sua conta permanecer ativa na Plataforma, seus dados pessoais de cadastro, perfil e histórico de uso são mantidos para viabilizar a prestação dos serviços.</p>
              <p className="mb-3"><strong>Após Cancelamento:</strong> Após o cancelamento ou encerramento da conta: (a) dados de cadastro e perfil são mantidos por 90 (noventa) dias, período durante o qual você pode solicitar a reativação ou exportação de seus dados; (b) dados de uso e navegação (logs de IP, registros de acesso) são mantidos por 6 (seis) meses, conforme exigido pelo Marco Civil da Internet (Art. 15 da Lei 12.965/2014); (c) registros contábeis, fiscais e de pagamento são mantidos por 5 (cinco) anos, conforme exigido pelo Código Tributário Nacional e legislação fiscal; (d) dados agregados, anonimizados e estatísticos já incorporados às bases de inteligência da TRADEXA são mantidos indefinidamente.</p>
              <p className="mb-3"><strong>Dados de Candidatura (Trabalhe Conosco):</strong> Currículos e dados de candidatura são mantidos por 12 (doze) meses após o recebimento para fins de processos seletivos futuros, salvo manifestação contrária do titular.</p>
              <p className="mb-3"><strong>Newsletter e Marketing:</strong> Dados para envio de comunicações de marketing são mantidos enquanto houver consentimento ativo. A cada comunicação é oferecido link para descadastramento imediato.</p>
              <p>Findos os prazos aplicáveis, os dados pessoais serão definitivamente excluídos de nossos bancos de dados principais, backups e sistemas, utilizando métodos seguros de exclusão (sobregravação, deleção lógica e física), ressalvadas as hipóteses legais de conservação.</p>
            </div>

            {/* 9. DIREITOS DO TITULAR */}
            <div>
              <h2 className="text-xl font-extrabold text-[#0F111A] mb-4">9. Seus Direitos como Titular de Dados (LGPD)</h2>
              <p className="mb-3">A LGPD (Lei 13.709/2018) confere a você, como titular de dados pessoais, os seguintes direitos, que poderão ser exercidos mediante solicitação através dos canais indicados na Seção 11:</p>

              <ol type="I" className="list-decimal pl-5 space-y-3 mb-4">
                <li><strong>Confirmação da Existência de Tratamento (Art. 18, I):</strong> Direito de obter confirmação sobre se a TRADEXA realiza tratamento de seus dados pessoais.</li>
                <li><strong>Acesso aos Dados (Art. 18, II):</strong> Direito de acessar seus dados pessoais que estão sob nosso controle, mediante solicitação.</li>
                <li><strong>Correção de Dados (Art. 18, III):</strong> Direito de solicitar a correção de dados pessoais incompletos, inexatos ou desatualizados.</li>
                <li><strong>Anonimização, Bloqueio ou Eliminação (Art. 18, IV):</strong> Direito de solicitar a anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a LGPD.</li>
                <li><strong>Portabilidade (Art. 18, V):</strong> Direito de solicitar a portabilidade de seus dados a outro fornecedor de serviço ou produto, mediante requisição expressa, observados os segredos comercial e industrial.</li>
                <li><strong>Eliminação de Dados Tratados com Consentimento (Art. 18, VI):</strong> Direito de solicitar a eliminação dos dados pessoais tratados com base no consentimento, ressalvadas as hipóteses legais de conservação.</li>
                <li><strong>Informação sobre Compartilhamento (Art. 18, VII):</strong> Direito de obter informação sobre as entidades públicas e privadas com as quais a TRADEXA realizou uso compartilhado de dados.</li>
                <li><strong>Informação sobre Possibilidade de Não Consentir (Art. 18, VIII):</strong> Direito de ser informado sobre a possibilidade de não fornecer consentimento e sobre as consequências da negativa.</li>
                <li><strong>Revogação do Consentimento (Art. 18, IX):</strong> Direito de revogar o consentimento a qualquer momento, mediante manifestação expressa, ratificados os tratamentos realizados sob amparo do consentimento anteriormente manifestado enquanto não houver pedido de eliminação.</li>
                <li><strong>Oposição (Art. 18, § 2º):</strong> Direito de se opor a tratamento realizado com fundamento em base legal diversa do consentimento, em caso de descumprimento da LGPD.</li>
                <li><strong>Revisão de Decisões Automatizadas (Art. 20):</strong> Direito de solicitar a revisão de decisões tomadas unicamente com base em tratamento automatizado de dados pessoais que afetem seus interesses, incluídas as decisões destinadas a definir perfis pessoais, profissionais, de consumo e de crédito.</li>
                <li><strong>Peticionar à ANPD (Art. 18, § 1º):</strong> Direito de peticionar em relação aos seus dados contra o controlador perante a Autoridade Nacional de Proteção de Dados.</li>
              </ol>

              <p className="mb-3"><strong>Prazo de Atendimento:</strong> A TRADEXA se compromete a responder às solicitações de titulares no prazo de até 15 (quinze) dias corridos, contados do recebimento da solicitação, podendo este prazo ser prorrogado em casos justificados, conforme previsto na LGPD. Solicitações complexas ou que demandem verificação adicional podem requerer prazo maior, sempre comunicado ao titular.</p>
              <p className="mb-3"><strong>Gratuidade:</strong> O exercício dos direitos do titular é gratuito. A TRADEXA poderá cobrar custos administrativos razoáveis apenas nos casos previstos no art. 18, § 2º da LGPD (pedidos manifestamente infundados ou excessivos), mediante justificativa prévia ao titular.</p>
              <p><strong>Verificação de Identidade:</strong> Para sua segurança, antes de atender a solicitações envolvendo dados pessoais, poderemos solicitar informações adicionais para confirmar sua identidade e prevenir fraudes. Recusaremos solicitações quando não for possível verificar a identidade do solicitante ou quando o atendimento puder violar direitos de terceiros.</p>
            </div>

            {/* 10. DISPOSIÇÕES GERAIS */}
            <div>
              <h2 className="text-xl font-extrabold text-[#0F111A] mb-4">10. Disposições Gerais</h2>
              <p className="mb-3"><strong>10.1. Alterações desta Política.</strong> A TRADEXA reserva-se o direito de atualizar esta Política de Privacidade periodicamente para refletir mudanças nos serviços, na legislação, nas práticas de mercado ou na estrutura de tratamento de dados. Alterações significativas serão comunicadas por e-mail com pelo menos 15 (quinze) dias de antecedência e publicadas de forma destacada na Plataforma.</p>
              <p className="mb-3"><strong>10.2. Consentimento para Alterações.</strong> Caso uma alteração nesta Política implique em nova finalidade de tratamento não contemplada originalmente ou em base legal diversa do consentimento, a TRADEXA solicitará novo consentimento específico dos titulares afetados antes da implementação da mudança.</p>
              <p className="mb-3"><strong>10.3. Menores de Idade.</strong> A Plataforma TRADEXA não é direcionada a menores de 18 (dezoito) anos. Não coletamos intencionalmente dados pessoais de crianças e adolescentes. Caso tomemos conhecimento de que coletamos inadvertidamente dados de menores sem consentimento parental, tomaremos medidas para excluir essas informações o mais rapidamente possível.</p>
              <p className="mb-3"><strong>10.4. Integração com os Termos de Uso.</strong> Esta Política de Privacidade integra os Termos de Uso da TRADEXA, formando com estes um único instrumento contratual. A violação de qualquer disposição desta Política constitui violação dos Termos de Uso, sujeitando o infrator às sanções neles previstas.</p>
              <p className="mb-3"><strong>10.5. Lei Aplicável e Foro.</strong> Esta Política de Privacidade é regida pelas leis da República Federativa do Brasil. Fica eleito o foro da Comarca de Florianópolis, Estado de Santa Catarina, para dirimir quaisquer controvérsias decorrentes desta política, com renúncia expressa a qualquer outro foro, por mais privilegiado que seja.</p>
              <p><strong>10.6. Idioma.</strong> Esta Política foi redigida em língua portuguesa. Em caso de divergência entre esta versão e eventuais traduções, prevalecerá a versão em português.</p>
            </div>

            {/* 11. CONTATO E DPO */}
            <div>
              <h2 className="text-xl font-extrabold text-[#0F111A] mb-4">11. Contato, Encarregado de Dados (DPO) e ANPD</h2>
              <p className="mb-3">Para exercer seus direitos como titular de dados pessoais, esclarecer dúvidas sobre esta Política de Privacidade, relatar incidentes de segurança ou apresentar reclamações sobre o tratamento de seus dados, utilize os canais abaixo:</p>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 mb-6">
                <p><strong>TRADEXA</strong></p>
                <p>Endereço: Florianópolis, Santa Catarina, Brasil</p>
                <p className="mt-3"><strong>Encarregado de Proteção de Dados Pessoais (DPO):</strong></p>
                <p>E-mail: help@tradexa.com.br</p>
                <p>Assunto: "Encarregado de Dados — [Assunto]"</p>
              </div>

              <p className="mb-3">O Encarregado de Proteção de Dados (Data Protection Officer — DPO) é o canal designado pela TRADEXA para atuar como ponto de contato entre o Controlador, os titulares de dados e a Autoridade Nacional de Proteção de Dados (ANPD). Suas atribuições incluem: (a) aceitar reclamações e comunicações dos titulares; (b) prestar esclarecimentos e adotar providências; (c) receber comunicações da ANPD e adotar providências; (d) orientar os funcionários e contratados da TRADEXA sobre práticas de proteção de dados; (e) executar as demais atribuições determinadas pelo Controlador ou estabelecidas em normas complementares.</p>
              <p className="mb-3"><strong>Autoridade Nacional de Proteção de Dados (ANPD):</strong></p>
              <p>Caso você entenda que seus direitos como titular de dados não foram adequadamente atendidos pela TRADEXA, você poderá apresentar reclamação diretamente à ANPD através do site oficial www.gov.br/anpd.</p>
            </div>

          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
