// TestSprite MCP - Tests d'Interface Utilisateur
// Fichier: testsprite_tests/ui-tests.js

describe('User Interface Tests', () => {
  test('Page d\'accueil se charge correctement', async () => {
    await page.goto('http://localhost:3000/fr');
    await expect(page.locator('h1')).toContainText('Health In Cloud');
    await expect(page.locator('text=Pratiquez vos exercices')).toBeVisible();
    await expect(page.locator('text=Commencer maintenant')).toBeVisible();
    await expect(page.locator('text=Se connecter')).toBeVisible();
  });

  test('Navigation mobile fonctionne', async () => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/fr');
    
    // Ouvrir le menu mobile
    await page.click('button[aria-label="Menu"]');
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('text=Accueil')).toBeVisible();
    await expect(page.locator('text=À propos')).toBeVisible();
    await expect(page.locator('text=Se connecter')).toBeVisible();
    
    // Fermer le menu
    await page.click('button[aria-label="Close"]');
  });

  test('Sections principales présentes', async () => {
    await page.goto('http://localhost:3000/fr');
    
    // Vérifier les sections clés
    await expect(page.locator('text=Guidage intelligent')).toBeVisible();
    await expect(page.locator('text=Suivi en direct')).toBeVisible();
    await expect(page.locator('text=Disponible partout')).toBeVisible();
    await expect(page.locator('text=Fonctionnalités clés')).toBeVisible();
    await expect(page.locator('text=Ils nous font confiance')).toBeVisible();
  });

  test('Témoignages utilisateurs affichés', async () => {
    await page.goto('http://localhost:3000/fr');
    
    // Vérifier les témoignages
    await expect(page.locator('text=Marie, 48 ans')).toBeVisible();
    await expect(page.locator('text=Dr. Typhaine, 43 ans')).toBeVisible();
    await expect(page.locator('text=Patiente en rééducation')).toBeVisible();
    await expect(page.locator('text=Orthophoniste')).toBeVisible();
  });

  test('Footer avec liens légaux', async () => {
    await page.goto('http://localhost:3000/fr');
    
    // Scroll vers le footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    await expect(page.locator('text=Politique de confidentialité')).toBeVisible();
    await expect(page.locator('text=Mentions légales')).toBeVisible();
    await expect(page.locator('text=RGPD')).toBeVisible();
    await expect(page.locator('text=contact@healthincloud.app')).toBeVisible();
  });

  test('Liens de tarification fonctionnels', async () => {
    await page.goto('http://localhost:3000/fr');
    
    // Vérifier la section tarifs
    await expect(page.locator('text=Essai gratuit 14 jours')).toBeVisible();
    await expect(page.locator('text=Voir tous les tarifs')).toBeVisible();
    
    // Cliquer sur le lien tarifs
    await page.click('text=Voir tous les tarifs');
    await expect(page.url()).toContain('/pricing');
  });
});
