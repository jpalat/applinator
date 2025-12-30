/**
 * Field Classifier
 * Intelligently classifies form fields based on labels, names, and patterns
 */

const { FIELD_PATTERNS, getAllFieldTypes } = require('../lib/field-patterns.js');
const { getFieldSignals } = require('../utils/dom-utils.js');

/**
 * Classify a form field using multi-stage analysis
 * @param {HTMLElement} element - Form input element
 * @returns {Object} Classification result with {fieldType, confidence, method, signals}
 */
function classifyField(element) {
  // Get all text signals for this field
  const signals = getFieldSignals(element);

  console.log('[Classifier] Analyzing field:', signals);

  // Stage 1: Exact keyword matching (highest confidence)
  const exactMatch = checkExactMatches(signals);
  if (exactMatch && exactMatch.confidence >= 0.9) {
    console.log('[Classifier] Exact match found:', exactMatch);
    return exactMatch;
  }

  // Stage 2: Pattern matching with regex
  const patternMatch = checkPatterns(signals);
  if (patternMatch && patternMatch.confidence >= 0.7) {
    console.log('[Classifier] Pattern match found:', patternMatch);
    return patternMatch;
  }

  // Stage 3: Type and autocomplete hints
  const hintMatch = checkTypeHints(signals);
  if (hintMatch && hintMatch.confidence >= 0.6) {
    console.log('[Classifier] Hint match found:', hintMatch);
    return hintMatch;
  }

  // No good match found
  console.log('[Classifier] No match found for field');
  return {
    fieldType: null,
    confidence: 0,
    method: 'none',
    signals
  };
}

/**
 * Stage 1: Check exact keyword matches
 * @param {Object} signals - Field signals
 * @returns {Object|null} Match result or null
 */
function checkExactMatches(signals) {
  const searchTexts = [
    signals.label,
    signals.placeholder,
    signals.name,
    signals.id,
    signals.ariaLabel,
    signals.title
  ];

  let bestMatch = null;
  let highestConfidence = 0;

  // Check each field type
  for (const [fieldType, pattern] of Object.entries(FIELD_PATTERNS)) {
    if (!pattern.exact) continue;

    // Check each search text against exact matches
    for (const searchText of searchTexts) {
      if (!searchText) continue;

      const lowerText = searchText.toLowerCase().trim();

      for (const exactKeyword of pattern.exact) {
        if (lowerText === exactKeyword.toLowerCase() ||
            lowerText.includes(exactKeyword.toLowerCase())) {

          // Calculate confidence based on match quality
          let confidence = 0.95; // Base confidence for exact match

          // Boost if it's from a label (most reliable)
          if (searchText === signals.label) confidence = 0.98;

          // Boost if pattern has high priority
          if (pattern.priority >= 9) confidence = Math.min(1.0, confidence + 0.02);

          // Exact full match is even better
          if (lowerText === exactKeyword.toLowerCase()) {
            confidence = Math.min(1.0, confidence + 0.02);
          }

          if (confidence > highestConfidence) {
            highestConfidence = confidence;
            bestMatch = {
              fieldType,
              confidence,
              method: 'exact-match',
              matchedText: searchText,
              matchedKeyword: exactKeyword,
              signals
            };
          }
        }
      }
    }
  }

  return bestMatch;
}

/**
 * Stage 2: Check regex pattern matches
 * @param {Object} signals - Field signals
 * @returns {Object|null} Match result or null
 */
function checkPatterns(signals) {
  const searchTexts = [
    signals.label,
    signals.placeholder,
    signals.name,
    signals.id,
    signals.ariaLabel
  ];

  let bestMatch = null;
  let highestConfidence = 0;

  // Check each field type
  for (const [fieldType, pattern] of Object.entries(FIELD_PATTERNS)) {
    if (!pattern.patterns) continue;

    // Check each search text against patterns
    for (const searchText of searchTexts) {
      if (!searchText) continue;

      for (const regex of pattern.patterns) {
        if (regex.test(searchText)) {

          // Calculate confidence based on match quality
          let confidence = 0.80; // Base confidence for pattern match

          // Boost if it's from a label
          if (searchText === signals.label) confidence = 0.85;

          // Boost for high priority patterns
          if (pattern.priority >= 9) confidence = Math.min(0.95, confidence + 0.05);

          if (confidence > highestConfidence) {
            highestConfidence = confidence;
            bestMatch = {
              fieldType,
              confidence,
              method: 'pattern-match',
              matchedText: searchText,
              matchedPattern: regex.toString(),
              signals
            };
          }
        }
      }
    }
  }

  return bestMatch;
}

