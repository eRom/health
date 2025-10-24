// TestSprite MCP - Tests d'Authentification
// Fichier: testsprite_tests/auth-tests.js

describe('Authentication System', () => {
  test('Page d\'inscription se charge correctement', async () => {
    await page.goto('http://localhost:3000/fr/auth/signup');
    await expect(page.locator('h1')).toContainText('Création de compte');
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[type="checkbox"]')).toBeVisible();
  });

  test('Validation des champs requis', async () => {
    await page.goto('http://localhost:3000/fr/auth/signup');
    
    // Test sans remplir les champs
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Vous devez accepter')).toBeVisible();
    
    // Test avec champs remplis mais sans consentement
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Vous devez accepter')).toBeVisible();
  });

  test('Case de consentement RGPD obligatoire', async () => {
    await page.goto('http://localhost:3000/fr/auth/signup');
    
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    
    // Vérifier que le bouton est désactivé sans consentement
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
    
    // Cocher la case de consentement
    await page.check('input[type="checkbox"]');
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test('Page de connexion fonctionne', async () => {
    await page.goto('http://localhost:3000/fr/auth/login');
    await expect(page.locator('h1')).toContainText('Connexion');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('Bouton Google OAuth présent', async () => {
    await page.goto('http://localhost:3000/fr/auth/signup');
    await expect(page.locator('text=Continuer avec Google')).toBeVisible();
  });
});
