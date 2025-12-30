/**
 * Content Script
 * Injected into web pages to detect and fill forms
 */

const FormDetector = require('./form-detector.js');
const { classifyField } = require('./field-classifier.js');
const DOMUtils = require('../utils/dom-utils.js');
const FormFiller = require('./form-filler.js');

// State
let detectedForms = [];
let currentFormAnalysis = null;

console.log('[JobAutofill] Content script loaded');

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[JobAutofill] Message received:', request.type);

  switch (request.type) {
    case 'CHECK_FORMS':
      handleCheckForms(sendResponse);
      return true; // Async response

    case 'ANALYZE_FORMS':
      handleAnalyzeForms(sendResponse);
      return true; // Async response

    case 'FILL_FORM':
      handleFillForm(sendResponse);
      return true; // Async response

    case 'HIGHLIGHT_FIELDS':
      handleHighlightFields(sendResponse);
      return true; // Async response

    default:
      console.warn('[JobAutofill] Unknown message type:', request.type);
      sendResponse({ success: false, error: 'Unknown message type' });
  }
});

/**
 * Check if the current page has fillable forms (quick check)
 */
function handleCheckForms(sendResponse) {
  try {
    const summary = FormDetector.getFormSummary();

    console.log('[JobAutofill] Form summary:', summary);

    sendResponse({
      success: true,
      ...summary
    });
  } catch (error) {
    console.error('[JobAutofill] Error checking forms:', error);
    sendResponse({
      success: false,
      hasForm: false,
      error: error.message
    });
  }
}

/**
 * Perform full form analysis with field classification
 */
