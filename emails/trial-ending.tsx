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

interface TrialEndingEmailProps {
  userName: string
  daysLeft: number
  manageSubscriptionUrl: string
  locale?: 'fr' | 'en'
}

const translations = {
  fr: {
    preview: 'Votre essai gratuit se termine bientôt',
    greeting: 'Bonjour',
    title: 'Votre essai gratuit se termine bientôt',
    body1: 'Votre période d\'essai gratuite de 14 jours prend fin dans',
    days: (n: number) => `${n} jour${n > 1 ? 's' : ''}`,
    body2: 'Vous profitez actuellement de tous les exercices de rééducation sans aucune limite. Pour continuer à bénéficier de cet accès illimité après la fin de votre essai, aucune action n\'est nécessaire.',
    whatHappens: 'Que se passe-t-il ensuite ?',
    point1: 'Votre abonnement mensuel de 19€ débutera automatiquement',
    point2: 'Vous conserverez l\'accès à tous les exercices',
    point3: 'Vous pourrez annuler à tout moment depuis votre profil',
    noWant: 'Vous ne souhaitez pas continuer ?',
    noWantBody: 'Si vous préférez ne pas être facturé, vous pouvez annuler votre abonnement à tout moment avant la fin de l\'essai.',
    manageButton: 'Gérer mon abonnement',
    questions: 'Des questions ?',
    questionsBody: 'Notre équipe est là pour vous aider.',
    contactUs: 'Contactez-nous',
    thanks: 'Merci de votre confiance,',
    team: 'L\'équipe Health In Cloud',
    footer: '© 2025 Health In Cloud. Tous droits réservés.',
  },
  en: {
    preview: 'Your free trial is ending soon',
    greeting: 'Hello',
    title: 'Your free trial is ending soon',
    body1: 'Your 14-day free trial period ends in',
    days: (n: number) => `${n} day${n > 1 ? 's' : ''}`,
    body2: 'You are currently enjoying all rehabilitation exercises without any limits. To continue benefiting from this unlimited access after your trial ends, no action is needed.',
    whatHappens: 'What happens next?',
    point1: 'Your €19 monthly subscription will start automatically',
    point2: 'You will keep access to all exercises',
    point3: 'You can cancel anytime from your profile',
    noWant: 'Don\'t want to continue?',
    noWantBody: 'If you prefer not to be charged, you can cancel your subscription anytime before the trial ends.',
    manageButton: 'Manage my subscription',
    questions: 'Questions?',
    questionsBody: 'Our team is here to help.',
    contactUs: 'Contact us',
    thanks: 'Thank you for your trust,',
    team: 'The Health In Cloud Team',
    footer: '© 2025 Health In Cloud. All rights reserved.',
  },
}

export default function TrialEndingEmail({
  userName,
  daysLeft,
  manageSubscriptionUrl,
  locale = 'fr',
}: TrialEndingEmailProps) {
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
              {t.body1} <strong>{t.days(daysLeft)}</strong>
            </Text>
          </Section>

          <Text style={text}>{t.body2}</Text>

          <Section style={infoBox}>
            <Heading as="h2" style={h2}>
              {t.whatHappens}
            </Heading>
            <Text style={text}>• {t.point1}</Text>
            <Text style={text}>• {t.point2}</Text>
            <Text style={text}>• {t.point3}</Text>
          </Section>

          <Section style={warningBox}>
            <Heading as="h3" style={h3}>
              {t.noWant}
            </Heading>
            <Text style={text}>{t.noWantBody}</Text>
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
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '28px',
  margin: '0',
  textAlign: 'center' as const,
}

const infoBox = {
  backgroundColor: '#f3f4f6',
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
