'use server'

import { AccountDeleted } from '@/emails/templates/AccountDeleted'
import { ResetPassword } from '@/emails/templates/ResetPassword'
import { VerifyEmail } from '@/emails/templates/VerifyEmail'
import { render } from '@react-email/render'
import { FROM_EMAIL, resend } from './resend'
import { logger } from '@/lib/logger'

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
      logger.error(error, '[EMAIL_VERIFICATION] Error sending email')
      return { success: false, error: error.message }
    }

    logger.info('[EMAIL_VERIFICATION] Email sent', {
      messageId: data?.id,
      email,
    })
    return { success: true, messageId: data?.id }
  } catch (error) {
    logger.error(error, '[EMAIL_VERIFICATION] Unexpected error')
    return { success: false, error: 'Failed to send verification email' }
  }
}

type PasswordResetEmailOptions = {
  email: string
  token: string
  tokenId?: string
  locale?: string
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  locale?: string,
): Promise<{ success: boolean; messageId?: string; error?: string }>
export async function sendPasswordResetEmail(
  options: PasswordResetEmailOptions,
): Promise<{ success: boolean; messageId?: string; error?: string }>
export async function sendPasswordResetEmail(
  emailOrOptions: string | PasswordResetEmailOptions,
  tokenOrLocale?: string,
  maybeLocale?: string,
) {
  const { email, token, tokenId, locale } =
    typeof emailOrOptions === 'string'
      ? {
          email: emailOrOptions,
          token: tokenOrLocale ?? '',
          tokenId: undefined,
          locale: maybeLocale ?? 'fr',
        }
      : {
          email: emailOrOptions.email,
          token: emailOrOptions.token,
          tokenId: emailOrOptions.tokenId,
          locale: emailOrOptions.locale ?? 'fr',
        }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const params = new URLSearchParams({ token })
    if (tokenId) {
      params.append('tokenId', tokenId)
    }
    const resetUrl = `${appUrl}/${locale}/reset-password?${params.toString()}`
    
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
      logger.error(error, '[PASSWORD_RESET] Error sending email')
      return { success: false, error: error.message }
    }

    logger.info('[PASSWORD_RESET] Email sent', {
      messageId: data?.id,
      email,
      tokenId,
    })
    return { success: true, messageId: data?.id }
  } catch (error) {
    logger.error(error, '[PASSWORD_RESET] Unexpected error')
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
      logger.error(error, '[ACCOUNT_DELETED] Error sending email')
      return { success: false, error: error.message }
    }

    logger.info('[ACCOUNT_DELETED] Email sent', {
      messageId: data?.id,
      email,
    })
    return { success: true, messageId: data?.id }
  } catch (error) {
    logger.error(error, '[ACCOUNT_DELETED] Unexpected error')
    return { success: false, error: 'Failed to send account deleted email' }
  }
}
