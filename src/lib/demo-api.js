import { supabase } from '@/lib/supabase';

const DEMO_QUERY_LIMIT = 7;

export const getDemoQueryCount = () => {
  const count = localStorage.getItem('demo_query_count');
  return count ? parseInt(count, 10) : 0;
};

export const incrementDemoQueryCount = () => {
  const currentCount = getDemoQueryCount();
  const newCount = currentCount + 1;
  localStorage.setItem('demo_query_count', newCount.toString());
  return newCount;
};

export const getDemoQueriesRemaining = () => {
  return Math.max(0, DEMO_QUERY_LIMIT - getDemoQueryCount());
};

export const canMakeDemoQuery = () => {
  return getDemoQueryCount() < DEMO_QUERY_LIMIT;
};

export const resetDemoQueryCount = () => {
  localStorage.removeItem('demo_query_count');
};

export const makeClaudeDemoRequest = async (messages) => {
  try {
    if (!canMakeDemoQuery()) {
      throw new Error('Demo query limit reached. Please sign up to continue.');
    }

    const systemMessage = messages.find(msg => msg.role === 'system');
    const userMessages = messages.filter(msg => msg.role !== 'system');

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/claude-proxy-demo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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

    // Increment the demo query count after successful request
    incrementDemoQueryCount();

    return data.content[0].text;
  } catch (error) {
    console.error('Demo Claude API Error:', error);
    throw error;
  }
};

export const getSystemPrompt = async (queryType) => {
  try {
    const { data, error } = await supabase
      .from("system_prompts")
      .select("prompt_text")
      .eq("query_type", queryType)
      .single();
    
    if (error) throw error;
    return data.prompt_text;
  } catch (error) {
    console.error("Error fetching system prompt:", error);
    throw new Error("Could not load the required configuration.");
  }
};