// TestSprite MCP - Tests d'Internationalisation
// Fichier: testsprite_tests/i18n-tests.js

describe('Internationalization Tests', () => {
  test('Page française se charge correctement', async () => {
    await page.goto('http://localhost:3000/fr');
    await expect(page.locator('h1')).toContainText('Health In Cloud');
    await expect(page.locator('text=Pratiquez vos exercices de rééducation')).toBeVisible();
    await expect(page.locator('text=Commencer maintenant')).toBeVisible();
    await expect(page.locator('text=Se connecter')).toBeVisible();
  });

  test('Page anglaise se charge correctement', async () => {
    await page.goto('http://localhost:3000/en');
    await expect(page.locator('h1')).toContainText('MPR Rehabilitation');
    await expect(page.locator('text=Practice your rehabilitation exercises')).toBeVisible();
    await expect(page.locator('text=Get Started')).toBeVisible();
    await expect(page.locator('text=Sign In')).toBeVisible();
  });

  test('Redirection automatique vers français', async () => {
    await page.goto('http://localhost:3000');
    await page.waitForURL('**/fr');
    await expect(page.url()).toContain('/fr');
  });

  test('Contenu traduit en anglais', async () => {
    await page.goto('http://localhost:3000/en');
    
    // Vérifier les traductions clés
    await expect(page.locator('text=Intelligent guidance')).toBeVisible();
    await expect(page.locator('text=Live tracking')).toBeVisible();
    await expect(page.locator('text=Available everywhere')).toBeVisible();
    await expect(page.locator('text=Key features')).toBeVisible();
    await expect(page.locator('text=They trust us')).toBeVisible();
  });

  test('Témoignages traduits', async () => {
    await page.goto('http://localhost:3000/en');
    
    // Vérifier les témoignages en anglais
    await expect(page.locator('text=Marie, 48 years old')).toBeVisible();
    await expect(page.locator('text=Dr. Typhaine, 43 years old')).toBeVisible();
    await expect(page.locator('text=Patient in rehabilitation')).toBeVisible();
    await expect(page.locator('text=Speech therapist')).toBeVisible();
  });

  test('Footer traduit', async () => {
    await page.goto('http://localhost:3000/en');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    await expect(page.locator('text=Privacy Policy')).toBeVisible();
    await expect(page.locator('text=Legal Notice')).toBeVisible();
    await expect(page.locator('text=GDPR')).toBeVisible();
    await expect(page.locator('text=Thank You')).toBeVisible();
  });

  test('URLs localisées fonctionnelles', async () => {
    // Test des routes principales en français
    await page.goto('http://localhost:3000/fr/about');
    await expect(page.locator('text=À propos')).toBeVisible();
    
    await page.goto('http://localhost:3000/fr/pricing');
    await expect(page.locator('text=Tarifs')).toBeVisible();
    
    // Test des routes principales en anglais
    await page.goto('http://localhost:3000/en/about');
    await expect(page.locator('text=About')).toBeVisible();
    
    await page.goto('http://localhost:3000/en/pricing');
    await expect(page.locator('text=Pricing')).toBeVisible();
  });
});
