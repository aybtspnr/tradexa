-- Create hts_codes table for local HTS lookup
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS hts_codes (
  id BIGSERIAL PRIMARY KEY,
  htsno TEXT,
  indent INTEGER DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  general TEXT,
  special TEXT,
  other TEXT,
  units JSONB DEFAULT '[]'::jsonb,
  footnotes JSONB,
  quota_quantity TEXT,
  additional_duties TEXT,
  superior BOOLEAN DEFAULT FALSE,
  chapter TEXT GENERATED ALWAYS AS (NULLIF(LEFT(NULLIF(htsno, ''), 2), '')) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hts_codes_htsno ON hts_codes (htsno);
CREATE INDEX IF NOT EXISTS idx_hts_codes_chapter ON hts_codes (chapter);
CREATE INDEX IF NOT EXISTS idx_hts_codes_desc_trgm ON hts_codes USING gin (description gin_trgm_ops);

ALTER TABLE hts_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS hts_codes_select_anon ON hts_codes;
CREATE POLICY hts_codes_select_anon ON hts_codes FOR SELECT USING (true);
