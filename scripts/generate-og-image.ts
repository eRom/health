import sharp from 'sharp'

import { logger } from '../lib/logger'

async function generateOgImage() {
  const svgImage = `
  <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <!-- Fond dégradé -->
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#0a0a0a;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#grad)"/>

    <!-- Logo centré (taille 200x200) -->
    <g transform="translate(500, 165)">
      <svg width="200" height="200" viewBox="0 0 40 40">
        <path d="M30 16.5C30 13.462 27.538 11 24.5 11C23.542 11 22.65 11.242 21.875 11.662C20.95 9.562 18.775 8 16.25 8C12.798 8 10 10.798 10 14.25C10 14.583 10.025 14.909 10.073 15.228C8.282 16.154 7 18.006 7 20.125C7 23.228 9.522 25.75 12.625 25.75H28.375C31.478 25.75 34 23.228 34 20.125C34 17.78 32.602 15.768 30.625 15.042C30.542 15.019 30.458 15 30.375 15C30.25 15 30.125 15.25 30 16.5Z" fill="#2da6b2" fill-opacity="0.2"/>
        <path d="M12 19H15V16C15 15.448 15.448 15 16 15H18C18.552 15 19 15.448 19 16V19H22C22.552 19 23 19.448 23 20V22C23 22.552 22.552 23 22 23H19V26C19 26.552 18.552 27 18 27H16C15.448 27 15 26.552 15 26V23H12C11.448 23 11 22.552 11 22V20C11 19.448 11.448 19 12 19Z" fill="#2da6b2"/>
        <path d="M8 32L11 32L12.5 29L14.5 35L17 28L19 32L22 32L24 29L26 35L28.5 32L32 32" stroke="#2da6b2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill-opacity="0.8"/>
      </svg>
    </g>

    <!-- Texte -->
    <text x="600" y="450" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#ffffff" text-anchor="middle">
      Health In Cloud
    </text>
    <text x="600" y="500" font-family="Arial, sans-serif" font-size="24" fill="#a0a0a0" text-anchor="middle">
      Plateforme de rééducation MPR
    </text>
  </svg>
  `

  await sharp(Buffer.from(svgImage))
    .png()
    .toFile('./public/og-image.png')

  logger.info('✓ og-image.png créé (1200x630)')
}

generateOgImage().catch((error) => {
  logger.error(error, 'Failed to generate OG image')
  process.exit(1)
})
