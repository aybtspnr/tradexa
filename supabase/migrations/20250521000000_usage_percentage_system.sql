-- Migration: Sistema de Percentagem de Uso (substitui créditos)
-- Cada ação consome % do tank mensal. O usuário vê uma barra 0-100%.

-- 1. Criar tabela user_usage (se não existir)
CREATE TABLE IF NOT EXISTS public.user_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL DEFAULT 'starter' CHECK (plan_type IN ('starter', 'professional', 'enterprise')),
    used_percent NUMERIC(10,2) NOT NULL DEFAULT 0,
    tank_percent NUMERIC(10,2) NOT NULL DEFAULT 100,
    reset_date TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON public.user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_reset_date ON public.user_usage(reset_date);

-- 3. RLS
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own usage" ON public.user_usage;
CREATE POLICY "Users can view own usage" ON public.user_usage
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own usage" ON public.user_usage;
CREATE POLICY "Users can update own usage" ON public.user_usage
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage usage" ON public.user_usage;
CREATE POLICY "Service role can manage usage" ON public.user_usage
    FOR ALL USING (true) WITH CHECK (true);

-- 4. Função: reset mensal automático
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS void AS $$
BEGIN
    UPDATE public.user_usage
    SET used_percent = 0,
        reset_date = now() + interval '30 days',
        updated_at = now()
    WHERE reset_date < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Função: criar user_usage ao inserir user_credits (fallback compat)
CREATE OR REPLACE FUNCTION public.create_user_usage()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_usage (user_id, plan_type, tank_percent, reset_date)
    VALUES (
        NEW.user_id,
        COALESCE(NEW.plan_type, 'starter'),
        CASE COALESCE(NEW.plan_type, 'starter')
            WHEN 'starter' THEN 100
            WHEN 'professional' THEN 500
            WHEN 'enterprise' THEN 999999
            ELSE 100
        END,
        now() + interval '30 days'
    )
    ON CONFLICT (user_id) DO UPDATE SET
        plan_type = EXCLUDED.plan_type,
        tank_percent = EXCLUDED.tank_percent,
        updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para manter user_usage sincronizado com user_credits
DROP TRIGGER IF EXISTS sync_usage_on_credits ON public.user_credits;
CREATE TRIGGER sync_usage_on_credits
    AFTER INSERT OR UPDATE ON public.user_credits
    FOR EACH ROW EXECUTE FUNCTION public.create_user_usage();

-- 6. Migrar dados existentes de user_credits → user_usage
INSERT INTO public.user_usage (user_id, plan_type, used_percent, tank_percent, reset_date)
SELECT
    uc.user_id,
    COALESCE(uc.plan_type, 'starter'),
    LEAST(uc.used_this_month * 1.0, 500), -- estimativa: 1 crédito ≈ 1%
    CASE COALESCE(uc.plan_type, 'starter')
        WHEN 'starter' THEN 100
        WHEN 'professional' THEN 500
        WHEN 'enterprise' THEN 999999
        ELSE 100
    END,
    COALESCE(uc.reset_date, now() + interval '30 days')
FROM public.user_credits uc
ON CONFLICT (user_id) DO NOTHING;

-- 7. Grant
GRANT ALL ON public.user_usage TO authenticated, service_role;
