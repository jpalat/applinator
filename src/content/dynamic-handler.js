/**
 * Dynamic Handler
 * Handles dynamic sections (work history, education) that require "Add Another" clicks
 */

const { fillField } = require('./form-filler.js');
const { waitForElement, sleep, highlightElement, scrollIntoView } = require('../utils/dom-utils.js');

/**
 * Keywords that indicate "Add Another" functionality
 */
const ADD_BUTTON_KEYWORDS = [
  'add another',
  'add more',
  'add position',
  'add job',
  'add work',
  'add experience',
  'add entry',
  'add employment',
  '+ add',
  'add new',
  'add additional'
];

/**
 * Fill dynamic work experience sections
 * @param {Array<Object>} workExperiences - Array of work experience objects
 * @param {Array<Object>} classifications - Field classifications for work experience
 * @param {Object} options - Options {highlightFields, fillDelay, maxEntries, retryAttempts}
 * @returns {Promise<Object>} Fill result
 */
async function fillDynamicWorkExperience(workExperiences, classifications, options = {}) {
  const {
    highlightFields = true,
    fillDelay = 100,
    maxEntries = 5,
    retryAttempts = 3
  } = options;

  const results = {
    total: 0,
    filled: 0,
    skipped: 0,
    failed: 0,
    errors: [],
    entriesCreated: 0
  };

  console.log('[DynamicHandler] Starting dynamic work experience fill...');
  console.log('[DynamicHandler] Work experiences to fill:', workExperiences.length);
  console.log('[DynamicHandler] Work experience fields found:', classifications.length);

  // If no work experience data, skip
  if (!workExperiences || workExperiences.length === 0) {
    console.log('[DynamicHandler] No work experience data to fill');
    return { success: true, ...results };
  }

  // If no work experience fields detected, skip
  if (!classifications || classifications.length === 0) {
    console.log('[DynamicHandler] No work experience fields detected');
    return { success: true, ...results };
  }

  try {
    // Detect dynamic sections and add buttons
    const dynamicSection = await detectDynamicSection();

    if (!dynamicSection) {
      console.log('[DynamicHandler] No dynamic section detected, filling first entry only');
      // Fill first entry with static fields
      const firstEntry = workExperiences[0];
      const fillResult = await fillWorkEntry(classifications, firstEntry, 0, {
        highlightFields,
        fillDelay
      });

      results.total += fillResult.total;
      results.filled += fillResult.filled;
      results.skipped += fillResult.skipped;
      results.failed += fillResult.failed;
      results.errors.push(...fillResult.errors);
      results.entriesCreated = 1;

      return { success: true, ...results };
    }

    console.log('[DynamicHandler] Dynamic section detected:', dynamicSection);

    // Fill work experiences one by one
    const entriesToFill = Math.min(workExperiences.length, maxEntries);

    for (let i = 0; i < entriesToFill; i++) {
      const workExp = workExperiences[i];
      console.log(`[DynamicHandler] Filling work experience ${i + 1} of ${entriesToFill}`);

      // For first entry, fields should already exist
      // For subsequent entries, we need to click "Add Another"
      if (i > 0) {
        console.log('[DynamicHandler] Clicking "Add Another" button...');

        const clickSuccess = await clickAddButton(dynamicSection.addButton, retryAttempts);

        if (!clickSuccess) {
          console.error('[DynamicHandler] Failed to click "Add Another" button');
          results.errors.push({
            entry: i,
            type: 'add_button_click',
            message: 'Failed to click "Add Another" button'
          });
          break; // Stop trying if we can't add more entries
        }

        // Wait for new entry to appear
        console.log('[DynamicHandler] Waiting for new entry to appear...');
        await sleep(500); // Initial delay for DOM to update

        // Detect new fields (retry logic)
        let newFieldsDetected = false;
        for (let attempt = 0; attempt < retryAttempts; attempt++) {
          const currentFields = detectWorkFields();

          // We should have more fields now (at least fields for i+1 entries)
          if (currentFields.length >= classifications.length * (i + 1)) {
            newFieldsDetected = true;
            console.log(`[DynamicHandler] New fields detected (${currentFields.length} total)`);
            break;
          }

          console.log(`[DynamicHandler] Waiting for fields... attempt ${attempt + 1}/${retryAttempts}`);
          await sleep(1000);
        }

        if (!newFieldsDetected) {
          console.error('[DynamicHandler] New entry fields did not appear');
          results.errors.push({
            entry: i,
            type: 'new_fields_not_found',
            message: 'New entry fields did not appear after clicking add'
          });
          break;
        }

        results.entriesCreated++;
      } else {
        results.entriesCreated++;
      }

      // Get the fields for this specific entry
      const entryFields = await identifyEntryFields(i, classifications);

      if (!entryFields || entryFields.length === 0) {
        console.warn(`[DynamicHandler] Could not identify fields for entry ${i}`);
        results.errors.push({
          entry: i,
          type: 'fields_not_identified',
          message: `Could not identify fields for entry ${i}`
        });
        continue;
      }

      console.log(`[DynamicHandler] Identified ${entryFields.length} fields for entry ${i}`);

      // Fill this entry
      const fillResult = await fillWorkEntry(entryFields, workExp, i, {
        highlightFields,
        fillDelay
      });

      results.total += fillResult.total;
      results.filled += fillResult.filled;
      results.skipped += fillResult.skipped;
      results.failed += fillResult.failed;
      results.errors.push(...fillResult.errors);

      // Small delay between entries
      await sleep(300);
    }

    console.log('[DynamicHandler] Dynamic work experience fill complete:', results);

    return { success: true, ...results };

  } catch (error) {
    console.error('[DynamicHandler] Error filling dynamic work experience:', error);
    results.errors.push({
      type: 'general',
      message: error.message
    });
    return { success: false, error: error.message, ...results };
  }
}

