#!/usr/bin/env node
/**
 * Generate extension icons from source icon
 * Usage: node generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceIcon = path.join(__dirname, 'exticon.png');
const outputDir = path.join(__dirname, 'src', 'assets', 'icons');

// Icon sizes required by Chrome extensions
const sizes = [16, 32, 48, 128];

async function generateIcons() {
  console.log('Generating extension icons...');
  console.log(`Source: ${sourceIcon}`);
  console.log(`Output: ${outputDir}\n`);

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`✓ Created directory: ${outputDir}`);
  }

  // Check if source file exists
  if (!fs.existsSync(sourceIcon)) {
    console.error(`✗ Source icon not found: ${sourceIcon}`);
    process.exit(1);
  }

  // Generate each size
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}.png`);

    try {
      await sharp(sourceIcon)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
        })
        .png()
        .toFile(outputPath);

      console.log(`✓ Generated ${size}x${size} icon: ${outputPath}`);
    } catch (error) {
      console.error(`✗ Failed to generate ${size}x${size} icon:`, error.message);
      process.exit(1);
    }
  }

  console.log('\n✓ All icons generated successfully!');
  console.log('\nNext steps:');
  console.log('1. Run: npm run build');
  console.log('2. Icons will be copied to dist/icons/ during build');
  console.log('3. Reload extension in Chrome to see new icons');
}

generateIcons().catch(error => {
  console.error('Error generating icons:', error);
  process.exit(1);
});
