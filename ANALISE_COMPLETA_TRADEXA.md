# ANÁLISE COMPLETA — TRADEXA (21.05.2026)

---

## 1. ESTADO ATUAL DO PROJETO

### 1.1 Estrutura de Páginas

**120 arquivos em `src/pages/`** — excesso massivo. Muitas páginas duplicadas, órfãs ou redirecionadas.

**Rotas ativas (82):** Dashboard, AI Search, Global Tariff, Importadores, Export Simulator, Country Comparison, Seasonal Calendar, HTS Lookup, NCM Comparison, City Search, UsTrade, TradeIntelligence, MaritimeFreight, MunicipalIntelligence, Admin (3 páginas), 12 landing pages, 7 páginas de serviço público, e ~20 redirecionamentos.

**Páginas ÓRFÃS (sem rotas no App.tsx):**
- `FreightCalculator.tsx` — redirecionada para `/maritime-freight` mas arquivo existe (228 linhas)
- `HsLookup.tsx` — redirecionada para `/ai-search` (271 linhas)
- `MarketEntryGuide.tsx` — SEM ROTA (558 linhas, provavelmente morta)
- `NotFound.tsx` — SEM ROTA (60 linhas)
- `Index/components/*` — 8 componentes antigos SEM USO (Footer, Header, HeroSection, etc.)
- `brasil-eua/*` — 4 páginas (VisaoGeral, Categorias, MarketShare, Oportunidades) — NÃO IMPORTADAS no App.tsx
- `trade-intelligence/*` — 7 páginas (TradeDashboard, TradeSearch, TradeMap, TradeRanking, TradeTrends, TradeAlerts, TradeCountries) — TradeCountries tem rota, as outras NÃO
- `landing/ModuleLandingTemplate.tsx` — importado mas é template base
- `services/GenericServicePage.tsx` — SEM ROTA

**CRÍTICO:** `brasil-eua/` tem 4 páginas bem construídas (303+257+272+233 = 1065 linhas) que NÃO estão no App.tsx. São páginas de análise Brasil↔EUA que estão inacessíveis. Ou integrar ou deletar.

---

### 1.2 Design System — Problemas Críticos

#### A. Cores invisíveis em fundo branco
**286 ocorrências** de `text-slate-400` / `text-slate-500` no projeto inteiro. Isso é um problema SERIO de acessibilidade:
- `text-slate-400` = **completamente invisível** em fundo branco
- `text-slate-500` = só serve para labels micro (10px uppercase), NUNCA para texto de corpo

**Arquivos mais afetados:**
- `Register.tsx` — 24 ocorrências
- `TradeIntelligence.tsx` — 28 ocorrências
- `DashboardLayout.tsx` — 10 ocorrências
- `UsTradeOverview.tsx` — 12 ocorrências
- `TradeBalance.tsx` — 14 ocorrências

#### B. `bg-clip-text` / `text-transparent` — PROIBIDO no projeto
**14 ocorrências** — quebra texto em produção (minificação + React concurrent mode). Skill já documenta isso como proibido, mas ainda persiste em:
- `LandingPage.tsx` (hero heading)
- `LandingComingSoon.tsx`
- `PlanosPage.tsx`
- `AiSearch.tsx` (2x — tax rate display)
- `SobrePage.tsx`, `PrivacidadePage.tsx`, `TermosPage.tsx`
- `ContatoPage.tsx`
- Componentes de landing (`HeroSection`, `DemoSection`, `FinalCTA`, `HowItWorks`)

#### C. Efeitos 3D / Premium — Overkill ou mal aplicados
O HomePage tem **75 referências** a motion/framer-motion (whileHover, whileInView, AnimatePresence). Isso é MUITO para uma página. Resultado:
- Performance ruim em mobile
- Acessibilidade comprometida (motion sickness)
- Manutenção difícil

**Componentes premium que existem mas causam problemas:**
- `TextScramble` — documentado como causador de blank screen em produção. Ainda usado no CTA do HomePage
- `CustomCursor` — REMOVIDO do HomePage (causava tremor, shadow artifacts, lag)
- `FloatingCards3D` — REMOVIDO do HomePage (replaced by inline globe)
- `ParticleCanvasThemed` — ainda ativo no Hero (40 particles) e CTA (50 particles)
- `TiltWrapper` — usado em PlatformModulesSection cards, mas skill documenta que mouse-tracking tilt + click handler = tremor
- `MagneticButton` — existe mas não sei onde é usado
- `SpotlightCard` — usado em planos/differentials

