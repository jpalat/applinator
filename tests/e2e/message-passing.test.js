const { loadExtension, waitForExtensionReady } = require('./setup/extension-loader');
const { injectTestProfile, clearTestProfile, TEST_PROFILE } = require('./setup/test-profile');

describe('Extension Message Passing', () => {
  let browser, page, extensionId;

  beforeAll(async () => {
    ({ browser, page, extensionId } = await loadExtension());
    await waitForExtensionReady(page, extensionId);
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    await clearTestProfile(page);
  });

  test('should save and retrieve profile', async () => {
    const saveResult = await page.evaluate((profile) => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({
          type: 'SAVE_PROFILE',
          profile: profile
        }, resolve);
      });
    }, TEST_PROFILE);

    expect(saveResult.success).toBe(true);

    const getResult = await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: 'GET_PROFILE' }, resolve);
      });
    });

    expect(getResult.success).toBe(true);
    expect(getResult.profile.personalInfo.email).toBe(TEST_PROFILE.personalInfo.email);
  });

  test('should check if profile exists', async () => {
    let hasProfile = await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: 'HAS_PROFILE' }, resolve);
      });
    });

    expect(hasProfile.hasProfile).toBe(false);

    await injectTestProfile(page);

    hasProfile = await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: 'HAS_PROFILE' }, resolve);
      });
    });

    expect(hasProfile.hasProfile).toBe(true);
  });
});
