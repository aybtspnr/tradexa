-- ═══════════════════════════════════════════════════════════
-- Admin Panel: RLS Policies + Admin Functions
-- Execute this SQL no SQL Editor do Supabase Dashboard
-- ═══════════════════════════════════════════════════════════

-- Helper function: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════
-- 1. PROFILES — admin policies
-- ═══════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    auth.role() = 'authenticated' AND public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND public.is_admin()
  );

-- ═══════════════════════════════════════════════════════════
-- 2. USER_USAGE — admin policies
-- ═══════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Admins can view all usage" ON public.user_usage;
CREATE POLICY "Admins can view all usage" ON public.user_usage
  FOR SELECT USING (
    auth.role() = 'authenticated' AND public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can update all usage" ON public.user_usage;
CREATE POLICY "Admins can update all usage" ON public.user_usage
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND public.is_admin()
  );

-- ═══════════════════════════════════════════════════════════
-- 3. API_USAGE_LOGS — admin can view all
-- ═══════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Admins can view all api logs" ON public.api_usage_logs;
CREATE POLICY "Admins can view all api logs" ON public.api_usage_logs
  FOR SELECT USING (
    auth.role() = 'authenticated' AND public.is_admin()
  );

-- ═══════════════════════════════════════════════════════════
-- 4. PAYMENTS — admin can view all
-- ═══════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT USING (
    auth.role() = 'authenticated' AND public.is_admin()
  );

-- ═══════════════════════════════════════════════════════════
-- 5. ADMIN FUNCTION: update user usage fields
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.admin_update_user_usage(
  target_user_id UUID,
  new_plan_type TEXT DEFAULT NULL,
  new_used_percent NUMERIC DEFAULT NULL,
  new_tank_percent NUMERIC DEFAULT NULL,
  new_reset_date TIMESTAMPTZ DEFAULT NULL,
  new_role TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem executar esta função';
  END IF;

  IF new_plan_type IS NOT NULL OR new_role IS NOT NULL THEN
    UPDATE public.profiles
    SET
      plan_type = COALESCE(new_plan_type, plan_type),
      role = COALESCE(new_role, role),
      updated_at = NOW()
    WHERE id = target_user_id;
  END IF;

  UPDATE public.user_usage
  SET
    plan_type = COALESCE(new_plan_type, plan_type),
    used_percent = COALESCE(new_used_percent, used_percent),
    tank_percent = COALESCE(new_tank_percent, tank_percent),
    reset_date = COALESCE(new_reset_date, reset_date),
    updated_at = NOW()
  WHERE user_id = target_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.user_usage (user_id, plan_type, used_percent, tank_percent, reset_date)
    VALUES (
      target_user_id,
      COALESCE(new_plan_type, 'essential'),
      COALESCE(new_used_percent, 0),
      COALESCE(new_tank_percent, 100),
      COALESCE(new_reset_date, NOW() + INTERVAL '30 days')
    );
  END IF;

  result := jsonb_build_object('success', true, 'message', 'Usuário atualizado com sucesso');
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.admin_update_user_usage(UUID, TEXT, NUMERIC, NUMERIC, TIMESTAMPTZ, TEXT) TO authenticated;

-- ═══════════════════════════════════════════════════════════
-- 6. ADMIN FUNCTION: get aggregated usage logs per user
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.admin_get_usage_summary(
  days_limit INTEGER DEFAULT 30
)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  company_name TEXT,
  total_calls BIGINT,
  unique_endpoints BIGINT,
  last_activity TIMESTAMPTZ,
  plan_type TEXT,
  used_percent NUMERIC,
  tank_percent NUMERIC
) AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Apenas administradores';
  END IF;

  RETURN QUERY
  SELECT
    uu.user_id,
    p.email,
    p.company_name,
    COUNT(al.id)::BIGINT AS total_calls,
    COUNT(DISTINCT al.endpoint)::BIGINT AS unique_endpoints,
    MAX(al.created_at) AS last_activity,
    uu.plan_type,
    uu.used_percent,
    uu.tank_percent
  FROM public.user_usage uu
  LEFT JOIN public.profiles p ON p.id = uu.user_id
  LEFT JOIN public.api_usage_logs al ON al.user_id = uu.user_id
    AND al.created_at >= NOW() - (days_limit || ' days')::INTERVAL
  GROUP BY uu.user_id, p.email, p.company_name, uu.plan_type, uu.used_percent, uu.tank_percent
  ORDER BY total_calls DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.admin_get_usage_summary(INTEGER) TO authenticated;

-- ═══════════════════════════════════════════════════════════
-- 7. ADMIN FUNCTION: get dashboard KPIs
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.admin_get_dashboard_kpis()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  total_users INTEGER;
  total_admins INTEGER;
  plan_distribution JSONB;
  total_api_calls BIGINT;
  total_payments NUMERIC;
  avg_usage NUMERIC;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Apenas administradores';
  END IF;

  SELECT COUNT(*) INTO total_users FROM auth.users;
  SELECT COUNT(*) INTO total_admins FROM public.profiles WHERE role = 'admin';

  SELECT jsonb_agg(jsonb_build_object('plan', plan_type, 'count', cnt))
  INTO plan_distribution
  FROM (
    SELECT COALESCE(plan_type, 'essential') AS plan_type, COUNT(*)::INTEGER AS cnt
    FROM public.user_usage
    GROUP BY plan_type
    UNION ALL
    SELECT 'sem_uso'::TEXT, COUNT(*)::INTEGER
    FROM auth.users au
    WHERE NOT EXISTS (SELECT 1 FROM public.user_usage uu WHERE uu.user_id = au.id)
  ) sub;

  SELECT COUNT(*) INTO total_api_calls
  FROM public.api_usage_logs
  WHERE created_at >= NOW() - INTERVAL '30 days';

  SELECT COALESCE(SUM(amount_cents), 0) INTO total_payments
  FROM public.payments
  WHERE status = 'approved';

  SELECT COALESCE(AVG(used_percent), 0) INTO avg_usage
  FROM public.user_usage;

  result := jsonb_build_object(
    'total_users', total_users,
    'total_admins', total_admins,
    'plan_distribution', COALESCE(plan_distribution, '[]'::jsonb),
    'total_api_calls_30d', total_api_calls,
    'total_payments_cents', total_payments,
    'avg_usage_percent', ROUND(avg_usage::NUMERIC, 1)
  );
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.admin_get_dashboard_kpis() TO authenticated;
