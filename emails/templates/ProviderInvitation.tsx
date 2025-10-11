import { EmailLayout } from '../components/EmailLayout'

interface ProviderInvitationProps {
  providerName: string
  providerEmail: string
  invitationUrl: string
  declineUrl: string
  customMessage?: string
  locale?: 'fr' | 'en'
}

export function ProviderInvitation({ 
  providerName, 
  providerEmail, 
  invitationUrl,
  declineUrl,
  customMessage,
  locale = 'fr' 
}: ProviderInvitationProps) {
  const isFrench = locale === 'fr'

  return (
    <EmailLayout locale={locale}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#007FFF',
          margin: '0 0 16px 0'
        }}>
          {isFrench ? 'Invitation de votre soignant' : 'Invitation from your healthcare provider'}
        </h1>
        <p style={{ 
          fontSize: '16px', 
          color: '#666666',
          margin: '0'
        }}>
          {isFrench 
            ? 'Un professionnel de santé souhaite vous accompagner dans votre rééducation'
            : 'A healthcare professional wants to support you in your rehabilitation'
          }
        </p>
      </div>

      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '24px', 
        borderRadius: '8px',
        marginBottom: '32px'
      }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          margin: '0 0 16px 0',
          color: '#333333'
        }}>
          {isFrench ? 'Votre soignant' : 'Your healthcare provider'}
        </h2>
        
        <div style={{ marginBottom: '16px' }}>
          <p style={{ 
            fontSize: '16px', 
            fontWeight: '600',
            margin: '0 0 4px 0',
            color: '#333333'
          }}>
            {providerName}
          </p>
          <p style={{ 
            fontSize: '14px', 
            color: '#666666',
            margin: '0'
          }}>
            {providerEmail}
          </p>
        </div>

        {customMessage && (
          <div style={{ 
            backgroundColor: '#ffffff',
            padding: '16px',
            borderRadius: '6px',
            borderLeft: '4px solid #007FFF'
          }}>
            <p style={{ 
              fontSize: '14px', 
              fontWeight: '600',
              margin: '0 0 8px 0',
              color: '#333333'
            }}>
              {isFrench ? 'Message personnalisé :' : 'Personal message:'}
            </p>
            <p style={{ 
              fontSize: '14px', 
              color: '#555555',
              margin: '0',
              fontStyle: 'italic'
            }}>
              "{customMessage}"
            </p>
          </div>
        )}
      </div>

      <div style={{ 
        backgroundColor: '#ffffff', 
        padding: '24px', 
        borderRadius: '8px',
        border: '1px solid #e1e5e9',
        marginBottom: '32px'
      }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          margin: '0 0 16px 0',
          color: '#333333'
        }}>
          {isFrench ? 'Que va-t-il se passer ?' : 'What will happen?'}
        </h2>
        
        <ul style={{ 
          fontSize: '14px', 
          color: '#555555',
          margin: '0',
          paddingLeft: '20px'
        }}>
          <li style={{ marginBottom: '8px' }}>
            {isFrench 
              ? 'Votre soignant pourra suivre votre progression dans les exercices'
              : 'Your healthcare provider will be able to track your exercise progress'
            }
          </li>
          <li style={{ marginBottom: '8px' }}>
            {isFrench 
              ? 'Vous pourrez échanger des messages avec votre soignant'
              : 'You will be able to exchange messages with your healthcare provider'
            }
          </li>
          <li style={{ marginBottom: '8px' }}>
            {isFrench 
              ? 'Vos données restent privées et sécurisées'
              : 'Your data remains private and secure'
            }
          </li>
        </ul>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <a 
          href={invitationUrl}
          style={{
            display: 'inline-block',
            backgroundColor: '#007FFF',
            color: '#ffffff',
            padding: '16px 32px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '600',
            textAlign: 'center',
            marginRight: '16px'
          }}
        >
          {isFrench ? 'Accepter l\'invitation' : 'Accept invitation'}
        </a>
        
        <a 
          href={declineUrl}
          style={{
            display: 'inline-block',
            backgroundColor: '#6c757d',
            color: '#ffffff',
            padding: '16px 32px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '600',
            textAlign: 'center'
          }}
        >
          {isFrench ? 'Décliner' : 'Decline'}
        </a>
      </div>

      <div style={{ 
        fontSize: '12px', 
        color: '#999999',
        textAlign: 'center',
        lineHeight: '1.5'
      }}>
        <p style={{ margin: '0 0 8px 0' }}>
          {isFrench 
            ? 'Si vous ne souhaitez pas être accompagné par ce soignant, vous pouvez simplement ignorer cet email.'
            : 'If you do not wish to be supported by this healthcare provider, you can simply ignore this email.'
          }
        </p>
        <p style={{ margin: '0' }}>
          {isFrench 
            ? 'Cette invitation expire dans 7 jours.'
            : 'This invitation expires in 7 days.'
          }
        </p>
      </div>
    </EmailLayout>
  )
}
