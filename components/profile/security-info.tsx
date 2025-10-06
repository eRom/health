type Account = {
  id: string
  providerId: string
  accountId: string
}

export function SecurityInfo({ account }: { account: Account | null }) {
  if (!account) {
    return (
      <div>
        <p className="text-sm font-medium text-muted-foreground">Type de connexion</p>
        <p className="text-lg">Aucun compte lié</p>
      </div>
    )
  }

  const getProviderInfo = (providerId: string) => {
    switch (providerId) {
      case 'credential':
        return {
          name: 'Email et mot de passe',
          icon: '🔑',
          variant: 'default' as const,
        }
      case 'google':
        return {
          name: 'Connexion Google',
          icon: '🔗',
          variant: 'secondary' as const,
        }
      case 'apple':
        return {
          name: 'Connexion Apple',
          icon: '🍎',
          variant: 'secondary' as const,
        }
      default:
        return {
          name: `Connexion ${providerId}`,
          icon: '🔗',
          variant: 'secondary' as const,
        }
    }
  }

  const provider = getProviderInfo(account.providerId)

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-muted-foreground">Type de connexion</p>
      <div className="flex items-center gap-2">
        <span className="text-2xl">{provider.icon}</span>
        <span className="text-base font-medium">{provider.name}</span>
      </div>
    </div>
  )
}
