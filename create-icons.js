// Simple script to create placeholder PNG icons
// These are minimal 1-color PNGs for MVP - replace with proper icons later

const fs = require('fs');
const path = require('path');

// Minimal PNG data (green square) in base64
// This is a 16x16 green PNG
const greenPNG16 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAKklEQVR42mNk+M/wn4EIwDgyerQBowYMjQGjDRhtwGgDRhsw2oCRbwAAYnMH4a96+sYAAAAASUVORK5CYII=',
  'base64'
);

// Create icon files
const iconsDir = path.join(__dirname, 'src', 'assets', 'icons');

// Create icon files at different sizes (using same 16x16 data as placeholder)
fs.writeFileSync(path.join(iconsDir, 'icon-16.png'), greenPNG16);
fs.writeFileSync(path.join(iconsDir, 'icon-32.png'), greenPNG16);
fs.writeFileSync(path.join(iconsDir, 'icon-48.png'), greenPNG16);
fs.writeFileSync(path.join(iconsDir, 'icon-128.png'), greenPNG16);

console.log('✓ Created placeholder icon files');
console.log('  NOTE: These are minimal placeholders. Replace with proper icons for production.');
