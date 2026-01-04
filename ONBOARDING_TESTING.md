# Onboarding Wizard - Testing Guide

## Overview
The onboarding wizard is a 4-step interactive tutorial that guides new users through the WriteStuffAssistant platform. It appears automatically after first login and can be skipped or completed.

## Features
✅ **Multi-Step Flow**: 4 comprehensive slides covering product value, features, and usage
✅ **Persistent State**: Uses `has_seen_onboarding` flag in database
✅ **Responsive Design**: Works on mobile, tablet, and desktop
✅ **Skip Option**: Users can skip and won't see it again
✅ **Direct Navigation**: Can click categories to jump to specific pages
✅ **Visual Consistency**: Matches site design with gradients and typography

## Database Schema

**Table**: `user_subscriptions`

**New Column**: `has_seen_onboarding`
- Type: `boolean`
- Default: `false` (new users see onboarding)
- Nullable: Yes
- Purpose: Tracks whether user has completed or skipped the wizard

## Onboarding Steps

### Step 1: Welcome & Value Proposition
- **Content**: Platform introduction and value proposition
- **Highlights**:
  - 10-day free trial with full features
  - 6 specialized writing modules
  - AI-powered creative assistance
- **Visual**: Sparkles icon with blue gradient
- **CTA**: "Next" button to continue

### Step 2: Category Overview
- **Content**: Overview of 6 writing categories
- **Categories Displayed**:
  1. Fictional Prose - Novels, short stories, creative fiction
  2. Poetry - Verses, forms, and poetic imagery
  3. Stage & Screen - Scripts for theatre, film, and TV
  4. Nonfiction Writing - Essays, articles, and reports
  5. Online Content - Blogs, social media, and web copy
  6. Songwriting - Lyrics, structure, and musical ideas
- **Features**:
  - Click any category card to navigate immediately
  - Color-coded gradients matching dashboard
  - Icons for visual recognition
- **CTA**: "Next" or click a category

### Step 3: How to Generate Content
- **Content**: Step-by-step guide to using the platform
- **Instructions**:
  1. Select a Category - Choose from dashboard
  2. Enter Your Prompt - Fill in details (genre, tone, setting, etc.)
  3. Generate & Refine - Create content and use follow-ups
- **Pro Tip**: How to use follow-up questions effectively
- **Visual**: Numbered steps with colored icons
- **CTA**: "Next" button

### Step 4: Resources & Next Steps
- **Content**: Platform resources and features
- **Resources Highlighted**:
  - Demo Mode - Try features without using trial
  - History Page - Access saved conversations
  - Subscription Management - View trial status
  - Resources/Blog - Writing tips and inspiration
- **Visual**: 4 cards with gradient icons
- **CTA**: "Start Writing" button to complete onboarding

## Testing Instructions

### 1. Test with New User Account

**Create New Account:**
1. Sign out if currently logged in
2. Go to `/auth?tab=signup`
3. Create a new account with email/password
4. Verify email if required
5. Sign in with new account

**Expected Behavior:**
- ✅ Onboarding wizard appears immediately after first login
- ✅ Modal overlay covers the page
- ✅ Cannot close by clicking outside
- ✅ Progress bar shows Step 1/4

**Navigate Through Wizard:**
1. Click "Next" to progress through steps
2. Verify all 4 steps display correctly
3. Click "Back" to return to previous steps
4. Check that content is readable and properly formatted
5. Verify icons and gradients display correctly

**Complete Onboarding:**
1. Reach Step 4
2. Click "Start Writing"
3. Wizard should close
4. Refresh page - **wizard should NOT reappear**

### 2. Test Skip Functionality

**Create Another New Account:**
1. Create a fresh test account
2. When wizard appears, click "Skip" in top-right corner

**Expected Behavior:**
- ✅ Wizard closes immediately
- ✅ User can access the application normally
- ✅ Refresh page - wizard does NOT reappear
- ✅ Database flag is set to `true`