/**
 * Detect dynamic section with "Add Another" button
 * @returns {Promise<Object|null>} Dynamic section info or null
 */
async function detectDynamicSection() {
  // Look for buttons/links with "Add Another" keywords
  const buttons = document.querySelectorAll('button, a, div[role="button"], span[role="button"]');

  for (const button of buttons) {
    const text = button.textContent.toLowerCase().trim();

    for (const keyword of ADD_BUTTON_KEYWORDS) {
      if (text.includes(keyword)) {
        console.log(`[DynamicHandler] Found "Add Another" button: "${button.textContent.trim()}"`);

        return {
          type: 'dynamic',
          addButton: button,
          keyword: keyword,
          buttonText: button.textContent.trim()
        };
      }
    }
  }

  return null;
}

/**
 * Click the "Add Another" button with retry logic
 * @param {HTMLElement} button - Button element
 * @param {number} maxAttempts - Maximum click attempts
 * @returns {Promise<boolean>} True if successful
 */
async function clickAddButton(button, maxAttempts = 3) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      console.log(`[DynamicHandler] Click attempt ${attempt + 1}/${maxAttempts}`);

      // Scroll button into view
      scrollIntoView(button);
      await sleep(200);

      // Highlight button
      highlightElement(button, 1000, '#2196F3'); // Blue for action

      // Click the button
      button.click();

      // Also trigger events
      button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      button.dispatchEvent(new Event('click', { bubbles: true }));

      // Wait for potential DOM update
      await sleep(500);

      console.log('[DynamicHandler] Click successful');
      return true;

    } catch (error) {
      console.error(`[DynamicHandler] Click attempt ${attempt + 1} failed:`, error);

      if (attempt < maxAttempts - 1) {
        await sleep(1000); // Wait before retry
      }
    }
  }

  return false;
}

/**
 * Detect all work experience fields on the page
 * @returns {Array<HTMLElement>} Array of field elements
 */
function detectWorkFields() {
  const selectors = [
    'input[type="text"]',
    'input[type="email"]',
    'input[type="tel"]',
    'input[type="date"]',
    'input[type="month"]',
    'input:not([type])',
    'select',
    'textarea'
  ];

  const elements = document.querySelectorAll(selectors.join(', '));

  // Filter to visible fields only
  return Array.from(elements).filter(el => {
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });
}

/**
 * Identify fields for a specific work entry
 * @param {number} entryIndex - Entry index (0-based)
 * @param {Array<Object>} baseClassifications - Base classification patterns
 * @returns {Promise<Array<Object>>} Array of field classifications for this entry
 */
