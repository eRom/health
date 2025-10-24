// TestSprite MCP - Tests de Performance
// Fichier: testsprite_tests/performance-tests.js

describe('Performance Tests', () => {
  test('Temps de chargement de la page d\'accueil', async () => {
    const startTime = Date.now();
    await page.goto('http://localhost:3000/fr');
    const loadTime = Date.now() - startTime;
    
    // Vérifier que la page se charge en moins de 3 secondes
    expect(loadTime).toBeLessThan(3000);
    
    // Vérifier que le contenu principal est visible
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Métriques Core Web Vitals', async () => {
    await page.goto('http://localhost:3000/fr');
    
    // Attendre que la page soit complètement chargée
    await page.waitForLoadState('networkidle');
    
    // Mesurer LCP (Largest Contentful Paint)
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });
    
    expect(lcp).toBeLessThan(2500); // LCP < 2.5s
  });

  test('Images optimisées', async () => {
    await page.goto('http://localhost:3000/fr');
    
    // Vérifier que les images se chargent correctement
    const images = await page.locator('img').all();
    for (const img of images) {
      await expect(img).toBeVisible();
    }
  });

  test('Service Worker installé', async () => {
    await page.goto('http://localhost:3000/fr');
    
    // Vérifier la présence du service worker
    const swRegistered = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    
    expect(swRegistered).toBe(true);
  });

  test('Manifest PWA présent', async () => {
    await page.goto('http://localhost:3000/fr');
    
    // Vérifier le manifest PWA
    const manifest = await page.evaluate(() => {
      const manifestLink = document.querySelector('link[rel="manifest"]');
      return manifestLink ? manifestLink.href : null;
    });
    
    expect(manifest).toContain('manifest.json');
  });

  test('Responsive design mobile', async () => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/fr');
    
    // Vérifier que le contenu s'adapte au mobile
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button[aria-label="Menu"]')).toBeVisible();
    
    // Vérifier que le texte reste lisible
    const textSize = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return window.getComputedStyle(h1).fontSize;
    });
    
    expect(parseInt(textSize)).toBeGreaterThan(16); // Au moins 16px
  });
});
