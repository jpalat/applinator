/**
 * Popup Script
 * Handles popup UI logic and interactions
 */

const ErrorHandler = require('../utils/error-handler.js');

// DOM elements
let loadingState, noProfileState, profileExistsState, errorState;
let profileName, profileEmail, formStatus;
let fillButton, setupButton, optionsButton, resetFailedButton, viewProfileButton;
let fillProgress, progressFill, progressText, fillResult, resultMessage;
let errorTitle, errorMessage, errorAction;
let failedFieldsStatus, failedCount;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', init);

function init() {
  // Get DOM elements
  loadingState = document.getElementById('loading-state');
  noProfileState = document.getElementById('no-profile-state');
  profileExistsState = document.getElementById('profile-exists-state');
  errorState = document.getElementById('error-state');

  profileName = document.getElementById('profile-name');
  profileEmail = document.getElementById('profile-email');
  formStatus = document.getElementById('form-status');

  fillButton = document.getElementById('fill-button');
  setupButton = document.getElementById('setup-button');
  optionsButton = document.getElementById('options-button');
  resetFailedButton = document.getElementById('reset-failed-button');
  viewProfileButton = document.getElementById('view-profile-button');

  fillProgress = document.getElementById('fill-progress');
  progressFill = document.getElementById('progress-fill');
  progressText = document.getElementById('progress-text');
  fillResult = document.getElementById('fill-result');
  resultMessage = document.getElementById('result-message');

  errorTitle = document.getElementById('error-title');
  errorMessage = document.getElementById('error-message');
  errorAction = document.getElementById('error-action');

  failedFieldsStatus = document.getElementById('failed-fields-status');
  failedCount = document.getElementById('failed-count');

  // Attach event listeners
  setupButton.addEventListener('click', openOptions);
  optionsButton.addEventListener('click', openOptions);
  fillButton.addEventListener('click', fillForm);
  resetFailedButton.addEventListener('click', resetFailedFields);
  viewProfileButton.addEventListener('click', showProfileView);

  // Load initial state
  loadPopup();
}

async function loadPopup() {
  try {
    // Check if profile exists
    const response = await chrome.runtime.sendMessage({ type: 'HAS_PROFILE' });

    if (!response.success) {
      const error = ErrorHandler.createError('PROFILE_LOAD_FAILED');
      showErrorState(error);
      return;
    }

    if (!response.hasProfile) {
      showNoProfileState();
    } else {
      await showProfileExistsState();
    }
  } catch (error) {
    ErrorHandler.logError('Popup', 'loadPopup', error);

    const errorType = ErrorHandler.getChromeErrorType();
    const errorObj = ErrorHandler.createError(errorType, { originalError: error });
    showErrorState(errorObj);
  }
}

function showNoProfileState() {
  loadingState.style.display = 'none';
  profileExistsState.style.display = 'none';
  errorState.style.display = 'none';
  noProfileState.style.display = 'flex';
}

function showErrorState(error) {
  loadingState.style.display = 'none';
  noProfileState.style.display = 'none';
  profileExistsState.style.display = 'none';

  errorTitle.textContent = error.title;
  errorMessage.textContent = error.message;

  if (error.action) {
    errorAction.textContent = error.action;
    errorAction.style.display = 'block';

    // Attach appropriate action handler
    errorAction.onclick = () => {
      if (error.action === 'Open Options' || error.action === 'Manual Entry') {
        openOptions();
      } else if (error.action === 'Refresh Page') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.reload(tabs[0].id);
          }
        });
        window.close();
      } else if (error.action === 'Retry') {
        loadPopup();
      }
    };
  } else {
    errorAction.style.display = 'none';
  }

  errorState.style.display = 'flex';
}

