import { useCallback, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/hooks/useAuth.jsx';
import { toast } from '@/components/ui/use-toast';

export const useQueries = () => {
    const { user } = useAuth();
    const [subscriptionData, setSubscriptionData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubscriptionData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('user_subscriptions')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.error('Error fetching subscription:', error);
                } else {
                    setSubscriptionData(data);
                }
            } catch (error) {
                console.error('Error in subscription fetch:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscriptionData();
    }, [user]);

    const handleQuery = useCallback(async (queryType, queryText, responseText, shouldSave = false, conversationIdToUpdate = null) => {
        if (!user) {
            toast({
                title: 'Authentication Error',
                description: 'You must be logged in to perform this action.',
                variant: 'destructive',
            });
            return { success: false, reason: 'Not authenticated' };
        }

        try {
            const { data: subscription, error: subscriptionError } = await supabase
                .from('user_subscriptions')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (subscriptionError && subscriptionError.code !== 'PGRST116') { // Ignore 'exact one row' error
                throw new Error('Could not verify subscription status.');
            }

            const canQuery = subscription?.is_admin || subscription?.is_subscribed || (subscription?.queries_remaining > 0);

            if (!canQuery) {
                return { success: false, reason: 'Please subscribe or renew to continue.' };
            }

            if (shouldSave) {
                 if (conversationIdToUpdate) {
                    const { data, error } = await supabase
                        .from('query_history')
                        .update({ 
                            query_text: queryText, 
                            response_text: responseText,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', conversationIdToUpdate)
                        .select()
                        .single();

                    if (error) throw error;
                    return { success: true, data };
                } else {
                    const { data, error } = await supabase
                        .from('query_history')
                        .insert({
                            user_id: user.id,
                            query_type: queryType,
                            query_text: queryText,
                            response_text: responseText,
                        })
                        .select()
                        .single();
                    if (error) throw error;
                    
                     if (subscription && !subscription.is_admin && !subscription.is_subscribed) {
                        await supabase
                            .from('user_subscriptions')
                            .update({ 
                                queries_used: (subscription.queries_used || 0) + 1,
                                queries_remaining: Math.max(0, (subscription.queries_remaining || 0) - 1)
                            })
                            .eq('user_id', user.id);
                    }

                    return { success: true, data };
                }

            }

            return { success: true };

        } catch (error) {
            console.error('Error handling query:', error);
            return { success: false, reason: error.message };
        }
    }, [user]);

    return { 
        handleQuery,
        isSubscribed: subscriptionData?.is_subscribed || false,
        isAdmin: subscriptionData?.is_admin || false,
        isTrialExpired: subscriptionData ? (subscriptionData.queries_remaining <= 0 && !subscriptionData.is_subscribed && !subscriptionData.is_admin) : false,
        subscriptionEndDate: subscriptionData?.subscription_end_date,
        queriesRemaining: subscriptionData?.queries_remaining || 0
    };
};