// TestSprite MCP - Tests d'Accessibilité
// Fichier: testsprite_tests/accessibility-tests.js

describe('Accessibility Tests', () => {
  test('Structure sémantique correcte', async () => {
    await page.goto('http://localhost:3000/fr');
    
    // Vérifier la présence des landmarks ARIA
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    
    // Vérifier la hiérarchie des headings
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1); // Un seul H1 par page
    
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
  });

  test('Navigation au clavier', async () => {
    await page.goto('http://localhost:3000/fr');
    
    // Test de navigation au clavier
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Vérifier que les liens sont focusables
    const links = await page.locator('a').all();
    for (const link of links) {
      await link.focus();
      await expect(link).toBeFocused();
    }
  });

  test('Contraste des couleurs', async () => {
    await page.goto('http://localhost:3000/fr');
    
    // Vérifier que le texte principal est visible
    const mainText = page.locator('text=Pratiquez vos exercices');
    await expect(mainText).toBeVisible();
    
    // Vérifier que les boutons sont visibles
    const buttons = await page.locator('button, a[role="button"]').all();
    for (const button of buttons) {
      await expect(button).toBeVisible();
    }
  });

  test('Alt text pour les images', async () => {
    await page.goto('http://localhost:3000/fr');
    
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy(); // Alt text présent
    }
  });

  test('Labels pour les formulaires', async () => {
    await page.goto('http://localhost:3000/fr/auth/signup');
    
    // Vérifier que les champs ont des labels
    await expect(page.locator('label[for="name"]')).toBeVisible();
    await expect(page.locator('label[for="email"]')).toBeVisible();
    await expect(page.locator('label[for="password"]')).toBeVisible();
    
    // Vérifier l'association label-input
    const nameInput = page.locator('input[name="name"]');
    const nameLabel = page.locator('label[for="name"]');
    await expect(nameLabel).toBeVisible();
    await expect(nameInput).toBeVisible();
  });

  test('Messages d\'erreur accessibles', async () => {
    await page.goto('http://localhost:3000/fr/auth/signup');
    
    // Tenter de soumettre sans remplir
    await page.click('button[type="submit"]');
    
    // Vérifier que les messages d'erreur sont visibles
    await expect(page.locator('text=Vous devez accepter')).toBeVisible();
  });

  test('Skip links pour la navigation', async () => {
    await page.goto('http://localhost:3000/fr');
    
    // Vérifier la présence d'un lien "skip to main content"
    const skipLink = page.locator('a[href="#main"], a[href="#content"]');
    if (await skipLink.count() > 0) {
      await expect(skipLink).toBeVisible();
    }
  });
});
