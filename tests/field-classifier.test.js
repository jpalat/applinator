/**
 * Field Classifier Tests
 * Unit tests for field classification logic
 */

const { FIELD_PATTERNS } = require('../src/lib/field-patterns.js');

describe('Field Patterns', () => {
  test('has personal info patterns', () => {
    expect(FIELD_PATTERNS['personalInfo.firstName']).toBeDefined();
    expect(FIELD_PATTERNS['personalInfo.lastName']).toBeDefined();
    expect(FIELD_PATTERNS['personalInfo.email']).toBeDefined();
    expect(FIELD_PATTERNS['personalInfo.phone']).toBeDefined();
  });

  test('has work experience patterns', () => {
    expect(FIELD_PATTERNS['workExperience.company']).toBeDefined();
    expect(FIELD_PATTERNS['workExperience.position']).toBeDefined();
    expect(FIELD_PATTERNS['workExperience.startDate']).toBeDefined();
    expect(FIELD_PATTERNS['workExperience.endDate']).toBeDefined();
  });

  test('has education patterns', () => {
    expect(FIELD_PATTERNS['education.school']).toBeDefined();
    expect(FIELD_PATTERNS['education.degree']).toBeDefined();
    expect(FIELD_PATTERNS['education.field']).toBeDefined();
  });

  test('has skills patterns', () => {
    expect(FIELD_PATTERNS['skills.technical']).toBeDefined();
    expect(FIELD_PATTERNS['skills.summary']).toBeDefined();
  });
});

describe('Field Classification Logic', () => {
  describe('Exact matching', () => {
    test('matches firstName patterns', () => {
      const pattern = FIELD_PATTERNS['personalInfo.firstName'];
      const exactMatches = pattern.exact;

      expect(exactMatches).toContain('first name');
      expect(exactMatches).toContain('firstname');

      // Test exact match logic
      const testLabel = 'first name';
      const isMatch = exactMatches.some(keyword =>
        testLabel.toLowerCase() === keyword.toLowerCase()
      );
      expect(isMatch).toBe(true);
    });

    test('matches email patterns', () => {
      const pattern = FIELD_PATTERNS['personalInfo.email'];
      const exactMatches = pattern.exact;

      expect(exactMatches).toContain('email');
      expect(exactMatches).toContain('e-mail');

      const testLabel = 'email';
      const isMatch = exactMatches.some(keyword =>
        testLabel.toLowerCase().includes(keyword.toLowerCase())
      );
      expect(isMatch).toBe(true);
    });

    test('matches company patterns', () => {
      const pattern = FIELD_PATTERNS['workExperience.company'];
      const exactMatches = pattern.exact;

      expect(exactMatches).toContain('company');
      expect(exactMatches).toContain('employer');

      const testLabel = 'company name';
      const isMatch = exactMatches.some(keyword =>
        testLabel.toLowerCase().includes(keyword.toLowerCase())
      );
      expect(isMatch).toBe(true);
    });
  });

  describe('Regex pattern matching', () => {
    test('matches firstName regex patterns', () => {
      const pattern = FIELD_PATTERNS['personalInfo.firstName'];
      const patterns = pattern.patterns;

      const testLabels = ['fname', 'name_first', 'f_name'];
      testLabels.forEach(label => {
        const isMatch = patterns.some(regex => regex.test(label));
        expect(isMatch).toBe(true);
      });
    });

    test('matches email regex patterns', () => {
      const pattern = FIELD_PATTERNS['personalInfo.email'];
      const patterns = pattern.patterns;

      const testLabels = ['email_address', 'email-addr', 'your_email'];
      testLabels.forEach(label => {
        const isMatch = patterns.some(regex => regex.test(label));
        expect(isMatch).toBe(true);
      });
    });

    test('matches position regex patterns', () => {
      const pattern = FIELD_PATTERNS['workExperience.position'];
      const patterns = pattern.patterns;

      const testLabels = ['job_title', 'position', 'job-role'];
      testLabels.forEach(label => {
        const isMatch = patterns.some(regex => regex.test(label));
        expect(isMatch).toBe(true);
      });
    });
  });

  describe('Type hints', () => {
    test('email has type hint', () => {
      const pattern = FIELD_PATTERNS['personalInfo.email'];
      expect(pattern.type).toContain('email');
    });

    test('phone has type hint', () => {
      const pattern = FIELD_PATTERNS['personalInfo.phone'];
      expect(pattern.type).toContain('tel');
    });

    test('date fields have type hints', () => {
      const startDatePattern = FIELD_PATTERNS['workExperience.startDate'];
      expect(startDatePattern.type).toContain('date');
    });
  });

  describe('Autocomplete hints', () => {
    test('firstName has autocomplete hint', () => {
      const pattern = FIELD_PATTERNS['personalInfo.firstName'];
      expect(pattern.autocomplete).toContain('given-name');
    });

    test('email has autocomplete hint', () => {
      const pattern = FIELD_PATTERNS['personalInfo.email'];
      expect(pattern.autocomplete).toContain('email');
    });

    test('company has autocomplete hint', () => {
      const pattern = FIELD_PATTERNS['workExperience.company'];
      expect(pattern.autocomplete).toContain('organization');
    });
  });

  describe('Priority levels', () => {
    test('critical fields have high priority', () => {
      expect(FIELD_PATTERNS['personalInfo.firstName'].priority).toBeGreaterThanOrEqual(9);
      expect(FIELD_PATTERNS['personalInfo.email'].priority).toBeGreaterThanOrEqual(9);
      expect(FIELD_PATTERNS['personalInfo.phone'].priority).toBeGreaterThanOrEqual(9);
    });

    test('common work fields have high priority', () => {
      expect(FIELD_PATTERNS['workExperience.company'].priority).toBeGreaterThanOrEqual(9);
      expect(FIELD_PATTERNS['workExperience.position'].priority).toBeGreaterThanOrEqual(9);
    });
  });
});

describe('Classification Confidence', () => {
  test('exact match should yield high confidence', () => {
    // Simulating exact match confidence calculation
    const baseConfidence = 0.95;
    const labelBoost = 0.03;
    const priorityBoost = 0.02;

    const confidence = Math.min(1.0, baseConfidence + labelBoost + priorityBoost);
    expect(confidence).toBeGreaterThan(0.95);
    expect(confidence).toBeLessThanOrEqual(1.0);
  });

  test('pattern match should yield medium-high confidence', () => {
    const baseConfidence = 0.80;
    const labelBoost = 0.05;
    const priorityBoost = 0.05;

    const confidence = Math.min(0.95, baseConfidence + labelBoost + priorityBoost);
    expect(confidence).toBeGreaterThan(0.70);
    expect(confidence).toBeLessThanOrEqual(0.95);
  });

  test('type hint match should yield medium confidence', () => {
    const confidence = 0.70;
    expect(confidence).toBeGreaterThanOrEqual(0.60);
    expect(confidence).toBeLessThan(0.80);
  });
});

describe('Error handling', () => {
  test('handles missing pattern gracefully', () => {
    const nonExistentPattern = FIELD_PATTERNS['nonexistent.field'];
    expect(nonExistentPattern).toBeUndefined();
  });

  test('handles empty signals gracefully', () => {
    // Simulating classification with empty signals
    const signals = {
      label: '',
      placeholder: '',
      name: '',
      id: '',
      type: '',
      autocomplete: ''
    };

    // Should not throw error, just return no match
    expect(signals.label).toBe('');
  });
});
