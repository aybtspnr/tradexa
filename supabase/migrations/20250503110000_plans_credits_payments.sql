-- ═══════════════════════════════════════════════════════════
-- Plans + Credits + Payments + API Usage Logs Migration
-- ═══════════════════════════════════════════════════════════

-- ─── PLANS TABLE ───
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  credits_monthly INTEGER NOT NULL DEFAULT 0,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default plans
INSERT INTO public.plans (slug, name, description, price_cents, credits_monthly, features, display_order)
VALUES
  ('starter', 'Starter', 'Ideal para iniciar no comércio exterior. 100 créditos/mês.', 0, 100, '["100 créditos/mês","Classificador IA","Consulta HS","Suporte básico"]', 1),
  ('professional', 'Professional', 'Para empresas em crescimento. 1.000 créditos/mês.', 29900, 1000, '["1.000 créditos/mês","Todas ferramentas","Relatórios avançados","Suporte prioritário"]', 2),
  ('enterprise', 'Enterprise', 'Créditos ilimitados + recursos exclusivos.', 99900, -1, '["Créditos ilimitados","API completa","White-label","Account manager dedicado"]', 3)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_cents = EXCLUDED.price_cents,
  credits_monthly = EXCLUDED.credits_monthly,
  features = EXCLUDED.features,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- ─── USER_CREDITS TABLE ───
