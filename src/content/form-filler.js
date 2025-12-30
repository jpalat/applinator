/**
 * Form Filler
 * Fills form fields with profile data based on classifications
 */

const { highlightElement, generateFieldId, highlightFailedField, sleep } = require('../utils/dom-utils.js');
const { formatDateForInput, formatPhoneNumber } = require('../lib/date-utils.js');
const DynamicHandler = require('./dynamic-handler.js');
const { getFailedFieldIds, addFailedFieldId } = require('./failed-fields-tracker.js');
const { fillField } = require('./field-value-setter.js');

/**
 * Fill a form with profile data
 * @param {Object} formAnalysis - Form analysis result from form-detector
 * @param {Object} profile - User profile data
 * @param {Object} options - Filling options {skipWorkHistory: boolean, highlightFields: boolean, fillDelay: number}
 * @returns {Promise<Object>} Fill result with statistics
 */
async function fillForm(formAnalysis, profile, options = {}) {
  const {
    skipWorkHistory = true, // Week 5: skip work history (Week 6 will implement)
    highlightFields = true,
    fillDelay = 100 // Delay between fields in milliseconds
  } = options;

  const results = {
    total: 0,
    filled: 0,
    skipped: 0,
    failed: 0,
    errors: [],
    fieldsFilled: []
  };

  console.log('[FormFiller] Starting form fill with profile:', profile);

  // Group classifications by category
  const { grouped } = formAnalysis;

  try {
    // Fill personal info fields
    if (grouped.personalInfo && grouped.personalInfo.length > 0) {
      console.log('[FormFiller] Filling personal info fields...');
      await fillFieldGroup(
        grouped.personalInfo,
        profile.personalInfo,
        'personalInfo',
        results,
        { highlightFields, fillDelay }
      );
    }

    // Fill education fields
    if (grouped.education && grouped.education.length > 0) {
      console.log('[FormFiller] Filling education fields...');
      // For now, use first education entry (static fields only in Week 5)
      const educationData = profile.education && profile.education.length > 0
        ? profile.education[0]
        : {};
      await fillFieldGroup(
        grouped.education,
        educationData,
        'education',
        results,
        { highlightFields, fillDelay }
      );
    }

    // Fill skills fields
    if (grouped.skills && grouped.skills.length > 0) {
      console.log('[FormFiller] Filling skills fields...');
      await fillFieldGroup(
        grouped.skills,
        profile.skills,
        'skills',
        results,
        { highlightFields, fillDelay }
      );
    }

    // Fill work experience (dynamic or static)
    if (grouped.workExperience && grouped.workExperience.length > 0) {
      if (skipWorkHistory) {
        console.log('[FormFiller] Skipping work experience fields (disabled)');
        results.skipped += grouped.workExperience.length;
      } else {
        console.log('[FormFiller] Filling work experience fields...');

        // Use dynamic handler to fill all work experiences
        const dynamicResult = await DynamicHandler.fillDynamicWorkExperience(
          profile.workExperience || [],
          grouped.workExperience,
          {
            highlightFields,
            fillDelay,
            maxEntries: 5,
            retryAttempts: 3
          }
        );

        // Merge results
        results.total += dynamicResult.total;
        results.filled += dynamicResult.filled;
        results.skipped += dynamicResult.skipped;
        results.failed += dynamicResult.failed;
        results.errors.push(...dynamicResult.errors);

        console.log(`[FormFiller] Work experience fill complete: ${dynamicResult.entriesCreated} entries created`);
      }
    }

    // Fill custom fields (questions, cover letter, etc.)
    if (grouped.custom && grouped.custom.length > 0) {
      console.log('[FormFiller] Filling custom fields...');
      await fillFieldGroup(
        grouped.custom,
        profile,
        'custom',
        results,
        { highlightFields, fillDelay }
      );
    }

    console.log('[FormFiller] Form fill complete:', results);

    return {
      success: true,
      ...results
    };

  } catch (error) {
    console.error('[FormFiller] Error during form fill:', error);
    results.errors.push({
      type: 'general',
      message: error.message
    });

    return {
      success: false,
      error: error.message,
      ...results
    };
  }
}

/**
 * Fill a group of fields from the same category
 * @param {Array<Object>} classifications - Field classifications
 * @param {Object} data - Data object for this category
 * @param {string} category - Category name
 * @param {Object} results - Results object to update
 * @param {Object} options - Filling options
 */
