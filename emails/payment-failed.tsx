import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface PaymentFailedEmailProps {
  userName: string
  amount: string
  reason?: string
  updatePaymentUrl: string
  gracePeriodEnd: string
  locale?: 'fr' | 'en'
}

const translations = {
  fr: {
    preview: 'Échec du paiement de votre abonnement',
    greeting: 'Bonjour',
    title: 'Nous n\'avons pas pu traiter votre paiement',
    body1: 'Malheureusement, le paiement de votre abonnement a échoué.',
    attemptedAmount: 'Montant tenté',
    reason: 'Raison',
    whatNow: 'Que se passe-t-il maintenant ?',
    gracePeriod: 'Période de grâce de 7 jours',
    gracePeriodBody: 'Vous conservez l\'accès à tous les exercices jusqu\'au',
    gracePeriodBody2: 'Cela vous laisse le temps de mettre à jour vos informations de paiement.',
    afterGracePeriod: 'Après cette date',
    afterGracePeriodBody: 'Si le paiement n\'est pas effectué, votre accès aux exercices sera suspendu jusqu\'à la mise à jour de votre moyen de paiement.',
    commonReasons: 'Raisons courantes d\'échec',
    reason1: 'Solde insuffisant sur le compte',
    reason2: 'Carte expirée',
    reason3: 'Informations de carte incorrectes',
    reason4: 'Limite de crédit atteinte',
    howToFix: 'Comment résoudre ce problème ?',
    fixStep1: 'Cliquez sur le bouton ci-dessous',
    fixStep2: 'Mettez à jour vos informations de paiement',
    fixStep3: 'Le paiement sera automatiquement retenté',
    updateButton: 'Mettre à jour mes informations de paiement',
    questions: 'Des questions ?',
    questionsBody: 'Notre équipe est là pour vous aider à résoudre ce problème rapidement.',
    contactUs: 'Contactez-nous',
    thanks: 'Merci de votre compréhension,',
    team: 'L\'équipe Health In Cloud',
    footer: '© 2025 Health In Cloud. Tous droits réservés.',
  },
  en: {
    preview: 'Payment failed for your subscription',
    greeting: 'Hello',
    title: 'We couldn\'t process your payment',
    body1: 'Unfortunately, your subscription payment failed.',
    attemptedAmount: 'Attempted amount',
    reason: 'Reason',
    whatNow: 'What happens now?',
    gracePeriod: '7-day grace period',
    gracePeriodBody: 'You keep access to all exercises until',
    gracePeriodBody2: 'This gives you time to update your payment information.',
    afterGracePeriod: 'After this date',
    afterGracePeriodBody: 'If payment is not made, your access to exercises will be suspended until you update your payment method.',
    commonReasons: 'Common failure reasons',
    reason1: 'Insufficient funds in account',
    reason2: 'Expired card',
    reason3: 'Incorrect card information',
    reason4: 'Credit limit reached',
    howToFix: 'How to fix this?',
    fixStep1: 'Click the button below',
    fixStep2: 'Update your payment information',
    fixStep3: 'Payment will be automatically retried',
    updateButton: 'Update my payment information',
    questions: 'Questions?',
    questionsBody: 'Our team is here to help you resolve this quickly.',
    contactUs: 'Contact us',
    thanks: 'Thank you for your understanding,',
    team: 'The Health In Cloud Team',
    footer: '© 2025 Health In Cloud. All rights reserved.',
  },
}

export default function PaymentFailedEmail({
  userName,
  amount,
  reason,
  updatePaymentUrl,
  gracePeriodEnd,
  locale = 'fr',
}: PaymentFailedEmailProps) {
  const t = translations[locale]

  return (
    <Html>
      <Head />
      <Preview>{t.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            {t.greeting} {userName},
          </Heading>

          <Section style={errorBox}>
            <Text style={errorText}>{t.title}</Text>
            <Text style={text}>{t.body1}</Text>
          </Section>

          <Section style={detailsBox}>
            <Text style={detailLabel}>{t.attemptedAmount}</Text>
            <Text style={detailValue}>{amount}</Text>
            {reason && (
              <>
                <Text style={detailLabel}>{t.reason}</Text>
                <Text style={detailValue}>{reason}</Text>
              </>
            )}
          </Section>

          <Section style={infoBox}>
            <Heading as="h2" style={h2}>
              {t.whatNow}
            </Heading>

            <Heading as="h3" style={h3}>
              {t.gracePeriod}
            </Heading>
            <Text style={text}>
              {t.gracePeriodBody} <strong>{gracePeriodEnd}</strong>
            </Text>
            <Text style={text}>{t.gracePeriodBody2}</Text>

            <Heading as="h3" style={h3}>
              {t.afterGracePeriod}
            </Heading>
            <Text style={text}>{t.afterGracePeriodBody}</Text>
          </Section>

          <Section style={reasonsBox}>
            <Heading as="h3" style={h3}>
              {t.commonReasons}
            </Heading>
            <Text style={text}>• {t.reason1}</Text>
            <Text style={text}>• {t.reason2}</Text>
            <Text style={text}>• {t.reason3}</Text>
            <Text style={text}>• {t.reason4}</Text>
          </Section>

          <Section style={stepsBox}>
            <Heading as="h3" style={h3}>
              {t.howToFix}
            </Heading>
            <Text style={text}>1. {t.fixStep1}</Text>
            <Text style={text}>2. {t.fixStep2}</Text>
            <Text style={text}>3. {t.fixStep3}</Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={updatePaymentUrl}>
              {t.updateButton}
            </Button>
          </Section>

          <Section style={questionBox}>
            <Text style={text}>
              <strong>{t.questions}</strong>
            </Text>
            <Text style={text}>{t.questionsBody}</Text>
            <Link href="mailto:contact@healthincloud.app" style={link}>
              {t.contactUs}
            </Link>
          </Section>

          <Text style={footer}>
            {t.thanks}
            <br />
            {t.team}
          </Text>

          <Text style={footerCopyright}>{t.footer}</Text>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '32px',
  margin: '16px 24px',
}

const h2 = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '28px',
  margin: '16px 0',
}

const h3 = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '24px',
  margin: '16px 0 8px 0',
}

const text = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '8px 24px',
}

const errorBox = {
  backgroundColor: '#fee2e2',
  borderRadius: '8px',
  margin: '24px',
  padding: '16px',
}

const errorText = {
  color: '#991b1b',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '28px',
  margin: '0 0 8px 0',
}

const detailsBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  margin: '24px',
  padding: '16px',
  textAlign: 'center' as const,
}

const detailLabel = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0 4px 0',
}

const detailValue = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '28px',
  margin: '0 0 16px 0',
}

const infoBox = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  margin: '24px',
  padding: '16px',
}

const reasonsBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  margin: '24px',
  padding: '16px',
}

const stepsBox = {
  backgroundColor: '#dbeafe',
  borderRadius: '8px',
  margin: '24px',
  padding: '16px',
}

const questionBox = {
  borderTop: '1px solid #e5e7eb',
  margin: '24px',
  paddingTop: '24px',
}

const buttonContainer = {
  margin: '32px 24px',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const link = {
  color: '#2563eb',
  textDecoration: 'underline',
}

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px',
  marginTop: '48px',
}

const footerCopyright = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '24px',
  textAlign: 'center' as const,
}
