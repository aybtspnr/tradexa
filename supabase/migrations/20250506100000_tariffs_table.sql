-- Migration: tabela de tarifas MFN/preferenciais por país e HS6
-- Fonte: UNCTAD TRAINS, TARIC (UE), USITC HTS, MOFCOM China, SENASA AR, TURKSTAT, ALADI

CREATE TABLE IF NOT EXISTS tariffs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin      VARCHAR(3) NOT NULL,   -- país de origem (ISO3): BRA, USA, CHN, EU, ARG, TUR
  destination VARCHAR(3) NOT NULL,   -- país de destino (ISO3)
  hs6         VARCHAR(6) NOT NULL,   -- código HS 6 dígitos
  description TEXT,                   -- descrição do produto
  mfn_rate    NUMERIC(5,2) NOT NULL DEFAULT 0,  -- tarifa MFN (%)
  pref_rate   NUMERIC(5,2) DEFAULT NULL,        -- tarifa preferencial (%)
  agreement   VARCHAR(255) DEFAULT NULL,        -- nome do acordo comercial
  notes       TEXT DEFAULT NULL,                -- observações
  source      VARCHAR(50) NOT NULL DEFAULT 'UNCTAD', -- fonte dos dados
  year        SMALLINT DEFAULT 2025,            -- ano dos dados
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_tariffs_odh ON tariffs(origin, destination, hs6);
CREATE INDEX IF NOT EXISTS idx_tariffs_dest_hs ON tariffs(destination, hs6);
CREATE INDEX IF NOT EXISTS idx_tariffs_origin_hs ON tariffs(origin, hs6);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tariffs_unique ON tariffs(origin, destination, hs6, year);

-- RLS (apenas read para todos, write só admin)
ALTER TABLE tariffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read tariffs"
  ON tariffs FOR SELECT
  USING (true);

CREATE POLICY "Allow admin tariffs"
  ON tariffs FOR ALL
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_tariffs_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tariffs_updated ON tariffs;
CREATE TRIGGER trg_tariffs_updated
  BEFORE UPDATE ON tariffs
  FOR EACH ROW
  EXECUTE FUNCTION update_tariffs_timestamp();
