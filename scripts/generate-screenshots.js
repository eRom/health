import sharp from 'sharp'
import { readFileSync } from 'fs'

async function generateScreenshots() {
  const logoSvg = readFileSync('public/logo.svg')

  // Screenshot 1: Logo centered with gradient background
  await sharp({
    create: {
      width: 1080,
      height: 1920,
      channels: 4,
      background: { r: 45, g: 166, b: 178, alpha: 1 },
    },
  })
    .composite([
      {
        input: await sharp(logoSvg)
          .resize(600, 600, { fit: 'contain' })
          .toBuffer(),
        gravity: 'center',
      },
      {
        input: Buffer.from(
          `<svg width="1080" height="1920">
            <text x="540" y="1400" font-family="Arial, sans-serif" font-size="72" fill="white" text-anchor="middle" font-weight="bold">Health In Cloud</text>
            <text x="540" y="1500" font-family="Arial, sans-serif" font-size="36" fill="rgba(255,255,255,0.9)" text-anchor="middle">Rééducation orthophonique</text>
            <text x="540" y="1560" font-family="Arial, sans-serif" font-size="36" fill="rgba(255,255,255,0.9)" text-anchor="middle">et neuropsychologique</text>
          </svg>`
        ),
      },
    ])
    .png()
    .toFile('public/screenshots/mobile-1.png')

  console.log('✅ Generated mobile-1.png (1080x1920)')

  // Screenshot 2: App interface mockup
  await sharp({
    create: {
      width: 1080,
      height: 1920,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 1 }, // dark theme bg
    },
  })
    .composite([
      {
        input: Buffer.from(
          `<svg width="1080" height="1920">
            <!-- Header bar -->
            <rect x="0" y="0" width="1080" height="120" fill="rgba(30,41,59,0.95)"/>
            <text x="540" y="75" font-family="Arial, sans-serif" font-size="48" fill="white" text-anchor="middle" font-weight="bold">Dashboard</text>

            <!-- Welcome card -->
            <rect x="60" y="180" width="960" height="300" rx="24" fill="rgba(45,166,178,0.1)" stroke="rgba(45,166,178,0.3)" stroke-width="2"/>
            <text x="540" y="280" font-family="Arial, sans-serif" font-size="56" fill="white" text-anchor="middle" font-weight="bold">Bienvenue</text>
            <text x="540" y="360" font-family="Arial, sans-serif" font-size="36" fill="rgba(255,255,255,0.7)" text-anchor="middle">Commencez vos exercices</text>

            <!-- Exercise cards -->
            <rect x="60" y="540" width="450" height="350" rx="20" fill="rgba(45,166,178,0.15)" stroke="rgba(45,166,178,0.4)" stroke-width="2"/>
            <text x="285" y="650" font-family="Arial, sans-serif" font-size="42" fill="white" text-anchor="middle" font-weight="bold">Neuropsycho</text>
            <text x="285" y="730" font-family="Arial, sans-serif" font-size="32" fill="rgba(255,255,255,0.7)" text-anchor="middle">Mémoire</text>
            <text x="285" y="790" font-family="Arial, sans-serif" font-size="32" fill="rgba(255,255,255,0.7)" text-anchor="middle">Attention</text>

            <rect x="570" y="540" width="450" height="350" rx="20" fill="rgba(45,166,178,0.15)" stroke="rgba(45,166,178,0.4)" stroke-width="2"/>
            <text x="795" y="650" font-family="Arial, sans-serif" font-size="42" fill="white" text-anchor="middle" font-weight="bold">Orthophonie</text>
            <text x="795" y="730" font-family="Arial, sans-serif" font-size="32" fill="rgba(255,255,255,0.7)" text-anchor="middle">Diction</text>
            <text x="795" y="790" font-family="Arial, sans-serif" font-size="32" fill="rgba(255,255,255,0.7)" text-anchor="middle">Langage</text>
          </svg>`
        ),
      },
    ])
    .png()
    .toFile('public/screenshots/mobile-2.png')

  console.log('✅ Generated mobile-2.png (1080x1920)')
}

generateScreenshots().catch(console.error)
