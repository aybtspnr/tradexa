-- Migration: Criar tabela cache para dados TradeMap
-- Isso armazena importadores/exportadores reais do ITC TradeMap

CREATE TABLE IF NOT EXISTS public.trademap_companies (
  id SERIAL PRIMARY KEY,
  trade_map_id TEXT NOT NULL,
  name TEXT NOT NULL,
  city TEXT,
  country_code TEXT NOT NULL,          -- código ITC. Ex: 076=BRA, 842=USA
  country_iso TEXT,                    -- ISO3. Ex: BRA, USA
  activities TEXT[],                   -- ['Importer','Exporter']
  website TEXT,
  annual_turnover NUMERIC,
  number_of_employees TEXT,
  products_total INTEGER,
  products_top TEXT,
  partners_total INTEGER,
  partners_top TEXT,
  source_id INTEGER,
  trade_flow TEXT,                     -- 'I'=import, 'E'=export
  product_code TEXT,                   -- HS code ou 'ALL'
  product_type TEXT,                   -- 'p'=product
  fetched_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(trade_map_id, country_code, product_code, trade_flow)
);

CREATE INDEX idx_trademap_country ON public.trademap_companies(country_code);
CREATE INDEX idx_trademap_name ON public.trademap_companies USING gin(to_tsvector('simple', name));
CREATE INDEX idx_trademap_city ON public.trademap_companies(city);
CREATE INDEX idx_trademap_activities ON public.trademap_companies USING gin(activities);
CREATE INDEX idx_trademap_fetched ON public.trademap_companies(fetched_at);

COMMENT ON TABLE public.trademap_companies IS 'Cache de empresas importadoras/exportadoras do ITC TradeMap. Atualização via script Python.';
