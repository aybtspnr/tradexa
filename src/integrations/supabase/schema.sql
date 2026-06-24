-- Drop and recreate the handle_new_user function with proper role handling
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    role,
    company_name,
    cnpj,
    partner_type,
    coverage_type,
    modals,
    regions,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'cnpj', ''),
    NEW.raw_user_meta_data->>'partner_type',
    NEW.raw_user_meta_data->>'coverage_type',
    COALESCE(NEW.raw_user_meta_data->'modals', '[]'::jsonb),
    COALESCE(
      (
        SELECT jsonb_agg(trim(value))
        FROM jsonb_array_elements_text(
          COALESCE(NEW.raw_user_meta_data->'regions', '[]'::jsonb)
        ) AS arr(value)
        WHERE trim(value) <> ''
      ),
      '[]'::jsonb
    ),
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure profiles table has proper role check constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('client', 'client_national', 'partner', 'admin', 'trucker'));

-- Update RLS policies for profiles to allow client_national
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Ensure trucker_bids table has proper RLS
DROP POLICY IF EXISTS "Truckers can create bids" ON public.trucker_bids;
CREATE POLICY "Truckers can create bids"
  ON public.trucker_bids FOR INSERT
  WITH CHECK (auth.uid() = trucker_id);

DROP POLICY IF EXISTS "Clients can view bids on their quotes" ON public.trucker_bids;
CREATE POLICY "Clients can view bids on their quotes"
  ON public.trucker_bids FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quotes q 
      WHERE q.id = trucker_bids.quote_id 
      AND q.client_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Truckers can view their own bids" ON public.trucker_bids;
CREATE POLICY "Truckers can view their own bids"
  ON public.trucker_bids FOR SELECT
  USING (auth.uid() = trucker_id);

DROP POLICY IF EXISTS "Truckers can update their own bids" ON public.trucker_bids;
CREATE POLICY "Truckers can update their own bids"
  ON public.trucker_bids FOR UPDATE
  USING (auth.uid() = trucker_id);

-- Ensure quotes table allows client_national to create national loads
DROP POLICY IF EXISTS "Clients can create quotes" ON public.quotes;
CREATE POLICY "Clients can create quotes"
  ON public.quotes FOR INSERT
  WITH CHECK (
    auth.uid() = client_id 
    AND role IN ('client', 'client_national')
  );

DROP POLICY IF EXISTS "Clients can view own quotes" ON public.quotes;
CREATE POLICY "Clients can view own quotes"
  ON public.quotes FOR SELECT
  USING (auth.uid() = client_id);

-- Allow partners/truckers to view quotes they can bid on
DROP POLICY IF EXISTS "Partners and truckers can view available quotes" ON public.quotes;
CREATE POLICY "Partners and truckers can view available quotes"
  ON public.quotes FOR SELECT
  USING (
    auth.uid() = partner_id 
    OR (
      is_national_load = true 
      AND accepts_bids = true 
      AND status = 'Pendente'
    )
  );