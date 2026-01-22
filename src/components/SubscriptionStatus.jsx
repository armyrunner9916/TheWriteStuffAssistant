import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { createPortalSession } from "@/lib/stripe";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { CreditCard, Loader2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

function SubscriptionStatus({ className }) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [subscribeLoading, setSubscribeLoading] = React.useState(false);
  const {
    is_subscribed,
    trial_end_date,
    days_remaining,
    isTrialActive,
    isTrialExpired,
    refreshSubscription
  } = useSubscription();

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      const url = await createPortalSession();
      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to open billing portal. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleSubscribeClick = async () => {
    setSubscribeLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to subscribe.",
          variant: "destructive",
        });
        navigate('/signin');
        return;
      }

      const url = await createPortalSession();
      window.location.href = url;
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to open subscription portal. Please try again.",
        variant: "destructive",
      });
      setSubscribeLoading(false);
    }
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
          {is_subscribed ? (
            <>
              <p className="text-xs text-green-500 font-semibold">Your subscription is active</p>
              <Button
                onClick={handleManageBilling}
                disabled={loading}
                className="w-full text-xs bg-yellow-400 text-black hover:bg-yellow-500"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Manage Billing'
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Manage your subscription and payment methods
              </p>
            </>
          ) : isTrialActive() ? (
            <>
              <div className="flex items-center gap-2 text-yellow-400">
                <Clock className="h-4 w-4" />
                <p className="text-xs font-semibold">
                  10-Day Trial: {days_remaining} {days_remaining === 1 ? 'day' : 'days'} remaining
                </p>
              </div>
              <Button
                onClick={handleSubscribeClick}
                disabled={subscribeLoading}
                className="w-full bg-yellow-400 text-black hover:bg-yellow-500 text-xs font-bold"
              >
                {subscribeLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Subscribe Early - Only $5/month'
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Subscribe now to continue using all features after your trial ends
              </p>
            </>
          ) : isTrialExpired() ? (
            <>
              <p className="text-xs text-red-400 font-semibold">Your trial has ended</p>
              <Button
                onClick={handleSubscribeClick}
                disabled={subscribeLoading}
                className="w-full bg-yellow-400 text-black hover:bg-yellow-500 text-xs font-bold"
              >
                {subscribeLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Subscribe Now - Only $5/month'
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Subscribe to continue using all features
              </p>
            </>
          ) : (
            <>
              <p className="text-xs text-yellow-400">No active subscription</p>
              <Button
                onClick={handleSubscribeClick}
                disabled={subscribeLoading}
                className="w-full bg-yellow-400 text-black hover:bg-yellow-500 text-xs"
              >
                {subscribeLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Subscribe Now - Only $5/month'
                )}
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