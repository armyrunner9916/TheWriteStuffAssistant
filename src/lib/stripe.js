import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/lib/supabase';

    export const stripePromise = loadStripe('pk_live_51RHt8yC8j5ZYmSqnQyuwWApe0c4hkctb95rIlfBvWF7A61VqV3QDOd5ba1S9jCaQ78g1aUDTrxgBat9AKFTgFTug00ekRitI2P');

    export const createSubscription = async (hasTrialEnded = false) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User must be logged in to create subscription');
        }

        // Check if user already has an active subscription
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('is_subscribed, trial_end_date')
          .eq('user_id', user.id)
          .single();

        // If user is already subscribed, redirect to manage subscription
        if (subscription?.is_subscribed) {
          window.location.href = 'https://billing.stripe.com/p/login/test_00000000000000';
          return;
        }

        // Calculate trial end date (30 days from now)
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 30);

        // Create subscription with 30-day trial
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-subscription`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            email: user.email,
            trial_days: 30,
            has_trial_ended: hasTrialEnded
          }),
        });

        const result = await response.json();
        
        if (result.checkout_url) {
          window.location.href = result.checkout_url;
        } else {
          throw new Error(result.error || 'Failed to create subscription');
        }
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    };