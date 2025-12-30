# Contributing to Job Autofill

Thank you for your interest in contributing to Job Autofill! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Submitting Changes](#submitting-changes)
- [Bug Reports](#bug-reports)
- [Feature Requests](#feature-requests)

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and beginners
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Trolling or insulting/derogatory comments
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**How to Submit a Good Bug Report:**

Use the bug report template:
```markdown
**Description**: Brief description of the bug

**Steps to Reproduce**:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**: What you expected to happen

**Actual Behavior**: What actually happened

**Screenshots**: If applicable

**Environment**:
- Extension Version: [e.g., 1.0.0]
- Browser: [e.g., Chrome 120]
- OS: [e.g., Windows 11]

**Console Errors**: Paste any console errors

**Additional Context**: Any other relevant information
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues.

**How to Submit a Good Enhancement Suggestion:**

```markdown
**Feature Description**: Clear description of the feature

**Problem it Solves**: What problem does this solve?

**Proposed Solution**: How should it work?

**Alternatives Considered**: What else did you consider?

**Additional Context**: Screenshots, mockups, examples

**Priority**: Low / Medium / High (your opinion)
```

### Pull Requests

Pull requests are welcome! Here's the process:

1. **Fork the Repository**
2. **Create a Branch** (`git checkout -b feature/amazing-feature`)
3. **Make Your Changes**
4. **Test Thoroughly**
5. **Commit Your Changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the Branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Chrome or Edge browser
- Git

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/jpalat/applinator.git
cd applinator

# Install dependencies
npm install

# Build the extension
npm run build

# Or build in development mode with watch
npm run dev
```

### Load Extension in Browser

1. Open Chrome/Edge
2. Navigate to `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist` folder from the project directory

### Project Structure

```
applinator/
├── src/
│   ├── background/      # Background service worker
│   │   ├── service-worker.js
│   │   ├── storage-manager.js
│   │   └── resume-parser.js
│   ├── content/         # Content scripts
│   │   ├── content-script.js
│   │   ├── form-detector.js
│   │   ├── field-classifier.js
│   │   ├── form-filler.js
│   │   └── dynamic-handler.js
│   ├── popup/           # Extension popup
│   │   ├── popup.html
│   │   ├── popup.js
│   │   └── popup.css
│   ├── options/         # Options page
│   │   ├── options.html
│   │   ├── options.js
│   │   └── options.css
│   ├── lib/             # Shared libraries
│   │   ├── field-patterns.js
│   │   ├── date-utils.js
│   │   └── profile-validator.js
│   └── utils/           # Utilities
│       ├── dom-utils.js
│       └── error-handler.js
├── tests/               # Unit tests
│   ├── resume-parser.test.js
│   └── field-classifier.test.js
├── dist/                # Build output (gitignored)
└── manifest.json        # Extension manifest
```

## Development Workflow

### Building

```bash
# Development build with watch mode
npm run dev

# Production build
npm run build
```

### Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Lint code
npm run lint
```

### Debugging

**Background Script:**
1. Go to `chrome://extensions`
2. Click "Service Worker" under the extension
3. DevTools will open with console logs

**Content Script:**
1. Open any webpage
2. Right-click → Inspect
3. Check Console tab for `[JobAutofill]` logs

**Popup/Options:**
1. Right-click extension icon → Inspect Popup
2. Or right-click on options page → Inspect

## Coding Standards

### JavaScript Style Guide

We follow a consistent coding style for readability and maintainability.

#### General Principles

```javascript
// ✅ Good: Descriptive names
function classifyField(element) {
  const signals = getFieldSignals(element);
  return checkExactMatches(signals);
}

// ❌ Bad: Unclear names
function cf(el) {
  const s = gfs(el);
  return cem(s);
}
```

#### Module System

Use CommonJS (not ES6 modules):

```javascript
// ✅ Good
const FormDetector = require('./form-detector.js');
module.exports = { detectForms, analyzeForm };

// ❌ Bad
import FormDetector from './form-detector.js';
export { detectForms, analyzeForm };
```

#### Comments

```javascript
// ✅ Good: Explain why, not what
// Wait for DOM to update after clicking "Add Another"
await sleep(500);

// ❌ Bad: Obvious comment
// Sleep for 500ms
await sleep(500);
```

#### Error Handling

```javascript
// ✅ Good: Specific error handling
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  ErrorHandler.logError('Component', 'operation', error);
  return { success: false, error: error.message };
}

// ❌ Bad: Silent failures
try {
  await riskyOperation();
} catch (error) {
  // Ignore
}
```

#### Async/Await

```javascript
// ✅ Good: async/await for readability
async function fillForm(profile) {
  const response = await chrome.runtime.sendMessage({ type: 'GET_PROFILE' });
  if (!response.success) {
    throw new Error('No profile');
  }
  return response.profile;
}

// ❌ Bad: Nested promises
function fillForm(profile) {
  return chrome.runtime.sendMessage({ type: 'GET_PROFILE' })
    .then(response => {
      if (!response.success) {
        throw new Error('No profile');
      }
      return response.profile;
    });
}
```

### CSS Style Guide

```css
/* ✅ Good: Clear naming, organized */
.fill-result {
  margin-top: 12px;
  padding: 12px;
  border-radius: 6px;
}

.fill-result.success {
  background-color: #e8f5e9;
  border-left: 3px solid #4CAF50;
}

/* ❌ Bad: Generic names, disorganized */
.box {
  margin-top: 12px;
  border-radius: 6px;
  padding: 12px;
}
```

### HTML Style Guide

```html
<!-- ✅ Good: Semantic, accessible -->
<button id="fill-button" class="btn btn-primary" aria-label="Fill form with profile data">
  Fill Form
</button>

<!-- ❌ Bad: Non-semantic, no accessibility -->
<div onclick="fill()" class="btn">
  Fill
</div>
```

## Testing Guidelines

### Writing Tests

```javascript
// ✅ Good: Descriptive test names, isolated tests
describe('parseDate', () => {
  test('parses "Month Year" format', () => {
    expect(parseDate('Jan 2020')).toBe('2020-01');
    expect(parseDate('December 2023')).toBe('2023-12');
  });

  test('returns empty string for invalid dates', () => {
    expect(parseDate('')).toBe('');
    expect(parseDate('invalid')).toBe('');
  });
});

// ❌ Bad: Vague names, coupled tests
test('dates', () => {
  expect(parseDate('Jan 2020')).toBe('2020-01');
  expect(formatDate('2020-01')).toBe('January 2020');
});
```

### Test Coverage

Aim for:
- **Utilities**: 100% coverage
- **Core Logic**: 90%+ coverage
- **UI Components**: 70%+ coverage

### Manual Testing

Before submitting:
- [ ] Test on at least 3 different job sites
- [ ] Test in Chrome and Edge
- [ ] Check console for errors
- [ ] Verify no new warnings

## Submitting Changes

### Commit Messages

Use clear, descriptive commit messages:

```bash
# ✅ Good
git commit -m "Add retry logic for dynamic work history filling

- Retry failed button clicks up to 3 times
- Wait for new fields to appear with timeout
- Log detailed error messages for debugging"

# ❌ Bad
git commit -m "fix bug"
git commit -m "changes"
```

### Pull Request Process

1. **Update Documentation**: If you change functionality, update README.md
2. **Add Tests**: New features should have tests
3. **Update CHANGELOG.md**: Add entry under [Unreleased]
4. **Run Tests**: Ensure all tests pass
5. **Fill PR Template**: Use the template provided

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## Testing
Describe testing performed:
- [ ] Unit tests added/updated
- [ ] Manual testing on job sites
- [ ] Cross-browser tested

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Added tests
- [ ] Tests pass locally
- [ ] Updated CHANGELOG.md

## Screenshots (if applicable)

## Related Issues
Fixes #(issue number)
```

## Bug Reports

### Before Reporting

1. **Search existing issues** to avoid duplicates
2. **Test with latest version** to ensure bug still exists
3. **Collect information**:
   - Extension version
   - Browser version
   - Operating system
   - Console errors
   - Screenshots

### Security Vulnerabilities

**DO NOT** report security vulnerabilities in public issues.

Email: [Your security email]

Include:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Feature Requests

### Good Feature Requests

- Solve a specific problem
- Align with project goals (privacy, simplicity, usability)
- Include use cases and examples
- Consider implementation complexity

### Features We're Unlikely to Accept

- Require external servers or data collection
- Add significant complexity for edge cases
- Duplicate existing functionality
- Violate privacy principles

## Getting Help

### Stuck?

- Check [README.md](README.md) for basic usage
- Check [TESTING.md](TESTING.md) for testing procedures
- Check existing issues for similar problems
- Ask in GitHub Discussions

### Communication

- Be respectful and patient
- Provide context and details
- Follow up on questions
- Thank contributors for their time

## Recognition

Contributors will be recognized in:
- CHANGELOG.md for significant contributions
- README.md acknowledgments section
- Release notes

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to Job Autofill!** 🎉

Your contributions help make job applications easier for everyone.
