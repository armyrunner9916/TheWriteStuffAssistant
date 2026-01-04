/*
  # Add Onboarding Tracking to User Subscriptions

  1. Purpose
     - Track whether users have completed the onboarding wizard
     - Ensure onboarding only shows once per user
     - Allow users to skip and mark as completed

  2. Changes
     - Add `has_seen_onboarding` boolean column to `user_subscriptions`
     - Default to false for new users
     - Existing users default to true (assume they don't need onboarding)

  3. Notes
     - Existing users won't see onboarding (set to true by default)
     - New users will see onboarding on first login (false by default for new records going forward)
*/

-- Add has_seen_onboarding column to user_subscriptions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_subscriptions' AND column_name = 'has_seen_onboarding'
  ) THEN
    ALTER TABLE user_subscriptions 
    ADD COLUMN has_seen_onboarding boolean DEFAULT false;
  END IF;
END $$;

-- Set existing users to true (they don't need onboarding)
UPDATE user_subscriptions 
SET has_seen_onboarding = true 
WHERE has_seen_onboarding IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN user_subscriptions.has_seen_onboarding IS 'Tracks whether user has completed or skipped the onboarding wizard';