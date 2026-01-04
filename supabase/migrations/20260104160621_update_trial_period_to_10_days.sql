/*
  # Update Trial Period from 30 Days to 10 Days
  
  1. Purpose
     - Change the trial period from 30 days to 10 days full-featured trial
     - Update the create_user_subscription function to reflect new trial duration
  
  2. Changes
     - Recreate the create_user_subscription function with 10-day interval
     - This ensures all new sign-ups receive a 10-day trial
  
  3. Notes
     - Existing users will retain their current trial_end_date
     - Only new signups will get the 10-day trial period
*/

-- Drop and recreate the function with new trial duration
CREATE OR REPLACE FUNCTION create_user_subscription(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO user_subscriptions (user_id, queries_remaining, trial_end_date)
  VALUES (user_uuid, 4, NOW() + INTERVAL '10 days')
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;