#### D. Duplicação massiva de Landing Pages
Existem **3 landing pages paralelas:**
1. `HomePage.tsx` (1072 linhas) — rota `/`
2. `LandingPage.tsx` (574 linhas) — rota `/landing` ??? Verificar
3. `LandingIndex.tsx` (59 linhas) — wrapper que redireciona?

Isso é confusão de navegação. O usuário cai em qual?

#### E. Inconsistência de Layouts
- App.tsx → AppLayout → DashboardLayout (para rotas protegidas)
- Mas `ImportadoresLanding.tsx` e `ImportadoresHs.tsx` JÁ TINHAM `TradexaLayout` interno (causava double sidebar). Foi corrigido mas pode haver outros.
- Verificar: `grep -rn 'TradexaLayout\|DashboardLayout' src/pages/`

---

### 1.3 Textos / Copy — Problemas

#### A. Texto genérico / "Marketing fluff"
Muitas seções usam linguagem de marketing genérica sem dados concretos:
- "Plataforma completa de market intelligence" — completa em relação a quê?
- "Dados cruzados em tempo real" — quais dados? De onde?
- "730K+ empresas globais" — esse número vem de onde? É real?

#### B. Títulos de seção sem contexto
Exemplo do HomePage:
- "A plataforma mais completa para comércio exterior" — superlativo não verificável
- "Tudo o que você precisa em um só lugar" — clichê
- "Diferenciais que fazem a diferença" — tautologia

#### C. FAQ com respostas genéricas
- "Sim. Usamos criptografia SSL/TLS..." — toda plataforma usa SSL em 2026
- "Atendemos importadores, exportadores, e-commerces..." — muito amplo, não diferencia

#### D. Homepage com SEO confuso
Meta keywords incluem "LogComex alternativa" — isso pode ser visto como negative SEO / comparative advertising. Não é ilegal, mas é tático de baixo nível.

---

### 1.4 Dados — Mock vs Real

#### A. Páginas que ainda têm referências a mock/demo (65 ocorrências):
- `ExportWizard.tsx` — 2 referências
- `ExportSimulator.tsx` — 3 referências
- `Dashboard.tsx` — 1 referência (`fallback`)
- `GlobalTariffLookup.tsx` — 4 referências
- `TradeIntelligence.tsx` — 1 referência
- `CitySearch.tsx` — 1 referência
- `CompetitorIntel.tsx` — 1 referência (já redirecionada)
- `PriceArbitrage.tsx` — 1 referência (já redirecionada)
- `UsTradeOverview.tsx` — 1 referência

**Importante:** Muitas dessas são strings de erro como "Nenhum dado disponível" ou placeholders de input, não necessariamente dados fake. Mas precisa verificar cada uma.

#### B. Páginas que provavelmente usam dados reais:
✅ `AiSearch.tsx` — chama edge function `ai-ncm-search` (DeepSeek V3)
✅ `GlobalTariffLookup.tsx` — VPS API WTO tariffs (340K registros)
✅ `ImportadoresLanding.tsx` — VPS `/importadores/index`
✅ `ImportadoresHs.tsx` — VPS `/importadores/chapter/{hs}`
✅ `PotentialImporters.tsx` — VPS API + AI
✅ `MaritimeFreight.tsx` — Supabase `freight_quotes`
✅ `SeasonalCalendar.tsx` — COMEXSTAT API
✅ `CountryComparison.tsx` — VPS tariffs + Supabase VAT
✅ `Dashboard.tsx` — VPS importers + tariffs + BCB exchange rate

#### C. Páginas com dados QUESTIONÁVEIS:
⚠️ `TradeIntelligence.tsx` — chama edge functions `export-data`/`import-data` (COMEXSTAT). Mas tem interface com `brRankGlobal`, `brShareGlobal` — esses vêm de onde?
⚠️ `MarketIntelligence.tsx` — usa `marketIntelligence.ts` que tem múltiplas fontes + JSON fallbacks
⚠️ `UsTradeOverview.tsx` — Census API? A skill diz que `generateDemoData` foi deletado, mas a página ainda existe
⚠️ `MunicipalIntelligence.tsx` — `municipalService` — precisa verificar se é real

