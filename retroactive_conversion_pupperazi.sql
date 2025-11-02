-- Retroactively mark the pupperazi session as converted
-- Session: ses_1762109996073_syvk64koi
-- This user clicked "Send Request" and saw "Return to Site" - they definitely converted!

-- 1. Update the session to mark as converted
UPDATE sessions 
SET 
  converted = true,
  updated_at = NOW()
WHERE 
  session_id = 'ses_1762109996073_syvk64koi'
  AND client_id = '2accfa7a-e443-46f7-9b64-6ba9641bb18f';

-- 2. Insert a conversion event (retroactively)
INSERT INTO events (
  client_id,
  session_id,
  event_type,
  url,
  data,
  timestamp
)
VALUES (
  '2accfa7a-e443-46f7-9b64-6ba9641bb18f',
  'ses_1762109996073_syvk64koi',
  'conversion',
  'https://www.pupperazipetspa.com/',
  jsonb_build_object(
    'value', 1,
    'retroactive', true,
    'reason', 'User clicked Send Request button and saw Return to Site confirmation',
    'detected_by', 'manual_review',
    'button_text', 'Send Request',
    'confirmation_text', 'Return to Site'
  ),
  '2025-11-02T19:02:00.029+00:00'  -- Right after they clicked "Send Request"
);

-- 3. Verify the update
SELECT 
  session_id,
  converted,
  created_at,
  updated_at,
  country,
  city
FROM sessions
WHERE session_id = 'ses_1762109996073_syvk64koi';

-- 4. Verify the conversion event was added
SELECT 
  event_type,
  url,
  data,
  timestamp
FROM events
WHERE 
  session_id = 'ses_1762109996073_syvk64koi'
  AND event_type = 'conversion'
ORDER BY timestamp DESC
LIMIT 1;

