/**
 * DOM Utilities
 * Helper functions for DOM manipulation and analysis
 */

/**
 * Extract label text for a form field
 * Tries multiple methods to find the associated label
 * @param {HTMLElement} element - Form input element
 * @returns {string} Label text or empty string
 */
function extractLabel(element) {
  let labelText = '';

  // Method 1: Associated <label> element via 'for' attribute
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) {
      labelText = label.textContent.trim();
      if (labelText) return cleanLabelText(labelText);
    }
  }

  // Method 2: Parent <label> element
  const parentLabel = element.closest('label');
  if (parentLabel) {
    // Get label text excluding the input itself
    const clone = parentLabel.cloneNode(true);
    const inputs = clone.querySelectorAll('input, select, textarea');
    inputs.forEach(input => input.remove());
    labelText = clone.textContent.trim();
    if (labelText) return cleanLabelText(labelText);
  }

  // Method 3: Previous sibling label
  let sibling = element.previousElementSibling;
  while (sibling) {
    if (sibling.tagName === 'LABEL') {
      labelText = sibling.textContent.trim();
      if (labelText) return cleanLabelText(labelText);
    }
    // Only check a few siblings
    if (sibling.previousElementSibling === null) break;
    sibling = sibling.previousElementSibling;
  }

  // Method 4: aria-label attribute
  if (element.hasAttribute('aria-label')) {
    labelText = element.getAttribute('aria-label').trim();
    if (labelText) return cleanLabelText(labelText);
  }

  // Method 5: aria-labelledby attribute
  if (element.hasAttribute('aria-labelledby')) {
    const labelId = element.getAttribute('aria-labelledby');
    const labelElement = document.getElementById(labelId);
    if (labelElement) {
      labelText = labelElement.textContent.trim();
      if (labelText) return cleanLabelText(labelText);
    }
  }

  // Method 6: title attribute
  if (element.hasAttribute('title')) {
    labelText = element.getAttribute('title').trim();
    if (labelText) return cleanLabelText(labelText);
  }

  // Method 7: Parent element text (common pattern in some forms)
  const parent = element.parentElement;
  if (parent) {
    // Clone parent to avoid modifying DOM
    const clone = parent.cloneNode(true);
    // Remove all input/select/textarea elements
    const inputs = clone.querySelectorAll('input, select, textarea, button');
    inputs.forEach(input => input.remove());

    labelText = clone.textContent.trim();
    if (labelText && labelText.length < 100) { // Avoid getting too much text
      return cleanLabelText(labelText);
    }
  }

  return '';
}

/**
 * Clean label text (remove asterisks, colons, extra whitespace)
 * @param {string} text - Raw label text
 * @returns {string} Cleaned label text
 */
function cleanLabelText(text) {
  return text
    .replace(/\*/g, '') // Remove asterisks (required field indicators)
    .replace(/:/g, '') // Remove colons
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Get all text signals for a field (for classification)
 * @param {HTMLElement} element - Form input element
 * @returns {Object} Object with all text signals
 */
function getFieldSignals(element) {
  return {
    label: extractLabel(element),
    placeholder: element.placeholder || '',
    name: element.name || '',
    id: element.id || '',
    type: element.type || 'text',
    autocomplete: element.autocomplete || '',
    ariaLabel: element.getAttribute('aria-label') || '',
    className: element.className || '',
    title: element.title || ''
  };
}

/**
 * Check if element is visible
 * @param {HTMLElement} element - DOM element
 * @returns {boolean} True if visible
 */
function isVisible(element) {
  // Check if element exists
  if (!element) return false;

  // Check display and visibility styles
  const style = window.getComputedStyle(element);
  if (style.display === 'none') return false;
  if (style.visibility === 'hidden') return false;
  if (style.opacity === '0') return false;

  // Check if element has dimensions
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;

  // Check if element is within viewport (more lenient - could be off-screen but still valid)
  // We'll consider it visible if it has dimensions, even if off-screen
  return true;
}

/**
 * Check if element is fillable (not disabled or readonly)
 * @param {HTMLElement} element - Form input element
 * @returns {boolean} True if fillable
 */
function isFillable(element) {
  if (element.disabled) return false;
  if (element.readOnly) return false;
  if (element.getAttribute('aria-disabled') === 'true') return false;
  return true;
}

/**
 * Set value of form field and trigger appropriate events
 * @param {HTMLElement} element - Form input element
 * @param {string} value - Value to set
 */
function setFieldValue(element, value) {
  // Set the value
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  ).set;

  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(element, value);
  } else {
    element.value = value;
  }

  // Trigger events that frameworks listen to
  const events = [
    new Event('input', { bubbles: true, cancelable: true }),
    new Event('change', { bubbles: true, cancelable: true }),
    new Event('blur', { bubbles: true, cancelable: true })
  ];

  events.forEach(event => element.dispatchEvent(event));
}

