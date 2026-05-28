-- Bitácora de auditoría persistida en Supabase (Vercel no permite escribir
-- en disco fuera de /tmp y queremos retención duradera).
CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  user_id     UUID         REFERENCES users(id) ON DELETE SET NULL,
  user_email  VARCHAR(255),
  user_role   VARCHAR(20),
  action      VARCHAR(64)  NOT NULL,
  entity      VARCHAR(32),
  entity_id   UUID,
  summary     TEXT         NOT NULL,
  metadata    JSONB
);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user      ON audit_log(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action    ON audit_log(action, timestamp DESC);

NOTIFY pgrst, 'reload schema';
