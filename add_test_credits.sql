-- Simple update for existing users
UPDATE public.user_credits
SET 
  credits = 100,
  monthly_limit = 100,
  used_this_month = 0,
  updated_at = NOW();

-- Check results
SELECT 
  uc.credits,
  uc.monthly_limit,
  p.email,
  p.company_name
FROM public.user_credits uc
JOIN public.profiles p ON p.id = uc.user_id;