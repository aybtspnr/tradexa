-- Create user_credits table
CREATE TABLE IF NOT EXISTS public.user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  credits INTEGER DEFAULT 100 NOT NULL,
  plan_type TEXT DEFAULT 'starter' NOT NULL,
  monthly_limit INTEGER DEFAULT 100 NOT NULL,
  used_this_month INTEGER DEFAULT 0 NOT NULL,
  reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 month',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own credits" ON public.user_credits
  FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits" ON public.user_credits
  FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage credits" ON public.user_credits
  FOR ALL TO service_role 
  USING (true);

-- Create function to auto-create credits for new users
CREATE OR REPLACE FUNCTION public.create_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits, plan_type, monthly_limit)
  VALUES (
    NEW.id,
    100,
    'starter',
    100
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_credits();

-- Add credits to existing users
INSERT INTO public.user_credits (user_id, credits, plan_type, monthly_limit, used_this_month)
SELECT 
  p.id,
  100,
  'starter',
  100,
  0
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_credits uc WHERE uc.user_id = p.id
)
ON CONFLICT (user_id) DO UPDATE SET
  credits = 100,
  monthly_limit = 100,
  used_this_month = 0,
  updated_at = NOW();

-- Verify
SELECT 
  uc.credits,
  uc.monthly_limit,
  p.email,
  p.company_name
FROM public.user_credits uc
JOIN public.profiles p ON p.id = uc.user_id;