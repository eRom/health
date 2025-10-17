# PostHog Setup Guide

## 🚀 Quick Start

### 1. Get your PostHog credentials

1. Go to [PostHog](https://app.posthog.com) and create a free account
2. Create a new project (or use an existing one)
3. Copy your **Project API Key** (starts with `phc_`)
4. Note your **host URL**:
   - EU: `https://eu.i.posthog.com`
   - US: `https://us.i.posthog.com`

### 2. Configure environment variables

Add these to your `.env.local` file:

```bash
# PostHog - Product Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_your_actual_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com

# Enable PostHog in development (optional)
NEXT_PUBLIC_POSTHOG_DEV_MODE=true
```

### 3. Restart your dev server

```bash
npm run dev
```

### 4. Verify it's working

Open your browser console - you should see:
- `📊 PostHog: ✅ Enabled in development mode` (if dev mode enabled)
- OR `📊 PostHog: Disabled in development` (if dev mode not enabled)

Navigate to a few pages and check the PostHog dashboard to see events appearing!

---

## 🧪 Development vs Production

### Development Mode

**By default:** PostHog is **disabled** in development to avoid polluting your analytics with test data.

**To enable in development:**
```bash
# Add to .env.local
NEXT_PUBLIC_POSTHOG_DEV_MODE=true
```

This is useful when you want to:
- Test event tracking locally
- Debug analytics implementation
- Verify properties are sent correctly

**Tip:** Use a separate PostHog project for development to keep production data clean!

### Production Mode

PostHog is **automatically enabled** in production (Vercel).

Just add the environment variables to Vercel:
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST`
4. Redeploy

---

## 📊 Events Being Tracked

### Automatic Events
- ✅ **Page views** - Every page navigation (with path, title, locale, referrer)
- ✅ **User identification** - Automatic sync with Better Auth sessions

### Custom Events (Already Implemented)
- ✅ **user_signup_completed** - When user signs up
- ✅ **exercise_completed** - When user finishes an exercise (with score, duration, type)
- ✅ **badge_shared** - When user shares a badge

### Events To Implement (Optional)
- ⏳ **user_login_completed** - Login events
- ⏳ **user_logout** - Logout events
- ⏳ **badge_unlocked** - When user earns a new badge
- ⏳ **subscription_*** - Subscription funnel events
- ⏳ **consent_granted/declined** - GDPR consent events

---

## 🎯 Testing PostHog Locally

### 1. Enable dev mode
```bash
# .env.local
NEXT_PUBLIC_POSTHOG_DEV_MODE=true
```

### 2. Start dev server
```bash
npm run dev
```

### 3. Test events

**Sign up:**
```
http://localhost:3000/fr/register
```
→ Should trigger `user_signup_completed` event

**Complete an exercise:**
Navigate to any exercise (e.g., `/fr/neuro/memory-game`) and complete it.
→ Should trigger `exercise_completed` event

**Share a badge:**
Go to `/fr/badges` and share a badge.
→ Should trigger `badge_shared` event

### 4. Check PostHog dashboard

Go to your PostHog project → Events → Live events
You should see events appearing in real-time!

---

## 🔧 Advanced Configuration

### Session Recording

Session recording is **disabled by default** for GDPR compliance.

To enable (only after user consent):
```typescript
import { enableSessionRecording } from '@/lib/posthog-client'

// After user grants health data consent
enableSessionRecording()
```

### Custom Events (Client-side)

```typescript
'use client'

import { captureEvent } from '@/lib/posthog-client'

function MyComponent() {
  const handleClick = () => {
    captureEvent('button_clicked', {
      button_name: 'Start Exercise',
      exercise_type: 'neuro',
    })
  }

  return <button onClick={handleClick}>Start</button>
}
```

### Custom Events (Server-side)

```typescript
'use server'

import { trackEvent } from '@/lib/analytics/track'

export async function myServerAction() {
  await trackEvent('custom_event', {
    property1: 'value1',
    property2: 'value2',
  })
}
```

### Using Type-Safe Helpers

```typescript
import {
  trackSignup,
  trackLogin,
  trackExerciseCompletion,
  trackBadgeShare,
} from '@/lib/analytics/track'

// Track signup
await trackSignup('email', user.email)

// Track exercise
await trackExerciseCompletion('neuro', 'memory-game', {
  durationSeconds: 120,
  score: 8,
  maxScore: 10,
})

// Track badge share
await trackBadgeShare('badge-123', 'First Steps', 'twitter')
```

---

## 📈 Recommended PostHog Dashboards

### 1. Acquisition Dashboard
- New signups (daily/weekly/monthly)
- Signup conversion rate
- Signup source (direct, referral, etc.)

### 2. Engagement Dashboard
- Daily/Weekly/Monthly active users
- Exercises completed per user
- Badges earned distribution
- Average session duration

### 3. Retention Dashboard
- User retention by cohort (D1, D7, D30)
- Churn rate
- User lifecycle stages

### 4. Subscription Dashboard
- Pricing page views
- Subscription funnel (view → start → complete)
- Subscription conversion rate
- Cancellation reasons

---

## 🐛 Troubleshooting

### PostHog not tracking events

**Check console for messages:**
- `📊 PostHog: Disabled in development` → Set `NEXT_PUBLIC_POSTHOG_DEV_MODE=true`
- `PostHog environment variables not configured` → Add `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST`

**Verify environment variables:**
```bash
echo $NEXT_PUBLIC_POSTHOG_KEY
echo $NEXT_PUBLIC_POSTHOG_HOST
echo $NEXT_PUBLIC_POSTHOG_DEV_MODE
```

**Restart dev server:**
```bash
# Kill server (Ctrl+C)
npm run dev
```

### Events not appearing in PostHog dashboard

1. **Check your PostHog project** - Make sure you're looking at the correct project
2. **Check Live Events** - Go to Events → Live to see real-time events
3. **Wait a few seconds** - Events may take 5-10 seconds to appear
4. **Check network tab** - Look for requests to `eu.i.posthog.com` or `us.i.posthog.com`

### TypeScript errors

Run type check:
```bash
npx tsc --noEmit
```

If you see PostHog-related errors, make sure all changes are saved and restart your IDE.

---

## 📚 Resources

- [PostHog Documentation](https://posthog.com/docs)
- [PostHog JavaScript SDK](https://posthog.com/docs/libraries/js)
- [PostHog Next.js Guide](https://posthog.com/docs/libraries/next-js)
- [Event Definitions (in this project)](lib/analytics/events.ts)
- [Property Builders (in this project)](lib/analytics/properties.ts)
- [Tracking Helpers (in this project)](lib/analytics/track.ts)

---

## ✅ Checklist

**Local Development:**
- [ ] PostHog account created
- [ ] Project API Key copied
- [ ] Environment variables added to `.env.local`
- [ ] Dev mode enabled (if testing locally)
- [ ] Dev server restarted
- [ ] Console shows PostHog enabled message
- [ ] Test event sent and visible in PostHog dashboard

**Production Deployment:**
- [ ] Environment variables added to Vercel
- [ ] Production deployment successful
- [ ] Events appearing in PostHog production project
- [ ] Dashboards created in PostHog
- [ ] Team members have access to PostHog project

**Optional (Advanced):**
- [ ] Session recording enabled (with user consent)
- [ ] Custom events implemented for login/logout
- [ ] Subscription funnel events implemented
- [ ] A/B testing setup with feature flags
- [ ] Alerts configured for key metrics

---

Besoin d'aide ? Consultez [CLAUDE.md](CLAUDE.md#L241-L305) pour la documentation complète PostHog dans le projet.