#### D. Páginas REMOVIDAS (redirecionadas) que ainda existem no código:
- `PriceArbitrage.tsx` → `/importadores`
- `CompetitorIntel.tsx` → `/importadores`
- `MirrorTrade.tsx` → `/importadores`
- `RouteOptimizer.tsx` → `/maritime-freight`
- `SeasonalAlerts.tsx` → `/seasonal-calendar`
- `FreightCalculator.tsx` → `/maritime-freight`
- `TariffSimulator.tsx` → `/global-tariff`
- `ExportOpportunities.tsx` → `/importadores`
- `TradeNews.tsx` → `/importadores`
- `CrossDataComparison.tsx` → `/trade-intelligence`
- `MarketIntelligence.tsx` → `/trade-intelligence`
- `TradeBalance.tsx` → `/trade-intelligence`
- `ExportWizard.tsx` → `/ai-search`
- `WizardPage.tsx` → `/ai-search`
- `Credits.tsx` → `/plans`

**São 15 páginas mortas que ocupam espaço.** Podem ser deletadas com segurança (fazer backup primeiro).

---

### 1.5 Performance & Técnico

#### A. HomePage.tsx — 1072 linhas, 55KB
- 6 `useState`, 4 `useEffect`, 75 motion references
- Partículas no canvas (70 no LandingPage, 40 no HomePage)
- 3D tilt em 12 cards
- Isso tudo RODA no primeiro paint. Mobile vai engasgar.

#### B. Bundle size provavelmente grande
- Framer Motion = ~30KB gzipped
- Recharts = ~60KB gzipped
- Supabase client = ~30KB gzipped
- Lucide icons (tree-shakeable, mas muitos imports)
- Total estimado: 200-300KB JS para uma SPA de trade intelligence

#### C. Fetch direto para VPS HTTP
`Dashboard.tsx` linha 72: `fetch("http://129.121.98.20:5051/api/importadores/index")`
- Isso é HTTP, não HTTPS. Em produção (Vercel HTTPS) vai dar Mixed Content.
- A skill diz que foi resolvido com Vercel Rewrite `/api/vps/*` → mas o código ainda usa o IP direto em alguns lugares?
- Verificar se TODAS as chamadas VPS usam `/api/vps/`

#### D. Build passa mas pode ter runtime errors
A skill documenta que `<Logo />` não importado causa blank screen. Precisa verificar:
- `HomePage.tsx` importa `Logo3D` mas JSX usa `<Logo3D />` ✓
- `LandingPage.tsx` importa `Logo` ✓
- Mobile menu no HomePage usa `<Logo />`? Precisa verificar

---

## 2. ANÁLISE COMPETITIVA

### 2.1 LogComex (Principal Concorrente)

**O que é:** Plataforma brasileira de dados de comércio exterior (SISCOMEX / COMEXSTAT).

**Funcionalidades (baseado em site e conhecimento do mercado):**
1. **Dados de Importação/Exportação** — extração direta do SISCOMEX, NCM a NCM
2. **Radar de Importadores** — busca por empresa importadora/exportadora no Brasil
3. **Cotações de Frete** — integração com freight forwarders
4. **Tarifas e Impostos** — II, IPI, PIS/COFINS, ICMS por estado
5. **Análise de Mercado** — tendências, variações, ranking de países
6. **Relatórios** — PDFs personalizados com dados de comércio
7. **API** — acesso programático aos dados
8. **Alertas** — notificações quando determinado produto/empresa movimenta

**Preços (estimado, baseado em mercado):**
- Plano básico: R$ 200-400/mês
- Plano profissional: R$ 800-1500/mês
- Plano enterprise: sob consulta
- **Trial gratuito:** geralmente 7-14 dias

**Público-alvo:** Despachantes aduaneiros, consultores de comércio exterior, empresas importadoras/exportadoras, freight forwarders.

**Forças:**
- Dados diretos do SISCOMEX (fonte oficial brasileira)
- Base estabelecida no mercado
- Integrações com ERPs
- Time de suporte

**Fraquezas:**
- Foco apenas no Brasil (dados SISCOMEX)
- Interface muitas vezes considerada "pesada" ou antiga
- Preço pode ser proibitivo para pequenas empresas
- Pouca inteligência preditiva / IA
- Não cobre tarifas de outros países de forma detalhada

---

### 2.2 Outros Concorrentes Diretos no Brasil

