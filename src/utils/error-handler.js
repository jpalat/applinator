/**
 * Error Handler
 * Centralized error handling with user-friendly messages
 */

/**
 * Error types with user-friendly messages
 */
const ERROR_MESSAGES = {
  // Profile errors
  NO_PROFILE: {
    title: 'No Profile Found',
    message: 'Please set up your profile in the options page before filling forms.',
    action: 'Open Options'
  },
  PROFILE_LOAD_FAILED: {
    title: 'Failed to Load Profile',
    message: 'Could not load your profile. Please try refreshing the page.',
    action: 'Retry'
  },
  PROFILE_SAVE_FAILED: {
    title: 'Failed to Save Profile',
    message: 'Could not save your profile. Please check your data and try again.',
    action: 'Retry'
  },

  // Resume parsing errors
  RESUME_UPLOAD_FAILED: {
    title: 'Resume Upload Failed',
    message: 'Could not upload resume. Please ensure the file is a valid PDF.',
    action: 'Try Again'
  },
  RESUME_PARSE_FAILED: {
    title: 'Resume Parsing Failed',
    message: 'Could not parse resume. You can manually enter your information instead.',
    action: 'Manual Entry'
  },
  RESUME_INVALID_FORMAT: {
    title: 'Invalid File Format',
    message: 'Please upload a PDF file. Other formats are not supported.',
    action: 'Upload PDF'
  },

  // Form detection errors
  NO_FORMS_DETECTED: {
    title: 'No Forms Detected',
    message: 'No fillable forms found on this page. Try navigating to a job application page.',
    action: null
  },
  FORM_DETECTION_FAILED: {
    title: 'Form Detection Failed',
    message: 'Could not analyze forms on this page. The page may not be compatible.',
    action: null
  },
  CONTENT_SCRIPT_NOT_LOADED: {
    title: 'Extension Not Ready',
    message: 'Please refresh the page and try again.',
    action: 'Refresh Page'
  },

  // Form filling errors
  FILL_FAILED: {
    title: 'Form Fill Failed',
    message: 'Could not fill the form. Some fields may have been filled successfully.',
    action: 'Try Again'
  },
  FILL_PARTIAL: {
    title: 'Partially Filled',
    message: 'Some fields could not be filled. Please review and complete the remaining fields manually.',
    action: null
  },
  DYNAMIC_SECTION_FAILED: {
    title: 'Dynamic Section Failed',
    message: 'Could not add additional entries. Please add them manually.',
    action: null
  },

  // General errors
  UNKNOWN_ERROR: {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again.',
    action: 'Retry'
  },
  PERMISSION_DENIED: {
    title: 'Permission Denied',
    message: 'The extension does not have permission to access this page.',
    action: null
  }
};

/**
 * Create a user-friendly error object
 * @param {string} errorType - Error type from ERROR_MESSAGES
 * @param {Object} context - Additional context (originalError, details, etc.)
 * @returns {Object} Formatted error object
 */
function createError(errorType, context = {}) {
  const template = ERROR_MESSAGES[errorType] || ERROR_MESSAGES.UNKNOWN_ERROR;

  return {
    type: errorType,
    title: template.title,
    message: context.customMessage || template.message,
    action: template.action,
    details: context.details || null,
    timestamp: new Date().toISOString(),
    originalError: context.originalError ? context.originalError.message : null
  };
}

/**
 * Handle an error and return user-friendly format
 * @param {Error|string} error - Error object or message
 * @param {string} errorType - Error type from ERROR_MESSAGES
 * @param {Object} context - Additional context
 * @returns {Object} Formatted error
 */
function handleError(error, errorType = 'UNKNOWN_ERROR', context = {}) {
  console.error(`[ErrorHandler] ${errorType}:`, error);

  // If error is a string, convert to Error object
  const errorObj = typeof error === 'string' ? new Error(error) : error;

  return createError(errorType, {
    ...context,
    originalError: errorObj
  });
}

/**
 * Log error for debugging
 * @param {string} component - Component name
 * @param {string} operation - Operation being performed
 * @param {Error} error - Error object
 */
function logError(component, operation, error) {
  console.error(`[${component}] Error during ${operation}:`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
}

/**
 * Check if error is a Chrome extension error
 * @param {Error} error - Error object
 * @returns {boolean} True if Chrome extension error
 */
function isChromeError(error) {
  return error && (
    error.message.includes('Extension context') ||
    error.message.includes('chrome.runtime') ||
    error.message.includes('receiving end does not exist')
  );
}

/**
 * Get appropriate error type from Chrome runtime error
 * @returns {string} Error type
 */
function getChromeErrorType() {
  if (chrome.runtime.lastError) {
    const message = chrome.runtime.lastError.message || '';

    if (message.includes('receiving end does not exist')) {
      return 'CONTENT_SCRIPT_NOT_LOADED';
    }

    if (message.includes('permission')) {
      return 'PERMISSION_DENIED';
    }
  }

  return 'UNKNOWN_ERROR';
}

/**
 * Create success message
 * @param {string} title - Success title
 * @param {string} message - Success message
 * @param {Object} details - Additional details
 * @returns {Object} Success object
 */
function createSuccess(title, message, details = {}) {
  return {
    success: true,
    title,
    message,
    details,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  ERROR_MESSAGES,
  createError,
  handleError,
  logError,
  isChromeError,
  getChromeErrorType,
  createSuccess
};
