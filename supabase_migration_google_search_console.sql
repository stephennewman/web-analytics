-- Add Google Search Console integration columns to clients table

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS google_search_console_connected BOOLEAN DEFAULT false;

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS google_search_console_access_token TEXT;

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS google_search_console_refresh_token TEXT;

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS google_search_console_token_expiry TIMESTAMP;

-- Add comments
COMMENT ON COLUMN clients.google_search_console_connected IS 'Whether Google Search Console is connected for this client';
COMMENT ON COLUMN clients.google_search_console_access_token IS 'OAuth access token for Google Search Console API';
COMMENT ON COLUMN clients.google_search_console_refresh_token IS 'OAuth refresh token for Google Search Console API';
COMMENT ON COLUMN clients.google_search_console_token_expiry IS 'When the current access token expires';

-- Create table to store GSC data
CREATE TABLE IF NOT EXISTS google_search_console_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  query TEXT NOT NULL,
  page TEXT NOT NULL,
  device TEXT NOT NULL,
  impressions INTEGER NOT NULL,
  clicks INTEGER NOT NULL,
  ctr DECIMAL(5,4) NOT NULL,
  position DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(client_id, date, query, page, device)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_gsc_data_client_date ON google_search_console_data(client_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_gsc_data_query ON google_search_console_data(client_id, query);

-- Enable RLS
ALTER TABLE google_search_console_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own GSC data" ON google_search_console_data
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own GSC data" ON google_search_console_data
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own GSC data" ON google_search_console_data
  FOR DELETE USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

