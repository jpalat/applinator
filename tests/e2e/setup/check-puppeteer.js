#!/usr/bin/env node

/**
 * Checks if Puppeteer is installed before running E2E tests
 * Puppeteer is an optional dependency (~300MB) only needed for E2E testing
 */

try {
  require.resolve('puppeteer');
  process.exit(0); // Puppeteer is installed
} catch (e) {
  console.error('\n❌ Puppeteer is not installed.');
  console.error('\nPuppeteer is an optional dependency required only for E2E tests.');
  console.error('It is NOT required to build the extension.\n');
  console.error('To install Puppeteer and run E2E tests:\n');
  console.error('  npm install --no-save puppeteer');
  console.error('  npm run test:e2e\n');
  console.error('Or install permanently:\n');
  console.error('  npm install\n');
  console.error('Note: Puppeteer downloads ~300MB Chromium browser.\n');
  process.exit(1);
}
