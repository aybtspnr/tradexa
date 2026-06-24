-- Add perguntas_respostas column to ncm_searches table
ALTER TABLE public.ncm_searches 
ADD COLUMN IF NOT EXISTS perguntas_respostas JSONB DEFAULT '[]'::jsonb;

-- Update the comment for documentation
COMMENT ON COLUMN public.ncm_searches.perguntas_respostas IS 'Array of {pergunta, resposta} objects from the AI clarification step';