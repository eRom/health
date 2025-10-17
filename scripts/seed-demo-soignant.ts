#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import { hashPassword } from 'better-auth/crypto'

const prisma = new PrismaClient()

async function seedDemoSoignant() {
  try {
    console.log('🌱 Creating demo healthcare provider account...\n')

    const email = 'demo-soignant@healthincloud.app'
    const password = 'demo-soignant'
    const name = 'Dr. Soignant Demo'
    const patientEmail = 'demo-patient@healthincloud.app'

    // 1. Delete existing user if exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      // Delete user (cascades to all related data)
      await prisma.user.delete({ where: { email } })
      console.log('🗑️  Deleted existing healthcare provider and all related data\n')
    }

    // 2. Hash password using Better Auth's hash function
    const hashedPassword = await hashPassword(password)
    console.log('🔐 Password hashed with Better Auth')

    // 3. Create healthcare provider user
    const provider = await prisma.user.create({
      data: {
        email,
        name,
        emailVerified: true,
        locale: 'fr',
        theme: 'dark',
        themeStyle: 'default',
        emailNotifications: true,
        healthDataConsentGrantedAt: new Date(), // RGPD consent
        role: 'HEALTHCARE_PROVIDER', // Key difference: healthcare provider role
        accounts: {
          create: {
            providerId: 'credential',
            accountId: email,
            password: hashedPassword,
          },
        },
      },
    })

    console.log(`✅ Healthcare provider created: ${provider.name} (${provider.email})`)
    console.log(`✅ Role: ${provider.role} (no subscription required)`)

    // 4. Find the patient user
    const patient = await prisma.user.findUnique({
      where: { email: patientEmail },
    })

    if (!patient) {
      console.log('\n⚠️  Patient user not found. Skipping association.')
      console.log(`   Run seed-demo-patient.ts first to create the patient account.`)
    } else {
      // 5. Create patient-provider association (ACCEPTED status)
      const association = await prisma.patientProviderAssociation.create({
        data: {
          patientId: patient.id,
          providerId: provider.id,
          status: 'ACCEPTED', // Already accepted for demo purposes
          acceptedAt: new Date(),
          invitationSentAt: new Date(),
        },
      })

      console.log(`\n✅ Association created with patient: ${patient.name}`)
      console.log(`   Status: ${association.status}`)
      console.log(`   Patient can now be monitored by the healthcare provider`)
    }

    // Final summary
    console.log('\n🎉 Demo healthcare provider created successfully!\n')
    console.log('📋 Summary:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`👨‍⚕️  Healthcare Provider: ${name}`)
    console.log(`📧 Email: ${email}`)
    console.log(`🔑 Password: ${password}`)
    console.log(`🏥 Role: HEALTHCARE_PROVIDER (free access)`)
    console.log(`💳 Subscription: Not required (exempted)`)
    if (patient) {
      console.log(`👥 Patients: 1 (${patient.name})`)
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('✅ Ready for demo!\n')
    console.log('💡 As a healthcare provider, this account can:')
    console.log('   - Access the platform without subscription')
    console.log('   - View patient data and progress')
    console.log('   - Send messages to patients')
    console.log('   - Monitor patient exercises and achievements\n')

  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Execute
seedDemoSoignant()
