import { declineProviderInvitation } from '@/app/actions/patient/decline-provider-invitation'
import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    
    logger.info('[API_DECLINE_INVITATION] Processing invitation decline', { token })

    const result = await declineProviderInvitation({ invitationToken: token })

    if (result.success) {
      // Rediriger vers la page de succès avec un message
      const url = new URL('/fr/dashboard', request.url)
      url.searchParams.set('message', 'invitation-declined')
      url.searchParams.set('success', 'true')
      
      logger.info('[API_DECLINE_INVITATION] Invitation declined successfully', { token })
      return NextResponse.redirect(url)
    } else {
      // Rediriger vers la page d'erreur avec le message d'erreur
      const url = new URL('/fr/dashboard', request.url)
      url.searchParams.set('error', 'invitation-error')
      url.searchParams.set('message', 'Erreur lors du déclin de l\'invitation')
      
      logger.warn('[API_DECLINE_INVITATION] Failed to decline invitation', { token })
      return NextResponse.redirect(url)
    }
  } catch (error) {
    logger.error(error, '[API_DECLINE_INVITATION] Unexpected error processing invitation')
    
    const url = new URL('/fr/dashboard', request.url)
    url.searchParams.set('error', 'invitation-error')
    url.searchParams.set('message', 'Une erreur inattendue s\'est produite')
    
    return NextResponse.redirect(url)
  }
}
