'use server'

import { AccountDeleted } from '@/emails/templates/AccountDeleted'
import { ResetPassword } from '@/emails/templates/ResetPassword'
import { VerifyEmail } from '@/emails/templates/VerifyEmail'
import { render } from '@react-email/render'
import { FROM_EMAIL, resend } from './resend'

export async function sendVerificationEmail(
  email: string,
  token: string,
  locale: string = 'fr'
) {
  try {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${locale}/verify-email?token=${token}`
    
    const htmlContent = await render(VerifyEmail({ 
      verificationUrl, 
      locale 
    }))

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: locale === 'fr' 
        ? 'Vérifiez votre adresse email - Health In Cloud'
        : 'Verify your email address - Health In Cloud',
      html: htmlContent,
    })

    if (error) {
      console.error('[EMAIL_VERIFICATION] Error:', error)
      return { success: false, error: error.message }
    }

    console.log('[EMAIL_VERIFICATION] Sent:', data?.id)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('[EMAIL_VERIFICATION] Error:', error)
    return { success: false, error: 'Failed to send verification email' }
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  locale: string = 'fr'
) {
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${locale}/reset-password?token=${token}`
    
    const htmlContent = await render(ResetPassword({ 
      resetUrl, 
      locale 
    }))

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: locale === 'fr' 
        ? 'Réinitialisez votre mot de passe - Health In Cloud'
        : 'Reset your password - Health In Cloud',
      html: htmlContent,
    })

    if (error) {
      console.error('[PASSWORD_RESET] Error:', error)
      return { success: false, error: error.message }
    }

    console.log('[PASSWORD_RESET] Sent:', data?.id)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('[PASSWORD_RESET] Error:', error)
    return { success: false, error: 'Failed to send password reset email' }
  }
}

export async function sendAccountDeletedEmail(
  email: string,
  name: string,
  locale: string = 'fr'
) {
  try {
    const htmlContent = await render(AccountDeleted({ 
      name,
      locale 
    }))

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: locale === 'fr' 
        ? 'Compte supprimé - Health In Cloud'
        : 'Account deleted - Health In Cloud',
      html: htmlContent,
    })

    if (error) {
      console.error('[ACCOUNT_DELETED] Error:', error)
      return { success: false, error: error.message }
    }

    console.log('[ACCOUNT_DELETED] Sent:', data?.id)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('[ACCOUNT_DELETED] Error:', error)
    return { success: false, error: 'Failed to send account deleted email' }
  }
}
