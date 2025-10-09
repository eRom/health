import {
    Section,
    Text,
} from '@react-email/components'
import { EmailButton } from '../components/EmailButton'
import { EmailLayout } from '../components/EmailLayout'

interface ResetPasswordProps {
  resetUrl: string
  locale?: string
}

export function ResetPassword({ resetUrl, locale = 'fr' }: ResetPasswordProps) {
  const isFrench = locale === 'fr'
  
  return (
    <EmailLayout locale={locale}>
      <Section style={{ padding: '20px 0' }}>
        <Text style={title}>
          {isFrench 
            ? 'Réinitialisez votre mot de passe'
            : 'Reset your password'
          }
        </Text>
        
        <Text style={text}>
          {isFrench 
            ? 'Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Health In Cloud. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.'
            : 'You have requested to reset your password for your Health In Cloud account. Click the button below to create a new password.'
          }
        </Text>
        
        <EmailButton href={resetUrl}>
          {isFrench 
            ? 'Réinitialiser mon mot de passe'
            : 'Reset my password'
          }
        </EmailButton>
        
        <Text style={text}>
          {isFrench 
            ? 'Ce lien est valide pendant 1 heure. Si vous n\'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.'
            : 'This link is valid for 1 hour. If you didn\'t request this reset, you can ignore this email.'
          }
        </Text>
        
        <Text style={smallText}>
          {isFrench 
            ? 'Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :'
            : 'If the button doesn\'t work, copy and paste this link into your browser:'
          }
        </Text>
        
        <Text style={linkText}>
          {resetUrl}
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
