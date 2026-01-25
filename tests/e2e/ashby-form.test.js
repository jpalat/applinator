const { loadExtension, waitForExtensionReady } = require('./setup/extension-loader');
const { injectTestProfile, TEST_PROFILE } = require('./setup/test-profile');
const path = require('path');
const fs = require('fs');

describe('Ashby Job Application Form', () => {
  let browser, page, extensionId;

  beforeAll(async () => {
    ({ browser, page, extensionId } = await loadExtension());
    await waitForExtensionReady(page, extensionId);
    await injectTestProfile(page);
  });

  afterAll(async () => {
    await browser.close();
  });

  test('should detect Ashby form fields', async () => {
    const ashbyPath = path.resolve(__dirname, '../example/application.html');
    await page.goto(`file://${ashbyPath}`);

    // Wait for React to render
    await page.waitForSelector('form', { timeout: 10000 });
    await page.waitForTimeout(2000);

    const analysis = await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: 'ANALYZE_FORMS' }, resolve);
      });
    });

    expect(analysis.success).toBe(true);
    expect(analysis.totalFields).toBeGreaterThan(0);
    expect(analysis.classifiedFields).toBeGreaterThan(0);
  });

  test('should fill Ashby form with profile data', async () => {
    const fillResult = await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: 'FILL_FORM' }, resolve);
      });
    });

    expect(fillResult.success).toBe(true);
    expect(fillResult.filled).toBeGreaterThan(0);

    await page.waitForTimeout(3000);

    // Screenshot for visual verification
    const screenshotDir = path.resolve(__dirname, 'screenshots');
    fs.mkdirSync(screenshotDir, { recursive: true });
    await page.screenshot({
      path: path.join(screenshotDir, 'ashby-form-filled.png'),
      fullPage: true
    });
  });

  test('should classify standard fields correctly', async () => {
    const analysis = await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: 'ANALYZE_FORMS' }, resolve);
      });
    });

    const classifications = analysis.classifications || [];
    const fieldTypes = classifications.map(c => c.fieldType);

    // Verify common fields detected
    expect(fieldTypes).toContain('personalInfo.email');
    expect(fieldTypes.some(ft => ft.includes('firstName') || ft.includes('fullName'))).toBe(true);
  });
});
