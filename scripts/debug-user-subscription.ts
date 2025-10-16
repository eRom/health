/**
 * Script pour déboguer l'abonnement d'un utilisateur
 * Usage: npx tsx scripts/debug-user-subscription.ts <email>
 */

import { prisma } from '../lib/prisma'

const email = process.argv[2]

if (!email) {
  console.error('❌ Usage: npx tsx scripts/debug-user-subscription.ts <email>')
  process.exit(1)
}

async function debugUser() {
  console.log(`🔍 Recherche de l'utilisateur: ${email}\n`)

  // Trouver l'utilisateur
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      subscription: true,
    },
  })

  if (!user) {
    console.log('❌ Utilisateur non trouvé!')
    return
  }

  console.log('✅ Utilisateur trouvé:')
  console.log(`   ID: ${user.id}`)
  console.log(`   Nom: ${user.name}`)
  console.log(`   Email: ${user.email}`)
  console.log(`   Stripe Customer ID: ${user.stripeCustomerId || 'NON DÉFINI'}\n`)

  // Vérifier l'abonnement
  if (!user.subscription) {
    console.log('❌ PROBLÈME: Aucun abonnement en base de données!')
    console.log('\n📝 Actions suggérées:')
    console.log('1. Vérifier que Stripe CLI est démarré')
    console.log('2. Vérifier les logs des webhooks')
    console.log('3. Aller dans Stripe Dashboard → Abonnements')
    console.log('4. Trouver votre abonnement et noter le Subscription ID')
    console.log('5. Déclencher manuellement le webhook:\n')
    console.log('   stripe trigger customer.subscription.updated\n')
    return
  }

  console.log('✅ Abonnement trouvé:')
  console.log(`   Status: ${user.subscription.status}`)
  console.log(`   Stripe Subscription ID: ${user.subscription.stripeSubscriptionId}`)
  console.log(`   Prix: ${user.subscription.stripePriceId}`)
  console.log(`   Période actuelle: ${user.subscription.currentPeriodStart.toLocaleDateString()} → ${user.subscription.currentPeriodEnd.toLocaleDateString()}`)

  if (user.subscription.trialEnd) {
    console.log(`   Fin d'essai: ${user.subscription.trialEnd.toLocaleDateString()}`)
  }

  console.log(`   Annulation à la fin: ${user.subscription.cancelAtPeriodEnd ? 'OUI' : 'NON'}\n`)

  // Vérifier l'accès
  const { hasActiveSubscription } = await import('../lib/subscription')
  const hasAccess = await hasActiveSubscription(user.id)

  if (hasAccess) {
    console.log('✅ L\'utilisateur DEVRAIT avoir accès!')
    console.log('\n🐛 Si vous êtes toujours bloqué:')
    console.log('1. Déconnectez-vous et reconnectez-vous')
    console.log('2. Videz le cache du navigateur (Cmd+Shift+R)')
    console.log('3. Vérifiez la console du navigateur pour des erreurs')
  } else {
    console.log('❌ L\'utilisateur N\'A PAS accès!')
    console.log(`\n🔍 Raison: Status "${user.subscription.status}" n'est pas actif`)
    console.log('\n📝 Statuts donnant accès:')
    console.log('   - TRIALING (période d\'essai)')
    console.log('   - ACTIVE (abonnement payant)')
    console.log('   - PAST_DUE (dans les 7 jours de grâce)')
  }
}

debugUser()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error('❌ Erreur:', error)
    prisma.$disconnect()
    process.exit(1)
  })
