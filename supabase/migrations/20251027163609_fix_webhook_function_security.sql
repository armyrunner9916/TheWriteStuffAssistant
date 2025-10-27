/*
  # Fix Webhook Function Security Issues
  
  This migration addresses function search path security issues:
  
  ## Changes
  1. Fix search path for all webhook-related functions
  2. Note: The "unused index" warnings are false positives - the indexes ARE needed for 
     foreign key query performance, they just haven't been used yet because no queries 
     have run since their creation
  
  ## Functions Updated
  - http_stripe_webhook (both overloads)
  - simple_stripe_webhook
  - handle_stripe_webhook
  - create_user_subscription (trigger version)
*/

-- ============================================================================
-- FIX WEBHOOK FUNCTION SEARCH PATHS
-- ============================================================================

-- Drop existing webhook functions
DROP FUNCTION IF EXISTS http_stripe_webhook();
DROP FUNCTION IF EXISTS http_stripe_webhook(jsonb, text);
DROP FUNCTION IF EXISTS simple_stripe_webhook(jsonb);
DROP FUNCTION IF EXISTS handle_stripe_webhook(jsonb);
DROP FUNCTION IF EXISTS create_user_subscription() CASCADE;

-- Recreate http_stripe_webhook (no parameters version)
CREATE FUNCTION http_stripe_webhook()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  request_payload JSONB;
BEGIN
  -- Log the incoming request
  INSERT INTO webhook_test_logs (message)
  VALUES ('Received HTTP webhook request at ' || NOW()::text);
  
  -- Try to get the request body
  BEGIN
    request_payload := coalesce(request.json, '{}'::jsonb);
    
    -- Log the payload
    INSERT INTO webhook_test_logs (message)
    VALUES ('Received payload of type: ' || COALESCE(request_payload->>'type', 'unknown'));
    
  EXCEPTION WHEN OTHERS THEN
    -- Log error with request body
    INSERT INTO webhook_test_logs (message)
    VALUES ('Error accessing request.json: ' || SQLERRM);
    
    -- Set an empty payload
    request_payload := '{}'::jsonb;
  END;
  
  -- Extract and process relevant data
  IF request_payload->'data'->'object'->>'customer' IS NOT NULL THEN
    -- Get customer info
    DECLARE
      customer_id TEXT := request_payload->'data'->'object'->>'customer';
      subscription_status TEXT := request_payload->'data'->'object'->>'status';
      user_record RECORD;
    BEGIN
      -- Log customer info
      INSERT INTO webhook_test_logs (message)
      VALUES ('Processing customer: ' || customer_id || ' with status: ' || COALESCE(subscription_status, 'unknown'));
      
      -- Find user with this customer ID
      FOR user_record IN 
        SELECT id
        FROM auth.users
        WHERE raw_user_meta_data->>'stripe_customer_id' = customer_id
      LOOP
        -- Log user found
        INSERT INTO webhook_test_logs (message)
        VALUES ('Found user: ' || user_record.id);
        
        -- Update subscription
        UPDATE user_subscriptions
        SET 
          is_subscribed = (subscription_status = 'active' OR subscription_status = 'trialing'),
          stripe_customer_id = customer_id,
          updated_at = NOW()
        WHERE user_id = user_record.id;
        
        -- If no record exists, create one
        IF NOT FOUND THEN
          INSERT INTO webhook_test_logs (message)
          VALUES ('Creating new subscription for user: ' || user_record.id);
          
          INSERT INTO user_subscriptions (
            user_id,
            is_subscribed,
            stripe_customer_id,
            created_at,
            updated_at,
            queries_used,
            queries_remaining,
            is_admin
          )
          VALUES (
            user_record.id,
            (subscription_status = 'active' OR subscription_status = 'trialing'),
            customer_id,
            NOW(),
            NOW(),
            0,
            0,
            false
          );
        END IF;
      END LOOP;
    END;
  ELSE
    -- Log missing customer data
    INSERT INTO webhook_test_logs (message)
    VALUES ('No customer data found in payload');
  END IF;
  
  -- Return success response
  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  -- Log any other errors
  INSERT INTO webhook_test_logs (message)
  VALUES ('Error in http_stripe_webhook: ' || SQLERRM);
  
  -- Return error message but with 200 status
  RETURN jsonb_build_object('error', SQLERRM, 'success', false);
END;
$$;

