import {
    Body,
    Container,
    Head,
    Html,
    Img,
    Link,
    Section,
    Text,
} from '@react-email/components'

interface EmailLayoutProps {
  children: React.ReactNode
  locale?: string
}

export function EmailLayout({ children, locale = 'fr' }: EmailLayoutProps) {
  const isFrench = locale === 'fr'
  
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header with logo */}
          <Section style={header}>
            <Img
              src={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo.svg`}
              width="360"
              height="120"
              alt="Health In Cloud"
              style={logo}
            />
          </Section>

          {/* Main content */}
          <Section style={content}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              {isFrench 
                ? 'Health In Cloud - Plateforme de rééducation MPR'
                : 'Health In Cloud - MPR Rehabilitation Platform'
              }
            </Text>
            <Text style={footerText}>
              <Link href="https://fr.tipeee.com/rebondir-apres-lavc-ma-carriere-dans-la-tech" style={link}>
                {isFrench ? 'Soutenir le projet' : 'Support the project'}
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const header = {
  padding: '32px 24px 0',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto',
}

const content = {
  padding: '0 24px',
}

const footer = {
  padding: '24px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e6ebf1',
}

const footerText = {
  fontSize: '12px',
  lineHeight: '16px',
  color: '#8898aa',
  margin: '4px 0',
}

const link = {
  color: '#667eea',
  textDecoration: 'underline',
}
