/**
 * Popup Script
 * Handles popup UI logic and interactions
 */

// DOM elements
let loadingState, noProfileState, profileExistsState;
let profileName, profileEmail, formStatus;
let fillButton, setupButton, optionsButton;
let fillProgress, progressFill, progressText, fillResult, resultMessage;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', init);

function init() {
  // Get DOM elements
  loadingState = document.getElementById('loading-state');
  noProfileState = document.getElementById('no-profile-state');
  profileExistsState = document.getElementById('profile-exists-state');

  profileName = document.getElementById('profile-name');
  profileEmail = document.getElementById('profile-email');
  formStatus = document.getElementById('form-status');

  fillButton = document.getElementById('fill-button');
  setupButton = document.getElementById('setup-button');
  optionsButton = document.getElementById('options-button');

  fillProgress = document.getElementById('fill-progress');
  progressFill = document.getElementById('progress-fill');
  progressText = document.getElementById('progress-text');
  fillResult = document.getElementById('fill-result');
  resultMessage = document.getElementById('result-message');

  // Attach event listeners
  setupButton.addEventListener('click', openOptions);
  optionsButton.addEventListener('click', openOptions);
  fillButton.addEventListener('click', fillForm);

  // Load initial state
  loadPopup();
}

async function loadPopup() {
  try {
    // Check if profile exists
    const response = await chrome.runtime.sendMessage({ type: 'HAS_PROFILE' });

    if (!response.success) {
      showError('Failed to load profile status');
      return;
    }

    if (!response.hasProfile) {
      showNoProfileState();
    } else {
      await showProfileExistsState();
    }
  } catch (error) {
    console.error('Error loading popup:', error);
    showError('Failed to load extension');
  }
}

function showNoProfileState() {
  loadingState.style.display = 'none';
  profileExistsState.style.display = 'none';
  noProfileState.style.display = 'flex';
}

async function showProfileExistsState() {
  try {
    // Get profile data
    const response = await chrome.runtime.sendMessage({ type: 'GET_PROFILE' });

    if (!response.success || !response.profile) {
      showNoProfileState();
      return;
    }

    const profile = response.profile;
    const personalInfo = profile.personalInfo || {};

    // Display profile info
    const fullName = [personalInfo.firstName, personalInfo.lastName]
      .filter(Boolean)
      .join(' ') || 'No name set';

    profileName.textContent = fullName;
    profileEmail.textContent = personalInfo.email || 'No email set';

    // Show profile exists state
    loadingState.style.display = 'none';
    noProfileState.style.display = 'none';
    profileExistsState.style.display = 'flex';

    // Check for forms on current page
    checkForForms();
  } catch (error) {
    console.error('Error showing profile state:', error);
    showError('Failed to load profile');
  }
}

async function checkForForms() {
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.id) {
      formStatus.querySelector('.status-text').textContent = 'No active tab';
      fillButton.disabled = true;
      return;
    }

    // Send message to content script to check for forms
    chrome.tabs.sendMessage(tab.id, { type: 'CHECK_FORMS' }, (response) => {
      if (chrome.runtime.lastError) {
        // Content script not loaded or page not compatible
        formStatus.querySelector('.status-text').textContent = 'No forms detected on this page';
        fillButton.disabled = true;
        return;
      }

      if (response && response.hasForm) {
        formStatus.querySelector('.status-text').textContent = `Found ${response.fieldCount || 0} fillable fields`;
        fillButton.disabled = false;
      } else {
        formStatus.querySelector('.status-text').textContent = 'No forms detected on this page';
        fillButton.disabled = true;
      }
    });
  } catch (error) {
    console.error('Error checking for forms:', error);
    formStatus.querySelector('.status-text').textContent = 'Error checking for forms';
    fillButton.disabled = true;
  }
}

async function fillForm() {
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.id) {
      showFillResult(false, 'No active tab');
      return;
    }

    // Show progress
    fillProgress.style.display = 'block';
    fillResult.style.display = 'none';
    fillButton.disabled = true;
    progressText.textContent = 'Starting fill...';
    progressFill.style.width = '20%';

    // Send fill command to content script
    chrome.tabs.sendMessage(tab.id, { type: 'FILL_FORM' }, (response) => {
      if (chrome.runtime.lastError) {
        showFillResult(false, 'Failed to fill form: Content script not loaded');
        return;
      }

      if (response && response.success) {
        progressFill.style.width = '100%';
        progressText.textContent = 'Complete!';

        setTimeout(() => {
          fillProgress.style.display = 'none';
          showFillResult(true, `Successfully filled ${response.fieldsFilled || 0} fields`);
        }, 500);
      } else {
        showFillResult(false, response?.error || 'Failed to fill form');
      }
    });
  } catch (error) {
    console.error('Error filling form:', error);
    showFillResult(false, 'Error: ' + error.message);
  }
}

function showFillResult(success, message) {
  fillProgress.style.display = 'none';
  fillResult.style.display = 'block';
  fillResult.className = 'fill-result ' + (success ? 'success' : 'error');
  resultMessage.textContent = message;
  fillButton.disabled = false;

  // Hide result after 5 seconds
  setTimeout(() => {
    fillResult.style.display = 'none';
  }, 5000);
}

function openOptions() {
  chrome.runtime.openOptionsPage();
  window.close();
}

function showError(message) {
  loadingState.style.display = 'none';
  noProfileState.style.display = 'none';
  profileExistsState.style.display = 'flex';

  formStatus.querySelector('.status-text').textContent = message;
  formStatus.style.backgroundColor = '#ffebee';
  formStatus.style.borderColor = '#f44336';
  formStatus.querySelector('.status-text').style.color = '#c62828';
}

console.log('Popup script loaded');
