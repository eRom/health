import { acceptProviderInvitation } from '@/app/actions/patient/accept-provider-invitation'
import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    
    logger.info('[API_ACCEPT_INVITATION] Processing invitation acceptance', { token })

    const result = await acceptProviderInvitation({ invitationToken: token })

    if (result.success) {
      // Rediriger vers la page de succès avec un message
      const url = new URL('/fr/dashboard', request.url)
      url.searchParams.set('message', 'invitation-accepted')
      url.searchParams.set('success', 'true')
      
      logger.info('[API_ACCEPT_INVITATION] Invitation accepted successfully', { token })
      return NextResponse.redirect(url)
    } else {
      // Rediriger vers la page d'erreur avec le message d'erreur
      const url = new URL('/fr/dashboard', request.url)
      url.searchParams.set('error', 'invitation-error')
      url.searchParams.set('message', 'Erreur lors de l\'acceptation de l\'invitation')
      
      logger.warn('[API_ACCEPT_INVITATION] Failed to accept invitation', { token })
      return NextResponse.redirect(url)
    }
  } catch (error) {
    logger.error(error, '[API_ACCEPT_INVITATION] Unexpected error processing invitation')
    
    const url = new URL('/fr/dashboard', request.url)
    url.searchParams.set('error', 'invitation-error')
    url.searchParams.set('message', 'Une erreur inattendue s\'est produite')
    
    return NextResponse.redirect(url)
  }
}