import { Button } from '@react-email/components'

interface EmailButtonProps {
  href: string
  children: React.ReactNode
}

export function EmailButton({ href, children }: EmailButtonProps) {
  return (
    <Button
      href={href}
      style={{
        backgroundColor: '#32b8c6',
        borderRadius: '8px',
        color: '#13343b',
        fontSize: '16px',
        fontWeight: 'bold',
        textDecoration: 'none',
        textAlign: 'center' as const,
        display: 'block',
        padding: '12px 20px',
        margin: '20px 0',
      }}
    >
      {children}
    </Button>
  )
}