### 3. Test Category Click Navigation

**Create Another New Account:**
1. Log in with new account
2. Navigate to Step 2 (Category Overview)
3. Click on any category card (e.g., "Fictional Prose")

**Expected Behavior:**
- ✅ Wizard closes
- ✅ User is navigated to the selected category page
- ✅ Database flag is set to `true`
- ✅ Wizard doesn't reappear on navigation

### 4. Test Existing User Behavior

**For existing users (created before onboarding feature):**
1. Sign in with an existing account
2. Navigate to dashboard

**Expected Behavior:**
- ✅ Wizard does NOT appear
- ✅ `has_seen_onboarding` is set to `true` by migration
- ✅ Normal functionality works as before

### 5. Test Responsive Design

**Mobile (< 640px):**
1. Open in mobile device or responsive mode
2. Go through onboarding wizard

**Expected:**
- ✅ Single column layout for category cards
- ✅ Text is readable without horizontal scroll
- ✅ Buttons are easily tappable
- ✅ Progress bars display correctly

**Tablet (640px - 1024px):**
- ✅ 2-column layout for category cards
- ✅ Proper spacing and padding

**Desktop (> 1024px):**
- ✅ 3-column layout for category cards
- ✅ Modal centered and appropriately sized
- ✅ Max width maintained (4xl)

### 6. Test Database State

**Check Database Flag:**

```sql
-- Check if flag is set correctly
SELECT
  user_id,
  has_seen_onboarding,
  created_at
FROM user_subscriptions
WHERE user_id = 'YOUR_USER_ID';
```

**Expected Values:**
- New user before onboarding: `false`
- New user after completing: `true`
- New user after skipping: `true`
- Existing user: `true`

**Reset for Testing:**

```sql
-- Reset onboarding flag for a test user
UPDATE user_subscriptions
SET has_seen_onboarding = false
WHERE user_id = 'YOUR_TEST_USER_ID';
```

After resetting, sign in again to see the wizard.

### 7. Test Edge Cases

**Test: Close and Reopen Browser**
1. Start onboarding wizard
2. Navigate to Step 2
3. Close browser completely
4. Reopen and sign in

**Expected:**
- ✅ Wizard appears again from Step 1
- ✅ User hasn't completed, so flag is still `false`

**Test: Multiple Tabs**
1. Open application in Tab 1
2. Complete onboarding
3. Open application in Tab 2 (already signed in)

**Expected:**
- ✅ Tab 2 should not show onboarding
- ✅ Flag persists across tabs

**Test: Sign Out and Sign In**
1. Complete onboarding
2. Sign out
3. Sign in again

**Expected:**
- ✅ Wizard does NOT appear
- ✅ Flag persists after sign out/in

## Verification Checklist

Before deploying, verify:

- [ ] Database migration applied successfully
- [ ] `has_seen_onboarding` column exists with default `false`
- [ ] Existing users have flag set to `true`
- [ ] New accounts show wizard on first login
- [ ] Skip button works and sets flag
- [ ] Complete button works and sets flag
- [ ] Wizard doesn't reappear after completion
- [ ] Category navigation works from Step 2
- [ ] All 4 steps display correct content
- [ ] Progress bar updates correctly
- [ ] Back button works (except on Step 1)
- [ ] Next button works on all steps
- [ ] Responsive design works on all screen sizes
- [ ] No console errors
- [ ] No layout shifts or visual glitches
- [ ] Doesn't interfere with existing features
- [ ] Analytics/ads tracking still works

## Manual SQL Queries

### View All Onboarding Status
```sql
SELECT
  us.user_id,
  au.email,
  us.has_seen_onboarding,
  us.created_at,
  us.is_subscribed
FROM user_subscriptions us
LEFT JOIN auth.users au ON us.user_id = au.id
ORDER BY us.created_at DESC
LIMIT 20;
```

