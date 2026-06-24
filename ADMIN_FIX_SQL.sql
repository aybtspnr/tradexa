-- COPIE E COLE ISSO NO SQL EDITOR DO SUPABASE DASHBOARD

-- 1. Criar tabela user_usage (sistema de percentagem)
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
CREATE INDEX IF NOT EXISTS idx_user_usage_reset_date ON public.user_usage(reset_date);

-- RLS user_usage
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_usage' AND policyname = 'Users can view own usage') THEN
        CREATE POLICY "Users can view own usage" ON public.user_usage FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_usage' AND policyname = 'Users can update own usage') THEN
        CREATE POLICY "Users can update own usage" ON public.user_usage FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_usage' AND policyname = 'Service role manages usage') THEN
        CREATE POLICY "Service role manages usage" ON public.user_usage FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 2. Garantir colunas em profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'plan_type') THEN
        ALTER TABLE public.profiles ADD COLUMN plan_type TEXT DEFAULT 'essential';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'client';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'company_name') THEN
        ALTER TABLE public.profiles ADD COLUMN company_name TEXT;
    END IF;
END $$;

-- RLS profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile') THEN
        CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile') THEN
        CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Service role manages profiles') THEN
        CREATE POLICY "Service role manages profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 3. Função set_user_plan (admin)
CREATE OR REPLACE FUNCTION public.set_user_plan(target_user_id UUID, new_plan_type TEXT)
RETURNS TEXT AS $$
BEGIN
    UPDATE public.profiles SET plan_type = new_plan_type WHERE id = target_user_id;
    INSERT INTO public.user_usage (user_id, plan_type, used_percent, tank_percent, reset_date)
    VALUES (target_user_id, new_plan_type, 0, CASE WHEN new_plan_type = 'enterprise' THEN 999999 ELSE 100 END, NOW() + INTERVAL '30 days')
    ON CONFLICT (user_id) DO UPDATE SET
        plan_type = EXCLUDED.plan_type, used_percent = 0, tank_percent = EXCLUDED.tank_percent,
        reset_date = NOW() + INTERVAL '30 days', updated_at = NOW();
    RETURN 'Plano atualizado para ' || new_plan_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.set_user_plan(UUID, TEXT) TO authenticated, service_role;

-- 4. View admin
CREATE OR REPLACE VIEW public.admin_user_plans AS
SELECT
    au.id AS user_id, au.email, au.created_at AS user_created_at, au.last_sign_in_at,
    COALESCE(p.plan_type, 'essential') AS plan_type, p.company_name, p.role,
    COALESCE(uu.used_percent, 0) AS used_percent, COALESCE(uu.tank_percent, 100) AS tank_percent,
    uu.reset_date, uu.ai_queries_used
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
LEFT JOIN public.user_usage uu ON uu.user_id = au.id;

GRANT SELECT ON public.admin_user_plans TO authenticated, service_role;

-- 5. Corrigir dados nulos
UPDATE public.profiles SET plan_type = 'essential' WHERE plan_type IS NULL;
UPDATE public.profiles SET role = 'client' WHERE role IS NULL;

-- 6. Atualizar lacupulaurubici@gmail.com para professional
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

-- 7. Grants
GRANT ALL ON public.profiles TO authenticated, service_role;
GRANT ALL ON public.user_usage TO authenticated, service_role;
