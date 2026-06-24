-- More maritime freight routes seed data
-- Europe, Asia, Middle East, etc.

-- ─── South Korea → Brazil ───
INSERT INTO maritime_freight_rates
  (origin_code, origin_name, dest_code, dest_name, container_20ft_usd, container_40ft_usd, ocean_freight_usd, bunker_recovery_usd, emergency_fuel_surcharge_usd, carrier_security_fee_usd, transit_days, frequency, carrier_type, route_type, quotation_type, incoterms, valid_from, valid_until, free_days, notes, source)
VALUES
  ('KRBUS', 'Busan', 'BRSSZ', 'Santos', 3800, 4100, 3100, 650, 220, 130, 32, 'Semanal', 'Container', 'Direto', 'ALL-IN', 'FOB', '2025-05-12', '2025-05-21', 14, 'ALL-IN FCL. Incluso THC origem e destino. Carga geral não perigosa.', 'Quotation KR→BR'),
  ('KRBUS', 'Busan', 'BRPRN', 'Paranaguá', 3900, 4200, 3150, 680, 230, 140, 34, 'Semanal', 'Container', 'Direto', 'ALL-IN', 'FOB', '2025-05-12', '2025-05-21', 14, 'ALL-IN FCL. Incluso THC origem e destino.', 'Quotation KR→BR'),
  ('KRINC', 'Incheon', 'BRSSZ', 'Santos', 3900, 4200, 3200, 640, 210, 150, 35, 'Semanal', 'Container', 'Direto', 'ALL-IN', 'FOB', '2025-05-12', '2025-05-21', 14, 'ALL-IN FCL.', 'Quotation KR→BR');

-- ─── Japan → Brazil ───
INSERT INTO maritime_freight_rates
  (origin_code, origin_name, dest_code, dest_name, container_20ft_usd, container_40ft_usd, ocean_freight_usd, bunker_recovery_usd, emergency_fuel_surcharge_usd, carrier_security_fee_usd, transit_days, frequency, carrier_type, route_type, quotation_type, incoterms, valid_from, valid_until, free_days, notes, source)
VALUES
  ('JPYOK', 'Yokohama', 'BRSSZ', 'Santos', 4100, 4400, 3300, 700, 250, 150, 36, 'Semanal', 'Container', 'Direto', 'ALL-IN', 'FOB', '2025-05-12', '2025-05-21', 14, 'ALL-IN FCL. Carga geral.', 'Quotation JP→BR'),
  ('JPOSA', 'Osaka', 'BRSSZ', 'Santos', 4150, 4450, 3350, 710, 240, 150, 37, 'Semanal', 'Container', 'Direto', 'ALL-IN', 'FOB', '2025-05-12', '2025-05-21', 14, 'ALL-IN FCL.', 'Quotation JP→BR');

-- ─── India → Brazil ───
INSERT INTO maritime_freight_rates
  (origin_code, origin_name, dest_code, dest_name, container_20ft_usd, container_40ft_usd, ocean_freight_usd, bunker_recovery_usd, emergency_fuel_surcharge_usd, carrier_security_fee_usd, transit_days, frequency, carrier_type, route_type, quotation_type, incoterms, valid_from, valid_until, free_days, notes, source)
VALUES
  ('INMUN', 'Mumbai (Nhava Sheva)', 'BRSSZ', 'Santos', 3600, 3900, 2950, 620, 200, 130, 28, 'Semanal', 'Container', 'Direto', 'ALL-IN', 'FOB', '2025-05-12', '2025-05-21', 14, 'ALL-IN FCL. Via Cabo da Boa Esperança.', 'Quotation IN→BR'),
  ('INMUN', 'Mumbai (Nhava Sheva)', 'BRPRN', 'Paranaguá', 3700, 4000, 3000, 640, 210, 150, 30, 'Semanal', 'Container', 'Direto', 'ALL-IN', 'FOB', '2025-05-12', '2025-05-21', 14, 'ALL-IN FCL.', 'Quotation IN→BR');

-- ─── Turkey → Brazil ───
INSERT INTO maritime_freight_rates
  (origin_code, origin_name, dest_code, dest_name, container_20ft_usd, container_40ft_usd, ocean_freight_usd, bunker_recovery_usd, emergency_fuel_surcharge_usd, carrier_security_fee_usd, transit_days, frequency, carrier_type, route_type, quotation_type, incoterms, valid_from, valid_until, free_days, notes, source)
