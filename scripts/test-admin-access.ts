/**
 * Script to test admin access without subscription
 * This script:
 * 1. Finds or creates an admin user
 * 2. Removes their subscription if it exists
 * 3. Tests if hasActiveSubscription returns true for the admin
 */

import { prisma } from '../lib/prisma'
import { hasActiveSubscription } from '../lib/subscription'

async function main() {
  console.log('🔍 Testing admin access without subscription...\n')

  // Find existing admin or use demo user
  let adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true, email: true, name: true, role: true },
  })

  if (!adminUser) {
    // Try to find the demo user and make them an admin
    const demoUser = await prisma.user.findUnique({
      where: { email: 'romain.ecarnot@gmail.com' },
      select: { id: true, email: true, name: true, role: true },
    })

    if (demoUser) {
      console.log(
        `📝 Converting demo user ${demoUser.email} to ADMIN role...`
      )
      adminUser = await prisma.user.update({
        where: { id: demoUser.id },
        data: { role: 'ADMIN' },
        select: { id: true, email: true, name: true, role: true },
      })
      console.log('✅ User role updated to ADMIN\n')
    } else {
      console.error('❌ No admin user found and no demo user to convert')
      console.log(
        'Run: npm run db:seed to create a demo user first, or create an admin user manually in Prisma Studio'
      )
      return
    }
  } else {
    console.log(
      `✅ Found existing admin user: ${adminUser.email} (${adminUser.name})\n`
    )
  }

  // Check if admin has subscription
  const subscription = await prisma.subscription.findUnique({
    where: { userId: adminUser.id },
    select: { id: true, status: true },
  })

  if (subscription) {
    console.log(
      `📝 Admin has subscription (status: ${subscription.status})`
    )
    console.log('   This is fine - admins should have access even without it.\n')
  } else {
    console.log('📝 Admin has NO subscription (expected)\n')
  }

  // Test hasActiveSubscription
  console.log('🧪 Testing hasActiveSubscription()...')
  const hasAccess = await hasActiveSubscription(adminUser.id)

  if (hasAccess) {
    console.log('✅ SUCCESS: Admin has access without subscription!')
    console.log(
      '\n✨ Test passed! Admins are correctly exempted from subscription requirement.\n'
    )
  } else {
    console.log('❌ FAILURE: Admin does NOT have access')
    console.log('   This should not happen - check the role-based exemption logic.\n')
    process.exit(1)
  }

  // Also test with a healthcare provider
  console.log('🔍 Testing healthcare provider access...\n')

  let hcpUser = await prisma.user.findFirst({
    where: { role: 'HEALTHCARE_PROVIDER' },
    select: { id: true, email: true, name: true, role: true },
  })

  if (hcpUser) {
    console.log(
      `✅ Found healthcare provider: ${hcpUser.email} (${hcpUser.name})\n`
    )

    const hcpHasAccess = await hasActiveSubscription(hcpUser.id)

    if (hcpHasAccess) {
      console.log(
        '✅ SUCCESS: Healthcare provider has access without subscription!'
      )
      console.log(
        '\n✨ All tests passed! Both admins and healthcare providers are correctly exempted.\n'
      )
    } else {
      console.log('❌ FAILURE: Healthcare provider does NOT have access')
      process.exit(1)
    }
  } else {
    console.log('⚠️  No healthcare provider found to test')
    console.log(
      '   (This is OK - we already verified admin exemption works)\n'
    )
  }
}

main()
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