async function fillFieldGroup(classifications, data, category, results, options) {
  const { highlightFields, fillDelay } = options;

  // Get failed fields set
  const failedFieldIds = getFailedFieldIds();

  for (const classification of classifications) {
    results.total++;

    // Generate unique field ID
    const fieldId = generateFieldId(classification.signals);

    // Skip if field previously failed
    if (failedFieldIds.has(fieldId)) {
      console.log(`[FormFiller] Skipping previously failed field: ${classification.fieldType}`);
      results.skipped++;
      continue;
    }

    try {
      // Get the value to fill
      const value = getValueForField(classification.fieldType, data, category);

      if (value === null || value === undefined || value === '') {
        console.log(`[FormFiller] No value for ${classification.fieldType}, skipping`);
        results.skipped++;
        continue;
      }

      // Fill the field
      await fillField(classification.element, value, classification.fieldType);

      // Visual feedback
      if (highlightFields) {
        highlightElement(classification.element, 1500, '#4CAF50'); // Green for filled
      }

      results.filled++;
      results.fieldsFilled.push({
        fieldType: classification.fieldType,
        value: value,
        confidence: classification.confidence
      });

      console.log(`[FormFiller] Filled ${classification.fieldType} with "${value}"`);

      // Small delay between fields
      if (fillDelay > 0) {
        await sleep(fillDelay);
      }

    } catch (error) {
      console.error(`[FormFiller] Error filling field ${classification.fieldType}:`, error);
      results.failed++;
      results.errors.push({
        fieldType: classification.fieldType,
        message: error.message
      });

      // Track as failed field
      addFailedFieldId(fieldId);

      // Persistent highlight (removed on user interaction)
      if (highlightFields) {
        highlightFailedField(classification.element, fieldId, '#f44336');
      }
    }
  }
}

/**
 * Get the value to fill for a specific field type
 * @param {string} fieldType - Field type (e.g., 'personalInfo.firstName')
 * @param {Object} data - Data object
 * @param {string} category - Category name
 * @returns {string|null} Value to fill
 */
function getValueForField(fieldType, data, category) {
  if (!fieldType) return null;

  // Extract the field name from the type
  // Example: 'personalInfo.firstName' -> 'firstName'
  const parts = fieldType.split('.');
  const fieldName = parts[parts.length - 1];

  // Try direct lookup
  if (data[fieldName] !== undefined) {
    return formatValue(data[fieldName], fieldType);
  }

  // Special cases
  switch (fieldType) {
    // Personal Info
    case 'personalInfo.fullName':
      return formatValue(`${data.firstName || ''} ${data.lastName || ''}`.trim(), fieldType);

    case 'personalInfo.address':
      return formatValue(`${data.city || ''}, ${data.state || ''} ${data.zipCode || ''}`.trim(), fieldType);

    // Skills
    case 'skills.technical':
      if (Array.isArray(data.technical)) {
        return formatValue(data.technical.join(', '), fieldType);
      }
      return formatValue(data.technical, fieldType);

    case 'skills.summary':
      return formatValue(data.summary, fieldType);

    // Custom fields
    case 'custom.coverLetter':
      // If we have a skills summary, use it as a basic cover letter intro
      if (data.skills && data.skills.summary) {
        return formatValue(data.skills.summary, fieldType);
      }
      return null;

    case 'custom.referralSource':
      return 'Online Job Board'; // Default

    case 'custom.willingToRelocate':
      return 'Yes'; // Default

    case 'custom.legallyAuthorized':
      return 'Yes'; // Default

    case 'custom.requiresSponsorship':
      return 'No'; // Default

    default:
      // Try direct field name lookup as fallback
      return formatValue(data[fieldName], fieldType);
  }
}

/**
 * Format a value appropriately for the field type
 * @param {*} value - Raw value
 * @param {string} fieldType - Field type
 * @returns {string} Formatted value
 */
function formatValue(value, fieldType) {
  if (value === null || value === undefined) {
    return '';
  }

  // Already a string
  if (typeof value === 'string') {
    // Check if it's a date field
    if (fieldType.includes('Date') || fieldType.includes('graduation') ||
        fieldType.includes('startDate') || fieldType.includes('endDate')) {
      return formatDateForInput(value);
    }

    // Check if it's a phone field
    if (fieldType.includes('phone') || fieldType.includes('Phone')) {
      return formatPhoneNumber(value);
    }

    return value;
  }

  // Boolean
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  // Number
  if (typeof value === 'number') {
    return value.toString();
  }

  // Array
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  // Object - stringify
  return JSON.stringify(value);
}

module.exports = {
  fillForm,
  getValueForField,
  formatValue
};
