'use client'

import { trackBadgeShareAction } from '@/app/actions/track-badge-share'
import type { ShareFormat } from '@/app/api/badges/templates'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { generateShareText, getBadgePageUrl, getBadgeShareUrl } from '@/lib/services/badge-share'
import type { UserBadgeWithProgress } from '@/lib/types/badge'
import {
    Copy,
    Download,
    Facebook,
    Instagram,
    MessageCircle,
    Share2,
    Twitter
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'

interface BadgeShareButtonProps {
  badge: UserBadgeWithProgress
  variant?: 'default' | 'icon'
  className?: string
  disabled?: boolean
}

const FORMAT_ICONS = {
  facebook: Facebook,
  whatsapp: MessageCircle,
  instagram: Instagram,
  instagramStory: Instagram,
  facebookStory: Facebook,
  twitter: Twitter,
}

const FORMAT_LABELS = {
  facebook: 'Facebook',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  instagramStory: 'Instagram (Story)',
  facebookStory: 'Facebook (Story)',
  twitter: 'Twitter/X',
}

export function BadgeShareButton({ 
  badge, 
  variant = 'default',
  className,
  disabled = false
}: BadgeShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<ShareFormat>('facebook')
  const [isLoading, setIsLoading] = useState(false)
  const t = useTranslations()
  const locale = useLocale()

  // Check if Web Share API is available
  const isWebShareSupported = typeof navigator !== 'undefined' && 'share' in navigator

  const handleShare = async (platform: 'native-share' | 'copy' | 'download', format?: ShareFormat) => {
    setIsLoading(true)
    
    try {
      const shareFormat = format || selectedFormat
      const shareText = await generateShareText(badge, locale)

      if (platform === 'native-share' && isWebShareSupported) {
        // Use Web Share API with badge page URL
        const badgePageUrl = await getBadgePageUrl(badge.id, locale)
        await navigator.share({
          title: `${badge.definition.emoji} ${badge.definition.name}`,
          text: shareText,
          url: badgePageUrl,
        })
        
        await trackBadgeShareAction(badge.id, 'native-share')
        toast.success(t('badges.share.success.shared'))
        
      } else if (platform === 'copy') {
        // Copy badge page link to clipboard
        const badgePageUrl = await getBadgePageUrl(badge.id, locale)
        await navigator.clipboard.writeText(badgePageUrl)
        await trackBadgeShareAction(badge.id, 'copy')
        toast.success(t('badges.share.success.copied'))
        
      } else if (platform === 'download') {
        // Download image
        try {
          const shareUrl = await getBadgeShareUrl(badge.id, shareFormat)
          
          // Test if the URL is accessible first
          const response = await fetch(shareUrl, { method: 'HEAD' })
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
          
          const link = document.createElement('a')
          link.href = shareUrl
          link.download = `badge-${badge.definition.name.replace(/\s+/g, '-').toLowerCase()}-${shareFormat}.png`
          link.target = '_blank'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          await trackBadgeShareAction(badge.id, 'download')
          toast.success(t('badges.share.success.downloaded'))
        } catch (downloadError: unknown) {
          console.error('Download error:', downloadError)
          const errorMessage = downloadError instanceof Error ? downloadError.message : 'Erreur inconnue'
          toast.error(`Erreur de téléchargement: ${errorMessage}`)
        }
      }
      
      setIsOpen(false)
    } catch (error) {
      console.error('Error sharing badge:', error)
      toast.error('Erreur lors du partage')
    } finally {
      setIsLoading(false)
    }
  }


  if (variant === 'icon') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={disabled}>
            <Share2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isWebShareSupported && (
            <DropdownMenuItem onClick={() => handleShare('native-share')}>
              <Share2 className="mr-2 h-4 w-4" />
              {t('badges.share.actions.share')}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => handleShare('copy')}>
            <Copy className="mr-2 h-4 w-4" />
            {t('badges.share.actions.copyLink')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare('download')}>
            <Download className="mr-2 h-4 w-4" />
            {t('badges.share.actions.download')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className} disabled={disabled}>
          <Share2 className="mr-2 h-4 w-4" />
          {t('badges.share.title')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            {t('badges.share.title')}
          </DialogTitle>
          <DialogDescription>
            {t('badges.share.description')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Format Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t('badges.share.selectFormat')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(FORMAT_LABELS).map(([format, label]) => {
                const Icon = FORMAT_ICONS[format as ShareFormat]
                return (
                  <Button
                    key={format}
                    variant={selectedFormat === format ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFormat(format as ShareFormat)}
                    className="justify-start"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {label}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Preview */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{badge.definition.emoji}</div>
              <div>
                <div className="font-medium">{badge.definition.name}</div>
                <div className="text-sm text-muted-foreground">
                  Format: {FORMAT_LABELS[selectedFormat]}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2">
            {isWebShareSupported && (
              <Button 
                onClick={() => handleShare('native-share')}
                disabled={isLoading}
                className="flex-1"
              >
                <Share2 className="mr-2 h-4 w-4" />
                {t('badges.share.actions.share')}
              </Button>
            )}
            <Button 
              variant="outline"
              onClick={() => handleShare('copy')}
              disabled={isLoading}
            >
              <Copy className="mr-2 h-4 w-4" />
              {t('badges.share.actions.copyLink')}
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleShare('download')}
              disabled={isLoading}
            >
              <Download className="mr-2 h-4 w-4" />
              {t('badges.share.actions.download')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
