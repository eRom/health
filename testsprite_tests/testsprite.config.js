// TestSprite MCP - Configuration de test
// Fichier: testsprite_tests/testsprite.config.js

module.exports = {
  // Configuration TestSprite pour Health In Cloud
  projectName: 'Health In Cloud',
  baseUrl: 'http://localhost:3000',
  
  // Configuration des tests
  testSuites: [
    'auth-tests.js',
    'ui-tests.js', 
    'i18n-tests.js',
    'performance-tests.js',
    'accessibility-tests.js'
  ],
  
  // Configuration des navigateurs
  browsers: ['chromium', 'firefox', 'webkit'],
  
  // Configuration des viewports
  viewports: [
    { width: 1920, height: 1080, name: 'desktop' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 375, height: 667, name: 'mobile' }
  ],
  
  // Configuration des locales
  locales: ['fr', 'en'],
  
  // Configuration des tests de performance
  performance: {
    thresholds: {
      lcp: 2500, // LCP < 2.5s
      fid: 100,  // FID < 100ms
      cls: 0.1   // CLS < 0.1
    }
  },
  
  // Configuration des tests d'accessibilité
  accessibility: {
    level: 'AA',
    rules: [
      'color-contrast',
      'keyboard-navigation',
      'semantic-structure',
      'alt-text',
      'form-labels'
    ]
  },
  
  // Configuration des tests d'internationalisation
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    testRoutes: [
      '/',
      '/about',
      '/pricing',
      '/auth/login',
      '/auth/signup'
    ]
  },
  
  // Configuration des tests d'authentification
  auth: {
    testUsers: {
      valid: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123!'
      },
      invalid: {
        email: 'invalid@test.com',
        password: 'wrongpassword'
      }
    }
  },
  
  // Configuration des rapports
  reporting: {
    outputDir: './testsprite_tests/reports',
    formats: ['html', 'json', 'junit'],
    includeScreenshots: true,
    includeVideos: false
  },
  
  // Configuration des timeouts
  timeouts: {
    navigation: 30000,
    action: 10000,
    assertion: 5000
  }
};
