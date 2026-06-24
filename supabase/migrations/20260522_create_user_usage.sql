-- Create user_usage table for the percentage-based usage system
CREATE TABLE IF NOT EXISTS public.user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan_type TEXT NOT NULL DEFAULT 'essential',
  used_percent NUMERIC NOT NULL DEFAULT 0,
  tank_percent NUMERIC NOT NULL DEFAULT 100,
  reset_date TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),
  updated_at TIMESTAMPTZ DEFAULT now(),
  ai_queries_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- Policy: users can read their own usage
CREATE POLICY "Users can read own usage" ON public.user_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: users can update their own usage
CREATE POLICY "Users can update own usage" ON public.user_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: users can insert their own usage
CREATE POLICY "Users can insert own usage" ON public.user_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger: auto-create usage row for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_usage()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_usage (user_id, plan_type, used_percent, tank_percent)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'plan_type', 'essential'), 0, 100);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created_usage ON auth.users;

CREATE TRIGGER on_auth_user_created_usage
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_usage();
