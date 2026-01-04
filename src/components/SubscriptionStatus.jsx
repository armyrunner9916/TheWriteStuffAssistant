import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { createSubscription } from "@/lib/stripe";
import { CreditCard } from "lucide-react";

function SubscriptionStatus({ isSubscribed, subscriptionEndDate, className }) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [trialEndDate, setTrialEndDate] = React.useState(null);

  React.useEffect(() => {
    const fetchTrialStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('trial_end_date')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (data) setTrialEndDate(data.trial_end_date);
      } catch (error) {
        console.error('Error fetching trial status:', error);
      }
    };

    fetchTrialStatus();
  }, []);

  const handleUnsubscribe = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          is_subscribed: false,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Unsubscribed Successfully",
        description: "Your subscription will remain active until the end of your current billing period.",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to process unsubscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Card className={`h-full cursor-pointer hover:shadow-lg transition-shadow bg-opacity-25 backdrop-blur-sm ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-4">
          <CreditCard className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Subscription Status</h2>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isSubscribed ? (
            <>
              <p className="text-xs text-green-500">Your subscription is active</p>
              {subscriptionEndDate && (
                <p className="text-xs">Next billing date: {new Date(subscriptionEndDate).toLocaleDateString()}</p>
              )}
              <Button
                onClick={handleUnsubscribe}
                disabled={loading}
                variant="destructive"
                className="w-full text-xs"
              >
                {loading ? "Processing..." : "Cancel Subscription"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Your subscription will remain active until the end of your current billing period.
              </p>
            </>
          ) : trialEndDate ? (
            <>
              <p className="text-xs">
                10-Day Trial: {getDaysRemaining(trialEndDate)} days remaining
              </p>
              <Button
                onClick={createSubscription}
                className="w-full bg-yellow-400 text-black hover:bg-yellow-500 text-xs"
              >
                Subscribe Now
              </Button>
              <p className="text-xs text-muted-foreground">
                Subscribe to continue using all features after your trial ends.
              </p>
            </>
          ) : (
            <>
              <p className="text-xs text-yellow-400">No active subscription</p>
              <Button
                onClick={createSubscription}
                className="w-full bg-yellow-400 text-black hover:bg-yellow-500 text-xs"
              >
                Subscribe Now
              </Button>
              <p className="text-xs text-muted-foreground">
                Get unlimited access to all features
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default SubscriptionStatus;