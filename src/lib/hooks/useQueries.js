import { useCallback, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/hooks/useAuth';
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
            console.log('handleQuery: No user found');
            toast({
                title: 'Authentication Error',
                description: 'You must be logged in to perform this action.',
                variant: 'destructive',
            });
            return { success: false, reason: 'Not authenticated' };
        }

        try {
            console.log('handleQuery called with:', { 
                queryType, 
                queryText: queryText.substring(0, 100) + '...', 
                responseText: responseText.substring(0, 100) + '...', 
                shouldSave, 
                conversationIdToUpdate,
                userId: user.id 
            });
            
            const { data: subscription, error: subscriptionError } = await supabase
                .from('user_subscriptions')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (subscriptionError && subscriptionError.code !== 'PGRST116') { // Ignore 'exact one row' error
                console.error('Subscription error:', subscriptionError);
                throw new Error('Could not verify subscription status.');
            }

            const canQuery = subscription?.is_admin || subscription?.is_subscribed || (subscription?.queries_remaining > 0);

            if (!canQuery) {
                return { success: false, reason: 'Please subscribe or renew to continue.' };
            }

            if (shouldSave) {
                console.log('Saving to database...');
                 if (conversationIdToUpdate) {
                     console.log('Updating existing conversation ID:', conversationIdToUpdate);
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

                    if (error) {
                        console.error('Update error:', error);
                        console.error('Update error details:', JSON.stringify(error, null, 2));
                        throw error;
                    }
                    console.log('Updated conversation:', data);
                    
                    // Refresh subscription data
                    setSubscriptionData(prev => ({
                        ...prev,
                        queries_used: (prev?.queries_used || 0) + 1,
                        queries_remaining: Math.max(0, (prev?.queries_remaining || 0) - 1)
                    }));
                    
                    return { success: true, data };
                } else {
                    console.log('Creating new history entry...');
                    console.log('Insert data:', {
                        user_id: user.id,
                        query_type: queryType,
                        query_text: queryText.substring(0, 100) + '...',
                        response_text: responseText.substring(0, 100) + '...'
                    });
                    
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
                    
                    if (error) {
                        console.error('Insert error:', error);
                        console.error('Insert error details:', JSON.stringify(error, null, 2));
                        throw error;
                    }
                    console.log('Created new history entry:', data);
                    
                     if (subscription && !subscription.is_admin && !subscription.is_subscribed) {
                         console.log('Updating query count...');
                        const { error: updateError } = await supabase
                            .from('user_subscriptions')
                            .update({ 
                                queries_used: (subscription.queries_used || 0) + 1,
                                queries_remaining: Math.max(0, (subscription.queries_remaining || 0) - 1)
                            })
                            .eq('user_id', user.id);
                        
                        if (updateError) {
                            console.error('Error updating subscription:', updateError);
                        } else {
                            console.log('Successfully updated query count');
                            // Update local state
                            setSubscriptionData(prev => ({
                                ...prev,
                                queries_used: (prev?.queries_used || 0) + 1,
                                queries_remaining: Math.max(0, (prev?.queries_remaining || 0) - 1)
                            }));
                        }
                    }

                    return { success: true, data };
                }

            }

            return { success: true };

        } catch (error) {
            console.error('Error handling query:', error);
            console.error('Full error details:', JSON.stringify(error, null, 2));
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