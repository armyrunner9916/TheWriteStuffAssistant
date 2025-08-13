import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createSubscription } from "@/lib/stripe";

function SubscriptionDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-yellow-400">Trial Period Ended</DialogTitle>
          <DialogDescription className="text-lg mt-4">
            Your free trial has expired. Subscribe now to continue using all features and access your query history.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">✓</span>
            <p>Unlimited queries</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">✓</span>
            <p>Full access to all features</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">✓</span>
            <p>Complete query history</p>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={createSubscription}
            className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
          >
            Subscribe Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SubscriptionDialog;