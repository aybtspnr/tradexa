# Blog Posts TRADEXA

10 posts ativos em `src/data/blog/posts.ts`.

## Posts

| # | Slug | Título | Foco SEO | Tam. |
|---|---|---|---|---|
| 1 | classificacao-ncm-guia-completo | Classificação NCM: Guia Completo | "classificação NCM", "NCM guia" | 7 min |
| 2 | calcular-imposto-importacao-brasil | Como Calcular o Imposto de Importação no Brasil | "calcular imposto importação" | 8 min |
| 3 | frete-maritimo-como-funciona | Frete Marítimo Internacional: FCL e LCL | "frete marítimo", "FCL LCL" | 6 min |
| 4 | tarifas-importacao-31-paises | Tarifas de Importação em 31 Países | "tarifas importação", "alíquotas" | 7 min |
| 5 | comex-stat-dados-comercio-exterior | Comex Stat 2026 | "Comex Stat", "dados MDIC" | 6 min |
| 6 | icms-importacao-estados-brasil | ICMS na Importação: Alíquotas por Estado | "ICMS importação", "alíquotas ICMS" | 8 min |
| 7 | drawback-regime-aduaneiro-exportacao | Drawback: Guia Completo | "drawback", "regime aduaneiro" | 9 min |
| 8 | documentos-importacao-exportacao | Documentos para Importar e Exportar | "documentos importação", "checklist" | 10 min |
| 9 | ncm-vs-cesta-basica-reducao-tributaria | NCM Cesta Básica: Redução Tributária | "cesta básica importação", "ex-tarifário" | 8 min |
| 10 | exportar-para-eua-guia | Como Exportar para os EUA | "exportar para EUA", "HTS" | 11 min |

## CTAs por Post

Cada post tem CTAs específicos para ferramentas TRADEXA (ver `postTools` em `BlogPostPage.tsx`):
- Classificador NCM com IA (link para `/landing/ncm-classifier`)
- Tarifário Global (`/landing/tariff-calculator` ou `/global-tariff`)
- Trade Intelligence / Inteligência Comercial (`/intelligence`)
- Calculadora de Imposto (`/landing/tariff-calculator`)
- Smart Rank (`/landing/export-opportunities`)
- Brasil ↔ EUA (`/us-trade`)
- Mapa de Frete 3D (`/landing/maritime-freight-map`)
- Supply Chain Map (`/landing/supply-chain`)
- Diretório de Importadores (`/landing/importadores`)
- AI Search (`/ai-search`)

## Componentes

- `src/pages/BlogPage.tsx` — Lista premium com ParticleCanvas, badges, cards com hover, CTA footer com tool cards
- `src/pages/BlogPostPage.tsx` — Post premium com ParticleCanvas hero, CTAs inline, CTABanner gradient, card grid de tools relacionadas
- Rotas: `/blog` e `/blog/:slug` em `App.tsx`

## Para adicionar novo post

1. Adicionar entrada no array `blogPosts` em `src/data/blog/posts.ts`
2. Adicionar CTAs em `postTools` no `src/pages/BlogPostPage.tsx`
3. Adicionar entrada no array `BLOG_POSTS` em `scripts/prerender.mjs`
4. Adicionar `<url>` no `public/sitemap.xml`
5. Adicionar URL no array `PUBLIC_URLS` em `scripts/indexnow-submit.js`
6. Rodar `npx vercel build --prod && npx vercel deploy --prebuilt --prod --yes`
