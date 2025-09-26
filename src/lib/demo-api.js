import { supabase } from '@/lib/supabase';

// Demo API key will be set here - placeholder for now
const DEMO_API_KEY = 'DEMO_API_KEY_PLACEHOLDER';

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

export const makeOpenAIDemoRequest = async (messages) => {
  try {
    if (!canMakeDemoQuery()) {
      throw new Error('Demo query limit reached. Please sign up to continue.');
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEMO_API_KEY}`,
        "Accept": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'API request failed');
    }

    const data = await response.json();
    
    // Increment the demo query count after successful request
    incrementDemoQueryCount();
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Demo OpenAI API Error:', error);
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