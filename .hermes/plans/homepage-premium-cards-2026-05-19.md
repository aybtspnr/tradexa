# Homepage Premium Cards + Landing Pages — Plano de Implementação

> **Para Hermes:** Executar tarefa por tarefa, build + deploy apenas no final.

**Objetivo:** Transformar a homepage em vitrine premium: cards 3D expansíveis com glass morphism, botões internos direcionando para landing pages públicas ricas (criar páginas para funcionalidades que não as têm).

**Arquitetura:** Componente `ExpandableModuleCard` reutilizável. Cada card expande via `AnimatePresence` revelando descrição + features + CTA. Landing pages públicas seguem template consistente: hero + seções + CTA. Rotas novas em `App.tsx`.

---

## Task 1: Criar componente `ExpandableModuleCard` (glass 3D expansível)

**Objetivo:** Componente reutilizável para cards que expandem com animação

**Criar:** `src/components/home/ExpandableModuleCard.tsx`

**Especificação:**
- Estado: `expanded` toggle com `AnimatePresence`
- Collapsed: ícone + título + desc curta + chevron
- Expanded: desliza para baixo revelando features (lista com checks) + descrição longa + 2 botões (CTA "Acessar" e "Saiba mais → landing page")
- Glass morphism: `backdrop-blur-xl bg-white/90`, glow vermelho no hover
- 3D tilt: `TiltWrapper` ao redor
- Botão interno "Acessar" → link direto (pode ser protected)
- Botão "Saiba mais" → landing page pública

**Código base:**

```tsx
"use client";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Check, ArrowRight, Sparkles } from "lucide-react";
import { TiltWrapper } from "@/components/3d";

interface ModuleFeature {
  name: string;
  desc: string;
}

interface ExpandableModuleCardProps {
  icon: React.ElementType;
  title: string;
  shortDesc: string;
  longDesc: string;
  features: ModuleFeature[];
  color: string;
  actionRoute: string;      // link direto (pode precisar login)
  landingRoute: string;      // landing page pública
  actionLabel?: string;
}

export function ExpandableModuleCard({
  icon: Icon,
  title,
  shortDesc,
  longDesc,
  features,
  color,
  actionRoute,
  landingRoute,
  actionLabel = "Acessar",
}: ExpandableModuleCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <TiltWrapper tiltAmount={6}>
      <motion.div
        layout
        onClick={() => setExpanded(!expanded)}
        className={`relative rounded-2xl cursor-pointer overflow-hidden transition-all duration-500 group ${
          expanded
            ? "bg-white/95 backdrop-blur-2xl border-[#D80E16]/20 shadow-[0_8px_40px_-12px_rgba(216,14,22,0.15)]"
            : "bg-white/80 backdrop-blur-xl hover:bg-white/90 hover:shadow-[0_4px_24px_-8px_rgba(15,17,26,0.1)]"
        } border border-black/[0.06]`}
      >
        {/* Glow accent top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[color] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ "--color": color } as any} />

        {/* Collapsed header */}
        <div className="p-5 md:p-6">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 card-icon-wrap-3d"
              style={{ background: color + "15" }}
            >
              <Icon className="w-6 h-6" style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-bold text-[#0F111A] mb-1">{title}</h4>
              <p className="text-[13px] text-[#5E6278] leading-relaxed line-clamp-2">{shortDesc}</p>
            </div>
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              className="w-7 h-7 rounded-lg bg-black/[0.03] flex items-center justify-center flex-shrink-0"
            >
              <ChevronDown className="w-4 h-4 text-[#5E6278]" />
            </motion.div>
          </div>
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 space-y-4">
                <div className="h-px bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
                
                <p className="text-sm text-[#5E6278] leading-relaxed">{longDesc}</p>

                {/* Features */}
                <ul className="space-y-2.5">
                  {features.map((f) => (
                    <li key={f.name} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color }} />
                      <div>
                        <span className="text-sm font-bold text-[#0F111A]">{f.name}</span>
                        <span className="text-xs text-[#5E6278] ml-1.5">{f.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2.5 pt-2" onClick={(e) => e.stopPropagation()}>
                  <Link
                    to={actionRoute}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                    style={{ background: color }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {actionLabel}
                  </Link>
                  <Link
                    to={landingRoute}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-black/[0.08] text-[#0F111A] hover:bg-black/[0.02] transition-all"
                  >
                    Saiba mais
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </TiltWrapper>
  );
}
```

**Verificação:** Componente renderiza, expande/colapsa, botões funcionam.

---

