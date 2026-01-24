const { loadExtension, waitForExtensionReady } = require('./setup/extension-loader');
const { injectTestProfile, TEST_PROFILE } = require('./setup/test-profile');
const path = require('path');

describe('iframe Form Detection and Filling', () => {
  let browser, page, extensionId;

  beforeAll(async () => {
    ({ browser, page, extensionId } = await loadExtension());
    await waitForExtensionReady(page, extensionId);
    await injectTestProfile(page);
  });

  afterAll(async () => {
    await browser.close();
  });

  test('should detect forms in main frame and iframe', async () => {
    const testPagePath = path.resolve(__dirname, '../test-iframe.html');
    await page.goto(`file://${testPagePath}`);
    await page.waitForSelector('form');

    // Check main frame
    const mainResponse = await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: 'CHECK_FORMS' }, resolve);
      });
    });

    expect(mainResponse.success).toBe(true);
    expect(mainResponse.hasForm).toBe(true);

    // Check iframe
    const iframeElement = await page.$('iframe');
    const iframe = await iframeElement.contentFrame();

    const iframeResponse = await iframe.evaluate(() => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: 'CHECK_FORMS' }, resolve);
      });
    });

    expect(iframeResponse.success).toBe(true);
    expect(iframeResponse.hasForm).toBe(true);
    expect(iframeResponse.frameInfo.isIframe).toBe(true);
  });

  test('should fill forms in both main frame and iframe', async () => {
    await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: 'FILL_FORM' }, resolve);
      });
    });

    await page.waitForTimeout(2000);

    // Verify main frame field
    const mainEmail = await page.$eval('input[name="email"]', el => el.value);
    expect(mainEmail).toBe(TEST_PROFILE.personalInfo.email);

    // Verify iframe fields
    const iframeElement = await page.$('iframe');
    const iframe = await iframeElement.contentFrame();

    const iframeFirstName = await iframe.$eval('input[name="firstName"]', el => el.value);
    expect(iframeFirstName).toBe(TEST_PROFILE.personalInfo.firstName);
  });
});
