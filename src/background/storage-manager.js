/**
 * Storage Manager
 * Wrapper around Chrome Storage API for profile data management
 */

const STORAGE_KEYS = {
  PROFILE: 'defaultProfile',
  SETTINGS: 'appSettings'
};

/**
 * Get the default profile from storage
 * @returns {Promise<Object|null>} Profile object or null if not found
 */
async function getProfile() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.PROFILE);
    return result[STORAGE_KEYS.PROFILE] || null;
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
}

/**
 * Save profile to storage
 * @param {Object} profile - Profile object to save
 * @returns {Promise<boolean>} Success status
 */
async function saveProfile(profile) {
  try {
    const profileToSave = {
      ...profile,
      updatedAt: new Date().toISOString()
    };

    await chrome.storage.local.set({
      [STORAGE_KEYS.PROFILE]: profileToSave
    });

    console.log('Profile saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving profile:', error);
    return false;
  }
}

/**
 * Clear all profile data from storage
 * @returns {Promise<boolean>} Success status
 */
async function clearProfile() {
  try {
    await chrome.storage.local.remove(STORAGE_KEYS.PROFILE);
    console.log('Profile cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing profile:', error);
    return false;
  }
}

/**
 * Get storage usage information
 * @returns {Promise<Object>} Storage usage stats
 */
async function getStorageInfo() {
  try {
    const bytesInUse = await chrome.storage.local.getBytesInUse();
    const QUOTA = 5242880; // 5MB in bytes (local storage quota)

    return {
      used: bytesInUse,
      quota: QUOTA,
      available: QUOTA - bytesInUse,
      percentUsed: ((bytesInUse / QUOTA) * 100).toFixed(2)
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return null;
  }
}

/**
 * Check if profile exists
 * @returns {Promise<boolean>} True if profile exists
 */
async function hasProfile() {
  const profile = await getProfile();
  return profile !== null;
}

/**
 * Export profile data as JSON
 * @returns {Promise<string|null>} JSON string of profile data
 */
async function exportProfile() {
  try {
    const profile = await getProfile();
    if (!profile) {
      return null;
    }
    return JSON.stringify(profile, null, 2);
  } catch (error) {
    console.error('Error exporting profile:', error);
    return null;
  }
}

/**
 * Import profile from JSON string
 * @param {string} jsonString - JSON string of profile data
 * @returns {Promise<boolean>} Success status
 */
async function importProfile(jsonString) {
  try {
    const profile = JSON.parse(jsonString);
    return await saveProfile(profile);
  } catch (error) {
    console.error('Error importing profile:', error);
    return false;
  }
}

// Export the storage manager functions (CommonJS for webpack)
module.exports = {
  getProfile,
  saveProfile,
  clearProfile,
  getStorageInfo,
  hasProfile,
  exportProfile,
  importProfile,
  STORAGE_KEYS
};
