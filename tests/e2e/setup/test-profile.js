const TEST_PROFILE = {
  profileId: 'test',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  personalInfo: {
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    linkedIn: 'https://linkedin.com/in/johndoe',
    portfolio: 'https://johndoe.dev',
    github: 'https://github.com/johndoe'
  },
  workExperience: [
    {
      company: 'Tech Corp',
      position: 'Senior Software Engineer',
      startDate: '2020-01',
      endDate: '2023-12',
      currentlyWorking: false,
      location: 'San Francisco, CA',
      description: 'Led development of microservices'
    },
    {
      company: 'StartupXYZ',
      position: 'Software Engineer',
      startDate: '2018-06',
      endDate: '2020-01',
      currentlyWorking: false,
      location: 'Remote',
      description: 'Built React dashboard'
    }
  ],
  education: [
    {
      school: 'Stanford University',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      graduationDate: '2018-05',
      gpa: '3.8'
    }
  ],
  skills: {
    technical: ['JavaScript', 'Python', 'React', 'Node.js'],
    summary: 'Full-stack developer with 5+ years experience'
  }
};

/**
 * Injects test profile into extension storage
 * @param {Page} page - Puppeteer page
 * @param {Object} profile - Profile data to inject
 */
async function injectTestProfile(page, profile = TEST_PROFILE) {
  await page.evaluate((profileData) => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ profile: profileData }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }, profile);
}

/**
 * Clears profile from storage
 * @param {Page} page - Puppeteer page
 */
async function clearTestProfile(page) {
  await page.evaluate(() => {
    return new Promise((resolve) => {
      chrome.storage.local.clear(resolve);
    });
  });
}

module.exports = { TEST_PROFILE, injectTestProfile, clearTestProfile };
