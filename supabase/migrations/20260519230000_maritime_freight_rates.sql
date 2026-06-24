-- Maritime freight rates table
-- Stores real shipping rate quotations from freight forwarders
CREATE TABLE IF NOT EXISTS maritime_freight_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  origin_code TEXT NOT NULL,
  origin_name TEXT NOT NULL,
  dest_code TEXT NOT NULL,
  dest_name TEXT NOT NULL,
  -- Pricing
  container_20ft_usd NUMERIC,            -- 20GP (NULL if not quoted)
  container_40ft_usd NUMERIC,            -- 40GP/40HC total all-in
  ocean_freight_usd NUMERIC,             -- Base ocean freight
  bunker_recovery_usd NUMERIC,           -- Bunker Recovery Charge
  emergency_fuel_surcharge_usd NUMERIC,  -- Emergency Fuel Surcharge
  carrier_security_fee_usd NUMERIC,      -- Carrier Security Fee
  -- Container type label
  container_label TEXT DEFAULT '40 ST/HC',
  -- Transit
  transit_days INTEGER,
  frequency TEXT DEFAULT 'Semanal',
  -- Route info
  carrier TEXT,                          -- e.g. 'HAPAG LLOYD'
  carrier_type TEXT DEFAULT 'Container',
  route_type TEXT DEFAULT 'Direto',
  quotation_type TEXT DEFAULT 'ALL-IN',  -- 'NET' or 'ALL-IN'
  incoterms TEXT DEFAULT 'FOB',
  commodity TEXT DEFAULT 'CARGA GERAL - NÃO PERIGOSA',
  -- Validity
  valid_from DATE,
  valid_until DATE,
  -- Free days
  free_days INTEGER DEFAULT 14,
  -- Notes
  notes TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Origin fees (THC, TSC, etc.) - separate table for transparency
CREATE TABLE IF NOT EXISTS maritime_origin_fees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  origin_code TEXT NOT NULL,
  fee_name TEXT NOT NULL,                -- e.g. 'THC', 'TSC', 'Logistic Fee'
  fee_currency TEXT NOT NULL DEFAULT 'USD', -- 'USD' or 'BRL'
  fee_amount NUMERIC NOT NULL,
  fee_unit TEXT NOT NULL DEFAULT 'container', -- 'container' or 'BL'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_freight_origin_dest ON maritime_freight_rates (origin_code, dest_code);
CREATE INDEX IF NOT EXISTS idx_freight_valid ON maritime_freight_rates (valid_until);
CREATE INDEX IF NOT EXISTS idx_origin_fees_port ON maritime_origin_fees (origin_code);

-- Enable RLS
ALTER TABLE maritime_freight_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE maritime_origin_fees ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read freight" ON maritime_freight_rates FOR SELECT USING (true);
CREATE POLICY "Public read fees" ON maritime_origin_fees FOR SELECT USING (true);

-- ============================================
-- SEED DATA
-- ============================================

-- ─── China → Brazil (NET OCEAN FREIGHT, valid May 12-21) ───
INSERT INTO maritime_freight_rates 
  (origin_code, origin_name, dest_code, dest_name, container_20ft_usd, container_40ft_usd, transit_days, frequency, carrier_type, route_type, quotation_type, incoterms, valid_from, valid_until, free_days, free_days_extended, free_days_extension_fee_usd, notes, source)
