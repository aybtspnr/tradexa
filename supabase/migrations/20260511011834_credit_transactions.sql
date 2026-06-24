-- Migration: credit_transactions table
-- Histórico de transações de créditos (entradas e saídas)

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL DEFAULT 'credit', -- 'credit' ou 'debit'
  description TEXT,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);

-- RLS
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Policies: usuário pode ver suas próprias transações
DROP POLICY IF EXISTS "Users can view own credit transactions" ON public.credit_transactions;
CREATE POLICY "Users can view own credit transactions"
  ON public.credit_transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Service role pode inserir (usado pelo webhook)
DROP POLICY IF EXISTS "Service role can insert credit transactions" ON public.credit_transactions;
CREATE POLICY "Service role can insert credit transactions"
  ON public.credit_transactions
  FOR INSERT
  TO service_role
  WITH CHECK (true);
