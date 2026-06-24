-- Atualizar lacupulaurubici@gmail.com para plano Professional
-- Tank continua 100%, mas custo das ações reduz (multiplicador 0.4×)

-- 1. Atualizar perfil
UPDATE public.profiles
SET plan_type = 'professional'
WHERE email = 'lacupulaurubici@gmail.com';

-- 2. Criar ou atualizar user_usage (tank = 100, used = 0 para começar do zero)
INSERT INTO public.user_usage (
  user_id,
  plan_type,
  used_percent,
  tank_percent,
  reset_date
)
SELECT 
  id,
  'professional',
  0,
  100,
  NOW() + INTERVAL '30 days'
FROM public.profiles
WHERE email = 'lacupulaurubici@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
  plan_type = 'professional',
  used_percent = 0,
  tank_percent = 100,
  reset_date = NOW() + INTERVAL '30 days',
  updated_at = NOW();

-- 3. Verificar
SELECT 
  p.email,
  p.plan_type,
  u.used_percent,
  u.tank_percent,
  u.reset_date
FROM public.profiles p
LEFT JOIN public.user_usage u ON u.user_id = p.id
WHERE p.email = 'lacupulaurubici@gmail.com';
