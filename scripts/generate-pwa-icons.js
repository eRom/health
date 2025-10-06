import sharp from 'sharp'
import { readFileSync } from 'fs'

async function generateIcons() {
  const logoSvg = readFileSync('public/logo.svg')

  // Generate 512x512 maskable icon
  await sharp(logoSvg)
    .resize(512, 512, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png()
    .toFile('public/icon-512.png')

  console.log('✅ Generated icon-512.png (512x512 maskable)')

  // Generate 512x512 with safe zone for maskable (add padding)
  await sharp(logoSvg)
    .resize(410, 410, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: { r: 45, g: 166, b: 178, alpha: 1 }, // theme color
    })
    .png()
    .toFile('public/icon-512-maskable.png')

  console.log('✅ Generated icon-512-maskable.png (512x512 with safe zone)')
}

generateIcons().catch(console.error)
