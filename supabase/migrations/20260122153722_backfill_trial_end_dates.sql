/*
  # Backfill Trial End Dates for Existing Users

  1. Changes
    - Updates existing user_subscriptions records that have no trial_end_date set
    - Sets trial_end_date to created_at + 10 days for non-subscribed users
    - Ensures all users get their full 10-day trial period
  
  2. Security
    - No RLS changes, only data updates
  
  3. Important Notes
    - Only affects users who are not currently subscribed
    - Only updates records where trial_end_date is currently NULL
    - Uses the created_at timestamp to calculate when the trial should end
*/

UPDATE user_subscriptions
SET trial_end_date = created_at + INTERVAL '10 days'
WHERE trial_end_date IS NULL
  AND is_subscribed = false;
