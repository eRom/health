import { requireHealthcareProviderOrAdmin } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'

export default async function HealthcareLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  try {
    await requireHealthcareProviderOrAdmin()
  } catch {
    const { locale } = await params
    redirect(`/${locale}/dashboard`)
  }
  
  return (
    <div className="container py-8">
      {children}
    </div>
  )
}
