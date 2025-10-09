import { supabase } from '@/lib/supabase';

export const getApiKey = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    const { data: settings, error: settingsError } = await supabase
      .from('default_settings')
      .select('openai_api_key')
      .limit(1)
      .single();

    if (settingsError) {
      console.error('Settings error:', settingsError);
      throw new Error('Failed to retrieve API key from settings');
    }

    const apiKey = settings?.openai_api_key;

    if (!apiKey) {
      throw new Error('No API key found in settings');
    }

    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      console.error('Subscription error:', subscriptionError);
      throw new Error('Failed to check subscription status');
    }

    if (
      subscription?.is_admin || 
      subscription?.is_subscribed || 
      (subscription && subscription.queries_remaining > 0)
    ) {
      return apiKey;
    }

    throw new Error('Please subscribe to continue using the service');
  } catch (error) {
    console.error('Error getting API key:', error);
    throw error;
  }
};

export const makeOpenAIRequest = async (messages) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session found');

    const systemMessage = messages.find(msg => msg.role === 'system');
    const userMessages = messages.filter(msg => msg.role !== 'system');

    const response = await fetch("https://oirtcplqedetfhzrdgas.supabase.co/functions/v1/claude-proxy-live", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
        "Accept": "application/json"
      },
      body: JSON.stringify({
        messages: userMessages,
        system: systemMessage?.content || "",
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'API request failed');
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Claude API Error:', error);
    throw error;
  }
};