/**
 * Stage 3: Check type and autocomplete hints
 * @param {Object} signals - Field signals
 * @returns {Object|null} Match result or null
 */
function checkTypeHints(signals) {
  let bestMatch = null;
  let highestConfidence = 0;

  // Check each field type
  for (const [fieldType, pattern] of Object.entries(FIELD_PATTERNS)) {
    // Check autocomplete attribute
    if (pattern.autocomplete && signals.autocomplete) {
      for (const autocompleteValue of pattern.autocomplete) {
        if (signals.autocomplete === autocompleteValue) {
          const confidence = 0.70;

          if (confidence > highestConfidence) {
            highestConfidence = confidence;
            bestMatch = {
              fieldType,
              confidence,
              method: 'autocomplete-hint',
              matchedAutocomplete: autocompleteValue,
              signals
            };
          }
        }
      }
    }

    // Check input type
    if (pattern.type && signals.type) {
      for (const typeValue of pattern.type) {
        if (signals.type === typeValue) {
          const confidence = 0.60;

          if (confidence > highestConfidence) {
            highestConfidence = confidence;
            bestMatch = {
              fieldType,
              confidence,
              method: 'type-hint',
              matchedType: typeValue,
              signals
            };
          }
        }
      }
    }
  }

  return bestMatch;
}

/**
 * Classify multiple fields
 * @param {Array<HTMLElement>} elements - Array of form elements
 * @returns {Array<Object>} Array of classification results
 */
function classifyFields(elements) {
  return elements.map(element => {
    const classification = classifyField(element);
    return {
      element,
      ...classification
    };
  });
}

/**
 * Group classified fields by category
 * @param {Array<Object>} classifications - Array of classification results
 * @returns {Object} Fields grouped by category
 */
function groupByCategory(classifications) {
  const grouped = {
    personalInfo: [],
    workExperience: [],
    education: [],
    skills: [],
    custom: [],
    documents: [],
    unknown: []
  };

  classifications.forEach(classification => {
    if (!classification.fieldType) {
      grouped.unknown.push(classification);
      return;
    }

    const category = classification.fieldType.split('.')[0];
    if (grouped[category]) {
      grouped[category].push(classification);
    } else {
      grouped.unknown.push(classification);
    }
  });

  return grouped;
}

/**
 * Get statistics about classified fields
 * @param {Array<Object>} classifications - Array of classification results
 * @returns {Object} Statistics
 */
function getClassificationStats(classifications) {
  const stats = {
    total: classifications.length,
    classified: 0,
    unclassified: 0,
    highConfidence: 0, // >= 0.8
    mediumConfidence: 0, // 0.5 - 0.8
    lowConfidence: 0, // < 0.5
    byCategory: {
      personalInfo: 0,
      workExperience: 0,
      education: 0,
      skills: 0,
      custom: 0,
      documents: 0,
      unknown: 0
    }
  };

  classifications.forEach(classification => {
    if (classification.fieldType) {
      stats.classified++;

      const category = classification.fieldType.split('.')[0];
      if (stats.byCategory[category] !== undefined) {
        stats.byCategory[category]++;
      }

      if (classification.confidence >= 0.8) {
        stats.highConfidence++;
      } else if (classification.confidence >= 0.5) {
        stats.mediumConfidence++;
      } else {
        stats.lowConfidence++;
      }
    } else {
      stats.unclassified++;
      stats.byCategory.unknown++;
    }
  });

  return stats;
}

module.exports = {
  classifyField,
  classifyFields,
  groupByCategory,
  getClassificationStats
};
