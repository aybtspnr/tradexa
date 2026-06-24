-- Migration: Add Vietnam → Brazil freight quotes
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/ocivkbocmywinwqmaqac/sql/new

-- VNSGN = Ho Chi Minh City (Saigon Port)
-- VNHPH = Hai Phong
-- Preços base do carrier (Tiger Global Logistics). Margem de 30% aplicada automaticamente pelo sistema via PRICE_MARGIN.

-- HCM → Santos
INSERT INTO public.freight_quotes (so_number, pol, pod, container_type, carrier, sell_price_usd, transit_days, total_transit_days, notes)
VALUES 
  ('VN-BR-001', 'VNSGN', 'BRSSZ', '20GP', 'Tiger Global Logistics', 3400, 30, 30, 'NET OCEAN FREIGHT FOB. Cotação válida até final Maio 2026.'),
  ('VN-BR-001', 'VNSGN', 'BRSSZ', '40HC', 'Tiger Global Logistics', 4200, 30, 30, 'NET OCEAN FREIGHT FOB. Cotação válida até final Maio 2026.');

-- HCM → Rio
INSERT INTO public.freight_quotes (so_number, pol, pod, container_type, carrier, sell_price_usd, transit_days, total_transit_days, notes)
VALUES 
  ('VN-BR-002', 'VNSGN', 'BRRIO', '20GP', 'Tiger Global Logistics', 3500, 30, 30, 'NET OCEAN FREIGHT FOB. Cotação válida até final Maio 2026.'),
  ('VN-BR-002', 'VNSGN', 'BRRIO', '40HC', 'Tiger Global Logistics', 4300, 30, 30, 'NET OCEAN FREIGHT FOB. Cotação válida até final Maio 2026.');

-- Hai Phong → Santos
INSERT INTO public.freight_quotes (so_number, pol, pod, container_type, carrier, sell_price_usd, transit_days, total_transit_days, notes)
VALUES 
  ('VN-BR-003', 'VNHPH', 'BRSSZ', '20GP', 'Tiger Global Logistics', 3400, 30, 30, 'NET OCEAN FREIGHT FOB. Cotação válida até final Maio 2026.'),
  ('VN-BR-003', 'VNHPH', 'BRSSZ', '40HC', 'Tiger Global Logistics', 4200, 30, 30, 'NET OCEAN FREIGHT FOB. Cotação válida até final Maio 2026.');

-- Hai Phong → Rio
INSERT INTO public.freight_quotes (so_number, pol, pod, container_type, carrier, sell_price_usd, transit_days, total_transit_days, notes)
VALUES 
  ('VN-BR-004', 'VNHPH', 'BRRIO', '20GP', 'Tiger Global Logistics', 3500, 30, 30, 'NET OCEAN FREIGHT FOB. Cotação válida até final Maio 2026.'),
  ('VN-BR-004', 'VNHPH', 'BRRIO', '40HC', 'Tiger Global Logistics', 4300, 30, 30, 'NET OCEAN FREIGHT FOB. Cotação válida até final Maio 2026.');
