/**
 * Email sending utilities using Resend
 */

import { Resend } from 'resend'
import { render } from '@react-email/render'
import TrialEndingEmail from '@/emails/trial-ending'
import TrialEndedEmail from '@/emails/trial-ended'
import RenewalReminderEmail from '@/emails/renewal-reminder'
import PaymentFailedEmail from '@/emails/payment-failed'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.RESEND_FROM_FROM || 'noreply@healthincloud.app'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://healthincloud.app'

export type EmailLocale = 'fr' | 'en'

/**
 * Send trial ending reminder (3 days before end)
 */
export async function sendTrialEndingEmail({
  to,
  userName,
  daysLeft,
  locale = 'fr',
}: {
  to: string
  userName: string
  daysLeft: number
  locale?: EmailLocale
}) {
  const manageSubscriptionUrl = `${APP_URL}/${locale}/profile`

  const html = render(
    TrialEndingEmail({
      userName,
      daysLeft,
      manageSubscriptionUrl,
      locale,
    })
  )

  const subject =
    locale === 'fr'
      ? `Votre essai gratuit se termine dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`
      : `Your free trial ends in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  })
}

/**
 * Send trial ended notification
 */
export async function sendTrialEndedEmail({
  to,
  userName,
  locale = 'fr',
}: {
  to: string
  userName: string
  locale?: EmailLocale
}) {
  const subscriptionUrl = `${APP_URL}/${locale}/subscription`

  const html = render(
    TrialEndedEmail({
      userName,
      subscriptionUrl,
      locale,
    })
  )

  const subject =
    locale === 'fr'
      ? 'Votre essai gratuit est terminé'
      : 'Your free trial has ended'

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  })
}

/**
 * Send renewal reminder (7 days before renewal)
 */
export async function sendRenewalReminderEmail({
  to,
  userName,
  renewalDate,
  amount,
  plan,
  locale = 'fr',
}: {
  to: string
  userName: string
  renewalDate: string
  amount: string
  plan: 'monthly' | 'yearly'
  locale?: EmailLocale
}) {
  const manageSubscriptionUrl = `${APP_URL}/${locale}/profile`

  const html = render(
    RenewalReminderEmail({
      userName,
      renewalDate,
      amount,
      plan,
      manageSubscriptionUrl,
      locale,
    })
  )

  const subject =
    locale === 'fr'
      ? 'Rappel : Votre abonnement sera renouvelé prochainement'
      : 'Reminder: Your subscription will renew soon'

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  })
}

/**
 * Send payment failed notification
 */
export async function sendPaymentFailedEmail({
  to,
  userName,
  amount,
  reason,
  gracePeriodEnd,
  locale = 'fr',
}: {
  to: string
  userName: string
  amount: string
  reason?: string
  gracePeriodEnd: string
  locale?: EmailLocale
}) {
  const updatePaymentUrl = `${APP_URL}/${locale}/profile`

  const html = render(
    PaymentFailedEmail({
      userName,
      amount,
      reason,
      updatePaymentUrl,
      gracePeriodEnd,
      locale,
    })
  )

  const subject =
    locale === 'fr'
      ? 'Action requise : Échec du paiement'
      : 'Action required: Payment failed'

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  })
}
