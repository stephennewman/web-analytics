-- Add session recording toggle to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS session_recording_enabled BOOLEAN DEFAULT false;

-- Update comment
COMMENT ON COLUMN clients.session_recording_enabled IS 'Enable/disable session recording for this client';

