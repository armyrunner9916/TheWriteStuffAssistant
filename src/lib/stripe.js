import { loadStripe } from '@stripe/stripe-js';

    export const stripePromise = loadStripe('pk_live_51RHt8yC8j5ZYmSqnQyuwWApe0c4hkctb95rIlfBvWF7A61VqV3QDOd5ba1S9jCaQ78g1aUDTrxgBat9AKFTgFTug00ekRitI2P');

    export const createSubscription = async () => {
      try {
        window.location.href = 'https://buy.stripe.com/fZu9AS0RCgyF9hIgL877O08';
      } catch (error)
{
        console.error('Error:', error);
        throw error;
      }
    };