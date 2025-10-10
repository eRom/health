import { requireAdmin } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  try {
    await requireAdmin()
  } catch {
    const { locale } = await params
    redirect(`/${locale}/dashboard`)
  }
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Administration</h1>
        <p className="text-muted-foreground">Gestion des membres</p>
      </div>
      {children}
    </div>
  )
}