VALUES
  ('TRIST', 'Istanbul (Ambarli)', 'BRSSZ', 'Santos', 3200, 3500, 2600, 580, 190, 130, 22, 'Semanal', 'Container', 'Direto', 'ALL-IN', 'FOB', '2025-05-12', '2025-05-21', 14, 'ALL-IN FCL. Carga geral.', 'Quotation TR→BR'),
  ('TRIST', 'Istanbul (Ambarli)', 'BRPRN', 'Paranaguá', 3300, 3600, 2650, 600, 195, 155, 24, 'Semanal', 'Container', 'Direto', 'ALL-IN', 'FOB', '2025-05-12', '2025-05-21', 14, 'ALL-IN FCL.', 'Quotation TR→BR');

-- ─── Portugal → Brazil ───
INSERT INTO maritime_freight_rates
  (origin_code, origin_name, dest_code, dest_name, container_20ft_usd, container_40ft_usd, ocean_freight_usd, bunker_recovery_usd, emergency_fuel_surcharge_usd, carrier_security_fee_usd, transit_days, frequency, carrier_type, route_type, quotation_type, incoterms, valid_from, valid_until, free_days, notes, source)
VALUES
  ('PTLIS', 'Lisboa', 'BRSSZ', 'Santos', 2800, 3100, 2250, 520, 180, 150, 12, 'Semanal', 'Container', 'Direto', 'ALL-IN', 'FOB', '2025-05-12', '2025-05-21', 14, 'ALL-IN FCL. Rota direta Lisboa-Santos.', 'Quotation PT→BR'),
  ('PTLIS', 'Lisboa', 'BRPRN', 'Paranaguá', 2900, 3200, 2300, 540, 185, 175, 14, 'Semanal', 'Container', 'Direto', 'ALL-IN', 'FOB', '2025-05-12', '2025-05-21', 14, 'ALL-IN FCL.', 'Quotation PT→BR');

-- ─── Spain → Brazil ───
INSERT INTO maritime_freight_rates
  (origin_code, origin_name, dest_code, dest_name, container_20ft_usd, container_40ft_usd, ocean_freight_usd, bunker_recovery_usd, emergency_fuel_surcharge_usd, carrier_security_fee_usd, transit_days, frequency, carrier_type, route_type, quotation_type, incoterms, valid_from, valid_until, free_days, notes, source)
VALUES
  ('ESBCN', 'Barcelona', 'BRSSZ', 'Santos', 2900, 3200, 2300, 550, 190, 160, 14, 'Semanal', 'Container', 'Direto', 'ALL-IN', 'FOB', '2025-05-12', '2025-05-21', 14, 'ALL-IN FCL. Rota direta via Mediterrâneo.', 'Quotation ES→BR'),
  ('ESVLC', 'Valencia', 'BRSSZ', 'Santos', 2850, 3150, 2280, 540, 185, 145, 13, 'Semanal', 'Container', 'Direto', 'ALL-IN', 'FOB', '2025-05-12', '2025-05-21', 14, 'ALL-IN FCL.', 'Quotation ES→BR');

-- ─── Brazil → Europe ───
INSERT INTO maritime_freight_rates
  (origin_code, origin_name, dest_code, dest_name, container_20ft_usd, container_40ft_usd, ocean_freight_usd, bunker_recovery_usd, emergency_fuel_surcharge_usd, carrier_security_fee_usd, transit_days, frequency, carrier_type, route_type, quotation_type, incoterms, valid_from, valid_until, free_days, notes, source)
VALUES
  ('BRSSZ', 'Santos', 'PTLIS', 'Lisboa', 2600, 2900, 2100, 480, 170, 150, 11, 'Semanal', 'Container', 'Direto', 'ALL-IN', 'FOB', '2025-05-12', '2025-05-21', 14, 'ALL-IN FCL. Santos-Lisboa direto.', 'Quotation BR→PT'),
  ('BRSSZ', 'Santos', 'NLRTM', 'Roterdã', 2700, 3000, 2150, 500, 180, 170, 13, 'Semanal', 'Container', 'Direto', 'ALL-IN', 'FOB', '2025-05-12', '2025-05-21', 14, 'ALL-IN FCL.', 'Quotation BR→NL'),
  ('BRPRN', 'Paranaguá', 'ESBCN', 'Barcelona', 2800, 3100, 2200, 520, 190, 190, 15, 'Semanal', 'Container', 'Direto', 'ALL-IN', 'FOB', '2025-05-12', '2025-05-21', 14, 'ALL-IN FCL.', 'Quotation BR→ES');

