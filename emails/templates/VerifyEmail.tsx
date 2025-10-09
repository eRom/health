import {
    Section,
    Text,
} from '@react-email/components'
import { EmailButton } from '../components/EmailButton'
import { EmailLayout } from '../components/EmailLayout'

interface VerifyEmailProps {
  verificationUrl: string
  locale?: string
}

export function VerifyEmail({ verificationUrl, locale = 'fr' }: VerifyEmailProps) {
  const isFrench = locale === 'fr'
  
  return (
    <EmailLayout locale={locale}>
      <Section style={{ padding: '20px 0' }}>
        <Text style={title}>
          {isFrench 
            ? 'Vérifiez votre adresse email'
            : 'Verify your email address'
          }
        </Text>
        
        <Text style={text}>
          {isFrench 
            ? 'Merci de vous être inscrit sur Health In Cloud ! Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous pour vérifier votre adresse email.'
            : 'Thank you for signing up to Health In Cloud! To activate your account, please click the button below to verify your email address.'
          }
        </Text>
        
        <EmailButton href={verificationUrl}>
          {isFrench 
            ? 'Vérifier mon email'
            : 'Verify my email'
          }
        </EmailButton>
        
        <Text style={text}>
          {isFrench 
            ? 'Ce lien est valide pendant 24 heures. Si vous n\'avez pas créé de compte, vous pouvez ignorer cet email.'
            : 'This link is valid for 24 hours. If you didn\'t create an account, you can ignore this email.'
          }
        </Text>
        
        <Text style={smallText}>
          {isFrench 
            ? 'Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :'
            : 'If the button doesn\'t work, copy and paste this link into your browser:'
          }
        </Text>
        
        <Text style={linkText}>
          {verificationUrl}
        </Text>
      </Section>
    </EmailLayout>
  )
}

const title = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1a202c',
  margin: '0 0 20px',
  textAlign: 'center' as const,
}

const text = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#4a5568',
  margin: '0 0 16px',
}

const smallText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#718096',
  margin: '20px 0 8px',
}

const linkText = {
  fontSize: '12px',
  lineHeight: '16px',
  color: '#667eea',
  wordBreak: 'break-all' as const,
  backgroundColor: '#f7fafc',
  padding: '8px',
  borderRadius: '4px',
  margin: '0',
}
