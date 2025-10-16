import { ProtectedClientPage } from '@/components/subscription/protected-client-page'
import NeuroClientPage from './client-page'

export default async function NeuroPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <ProtectedClientPage locale={locale}>
      <NeuroClientPage />
    </ProtectedClientPage>
  )
}
