/*
  # Create Demo Usage Tracking Table for Unauthenticated Users

  1. Purpose
     - Track demo portal usage by unauthenticated visitors
     - Store anonymized interaction data for analytics
     - Maintain user privacy by limiting stored data

  2. New Tables
     - `demo_usage_unauthed`
       - `id` (uuid, primary key)
       - `created_at` (timestamp with time zone)
       - `session_id` (text) - anonymous browser session identifier
       - `page` (text) - which assistant/category was used
       - `event_type` (text) - type of interaction (start_demo, generate_content, follow_up)
       - `prompt_excerpt` (text) - truncated prompt text (max 100 chars)
       - `metadata` (jsonb) - additional context (browser, device, etc.)

  3. Security
     - Enable RLS on table
     - NO public access - only service role can read/write
     - Only accessible via server-side Edge Functions
     - No PII storage - session IDs are anonymous

  4. Notes
     - Client-side code cannot access this table directly
     - All inserts must go through Edge Function with service role
     - Data is only visible to admins via Supabase Dashboard
*/

-- Create the demo usage tracking table
CREATE TABLE IF NOT EXISTS demo_usage_unauthed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  session_id text NOT NULL,
  page text NOT NULL,
  event_type text NOT NULL,
  prompt_excerpt text,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE demo_usage_unauthed ENABLE ROW LEVEL SECURITY;

-- Create restrictive policies - NO public access
-- Only service role can insert (via Edge Functions)
CREATE POLICY "Service role can insert demo tracking"
  ON demo_usage_unauthed
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Only service role can read (admin only)
CREATE POLICY "Service role can read demo tracking"
  ON demo_usage_unauthed
  FOR SELECT
  TO service_role
  USING (true);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_demo_usage_session_id 
ON demo_usage_unauthed (session_id);

CREATE INDEX IF NOT EXISTS idx_demo_usage_created_at 
ON demo_usage_unauthed (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_demo_usage_page 
ON demo_usage_unauthed (page);