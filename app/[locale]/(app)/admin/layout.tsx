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
  
  return <div className="container py-8">{children}</div>;
}