### Count Users by Onboarding Status
```sql
SELECT
  has_seen_onboarding,
  COUNT(*) as user_count
FROM user_subscriptions
GROUP BY has_seen_onboarding;
```

### Find Users Who Haven't Seen Onboarding
```sql
SELECT
  us.user_id,
  au.email,
  us.created_at
FROM user_subscriptions us
LEFT JOIN auth.users au ON us.user_id = au.id
WHERE us.has_seen_onboarding = false
ORDER BY us.created_at DESC;
```

### Reset Onboarding for All Test Users
```sql
-- CAUTION: Only use in development!
UPDATE user_subscriptions
SET has_seen_onboarding = false
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email LIKE '%test%' OR email LIKE '%demo%'
);
```

## Troubleshooting

### Issue: Wizard doesn't appear for new users
**Check:**
1. Verify user is authenticated: `localStorage.getItem('isAuthenticated')`
2. Check database: `has_seen_onboarding` should be `false`
3. Check browser console for errors
4. Verify `userId` is passed to `useOnboarding` hook

**Fix:**
```sql
UPDATE user_subscriptions
SET has_seen_onboarding = false
WHERE user_id = 'USER_ID';
```

### Issue: Wizard keeps reappearing
**Check:**
1. Verify database update is working
2. Check browser console for API errors
3. Ensure Supabase RLS policies allow update

**Fix:**
- Check network tab for failed UPDATE requests
- Verify RLS policies on `user_subscriptions` table

### Issue: Wizard appears for existing users
**Check:**
1. Verify migration set existing users to `true`
2. Check database for user's flag value

**Fix:**
```sql
UPDATE user_subscriptions
SET has_seen_onboarding = true
WHERE created_at < '2026-01-04'; -- Date before onboarding feature
```

### Issue: Visual glitches or layout issues
**Check:**
1. Browser console for CSS errors
2. Verify all Radix UI dependencies installed
3. Check responsive breakpoints

**Fix:**
- Clear browser cache
- Rebuild project: `npm run build`
- Check Tailwind classes are correct

## Integration Notes

### Components Modified
- ✅ `/src/App.jsx` - Added wizard integration
- ✅ `/src/components/OnboardingWizard.jsx` - New component (created)
- ✅ `/src/lib/hooks/useOnboarding.jsx` - New hook (created)

### Database Changes
- ✅ `user_subscriptions` table - Added `has_seen_onboarding` column
- ✅ Migration file: `add_onboarding_flag.sql`

### Dependencies
- All dependencies already exist in package.json
- No new packages required
- Uses existing Radix UI components

## Analytics Tracking

The onboarding wizard does NOT interfere with existing analytics. Page views and events should still fire normally because:

- Wizard is a modal overlay (doesn't change URL)
- Doesn't prevent page view tracking
- Doesn't block script execution
- Category clicks navigate normally (triggers page views)

To verify analytics:
1. Open browser dev tools → Network
2. Filter for analytics/Google Ads requests
3. Complete onboarding
4. Verify tracking requests still fire

## Next Steps

After successful testing:

1. ✅ Monitor user adoption rate
2. ✅ Track wizard completion vs. skip rate
3. ✅ Gather user feedback
4. ✅ Consider A/B testing different content
5. ✅ Add optional video tutorials in future iteration

## SQL Query for Analytics

```sql
-- Onboarding completion rate
SELECT
  COUNT(*) FILTER (WHERE has_seen_onboarding = true) as completed,
  COUNT(*) FILTER (WHERE has_seen_onboarding = false) as not_completed,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE has_seen_onboarding = true) / COUNT(*),
    2
  ) as completion_rate_percentage
FROM user_subscriptions
WHERE created_at > '2026-01-04'; -- After onboarding launch
```

## Support

If issues persist:
1. Check browser console for JavaScript errors
2. Verify Supabase connection is working
3. Test in incognito mode to rule out cache issues
4. Check RLS policies allow reads and updates
5. Verify user session is valid
