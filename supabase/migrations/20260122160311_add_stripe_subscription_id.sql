/*
  # Add stripe_subscription_id column

  1. Changes
    - Add `stripe_subscription_id` column to `user_subscriptions` table
      - This stores the Stripe subscription ID for active subscriptions
      - Needed to manage subscription cancellations and updates
    
  2. Notes
    - Column is nullable since users may not have a subscription yet
    - Will be populated when a subscription is created via Stripe webhook
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_subscriptions' AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE user_subscriptions 
    ADD COLUMN stripe_subscription_id text;
  END IF;
END $$;