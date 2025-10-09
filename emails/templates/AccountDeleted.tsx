import {
    Section,
    Text,
} from '@react-email/components'
import { EmailLayout } from '../components/EmailLayout'

interface AccountDeletedProps {
  name: string
  locale?: string
}

export function AccountDeleted({ name, locale = 'fr' }: AccountDeletedProps) {
  const isFrench = locale === 'fr'
  
  return (
    <EmailLayout locale={locale}>
      <Section style={{ padding: '20px 0' }}>
        <Text style={title}>
          {isFrench 
            ? 'Compte supprimé'
            : 'Account deleted'
          }
        </Text>
        
        <Text style={text}>
          {isFrench 
            ? `Bonjour ${name},`
            : `Hello ${name},`
          }
        </Text>
        
        <Text style={text}>
          {isFrench 
            ? 'Nous confirmons que votre compte Health In Cloud a été supprimé avec succès. Toutes vos données personnelles ont été effacées de nos serveurs conformément au RGPD.'
            : 'We confirm that your Health In Cloud account has been successfully deleted. All your personal data has been erased from our servers in accordance with GDPR.'
          }
        </Text>
        
        <Text style={text}>
          {isFrench 
            ? 'Nous vous remercions d\'avoir utilisé notre plateforme de rééducation et nous espérons que cela vous a été utile dans votre parcours de soins.'
            : 'We thank you for using our rehabilitation platform and hope it was helpful in your care journey.'
          }
        </Text>
        
        <Text style={text}>
          {isFrench 
            ? 'Si vous souhaitez créer un nouveau compte à l\'avenir, vous pouvez toujours vous inscrire sur notre site.'
            : 'If you wish to create a new account in the future, you can always sign up on our website.'
          }
        </Text>
        
        <Text style={signature}>
          {isFrench 
            ? 'L\'équipe Health In Cloud'
            : 'The Health In Cloud Team'
          }
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

const signature = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#4a5568',
  margin: '20px 0 0',
  fontStyle: 'italic',
}
