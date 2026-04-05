#!/usr/bin/env node
// One-off script to generate Nevermist PWA icons
// Run from project root: node scripts/gen-icons.mjs
// Requires: npm install canvas (or use built-in node canvas alternative)

import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const iconsDir = join(__dirname, '..', 'public', 'icons')
mkdirSync(iconsDir, { recursive: true })

function generateIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background: #0A0A0A
  ctx.fillStyle = '#0A0A0A'
  ctx.fillRect(0, 0, size, size)

  // White "N" in a serif font
  ctx.fillStyle = '#EDEAE4'
  const fontSize = Math.round(size * 0.58)
  ctx.font = `${fontSize}px Georgia, serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('N', size / 2, size / 2 + fontSize * 0.04)

  return canvas.toBuffer('image/png')
}

for (const size of [192, 512]) {
  const buf = generateIcon(size)
  const outPath = join(iconsDir, `icon-${size}.png`)
  writeFileSync(outPath, buf)
  console.log(`✓ Generated ${outPath}`)
}

console.log('Done.')
