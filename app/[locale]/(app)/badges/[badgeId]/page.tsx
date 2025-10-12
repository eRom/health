import { BadgeShareButton } from '@/components/badges/badge-share-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/routing'
import { prisma } from '@/lib/prisma'
import { BADGE_DEFINITIONS } from '@/lib/types/badge'
import { ArrowLeft, Calendar, Trophy } from 'lucide-react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface BadgePageProps {
  params: Promise<{ badgeId: string; locale: string }>
}

async function getBadgeWithUser(badgeId: string) {
  const badge = await prisma.userBadge.findUnique({
    where: { id: badgeId },
    include: { user: true },
  })

  if (!badge) {
    return null
  }

  const definition = BADGE_DEFINITIONS[badge.badgeType]
  if (!definition) {
    return null
  }

  return {
    ...badge,
    definition,
  }
}

export async function generateMetadata({
  params,
}: BadgePageProps): Promise<Metadata> {
  const { badgeId, locale } = await params
  const badge = await getBadgeWithUser(badgeId)

  if (!badge) {
    return {
      title: 'Badge non trouvé',
      description: 'Ce badge n&apos;existe pas ou n&apos;est plus disponible.',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const shareUrl = `${baseUrl}/${locale}/badges/${badgeId}`
  const imageUrl = `${baseUrl}/api/badges/share/${badgeId}/universal`

  return {
    title: `${badge.user.name} a obtenu le badge ${badge.definition.name}`,
    description: badge.definition.message,
    openGraph: {
      title: `${badge.definition.emoji} ${badge.definition.name}`,
      description: badge.definition.message,
      type: 'website',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      url: shareUrl,
      siteName: 'Health In Cloud',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: badge.definition.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${badge.definition.emoji} ${badge.definition.name}`,
      description: badge.definition.message,
      images: [`${baseUrl}/api/badges/share/${badgeId}/twitter`],
      creator: '@healthincloud',
      site: '@healthincloud',
    },
    alternates: {
      canonical: shareUrl,
      languages: {
        fr: `${baseUrl}/fr/badges/${badgeId}`,
        en: `${baseUrl}/en/badges/${badgeId}`,
      },
    },
  }
}

export default async function BadgePage({ params }: BadgePageProps) {
  const { badgeId } = await params
  const badge = await getBadgeWithUser(badgeId)

  if (!badge) {
    notFound()
  }


  return (
    <div className="container py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/badges">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux badges
          </Link>
        </Button>
        
        <div className="text-center">
          <div className="text-6xl mb-4">{badge.definition.emoji}</div>
          <h1 className="text-3xl font-bold mb-2">{badge.definition.name}</h1>
          <p className="text-lg text-muted-foreground mb-4">
            {badge.definition.description}
          </p>
          <Badge variant="secondary" className="text-sm">
            <Trophy className="mr-1 h-3 w-3" />
            Badge obtenu
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Badge Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Détails du badge
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Message de félicitations</h3>
              <p className="text-muted-foreground">
                {badge.definition.message}
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Obtenu le {badge.earnedAt.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Utilisateur</h3>
              <p className="text-muted-foreground">{badge.user.name}</p>
            </div>
          </CardContent>
        </Card>

        {/* Share Options */}
        <Card>
          <CardHeader>
            <CardTitle>Partager ce badge</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Partagez votre réussite avec vos proches et inspirez d&apos;autres personnes 
                dans leur parcours de récupération.
              </p>
              
              <BadgeShareButton 
                badge={{
                  ...badge,
                  progress: undefined, // Not needed for sharing
                }} 
                variant="default"
                disabled={true}
              />
              
              <div className="text-xs text-muted-foreground">
                💡 Les images générées incluent automatiquement votre nom, 
                le badge obtenu et la date d&apos;obtention.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Ce badge fait partie du système de gamification de Health In Cloud, 
              conçu pour motiver et récompenser votre progression dans votre parcours de récupération.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