## Task 2: Substituir cards atuais na `PlatformModulesSection` pelos expandíveis

**Modificar:** `src/components/home/PlatformModulesSection.tsx`

**O que muda:**
- Trocar `ModuleCard` simples pelo `ExpandableModuleCard`
- Adicionar `features` e `longDesc` em cada módulo
- Cada card ganha `landingRoute` (rota de landing page pública)

**Módulos com dados completos:**

```tsx
const COLUMNS: { title: string; items: ExpandedModule[] }[] = [
  {
    title: "Importação",
    items: [
      {
        icon: Package, title: "Dashboard Importação",
        shortDesc: "Visualize volumes, valores e tendências de importação brasileira",
        longDesc: "Acesse dados oficiais do SISCOMEX com filtros por NCM, país, estado e período. Visualize dashboards interativos com ranking de importadores, evolução temporal e market share por fornecedor.",
        features: [
          { name: "Ranking de importadores", desc: "Top 100 por volume e valor FOB" },
          { name: "Análise por NCM", desc: "6 dígitos com descrição completa" },
          { name: "Evolução temporal", desc: "Gráficos mensais e anuais" },
        ],
        color: "#D80E16",
        actionRoute: "/import-intelligence",
        landingRoute: "/landing/import-intelligence",
      },
      { icon: Search, title: "Busca Inteligente", ... },
      { icon: Map, title: "Mapa de Importações", ... },
    ]
  },
  // ... mesmo para Exportação, Inteligência, Ferramentas
]
```

**Verificação:** Seção renderiza com 12 cards expandíveis. Cada card expande/colapsa com animação suave.

---

## Task 3: Criar landing pages públicas para cada módulo

**Objetivo:** 12 landing pages em `/landing/...` que explicam cada funcionalidade sem exigir login.

**Criar template:** `src/pages/landing/ModuleLandingTemplate.tsx`

Template reutilizável que aceita props:
- `title`, `subtitle`, `icon`, `color`
- `features` (array de {icon, title, desc})
- `ctaRoute` (link para registro)
- `sections` (array de {title, content})

**Criar páginas individuais** (arquivos finos que usam o template):

```
src/pages/landing/
  ImportDashboardLanding.tsx
  ImportSearchLanding.tsx
  ImportMapLanding.tsx
  ExportDashboardLanding.tsx
  ExportOpportunitiesLanding.tsx
  GlobalExplorerLanding.tsx
  MarketIntelligenceLanding.tsx
  PriceArbitrageLanding.tsx
  NcmClassifierLanding.tsx
  TariffCalculatorLanding.tsx
  AlertsLanding.tsx
  ExportWizardLanding.tsx
```

**Adicionar rotas em App.tsx:**

```tsx
const LandingImportDashboard = lazy(() => import("./pages/landing/ImportDashboardLanding"));
// ... todas as 12

// Rotas públicas:
<Route path="/landing/import-dashboard" element={<AnimatedPage><LandingImportDashboard /></AnimatedPage>} />
// ... todas
```

**Verificação:** Cada `/landing/...` renderiza página pública rica, sem necessidade de login.

---

## Task 4: Melhorar layout visual da homepage

**Objetivo:** Refinar cores, espaçamento, e consistência visual.

**Ajustes:**
1. **EducationalSection → "Por que TRADEXA"**: condensar os 3 steps em 3 cards lado a lado com números grandes (01, 02, 03) em vez do layout 2-colunas atual com tanto texto
2. **Background alternado mais sutil**: usar `bg-[#FAFAF9]` em vez de `bg-[#FAFAF7]` (menos amarelado, mais neutro)
3. **Adicionar linha divisória sutil** entre seções: `border-t border-black/[0.03]`
4. **Hero**: reduzir `min-h-screen` para `min-h-[90vh]` (menos scroll para chegar no conteúdo)

**Verificação:** Visual mais limpo, menos texto, scroll mais curto.

---

## Task 5: Build + Deploy

```bash
cd /mnt/d/dyad/TRADEXA-MARKET-INTELLIGENCE
npm run build
npx vercel --prod --yes
```

**Verificação:** `curl -s https://tradex6.vercel.app` retorna HTML com novo hash JS.

---

## Resumo de impacto

| Mudança | Valor |
|---|---|
| Cards expansíveis 3D | Vitrine interativa premium |
| 12 landing pages | SEO + conversão (visitante vê valor antes de registrar) |
| Template reutilizável | Manutenção fácil, consistência visual |
| Layout mais enxuto | Menos scroll, mais impacto |
