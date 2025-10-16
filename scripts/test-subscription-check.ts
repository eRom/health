import { checkUserSubscription } from '../lib/subscription-check'

const userId = 'mZfvePKCd1NGIF4lnJuE6g3dFJgPny15'

async function test() {
  console.log('🔍 Test de checkUserSubscription (utilisée par le middleware)\n')

  const result = await checkUserSubscription(userId)

  console.log('Résultat:', JSON.stringify(result, null, 2))

  if (result.hasAccess) {
    console.log('\n✅ L\'utilisateur DEVRAIT avoir accès!')
  } else {
    console.log('\n❌ L\'utilisateur N\'A PAS accès!')
    console.log('Statut:', result.subscription?.status)
  }
}

test()
