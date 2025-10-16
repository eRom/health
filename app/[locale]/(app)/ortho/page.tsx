import { ProtectedClientPage } from '@/components/subscription/protected-client-page'
import OrthoClientPage from './client-page'

export default async function OrthoPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <ProtectedClientPage locale={locale}>
      <OrthoClientPage />
    </ProtectedClientPage>
  )
}