VALUES
  -- Shanghai
  ('CNSHA', 'Shanghai', 'BRSSZ', 'Santos', 4000, 4200, 35, 'Semanal', 'Container', 'Direto', 'NET', 'FOB', '2025-05-12', '2025-05-21', 14, 21, 30, 'NET OCEAN FREIGHT — sem taxas locais. Free days: extensão para 21 dias custa USD 30/container. Carga perigosa/container especial: consultar.', 'Quotation CN→BR'),
  ('CNSHA', 'Shanghai', 'BRPRN', 'Paranaguá', 4000, 4200, 38, 'Semanal', 'Container', 'Direto', 'NET', 'FOB', '2025-05-12', '2025-05-21', 14, 21, 30, 'NET OCEAN FREIGHT — sem taxas locais. Free days: extensão para 21 dias custa USD 30/container. Carga perigosa/container especial: consultar.', 'Quotation CN→BR'),
  ('CNSHA', 'Shanghai', 'BRITJ', 'Itajaí', 4000, 4200, 37, 'Semanal', 'Container', 'Direto', 'NET', 'FOB', '2025-05-12', '2025-05-21', 14, 21, 30, 'NET OCEAN FREIGHT — sem taxas locais. Free days: extensão para 21 dias custa USD 30/container. Carga perigosa/container especial: consultar.', 'Quotation CN→BR'),
  -- Ningbo
  ('CNNGB', 'Ningbo', 'BRSSZ', 'Santos', 4000, 4200, 36, 'Semanal', 'Container', 'Direto', 'NET', 'FOB', '2025-05-12', '2025-05-21', 14, 21, 30, 'NET OCEAN FREIGHT — sem taxas locais. Free days: extensão para 21 dias custa USD 30/container. Carga perigosa/container especial: consultar.', 'Quotation CN→BR'),
  ('CNNGB', 'Ningbo', 'BRPRN', 'Paranaguá', 4000, 4200, 39, 'Semanal', 'Container', 'Direto', 'NET', 'FOB', '2025-05-12', '2025-05-21', 14, 21, 30, 'NET OCEAN FREIGHT — sem taxas locais. Free days: extensão para 21 dias custa USD 30/container. Carga perigosa/container especial: consultar.', 'Quotation CN→BR'),
  ('CNNGB', 'Ningbo', 'BRITJ', 'Itajaí', 4000, 4200, 38, 'Semanal', 'Container', 'Direto', 'NET', 'FOB', '2025-05-12', '2025-05-21', 14, 21, 30, 'NET OCEAN FREIGHT — sem taxas locais. Free days: extensão para 21 dias custa USD 30/container. Carga perigosa/container especial: consultar.', 'Quotation CN→BR'),
  -- Shenzhen (Yantian / Shekou)
  ('CNSZX', 'Shenzhen (Yantion/Shekou)', 'BRSSZ', 'Santos', 4000, 4200, 35, 'Semanal', 'Container', 'Direto', 'NET', 'FOB', '2025-05-12', '2025-05-21', 14, 21, 30, 'NET OCEAN FREIGHT — sem taxas locais. Free days: extensão para 21 dias custa USD 30/container. Carga perigosa/container especial: consultar.', 'Quotation CN→BR'),
  ('CNSZX', 'Shenzhen (Yantion/Shekou)', 'BRPRN', 'Paranaguá', 4000, 4200, 38, 'Semanal', 'Container', 'Direto', 'NET', 'FOB', '2025-05-12', '2025-05-21', 14, 21, 30, 'NET OCEAN FREIGHT — sem taxas locais. Free days: extensão para 21 dias custa USD 30/container. Carga perigosa/container especial: consultar.', 'Quotation CN→BR'),
  ('CNSZX', 'Shenzhen (Yantion/Shekou)', 'BRITJ', 'Itajaí', 4000, 4200, 37, 'Semanal', 'Container', 'Direto', 'NET', 'FOB', '2025-05-12', '2025-05-21', 14, 21, 30, 'NET OCEAN FREIGHT — sem taxas locais. Carga perigosa/container especial: consultar.', 'Quotation CN→BR'),
  -- Qingdao
  ('CNTAO', 'Qingdao', 'BRSSZ', 'Santos', 4000, 4200, 37, 'Semanal', 'Container', 'Direto', 'NET', 'FOB', '2025-05-12', '2025-05-21', 14, 21, 30, 'NET OCEAN FREIGHT — sem taxas locais. Free days: extensão para 21 dias custa USD 30/container. Carga perigosa/container especial: consultar.', 'Quotation CN→BR'),
  ('CNTAO', 'Qingdao', 'BRPRN', 'Paranaguá', 4000, 4200, 40, 'Semanal', 'Container', 'Direto', 'NET', 'FOB', '2025-05-12', '2025-05-21', 14, 21, 30, 'NET OCEAN FREIGHT — sem taxas locais. Carga perigosa/container especial: consultar.', 'Quotation CN→BR'),
  ('CNTAO', 'Qingdao', 'BRITJ', 'Itajaí', 4000, 4200, 39, 'Semanal', 'Container', 'Direto', 'NET', 'FOB', '2025-05-12', '2025-05-21', 14, 21, 30, 'NET OCEAN FREIGHT — sem taxas locais. Carga perigosa/container especial: consultar.', 'Quotation CN→BR'),
  -- Xiamen
  ('CNXMN', 'Xiamen', 'BRSSZ', 'Santos', 4000, 4200, 36, 'Semanal', 'Container', 'Direto', 'NET', 'FOB', '2025-05-12', '2025-05-21', 14, 21, 30, 'NET OCEAN FREIGHT — sem taxas locais. Free days: extensão para 21 dias custa USD 30/container. Carga perigosa/container especial: consultar.', 'Quotation CN→BR'),
  ('CNXMN', 'Xiamen', 'BRPRN', 'Paranaguá', 4000, 4200, 39, 'Semanal', 'Container', 'Direto', 'NET', 'FOB', '2025-05-12', '2025-05-21', 14, 21, 30, 'NET OCEAN FREIGHT — sem taxas locais. Carga perigosa/container especial: consultar.', 'Quotation CN→BR'),
  ('CNXMN', 'Xiamen', 'BRITJ', 'Itajaí', 4000, 4200, 38, 'Semanal', 'Container', 'Direto', 'NET', 'FOB', '2025-05-12', '2025-05-21', 14, 21, 30, 'NET OCEAN FREIGHT — sem taxas locais. Carga perigosa/container especial: consultar.', 'Quotation CN→BR'),

