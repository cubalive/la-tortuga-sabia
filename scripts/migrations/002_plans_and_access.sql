-- ─────────────────────────────────────────────────────────────────────────────
-- 002_plans_and_access.sql
-- Plan-based access control + story audio cache
-- ─────────────────────────────────────────────────────────────────────────────

-- user_plans: tracks which tomos each user has paid for
CREATE TABLE IF NOT EXISTS user_plans (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type         TEXT        NOT NULL CHECK (plan_type IN ('free','tomo_individual','pack_6','pack_completo')),
  tomos_acceso      INTEGER[]   DEFAULT '{}',
  activo            BOOLEAN     DEFAULT true,
  fecha_inicio      TIMESTAMPTZ DEFAULT NOW(),
  fecha_vencimiento TIMESTAMPTZ,
  stripe_session_id TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_plans_user_id ON user_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_plans_user_activo ON user_plans(user_id, activo);

-- story_audio: caches generated TTS audio URLs
CREATE TABLE IF NOT EXISTS story_audio (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id          UUID        REFERENCES stories(id) ON DELETE SET NULL,
  tomo              INTEGER     NOT NULL,
  numero_en_tomo    INTEGER     NOT NULL,
  audio_url         TEXT        NOT NULL,
  voz               TEXT        DEFAULT 'nova',
  duracion_segundos INTEGER,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tomo, numero_en_tomo)
);

CREATE INDEX IF NOT EXISTS idx_story_audio_tomo ON story_audio(tomo, numero_en_tomo);

-- RLS policies
ALTER TABLE user_plans  ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_audio ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_plans"    ON user_plans;
DROP POLICY IF EXISTS "audio_public_read"  ON story_audio;
DROP POLICY IF EXISTS "audio_service_write" ON story_audio;

CREATE POLICY "users_own_plans"
  ON user_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "audio_public_read"
  ON story_audio FOR SELECT
  USING (true);

CREATE POLICY "audio_service_write"
  ON story_audio FOR ALL
  USING (auth.role() = 'service_role');

-- ─── check_story_access ───────────────────────────────────────────────────────
-- Returns TRUE if the user can read the given story.
-- Story #1 of every tomo is always free.
-- Otherwise the user needs an active plan covering that tomo.
CREATE OR REPLACE FUNCTION check_story_access(
  p_user_id       UUID,
  p_tomo          INTEGER,
  p_numero_en_tomo INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_numero_en_tomo = 1 THEN
    RETURN TRUE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM user_plans
    WHERE user_id = p_user_id
      AND activo = true
      AND (fecha_vencimiento IS NULL OR fecha_vencimiento > NOW())
      AND (
            plan_type = 'pack_completo'
        OR (plan_type = 'pack_6'         AND p_tomo BETWEEN 1 AND 6)
        OR (plan_type = 'tomo_individual' AND p_tomo = ANY(tomos_acceso))
      )
  );
END;
$$;