async function showProfileExistsState() {
  try {
    // Get profile data
    const response = await chrome.runtime.sendMessage({ type: 'GET_PROFILE' });

    if (!response.success || !response.profile) {
      const error = ErrorHandler.createError('NO_PROFILE');
      showErrorState(error);
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
    errorState.style.display = 'none';
    profileExistsState.style.display = 'flex';

    // Check for forms on current page
    checkForForms();
  } catch (error) {
    ErrorHandler.logError('Popup', 'showProfileExistsState', error);
    const errorObj = ErrorHandler.createError('PROFILE_LOAD_FAILED', { originalError: error });
    showErrorState(errorObj);
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
        const errorMsg = chrome.runtime.lastError.message || '';
        if (errorMsg.includes('receiving end does not exist')) {
          formStatus.querySelector('.status-text').textContent = 'Please refresh the page to enable autofill';
        } else {
          formStatus.querySelector('.status-text').textContent = 'No forms detected on this page';
        }
        fillButton.disabled = true;
        return;
      }

      if (response && response.hasForm) {
        const count = response.fieldCount || 0;
        const formType = response.formType || 'form';
        formStatus.querySelector('.status-text').textContent =
          `Found ${count} fillable fields (${formType})`;
        formStatus.style.backgroundColor = '#e8f5e9';
        formStatus.style.borderColor = '#4CAF50';
        fillButton.disabled = false;
      } else {
        formStatus.querySelector('.status-text').textContent = 'No forms detected on this page';
        formStatus.style.backgroundColor = '#fff3e0';
        formStatus.style.borderColor = '#ff9800';
        fillButton.disabled = true;
      }
    });
  } catch (error) {
    ErrorHandler.logError('Popup', 'checkForForms', error);
    formStatus.querySelector('.status-text').textContent = 'Error checking for forms';
    formStatus.style.backgroundColor = '#ffebee';
    formStatus.style.borderColor = '#f44336';
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
    progressText.textContent = 'Analyzing form...';
    progressFill.style.width = '10%';

    // Small delay for UI update
    await new Promise(resolve => setTimeout(resolve, 100));
    progressText.textContent = 'Filling fields...';
    progressFill.style.width = '30%';

    // Send fill command to content script
    chrome.tabs.sendMessage(tab.id, { type: 'FILL_FORM' }, (response) => {
      if (chrome.runtime.lastError) {
        const errorType = chrome.runtime.lastError.message.includes('receiving end')
          ? 'CONTENT_SCRIPT_NOT_LOADED'
          : 'FILL_FAILED';

        const error = ErrorHandler.createError(errorType);
        showFillResult(false, error.message);
        return;
      }

      if (response && response.success) {
        progressFill.style.width = '100%';
        progressText.textContent = 'Complete!';

        // Build detailed message
        const filled = response.fieldsFilled || 0;
        const total = response.fieldsTotal || 0;
        const skipped = response.fieldsSkipped || 0;
        const failed = response.fieldsFailed || 0;
        const failedFieldCountValue = response.failedFieldCount || 0;

        // Update failed fields badge
        if (failedFieldCountValue > 0) {
          failedCount.textContent = failedFieldCountValue;
          failedFieldsStatus.style.display = 'block';
          resetFailedButton.style.display = 'inline-block';
        } else {
          failedFieldsStatus.style.display = 'none';
          resetFailedButton.style.display = 'none';
        }

        let message;
        if (failed > 0) {
          message = `Partially filled ${filled} of ${total} fields. ${failed} fields failed.`;
          setTimeout(() => {
            fillProgress.style.display = 'none';
            showFillResult('warning', message);
          }, 500);
        } else {
          message = `Successfully filled ${filled} of ${total} fields`;
          if (skipped > 0) {
            message += ` (${skipped} skipped)`;
          }
          setTimeout(() => {
            fillProgress.style.display = 'none';
            showFillResult(true, message);
          }, 500);
        }
      } else {
        const error = ErrorHandler.createError('FILL_FAILED', {
          customMessage: response?.error || 'Unknown error occurred'
        });
        showFillResult(false, error.message);
      }
    });
  } catch (error) {
    ErrorHandler.logError('Popup', 'fillForm', error);
    const errorObj = ErrorHandler.createError('FILL_FAILED', { originalError: error });
    showFillResult(false, errorObj.message);
  }
}

async function resetFailedFields() {
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.id) {
      showFillResult(false, 'No active tab');
      return;
    }

    // Disable reset button temporarily
    resetFailedButton.disabled = true;

    // Send reset command to content script
    chrome.tabs.sendMessage(tab.id, { type: 'RESET_FAILED_FIELDS' }, (response) => {
      if (chrome.runtime.lastError) {
        const errorType = chrome.runtime.lastError.message.includes('receiving end')
          ? 'CONTENT_SCRIPT_NOT_LOADED'
          : 'RESET_FAILED';

        const error = ErrorHandler.createError(errorType);
        showFillResult(false, error.message);
        resetFailedButton.disabled = false;
        return;
      }

      if (response && response.success) {
        // Hide badge and button
        failedFieldsStatus.style.display = 'none';
        resetFailedButton.style.display = 'none';
        resetFailedButton.disabled = false;

        // Show success message
        showFillResult(true, response.message || 'Failed fields reset successfully');
      } else {
        showFillResult(false, response?.error || 'Failed to reset fields');
        resetFailedButton.disabled = false;
      }
    });
  } catch (error) {
    ErrorHandler.logError('Popup', 'resetFailedFields', error);
    showFillResult(false, 'Error resetting failed fields');
    resetFailedButton.disabled = false;
  }
}

function showFillResult(success, message) {
  fillProgress.style.display = 'none';
  fillResult.style.display = 'block';

  // Handle success, warning, or error
  if (success === 'warning') {
    fillResult.className = 'fill-result warning';
  } else {
    fillResult.className = 'fill-result ' + (success ? 'success' : 'error');
  }

  resultMessage.textContent = message;
  fillButton.disabled = false;

  // Hide result after 7 seconds (longer for warnings/errors)
  const hideDelay = success === true ? 5000 : 7000;
  setTimeout(() => {
    fillResult.style.display = 'none';
  }, hideDelay);
}

function openOptions() {
  chrome.runtime.openOptionsPage();
  window.close();
}

/**
 * Open side panel to view profile
 */
async function showProfileView() {
  try {
    // Get current window and open side panel for it
    const currentWindow = await chrome.windows.getCurrent();
    await chrome.sidePanel.open({ windowId: currentWindow.id });
  } catch (error) {
    console.error('Error opening side panel:', error);
    showFillResult(false, 'Error opening side panel');
  }
}

console.log('Popup script loaded');
