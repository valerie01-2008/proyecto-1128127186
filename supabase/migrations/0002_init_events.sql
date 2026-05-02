CREATE TABLE IF NOT EXISTS events (
  id           UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        VARCHAR(200) NOT NULL,
  start_at     TIMESTAMPTZ  NOT NULL,             -- siempre UTC
  end_at       TIMESTAMPTZ,
  location     VARCHAR(300),
  description  TEXT,
  category     VARCHAR(15)  NOT NULL DEFAULT 'otro'
               CHECK (category IN ('personal','trabajo','salud','educacion','otro')),
  priority     VARCHAR(10)  NOT NULL DEFAULT 'normal'
               CHECK (priority IN ('normal','alta','urgente')),
  status       VARCHAR(15)  NOT NULL DEFAULT 'pendiente'
               CHECK (status IN ('pendiente','completado','cancelado')),
  is_synced    BOOLEAN      DEFAULT false,        -- para futura sincronización externa
  archived_at  TIMESTAMPTZ,                       -- para eventos completados (retención 90 días)
  created_at   TIMESTAMPTZ  DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_attachments (
  id           UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id     UUID         NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  filename     VARCHAR(255) NOT NULL,
  blob_path    TEXT         NOT NULL,             -- path en Vercel Blob
  file_size    INTEGER      NOT NULL,             -- bytes
  content_type VARCHAR(100) NOT NULL,
  created_at   TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_user        ON events(user_id, start_at);
CREATE INDEX IF NOT EXISTS idx_events_status      ON events(user_id, status);
CREATE INDEX IF NOT EXISTS idx_events_start       ON events(start_at);
CREATE INDEX IF NOT EXISTS idx_attachments_event  ON event_attachments(event_id);