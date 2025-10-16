import { hasActiveSubscription } from '../lib/subscription'

const userId = 'mZfvePKCd1NGIF4lnJuE6g3dFJgPny15'

async function testAccess() {
  console.log('🔍 Test de la fonction hasActiveSubscription\n')

  const hasAccess = await hasActiveSubscription(userId)

  console.log(`Résultat: ${hasAccess}`)

  if (hasAccess) {
    console.log('✅ L\'utilisateur DEVRAIT avoir accès!')
  } else {
    console.log('❌ L\'utilisateur N\'A PAS accès selon la fonction!')
  }
}

testAccess()