-- ─── Brazil → USA (HAPAG LLOYD, ALL-IN FOB, 40 ST/HC) ───
-- Pecém / Rio Grande → Jacksonville
  ('BRCPS', 'Pecém', 'USJAX', 'Jacksonville', NULL, 3155, 16, 'Semanal', 'Container', 'Direto', 'ALL-IN', 'FOB', '2025-05-12', '2025-05-21', 14, NULL, NULL, 'HAPAG LLOYD. Incluso THC destino e TSC destino. Ocean Freight: USD 2.508 + Bunker Recovery: USD 492 + Emergency Fuel Surcharge: USD 140 + Carrier Security Fee: USD 15 = Total USD 3.155/container 40 ST/HC.', 'HAPAG LLOYD BR→US'),
  ('BRRIG', 'Rio Grande', 'USJAX', 'Jacksonville', NULL, 3155, 27, 'Semanal', 'Container', 'Direto', 'ALL-IN', 'FOB', '2025-05-12', '2025-05-21', 14, NULL, NULL, 'HAPAG LLOYD. Incluso THC destino e TSC destino. Ocean Freight: USD 2.508 + Bunker Recovery: USD 492 + Emergency Fuel Surcharge: USD 140 + Carrier Security Fee: USD 15 = Total USD 3.155/container 40 ST/HC.', 'HAPAG LLOYD BR→US'),
  -- Pecém / Rio Grande → New York
  ('BRCPS', 'Pecém', 'USNYC', 'Nova York', NULL, 2455, 10, 'Semanal', 'Container', 'Direto', 'ALL-IN', 'FOB', '2025-05-12', '2025-05-21', 14, NULL, NULL, 'HAPAG LLOYD. Incluso THC destino e TSC destino. Ocean Freight: USD 1.808 + Bunker Recovery: USD 492 + Emergency Fuel Surcharge: USD 140 + Carrier Security Fee: USD 15 = Total USD 2.455/container 40 ST/HC.', 'HAPAG LLOYD BR→US'),
  ('BRRIG', 'Rio Grande', 'USNYC', 'Nova York', NULL, 2455, 20, 'Semanal', 'Container', 'Direto', 'ALL-IN', 'FOB', '2025-05-12', '2025-05-21', 14, NULL, NULL, 'HAPAG LLOYD. Incluso THC destino e TSC destino. Ocean Freight: USD 1.808 + Bunker Recovery: USD 492 + Emergency Fuel Surcharge: USD 140 + Carrier Security Fee: USD 15 = Total USD 2.455/container 40 ST/HC.', 'HAPAG LLOYD BR→US'),
  -- Pecém / Rio Grande → Port Everglades (Miami area)
  ('BRCPS', 'Pecém', 'USPEV', 'Port Everglades (Miami)', NULL, 2455, 18, 'Semanal', 'Container', 'Direto', 'ALL-IN', 'FOB', '2025-05-12', '2025-05-21', 14, NULL, NULL, 'HAPAG LLOYD. Port Everglades = melhor opção que Miami. Incluso THC destino e TSC destino. Ocean Freight: USD 1.808 + Bunker Recovery: USD 492 + Emergency Fuel: USD 140 + Security: USD 15 = Total USD 2.455/container 40 ST/HC.', 'HAPAG LLOYD BR→US'),
  ('BRRIG', 'Rio Grande', 'USPEV', 'Port Everglades (Miami)', NULL, 2455, NULL, 'Semanal', 'Container', 'Direto', 'ALL-IN', 'FOB', '2025-05-12', '2025-05-21', 14, NULL, NULL, 'HAPAG LLOYD. Port Everglades = melhor opção que Miami. Incluso THC destino e TSC destino.', 'HAPAG LLOYD BR→US');

