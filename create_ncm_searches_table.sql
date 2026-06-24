-- Create ncm_searches table for audit trail
CREATE TABLE IF NOT EXISTS public.ncm_searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ncm_code TEXT NOT NULL,
  product_description TEXT NOT NULL,
  material TEXT,
  finalidade TEXT,
  ai_suggestion TEXT,
  confianca_geral TEXT CHECK (confianca_geral IN ('alta', 'media', 'baixa')),
  confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ncm_searches ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own searches" ON public.ncm_searches
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own searches" ON public.ncm_searches
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all searches" ON public.ncm_searches
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_ncm_searches_user_id ON public.ncm_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_ncm_searches_created_at ON public.ncm_searches(created_at DESC);