-- Migration: Adiciona plan_type em profiles e sincroniza com user_credits
-- Data: 2025-06-22

-- 1. Adicionar coluna plan_type em profiles (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'plan_type'
    ) THEN
        ALTER TABLE profiles ADD COLUMN plan_type TEXT DEFAULT 'starter';
    END IF;
END $$;

-- 2. Criar tipo enum se quiser (opcional, usa TEXT por simplicidade)
-- CREATE TYPE plan_type_enum AS ENUM ('starter', 'professional', 'enterprise');
-- ALTER TABLE profiles ALTER COLUMN plan_type TYPE plan_type_enum USING plan_type::plan_type_enum;

-- 3. Trigger: ao atualizar plan_type em profiles, atualiza user_credits
CREATE OR REPLACE FUNCTION sync_plan_type_to_credits()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_credits
    SET plan_type = NEW.plan_type,
        updated_at = NOW()
    WHERE user_id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger antiga se existir
DROP TRIGGER IF EXISTS sync_plan_type ON profiles;

CREATE TRIGGER sync_plan_type
    AFTER UPDATE OF plan_type ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION sync_plan_type_to_credits();

-- 4. Trigger: ao criar novo usuário, setar plan_type padrão
CREATE OR REPLACE FUNCTION set_default_plan_type()
RETURNS TRIGGER AS $$
BEGIN
    -- Se profile criado sem plan_type, seta starter
    IF NEW.plan_type IS NULL THEN
        NEW.plan_type := 'starter';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_default_plan ON profiles;

CREATE TRIGGER set_default_plan
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_default_plan_type();

-- 5. Migração: setar todos os usuários existentes para starter (se null)
UPDATE profiles SET plan_type = 'starter' WHERE plan_type IS NULL;

-- 6. Sincronizar plan_type existente de user_credits para profiles
UPDATE profiles p
SET plan_type = uc.plan_type
FROM user_credits uc
WHERE p.id = uc.user_id AND p.plan_type IS DISTINCT FROM uc.plan_type;

-- 7. Criar view para dashboard admin
CREATE OR REPLACE VIEW user_plan_summary AS
SELECT
    p.id,
    p.email,
    p.company_name,
    p.plan_type,
    uc.credits_remaining,
    uc.monthly_limit,
    uc.plan_expires_at,
    uc.created_at
FROM profiles p
LEFT JOIN user_credits uc ON p.id = uc.user_id;

-- 8. Grant permissions
GRANT SELECT ON user_plan_summary TO authenticated;
GRANT SELECT ON user_plan_summary TO service_role;

-- 9. Índice para performance
CREATE INDEX IF NOT EXISTS idx_profiles_plan_type ON profiles(plan_type);

-- Concluído
