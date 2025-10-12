import React from 'react'

export interface BadgeImageData {
  badgeEmoji: string
  badgeName: string
  userName: string
  earnedDate: string
  message: string
}

export interface ImageTemplate {
  width: number
  height: number
  generate: (data: BadgeImageData) => React.ReactElement
}

// Utility function for gradient backgrounds
const createGradient = (colors: string[], direction = '135deg') =>
  `linear-gradient(${direction}, ${colors.join(', ')})`

// Common container styles
const containerStyles = (background: string, padding = '40px') => ({
  height: '100%',
  width: '100%',
  background,
  color: 'white',
  display: 'flex' as const,
  flexDirection: 'column' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  fontFamily: 'Inter, system-ui, sans-serif',
  padding,
})

// Common element styles
const emojiStyles = (size: string) => ({
  fontSize: size,
  marginBottom: '30px',
})

const titleStyles = (size: string) => ({
  fontSize: size,
  fontWeight: 'bold' as const,
  textAlign: 'center' as const,
  marginBottom: '20px',
  lineHeight: '1.1',
})

const userStyles = {
  fontSize: '32px',
  marginBottom: '25px',
  opacity: 0.9,
  fontWeight: 300 as const,
}

const messageStyles = {
  fontSize: '24px',
  textAlign: 'center' as const,
  maxWidth: '800px',
  lineHeight: '1.4',
  marginBottom: '25px',
  opacity: 0.95,
}

const dateStyles = (size: string) => ({
  fontSize: size,
  opacity: 0.8,
  marginBottom: '20px',
})

const brandingStyles = (size: string) => ({
  fontSize: size,
  fontWeight: 600 as const,
  opacity: 0.9,
  marginTop: '40px',
})

// Templates
const FacebookTemplate: ImageTemplate = {
  width: 1200,
  height: 630,
  generate: (data) => (
    <div style={containerStyles(
      createGradient(['#ff1744', '#e91e63', '#9c27b0'])
    )}>
      <div style={emojiStyles('120px')}>{data.badgeEmoji}</div>
      <div style={titleStyles('48px')}>{data.badgeName}</div>
      <div style={userStyles}>{data.userName}</div>
      <div style={messageStyles}>{data.message}</div>
      <div style={dateStyles('20px')}>Obtenu le {data.earnedDate}</div>
      <div style={brandingStyles('22px')}>Health In Cloud</div>
    </div>
  ),
}

const WhatsAppTemplate: ImageTemplate = {
  width: 1200,
  height: 630,
  generate: (data) => (
    <div style={containerStyles(
      createGradient(['#25D366', '#128C7E', '#075E54'])
    )}>
      <div style={emojiStyles('120px')}>{data.badgeEmoji}</div>
      <div style={titleStyles('48px')}>{data.badgeName}</div>
      <div style={userStyles}>{data.userName}</div>
      <div style={messageStyles}>{data.message}</div>
      <div style={dateStyles('20px')}>Obtenu le {data.earnedDate}</div>
      <div style={brandingStyles('22px')}>Health In Cloud</div>
    </div>
  ),
}

const InstagramTemplate: ImageTemplate = {
  width: 1080,
  height: 1080,
  generate: (data) => (
    <div style={containerStyles(
      createGradient(['#ff1744', '#e91e63', '#ff9800']), '60px'
    )}>
      <div style={emojiStyles('140px')}>{data.badgeEmoji}</div>
      <div style={titleStyles('64px')}>{data.badgeName}</div>
      <div style={{ ...userStyles, fontSize: '48px', marginBottom: '50px' }}>{data.userName}</div>
      <div style={{ ...messageStyles, fontSize: '32px', marginBottom: '60px' }}>{data.message}</div>
      <div style={dateStyles('28px')}>{data.earnedDate}</div>
      <div style={brandingStyles('24px')}>Health In Cloud</div>
    </div>
  ),
}

const InstagramStoryTemplate: ImageTemplate = {
  width: 1080,
  height: 1920,
  generate: (data) => (
    <div style={containerStyles(
      createGradient(['#ff1744', '#e91e63', '#9c27b0'], '180deg'), '80px 60px'
    )}>
      <div style={emojiStyles('200px')}>{data.badgeEmoji}</div>
      <div style={titleStyles('56px')}>{data.badgeName}</div>
      <div style={{ ...userStyles, fontSize: '42px', marginBottom: '50px' }}>{data.userName}</div>
      <div style={{ ...messageStyles, fontSize: '36px', marginBottom: '50px', maxWidth: '900px', padding: '0 20px' }}>{data.message}</div>
      <div style={dateStyles('32px')}>{data.earnedDate}</div>
      <div style={brandingStyles('36px')}>Health In Cloud</div>
    </div>
  ),
}

const FacebookStoryTemplate: ImageTemplate = {
  width: 1080,
  height: 1920,
  generate: (data) => (
    <div style={containerStyles(
      createGradient(['#1877f2', '#42a5f5', '#64b5f6'], '180deg'), '80px 60px'
    )}>
      <div style={emojiStyles('200px')}>{data.badgeEmoji}</div>
      <div style={titleStyles('56px')}>{data.badgeName}</div>
      <div style={{ ...userStyles, fontSize: '42px', marginBottom: '50px' }}>{data.userName}</div>
      <div style={{ ...messageStyles, fontSize: '36px', marginBottom: '50px', maxWidth: '900px', padding: '0 20px' }}>{data.message}</div>
      <div style={dateStyles('32px')}>{data.earnedDate}</div>
      <div style={brandingStyles('36px')}>Health In Cloud</div>
    </div>
  ),
}

const TwitterTemplate: ImageTemplate = {
  width: 1600,
  height: 900,
  generate: (data) => (
    <div style={containerStyles(
      createGradient(['#1da1f2', '#1976d2', '#0d47a1'], '90deg'), '50px'
    )}>
      <div style={emojiStyles('120px')}>{data.badgeEmoji}</div>
      <div style={titleStyles('48px')}>{data.badgeName}</div>
      <div style={userStyles}>{data.userName}</div>
      <div style={messageStyles}>{data.message}</div>
      <div style={dateStyles('20px')}>Obtenu le {data.earnedDate}</div>
      <div style={brandingStyles('24px')}>Health In Cloud</div>
    </div>
  ),
}

export const IMAGE_TEMPLATES = {
  facebook: FacebookTemplate,
  whatsapp: WhatsAppTemplate,
  instagram: InstagramTemplate,
  instagramStory: InstagramStoryTemplate,
  facebookStory: FacebookStoryTemplate,
  twitter: TwitterTemplate,
} as const

export type ShareFormat = keyof typeof IMAGE_TEMPLATES
