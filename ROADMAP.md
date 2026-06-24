# TradeXa — Roadmap de Produto & Novos Serviços

## Status Atual (Maio 2026)

### Sistema de Planos Implementado
| Plano | Preço | Créditos | Features |
|-------|-------|----------|----------|
| **Starter** | Grátis | 10/mês | Dashboard, Classificador IA (10/mês), HTS Lookup, NCM Compare, Simulador (3/mês) |
| **Professional** | R$ 99/mês | 500/mês | +Smart Rank (20/mês), Alertas Tarifas (5/mês), PDF Reports, Busca CNPJ, Importadores ilimitado |
| **Enterprise** | R$ 299/mês | ∞ | +Análise Avançada, API access, Webhooks, Suporte prioritário |

### Features Entregues Nesta Sessão
1. ✅ Sistema de Feature Flags por Plano (`src/lib/plan-features.ts`)
2. ✅ Hook `useFeatureAccess` — verifica permissão + créditos
3. ✅ Componente `ProtectedFeature` — bloqueia páginas inteiras
4. ✅ Componente `UpgradePrompt` — tela de upgrade reutilizável
5. ✅ Menu lateral filtrado por plano (com badges PRO/ENTERPRISE)
6. ✅ Consumo de créditos em: SmartRank (2), TariffAlerts (1/alerta), ExportSimulator (1)
7. ✅ Receita Federal CNPJ API integrada no ExportSimulator
8. ✅ Smart Rank com 18 mercados + exportação PDF
9. ✅ Alertas de Tarifas com localStorage + comparação WTO
10. ✅ Relatórios PDF (Simulação + Ranking)
11. ✅ Gráfico de câmbio USD/BRL no Dashboard (fonte BCB)
12. ✅ Dashboard com dados reais do VPS (top categorias + países)

---

## Novos Serviços Planejados

### Fase 1 — Dados Brasileiros (Alta Prioridade)
1. **SECEX/RADAR Integração**
   - Dados de exportação/importação brasileiros via API pública
   - Volume por NCM, país destino, valor FOB
   - Fonte: http://www.mdic.gov.br/index.php/comercio-exterior/estatisticas-de-comercio-exterior
   - Impacto: Diferenciador único no mercado

2. **Drawback/Ex-Tarifário**
   - Simulador de drawback brasileiro
   - Consulta de suspensões de ex-tarifário na SECEX
   - Cálculo de restituição de impostos

3. **ANVISA/MAPA Consulta**
   - Verificação automática se produto precisa de registro sanitário
   - Lista de produtos regulados por categoria HS

### Fase 2 — Inteligência Competitiva
4. **COMEXSTAT (dados brasileiros)**
   - Já tentamos API direta — bloqueada por Cloudflare
   - Alternativa: Download dos microdados e ingestão batch
   - Dados: 3.8M+ registros de importação por empresa

5. **Radar de Oportunidades**
   - Cruzar: países com tarifa baixa + alto volume de importação
   - Identificar "gaps" — produtos que Brasil exporta pouco para mercados com demanda

6. **Preços Internacionais (Comparador)**
   - Integrar dados de preços FOB por produto/destino
   - Benchmark: preço médio de exportação brasileira por NCM

### Fase 3 — Operacional
7. **Rastreamento de Containers**
   - API MSC, Maersk, ONE, CMA CGM
   - Status do container, ETA, portos de transbordo

8. **Cotação de Frete Aéreo**
   - IATA rates ou integração com forwarders
   - Comparação marítimo vs aéreo

9. **Certificações de Origem**
   - Consulta de acordos comerciais do Brasil (ALADI, MERCOSUL, etc.)
   - Geração de certificado de origem digital

### Fase 4 — AI/Automação
10. **AI Trade Assistant**
    - Chatbot especializado em comércio exterior
    - Responde perguntas sobre regulamentação, documentação, tarifas

11. **Previsão de Demanda**
    - Machine learning em dados históricos de importação
    - Prever tendências de demanda por produto/mercado

12. **Alertas Automáticos Inteligentes**
    - Notificar quando oportunidades surgem (tarifa caiu + volume subiu)
    - Integração com email/WhatsApp

---

## Próximos Passos Imediatos

1. **Implementar plan_type no Supabase**
   - Adicionar coluna `plan_type` na tabela `profiles`
   - Criar trigger para sincronizar plano com `user_credits`
   - Script de migração para usuários existentes (todos → starter)

2. **Testar sistema de créditos em staging**
   - Criar usuário teste com plano Starter
   - Verificar bloqueio após 10 classificações IA
   - Verificar redirecionamento para Plans.tsx

3. **Integrar pagamento real (Mercado Pago)**
   - A edge function `payment-gateway` já existe
   - Atualizar callback para atualizar `plan_type` no profile
   - Implementar webhook de confirmação

4. **Adicionar mais consumo de créditos**
   - AiSearch.tsx: já consome ✓
   - PotentialImporters.tsx: 1 crédito por busca
   - CountryComparison: 1 crédito por comparação
   - MaritimeFreight: 2 créditos por cotação

5. **Landing page de vendas**
   - Página pública com comparação de planos
   - Depoimentos, cases de uso
   - CTA para cadastro gratuito
