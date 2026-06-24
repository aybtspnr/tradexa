# Plano: Seção Brasil ↔ EUA (6 sub-páginas)

**Data:** 2026-05-18
**Status:** Planejado
**API:** US Census Bureau International Trade (`api.census.gov/data/timeseries/intltrade`)

---

## Objetivo

Transformar a página única `/us-trade` em uma **seção com 6 sub-páginas** navegáveis via sidebar lateral, todas consumindo dados reais da US Census Bureau API.

## Estrutura de Rotas

```
/secoes/brasil-eua
├─ /visao-geral      (atual UsTradeOverview — HS codes, fluxo, comparar)
├─ /estados          (ranking/mapa de estados dos EUA)
├─ /portos           (top portos de entrada/saída)
├─ /categorias       (análise por end-use: bens de capital, consumo, etc.)
├─ /market-share     (Brasil vs concorrentes por produto HS)
└─ /oportunidades    (EUA importa muito, Brasil exporta pouco)
```

## Datasets da Census API Disponíveis

Todos confirmados funcionando com key atual (`1bd2f7004fe5fe577570bda949c4dd22a2466e5d`):

| Dataset | Path | Uso |
|---------|------|-----|
| imports/hs | `imports/hs?get=...&CTY_CODE=3510&COMM_LVL=HS6` | Visão Geral, Market Share, Oportunidades |
| exports/hs | `exports/hs?get=...&CTY_CODE=3510&COMM_LVL=HS6` | Visão Geral |
| imports/enduse | `imports/enduse?get=...&CTY_CODE=3510` | Categorias |
| exports/enduse | `exports/enduse?get=...&CTY_CODE=3510` | Categorias |

**Datasets NÃO disponíveis** (404): `imports/state`, `imports/port`, `imports/district` — a API atual não expõe essas dimensões geográficas.

### Variáveis por dataset

**imports/hs:** `I_COMMODITY`, `I_COMMODITY_SDESC`, `I_COMMODITY_LDESC`, `GEN_VAL_MO`, `GEN_VAL_YR`, `GEN_QY1_MO`, `CTY_NAME`, `CTY_CODE`

**exports/hs:** `E_COMMODITY`, `E_COMMODITY_SDESC`, `E_COMMODITY_LDESC`, `ALL_VAL_MO`, `ALL_VAL_YR`, `QTY_1_MO`, `CTY_NAME`, `CTY_CODE`

**imports/enduse:** Variáveis específicas de end-use (a confirmar — mesma estrutura de naming: `I_COMMODITY` etc.)

---

## Plano de Implementação

### Fase 1: Edge Function (unificada)

**Arquivo:** `supabase/functions/us-census-trade/index.ts`

Adicionar suporte para ação `modo`:
- `"hs"` → dataset imports/hs ou exports/hs (atual)
- `"enduse"` → dataset imports/enduse ou exports/enduse
- `"market-share"` → imports/hs sem filtro CTY_CODE (todos os países para um produto)
- `"opportunities"` → comparação imports/hs (todos) vs exports/hs (Brasil)

Novo parâmetro `acao` no body:
```json
{ "acao": "hs"|"enduse"|"market-share"|"opportunities", "modo": "imports"|"exports", "cty_code": "3510", "year": "2025", "month": "01", "hs_code": "090111" }
```

### Fase 2: Layout Pai (BrasilEuaLayout)

**Novo arquivo:** `src/pages/brasil-eua/BrasilEuaLayout.tsx`

- Sidebar lateral com links para as 6 sub-páginas
- Estado ativo baseado na rota atual
- Animações de transição entre páginas
- Título fixo "Brasil ↔ EUA" com bandeiras

### Fase 3: Páginas Filhas

#### 3a. Visão Geral → migrar `UsTradeOverview.tsx` para `brasil-eua/VisaoGeral.tsx`
- Mantém toda a funcionalidade atual
- Ajustar imports e rota

#### 3b. Estados → `brasil-eua/Estados.tsx`
- ⚠️ **Dataset `imports/state` retorna 404** — não disponível
- **Fallback:** Remover esta página OU criar visualização alternativa (dados mockados? não!)
- **Decisão:** Remover `/estados` — sem dados reais, a página não existe (seguindo regra do usuário)

#### 3c. Portos → `brasil-eua/Portos.tsx`
- ⚠️ **Mesmo problema — `imports/port` retorna 404**
- **Decisão:** Remover `/portos`

#### 3d. Categorias → `brasil-eua/Categorias.tsx`
- Dataset: `imports/enduse` + `exports/enduse`
- **KPIs:** Total por categoria, % do total
- **Gráfico:** Treemap ou bar chart horizontal com categorias end-use
- **Tabela:** Categoria, valor import/export, share %
- **Filtros:** Ano, mês, direção (BR→USA / USA→BR)

