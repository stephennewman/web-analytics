-- Add excluded paths column for feedback widget
-- This allows clients to prevent the feedback widget from showing on specific pages

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS feedback_excluded_paths TEXT;

COMMENT ON COLUMN clients.feedback_excluded_paths IS 'Newline-separated list of URL paths/patterns to exclude from showing the feedback widget. Supports wildcards (*). Example: /checkout, /admin/*, /login';


