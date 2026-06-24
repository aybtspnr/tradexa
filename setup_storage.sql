-- Criar o bucket para documentos se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('quote-documents', 'quote-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Liberar acesso público para leitura
CREATE POLICY "Acesso Público para Leitura" ON storage.objects
FOR SELECT USING (bucket_id = 'quote-documents');

-- Liberar upload para usuários autenticados
CREATE POLICY "Upload para Autenticados" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'quote-documents');

-- Adicionar coluna de seguro na tabela de shipments se não existir
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shipments' AND column_name='insurance_url') THEN
    ALTER TABLE shipments ADD COLUMN insurance_url TEXT;
  END IF;
END $$;