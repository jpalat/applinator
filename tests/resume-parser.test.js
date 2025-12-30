/**
 * Resume Parser Tests
 * Unit tests for resume parsing functionality
 */

const { parseDate, parseDateRange, formatDate, getCurrentDate } = require('../src/lib/date-utils.js');

describe('Date Utils', () => {
  describe('parseDate', () => {
    test('parses "Month Year" format', () => {
      expect(parseDate('Jan 2020')).toBe('2020-01');
      expect(parseDate('January 2020')).toBe('2020-01');
      expect(parseDate('Dec 2023')).toBe('2023-12');
    });

    test('parses "MM/YYYY" format', () => {
      expect(parseDate('01/2020')).toBe('2020-01');
      expect(parseDate('12/2023')).toBe('2023-12');
    });

    test('parses "YYYY-MM" format', () => {
      expect(parseDate('2020-01')).toBe('2020-01');
      expect(parseDate('2023-12')).toBe('2023-12');
    });

    test('parses year-only format', () => {
      expect(parseDate('2020')).toBe('2020-01');
      expect(parseDate('2023')).toBe('2023-01');
    });

    test('returns empty string for invalid dates', () => {
      expect(parseDate('')).toBe('');
      expect(parseDate('invalid')).toBe('');
      expect(parseDate(null)).toBe('');
    });
  });

  describe('parseDateRange', () => {
    test('parses date ranges', () => {
      const result = parseDateRange('Jan 2020 - Dec 2023');
      expect(result.start).toBe('2020-01');
      expect(result.end).toBe('2023-12');
      expect(result.current).toBe(false);
    });

    test('detects "Present" as current', () => {
      const result = parseDateRange('Jan 2020 - Present');
      expect(result.start).toBe('2020-01');
      expect(result.end).toBe('');
      expect(result.current).toBe(true);
    });

    test('detects "Current" as current', () => {
      const result = parseDateRange('Jan 2020 - Current');
      expect(result.start).toBe('2020-01');
      expect(result.current).toBe(true);
    });

    test('returns empty object for invalid input', () => {
      const result = parseDateRange('');
      expect(result.start).toBe('');
      expect(result.end).toBe('');
      expect(result.current).toBe(false);
    });
  });

  describe('formatDate', () => {
    test('formats YYYY-MM to readable format', () => {
      expect(formatDate('2020-01')).toBe('January 2020');
      expect(formatDate('2023-12')).toBe('December 2023');
    });

    test('returns original string for invalid format', () => {
      expect(formatDate('invalid')).toBe('invalid');
      expect(formatDate('')).toBe('');
    });
  });

  describe('getCurrentDate', () => {
    test('returns current date in YYYY-MM format', () => {
      const result = getCurrentDate();
      expect(result).toMatch(/^\d{4}-\d{2}$/);
    });
  });
});

describe('Resume Parser (Mock Tests)', () => {
  // Note: Full resume parser tests would require pdf.js mocking
  // These are placeholder tests for the parsing logic

  describe('Email extraction', () => {
    test('extracts email from text', () => {
      const text = 'Contact: john.doe@example.com';
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      const match = text.match(emailRegex);
      expect(match[0]).toBe('john.doe@example.com');
    });

    test('handles multiple emails', () => {
      const text = 'Email: john@example.com or jane@test.com';
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const matches = text.match(emailRegex);
      expect(matches).toHaveLength(2);
      expect(matches[0]).toBe('john@example.com');
    });
  });

  describe('Phone extraction', () => {
    test('extracts phone numbers', () => {
      const text = 'Phone: (123) 456-7890';
      const phoneRegex = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
      const match = text.match(phoneRegex);
      expect(match[0]).toBe('(123) 456-7890');
    });

    test('extracts phone without formatting', () => {
      const text = 'Call: 1234567890';
      const phoneRegex = /\d{10}/;
      const match = text.match(phoneRegex);
      expect(match[0]).toBe('1234567890');
    });
  });

  describe('Section detection', () => {
    test('detects experience section', () => {
      const line = 'WORK EXPERIENCE';
      const expPattern = /^(work[\s]?experience|experience|employment)/i;
      expect(expPattern.test(line)).toBe(true);
    });

    test('detects education section', () => {
      const line = 'EDUCATION';
      const eduPattern = /^education/i;
      expect(eduPattern.test(line)).toBe(true);
    });

    test('detects skills section', () => {
      const line = 'TECHNICAL SKILLS';
      const skillsPattern = /^(skills|technical[\s]?skills)/i;
      expect(skillsPattern.test(line)).toBe(true);
    });
  });
});
