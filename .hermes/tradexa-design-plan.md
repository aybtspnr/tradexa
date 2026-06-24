# TRADEXA Design System v2 — Plano de Redesign Premium Minimalista

## Paleta TRADEXA (extraída do logo)

| Token | Hex | Uso |
|-------|-----|-----|
| `trxa-red` | `#D80E16` | CTAs primários, badges ativos, acentos |
| `trxa-red-bright` | `#E50716` | Hover states, glow effects |
| `trxa-red-muted` | `#FDE8E8` | Background de alerts, tags sutis |
| `trxa-black` | `#222222` | Texto principal, headers |
| `trxa-black-deep` | `#0A0A0A` | Fundo dark sections |
| `trxa-gray-900` | `#111111` | Sidebar dark, cards escuros |
| `trxa-gray-800` | `#1A1A1A` | Elevated surfaces dark |
| `trxa-gray-600` | `#666666` | Texto secundário |
| `trxa-gray-400` | `#999999` | Labels, placeholders |
| `trxa-gray-200` | `#E5E5E5` | Borders, dividers |
| `trxa-gray-100` | `#F5F5F5` | Background claro |
| `trxa-white` | `#FFFFFF` | Background principal |
| `trxa-surface` | `#FAFAFA` | Card backgrounds |

## Tipografia

| Token | Font | Weight | Uso |
|-------|------|--------|-----|
| Display | Inter | 900 (Black) | H1 landing, hero text |
| Heading | Inter | 700 (Bold) | H2-H4, page titles |
| Subheading | Inter | 600 (Semibold) | Card titles, section labels |
| Body | Inter | 400 (Regular) | Parágrafos, descrições |
| Mono | JetBrains Mono | 400 | Códigos NCM, dados numéricos |
| Micro | Inter | 500 | Labels uppercase, tracking-wide |

## Princípios de Layout

1. **Whitespace generoso** — padding 24px-40px entre seções, nunca < 16px
2. **Grid consistente** — max-width 1280px centralizado, 12-col grid gap 24px
3. **Cards clean** — border-radius 16px, sombra sutil (0 1px 3px rgba(0,0,0,0.08)), sem borders pesadas
4. **Glassmorphism restrito** — usar só em KPIs hero, nunca em cards de dados
5. **Ação vermelha** — todo botão primário = trxa-red, hover = trxa-red-bright
6. **Dark sections** — landing page usa alternância dark/light por seção para ritmo visual
7. **Animações suaves** — framer-motion: opacity + translateY 20px, 0.3s ease-out
8. **Sem informações falsas** — nada de "10k usuários", "4.9 estrelas" inventados

## Componentes Premium a Criar

- `TrxaButton` — botão primário vermelho, secundário outline preto, ghost
- `TrxaCard` — card clean com hover lift, sombra progressiva
- `TrxaSection` — wrapper de seção com padding consistente, background alternável
- `TrxaHero` — hero com gradiente sutil ou video/GIF de fundo
- `TrxaFeatureGrid` — grid de features com ícones e descrição real
- `TrxaDataTable` — tabela de dados minimalista, headers em uppercase micro
- `TrxaKpiCard` — KPI com glassmorphism sutil, sem borda pesada
- `TrxaEmptyState` — ilustração + texto orientando o usuário
- `TrxaNavGuide` — breadcrumb progressivo ou stepper para guiar entre páginas

## Estrutura de Navegação Guiada (Dashboards)

```
Landing Page → Login/Register
                    ↓
           Hub Central (Trade Intelligence)
                    ↓
    ┌───────────┬───────────┬───────────┐
    │ Exportação │ Importação │ Saldo     │
    │ Inteligência│ Inteligência│ Comercial │
    └───────────┴───────────┴───────────┘
                    ↓
        Sub-páginas especializadas:
        • Dashboard (overview)
        • Busca detalhada
        • Mapa de municípios
        • Ranking
        • Tendências
        • Comparação NCMs
        • Comparador cruzado
```

## SEO — Landing Page (concorrência LogComex)

Keywords alvo: "inteligência de mercado exportação", "dados comércio exterior brasil",
"análise NCM", "exportação brasileira", "comexstat API", "dados de importação",
"trade intelligence brasil", "mercado internacional brasil"

Meta description: "TRADEXA — Inteligência de Mercado para Comércio Exterior Brasileiro.
Dados oficiais COMEXSTAT/MDIC em tempo real. Análise de exportação, importação,
NCMs, tendências e oportunidades globais."

Seções landing (sem mentiras):
1. Hero — video/GIF de mapa global com dados comércio exterior
2. Diferenciais — o que a plataforma realmente faz (dados reais, análise IA, mapas)
3. Módulos — Exportação / Importação / Saldo Comercial / Comparador
4. Tecnologia — COMEXSTAT API + análise Groq + UN Comtrade
5. CTA — Login / Registrar

## Arquivos a Modificar (prioridade)

### Fase 1 — Foundation (CSS global + Auth)
- `src/index.css` — variáveis CSS TRADEXA, tipografia base
- `src/pages/Login.tsx` — redesign dark premium
- `src/pages/Register.tsx` — redesign dark premium
- `src/pages/ForgotPassword.tsx` — acompanhar
- `src/pages/ResetPassword.tsx` — acompanhar

### Fase 2 — Landing Page (SEO + redesign)
- `src/pages/LandingPage.tsx` — rebuild completo com seções reais

### Fase 3 — Hub + Layouts
- `src/components/TradexaLayout.tsx` — sidebar/nav redesign
- `src/pages/TradeIntelligence.tsx` — hub central
- `src/components/ExportIntelligenceLayout.tsx` — nav interna
- `src/components/ImportIntelligenceLayout.tsx` — nav interna

### Fase 4 — Dashboards
- `src/pages/ExportIntelligence.tsx` — busca principal redesign
- `src/pages/ImportIntelligence.tsx` — busca principal redesign
- `src/pages/ExportIntelligenceDashboard.tsx` — overview redesign
- `src/pages/ImportIntelligenceDashboard.tsx` — overview redesign
- `src/pages/ExportIntelligenceMap.tsx` — mapa + clique cidade
- `src/pages/ImportIntelligenceMap.tsx` — mapa + clique cidade

### Fase 5 — Sub-pages
- `src/pages/ExportIntelligenceRanking.tsx`
- `src/pages/ImportIntelligenceRanking.tsx`
- `src/pages/ExportIntelligenceTrends.tsx`
- `src/pages/ImportIntelligenceTrends.tsx`
- `src/pages/ExportIntelligenceCountries.tsx`
- `src/pages/ImportIntelligenceCountries.tsx`
- `src/pages/NcmComparison.tsx`
- `src/pages/CrossDataComparison.tsx`
- `src/pages/TradeBalance.tsx`
- `src/pages/SupplierSearch.tsx`
- `src/pages/MunicipalIntelligence.tsx`

### Fase 6 — Admin + Outros
- `src/pages/Admin*.tsx`
- `src/pages/Settings.tsx`
- `src/pages/Plans.tsx`
- `src/pages/Credits.tsx`
- `src/pages/History.tsx`
- `src/pages/AiSearch.tsx`

## Efeitos Visuais Avançados (Landing)

- **Hero background**: video loop ou GIF de mapa-mundi com linhas de comércio
- **Scroll animations**: framer-motion staggerChildren nas seções
- **Glow red**: box-shadow sutil `0 0 40px rgba(216,14,22,0.15)` nos CTAs
- **Gradiente sutil**: `linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)` em cards
- **Parallax sutil**: background-fixed no hero
- **Particle canvas**: partículas conectadas no dark sections (reutilizar glassmorphism)
