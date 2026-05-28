-- Añade columnas que la UI de /admin/config esperaba pero la tabla original no tenía.
ALTER TABLE system_config
  ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS max_retry_attempts INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS retry_interval_minutes INTEGER NOT NULL DEFAULT 2;

NOTIFY pgrst, 'reload schema';