#### 3e. Market Share → `brasil-eua/MarketShare.tsx`
- Dataset: `imports/hs` sem CTY_CODE (retorna todos os países)
- **Input:** Buscar por HS code ou produto
- **KPIs:** Total importado pelos EUA, share do Brasil (%), ranking
- **Gráfico:** Horizontal bar chart top 10 países fornecedores
- **Tabela:** País, valor, share %, variação YoY

#### 3f. Oportunidades → `brasil-eua/Oportunidades.tsx`
- Dataset: cruzar `imports/hs` (todos países, top produtos) vs `exports/hs` (Brasil→EUA)
- **Lógica:** Top 50 produtos que EUA importa do mundo, ordenados por "gap" (total_importado - exportado_pelo_brasil)
- **KPIs:** Total de oportunidades, valor total do gap
- **Gráfico:** Scatter ou bar chart mostrando importado vs exportado
- **Tabela:** Produto, total importado pelos EUA, exportado pelo Brasil, gap, share atual, share potencial

### Fase 4: Rotas

**Atualizar `src/App.tsx`:**
```tsx
// Substituir:
<Route path="/us-trade" element={<ProtectedPage><UsTradeOverview /></ProtectedPage>} />

// Por layout pai com sub-rotas:
<Route path="/secoes/brasil-eua" element={<ProtectedPage><BrasilEuaLayout /></ProtectedPage>}>
  <Route index element={<Navigate to="visao-geral" replace />} />
  <Route path="visao-geral" element={<VisaoGeral />} />
  <Route path="categorias" element={<Categorias />} />
  <Route path="market-share" element={<MarketShare />} />
  <Route path="oportunidades" element={<Oportunidades />} />
</Route>
```

```tsx
// Adicionar lazy imports:
const BrasilEuaLayout = lazy(() => import("./pages/brasil-eua/BrasilEuaLayout"));
const VisaoGeral = lazy(() => import("./pages/brasil-eua/VisaoGeral"));
const Categorias = lazy(() => import("./pages/brasil-eua/Categorias"));
const MarketShare = lazy(() => import("./pages/brasil-eua/MarketShare"));
const Oportunidades = lazy(() => import("./pages/brasil-eua/Oportunidades"));
```

### Fase 5: Navegação

**Atualizar `DashboardLayout.tsx`:**
- Alterar link `{ to: "/us-trade", icon: ArrowLeftRight, label: "Brasil ↔ EUA" }` → `{ to: "/secoes/brasil-eua", ... }`

**Atualizar `AppLayout.tsx`:**
- Adicionar metadados para as novas rotas:
```tsx
"/secoes/brasil-eua": { title: "Brasil ↔ EUA", subtitle: "Comércio bilateral" },
"/secoes/brasil-eua/categorias": { title: "Categorias", subtitle: "Análise por uso final" },
// etc.
```

### Fase 6: SEO

Cada sub-página terá seu próprio `<Helmet>` com title, description e keywords específicos.

---

## Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `supabase/functions/us-census-trade/index.ts` | Atualizar — adicionar ações enduse, market-share, opportunities |
| `src/App.tsx` | Atualizar — substituir rota /us-trade por /secoes/brasil-eua/* |
| `src/components/DashboardLayout.tsx` | Atualizar — mudar link de navegação |
| `src/components/AppLayout.tsx` | Atualizar — adicionar metadados novas rotas |
| `src/pages/UsTradeOverview.tsx` | Mover → `src/pages/brasil-eua/VisaoGeral.tsx` |

## Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `src/pages/brasil-eua/BrasilEuaLayout.tsx` | Layout pai com sidebar |
| `src/pages/brasil-eua/VisaoGeral.tsx` | Migração do UsTradeOverview.tsx |
| `src/pages/brasil-eua/Categorias.tsx` | Análise end-use |
| `src/pages/brasil-eua/MarketShare.tsx` | Share por produto |
| `src/pages/brasil-eua/Oportunidades.tsx` | Gap analysis |

---

## Páginas Removidas do Escopo

| Página | Motivo |
|--------|--------|
| `/estados` | Dataset `imports/state` retorna 404 na API |
| `/portos` | Dataset `imports/port` retorna 404 na API |

---

## Riscos e Pontos de Atenção

1. **Variáveis end-use:** Nomes podem diferir do padrão HS — testar antes de codificar
2. **Rate limit:** Census API free tier = ~500 queries/dia — implementar cache na edge function
3. **Market Share sem CTY_CODE:** Pode retornar datasets enormes; limitar a top 20 países e usar `COMM_LVL=HS6`
4. **Oportunidades:** Requer 2 chamadas de API (imports/all + exports/BR); implementar em paralelo na edge function

---

## Verificação

- [ ] Todas as 4 sub-páginas carregam dados reais da Census API
- [ ] Navegação entre sub-páginas via sidebar funcional
- [ ] Breadcrumb ou indicador de localização visível
- [ ] Link no menu principal redireciona para `/secoes/brasil-eua`
- [ ] Deploy Vercel bem-sucedido
- [ ] Nenhum dado demo/fallback (se API falhar = erro claro)
