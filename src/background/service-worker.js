/**
 * Background Service Worker
 * Main background script for the extension
 */

const StorageManager = require('./storage-manager.js');

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details.reason);

  if (details.reason === 'install') {
    // First time installation
    console.log('First time installation detected');

    // Initialize with empty profile structure
    const initialProfile = {
      profileId: 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      personalInfo: {},
      workExperience: [],
      education: [],
      skills: {
        technical: [],
        summary: ''
      }
    };

    StorageManager.saveProfile(initialProfile);
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request.type);

  // Handle different message types
  switch (request.type) {
    case 'GET_PROFILE':
      handleGetProfile(sendResponse);
      return true; // Async response

    case 'SAVE_PROFILE':
      handleSaveProfile(request.profile, sendResponse);
      return true; // Async response

    case 'HAS_PROFILE':
      handleHasProfile(sendResponse);
      return true; // Async response

    case 'CLEAR_PROFILE':
      handleClearProfile(sendResponse);
      return true; // Async response

    default:
      console.warn('Unknown message type:', request.type);
      sendResponse({ success: false, error: 'Unknown message type' });
  }
});

// Message handlers
async function handleGetProfile(sendResponse) {
  try {
    const profile = await StorageManager.getProfile();
    sendResponse({ success: true, profile });
  } catch (error) {
    console.error('Error in handleGetProfile:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleSaveProfile(profile, sendResponse) {
  try {
    const success = await StorageManager.saveProfile(profile);
    sendResponse({ success });
  } catch (error) {
    console.error('Error in handleSaveProfile:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleHasProfile(sendResponse) {
  try {
    const hasProfile = await StorageManager.hasProfile();
    sendResponse({ success: true, hasProfile });
  } catch (error) {
    console.error('Error in handleHasProfile:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleClearProfile(sendResponse) {
  try {
    const success = await StorageManager.clearProfile();
    sendResponse({ success });
  } catch (error) {
    console.error('Error in handleClearProfile:', error);
    sendResponse({ success: false, error: error.message });
  }
}

console.log('Background service worker loaded');
