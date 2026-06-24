-- Migration: Normalizar tank_percent para 100% em todos os planos limitados
-- O diferencial entre planos agora é o multiplicador de custo, não o tank size.

UPDATE public.user_usage
SET tank_percent = 100
WHERE tank_percent != 999999 AND tank_percent != 100;

UPDATE public.user_usage
SET tank_percent = 999999
WHERE plan_type = 'enterprise';

-- Verificar
SELECT plan_type, COUNT(*), AVG(tank_percent) as avg_tank
FROM public.user_usage
GROUP BY plan_type;
