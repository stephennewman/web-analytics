-- Add custom position support for manual drag-and-drop ordering
-- This allows users to override AI-based sorting by manually positioning cards

ALTER TABLE tickets 
  ADD COLUMN IF NOT EXISTS custom_position INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS position_override BOOLEAN DEFAULT false;

-- Add index for efficient sorting queries
CREATE INDEX IF NOT EXISTS idx_tickets_status_position 
  ON tickets(client_id, status, custom_position) 
  WHERE custom_position IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN tickets.custom_position IS 'User-defined position within status column (NULL = use AI score sorting)';
COMMENT ON COLUMN tickets.position_override IS 'True if user manually positioned this ticket';

