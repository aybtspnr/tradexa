-- ═══════════════════════════════════════════
-- TRADEXA — Correção DB (Execute no Supabase SQL Editor)
-- Resolve: erro 409 no user_usage + colunas do Settings
-- ═══════════════════════════════════════════

-- ── 1. Tabela user_usage (sistema de uso por percentagem) ──
CREATE TABLE IF NOT EXISTS public.user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL DEFAULT 'essential',
  used_percent NUMERIC NOT NULL DEFAULT 0,
  tank_percent NUMERIC NOT NULL DEFAULT 100,
  reset_date TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),
  updated_at TIMESTAMPTZ DEFAULT now(),
  ai_queries_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Garantir 1 row por usuário
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_usage_user_id_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_user_usage_user_id_unique ON public.user_usage(user_id);
  END IF;
END $$;

-- ── 2. RLS ──
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own usage" ON public.user_usage;
CREATE POLICY "Users can read own usage" ON public.user_usage
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own usage" ON public.user_usage;
CREATE POLICY "Users can insert own usage" ON public.user_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own usage" ON public.user_usage;
CREATE POLICY "Users can update own usage" ON public.user_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- ── 3. Permissões ──
GRANT ALL ON public.user_usage TO authenticated, service_role;

-- ── 4. Trigger: criar user_usage automaticamente ao registrar ──
CREATE OR REPLACE FUNCTION public.handle_new_user_usage()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_usage (user_id, plan_type, used_percent, tank_percent)
  VALUES (NEW.id, 'essential', 0, 100)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_usage ON auth.users;
CREATE TRIGGER on_auth_user_created_usage
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_usage();

-- ── 5. Colunas no profiles (Settings: idioma + notificações) ──
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS language text DEFAULT 'pt-BR';

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS notifications_enabled boolean DEFAULT true;

-- ── 6. Criar user_usage para usuários existentes que não têm ──
INSERT INTO public.user_usage (user_id, plan_type, used_percent, tank_percent)
SELECT id, 'essential', 0, 100
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_usage uu WHERE uu.user_id = au.id
);
