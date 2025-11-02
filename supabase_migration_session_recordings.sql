-- Session Recordings Table
-- Stores compressed session replay events from rrweb

CREATE TABLE IF NOT EXISTS session_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  visitor_id TEXT,
  
  -- Recording metadata
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_ms INTEGER, -- Total recording duration
  
  -- Page info
  url TEXT NOT NULL,
  page_title TEXT,
  
  -- Device/browser
  user_agent TEXT,
  viewport_width INTEGER,
  viewport_height INTEGER,
  device_type TEXT, -- 'mobile', 'tablet', 'desktop'
  
  -- Recording data (compressed)
  events JSONB NOT NULL, -- rrweb events array
  events_count INTEGER DEFAULT 0,
  
  -- Privacy & retention
  has_sensitive_data BOOLEAN DEFAULT FALSE,
  is_masked BOOLEAN DEFAULT TRUE,
  consent_given BOOLEAN DEFAULT FALSE,
  
  -- Analytics
  has_rage_click BOOLEAN DEFAULT FALSE,
  has_error BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days'
);

-- Indexes for performance
CREATE INDEX idx_session_recordings_client ON session_recordings(client_id);
CREATE INDEX idx_session_recordings_session ON session_recordings(session_id);
CREATE INDEX idx_session_recordings_visitor ON session_recordings(visitor_id);
CREATE INDEX idx_session_recordings_started ON session_recordings(started_at DESC);
CREATE INDEX idx_session_recordings_expires ON session_recordings(expires_at);
CREATE INDEX idx_session_recordings_rage ON session_recordings(has_rage_click) WHERE has_rage_click = true;

-- Auto-delete expired recordings (run daily via cron)
CREATE OR REPLACE FUNCTION delete_expired_recordings()
RETURNS void AS $$
BEGIN
  DELETE FROM session_recordings
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE session_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recordings for their clients"
  ON session_recordings FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert recordings for their clients"
  ON session_recordings FOR INSERT
  WITH CHECK (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete recordings for their clients"
  ON session_recordings FOR DELETE
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

COMMENT ON TABLE session_recordings IS 'Stores session replay recordings using rrweb';
COMMENT ON COLUMN session_recordings.events IS 'Compressed rrweb event stream';
COMMENT ON COLUMN session_recordings.expires_at IS 'Auto-delete after 30 days for privacy';

