import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { CreditCard, Clock } from "lucide-react";

function TrialStatusHeader() {
  const navigate = useNavigate();
  const { is_subscribed, days_remaining, isTrialActive, isTrialExpired, loading } = useSubscription();

  if (loading) return null;

  if (is_subscribed) {
    return null;
  }

  if (isTrialActive()) {
    return (
      <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-black py-2.5 px-4 text-center border-b border-yellow-600/30">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="font-semibold text-sm">
              10-Day Trial: {days_remaining} {days_remaining === 1 ? 'day' : 'days'} remaining
            </span>
          </div>
          <Button
            onClick={() => navigate('/dashboard')}
            size="sm"
            className="bg-black text-yellow-400 hover:bg-zinc-900 hover:text-yellow-300 font-bold h-7 px-4 text-xs border border-yellow-400/30"
          >
            <CreditCard className="h-3 w-3 mr-1.5" />
            Subscribe Early - Only $5/month
          </Button>
        </div>
      </div>
    );
  }

  if (isTrialExpired()) {
    return (
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-2.5 px-4 text-center border-b border-red-800/30">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="font-semibold text-sm">
            Your trial has ended
          </span>
          <Button
            onClick={() => navigate('/dashboard')}
            size="sm"
            className="bg-white text-red-600 hover:bg-gray-100 font-bold h-7 px-4 text-xs"
          >
            <CreditCard className="h-3 w-3 mr-1.5" />
            Subscribe Now - Only $5/month
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

export default TrialStatusHeader;
