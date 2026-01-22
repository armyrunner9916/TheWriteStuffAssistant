import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/hooks/useAuth";

const SubscriptionContext = createContext(null);

export const SubscriptionProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState({
    is_subscribed: false,
    trial_end_date: null,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    days_remaining: 0,
    loading: true,
  });

  const getDaysRemaining = useCallback((endDate) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }, []);

  const fetchSubscriptionData = useCallback(async () => {
    if (!user?.id) {
      setSubscriptionData({
        is_subscribed: false,
        trial_end_date: null,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        days_remaining: 0,
        loading: false,
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('is_subscribed, trial_end_date, stripe_customer_id, stripe_subscription_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription data:', error);
        setSubscriptionData(prev => ({ ...prev, loading: false }));
        return;
      }

      if (data) {
        const daysRemaining = getDaysRemaining(data.trial_end_date);
        setSubscriptionData({
          is_subscribed: data.is_subscribed || false,
          trial_end_date: data.trial_end_date,
          stripe_customer_id: data.stripe_customer_id,
          stripe_subscription_id: data.stripe_subscription_id,
          days_remaining: daysRemaining,
          loading: false,
        });
      } else {
        setSubscriptionData({
          is_subscribed: false,
          trial_end_date: null,
          stripe_customer_id: null,
          stripe_subscription_id: null,
          days_remaining: 0,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Unexpected error fetching subscription:', error);
      setSubscriptionData(prev => ({ ...prev, loading: false }));
    }
  }, [user?.id, getDaysRemaining]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscriptionData();
    }
  }, [isAuthenticated, fetchSubscriptionData]);

  const hasActiveAccess = useCallback(() => {
    if (subscriptionData.is_subscribed) return true;
    if (subscriptionData.trial_end_date && subscriptionData.days_remaining > 0) return true;
    return false;
  }, [subscriptionData.is_subscribed, subscriptionData.trial_end_date, subscriptionData.days_remaining]);

  const isTrialActive = useCallback(() => {
    return !subscriptionData.is_subscribed &&
           subscriptionData.trial_end_date &&
           subscriptionData.days_remaining > 0;
  }, [subscriptionData.is_subscribed, subscriptionData.trial_end_date, subscriptionData.days_remaining]);

  const isTrialExpired = useCallback(() => {
    return !subscriptionData.is_subscribed &&
           subscriptionData.trial_end_date &&
           subscriptionData.days_remaining === 0;
  }, [subscriptionData.is_subscribed, subscriptionData.trial_end_date, subscriptionData.days_remaining]);

  const value = {
    ...subscriptionData,
    hasActiveAccess,
    isTrialActive,
    isTrialExpired,
    refreshSubscription: fetchSubscriptionData,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};
