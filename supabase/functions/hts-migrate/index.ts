import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { action } = await req.json()
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (action === 'create_table') {
      // Create the hts_codes table
      const sql = `
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

        CREATE INDEX IF NOT EXISTS idx_hts_codes_htsno ON hts_codes USING btree (htsno);
        CREATE INDEX IF NOT EXISTS idx_hts_codes_chapter ON hts_codes USING btree (chapter);
        CREATE INDEX IF NOT EXISTS idx_hts_codes_desc_trgm ON hts_codes USING gin (description gin_trgm_ops);

        ALTER TABLE hts_codes ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS hts_codes_select_anon ON hts_codes;
        CREATE POLICY hts_codes_select_anon ON hts_codes FOR SELECT USING (true);
      `;

      const { error } = await supabase.rpc('exec_sql', { query: sql });
      if (error) {
        // Fallback: try direct SQL via pg client
        throw error;
      }
      return new Response(JSON.stringify({ success: true, message: 'Table created' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'insert_batch') {
      const { records } = await req.json()
      
      // Insert in batch
      const { data, error } = await supabase.from('hts_codes').insert(records).select('count')
      if (error) throw error

      return new Response(JSON.stringify({ success: true, count: records.length }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'count') {
      const { count, error } = await supabase.from('hts_codes').select('*', { count: 'exact', head: true })
      if (error) throw error
      return new Response(JSON.stringify({ success: true, count }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 })
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
