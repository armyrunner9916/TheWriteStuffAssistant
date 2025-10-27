/*
  # Fix Database Security Issues
  
  This migration addresses multiple security and performance issues:
  
  ## 1. Missing Indexes for Foreign Keys
  - Add index on `query_history.parent_query_id`
  - Add index on `query_history.user_id`
  - Add index on `saved_outputs.user_id`
  
  ## 2. RLS Policy Optimization
  - Update all RLS policies to use `(select auth.uid())` instead of `auth.uid()` for better performance
  - This prevents re-evaluation of auth functions for each row
  
  ## 3. Primary Key for Payments Table
  - Add `id` column as primary key to `payments` table
  
  ## 4. Remove Duplicate Policies
  - Drop duplicate RLS policies on `user_settings` and `user_subscriptions`
  - Keep only the most specific and secure policies
  
  ## 5. Remove Duplicate Constraints
  - Drop duplicate unique constraints on `user_settings` and `user_subscriptions`
  
  ## 6. Remove Unused Indexes
  - Drop `idx_default_settings_api_key` as it's not being used
  
  ## 7. Add RLS Policies for Tables Without Policies
  - Add restrictive policies for `stripe_webhook_events` (service role only)
  - Add restrictive policies for `webhook_test_logs` (service role only)
  
  ## 8. Fix Function Search Paths
  - Update all functions to have secure search paths
*/

-- ============================================================================
-- 1. ADD MISSING INDEXES FOR FOREIGN KEYS
-- ============================================================================

-- Index for query_history.parent_query_id foreign key
CREATE INDEX IF NOT EXISTS idx_query_history_parent_query_id 
ON query_history(parent_query_id);

-- Index for query_history.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_query_history_user_id 
ON query_history(user_id);

-- Index for saved_outputs.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_saved_outputs_user_id 
ON saved_outputs(user_id);

-- ============================================================================
-- 2. ADD PRIMARY KEY TO PAYMENTS TABLE
-- ============================================================================

-- Add id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' AND column_name = 'id'
  ) THEN
    ALTER TABLE payments ADD COLUMN id uuid DEFAULT extensions.uuid_generate_v4();
  END IF;
END $$;

-- Add primary key constraint
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_pkey;
ALTER TABLE payments ADD CONSTRAINT payments_pkey PRIMARY KEY (id);

-- ============================================================================
-- 3. REMOVE UNUSED INDEXES
-- ============================================================================

DROP INDEX IF EXISTS idx_default_settings_api_key;

-- ============================================================================
-- 4. REMOVE DUPLICATE CONSTRAINTS (which will remove their indexes)
-- ============================================================================

-- For user_settings, keep primary key and drop the unique constraint
ALTER TABLE user_settings DROP CONSTRAINT IF EXISTS user_settings_user_id_key;

-- For user_subscriptions, keep primary key and drop the unique constraint
ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_user_id_key;

-- ============================================================================
-- 5. REMOVE DUPLICATE RLS POLICIES
-- ============================================================================

-- Drop all existing policies on user_settings to start fresh
DROP POLICY IF EXISTS "Enable all operations for users based on user_id" ON user_settings;
DROP POLICY IF EXISTS "Enable insert for all users" ON user_settings;
DROP POLICY IF EXISTS "Enable insert for new signups" ON user_settings;
DROP POLICY IF EXISTS "Users can read own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;

-- Drop duplicate policies on user_subscriptions
DROP POLICY IF EXISTS "Enable all operations for users based on user_id" ON user_subscriptions;
DROP POLICY IF EXISTS "Enable insert for new signups" ON user_subscriptions;
DROP POLICY IF EXISTS "Enable read access for users" ON user_subscriptions;
DROP POLICY IF EXISTS "Enable insert access for users" ON user_subscriptions;
DROP POLICY IF EXISTS "Enable update access for users" ON user_subscriptions;

-- Drop existing policies on query_history
DROP POLICY IF EXISTS "Enable read access for users" ON query_history;
DROP POLICY IF EXISTS "Enable insert access for users" ON query_history;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON query_history;

-- Drop existing policies on saved_outputs
DROP POLICY IF EXISTS "Users can view their own saved outputs" ON saved_outputs;
DROP POLICY IF EXISTS "Users can insert their own saved outputs" ON saved_outputs;
DROP POLICY IF EXISTS "Users can delete their own saved outputs" ON saved_outputs;

-- ============================================================================
-- 6. OPTIMIZE RLS POLICIES WITH SELECT SUBQUERIES
-- ============================================================================

-- user_settings policies (optimized with SELECT)
CREATE POLICY "Users can read own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Allow anon users to insert initial settings (for new signups)
CREATE POLICY "Allow initial settings insert"
  ON user_settings FOR INSERT
  TO anon
  WITH CHECK (user_id = (select auth.uid()));

-- user_subscriptions policies (optimized with SELECT)
CREATE POLICY "Users can read own subscription"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own subscription"
  ON user_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Allow initial subscription insert"
  ON user_subscriptions FOR INSERT
  TO anon
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own subscription"
  ON user_subscriptions FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- query_history policies (optimized with SELECT)
CREATE POLICY "Users can read own queries"
  ON query_history FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own queries"
  ON query_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own queries"
  ON query_history FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- saved_outputs policies (optimized with SELECT)
CREATE POLICY "Users can read own saved outputs"
  ON saved_outputs FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own saved outputs"
  ON saved_outputs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own saved outputs"
  ON saved_outputs FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- 7. ADD POLICIES FOR TABLES WITH RLS ENABLED BUT NO POLICIES
-- ============================================================================

-- stripe_webhook_events: Only service role should access
DROP POLICY IF EXISTS "Service role only access" ON stripe_webhook_events;
CREATE POLICY "Service role only access"
  ON stripe_webhook_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- webhook_test_logs: Only service role should access
DROP POLICY IF EXISTS "Service role only access" ON webhook_test_logs;
CREATE POLICY "Service role only access"
  ON webhook_test_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 8. FIX FUNCTION SEARCH PATHS
-- ============================================================================

-- Drop existing functions before recreating
DROP FUNCTION IF EXISTS find_user_by_email(text);
DROP FUNCTION IF EXISTS find_user_by_stripe_customer_id(text);
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS create_user_subscription(uuid);

-- Update find_user_by_email function
CREATE FUNCTION find_user_by_email(user_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  user_uuid uuid;
BEGIN
  SELECT id INTO user_uuid
  FROM auth.users
  WHERE email = user_email;
  
  RETURN user_uuid;
END;
$$;

-- Update find_user_by_stripe_customer_id function
CREATE FUNCTION find_user_by_stripe_customer_id(customer_id text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  user_uuid uuid;
BEGIN
  SELECT user_id INTO user_uuid
  FROM user_subscriptions
  WHERE stripe_customer_id = customer_id;
  
  RETURN user_uuid;
END;
$$;

-- Update update_updated_at_column function
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- Recreate triggers for update_updated_at_column
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_query_history_updated_at
  BEFORE UPDATE ON query_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update create_user_subscription function
CREATE FUNCTION create_user_subscription(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO user_subscriptions (user_id, queries_remaining, trial_end_date)
  VALUES (user_uuid, 4, NOW() + INTERVAL '30 days')
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;