/**
 * Highlight element temporarily
 * @param {HTMLElement} element - Element to highlight
 * @param {number} duration - Duration in milliseconds
 * @param {string} color - Highlight color (default: green)
 */
function highlightElement(element, duration = 1000, color = '#4CAF50') {
  const originalOutline = element.style.outline;
  const originalBackgroundColor = element.style.backgroundColor;

  element.style.outline = `2px solid ${color}`;
  element.style.backgroundColor = `${color}22`; // 22 is alpha for transparency

  setTimeout(() => {
    element.style.outline = originalOutline;
    element.style.backgroundColor = originalBackgroundColor;
  }, duration);
}

/**
 * Scroll element into view smoothly
 * @param {HTMLElement} element - Element to scroll to
 */
function scrollIntoView(element) {
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest'
  });
}

/**
 * Get form element's container (fieldset, div, etc.)
 * @param {HTMLElement} element - Form input element
 * @returns {HTMLElement|null} Container element
 */
function getFieldContainer(element) {
  // Look for common container patterns
  const containers = ['fieldset', '.form-group', '.field', '.input-group', '.form-field'];

  for (const selector of containers) {
    const container = element.closest(selector);
    if (container) return container;
  }

  // Fallback to parent element
  return element.parentElement;
}

/**
 * Check if field is required
 * @param {HTMLElement} element - Form input element
 * @returns {boolean} True if required
 */
function isRequired(element) {
  // Check required attribute
  if (element.required) return true;
  if (element.hasAttribute('required')) return true;
  if (element.getAttribute('aria-required') === 'true') return true;

  // Check for asterisk in label
  const label = extractLabel(element);
  if (label.includes('*')) return true;

  // Check parent for required class
  const container = getFieldContainer(element);
  if (container && container.classList.contains('required')) return true;

  return false;
}

/**
 * Get field type category (text, select, checkbox, etc.)
 * @param {HTMLElement} element - Form element
 * @returns {string} Field type category
 */
function getFieldType(element) {
  const tagName = element.tagName.toLowerCase();

  if (tagName === 'input') {
    return element.type || 'text';
  }

  if (tagName === 'select') {
    return 'select';
  }

  if (tagName === 'textarea') {
    return 'textarea';
  }

  return 'unknown';
}

/**
 * Create a simple hash from a string (for generating IDs)
 * @param {string} str - String to hash
 * @returns {string} Hash string
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Wait for element to appear in DOM
 * @param {string} selector - CSS selector
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<HTMLElement|null>} Element or null if timeout
 */
function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

/**
 * Sleep utility
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  extractLabel,
  cleanLabelText,
  getFieldSignals,
  isVisible,
  isFillable,
  setFieldValue,
  highlightElement,
  scrollIntoView,
  getFieldContainer,
  isRequired,
  getFieldType,
  simpleHash,
  waitForElement,
  sleep
};
