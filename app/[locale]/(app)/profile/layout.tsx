import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mon Profil',
  description: 'Gérez vos informations personnelles, sécurité et préférences',
  robots: {
    index: false,
    follow: false,
  },
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
