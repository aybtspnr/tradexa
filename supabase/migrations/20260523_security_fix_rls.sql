-- ═══════════════════════════════════════════════════════════════
-- CORREÇÃO DE SEGURANÇA: RLS policies (23/05/2026)
-- ═══════════════════════════════════════════════════════════════
-- Problemas corrigidos:
--  1. trademap_companies: sem RLS → adicionado SELECT público, write só service_role
--  2. user_usage: "Service role manages usage" sem TO clause → restrito a service_role
--  3. profiles: "Service role manages profiles" sem TO clause → restrito a service_role
--  4. tariffs: admin policy permitia qualquer authenticated → restrito a service_role

-- ── 1. trademap_companies ─────────────────────────────────────
ALTER TABLE public.trademap_companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read trademap" ON public.trademap_companies;
CREATE POLICY "Allow read trademap" ON public.trademap_companies
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role manages trademap" ON public.trademap_companies;
CREATE POLICY "Service role manages trademap" ON public.trademap_companies
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── 2. user_usage: corrigir política aberta ─────────────────
DROP POLICY IF EXISTS "Service role can manage usage" ON public.user_usage;
DROP POLICY IF EXISTS "Service role manages usage" ON public.user_usage;

CREATE POLICY "Service role manages usage" ON public.user_usage
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── 3. profiles: corrigir política aberta ───────────────────
DROP POLICY IF EXISTS "Service role manages profiles" ON public.profiles;

CREATE POLICY "Service role manages profiles" ON public.profiles
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── 4. tariffs: restringir admin a service_role ─────────────
DROP POLICY IF EXISTS "Allow admin tariffs" ON tariffs;

CREATE POLICY "Allow admin tariffs" ON tariffs
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── 5. Garantir políticas de usuário em profiles ────────────
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- ── 6. Garantir políticas de usuário em user_usage ──────────
DROP POLICY IF EXISTS "Users can view own usage" ON public.user_usage;
CREATE POLICY "Users can view own usage" ON public.user_usage
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own usage" ON public.user_usage;
CREATE POLICY "Users can update own usage" ON public.user_usage
    FOR UPDATE USING (auth.uid() = user_id);

-- ── Verificação final ────────────────────────────────────────
-- Lista todas as políticas ativas depois da correção:
-- SELECT tablename, policyname, cmd, roles FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;
