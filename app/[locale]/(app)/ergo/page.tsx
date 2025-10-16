import { ProtectedClientPage } from '@/components/subscription/protected-client-page'
import ErgoClientPage from './client-page'

export default async function ErgoPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <ProtectedClientPage locale={locale}>
      <ErgoClientPage />
    </ProtectedClientPage>
  )
}