| Plataforma | Foco | Diferencial | Preço Est. |
|---|---|---|---|
| **DataLuta** | Comércio exterior + jurídico | Dados combinados com processos judiciais | R$ 300-800/mês |
| **COMEX VIS** (gov) | Dados públicos SISCOMEX | Gratuito, mas sem análise | Grátis |
| **ImportGenius** | Dados de importação global | Foco EUA/América Latina | $200-500/mês |
| **Panjiva** | Supply chain intelligence | Dados de embarques (bill of lading) | $500+/mês |
| **TradeMap (ITC)** | Dados de comércio global | Gratuito, dados UN Comtrade | Grátis |
| **Volza** | Importadores globais | Foco Índia, EUA, UK | $100-300/mês |
| **Statista** | Dados de mercado geral | Não específico de comércio exterior | $500+/mês |

---

### 2.3 Concorrentes Internacionais

| Plataforma | O que oferecem que TradeXa NÃO tem |
|---|---|
| **ImportGenius** | Bill of lading real (dados de embarque), nomes reais de importadores nos EUA |
| **Panjiva** | Supply chain mapping (fornecedores → fábricas → compradores) |
| **Volza** | Dados de importação da Índia, UK, EUA com contatos de empresas |
| **UN Comtrade** | Dados oficiais de comércio de TODOS os países (gratuito) |
| **WTO Stats** | Tarifas bound/applied de TODOS os países membros |
| **TARIC (EU)** | Tarifas específicas da União Europeia |
| **US Census** | Dados de importação/exportação dos EUA por HS code |
| **CEIC Data** | Macroeconômicos + comércio exterior (séries temporais) |

---

### 2.4 GAP Analysis — O que faltam no TradeXa

| # | Funcionalidade | Status | Prioridade |
|---|---|---|---|
| 1 | **Bill of Lading / Dados de embarque** | ❌ Não tem | ALTA |
| 2 | **Contatos reais de empresas** (email, telefone) | ❌ Não tem | ALTA |
| 3 | **Dados de produção / supply chain** | ❌ Não tem | MÉDIA |
| 4 | **Alertas automáticos de movimentação** | ⚠️ Básico (RealtimeAlerts) | MÉDIA |
| 5 | **Relatórios PDF exportáveis** | ❌ Não tem | MÉDIA |
| 6 | **Análise preditiva / forecast** | ❌ Não tem | MÉDIA |
| 7 | **Dados de compliance / sanções** | ❌ Não tem | BAIXA |
| 8 | **Ranking de fornecedores por confiabilidade** | ❌ Não tem | MÉDIA |
| 9 | **Dados de custo logístico detalhado** | ⚠️ Frete marítimo básico | MÉDIA |
| 10 | **Integração com ERPs** | ❌ Não tem | BAIXA |
| 11 | **App mobile** | ❌ Não tem (tem Capacitor config mas não usado?) | BAIXA |
| 12 | **Dados de câmbio histórico** | ⚠️ BCB somente atual | MÉDIA |
| 13 | **Análise de concorrência por NCM** | ⚠️ CompetitorIntel redirecionada | ALTA |
| 14 | **Mirror trade / arbitragem de preços** | ⚠️ Redirecionadas | ALTA |
| 15 | **Dados de feiras e eventos de comércio** | ❌ Não tem | BAIXA |

---

## 3. OPORTUNIDADES DE DADOS E APIs GRATUITAS

### 3.1 APIs Governamentais Brasileiras (Gratuitas)

| Fonte | Dados Disponíveis | Como usar |
|---|---|---|
| **COMEXSTAT (MDIC)** | Exportação/Importação Brasil por NCM, país, município | Já usado via edge functions |
| **SISCOMEX (Receita)** | Dados aduaneiros detalhados | Não tem API aberta, mas COMEXSTAT é agregado |
| **BCB (Banco Central)** | Câmbio, juros, inflação, balanço comercial | Já usado (`bcb.ts`) |
| **IBGE** | Dados municipais, PIB, população | Já tem `ibge.ts` |
| **Receita Federal (CNPJ)** | Dados de empresas brasileiras | API pública gratuita — CNPJ, nome fantasia, atividade |
| **CAMEX** | Resoluções de tarifas, barreiras | Web scraping ou PDF parsing |
| **MAPA** | Dados agropecuários, exportações | API disponível |

**NOVO — Receita Federal CNPJ:**
```
https://receitaws.com.br/v1/cnpj/{cnpj}
```
Retorna: nome, fantasia, atividade principal, endereço, sócios. **Gratuito** (limitado a 3 req/min).

