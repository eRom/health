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

interface RenewalReminderEmailProps {
  userName: string
  renewalDate: string
  amount: string
  plan: 'monthly' | 'yearly'
  manageSubscriptionUrl: string
  locale?: 'fr' | 'en'
}

const translations = {
  fr: {
    preview: 'Rappel de renouvellement d\'abonnement',
    greeting: 'Bonjour',
    title: 'Votre abonnement sera renouvelé prochainement',
    body1: 'Nous vous informons que votre abonnement',
    monthly: 'mensuel',
    yearly: 'annuel',
    body2: 'sera automatiquement renouvelé le',
    amount: 'Montant du renouvellement',
    benefits: 'Ce que vous continuez à obtenir',
    point1: 'Accès illimité à tous les exercices de rééducation',
    point2: 'Suivi détaillé de votre progression',
    point3: 'Tableau de bord personnalisé',
    point4: 'Export de données (PDF, CSV)',
    point5: 'Support prioritaire par email',
    noAction: 'Aucune action requise',
    noActionBody: 'Votre abonnement sera automatiquement renouvelé. Si vos informations de paiement ont changé, pensez à les mettre à jour.',
    wantCancel: 'Vous souhaitez annuler ?',
    wantCancelBody: 'Vous pouvez annuler votre abonnement à tout moment. L\'annulation prendra effet à la fin de votre période de facturation actuelle.',
    manageButton: 'Gérer mon abonnement',
    questions: 'Des questions ?',
    questionsBody: 'Notre équipe est là pour vous aider.',
    contactUs: 'Contactez-nous',
    thanks: 'Merci de votre confiance,',
    team: 'L\'équipe Health In Cloud',
    footer: '© 2025 Health In Cloud. Tous droits réservés.',
  },
  en: {
    preview: 'Subscription renewal reminder',
    greeting: 'Hello',
    title: 'Your subscription will renew soon',
    body1: 'We are informing you that your',
    monthly: 'monthly',
    yearly: 'yearly',
    body2: 'subscription will be automatically renewed on',
    amount: 'Renewal amount',
    benefits: 'What you continue to get',
    point1: 'Unlimited access to all rehabilitation exercises',
    point2: 'Detailed progress tracking',
    point3: 'Personalized dashboard',
    point4: 'Data export (PDF, CSV)',
    point5: 'Priority email support',
    noAction: 'No action required',
    noActionBody: 'Your subscription will be automatically renewed. If your payment information has changed, remember to update it.',
    wantCancel: 'Want to cancel?',
    wantCancelBody: 'You can cancel your subscription at any time. Cancellation will take effect at the end of your current billing period.',
    manageButton: 'Manage my subscription',
    questions: 'Questions?',
    questionsBody: 'Our team is here to help.',
    contactUs: 'Contact us',
    thanks: 'Thank you for your trust,',
    team: 'The Health In Cloud Team',
    footer: '© 2025 Health In Cloud. All rights reserved.',
  },
}

export default function RenewalReminderEmail({
  userName,
  renewalDate,
  amount,
  plan,
  manageSubscriptionUrl,
  locale = 'fr',
}: RenewalReminderEmailProps) {
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

          <Text style={text}>{t.title}</Text>

          <Section style={highlightBox}>
            <Text style={highlightText}>
              {t.body1} {plan === 'monthly' ? t.monthly : t.yearly} {t.body2}{' '}
              <strong>{renewalDate}</strong>
            </Text>
          </Section>

          <Section style={amountBox}>
            <Text style={amountLabel}>{t.amount}</Text>
            <Text style={amountValue}>{amount}</Text>
          </Section>

          <Section style={infoBox}>
            <Heading as="h2" style={h2}>
              {t.benefits}
            </Heading>
            <Text style={text}>• {t.point1}</Text>
            <Text style={text}>• {t.point2}</Text>
            <Text style={text}>• {t.point3}</Text>
            <Text style={text}>• {t.point4}</Text>
            <Text style={text}>• {t.point5}</Text>
          </Section>

          <Section style={successBox}>
            <Heading as="h3" style={h3}>
              {t.noAction}
            </Heading>
            <Text style={text}>{t.noActionBody}</Text>
          </Section>

          <Section style={warningBox}>
            <Heading as="h3" style={h3}>
              {t.wantCancel}
            </Heading>
            <Text style={text}>{t.wantCancelBody}</Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={manageSubscriptionUrl}>
              {t.manageButton}
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
  margin: '16px 0',
}

const text = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 24px',
}

const highlightBox = {
  backgroundColor: '#dbeafe',
  borderRadius: '8px',
  margin: '24px',
  padding: '16px',
}

const highlightText = {
  color: '#1e40af',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  textAlign: 'center' as const,
}

const amountBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  margin: '24px',
  padding: '16px',
  textAlign: 'center' as const,
}

const amountLabel = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 8px 0',
}

const amountValue = {
  color: '#1f2937',
  fontSize: '32px',
  fontWeight: '700',
  lineHeight: '40px',
  margin: '0',
}

const infoBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  margin: '24px',
  padding: '16px',
}

const successBox = {
  backgroundColor: '#d1fae5',
  borderRadius: '8px',
  margin: '24px',
  padding: '16px',
}

const warningBox = {
  backgroundColor: '#fef3c7',
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
  backgroundColor: '#2563eb',
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
