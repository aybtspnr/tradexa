-- Migration: Create freight_index table for WCI tracking
-- Run this in Supabase SQL Editor or via supabase db push

CREATE TABLE IF NOT EXISTS public.freight_index (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  wci_value NUMERIC NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert initial WCI value (Drewry composite, late May 2026)
INSERT INTO public.freight_index (wci_value) VALUES (2990);

-- Allow public read access
ALTER TABLE public.freight_index ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.freight_index 
  FOR SELECT USING (true);

-- Grant anon access
GRANT SELECT ON public.freight_index TO anon;
GRANT INSERT ON public.freight_index TO anon;  -- needed for API POST
