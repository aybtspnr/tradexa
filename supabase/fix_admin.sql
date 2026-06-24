-- FIX SIMPLIFICADO — rode no SQL Editor do Supabase

-- 1. Criar tabela user_usage (se não existir)
CREATE TABLE IF NOT EXISTS public.user_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL DEFAULT 'essential',
    used_percent NUMERIC(10,2) NOT NULL DEFAULT 0,
    tank_percent NUMERIC(10,2) NOT NULL DEFAULT 100,
    reset_date TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    ai_queries_used INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON public.user_usage(user_id);

-- 2. Garantir colunas em profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'essential';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'client';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name TEXT;

-- 3. RLS user_usage
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own usage" ON public.user_usage;
CREATE POLICY "Users can view own usage" ON public.user_usage FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own usage" ON public.user_usage;
CREATE POLICY "Users can update own usage" ON public.user_usage FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Service role manages usage" ON public.user_usage;
CREATE POLICY "Service role manages usage" ON public.user_usage FOR ALL USING (true) WITH CHECK (true);

-- 4. RLS profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Service role manages profiles" ON public.profiles;
CREATE POLICY "Service role manages profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- 5. Função para atualizar plano
CREATE OR REPLACE FUNCTION public.set_user_plan(target_user_id UUID, new_plan_type TEXT)
RETURNS TEXT AS $$
BEGIN
    UPDATE public.profiles SET plan_type = new_plan_type WHERE id = target_user_id;
    INSERT INTO public.user_usage (user_id, plan_type, used_percent, tank_percent, reset_date)
    VALUES (target_user_id, new_plan_type, 0, CASE WHEN new_plan_type = 'enterprise' THEN 999999 ELSE 100 END, NOW() + INTERVAL '30 days')
    ON CONFLICT (user_id) DO UPDATE SET
        plan_type = EXCLUDED.plan_type, used_percent = 0, tank_percent = EXCLUDED.tank_percent,
        reset_date = NOW() + INTERVAL '30 days', updated_at = NOW();
    RETURN 'OK';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.set_user_plan(UUID, TEXT) TO authenticated, service_role;

-- 6. Corrigir dados
UPDATE public.profiles SET plan_type = 'essential' WHERE plan_type IS NULL;
UPDATE public.profiles SET role = 'client' WHERE role IS NULL;

-- 7. Atualizar lacupulaurubici@gmail.com
DO $$
DECLARE target_id UUID;
BEGIN
    SELECT au.id INTO target_id FROM auth.users au WHERE au.email = 'lacupulaurubici@gmail.com';
    IF target_id IS NOT NULL THEN
        UPDATE public.profiles SET plan_type = 'professional', role = 'client' WHERE id = target_id;
        INSERT INTO public.user_usage (user_id, plan_type, used_percent, tank_percent, reset_date)
        VALUES (target_id, 'professional', 0, 100, NOW() + INTERVAL '30 days')
        ON CONFLICT (user_id) DO UPDATE SET
            plan_type = 'professional', used_percent = 0, tank_percent = 100,
            reset_date = NOW() + INTERVAL '30 days', updated_at = NOW();
    END IF;
END $$;

-- 8. Grants
GRANT ALL ON public.profiles TO authenticated, service_role;
GRANT ALL ON public.user_usage TO authenticated, service_role;
