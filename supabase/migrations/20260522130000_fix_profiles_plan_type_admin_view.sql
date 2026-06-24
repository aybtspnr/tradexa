-- Migration: Corrigir plan_type em profiles + criar view admin
-- Data: 2026-05-22

-- 1. Garantir que profiles existe com plan_type
DO $$
BEGIN
    -- Verifica se a tabela profiles existe
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'profiles'
    ) THEN
        -- Adiciona plan_type se não existir
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'plan_type'
        ) THEN
            ALTER TABLE public.profiles ADD COLUMN plan_type TEXT DEFAULT 'essential';
        END IF;
    END IF;
END $$;

-- 2. Atualizar plan_type nulo para 'essential'
UPDATE public.profiles SET plan_type = 'essential' WHERE plan_type IS NULL;

-- 3. Criar view admin para gerenciar usuários e planos facilmente
-- Esta view une auth.users + profiles + user_usage para visualização completa
DROP VIEW IF EXISTS public.admin_user_plans;
CREATE OR REPLACE VIEW public.admin_user_plans AS
SELECT 
    au.id AS user_id,
    au.email,
    au.created_at AS user_created_at,
    au.last_sign_in_at,
    COALESCE(p.plan_type, 'essential') AS plan_type,
    p.company_name,
    p.phone,
    COALESCE(uu.used_percent, 0) AS used_percent,
    COALESCE(uu.tank_percent, 100) AS tank_percent,
    uu.reset_date,
    uu.ai_queries_used
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
LEFT JOIN public.user_usage uu ON uu.user_id = au.id;

-- 4. Grant para service_role poder ver tudo (admin via Supabase Dashboard)
GRANT SELECT ON public.admin_user_plans TO authenticated, service_role;

-- 5. Criar função para atualizar plano de qualquer usuário (usada no dashboard/admin)
CREATE OR REPLACE FUNCTION public.set_user_plan(
    target_user_id UUID,
    new_plan_type TEXT
)
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    -- Atualiza profiles
    UPDATE public.profiles 
    SET plan_type = new_plan_type 
    WHERE id = target_user_id;
    
    -- Atualiza ou cria user_usage
    INSERT INTO public.user_usage (user_id, plan_type, used_percent, tank_percent, reset_date)
    VALUES (
        target_user_id,
        new_plan_type,
        0,
        CASE WHEN new_plan_type = 'enterprise' THEN 999999 ELSE 100 END,
        NOW() + INTERVAL '30 days'
    )
    ON CONFLICT (user_id) DO UPDATE SET
        plan_type = EXCLUDED.plan_type,
        used_percent = 0,
        tank_percent = EXCLUDED.tank_percent,
        reset_date = NOW() + INTERVAL '30 days',
        updated_at = NOW();
    
    result := 'Plano atualizado para ' || new_plan_type || ' no usuário ' || target_user_id::TEXT;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant para authenticated e service_role
GRANT EXECUTE ON FUNCTION public.set_user_plan(UUID, TEXT) TO authenticated, service_role;

-- 6. Inserir/atualizar user_usage para lacupulaurubici@gmail.com
DO $$
DECLARE
    target_id UUID;
BEGIN
    SELECT au.id INTO target_id
    FROM auth.users au
    WHERE au.email = 'lacupulaurubici@gmail.com';
    
    IF target_id IS NOT NULL THEN
        -- Atualiza profiles
        UPDATE public.profiles SET plan_type = 'professional' WHERE id = target_id;
        
        -- Cria/atualiza user_usage
        INSERT INTO public.user_usage (user_id, plan_type, used_percent, tank_percent, reset_date)
        VALUES (target_id, 'professional', 0, 100, NOW() + INTERVAL '30 days')
        ON CONFLICT (user_id) DO UPDATE SET
            plan_type = 'professional',
            used_percent = 0,
            tank_percent = 100,
            reset_date = NOW() + INTERVAL '30 days',
            updated_at = NOW();
    END IF;
END $$;