Ou a API oficial da Receita:
```
https://api.cnpf.com.br (não oficial, precisa verificar)
```

---

### 3.2 APIs Internacionais (Gratuitas)

| Fonte | Dados | URL Base | Limites |
|---|---|---|---|
| **UN Comtrade** | Comércio internacional por país/HS | `comtrade.un.org/api` | 100 req/hr |
| **WTO Stats** | Tarifas, quotas, trade agreements | `stats.wto.org` | Gratuito |
| **World Bank Open Data** | Macroeconômicos, comércio | `api.worldbank.org/v2` | Gratuito |
| **US Census API** | Dados de importação/exportação EUA | `api.census.gov/data` | Gratuito (key necessária) |
| **TARIC (EU)** | Tarifas da UE | `ec.europa.eu/taxation_customs/dds2/taric` | Gratuito |
| **IMF Data** | Dados macroeconômicos globais | `data.imf.org` | Gratuito |
| **OpenExchangeRates** | Câmbio global | `openexchangerates.org` | Free tier limitado |
| **RestCountries** | Dados de países (população, moeda) | `restcountries.com` | Gratuito |
| **FlagCDN** | Bandeiras em SVG | `flagcdn.com` | Gratuito |
| **OpenStreetMap / Nominatim** | Geocoding, dados de cidades | `nominatim.openstreetmap.org` | Gratuito (politeness) |

---

### 3.3 APIs com Tier Gratuito (Freemium)

| Fonte | Dados | Free Tier | Pago |
|---|---|---|---|
| **SerpAPI** | Google Search results | 100 req/mês | $50/mês |
| **Clearbit** | Dados de empresas (logo, sector) | 50 req/mês | - |
| **Hunter.io** | Emails de empresas | 25 req/mês | $49/mês |
| **Crunchbase** | Dados de startups/empresas | Limitado | $300/mês |
| **Global Trade Atlas (IHS)** | Dados de comércio detalhados | Trial | $$$ |
| **Datamyne** | Dados aduaneiros EUA/LATAM | Trial | $$$ |

---

### 3.4 Cruzamentos de Dados Possíveis (Diferenciais Únicos)

O TradeXa pode criar valor ÚNICO combinando fontes gratuitas que NENHUM concorrente combina:

#### A. TradeXa Smart Rank™ (Combinação exclusiva)
1. **COMEXSTAT** → volume de exportação/importação por NCM/país
2. **WTO Tariffs** → alíquota do país destino
3. **VAT/GST** → imposto local no destino
4. **World Bank** → PIB, facilidade de negócio do país
5. **Freight data** → custo de transporte
6. **DeepSeek V3** → análise textual da oportunidade

**Resultado:** Score de oportunidade por produto+país, ranqueado automaticamente.

#### B. Fornecedor Verificado™
1. **VPS Importadores** → nome da empresa importadora
2. **Receita Federal CNPJ API** → dados da empresa brasileira
3. **Google Search / SerpAPI** → site, LinkedIn, notícias
4. **DeepSeek** → análise de reputação/sentimento

**Resultado:** Perfil completo da empresa importadora com dados públicos.

#### C. Tarifa Alert™
1. **WTO Stats** → mudanças em tarifas bound
2. **CAMEX** → mudanças em tarifas brasileiras
3. **TARIC** → mudanças na UE
4. **US Trade Representative** → Section 301, 232 updates

**Resultado:** Alerta quando uma tarifa relevante para o usuário muda.

#### D. Seasonal Intelligence™
1. **COMEXSTAT** com monthDetail → sazonalidade real por NCM
2. **Climate data (World Bank)** → sazonalidade climática no país destino
3. **Google Trends** → busca por produto (tendência de demanda)

**Resultado:** "Melhor mês para exportar café para Alemanha: Maio (baseado em dados de 2019-2024)"

#### E. Municipal Heatmap™
1. **COMEXSTAT** por município → hubs de exportação
2. **IBGE** → PIB municipal, população
3. **Google Maps / OSM** → distância até porto/aeroporto
4. **Receita Federal** → empresas ativas no município

**Resultado:** Mapa de calor dos melhores municípios brasileiros para exportar determinado produto.

---

## 4. RECOMENDAÇÕES ESTRATÉGICAS

### 4.1 Curto prazo (1-2 semanas)