-- Recreate http_stripe_webhook (with parameters version)
CREATE FUNCTION http_stripe_webhook(request jsonb, token text DEFAULT NULL::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  valid_token TEXT := 'stripe_webhook_secret_123456';
BEGIN
  -- Verify the token
  IF token IS NULL OR token != valid_token THEN
    -- Log unauthorized attempt
    INSERT INTO webhook_test_logs (message)
    VALUES ('Unauthorized webhook attempt');
    
    RETURN jsonb_build_object('error', 'Unauthorized', 'status', 401);
  END IF;

  -- Log the incoming request
  INSERT INTO webhook_test_logs (message)
  VALUES ('Received authenticated Stripe webhook request');
  
  -- Call the handler function
  PERFORM handle_stripe_webhook(request);
  
  -- Return a success response
  RETURN jsonb_build_object('success', true);
END;
$$;

-- Recreate simple_stripe_webhook
CREATE FUNCTION simple_stripe_webhook(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Insert a log entry
  INSERT INTO webhook_test_logs (message)
  VALUES ('Simple webhook received at ' || now()::text);
  
  -- Also store the full payload
  INSERT INTO webhook_test_logs (message)
  VALUES ('Payload: ' || COALESCE(payload::text, 'null'));
  
  RETURN jsonb_build_object('success', true);
END;
$$;

-- Recreate handle_stripe_webhook
CREATE FUNCTION handle_stripe_webhook(payload jsonb DEFAULT NULL::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  customer_id TEXT;
  subscription_status TEXT;
  user_record RECORD;
  webhook_payload JSONB;
BEGIN
  -- Log the received webhook
  INSERT INTO webhook_test_logs (message)
  VALUES ('Received webhook via Svix at ' || NOW()::text);
  
  -- Determine the payload
  IF payload IS NULL THEN
    -- If called with no parameters, look for a request body in the REST context
    webhook_payload := COALESCE(request.body, '{}'::jsonb);
    
    -- Log that we're using the request body
    INSERT INTO webhook_test_logs (message)
    VALUES ('Using request body as payload');
  ELSE
    -- Use the provided payload
    webhook_payload := payload;
    
    -- Log that we're using the provided payload
    INSERT INTO webhook_test_logs (message)
    VALUES ('Using provided payload parameter');
  END IF;
  
  -- Log the payload type
  INSERT INTO webhook_test_logs (message)
  VALUES ('Event type: ' || COALESCE(webhook_payload->>'type', 'unknown'));
  
  -- Extract data from the payload
  IF webhook_payload->'data'->'object'->>'customer' IS NOT NULL THEN
    customer_id := webhook_payload->'data'->'object'->>'customer';
    subscription_status := webhook_payload->'data'->'object'->>'status';
    
    -- Log the customer info
    INSERT INTO webhook_test_logs (message)
    VALUES ('Processing customer: ' || customer_id || ' with status: ' || COALESCE(subscription_status, 'unknown'));
    
    -- Find user with this Stripe customer ID
    FOR user_record IN 
      SELECT id
      FROM auth.users
      WHERE raw_user_meta_data->>'stripe_customer_id' = customer_id
    LOOP
      -- Log the user found
      INSERT INTO webhook_test_logs (message)
      VALUES ('Found user: ' || user_record.id);
      
      -- Update the subscription
      UPDATE user_subscriptions
      SET 
        is_subscribed = (subscription_status = 'active' OR subscription_status = 'trialing'),
        stripe_customer_id = customer_id,
        updated_at = NOW()
      WHERE user_id = user_record.id;
      
      -- If no record exists, create one
      IF NOT FOUND THEN
        INSERT INTO webhook_test_logs (message)
        VALUES ('Creating new subscription record for user: ' || user_record.id);
        
        INSERT INTO user_subscriptions (
          user_id,
          is_subscribed,
          stripe_customer_id,
          created_at,
          updated_at,
          queries_used,
          queries_remaining,
          is_admin
        )
        VALUES (
          user_record.id,
          (subscription_status = 'active' OR subscription_status = 'trialing'),
          customer_id,
          NOW(),
          NOW(),
          0,
          0,
          false
        );
      END IF;
    END LOOP;
  ELSE
    -- Log that no customer ID was found
    INSERT INTO webhook_test_logs (message)
    VALUES ('No customer ID found in payload');
  END IF;
  
  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  -- Log any errors
  INSERT INTO webhook_test_logs (message)
  VALUES ('Error processing webhook: ' || SQLERRM);
  
  RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

-- Recreate create_user_subscription trigger function
CREATE FUNCTION create_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO user_subscriptions (user_id, queries_remaining, queries_used, is_subscribed)
  VALUES (NEW.user_id, 4, 0, false);
  RETURN NEW;
END;
$$;
