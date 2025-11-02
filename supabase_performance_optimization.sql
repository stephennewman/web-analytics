-- PERFORMANCE OPTIMIZATION MIGRATION
-- Adds indexes and optimizes tables for faster queries

-- 1. Add indexes for session_recordings (biggest bottleneck)
CREATE INDEX IF NOT EXISTS idx_session_recordings_client_session 
  ON session_recordings(client_id, session_id);

CREATE INDEX IF NOT EXISTS idx_session_recordings_started_at 
  ON session_recordings(started_at DESC);

-- 2. Add partial index for recent recordings (most common query)
CREATE INDEX IF NOT EXISTS idx_session_recordings_recent 
  ON session_recordings(client_id, started_at DESC) 
  WHERE started_at > NOW() - INTERVAL '7 days';

-- 3. Add indexes for sessions table
CREATE INDEX IF NOT EXISTS idx_sessions_client_updated 
  ON sessions(client_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_sessions_created_at 
  ON sessions(created_at DESC);

-- 4. Add indexes for tickets table (if not exists)
CREATE INDEX IF NOT EXISTS idx_tickets_client_status 
  ON tickets(client_id, status);

-- 5. Add index for events table
CREATE INDEX IF NOT EXISTS idx_events_session_timestamp 
  ON events(session_id, timestamp DESC);

-- 6. Analyze tables to update statistics
ANALYZE sessions;
ANALYZE events;
ANALYZE session_recordings;
ANALYZE tickets;

-- 7. Add statement timeout for expensive queries (30 seconds)
ALTER DATABASE postgres SET statement_timeout = '30s';

COMMENT ON INDEX idx_session_recordings_client_session IS 'Optimizes session recording lookups by client and session';
COMMENT ON INDEX idx_sessions_client_updated IS 'Optimizes recent sessions queries';

