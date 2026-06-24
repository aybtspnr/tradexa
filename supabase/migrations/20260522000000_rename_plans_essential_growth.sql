-- Migration: Renomear planos para novo esquema TRADEXA
-- Data: 2026-05-22
-- De: starter/professional/enterprise
-- Para: essential/growth/professional/business/enterprise

-- 1. Remover constraint antiga
ALTER TABLE public.user_usage DROP CONSTRAINT IF EXISTS user_usage_plan_type_check;

-- 2. Atualizar valores existentes
UPDATE public.user_usage SET plan_type = 'essential'  WHERE plan_type = 'starter';
UPDATE public.user_usage SET plan_type = 'growth'     WHERE plan_type = 'professional' AND tank_percent = 100;
UPDATE public.user_usage SET plan_type = 'business'   WHERE plan_type = 'professional' AND tank_percent = 999999;
-- enterprise já está correto

-- 3. Normalizar tank_percent: 100 para todos exceto enterprise
UPDATE public.user_usage SET tank_percent = 100 WHERE plan_type != 'enterprise';
UPDATE public.user_usage SET tank_percent = 999999 WHERE plan_type = 'enterprise';

-- 4. Nova constraint
ALTER TABLE public.user_usage ADD CONSTRAINT user_usage_plan_type_check
    CHECK (plan_type IN ('essential', 'growth', 'professional', 'business', 'enterprise'));

-- 5. Atualizar trigger create_user_usage para usar novos nomes
CREATE OR REPLACE FUNCTION public.create_user_usage()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_usage (user_id, plan_type, tank_percent, reset_date)
    VALUES (
        NEW.user_id,
        COALESCE(NEW.plan_type, 'essential'),
        CASE COALESCE(NEW.plan_type, 'essential')
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

-- 6. Adicionar coluna ai_queries_used se não existir (contador de IA para Essential)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_usage' AND column_name = 'ai_queries_used'
    ) THEN
        ALTER TABLE public.user_usage ADD COLUMN ai_queries_used INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- 7. Grant
GRANT ALL ON public.user_usage TO authenticated, service_role;
