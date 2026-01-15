/**
 * Field Value Setter
 * Handles setting values in different types of form fields
 * Extracted to break circular dependency between form-filler and dynamic-handler
 */

const { setFieldValue, scrollIntoView, sleep } = require('../utils/dom-utils.js');
const { formatDateForInput } = require('../lib/date-utils.js');

/**
 * Fill a single field with proper handling for different input types
 * @param {HTMLElement} element - Form input element
 * @param {string} value - Value to fill
 * @param {string} fieldType - Field type for context
 */
async function fillField(element, value, fieldType) {
  const tagName = element.tagName.toLowerCase();
  const inputType = element.type ? element.type.toLowerCase() : 'text';

  // Scroll field into view
  scrollIntoView(element);
  await sleep(50); // Small delay after scroll

  if (tagName === 'select') {
    fillSelect(element, value);
  } else if (tagName === 'textarea') {
    fillTextarea(element, value);
  } else if (tagName === 'input') {
    switch (inputType) {
      case 'checkbox':
        fillCheckbox(element, value);
        break;
      case 'radio':
        fillRadio(element, value);
        break;
      case 'date':
      case 'month':
      case 'week':
        fillDateInput(element, value);
        break;
      case 'number':
        fillNumberInput(element, value);
        break;
      case 'email':
      case 'tel':
      case 'url':
      case 'text':
      case 'search':
      default:
        fillTextInput(element, value);
        break;
    }
  } else {
    // Unknown element type, try text fill
    fillTextInput(element, value);
  }
}

/**
 * Fill a text input
 */
function fillTextInput(element, value) {
  setFieldValue(element, value);
}

/**
 * Fill a textarea
 */
function fillTextarea(element, value) {
  setFieldValue(element, value);
}

/**
 * Fill a select dropdown
 */
function fillSelect(element, value) {
  // Try exact match first
  let optionFound = false;

  for (const option of element.options) {
    if (option.value === value || option.text === value) {
      element.value = option.value;
      optionFound = true;
      break;
    }
  }

  // Try case-insensitive partial match
  if (!optionFound) {
    const valueLower = value.toLowerCase();
    for (const option of element.options) {
      if (option.value.toLowerCase().includes(valueLower) ||
          option.text.toLowerCase().includes(valueLower)) {
        element.value = option.value;
        optionFound = true;
        break;
      }
    }
  }

  if (!optionFound) {
    console.warn(`[FieldValueSetter] No matching option found for select: "${value}"`);
  }

  // Trigger change event
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
}

/**
 * Fill a checkbox
 */
function fillCheckbox(element, value) {
  // Value is truthy -> check it
  const shouldCheck = (value === true || value === 'true' || value === 'Yes' || value === '1' || value === 1);

  if (element.checked !== shouldCheck) {
    element.checked = shouldCheck;
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('click', { bubbles: true }));
  }
}

/**
 * Fill a radio button
 */
function fillRadio(element, value) {
  // Find the radio button with matching value in the same group
  const name = element.name;
  const radios = document.querySelectorAll(`input[type="radio"][name="${name}"]`);

  let matched = false;
  for (const radio of radios) {
    if (radio.value === value || radio.value.toLowerCase() === value.toLowerCase()) {
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
      radio.dispatchEvent(new Event('click', { bubbles: true }));
      matched = true;
      break;
    }
  }

  if (!matched) {
    console.warn(`[FieldValueSetter] No matching radio button found for: "${value}"`);
  }
}

/**
 * Fill a date input
 */
function fillDateInput(element, value) {
  // Format the date appropriately for date inputs (YYYY-MM-DD)
  const formattedDate = formatDateForInput(value);

  if (formattedDate) {
    setFieldValue(element, formattedDate);
  }
}

/**
 * Fill a number input
 */
function fillNumberInput(element, value) {
  // Extract numbers from the value
  const numericValue = value.toString().replace(/[^0-9.-]/g, '');

  if (numericValue) {
    setFieldValue(element, numericValue);
  }
}

module.exports = {
  fillField
};
