-- TradeXa Importers Schema
-- Criado: 2025-05-07
-- Sem referências externas. Fonte: TradeXa Intelligence Database

-- Tabela principal de importadores
CREATE TABLE IF NOT EXISTS importers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  hs_chapter text NOT NULL,        -- 2 dígitos: '01', '61', '84'
  category text,                   -- nome da categoria do produto
  products_count integer,          -- quantas categorias a empresa importa
  employees integer,               -- número de funcionários
  country text NOT NULL,
  city text,
  source text DEFAULT 'tradexa_intelligence',
  created_at timestamptz DEFAULT now()
);

-- Índices essenciais para performance
CREATE INDEX IF NOT EXISTS idx_importers_hs ON importers(hs_chapter);
CREATE INDEX IF NOT EXISTS idx_importers_hs_country ON importers(hs_chapter, country);
CREATE INDEX IF NOT EXISTS idx_importers_country ON importers(country);
CREATE INDEX IF NOT EXISTS idx_importers_employees ON importers(employees);

-- Busca textual (para o wizard)
CREATE INDEX IF NOT EXISTS idx_importers_name_search ON importers
  USING gin(to_tsvector('simple', company_name));

-- View pública: contagem agregada por HS e país (SEM RLS — preview gratuito)
CREATE OR REPLACE VIEW importer_counts AS
SELECT hs_chapter, country, COUNT(*) as company_count
FROM importers
GROUP BY hs_chapter, country
ORDER BY hs_chapter, company_count DESC;

-- Tabela de planos/assinaturas (simplificada)
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL CHECK (plan IN ('essential', 'professional', 'enterprise')),
  status text NOT NULL DEFAULT 'active',
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Feature flags por assinatura
CREATE TABLE IF NOT EXISTS subscription_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE CASCADE,
  feature text NOT NULL,
  enabled boolean DEFAULT false,
  UNIQUE (subscription_id, feature)
);

-- Tabela de leads (emails capturados no wizard gratuito)
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  hs_interests text[],
  countries_interests text[],
  source text DEFAULT 'wizard',
  created_at timestamptz DEFAULT now()
);

-- RLS: só mostra dados se tiver feature 'importers_directory' ativa
ALTER TABLE importers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "importers_for_paying_users" ON importers;
CREATE POLICY "importers_for_paying_users" ON importers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions s
      JOIN subscription_features sf ON sf.subscription_id = s.id
      WHERE s.user_id = auth.uid()
        AND s.status = 'active'
        AND sf.feature = 'importers_directory'
        AND sf.enabled = true
    )
  );

-- View pública: contagem total por HS chapter (para SEO / preview)
CREATE OR REPLACE VIEW importer_counts_by_hs AS
SELECT
  hs_chapter,
  COUNT(*) as total_companies,
  COUNT(DISTINCT country) as total_countries,
  SUM(CASE WHEN employees <= 50 THEN 1 ELSE 0 END) as small_companies,
  SUM(CASE WHEN employees > 50 AND employees <= 500 THEN 1 ELSE 0 END) as medium_companies,
  SUM(CASE WHEN employees > 500 THEN 1 ELSE 0 END) as large_companies
FROM importers
GROUP BY hs_chapter;

-- View: top países por HS chapter
CREATE OR REPLACE VIEW importer_top_countries AS
SELECT
  hs_chapter,
  country,
  company_count,
  ROW_NUMBER() OVER (PARTITION BY hs_chapter ORDER BY company_count DESC) as rank
FROM importer_counts;
