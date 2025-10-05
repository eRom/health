import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Créer un compte',
  description: 'Créez votre compte Health In Cloud pour commencer vos exercices de rééducation orthophonique et neuropsychologique',
  robots: {
    index: true,
    follow: true,
  },
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
