# PWA Guide — Health In Cloud

**Document type**: Technical guide
**Status**: Active
**Last updated**: October 2025

---

## 1. Overview

Health In Cloud is a Progressive Web App (PWA) that can be installed on desktop, tablet, and mobile devices for an app-like experience. This guide covers installation, offline capabilities, and technical architecture.

---

## 2. Installation Guide

### Desktop (Chrome, Edge, Arc, Brave)

1. **Visit** `https://healthincloud.app`
2. **Look for** the install icon (⊕) in the address bar or browser menu
3. **Click "Install Health In Cloud"**
4. The app will open in its own window
5. **Access** from your Applications folder or Start Menu

### Mobile (iOS Safari)

1. **Visit** `https://healthincloud.app` in Safari
2. **Tap** the Share button (square with up arrow)
3. **Scroll down** and select "Add to Home Screen"
4. **Tap "Add"** in the top right
5. The app icon will appear on your home screen

### Mobile (Android Chrome)

1. **Visit** `https://healthincloud.app` in Chrome
2. **Tap** the three-dot menu (⋮)
3. **Select "Install app"** or "Add to Home Screen"
4. **Confirm** the installation prompt
5. The app will appear in your app drawer

---

## 3. Features

### 🔌 Offline Support

**What works offline:**
- Previously visited pages are cached
- Static assets (logo, icons, fonts)
- Offline fallback page with reconnection instructions

**What requires internet:**
- Login/Signup
- Exercise data synchronization
- Real-time progress updates
- Profile changes

### ⚡ Performance

- **Instant loading** of previously visited pages
- **Smart caching** for images, fonts, and static content
- **Background sync** (future): exercise results upload when connection restored

### 🏠 App Shortcuts

**Desktop/Android**: Right-click the app icon to access quick shortcuts:
- Dashboard
- Neuropsychologie exercises
- Orthophonie exercises

---

## 4. Technical Architecture

### Service Worker

**Location**: `public/sw.js` (generated from `app/sw.ts`)
**Technology**: [Serwist](https://serwist.pages.dev) (Workbox fork)

**Cache Strategies**:
- **Precache**: All build assets (JS, CSS) are pre-cached on install
- **Runtime cache**: Default caching strategies from `@serwist/next/worker`

### Manifest

**Location**: `app/manifest.json`

**Key properties**:
```json
{
  "name": "Health In Cloud",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#2da6b2",
  "background_color": "#ffffff",
  "categories": ["health", "medical", "education"]
}
```

**Icons**:
- 192x192 (Android/Desktop)
- 180x180 (Apple Touch Icon)
- 512x512 (High-res, maskable)

**Screenshots**: 2 mobile screenshots (1080x1920) for app store display

### Offline Page

**Route**: `/[locale]/offline`
**Trigger**: When navigating to a document page without network

**Features**:
- Bilingual (FR/EN) messaging
- Reconnection instructions
- Manual retry button
- Branded design with logo

---

## 5. Development

### Build Requirements

**Important**: Serwist does not support Turbopack yet ([#54](https://github.com/serwist/serwist/issues/54)).

**Development** (with Turbopack):
```bash
npm run dev  # Service worker disabled
```

**Production** (with Webpack):
```bash
npm run build  # Generates service worker
npm run start  # Serve with SW enabled
```

### Testing Locally

**1. Production build**:
```bash
npm run build
npm run start
```

**2. Open** `http://localhost:3000` in Chrome

**3. DevTools > Application > Service Workers**:
- Verify "sw.js" is registered
- Status should be "activated and is running"

**4. Test offline mode**:
- DevTools > Network tab
- Check "Offline" throttling
- Navigate to a cached page → should load
- Navigate to uncached page → shows `/offline`

**5. Test installation**:
- Click install icon in address bar
- App opens in standalone window
- Verify shortcuts work (right-click app icon)

### Lighthouse Audits

**Local** :
```bash
npm run lighthouse         # Desktop preset
npm run lighthouse:mobile  # Mobile preset
```

**CI/CD**:
- Lighthouse runs automatically on all PRs to `main`
- Results published to GitHub Actions artifacts
- Thresholds: Performance ≥90, PWA ≥80, SEO =100

---

## 6. Manifest Shortcuts

**Desktop/Android only** (not supported on iOS):

1. **Dashboard** → `/dashboard`
2. **Neuropsychologie** → `/neuro`
3. **Orthophonie** → `/ortho`

**Usage**: Right-click installed app icon → Select shortcut

---

## 7. Configuration

### Environment Variables

**Required for production**:
- Standard Next.js/Prisma/Auth vars (see `.env.example`)
- No additional PWA-specific vars needed

### Browser Support

| Feature | Chrome | Edge | Safari | Firefox |
|---------|--------|------|--------|---------|
| Install | ✅ | ✅ | ✅ | ⚠️ Limited |
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| Shortcuts | ✅ | ✅ | ❌ | ❌ |
| Offline | ✅ | ✅ | ✅ | ✅ |

---

## 8. Troubleshooting

### Issue: PWA not installable

**Check**:
1. HTTPS is required (localhost exempted)
2. Manifest at `/manifest.json` is accessible
3. Service worker registered without errors
4. Icons 192x192 and 512x512 are valid PNGs

**DevTools check**:
- Application > Manifest: verify all fields green
- Application > Service Workers: verify "activated"

### Issue: Offline page not showing

**Possible causes**:
- Service worker not activated yet (first visit)
- Page was never visited while online (not in cache)
- Fallback entry not properly configured in `sw.ts`

**Solution**:
1. Visit page while online first
2. Hard refresh (Cmd+Shift+R / Ctrl+F5)
3. Check console for SW errors

### Issue: Service worker not updating

**Solution**:
1. Update version in `app/sw.ts` (add comment or change cache name)
2. `skipWaiting: true` forces immediate activation
3. Users can manually update: DevTools > Application > Service Workers > "skipWaiting"

---

## 9. Future Enhancements

**Planned** (Q1 2026):
- Background sync for exercise results
- Push notifications for reminders (opt-in)
- Extended offline exercise catalog
- IndexedDB for local progress tracking

**Under consideration**:
- Share API integration (share progress)
- Periodic background sync (daily check-in reminder)
- File System Access API (export/import data)

---

## 10. References

- **Serwist Documentation**: https://serwist.pages.dev
- **MDN PWA Guide**: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
- **W3C Manifest Spec**: https://www.w3.org/TR/appmanifest/
- **Web.dev PWA Checklist**: https://web.dev/pwa-checklist/

---

**Last audited**: October 2025
**Audit tool**: Lighthouse 12.8.2
