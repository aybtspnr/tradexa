import { lazy, Suspense, ReactNode, useEffect } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { UsageProvider } from "@/hooks/use-usage";
import { Toaster } from "@/components/ui/sonner";
import { HelmetProvider } from "react-helmet-async";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProtectedFeature } from "@/components/ProtectedFeature";
import { AppLayout } from "@/components/AppLayoutWrapper";
import { useUsage } from "@/hooks/use-usage";
import { AnimatedPage } from "@/components/AnimatedPage";
// ═══ PÁGINAS CARREGADAS SOB DEMANDA (lazy) ═══
const Login = lazy(() => import("./Login"));
const Register = lazy(() => import("./Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const HomePage = lazy(() => import("./pages/HomePage"));
const AiSearch = lazy(() => import("./pages/AiSearch"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ScrollToTop } from "@/components/ScrollToTop";

const ServicesIndex = lazy(() => import("./pages/services/ServicesIndexPage"));
const ServiceImport = lazy(() => import("./pages/services/ImportIntelligencePage"));
const ServiceExport = lazy(() => import("./pages/services/ExportIntelligencePage"));
const ServiceTools = lazy(() => import("./pages/services/ToolsPage"));
const ServiceMarket = lazy(() => import("./pages/services/MarketAnalysisPage"));
const ServiceAlerts = lazy(() => import("./pages/services/AlertsPage"));
const ServiceMaps = lazy(() => import("./pages/services/MapsPage"));
const ServiceApi = lazy(() => import("./pages/services/ApiDocsPage"));

// Novas páginas de serviços comerciais
const PesquisaMercadoExportacaoPage = lazy(() => import("./pages/servicos/PesquisaMercadoExportacaoPage"));
const PesquisaCompradoresPage = lazy(() => import("./pages/servicos/PesquisaCompradoresPage"));
const CotacaoFretePage = lazy(() => import("./pages/servicos/CotacaoFretePage"));
const DespachoAduaneiroPage = lazy(() => import("./pages/servicos/DespachoAduaneiroPage"));
const FulfillmentPage = lazy(() => import("./pages/servicos/FulfillmentPage"));
const RepresentacaoBrasilPage = lazy(() => import("./pages/servicos/RepresentacaoBrasilPage"));
const FeirasEventosPage = lazy(() => import("./pages/FeirasEventosPage"));
const GeradorDocumentosPage = lazy(() => import("./pages/GeradorDocumentosPage"));
const CalculadoraAccAcePage = lazy(() => import("./pages/CalculadoraAccAcePage"));
const ConformidadeRegulatoriaPage = lazy(() => import("./pages/ConformidadeRegulatoriaPage"));
const PrecificacaoExportacaoPage = lazy(() => import("./pages/PrecificacaoExportacaoPage"));
const ServicosIndexPage = lazy(() => import("./pages/ServicosIndexPage"));
const AuditoriaClassificacaoFiscalPage = lazy(() => import("./pages/servicos/AuditoriaClassificacaoFiscalPage"));
const AgenciamentoCargaPage = lazy(() => import("./pages/servicos/AgenciamentoCargaPage"));

// Páginas de solução (bundles)
const ImportadoresSolucaoPage = lazy(() => import("./pages/solucoes/ImportadoresSolucaoPage"));
const ExportadoresSolucaoPage = lazy(() => import("./pages/solucoes/ExportadoresSolucaoPage"));
const OperadoresLogisticosSolucaoPage = lazy(() => import("./pages/solucoes/OperadoresLogisticosSolucaoPage"));

// Novas ferramentas gratuitas
const CalendarioAduaneiroPage = lazy(() => import("./pages/CalendarioAduaneiroPage"));
const CalculadoraDrawbackPage = lazy(() => import("./pages/CalculadoraDrawbackPage"));
const CalculadoraCarbonoPage = lazy(() => import("./pages/CalculadoraCarbonoPage"));
const ComparadorPortosPage = lazy(() => import("./pages/ComparadorPortosPage"));
const SimuladorAcordosComerciaisPage = lazy(() => import("./pages/SimuladorAcordosComerciaisPage"));
const RastreamentoPage = lazy(() => import("./pages/RastreamentoPage"));
const CalculadoraIncotermsPage = lazy(() => import("./pages/CalculadoraIncotermsPage"));
const FerramentasIndexPage = lazy(() => import("./pages/FerramentasIndexPage"));
const NoticiasComexPage = lazy(() => import("./pages/NoticiasComexPage"));

const ContatoPage = lazy(() => import("./pages/ContatoPage"));
const PrivacidadePage = lazy(() => import("./pages/PrivacidadePage"));
const SobrePage = lazy(() => import("./pages/SobrePage"));
const TermosPage = lazy(() => import("./pages/TermosPage"));
const LandingAbout = lazy(() => import("./pages/LandingAbout"));
const LandingApiDocs = lazy(() => import("./pages/LandingApiDocs"));
const LandingComingSoon = lazy(() => import("./pages/LandingComingSoon"));
const LandingIndex = lazy(() => import("./pages/LandingIndex"));
const LandingPrivacy = lazy(() => import("./pages/LandingPrivacy"));
const LandingTerms = lazy(() => import("./pages/LandingTerms"));
const TrabalheConoscoPage = lazy(() => import("./pages/TrabalheConoscoPage"));

// Landing pages dos módulos
const LandingImportDashboard = lazy(() => import("./pages/landing/ImportDashboardLanding"));
const LandingImportSearch = lazy(() => import("./pages/landing/ImportSearchLanding"));
const LandingImportMap = lazy(() => import("./pages/landing/ImportMapLanding"));
const LandingExportDashboard = lazy(() => import("./pages/landing/ExportDashboardLanding"));
const LandingExportOpportunities = lazy(() => import("./pages/landing/ExportOpportunitiesLanding"));
const LandingGlobalExplorer = lazy(() => import("./pages/landing/GlobalExplorerLanding"));
const LandingMarketIntelligence = lazy(() => import("./pages/landing/MarketIntelligenceLanding"));
const LandingPriceArbitrage = lazy(() => import("./pages/landing/PriceArbitrageLanding"));
const LandingNcmClassifier = lazy(() => import("./pages/landing/NcmClassifierLanding"));
const LandingTariffCalculator = lazy(() => import("./pages/landing/TariffCalculatorLanding"));
const LandingSmartAlerts = lazy(() => import("./pages/landing/SmartAlertsLanding"));
const LandingExportWizard = lazy(() => import("./pages/landing/ExportWizardLanding"));
const LandingImportadores = lazy(() => import("./pages/landing/ImportadoresLanding"));
const LandingMaritimeFreight = lazy(() => import("./pages/landing/MaritimeFreightLanding"));
const LandingMaritimeFreightMap = lazy(() => import("./pages/landing/MaritimeFreightMapLanding"));
const LandingTrackTrace = lazy(() => import("./pages/landing/TrackTraceLanding"));
const LandingRastreamento = lazy(() => import("./pages/landing/RastreamentoLanding"));
const ClientWelcome = lazy(() => import("./pages/ClientWelcome"));
const LandingSupplyChain = lazy(() => import("./pages/landing/SupplyChainLanding"));
const LandingCalculadoraImportacao = lazy(() => import("./pages/landing/CalculadoraImportacaoLanding"));
const LandingListaNcm = lazy(() => import("./pages/landing/ListaNcmLanding"));
const LandingCalculadoraIncoterms = lazy(() => import("./pages/landing/CalculadoraIncotermsLanding"));
const LandingComparadorPortos = lazy(() => import("./pages/landing/ComparadorPortosLanding"));
const LandingGeradorDocumentos = lazy(() => import("./pages/landing/GeradorDocumentosLanding"));
const LandingCalculadoraAccAce = lazy(() => import("./pages/landing/CalculadoraAccAceLanding"));
const LandingConformidadeRegulatoria = lazy(() => import("./pages/landing/ConformidadeRegulatoriaLanding"));
const LandingPrecificacaoExportacao = lazy(() => import("./pages/landing/PrecificacaoExportacaoLanding"));
const LandingCalculadoraDrawback = lazy(() => import("./pages/landing/CalculadoraDrawbackLanding"));
const LandingCalculadoraCarbono = lazy(() => import("./pages/landing/CalculadoraCarbonoLanding"));
const LandingSimuladorAcordosComerciais = lazy(() => import("./pages/landing/SimuladorAcordosComerciaisLanding"));
const LandingNoticiasComex = lazy(() => import("./pages/landing/NoticiasComexLanding"));
const IntelligenceDashboard = lazy(() => import("./pages/IntelligenceDashboard"));

const LandingVendas = lazy(() => import("./pages/LandingVendas"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const SupplyChainPage = lazy(() => import("./pages/SupplyChainPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CountryComparison = lazy(() => import("./pages/CountryComparison"));
const ExportSimulator = lazy(() => import("./pages/ExportSimulator"));
const SmartRank = lazy(() => import("./pages/SmartRank"));
const TariffAlerts = lazy(() => import("./pages/TariffAlerts"));
const ImportersMap = lazy(() => import("./pages/ImportersMap"));
const SeasonalCalendar = lazy(() => import("./pages/SeasonalCalendar"));
const Settings = lazy(() => import("./pages/Settings"));
const HtsLookup = lazy(() => import("./pages/HtsLookup"));
const UsTradeOverview = lazy(() => import("./pages/UsTradeOverview"));
const UsTradeIntelligence = lazy(() => import("./pages/UsTradeIntelligence"));
const AdminNcmManagement = lazy(() => import("./pages/AdminNcmManagement"));
const AdminHsManagement = lazy(() => import("./pages/AdminHsManagement"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminPanelDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUserManagement = lazy(() => import("./pages/admin/UserManagement"));
const AdminServiceUsage = lazy(() => import("./pages/admin/ServiceUsage"));
const AdminActivityLogs = lazy(() => import("./pages/admin/ActivityLogs"));
const NcmComparison = lazy(() => import("./pages/NcmComparison"));
const TradeIntelligence = lazy(() => import("./pages/TradeIntelligence"));
const TradeCountries = lazy(() => import("./pages/trade-intelligence/TradeCountries"));
const MaritimeFreight = lazy(() => import("./pages/MaritimeFreight"));
const MaritimeFreightMap = lazy(() => import("./pages/MaritimeFreightMapPage"));
const GlobalTariffLookup = lazy(() => import("./pages/GlobalTariffLookup"));
const PortIntelligence = lazy(() => import("./pages/PortIntelligence"));
const PotentialImporters = lazy(() => import("./pages/PotentialImporters"));
const ImportadoresHs = lazy(() => import("./pages/ImportadoresHs"));
const ImportadoresLanding = lazy(() => import("./pages/ImportadoresLanding"));
const Plans = lazy(() => import("./pages/Plans"));
const MyUsage = lazy(() => import("./pages/MyUsage"));
const TeamPage = lazy(() => import("./pages/TeamPage"));
const InvoicesPage = lazy(() => import("./pages/InvoicesPage"));

// Novas páginas: Glossário, Pillars, Reports, Checklists, Tutorials, Seasonal
const GlossarioPage = lazy(() => import("./pages/GlossarioPage"));
const RecursosPage = lazy(() => import("./pages/RecursosPage"));
const GuiaCompletoImportacaoPage = lazy(() => import("./pages/pillars/GuiaCompletoImportacaoPage"));
const GuiaCompletoExportacaoPage = lazy(() => import("./pages/pillars/GuiaCompletoExportacaoPage"));
const GuiaNcmCompletoPage = lazy(() => import("./pages/pillars/GuiaNcmCompletoPage"));
const GuiaDuimpPage = lazy(() => import("./pages/pillars/GuiaDuimpPage"));
const LogisticaInternacionalPage = lazy(() => import("./pages/pillars/LogisticaInternacionalPage"));
const RelatorioEstadosExportacaoPage = lazy(() => import("./pages/reports/RelatorioEstadosExportacaoPage"));
const RelatorioTopImportacoesPage = lazy(() => import("./pages/reports/RelatorioTopImportacoesPage"));
const RelatorioEvolucaoWciPage = lazy(() => import("./pages/reports/RelatorioEvolucaoWciPage"));
const ChecklistImportacaoChinaPage = lazy(() => import("./pages/checklists/ChecklistImportacaoChinaPage"));
const ChecklistEmpresaComexPage = lazy(() => import("./pages/checklists/ChecklistEmpresaComexPage"));
const ChecklistCertificacoesPage = lazy(() => import("./pages/checklists/ChecklistCertificacoesPage"));
const TemplateCifPage = lazy(() => import("./pages/checklists/TemplateCifPage"));
const ChecklistErrosImportacaoPage = lazy(() => import("./pages/checklists/ChecklistErrosImportacaoPage"));
const TutorialIndexPage = lazy(() => import("./pages/TutorialIndexPage"));
const TutorialNcmClassifierPage = lazy(() => import("./pages/tutorials/TutorialNcmClassifierPage"));
const TutorialWciMonitorPage = lazy(() => import("./pages/tutorials/TutorialWciMonitorPage"));
const TutorialTradeIntelligencePage = lazy(() => import("./pages/tutorials/TutorialTradeIntelligencePage"));
const TutorialImportadoresPage = lazy(() => import("./pages/tutorials/TutorialImportadoresPage"));
const TutorialCalculadoraPage = lazy(() => import("./pages/tutorials/TutorialCalculadoraPage"));
const TarifasTrumpImpactoPage = lazy(() => import("./pages/blog/TarifasTrumpImpactoPage"));
const OQueMudouComex2026Page = lazy(() => import("./pages/blog/OQueMudouComex2026Page"));
const PrevisaoComexQ3Page = lazy(() => import("./pages/blog/PrevisaoComexQ3Page"));
const TrackTracePage = lazy(() => import("./pages/TrackTracePage"));
const HyosungPage = lazy(() => import("./pages/HyosungPage"));
const InteligenciaCnaePage = lazy(() => import("./pages/MercadoInteligenciaPage"));

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: "easeInOut" },
};

function AnimatedPage({ children }: { children: ReactNode }) {
  return (
    <motion.div {...pageTransition}>
      {children}
    </motion.div>
  );
}

/* ══════════════════════════════
   WRAPPER: fullscreen sem dashboard (auth + animação apenas)
   ══════════════════════════════ */
function FullScreenPage({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <PageViewTracker />
      <AnimatedPage>{children}</AnimatedPage>
    </ProtectedRoute>
  );
}

/* ══════════════════════════════
   WRAPPER: página protegida com layout
   ══════════════════════════════ */
function PageViewTracker() {
  const { consume } = useUsage();
  useEffect(() => {
    consume("page_view");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

function ProtectedPage({ children, requireAdmin = false, requireEmailConfirmed = false, featureKey }: { children: ReactNode; requireAdmin?: boolean; requireEmailConfirmed?: boolean; featureKey?: string }) {
  const inner = (
    <>
      <PageViewTracker />
      {featureKey ? (
        <ProtectedFeature featureKey={featureKey}>
          <AppLayout>
            <AnimatedPage>{children}</AnimatedPage>
          </AppLayout>
        </ProtectedFeature>
      ) : (
        <AppLayout>
          <AnimatedPage>{children}</AnimatedPage>
        </AppLayout>
      )}
    </>
  );
  
  return (
    <ProtectedRoute requireAdmin={requireAdmin} requireEmailConfirmed={requireEmailConfirmed}>
      {inner}
    </ProtectedRoute>
  );
}

// Wrapper para mapa de frete: usa AppLayout se logado (preserva sidebar + auth),
// SiteLayout se não logado (página pública)
function MaritimeFreightMapWrapper() {
  const { profile, loading } = useAuth();
  if (loading) return null;
  if (profile) {
    return (
      <ProtectedPage>
        <MaritimeFreightMap />
      </ProtectedPage>
    );
  }
  return (
    <AnimatedPage>
      <MaritimeFreightMap />
    </AnimatedPage>
  );
}

function App() {
  // Carrega analytics depois do primeiro paint
  useEffect(() => {
    const s = document.createElement('script');
    s.src = '/analytics-loader.js';
    s.async = true;
    document.head.appendChild(s);
  }, []);

  return (
    <HelmetProvider>
      <AuthProvider>
        <UsageProvider>
          <Router>
          <ScrollToTop />
          <Suspense fallback={
            <div className="flex h-screen w-screen items-center justify-center bg-white">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D80E16] border-t-transparent" />
                <p className="text-sm font-medium text-slate-500">Carregando...</p>
              </div>
            </div>
          }>
            <ErrorBoundary>
              <AnimatedRoutes />
            </ErrorBoundary>
          </Suspense>
          <Toaster />
        </Router>
        </UsageProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  useEffect(() => {
    const trackView = () => {
      // Mixpanel
      // @ts-ignore — mixpanel loaded via analytics-loader.js
      if (window.mixpanel?.track_pageview) {
        // @ts-ignore
        window.mixpanel.track_pageview({ url: location.pathname + location.search });
      }

      // Telegram tracking beacon (fire-and-forget, não bloqueia)
      try {
        const page = location.pathname + location.search;
        const referrer = document.referrer || '';
        const payload = new Blob([JSON.stringify({ page, referrer })], { type: 'application/json' });
        navigator.sendBeacon('/api/track-page', payload);
      } catch {}
    };
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(trackView, { timeout: 500 });
    } else {
      setTimeout(trackView, 500);
    }
  }, [location]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ══════════════════════════════
            ROTAS PÚBLICAS (sem layout, sem auth)
            ══════════════════════════════ */}
        <Route path="/" element={<AnimatedPage><HomePage /></AnimatedPage>} />
        <Route path="/pricing" element={<AnimatedPage><LandingVendas /></AnimatedPage>} />
        <Route path="/precos" element={<AnimatedPage><LandingVendas /></AnimatedPage>} />
        <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
        <Route path="/register" element={<AnimatedPage><Register /></AnimatedPage>} />
        <Route path="/forgot-password" element={<AnimatedPage><ForgotPassword /></AnimatedPage>} />
        <Route path="/reset-password" element={<AnimatedPage><ResetPassword /></AnimatedPage>} />

        {/* ══════════════════════════════
            ROTAS PÚBLICAS ADICIONAIS (sem auth)
            ══════════════════════════════ */}
        <Route path="/about" element={<AnimatedPage><SobrePage /></AnimatedPage>} />
        <Route path="/sobre" element={<AnimatedPage><SobrePage /></AnimatedPage>} />
        <Route path="/contact" element={<AnimatedPage><ContatoPage /></AnimatedPage>} />
        <Route path="/contato" element={<AnimatedPage><ContatoPage /></AnimatedPage>} />
        <Route path="/privacy" element={<AnimatedPage><PrivacidadePage /></AnimatedPage>} />
        <Route path="/privacidade" element={<AnimatedPage><PrivacidadePage /></AnimatedPage>} />
        <Route path="/terms" element={<AnimatedPage><TermosPage /></AnimatedPage>} />
        <Route path="/termos" element={<AnimatedPage><TermosPage /></AnimatedPage>} />
        <Route path="/landing-about" element={<AnimatedPage><LandingAbout /></AnimatedPage>} />
        <Route path="/landing-api" element={<AnimatedPage><LandingApiDocs /></AnimatedPage>} />
        <Route path="/coming-soon" element={<AnimatedPage><LandingComingSoon /></AnimatedPage>} />
        <Route path="/landing-index" element={<AnimatedPage><LandingIndex /></AnimatedPage>} />
        <Route path="/landing-privacy" element={<AnimatedPage><LandingPrivacy /></AnimatedPage>} />
        <Route path="/landing-terms" element={<AnimatedPage><LandingTerms /></AnimatedPage>} />
        <Route path="/trabalhe-conosco" element={<AnimatedPage><TrabalheConoscoPage /></AnimatedPage>} />

        {/* ══════════════════════════════
            LANDING PAGES DOS MÓDULOS
            ══════════════════════════════ */}
        <Route path="/landing/import-dashboard" element={<AnimatedPage><LandingImportDashboard /></AnimatedPage>} />
        <Route path="/landing/import-search" element={<AnimatedPage><LandingImportSearch /></AnimatedPage>} />
        <Route path="/landing/import-map" element={<AnimatedPage><LandingImportMap /></AnimatedPage>} />
        <Route path="/landing/export-dashboard" element={<AnimatedPage><LandingExportDashboard /></AnimatedPage>} />
        <Route path="/landing/export-opportunities" element={<AnimatedPage><LandingExportOpportunities /></AnimatedPage>} />
        <Route path="/landing/global-explorer" element={<AnimatedPage><LandingGlobalExplorer /></AnimatedPage>} />
        <Route path="/landing/market-intelligence" element={<AnimatedPage><LandingMarketIntelligence /></AnimatedPage>} />
        <Route path="/landing/price-arbitrage" element={<AnimatedPage><LandingPriceArbitrage /></AnimatedPage>} />
        <Route path="/landing/ncm-classifier" element={<AnimatedPage><LandingNcmClassifier /></AnimatedPage>} />
        <Route path="/landing/tariff-calculator" element={<AnimatedPage><LandingTariffCalculator /></AnimatedPage>} />
        <Route path="/landing/smart-alerts" element={<AnimatedPage><LandingSmartAlerts /></AnimatedPage>} />
        <Route path="/landing/export-wizard" element={<AnimatedPage><LandingExportWizard /></AnimatedPage>} />
        <Route path="/landing/importadores" element={<AnimatedPage><LandingImportadores /></AnimatedPage>} />
        <Route path="/landing/maritime-freight" element={<AnimatedPage><LandingMaritimeFreight /></AnimatedPage>} />
        <Route path="/landing/maritime-freight-map" element={<AnimatedPage><LandingMaritimeFreightMap /></AnimatedPage>} />
        <Route path="/landing/track-trace" element={<AnimatedPage><LandingTrackTrace /></AnimatedPage>} />
        <Route path="/landing/rastreamento" element={<AnimatedPage><LandingRastreamento /></AnimatedPage>} />
        <Route path="/landing/supply-chain" element={<AnimatedPage><LandingSupplyChain /></AnimatedPage>} />
        <Route path="/landing/calculadora-importacao" element={<AnimatedPage><LandingCalculadoraImportacao /></AnimatedPage>} />
        <Route path="/landing/lista-ncm" element={<AnimatedPage><LandingListaNcm /></AnimatedPage>} />
        <Route path="/landing/calculadora-incoterms" element={<AnimatedPage><LandingCalculadoraIncoterms /></AnimatedPage>} />
        <Route path="/landing/comparador-portos" element={<AnimatedPage><LandingComparadorPortos /></AnimatedPage>} />
        <Route path="/landing/gerador-documentos" element={<AnimatedPage><LandingGeradorDocumentos /></AnimatedPage>} />
        <Route path="/landing/calculadora-acc-ace" element={<AnimatedPage><LandingCalculadoraAccAce /></AnimatedPage>} />
        <Route path="/landing/conformidade-regulatoria" element={<AnimatedPage><LandingConformidadeRegulatoria /></AnimatedPage>} />
        <Route path="/landing/precificacao-exportacao" element={<AnimatedPage><LandingPrecificacaoExportacao /></AnimatedPage>} />
        <Route path="/landing/calculadora-drawback" element={<AnimatedPage><LandingCalculadoraDrawback /></AnimatedPage>} />
        <Route path="/landing/calculadora-carbono" element={<AnimatedPage><LandingCalculadoraCarbono /></AnimatedPage>} />
        <Route path="/landing/simulador-acordos-comerciais" element={<AnimatedPage><LandingSimuladorAcordosComerciais /></AnimatedPage>} />
        <Route path="/landing/noticias-comex" element={<AnimatedPage><LandingNoticiasComex /></AnimatedPage>} />
        {/* ══════════════════════════════
            BLOG
            ══════════════════════════════ */}
        <Route path="/blog" element={<AnimatedPage><BlogPage /></AnimatedPage>} />
        <Route path="/blog/:slug" element={<AnimatedPage><BlogPostPage /></AnimatedPage>} />
        <Route path="/blog/impacto-tarifas-trump-exportacoes" element={<AnimatedPage><TarifasTrumpImpactoPage /></AnimatedPage>} />
        <Route path="/blog/o-que-mudou-comex-2026" element={<AnimatedPage><OQueMudouComex2026Page /></AnimatedPage>} />
        <Route path="/blog/previsao-comex-q3-2026" element={<AnimatedPage><PrevisaoComexQ3Page /></AnimatedPage>} />

        {/* ══════════════════════════════
            MAPA DE FRETE MARÍTIMO (público + protegido via wrapper)
            ══════════════════════════════ */}
        <Route path="/maritime-freight-map" element={<MaritimeFreightMapWrapper />} />
        <Route path="/maritime-freight" element={<AnimatedPage><MaritimeFreight /></AnimatedPage>} />

        {/* ══════════════════════════════
            SUPPLY CHAIN VISIBILITY
            ══════════════════════════════ */}
        <Route path="/supply-chain" element={<AnimatedPage><SupplyChainPage /></AnimatedPage>} />
        <Route path="/track-trace" element={<AnimatedPage><TrackTracePage /></AnimatedPage>} />

        {/* ══════════════════════════════
            PÁGINAS DE SERVIÇO PÚBLICAS
            ══════════════════════════════ */}
        <Route path="/services" element={<AnimatedPage><ServicesIndex /></AnimatedPage>} />
        <Route path="/services/import-intelligence" element={<AnimatedPage><ServiceImport /></AnimatedPage>} />
        <Route path="/services/export-intelligence" element={<AnimatedPage><ServiceExport /></AnimatedPage>} />
        <Route path="/services/tools" element={<AnimatedPage><ServiceTools /></AnimatedPage>} />
        <Route path="/services/market-analysis" element={<AnimatedPage><ServiceMarket /></AnimatedPage>} />
        <Route path="/services/alertas" element={<AnimatedPage><ServiceAlerts /></AnimatedPage>} />
        <Route path="/services/maps" element={<AnimatedPage><ServiceMaps /></AnimatedPage>} />
        <Route path="/services/api" element={<AnimatedPage><ServiceApi /></AnimatedPage>} />

        {/* ══════════════════════════════
            SERVIÇOS COMERCIAIS (landing pages com formulário)
            ══════════════════════════════ */}
        <Route path="/servicos/pesquisa-mercado-exportacao" element={<AnimatedPage><PesquisaMercadoExportacaoPage /></AnimatedPage>} />
        <Route path="/servicos/pesquisa-compradores" element={<AnimatedPage><PesquisaCompradoresPage /></AnimatedPage>} />
        <Route path="/servicos/cotacao-frete-internacional" element={<AnimatedPage><CotacaoFretePage /></AnimatedPage>} />
        <Route path="/servicos/despacho-aduaneiro" element={<AnimatedPage><DespachoAduaneiroPage /></AnimatedPage>} />
        <Route path="/servicos/fulfillment" element={<AnimatedPage><FulfillmentPage /></AnimatedPage>} />
        <Route path="/servicos/representacao-brasil" element={<AnimatedPage><RepresentacaoBrasilPage /></AnimatedPage>} />
        <Route path="/servicos/auditoria-classificacao-fiscal" element={<AnimatedPage><AuditoriaClassificacaoFiscalPage /></AnimatedPage>} />
        <Route path="/servicos/agenciamento-carga" element={<AnimatedPage><AgenciamentoCargaPage /></AnimatedPage>} />

        {/* Páginas de Solução */}
        <Route path="/solucoes/importadores" element={<AnimatedPage><ImportadoresSolucaoPage /></AnimatedPage>} />
        <Route path="/solucoes/exportadores" element={<AnimatedPage><ExportadoresSolucaoPage /></AnimatedPage>} />
        <Route path="/solucoes/operadores-logisticos" element={<AnimatedPage><OperadoresLogisticosSolucaoPage /></AnimatedPage>} />

        {/* Ferramentas públicas */}
        <Route path="/ferramentas" element={<AnimatedPage><FerramentasIndexPage /></AnimatedPage>} />
        <Route path="/ferramentas/gerador-documentos" element={<AnimatedPage><GeradorDocumentosPage /></AnimatedPage>} />
        <Route path="/ferramentas/calculadora-acc-ace" element={<AnimatedPage><CalculadoraAccAcePage /></AnimatedPage>} />
        <Route path="/ferramentas/conformidade-regulatoria" element={<AnimatedPage><ConformidadeRegulatoriaPage /></AnimatedPage>} />
        <Route path="/ferramentas/precificacao-exportacao" element={<AnimatedPage><PrecificacaoExportacaoPage /></AnimatedPage>} />
        <Route path="/ferramentas/calculadora-drawback" element={<AnimatedPage><CalculadoraDrawbackPage /></AnimatedPage>} />
        <Route path="/ferramentas/comparador-portos" element={<AnimatedPage><ComparadorPortosPage /></AnimatedPage>} />
        <Route path="/ferramentas/calculadora-incoterms" element={<AnimatedPage><CalculadoraIncotermsPage /></AnimatedPage>} />
        <Route path="/noticias" element={<AnimatedPage><NoticiasComexPage /></AnimatedPage>} />
        <Route path="/ferramentas/simulador-acordos-comerciais" element={<AnimatedPage><SimuladorAcordosComerciaisPage /></AnimatedPage>} />
        <Route path="/ferramentas/calculadora-carbono" element={<AnimatedPage><CalculadoraCarbonoPage /></AnimatedPage>} />
        <Route path="/calendario-aduaneiro" element={<AnimatedPage><CalendarioAduaneiroPage /></AnimatedPage>} />
        <Route path="/feiras-eventos" element={<AnimatedPage><FeirasEventosPage /></AnimatedPage>} />
        <Route path="/rastreamento" element={<AnimatedPage><RastreamentoPage /></AnimatedPage>} />
        <Route path="/servicos" element={<AnimatedPage><ServicosIndexPage /></AnimatedPage>} />

        {/* ══════════════════════════════
            ROTAS PROTEGIDAS (com layout + auth)
            ══════════════════════════════ */}
        <Route path="/country-comparison" element={<ProtectedPage featureKey="country_comparison"><CountryComparison /></ProtectedPage>} />
        <Route path="/export-simulator" element={<ProtectedPage featureKey="export_simulator"><ExportSimulator /></ProtectedPage>} />
        <Route path="/smart-rank" element={<ProtectedPage featureKey="smart_rank"><SmartRank /></ProtectedPage>} />
        <Route path="/tariff-alerts" element={<ProtectedPage featureKey="tariff_alerts"><TariffAlerts /></ProtectedPage>} />
        <Route path="/importers-map" element={<ProtectedPage featureKey="importers_map"><ImportersMap /></ProtectedPage>} />
        <Route path="/seasonal-calendar" element={<ProtectedPage featureKey="seasonal_calendar"><SeasonalCalendar /></ProtectedPage>} />
      <Route path="/seasonal-alerts" element={<Navigate to="/seasonal-calendar" replace />} />
        <Route path="/dashboard" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
        <Route path="/intelligence" element={<ProtectedPage featureKey="market_intelligence"><IntelligenceDashboard /></ProtectedPage>} />
        <Route path="/ai-search" element={<ProtectedPage featureKey="ai_search" requireEmailConfirmed><AiSearch /></ProtectedPage>} />
        <Route path="/hs-lookup" element={<Navigate to="/ai-search" replace />} />
        <Route path="/hts-lookup" element={<ProtectedPage featureKey="hts_lookup"><HtsLookup /></ProtectedPage>} />
        <Route path="/us-trade" element={<ProtectedPage featureKey="us_trade"><UsTradeOverview /></ProtectedPage>} />
        <Route path="/us-trade-intelligence" element={<ProtectedPage featureKey="us_trade_intelligence"><UsTradeIntelligence /></ProtectedPage>} />
      <Route path="/price-arbitrage" element={<Navigate to="/importadores" replace />} />
        <Route path="/competitor-intel" element={<Navigate to="/importadores" replace />} />
        <Route path="/plans" element={<ProtectedPage><Plans /></ProtectedPage>} />
        <Route path="/my-usage" element={<ProtectedPage><MyUsage /></ProtectedPage>} />
      <Route path="/client" element={<AnimatedPage><ClientWelcome /></AnimatedPage>} />
      <Route path="/cliente/hyosung" element={<AnimatedPage><HyosungPage /></AnimatedPage>} />
      <Route path="/inteligencia-mercado" element={<FullScreenPage><InteligenciaCnaePage /></FullScreenPage>} />
      <Route path="/import-export-data" element={<ProtectedFeature featureKey="import_export_data"><FullScreenPage><InteligenciaCnaePage /></FullScreenPage></ProtectedFeature>} />
      <Route path="/credits" element={<Navigate to="/plans" replace />} />

      <Route path="/export-intelligence" element={<Navigate to="/trade-intelligence" replace />} />
      <Route path="/export-intelligence/:sub" element={<Navigate to="/trade-intelligence" replace />} />
      <Route path="/import-intelligence" element={<Navigate to="/trade-intelligence" replace />} />
      <Route path="/import-intelligence/:sub" element={<Navigate to="/trade-intelligence" replace />} />

        <Route path="/ncm-comparison" element={<ProtectedPage featureKey="ncm_comparison"><NcmComparison /></ProtectedPage>} />
      <Route path="/cross-data-comparison" element={<Navigate to="/trade-intelligence" replace />} />
      <Route path="/suppliers" element={<Navigate to="/importadores" replace />} />

      {/* Portuguese URL aliases for SEO */}
      <Route path="/tarifario-global" element={<Navigate to="/global-tariff" replace />} />
      <Route path="/comparar-paises" element={<Navigate to="/country-comparison" replace />} />
      <Route path="/simulador-exportacao" element={<Navigate to="/export-simulator" replace />} />
      <Route path="/inteligencia-comercial" element={<Navigate to="/import-export-data" replace />} />
      <Route path="/ranking-mercados" element={<Navigate to="/smart-rank" replace />} />
      <Route path="/cadeia-suprimentos" element={<Navigate to="/supply-chain" replace />} />
      <Route path="/comparar-ncm" element={<Navigate to="/ncm-comparison" replace />} />
      <Route path="/comercio-brasil-eua" element={<Navigate to="/us-trade" replace />} />
      <Route path="/mapa-frete-maritimo" element={<Navigate to="/maritime-freight-map" replace />} />
        <Route path="/trade-intelligence" element={<ProtectedPage featureKey="trade_intelligence" requireEmailConfirmed><TradeIntelligence /></ProtectedPage>} />
        <Route path="/trade-intelligence/countries" element={<ProtectedPage featureKey="trade_intelligence" requireEmailConfirmed><TradeCountries /></ProtectedPage>} />
      <Route path="/trade-balance" element={<Navigate to="/trade-intelligence" replace />} />

        {/* Admin (protegidas + requireAdmin) */}
        <Route path="/admin" element={<ProtectedPage requireAdmin><AdminPanelDashboard /></ProtectedPage>} />
        <Route path="/admin/users" element={<ProtectedPage requireAdmin><AdminUserManagement /></ProtectedPage>} />
        <Route path="/admin/usage" element={<ProtectedPage requireAdmin><AdminServiceUsage /></ProtectedPage>} />
        <Route path="/admin/logs" element={<ProtectedPage requireAdmin><AdminActivityLogs /></ProtectedPage>} />
        <Route path="/admin/ncm" element={<ProtectedPage requireAdmin><AdminNcmManagement /></ProtectedPage>} />
        <Route path="/admin/hs" element={<ProtectedPage requireAdmin><AdminHsManagement /></ProtectedPage>} />
        <Route path="/admin/legacy" element={<ProtectedPage requireAdmin><AdminDashboard /></ProtectedPage>} />

        <Route path="/settings" element={<ProtectedPage><Settings /></ProtectedPage>} />
        <Route path="/team" element={<ProtectedPage><TeamPage /></ProtectedPage>} />
        <Route path="/invoices" element={<ProtectedPage><InvoicesPage /></ProtectedPage>} />
        <Route path="/freight-calculator" element={<Navigate to="/maritime-freight-map" replace />} />
        <Route path="/maritime_freight" element={<Navigate to="/maritime-freight-map" replace />} />
        <Route path="/route-optimizer" element={<Navigate to="/maritime-freight-map" replace />} />
        <Route path="/port-intelligence" element={<ProtectedPage featureKey="port_intelligence"><PortIntelligence /></ProtectedPage>} />
        <Route path="/tariff-simulator" element={<Navigate to="/global-tariff" replace />} />
      <Route path="/export-opportunities" element={<Navigate to="/importadores" replace />} />
      <Route path="/trade-news" element={<Navigate to="/importadores" replace />} />
        <Route path="/global-tariff" element={<ProtectedPage featureKey="global_tariff" requireEmailConfirmed><GlobalTariffLookup /></ProtectedPage>} />
      <Route path="/market-intelligence" element={<Navigate to="/trade-intelligence" replace />} />
      <Route path="/export-wizard" element={<Navigate to="/ai-search" replace />} />
        <Route path="/potential-importers" element={<ProtectedPage featureKey="potential_importers"><PotentialImporters /></ProtectedPage>} />
        <Route path="/global-trade" element={<Navigate to="/trade-intelligence" replace />} />
        <Route path="/importadores" element={<ProtectedPage featureKey="importadores" requireEmailConfirmed><ImportadoresLanding /></ProtectedPage>} />
        <Route path="/importadores-hs/:hs" element={<ProtectedPage featureKey="importadores"><ImportadoresHs /></ProtectedPage>} />
      <Route path="/wizard" element={<Navigate to="/ai-search" replace />} />

        {/* ══════════════════════════════
            NOVAS PÁGINAS: Glossário, Pillars, Reports, Checklists, Tutorials, Seasonal
            ══════════════════════════════ */}
        <Route path="/glossario" element={<AnimatedPage><GlossarioPage /></AnimatedPage>} />
        <Route path="/recursos" element={<AnimatedPage><RecursosPage /></AnimatedPage>} />
        <Route path="/guia-importacao" element={<AnimatedPage><GuiaCompletoImportacaoPage /></AnimatedPage>} />
        <Route path="/guia-exportacao" element={<AnimatedPage><GuiaCompletoExportacaoPage /></AnimatedPage>} />
        <Route path="/guia-ncm" element={<AnimatedPage><GuiaNcmCompletoPage /></AnimatedPage>} />
        <Route path="/guia-duimp" element={<AnimatedPage><GuiaDuimpPage /></AnimatedPage>} />
        <Route path="/logistica-internacional" element={<AnimatedPage><LogisticaInternacionalPage /></AnimatedPage>} />
        <Route path="/relatorio/estados-que-mais-exportam" element={<AnimatedPage><RelatorioEstadosExportacaoPage /></AnimatedPage>} />
        <Route path="/relatorio/top-produtos-importados" element={<AnimatedPage><RelatorioTopImportacoesPage /></AnimatedPage>} />
        <Route path="/relatorio/evolucao-wci" element={<AnimatedPage><RelatorioEvolucaoWciPage /></AnimatedPage>} />
        <Route path="/checklist/importar-china" element={<AnimatedPage><ChecklistImportacaoChinaPage /></AnimatedPage>} />
        <Route path="/checklist/empresa-comercio-exterior" element={<AnimatedPage><ChecklistEmpresaComexPage /></AnimatedPage>} />
        <Route path="/checklist/certificacoes-importacao" element={<AnimatedPage><ChecklistCertificacoesPage /></AnimatedPage>} />
        <Route path="/template/planilha-cif" element={<AnimatedPage><TemplateCifPage /></AnimatedPage>} />
        <Route path="/checklist/erros-importacao" element={<AnimatedPage><ChecklistErrosImportacaoPage /></AnimatedPage>} />
        <Route path="/tutorial" element={<AnimatedPage><TutorialIndexPage /></AnimatedPage>} />
        <Route path="/tutorial/classificador-ncm" element={<AnimatedPage><TutorialNcmClassifierPage /></AnimatedPage>} />
        <Route path="/tutorial/monitorar-wci" element={<AnimatedPage><TutorialWciMonitorPage /></AnimatedPage>} />
        <Route path="/tutorial/trade-intelligence" element={<AnimatedPage><TutorialTradeIntelligencePage /></AnimatedPage>} />
        <Route path="/tutorial/importadores" element={<AnimatedPage><TutorialImportadoresPage /></AnimatedPage>} />
        <Route path="/tutorial/calculadora-importacao" element={<AnimatedPage><TutorialCalculadoraPage /></AnimatedPage>} />

        <Route path="*" element={<AnimatedPage><NotFoundPage /></AnimatedPage>} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
