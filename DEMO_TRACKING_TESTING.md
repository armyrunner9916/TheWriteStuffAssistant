# Demo Usage Tracking - Testing Guide

## Overview
The demo usage tracking system anonymously tracks how unauthenticated visitors interact with the demo portal. All data is stored securely and only accessible to admins.

## Security Features
✅ **RLS Enabled**: Only service role can access the table
✅ **No PII Storage**: Session IDs are anonymous UUIDs
✅ **Data Minimization**: Prompts truncated to 100 characters max
✅ **Server-Side Only**: Client cannot directly query the table
✅ **Unauthenticated Only**: Tracking stops when user logs in

## Database Schema

**Table**: `demo_usage_unauthed`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| created_at | timestamptz | When the event occurred |
| session_id | text | Anonymous browser session ID |
| page | text | Which assistant (prose, poetry, etc.) |
| event_type | text | start_demo, generate_content, follow_up |
| prompt_excerpt | text | First 100 chars of user prompt |
| metadata | jsonb | Browser locale, screen size, timezone |

## Testing Instructions

### 1. Test with Private/Incognito Window

1. Open your browser in **Private/Incognito mode**
2. Navigate to the demo portal: `/demo`
3. Click on any assistant category (e.g., Prose, Poetry)
4. Fill out the form and generate content
5. Try a follow-up question

### 2. Verify Data Collection

**Using Supabase Dashboard:**

1. Log into Supabase Dashboard
2. Go to **Table Editor**
3. Select `demo_usage_unauthed` table
4. You should see records with:
   - Your anonymous session_id (starts with "demo_")
   - Page name (e.g., "prose", "poetry")
   - Event types: "start_demo", "generate_content", "follow_up"
   - Truncated prompt excerpts
   - Metadata with browser info

**Using SQL Query:**

```sql
SELECT
  created_at,
  session_id,
  page,
  event_type,
  LEFT(prompt_excerpt, 50) as prompt_preview,
  metadata
FROM demo_usage_unauthed
ORDER BY created_at DESC
LIMIT 20;
```

### 3. Verify Security (RLS)

**Test that client cannot access the table:**

Open browser console on demo page and try:

```javascript
const { createClient } = supabase;
const client = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_ANON_KEY'
);

// This should FAIL with permission error
const { data, error } = await client
  .from('demo_usage_unauthed')
  .select('*');

console.log(error); // Should show "permission denied" or similar
```

**Expected Result**: ❌ Query should fail with RLS error

### 4. Verify Authenticated Users Are NOT Tracked

1. Sign up or log in to the application
2. Use any of the main assistant pages (not demo)
3. Generate content
4. Check the database - **no new records** should appear in `demo_usage_unauthed`

### 5. Verify Session Persistence

1. In a private window, visit demo and generate content
2. Note the session_id in the database
3. **Without closing the window**, navigate to different demo pages
4. All events should have the **same session_id**
5. Close window and reopen - **new session_id** should be generated

### 6. Check Edge Function

**Endpoint**: `{SUPABASE_URL}/functions/v1/track-demo-usage`

The Edge Function should:
- ✅ Accept POST requests only
- ✅ Require session_id, page, event_type
- ✅ Truncate prompt_excerpt to 100 characters
- ✅ Return 200 on success
- ✅ Handle CORS properly

## Expected Event Flow

### First Demo Visit
```
1. User opens /demo/prose
   → Event: { page: "prose", event_type: "start_demo" }

2. User generates content
   → Event: { page: "prose", event_type: "generate_content", prompt_excerpt: "..." }

3. User asks follow-up
   → Event: { page: "prose", event_type: "follow_up", prompt_excerpt: "..." }
```

### Analytics Queries

**Sessions per day:**
```sql
SELECT
  DATE(created_at) as date,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(*) as total_events
FROM demo_usage_unauthed
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

**Most popular demo pages:**
```sql
SELECT
  page,
  COUNT(*) as visits,
  COUNT(DISTINCT session_id) as unique_visitors
FROM demo_usage_unauthed
WHERE event_type = 'start_demo'
GROUP BY page
ORDER BY visits DESC;
```

**Conversion funnel:**
```sql
WITH events AS (
  SELECT
    session_id,
    MAX(CASE WHEN event_type = 'start_demo' THEN 1 ELSE 0 END) as visited,
    MAX(CASE WHEN event_type = 'generate_content' THEN 1 ELSE 0 END) as generated,
    MAX(CASE WHEN event_type = 'follow_up' THEN 1 ELSE 0 END) as followed_up
  FROM demo_usage_unauthed
  GROUP BY session_id
)
SELECT
  COUNT(*) as total_sessions,
  SUM(visited) as visited_demo,
  SUM(generated) as generated_content,
  SUM(followed_up) as used_followup,
  ROUND(100.0 * SUM(generated) / SUM(visited), 2) as generation_rate,
  ROUND(100.0 * SUM(followed_up) / SUM(generated), 2) as followup_rate
FROM events;
```

## Troubleshooting

### No events appearing in database

**Check:**
1. Is localStorage showing `demo_session_id`?
2. Check browser console for errors
3. Verify Edge Function is deployed: `supabase functions list`
4. Check Edge Function logs in Supabase Dashboard

### Events appearing for authenticated users

**Check:**
- Verify `isAuthenticated` in localStorage is 'false' or null
- Check that tracking code checks `isUserAuthenticated()` before sending

### Permission errors

**Check:**
- Edge Function is using `SUPABASE_SERVICE_ROLE_KEY`
- RLS policies are correctly configured
- Table has RLS enabled

## Privacy Compliance

✅ **Anonymous**: No personally identifiable information stored
✅ **Minimal Data**: Only essential interaction data captured
✅ **Truncated**: Prompts limited to 100 characters
✅ **Opt-out Ready**: Can add cookie banner if required
✅ **Admin Only**: Data not exposed to public

## Next Steps

After verifying tracking works:

1. Monitor the data for a few days
2. Create dashboard/charts in Supabase or external tool
3. Use insights to improve demo UX
4. Consider A/B testing different demo flows
5. Add cookie consent banner if legally required