1. **Limpar código morto**
   - Deletar 15 páginas redirecionadas (PriceArbitrage, CompetitorIntel, etc.)
   - Deletar `Index/components/*` (8 arquivos mortos)
   - Deletar `brasil-eua/*` OU integrar no App.tsx
   - Deletar `trade-intelligence/*` páginas órfãs (exceto TradeCountries)
   - **Estimativa:** remover ~40 arquivos, reduzir codebase em ~15%

2. **Corrigir problemas de design críticos**
   - Substituir TODOS `text-slate-400` → `text-slate-600` em páginas principais
   - Substituir `bg-clip-text` por cor sólida `#D80E16`
   - Reduzir particle count no mobile (detectar `window.innerWidth < 768`)

3. **Consolidar landing pages**
   - Escolher UMA página pública: HomePage OU LandingPage
   - A outra virar redirect ou deletar
   - `LandingIndex.tsx` (59 linhas) parece wrapper — verificar função

4. **Fixar chamadas VPS**
   - Garantir que TODAS usem `/api/vps/` (Vercel rewrite), não IP direto

### 4.2 Médio prazo (1-2 meses)

5. **Implementar Fornecedor Verificado**
   - Integrar Receita Federal CNPJ API
   - Enriquecer cards de importadores com dados reais da empresa

6. **Implementar TradeXa Smart Rank**
   - Combinar COMEXSTAT + WTO + VAT + Freight
   - Página de "Oportunidades" ranqueadas por IA

7. **Relatórios PDF exportáveis**
   - Biblioteca: `jspdf` + `html2canvas`
   - Gerar PDF a partir de qualquer análise

8. **Alertas inteligentes**
   - Quando um NCM específico tem variação >X% no COMEXSTAT
   - Quando tarifa WTO muda para um país

### 4.3 Longo prazo (3-6 meses)

9. **Dados de embarque (Bill of Lading)**
   - Infelizmente BOA fonte gratuita NÃO existe
   - Alternativas: scraping de portais públicos (limitado)
   - Ou parceria com Datamyne/ImportGenius (dados pagos)

10. **App Mobile**
    - Capacitor já configurado (`capacitor.config.ts`, `android/`, `ios/`)
    - Mas não está sendo usado. Requer build separado.

11. **Análise preditiva**
    - Usar séries temporais do COMEXSTAT + regressão
    - Ou fine-tuning de modelo (DeepSeek) com dados históricos

---

## 5. RESUMO EXECUTIVO

### Pontos Fortes do TradeXa
✅ Stack técnico moderno (React 18, Vite, Tailwind, Framer Motion)
✅ VPS com dados reais (importadores, tarifas WTO)
✅ Integração com IA (DeepSeek V3) para classificação
✅ Dados COMEXSTAT em tempo real
✅ Supabase para backend (auth, storage, edge functions)
✅ Deploy automatizado na Vercel
✅ SEO bem estruturado (meta tags, Open Graph, Schema.org)

### Pontos Críticos
❌ **120 páginas** — muitas mortas, duplicadas ou redirecionadas
❌ **286 ocorrências** de cores invisíveis (`text-slate-400/500`)
❌ **14 ocorrências** de `bg-clip-text` proibido
❌ Efeitos 3D overkill — performance e acessibilidade comprometidas
❌ Textos genéricos de marketing — falta dados concretos e provas sociais
❌ Páginas Brasil↔EUA inacessíveis (`brasil-eua/`)
❌ Chamadas HTTP diretas para VPS (Mixed Content risk)

### Diferencial Competitivo Potencial
O TradeXa tem uma arquitetura TÉCNICA superior ao LogComex (IA, WTO data, frete, VAT). O problema é:
1. **Acúmulo de código morto** que polui o projeto
2. **Design inconsistente** entre páginas
3. **Falta de funcionalidades "killer"** que nenhum concorrente tem

A proposta de valor ÚNICA pode ser:
> **"A única plataforma que combina dados brasileiros (COMEXSTAT), tarifas globais (WTO), frete real e IA em uma simulação completa de exportação"**

Isso NINGUÉM faz. O LogComex não tem tarifas de outros países. O TradeMap não tem IA. O Panjiva não tem dados brasileiros.

---

*Relatório gerado em 21.05.2026. Próximo passo recomendado: definir prioridades com o usuário e executar limpeza de código + correções críticas de design.*
