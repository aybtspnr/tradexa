-- ============================================
-- TRADEXA: Migração — Adicionar colunas na tabela profiles
-- Execute no SQL Editor do Supabase
-- ============================================

-- 1. Idioma do usuário
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS language text DEFAULT 'pt-BR';

-- 2. Preferência de notificações
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS notifications_enabled boolean DEFAULT true;

-- 3. Verificar se as colunas foram criadas
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('language', 'notifications_enabled');
