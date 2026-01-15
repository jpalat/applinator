/**
 * Failed Fields Tracker
 * Centralized tracking of fields that failed to fill
 * Prevents circular dependencies between content-script and form-filler
 */

// Set to track failed field IDs (session-based)
const failedFieldIds = new Set();

/**
 * Get the set of failed field IDs
 * @returns {Set<string>} Set of failed field IDs
 */
function getFailedFieldIds() {
  return failedFieldIds;
}

/**
 * Add a field ID to the failed fields set
 * @param {string} fieldId - The field ID to mark as failed
 */
function addFailedFieldId(fieldId) {
  failedFieldIds.add(fieldId);
}

/**
 * Clear all failed field IDs
 */
function clearFailedFieldIds() {
  failedFieldIds.clear();
}

module.exports = {
  getFailedFieldIds,
  addFailedFieldId,
  clearFailedFieldIds
};
