import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useOnboarding(userId) {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    checkOnboardingStatus();
  }, [userId]);

  const checkOnboardingStatus = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("has_seen_onboarding")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error checking onboarding status:", error);
        setIsLoading(false);
        return;
      }

      if (data) {
        setShouldShowOnboarding(data.has_seen_onboarding === false);
      }
    } catch (error) {
      console.error("Error in checkOnboardingStatus:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markOnboardingComplete = async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("user_subscriptions")
        .update({ has_seen_onboarding: true })
        .eq("user_id", userId);

      if (error) {
        console.error("Error updating onboarding status:", error);
        return;
      }

      setShouldShowOnboarding(false);
    } catch (error) {
      console.error("Error in markOnboardingComplete:", error);
    }
  };

  return {
    shouldShowOnboarding,
    isLoading,
    markOnboardingComplete,
  };
}