async function identifyEntryFields(entryIndex, baseClassifications) {
  // Strategy: Look for repeated field patterns
  // For entry 0: use fields as-is
  // For entry 1+: find the next set of similar fields

  const allFields = detectWorkFields();
  const fieldsPerEntry = baseClassifications.length;

  console.log(`[DynamicHandler] Total fields detected: ${allFields.length}`);
  console.log(`[DynamicHandler] Expected fields per entry: ${fieldsPerEntry}`);

  // Simple heuristic: assume fields appear in order
  // Entry 0: fields[0..fieldsPerEntry-1]
  // Entry 1: fields[fieldsPerEntry..2*fieldsPerEntry-1]
  // etc.

  const startIdx = entryIndex * fieldsPerEntry;
  const endIdx = startIdx + fieldsPerEntry;

  if (endIdx > allFields.length) {
    console.warn(`[DynamicHandler] Not enough fields detected for entry ${entryIndex}`);
    // Return what we have
    return baseClassifications.map((classification, i) => {
      const fieldIdx = startIdx + i;
      if (fieldIdx < allFields.length) {
        return {
          ...classification,
          element: allFields[fieldIdx]
        };
      }
      return null;
    }).filter(Boolean);
  }

  // Map base classifications to actual elements for this entry
  const entryFields = baseClassifications.map((classification, i) => {
    return {
      ...classification,
      element: allFields[startIdx + i]
    };
  });

  return entryFields;
}

/**
 * Fill a single work experience entry
 * @param {Array<Object>} fields - Field classifications for this entry
 * @param {Object} workData - Work experience data
 * @param {number} entryIndex - Entry index
 * @param {Object} options - Filling options
 * @returns {Promise<Object>} Fill result
 */
async function fillWorkEntry(fields, workData, entryIndex, options) {
  const { highlightFields, fillDelay } = options;

  const results = {
    total: 0,
    filled: 0,
    skipped: 0,
    failed: 0,
    errors: []
  };

  console.log(`[DynamicHandler] Filling work entry ${entryIndex}:`, workData);

  for (const classification of fields) {
    results.total++;

    try {
      // Get the value for this field type
      const value = getWorkFieldValue(classification.fieldType, workData);

      if (value === null || value === undefined || value === '') {
        console.log(`[DynamicHandler] No value for ${classification.fieldType}, skipping`);
        results.skipped++;
        continue;
      }

      // Fill the field
      await fillField(classification.element, value, classification.fieldType);

      // Visual feedback
      if (highlightFields) {
        highlightElement(classification.element, 1500, '#4CAF50'); // Green
      }

      results.filled++;
      console.log(`[DynamicHandler] Filled ${classification.fieldType} with "${value}"`);

      // Delay between fields
      if (fillDelay > 0) {
        await sleep(fillDelay);
      }

    } catch (error) {
      console.error(`[DynamicHandler] Error filling ${classification.fieldType}:`, error);
      results.failed++;
      results.errors.push({
        entry: entryIndex,
        fieldType: classification.fieldType,
        message: error.message
      });

      if (highlightFields) {
        highlightElement(classification.element, 2000, '#f44336'); // Red
      }
    }
  }

  return results;
}

/**
 * Get value for a work experience field
 * @param {string} fieldType - Field type (e.g., 'workExperience.company')
 * @param {Object} workData - Work experience data
 * @returns {string|null} Value
 */
function getWorkFieldValue(fieldType, workData) {
  if (!fieldType || !fieldType.startsWith('workExperience.')) {
    return null;
  }

  // Extract field name
  const fieldName = fieldType.split('.')[1];

  // Direct lookup
  if (workData[fieldName] !== undefined) {
    return formatWorkValue(workData[fieldName], fieldType);
  }

  // Special cases
  switch (fieldType) {
    case 'workExperience.dateRange':
      // Combine start and end dates
      if (workData.current) {
        return `${workData.startDate} - Present`;
      }
      return `${workData.startDate} - ${workData.endDate}`;

    case 'workExperience.current':
      return workData.current ? 'Yes' : 'No';

    case 'workExperience.isCurrent':
      return workData.current;

    default:
      return workData[fieldName] || null;
  }
}

/**
 * Format work experience value
 * @param {*} value - Raw value
 * @param {string} fieldType - Field type
 * @returns {string} Formatted value
 */
function formatWorkValue(value, fieldType) {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  return JSON.stringify(value);
}

module.exports = {
  fillDynamicWorkExperience,
  detectDynamicSection,
  clickAddButton,
  identifyEntryFields,
  fillWorkEntry,
  getWorkFieldValue
};
