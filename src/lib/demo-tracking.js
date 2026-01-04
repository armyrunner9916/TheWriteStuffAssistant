// Demo usage tracking for unauthenticated users
// This module handles anonymous analytics for demo portal interactions

const TRACKING_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-demo-usage`;
const SESSION_ID_KEY = 'demo_session_id';

/**
 * Get or create anonymous session ID
 */
function getSessionId() {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);

  if (!sessionId) {
    // Generate random UUID-like session ID
    sessionId = 'demo_' + crypto.randomUUID();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }

  return sessionId;
}

/**
 * Check if user is authenticated
 */
function isUserAuthenticated() {
  return localStorage.getItem('isAuthenticated') === 'true' ||
         localStorage.getItem('userId') !== null;
}

/**
 * Get basic browser metadata (no PII)
 */
function getMetadata() {
  return {
    locale: navigator.language || 'unknown',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    user_agent_hint: navigator.userAgentData?.platform || 'unknown'
  };
}

/**
 * Track demo usage event
 * @param {string} page - Which assistant/category (e.g., 'prose', 'poetry')
 * @param {string} eventType - Type of event ('start_demo', 'generate_content', 'follow_up')
 * @param {string} promptExcerpt - Optional prompt excerpt (will be truncated)
 */
export async function trackDemoUsage(page, eventType, promptExcerpt = null) {
  // Only track if user is NOT authenticated
  if (isUserAuthenticated()) {
    return;
  }

  try {
    const sessionId = getSessionId();
    const metadata = getMetadata();

    const response = await fetch(TRACKING_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        session_id: sessionId,
        page,
        event_type: eventType,
        prompt_excerpt: promptExcerpt,
        metadata
      })
    });

    if (!response.ok) {
      console.warn('Demo tracking failed:', await response.text());
    }
  } catch (error) {
    // Silently fail - tracking should never break the user experience
    console.warn('Demo tracking error:', error);
  }
}

/**
 * Track page view
 */
export function trackDemoPageView(page) {
  trackDemoUsage(page, 'start_demo');
}

/**
 * Track content generation
 */
export function trackDemoGeneration(page, promptExcerpt) {
  trackDemoUsage(page, 'generate_content', promptExcerpt);
}

/**
 * Track follow-up question
 */
export function trackDemoFollowUp(page, promptExcerpt) {
  trackDemoUsage(page, 'follow_up', promptExcerpt);
}
