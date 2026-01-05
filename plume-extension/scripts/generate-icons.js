#!/usr/bin/env node

/**
 * Plume Extension - Icon Generator
 *
 * Generates PNG icons from SVG source for Chrome extension.
 * Run with: npm run generate-icons
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Icon sizes required by Chrome extension manifest
const ICON_SIZES = [16, 48, 128];

// Paths
const ICONS_DIR = path.join(__dirname, '..', 'icons');
const ASSETS_DIR = path.join(__dirname, '..', 'assets');

// Create a clean, optimized SVG for the icon
// This SVG is designed to look good at all sizes
function createIconSVG(size) {
  // Adjust stroke width based on size for clarity
  const strokeWidth = size <= 16 ? 0 : (size <= 48 ? 1 : 2);

  return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366F1"/>
      <stop offset="100%" style="stop-color:#8B5CF6"/>
    </linearGradient>
  </defs>
  <!-- Background circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 1}" fill="#1A1A24"/>
  <!-- Feather quill -->
  <g transform="translate(${size * 0.15}, ${size * 0.15}) scale(${size * 0.007})">
    <path fill="url(#gradient)" d="M72 12c-10-7.5-25-5-35 7.5L17 52.5c-5 6.25-7.5 13.75-6.25 21.25l3.75 17.5c1.25 6.25 7.5 11.25 15 11.25h7.5l55-55c15-15 17.5-40 2.5-57.5z"/>
    <path fill="#FFFFFF" opacity="0.85" d="M59.5 29c-7.5-7.5-20-10-30-3.75l-20 20c-2.5 2.5-3.75 6.25-1.25 8.75l12.5 12.5c2.5 2.5 6.25 2.5 8.75 0l27.5-27.5c6.25-6.25 7.5-16.25 2.5-25z"/>
    <circle cx="67.5" cy="18.75" r="${size <= 16 ? 4 : 6.25}" fill="#FFFFFF" opacity="0.7"/>
  </g>
</svg>`;
}

// Alternative simpler icon for very small sizes
function createSimpleIconSVG(size) {
  const padding = Math.max(1, Math.floor(size * 0.1));
  const innerSize = size - (padding * 2);

  return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366F1"/>
      <stop offset="100%" style="stop-color:#8B5CF6"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${size}" height="${size}" rx="${size * 0.2}" fill="#1A1A24"/>
  <g transform="translate(${padding}, ${padding})">
    <path fill="url(#gradient)" d="M${innerSize * 0.75} ${innerSize * 0.1}c-${innerSize * 0.1}-${innerSize * 0.08}-${innerSize * 0.25}-${innerSize * 0.05}-${innerSize * 0.35} ${innerSize * 0.08}L${innerSize * 0.15} ${innerSize * 0.55}c-${innerSize * 0.05} ${innerSize * 0.06}-${innerSize * 0.08} ${innerSize * 0.14}-${innerSize * 0.06} ${innerSize * 0.22}l${innerSize * 0.04} ${innerSize * 0.18}c${innerSize * 0.01} ${innerSize * 0.06} ${innerSize * 0.08} ${innerSize * 0.11} ${innerSize * 0.15} ${innerSize * 0.11}h${innerSize * 0.08}l${innerSize * 0.55}-${innerSize * 0.55}c${innerSize * 0.15}-${innerSize * 0.15} ${innerSize * 0.18}-${innerSize * 0.4} ${innerSize * 0.025}-${innerSize * 0.58}z"/>
    <circle cx="${innerSize * 0.65}" cy="${innerSize * 0.2}" r="${innerSize * 0.08}" fill="#FFFFFF" opacity="0.8"/>
  </g>
</svg>`;
}

async function generateIcons() {
  console.log('Generating Plume extension icons...\n');

  // Ensure icons directory exists
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  for (const size of ICON_SIZES) {
    const outputPath = path.join(ICONS_DIR, `icon${size}.png`);

    // Use simple icon for 16px, detailed for larger sizes
    const svg = size <= 16 ? createSimpleIconSVG(size) : createIconSVG(size);

    try {
      await sharp(Buffer.from(svg))
        .resize(size, size)
        .png({
          compressionLevel: 9,
          quality: 100
        })
        .toFile(outputPath);

      console.log(`  ✓ Generated icon${size}.png (${size}x${size})`);
    } catch (error) {
      console.error(`  ✗ Failed to generate icon${size}.png:`, error.message);
      process.exit(1);
    }
  }

  console.log('\n✓ All icons generated successfully!');
  console.log(`  Output directory: ${ICONS_DIR}`);
}

// Run the generator
generateIcons().catch(error => {
  console.error('Icon generation failed:', error);
  process.exit(1);
});