-- ─── Origin fees (Brazil ports) - HAPAG LLOYD ───
INSERT INTO maritime_origin_fees (origin_code, fee_name, fee_currency, fee_amount, fee_unit) VALUES
  -- Pecém
  ('BRCPS', 'THC (Terminal Handling Charge)', 'BRL', 1336, 'container'),
  ('BRCPS', 'TSC', 'BRL', 84, 'container'),
  ('BRCPS', 'Logistic Fee', 'BRL', 264, 'container'),
  ('BRCPS', 'Seal Fee', 'BRL', 70, 'container'),
  ('BRCPS', 'BL Fee', 'BRL', 672, 'BL'),
  ('BRCPS', 'Administrative Fee', 'USD', 35, 'BL'),
  ('BRCPS', 'ERS', 'USD', 45, 'BL'),
  ('BRCPS', 'Bank Fee', 'USD', 50, 'BL'),
  ('BRCPS', 'Security Manifest Fee', 'USD', 35, 'BL'),
  ('BRCPS', 'BL Eletrônico (se necessário)', 'USD', 120, 'BL'),
  -- Rio Grande
  ('BRRIG', 'THC (Terminal Handling Charge)', 'BRL', 1650, 'container'),
  ('BRRIG', 'TSC', 'BRL', 84, 'container'),
  ('BRRIG', 'Logistic Fee', 'BRL', 264, 'container'),
  ('BRRIG', 'Seal Fee', 'BRL', 70, 'container'),
  ('BRRIG', 'BL Fee', 'BRL', 672, 'BL'),
  ('BRRIG', 'Administrative Fee', 'USD', 35, 'BL'),
  ('BRRIG', 'ERS', 'USD', 45, 'BL'),
  ('BRRIG', 'Bank Fee', 'USD', 50, 'BL'),
  ('BRRIG', 'Security Manifest Fee', 'USD', 35, 'BL'),
  ('BRRIG', 'BL Eletrônico (se necessário)', 'USD', 120, 'BL');