CREATE TABLE IF NOT EXISTS public.user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
  credits INTEGER NOT NULL DEFAULT 0,
  plan_type TEXT NOT NULL DEFAULT 'starter',
  monthly_limit INTEGER NOT NULL DEFAULT 0,
  used_this_month INTEGER NOT NULL DEFAULT 0,
  reset_date TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 month',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PAYMENTS TABLE ───
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, refunded
  mercado_pago_id TEXT,
  payment_method TEXT,
  preference_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── API_USAGE_LOGS TABLE ───
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL,
  method TEXT DEFAULT 'GET',
  credits_used INTEGER NOT NULL DEFAULT 1,
  status TEXT DEFAULT 'success', -- success, failed, blocked
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── INDEXES ───
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_mp_id ON public.payments(mercado_pago_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON public.api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON public.api_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON public.api_usage_logs(endpoint);

-- ─── RLS ───
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Plans: everyone can view active plans
DROP POLICY IF EXISTS "Anyone can view active plans" ON public.plans;
CREATE POLICY "Anyone can view active plans" ON public.plans
  FOR SELECT TO authenticated USING (is_active = true);

-- Payments: users view own
DROP POLICY IF EXISTS "Users view own payments" ON public.payments;
CREATE POLICY "Users view own payments" ON public.payments
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Payments: users insert own
DROP POLICY IF EXISTS "Users insert own payments" ON public.payments;
CREATE POLICY "Users insert own payments" ON public.payments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Payments: service role all
DROP POLICY IF EXISTS "Service role manages payments" ON public.payments;
CREATE POLICY "Service role manages payments" ON public.payments
  FOR ALL TO service_role USING (true);

-- API usage: users view own
DROP POLICY IF EXISTS "Users view own api logs" ON public.api_usage_logs;
CREATE POLICY "Users view own api logs" ON public.api_usage_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- API usage: service role insert
DROP POLICY IF EXISTS "Service role inserts api logs" ON public.api_usage_logs;
CREATE POLICY "Service role inserts api logs" ON public.api_usage_logs
  FOR INSERT TO service_role WITH CHECK (true);

-- User credits policies
DROP POLICY IF EXISTS "Users can view own credits" ON public.user_credits;
CREATE POLICY "Users can view own credits" ON public.user_credits
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own credits" ON public.user_credits;
CREATE POLICY "Users can update own credits" ON public.user_credits
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage credits" ON public.user_credits;
CREATE POLICY "Service role can manage credits" ON public.user_credits
  FOR ALL TO service_role USING (true);

-- ─── HELPER FUNCTION: deduct_credit ───
CREATE OR REPLACE FUNCTION public.deduct_credit(p_user_id UUID, p_endpoint TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_credits INTEGER;
  v_plan_type TEXT;
  v_monthly_limit INTEGER;
  v_used INTEGER;
  v_new_credits INTEGER;
BEGIN
  -- Lock row
  SELECT credits, plan_type, monthly_limit, used_this_month
  INTO v_credits, v_plan_type, v_monthly_limit, v_used
  FROM public.user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User credits not found');
  END IF;

  -- Enterprise plan bypass
  IF v_plan_type = 'enterprise' OR v_credits = -1 THEN
    INSERT INTO public.api_usage_logs (user_id, endpoint, credits_used, status, metadata)
    VALUES (p_user_id, p_endpoint, 0, 'success', '{"plan":"enterprise"}'::jsonb);
    RETURN jsonb_build_object('success', true, 'credits_remaining', -1, 'plan', v_plan_type);
  END IF;

  IF v_credits <= 0 THEN
    INSERT INTO public.api_usage_logs (user_id, endpoint, credits_used, status, metadata)
    VALUES (p_user_id, p_endpoint, 0, 'blocked', '{"reason":"insufficient_credits"}'::jsonb);
    RETURN jsonb_build_object('success', false, 'error', 'Créditos insuficientes', 'credits_remaining', v_credits);
  END IF;

  v_new_credits := v_credits - 1;

  UPDATE public.user_credits
  SET credits = v_new_credits,
      used_this_month = v_used + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  INSERT INTO public.api_usage_logs (user_id, endpoint, credits_used, status, metadata)
  VALUES (p_user_id, p_endpoint, 1, 'success', jsonb_build_object('remaining', v_new_credits));

  RETURN jsonb_build_object('success', true, 'credits_remaining', v_new_credits, 'plan', v_plan_type);
END;
$$;

-- ─── HELPER FUNCTION: add_credits ───
CREATE OR REPLACE FUNCTION public.add_credits(p_user_id UUID, p_amount INTEGER, p_plan_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current INTEGER;
  v_plan_type TEXT;
BEGIN
  SELECT credits, plan_type INTO v_current, v_plan_type
  FROM public.user_credits WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.user_credits (user_id, credits, plan_type, monthly_limit)
    VALUES (p_user_id, p_amount, COALESCE((SELECT slug FROM public.plans WHERE id = p_plan_id), 'starter'), p_amount);
    RETURN jsonb_build_object('success', true, 'credits', p_amount);
  END IF;

  -- Enterprise never changes
  IF v_plan_type = 'enterprise' THEN
    RETURN jsonb_build_object('success', true, 'credits', -1, 'note', 'Enterprise plan unchanged');
  END IF;

  UPDATE public.user_credits
  SET credits = credits + p_amount,
      monthly_limit = monthly_limit + p_amount,
      plan_id = COALESCE(p_plan_id, plan_id),
      updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object('success', true, 'credits', v_current + p_amount);
END;
$$;

-- ─── TRIGGER: auto-create credits for new users ───
CREATE OR REPLACE FUNCTION public.create_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_starter_plan UUID;
BEGIN
  SELECT id INTO v_starter_plan FROM public.plans WHERE slug = 'starter' LIMIT 1;

  INSERT INTO public.user_credits (user_id, plan_id, credits, plan_type, monthly_limit)
  VALUES (
    NEW.id,
    v_starter_plan,
    100,
    'starter',
    100
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_credits();

-- ─── BACKFILL EXISTING USERS ───
INSERT INTO public.user_credits (user_id, credits, plan_type, monthly_limit, used_this_month)
SELECT p.id, 100, 'starter', 100, 0
FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.user_credits uc WHERE uc.user_id = p.id)
ON CONFLICT (user_id) DO UPDATE SET
  credits = 100,
  monthly_limit = 100,
  updated_at = NOW();

-- Grant usage
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON public.plans TO anon, authenticated;
GRANT ALL ON public.user_credits TO authenticated, service_role;
GRANT ALL ON public.payments TO authenticated, service_role;
GRANT ALL ON public.api_usage_logs TO authenticated, service_role;
