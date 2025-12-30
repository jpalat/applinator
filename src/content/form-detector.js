/**
 * Form Detector
 * Detects and analyzes forms on web pages
 */

const { isVisible, isFillable, getFieldType } = require('../utils/dom-utils.js');
const { classifyFields, getClassificationStats, groupByCategory } = require('./field-classifier.js');

/**
 * Detect all forms on the current page
 * @returns {Array<Object>} Array of detected forms with metadata
 */
function detectForms() {
  const forms = Array.from(document.querySelectorAll('form'));

  console.log(`[FormDetector] Found ${forms.length} form(s) on page`);

  return forms.map((form, index) => analyzeForm(form, index));
}

/**
 * Analyze a single form
 * @param {HTMLFormElement} form - Form element
 * @param {number} index - Form index
 * @returns {Object} Form analysis result
 */
function analyzeForm(form, index) {
  // Get all fillable fields
  const fields = detectFields(form);

  // Classify all fields
  const classifications = classifyFields(fields);

  // Get statistics
  const stats = getClassificationStats(classifications);

  // Group by category
  const grouped = groupByCategory(classifications);

  // Determine form type (job application, contact, etc.)
  const formType = inferFormType(stats, classifications);

  return {
    form,
    index,
    formType,
    fields,
    classifications,
    stats,
    grouped,
    analyzed: true
  };
}

/**
 * Detect all fillable fields in a form or container
 * @param {HTMLElement} container - Form or container element
 * @returns {Array<HTMLElement>} Array of fillable field elements
 */
function detectFields(container) {
  const selectors = [
    'input[type="text"]',
    'input[type="email"]',
    'input[type="tel"]',
    'input[type="url"]',
    'input[type="number"]',
    'input[type="date"]',
    'input[type="month"]',
    'input[type="week"]',
    'input[type="time"]',
    'input[type="datetime-local"]',
    'input[type="search"]',
    'input[type="password"]',
    'input[type="checkbox"]',
    'input[type="radio"]',
    'input:not([type])', // Inputs without type attribute default to text
    'select',
    'textarea'
  ];

  const elements = container.querySelectorAll(selectors.join(', '));

  // Filter to only fillable and visible fields
  const fillableFields = Array.from(elements).filter(element => {
    // Skip hidden fields
    if (!isVisible(element)) return false;

    // Skip disabled/readonly fields
    if (!isFillable(element)) return false;

    // Skip file inputs (handled separately)
    if (element.type === 'file') return false;

    // Skip buttons (sometimes have type="button" but selector catches them)
    if (element.type === 'button' || element.type === 'submit' || element.type === 'reset') {
      return false;
    }

    return true;
  });

  console.log(`[FormDetector] Found ${fillableFields.length} fillable fields in form/container`);

  return fillableFields;
}

/**
 * Infer the type of form based on detected fields
 * @param {Object} stats - Classification statistics
 * @param {Array<Object>} classifications - Field classifications
 * @returns {string} Form type
 */
function inferFormType(stats, classifications) {
  const { byCategory } = stats;

  // Job application forms typically have:
  // - Personal info (name, email, phone)
  // - Work experience OR education fields
  // - Skills or summary fields

  const hasPersonalInfo = byCategory.personalInfo >= 3;
  const hasWorkExperience = byCategory.workExperience >= 1;
  const hasEducation = byCategory.education >= 1;
  const hasSkills = byCategory.skills >= 1;

  // Strong indicators of job application
  if (hasPersonalInfo && (hasWorkExperience || hasEducation)) {
    return 'job-application';
  }

  // Check for job-specific fields
  const hasResumeUpload = classifications.some(c =>
    c.fieldType && c.fieldType.includes('documents.resume')
  );

  const hasSalary = classifications.some(c =>
    c.fieldType && c.fieldType.includes('salaryExpectation')
  );

  if (hasResumeUpload || hasSalary) {
    return 'job-application';
  }

  // Contact form (just personal info, no work/education)
  if (hasPersonalInfo && !hasWorkExperience && !hasEducation) {
    return 'contact';
  }

  // Profile/account form
  if (byCategory.personalInfo > 0 && stats.total < 10) {
    return 'profile';
  }

  // Unknown/generic form
  return 'generic';
}

/**
 * Check if page has any job application forms
 * @returns {boolean} True if job application form detected
 */
function hasJobApplicationForm() {
  const forms = detectForms();
  return forms.some(form => form.formType === 'job-application');
}

/**
 * Get best form to fill (most likely to be job application)
 * @returns {Object|null} Form analysis result or null
 */
function getBestFormToFill() {
  const forms = detectForms();

  // First, try to find job application forms
  const jobForms = forms.filter(f => f.formType === 'job-application');
  if (jobForms.length > 0) {
    // Return form with most classified fields
    return jobForms.reduce((best, current) =>
      current.stats.classified > best.stats.classified ? current : best
    );
  }

  // No job application forms, return form with most fillable fields
  if (forms.length > 0) {
    return forms.reduce((best, current) =>
      current.fields.length > best.fields.length ? current : best
    );
  }

  return null;
}

/**
 * Get quick form summary (for popup display)
 * @returns {Object} Quick summary
 */
function getFormSummary() {
  const forms = detectForms();

  if (forms.length === 0) {
    return {
      hasForm: false,
      formCount: 0,
      fieldCount: 0,
      classifiedCount: 0,
      formType: null
    };
  }

  const bestForm = getBestFormToFill();

  return {
    hasForm: true,
    formCount: forms.length,
    fieldCount: bestForm ? bestForm.fields.length : 0,
    classifiedCount: bestForm ? bestForm.stats.classified : 0,
    formType: bestForm ? bestForm.formType : 'generic',
    confidence: bestForm ? (bestForm.stats.highConfidence / bestForm.stats.total) : 0
  };
}

/**
 * Detect dynamic sections (for work history, education, etc.)
 * This is a simplified version - full implementation in Week 6
 * @param {HTMLElement} container - Container to search
 * @returns {Array<Object>} Array of dynamic section metadata
 */
function detectDynamicSections(container) {
  const sections = [];

  // Look for "Add" buttons that might indicate dynamic sections
  const addButtons = container.querySelectorAll('button, a');

  addButtons.forEach(button => {
    const text = button.textContent.toLowerCase().trim();

    // Keywords that indicate "add another" functionality
    const keywords = [
      'add another',
      'add more',
      'add position',
      'add job',
      'add work',
      'add education',
      'add experience',
      'add entry'
    ];

    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        sections.push({
          type: 'dynamic',
          addButton: button,
          keyword: keyword,
          detected: true
        });
        break;
      }
    }
  });

  console.log(`[FormDetector] Found ${sections.length} potential dynamic section(s)`);

  return sections;
}

module.exports = {
  detectForms,
  analyzeForm,
  detectFields,
  inferFormType,
  hasJobApplicationForm,
  getBestFormToFill,
  getFormSummary,
  detectDynamicSections
};
