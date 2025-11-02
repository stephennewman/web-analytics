-- Check recent Pupperazi conversions (last 24 hours)
-- Run this in your Supabase SQL editor

SELECT 
  s.session_id,
  s.converted,
  s.created_at as session_start,
  s.updated_at as last_activity,
  s.country,
  s.city,
  s.device,
  COUNT(e.id) as total_events,
  COUNT(CASE WHEN e.event_type = 'conversion' THEN 1 END) as conversion_events,
  COUNT(CASE WHEN e.event_type = 'phone_click' THEN 1 END) as phone_clicks,
  COUNT(CASE WHEN e.event_type = 'email_click' THEN 1 END) as email_clicks,
  COUNT(CASE WHEN e.event_type = 'form_submit' THEN 1 END) as form_submits
FROM sessions s
LEFT JOIN events e ON e.session_id = s.session_id
WHERE 
  s.client_id = '2accfa7a-e443-46f7-9b64-6ba9641bb18f'
  AND s.created_at >= NOW() - INTERVAL '24 hours'
GROUP BY s.id, s.session_id, s.converted, s.created_at, s.updated_at, s.country, s.city, s.device
ORDER BY s.created_at DESC
LIMIT 20;

-- Get conversion count for current month
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_sessions,
  COUNT(CASE WHEN converted = true THEN 1 END) as conversions,
  COUNT(DISTINCT visitor_id) as unique_visitors,
  ROUND(COUNT(CASE WHEN converted = true THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100, 1) as conversion_rate
FROM sessions
WHERE 
  client_id = '2accfa7a-e443-46f7-9b64-6ba9641bb18f'
  AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY DATE_TRUNC('month', created_at);

-- Last 5 conversions
SELECT 
  s.session_id,
  s.created_at,
  s.country,
  s.city,
  e.data->>'value' as conversion_value,
  e.data->>'button_text' as button_clicked,
  e.timestamp as conversion_time
FROM sessions s
JOIN events e ON e.session_id = s.session_id
WHERE 
  s.client_id = '2accfa7a-e443-46f7-9b64-6ba9641bb18f'
  AND s.converted = true
  AND e.event_type = 'conversion'
ORDER BY e.timestamp DESC
LIMIT 5;

