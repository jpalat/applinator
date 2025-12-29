/**
 * Content Script
 * Injected into web pages to detect and fill forms
 */

console.log('Job Autofill content script loaded');

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request.type);

  switch (request.type) {
    case 'CHECK_FORMS':
      handleCheckForms(sendResponse);
      return true; // Async response

    case 'FILL_FORM':
      handleFillForm(sendResponse);
      return true; // Async response

    default:
      console.warn('Unknown message type:', request.type);
      sendResponse({ success: false, error: 'Unknown message type' });
  }
});

/**
 * Check if the current page has fillable forms
 */
function handleCheckForms(sendResponse) {
  try {
    // Find all forms on the page
    const forms = document.querySelectorAll('form');

    if (forms.length === 0) {
      sendResponse({ hasForm: false, fieldCount: 0 });
      return;
    }

    // Count fillable fields
    let fieldCount = 0;
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea, select');
      fieldCount += inputs.length;
    });

    sendResponse({
      hasForm: forms.length > 0,
      formCount: forms.length,
      fieldCount: fieldCount
    });
  } catch (error) {
    console.error('Error checking for forms:', error);
    sendResponse({ hasForm: false, error: error.message });
  }
}

/**
 * Fill the form with profile data
 * (Stub implementation for Week 1 - full implementation in Week 5)
 */
async function handleFillForm(sendResponse) {
  try {
    // Get profile from background
    const response = await chrome.runtime.sendMessage({ type: 'GET_PROFILE' });

    if (!response.success || !response.profile) {
      sendResponse({ success: false, error: 'No profile found' });
      return;
    }

    const profile = response.profile;

    // For now, just simulate filling
    // TODO: Implement actual form filling logic in Week 5
    console.log('Would fill form with profile:', profile);

    // Simulate async operation
    setTimeout(() => {
      sendResponse({
        success: true,
        fieldsFilled: 0,
        message: 'Form filling not yet implemented (Week 5)'
      });
    }, 1000);
  } catch (error) {
    console.error('Error filling form:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Detect forms on page load
function detectFormsOnLoad() {
  const forms = document.querySelectorAll('form');
  if (forms.length > 0) {
    console.log(`Detected ${forms.length} form(s) on page`);
  }
}

// Run detection after page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', detectFormsOnLoad);
} else {
  detectFormsOnLoad();
}
