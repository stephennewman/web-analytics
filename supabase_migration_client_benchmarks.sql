-- Add historical benchmark fields to clients table
-- This allows tracking 12-month averages for comparison

ALTER TABLE clients ADD COLUMN IF NOT EXISTS benchmark_monthly_conversions INTEGER DEFAULT NULL;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS benchmark_monthly_sessions INTEGER DEFAULT NULL;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS benchmark_monthly_visitors INTEGER DEFAULT NULL;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS benchmark_period TEXT DEFAULT '12 months';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS benchmark_updated_at TIMESTAMPTZ DEFAULT NULL;

-- Set Pupperazi benchmarks (12-month averages)
UPDATE clients 
SET 
  benchmark_monthly_conversions = 31,
  benchmark_monthly_sessions = 255,
  benchmark_monthly_visitors = 177,
  benchmark_period = '12 months',
  benchmark_updated_at = NOW()
WHERE 
  id = '2accfa7a-e443-46f7-9b64-6ba9641bb18f';

-- Verify
SELECT 
  name,
  domain,
  benchmark_monthly_conversions,
  benchmark_monthly_sessions,
  benchmark_monthly_visitors,
  benchmark_period,
  benchmark_updated_at
FROM clients
WHERE benchmark_monthly_conversions IS NOT NULL;

