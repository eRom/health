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

interface TrialEndedEmailProps {
  userName: string
  subscriptionUrl: string
  locale?: 'fr' | 'en'
}

const translations = {
  fr: {
    preview: 'Votre essai gratuit est terminé',
    greeting: 'Bonjour',
    title: 'Votre essai gratuit est terminé',
    body1: 'Votre période d\'essai gratuite de 14 jours vient de se terminer.',
    body2: 'Pour continuer à accéder aux exercices de rééducation et suivre votre progression, vous devez souscrire à un abonnement.',
    whySubscribe: 'Pourquoi s\'abonner ?',
    point1: 'Accès illimité à tous les exercices (neuropsychologie, orthophonie, ergothérapie, kinésithérapie)',
    point2: 'Suivi détaillé de votre progression',
    point3: 'Tableau de bord personnalisé',
    point4: 'Export de données (PDF, CSV)',
    point5: 'Support prioritaire par email',
    pricing: 'Nos formules',
    monthly: 'Formule mensuelle : 19€/mois',
    yearly: 'Formule annuelle : 180€/an (soit 15€/mois, -20%)',
    subscribeButton: 'Choisir une formule',
    questions: 'Des questions ?',
    questionsBody: 'Notre équipe est là pour vous aider.',
    contactUs: 'Contactez-nous',
    thanks: 'Merci de votre confiance,',
    team: 'L\'équipe Health In Cloud',
    footer: '© 2025 Health In Cloud. Tous droits réservés.',
  },
  en: {
    preview: 'Your free trial has ended',
    greeting: 'Hello',
    title: 'Your free trial has ended',
    body1: 'Your 14-day free trial period has just ended.',
    body2: 'To continue accessing rehabilitation exercises and tracking your progress, you need to subscribe to a plan.',
    whySubscribe: 'Why subscribe?',
    point1: 'Unlimited access to all exercises (neuropsychology, speech therapy, occupational therapy, physiotherapy)',
    point2: 'Detailed progress tracking',
    point3: 'Personalized dashboard',
    point4: 'Data export (PDF, CSV)',
    point5: 'Priority email support',
    pricing: 'Our plans',
    monthly: 'Monthly plan: €19/month',
    yearly: 'Yearly plan: €180/year (€15/month, -20%)',
    subscribeButton: 'Choose a plan',
    questions: 'Questions?',
    questionsBody: 'Our team is here to help.',
    contactUs: 'Contact us',
    thanks: 'Thank you for your trust,',
    team: 'The Health In Cloud Team',
    footer: '© 2025 Health In Cloud. All rights reserved.',
  },
}

export default function TrialEndedEmail({
  userName,
  subscriptionUrl,
  locale = 'fr',
}: TrialEndedEmailProps) {
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

          <Section style={warningBox}>
            <Text style={warningText}>{t.body1}</Text>
            <Text style={text}>{t.body2}</Text>
          </Section>

          <Section style={infoBox}>
            <Heading as="h2" style={h2}>
              {t.whySubscribe}
            </Heading>
            <Text style={text}>• {t.point1}</Text>
            <Text style={text}>• {t.point2}</Text>
            <Text style={text}>• {t.point3}</Text>
            <Text style={text}>• {t.point4}</Text>
            <Text style={text}>• {t.point5}</Text>
          </Section>

          <Section style={pricingBox}>
            <Heading as="h2" style={h2}>
              {t.pricing}
            </Heading>
            <Text style={text}>
              <strong>{t.monthly}</strong>
            </Text>
            <Text style={text}>
              <strong>{t.yearly}</strong>
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={subscriptionUrl}>
              {t.subscribeButton}
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

const text = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 24px',
}

const warningBox = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  margin: '24px',
  padding: '16px',
}

const warningText = {
  color: '#92400e',
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '28px',
  margin: '0 0 16px 0',
}

const infoBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  margin: '24px',
  padding: '16px',
}

const pricingBox = {
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