-- ─── Brazil → Asia ───
INSERT INTO maritime_freight_rates
  (origin_code, origin_name, dest_code, dest_name, container_20ft_usd, container_40ft_usd, ocean_freight_usd, bunker_recovery_usd, emergency_fuel_surcharge_usd, carrier_security_fee_usd, transit_days, frequency, carrier_type, route_type, quotation_type, incoterms, valid_from, valid_until, free_days, notes, source)
VALUES
  ('BRSSZ', 'Santos', 'KRBUS', 'Busan', 3200, 3500, 2600, 550, 200, 150, 30, 'Semanal', 'Container', 'Direto', 'ALL-IN', 'FOB', '2025-05-12', '2025-05-21', 14, 'ALL-IN FCL. Via Cabo da Boa Esperança.', 'Quotation BR→KR'),
  ('BRSSZ', 'Santos', 'JPYOK', 'Yokohama', 3400, 3700, 2750, 600, 220, 130, 32, 'Semanal', 'Container', 'Direto', 'ALL-IN', 'FOB', '2025-05-12', '2025-05-21', 14, 'ALL-IN FCL.', 'Quotation BR→JP'),
  ('BRPRN', 'Paranaguá', 'INMUN', 'Mumbai', 3100, 3400, 2500, 580, 210, 210, 26, 'Semanal', 'Container', 'Direto', 'ALL-IN', 'FOB', '2025-05-12', '2025-05-21', 14, 'ALL-IN FCL. Via Cabo da Boa Esperança.', 'Quotation BR→IN');

-- ─── Middle East → Brazil ───
INSERT INTO maritime_freight_rates
  (origin_code, origin_name, dest_code, dest_name, container_20ft_usd, container_40ft_usd, ocean_freight_usd, bunker_recovery_usd, emergency_fuel_surcharge_usd, carrier_security_fee_usd, transit_days, frequency, carrier_type, route_type, quotation_type, incoterms, valid_from, valid_until, free_days, notes, source)
VALUES
  ('AEJEA', 'Jebel Ali (Dubai)', 'BRSSZ', 'Santos', 3300, 3600, 2700, 520, 180, 200, 24, 'Semanal', 'Container', 'Direto', 'ALL-IN', 'FOB', '2025-05-12', '2025-05-21', 14, 'ALL-IN FCL. Carga geral não perigosa.', 'Quotation AE→BR'),
  ('AEJEA', 'Jebel Ali (Dubai)', 'BRPRN', 'Paranaguá', 3400, 3700, 2750, 540, 190, 220, 26, 'Semanal', 'Container', 'Direto', 'ALL-IN', 'FOB', '2025-05-12', '2025-05-21', 14, 'ALL-IN FCL.', 'Quotation AE→BR');

-- ─── China → USA ───
INSERT INTO maritime_freight_rates
  (origin_code, origin_name, dest_code, dest_name, container_20ft_usd, container_40ft_usd, ocean_freight_usd, bunker_recovery_usd, emergency_fuel_surcharge_usd, carrier_security_fee_usd, transit_days, frequency, carrier_type, route_type, quotation_type, incoterms, valid_from, valid_until, free_days, notes, source)
VALUES
  ('CNSHA', 'Shanghai', 'USLAX', 'Los Angeles', 2200, 2500, 1800, 420, 150, 130, 14, 'Semanal', 'Container', 'Direto', 'ALL-IN', 'FOB', '2025-05-12', '2025-05-21', 14, 'ALL-IN FCL. Transpacífico direto.', 'Quotation CN→US'),
  ('CNSHA', 'Shanghai', 'USNYC', 'Nova York', 2800, 3100, 2250, 480, 170, 200, 28, 'Semanal', 'Container', 'Via Panamá', 'ALL-IN', 'FOB', '2025-05-12', '2025-05-21', 14, 'ALL-IN FCL. Via Canal do Panamá.', 'Quotation CN→US'),
  ('CNNGB', 'Ningbo', 'USLAX', 'Los Angeles', 2250, 2550, 1820, 430, 155, 145, 15, 'Semanal', 'Container', 'Direto', 'ALL-IN', 'FOB', '2025-05-12', '2025-05-21', 14, 'ALL-IN FCL.', 'Quotation CN→US');
