const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/**
 * Loads the Job Autofill extension and returns browser + page
 * @param {Object} options - Options for browser launch
 * @returns {Promise<{browser, page, extensionId}>}
 */
async function loadExtension(options = {}) {
  const extensionPath = path.resolve(__dirname, '../../../dist');

  // Ensure extension is built
  if (!fs.existsSync(extensionPath)) {
    throw new Error('Extension not built. Run "npm run build" first.');
  }

  const browser = await puppeteer.launch({
    headless: 'shell',  // Use shell mode for headless with extension support
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      ...(options.args || [])
    ],
    ...options
  });

  // Wait for extension service worker to load
  let extensionTarget;
  const maxWaitTime = 10000; // 10 seconds
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    const targets = await browser.targets();
    extensionTarget = targets.find(t => t.type() === 'service_worker');

    if (extensionTarget) break;

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  if (!extensionTarget) {
    await browser.close();
    throw new Error('Extension service worker not found after 10s');
  }

  const extensionUrl = extensionTarget.url() || '';
  const [, , extensionId] = extensionUrl.split('/');

  const page = await browser.newPage();
  await page.waitForTimeout(1000);  // Wait for extension init

  return { browser, page, extensionId };
}

/**
 * Waits for extension to be ready
 * @param {Page} page - Puppeteer page
 * @param {string} extensionId - Extension ID
 * @param {number} timeout - Timeout in ms
 * @returns {Promise<boolean>}
 */
async function waitForExtensionReady(page, extensionId, timeout = 5000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const response = await page.evaluate(() => {
        return new Promise((resolve) => {
          chrome.runtime.sendMessage({ type: 'HAS_PROFILE' }, resolve);
        });
      });

      if (response && response.success !== undefined) return true;
    } catch (e) {
      // Extension not ready yet
    }
    await page.waitForTimeout(200);
  }

  throw new Error('Extension failed to initialize');
}

module.exports = { loadExtension, waitForExtensionReady };