function handleAnalyzeForms(sendResponse) {
  try {
    console.log('[JobAutofill] Starting form analysis...');

    // Detect and analyze all forms
    detectedForms = FormDetector.detectForms();

    console.log('[JobAutofill] Analyzed forms:', detectedForms);

    // Get the best form to fill
    currentFormAnalysis = FormDetector.getBestFormToFill();

    if (!currentFormAnalysis) {
      sendResponse({
        success: false,
        error: 'No forms detected'
      });
      return;
    }

    // Prepare response with detailed analysis
    const response = {
      success: true,
      formCount: detectedForms.length,
      bestForm: {
        index: currentFormAnalysis.index,
        formType: currentFormAnalysis.formType,
        stats: currentFormAnalysis.stats,
        grouped: Object.keys(currentFormAnalysis.grouped).map(category => ({
          category,
          count: currentFormAnalysis.grouped[category].length
        }))
      }
    };

    sendResponse(response);
  } catch (error) {
    console.error('[JobAutofill] Error analyzing forms:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * Fill the form with profile data
 */
async function handleFillForm(sendResponse) {
  try {
    console.log('[JobAutofill] Starting form fill...');

    // Get profile from background
    const response = await chrome.runtime.sendMessage({ type: 'GET_PROFILE' });

    if (!response.success || !response.profile) {
      sendResponse({ success: false, error: 'No profile found' });
      return;
    }

    const profile = response.profile;

    // Get current form analysis (or analyze now if not done)
    if (!currentFormAnalysis) {
      detectedForms = FormDetector.detectForms();
      currentFormAnalysis = FormDetector.getBestFormToFill();
    }

    if (!currentFormAnalysis) {
      sendResponse({ success: false, error: 'No fillable forms detected' });
      return;
    }

    console.log('[JobAutofill] Filling form with', currentFormAnalysis.stats.classified, 'classified fields');

    // Fill the form using FormFiller
    const fillResult = await FormFiller.fillForm(currentFormAnalysis, profile, {
      skipWorkHistory: false, // Week 6: enable dynamic work history
      highlightFields: true,
      fillDelay: 100
    });

    if (fillResult.success) {
      const summary = {
        personalInfo: currentFormAnalysis.grouped.personalInfo.length,
        workExperience: currentFormAnalysis.grouped.workExperience.length,
        education: currentFormAnalysis.grouped.education.length,
        skills: currentFormAnalysis.grouped.skills.length,
        custom: currentFormAnalysis.grouped.custom.length
      };

      sendResponse({
        success: true,
        fieldsFilled: fillResult.filled,
        fieldsTotal: fillResult.total,
        fieldsSkipped: fillResult.skipped,
        fieldsFailed: fillResult.failed,
        message: `Successfully filled ${fillResult.filled} of ${fillResult.total} fields`,
        summary: summary,
        errors: fillResult.errors
      });
    } else {
      sendResponse({
        success: false,
        error: fillResult.error,
        fieldsFilled: fillResult.filled,
        fieldsTotal: fillResult.total,
        errors: fillResult.errors
      });
    }

  } catch (error) {
    console.error('[JobAutofill] Error filling form:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Highlight classified fields on the page (for debugging/demo)
 */
function handleHighlightFields(sendResponse) {
  try {
    if (!currentFormAnalysis) {
      detectedForms = FormDetector.detectForms();
      currentFormAnalysis = FormDetector.getBestFormToFill();
    }

    if (!currentFormAnalysis) {
      sendResponse({ success: false, error: 'No forms to highlight' });
      return;
    }

    // Highlight fields by confidence level
    currentFormAnalysis.classifications.forEach(classification => {
      if (!classification.fieldType) {
        // Unknown field - red
        DOMUtils.highlightElement(classification.element, 2000, '#f44336');
      } else if (classification.confidence >= 0.8) {
        // High confidence - green
        DOMUtils.highlightElement(classification.element, 2000, '#4CAF50');
      } else if (classification.confidence >= 0.5) {
        // Medium confidence - orange
        DOMUtils.highlightElement(classification.element, 2000, '#FF9800');
      } else {
        // Low confidence - yellow
        DOMUtils.highlightElement(classification.element, 2000, '#FFC107');
      }
    });

    sendResponse({
      success: true,
      highlighted: currentFormAnalysis.classifications.length
    });
  } catch (error) {
    console.error('[JobAutofill] Error highlighting fields:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Detect forms when page loads or changes
 */
function detectFormsOnLoad() {
  try {
    const summary = FormDetector.getFormSummary();

    if (summary.hasForm) {
      console.log(`[JobAutofill] Detected ${summary.formCount} form(s) with ${summary.fieldCount} fields`);
      console.log(`[JobAutofill] Form type: ${summary.formType}, Classified: ${summary.classifiedCount}`);

      // Notify background that forms were detected (optional)
      chrome.runtime.sendMessage({
        type: 'FORMS_DETECTED',
        summary: summary
      }).catch(() => {
        // Ignore errors if background isn't listening
      });
    }
  } catch (error) {
    console.error('[JobAutofill] Error in form detection:', error);
  }
}

/**
 * Watch for dynamic form changes
 */
let formObserver = null;

function watchForFormChanges() {
  // Disconnect existing observer
  if (formObserver) {
    formObserver.disconnect();
  }

  // Create new observer
  formObserver = new MutationObserver((mutations) => {
    // Check if forms were added/modified
    const hasFormChanges = mutations.some(mutation =>
      Array.from(mutation.addedNodes).some(node =>
        node.tagName === 'FORM' || (node.querySelectorAll && node.querySelectorAll('form').length > 0)
      )
    );

    if (hasFormChanges) {
      console.log('[JobAutofill] Form changes detected, re-analyzing...');
      // Reset analysis
      detectedForms = [];
      currentFormAnalysis = null;
      // Re-detect
      detectFormsOnLoad();
    }
  });

  // Start observing
  formObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    detectFormsOnLoad();
    watchForFormChanges();
  });
} else {
  detectFormsOnLoad();
  watchForFormChanges();
}

// Export for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    handleCheckForms,
    handleAnalyzeForms,
    handleFillForm,
    handleHighlightFields
  };
}
