/**
 * Date Utilities
 * Helper functions for parsing and formatting dates
 */

/**
 * Month names to numbers mapping
 */
const MONTHS = {
  'jan': '01', 'january': '01',
  'feb': '02', 'february': '02',
  'mar': '03', 'march': '03',
  'apr': '04', 'april': '04',
  'may': '05',
  'jun': '06', 'june': '06',
  'jul': '07', 'july': '07',
  'aug': '08', 'august': '08',
  'sep': '09', 'sept': '09', 'september': '09',
  'oct': '10', 'october': '10',
  'nov': '11', 'november': '11',
  'dec': '12', 'december': '12'
};

/**
 * Parse date string to YYYY-MM format
 * Handles various formats: "Jan 2020", "01/2020", "2020", etc.
 * @param {string} dateStr - Date string to parse
 * @returns {string} Date in YYYY-MM format, or empty string if unparseable
 */
function parseDate(dateStr) {
  if (!dateStr) return '';

  const cleaned = dateStr.trim();

  // Format: "Jan 2020" or "January 2020"
  const monthYearMatch = cleaned.match(/(\w+)\.?\s+(\d{4})/);
  if (monthYearMatch) {
    const monthName = monthYearMatch[1].toLowerCase();
    const year = monthYearMatch[2];
    const month = MONTHS[monthName] || '01';
    return `${year}-${month}`;
  }

  // Format: "01/2020" or "1/2020"
  const numericMatch = cleaned.match(/(\d{1,2})\/(\d{4})/);
  if (numericMatch) {
    const month = numericMatch[1].padStart(2, '0');
    const year = numericMatch[2];
    return `${year}-${month}`;
  }

  // Format: "2020-01" (already in correct format)
  const isoMatch = cleaned.match(/^(\d{4})-(\d{2})$/);
  if (isoMatch) {
    return cleaned;
  }

  // Format: Just year "2020"
  const yearMatch = cleaned.match(/^\d{4}$/);
  if (yearMatch) {
    return `${yearMatch[0]}-01`;
  }

  return '';
}

/**
 * Parse date range string
 * @param {string} dateRangeStr - Date range (e.g., "Jan 2020 - Dec 2023" or "2020 - Present")
 * @returns {Object} Object with {start, end, current}
 */
function parseDateRange(dateRangeStr) {
  if (!dateRangeStr) {
    return { start: '', end: '', current: false };
  }

  // Split on common separators
  const parts = dateRangeStr.split(/[-–—to]+/i).map(p => p.trim());

  const result = {
    start: '',
    end: '',
    current: false
  };

  if (parts[0]) {
    result.start = parseDate(parts[0]);
  }

  if (parts[1]) {
    // Check if it's "Present", "Current", "Now"
    if (/present|current|now/i.test(parts[1])) {
      result.current = true;
      result.end = '';
    } else {
      result.end = parseDate(parts[1]);
    }
  }

  return result;
}

/**
 * Format YYYY-MM date to readable format
 * @param {string} dateStr - Date in YYYY-MM format
 * @returns {string} Formatted date (e.g., "January 2020")
 */
function formatDate(dateStr) {
  if (!dateStr) return '';

  const match = dateStr.match(/^(\d{4})-(\d{2})$/);
  if (!match) return dateStr;

  const year = match[1];
  const monthNum = match[2];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthIndex = parseInt(monthNum, 10) - 1;
  const monthName = monthNames[monthIndex] || 'January';

  return `${monthName} ${year}`;
}

/**
 * Get current date in YYYY-MM format
 * @returns {string} Current date
 */
function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

module.exports = {
  parseDate,
  parseDateRange,
  formatDate,
  getCurrentDate,
  MONTHS
};
