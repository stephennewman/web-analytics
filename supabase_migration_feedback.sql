-- Voice Feedback Widget - Database Migration
-- Run this in Supabase SQL Editor

-- Phase 1: Add feedback_enabled column to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS feedback_enabled BOOLEAN DEFAULT false;

-- Ensure existing clients have it disabled
UPDATE clients SET feedback_enabled = false WHERE feedback_enabled IS NULL;

-- Phase 2: Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  url TEXT NOT NULL,
  duration INTEGER NOT NULL,
  transcript TEXT,
  cleaned_transcript TEXT,
  sentiment TEXT,
  themes JSONB,
  insights TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_feedback_client_id ON feedback(client_id);
CREATE INDEX IF NOT EXISTS idx_feedback_session_id ON feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_sentiment ON feedback(sentiment);

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view feedback for their clients" ON feedback;

-- Create RLS policy
CREATE POLICY "Users can view feedback for their clients"
  ON feedback FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

-- Phase 3: Create storage bucket (skip if exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('feedback-audio', 'feedback-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload" ON storage.objects;

-- Storage policies
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'feedback-audio');

CREATE POLICY "Authenticated upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'feedback-audio');

