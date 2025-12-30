# Security Policy

## Overview

This document outlines the security considerations and best practices implemented in the Job Autofill extension.

## Security Principles

### 1. Privacy by Design
- **Local-Only Storage**: All user data stored using `chrome.storage.local` API
- **No External Transmission**: Zero network requests for user data
- **No Third-Party Services**: No analytics, tracking, or external APIs
- **Minimal Permissions**: Only requests necessary permissions

### 2. Data Protection
- **User Control**: Users can view, edit, and delete all stored data
- **No Persistence After Uninstall**: All data removed when extension is uninstalled
- **No Logging**: No user data logged to console in production builds
- **Input Validation**: All user inputs validated before storage

### 3. Code Security
- **No eval()**: No use of `eval()` or `Function()` constructor
- **No Inline Scripts**: Compliant with Manifest V3 CSP
- **Sandboxed Execution**: Content scripts run in isolated world
- **XSS Prevention**: All user data sanitized before DOM insertion

## Threat Model

### In Scope
- Local data access by malicious extensions
- XSS vulnerabilities in extension pages
- Data leakage through error messages
- Permission escalation
- Malicious form field detection

### Out of Scope
- Physical access to user's device
- Compromised Chrome browser
- Operating system vulnerabilities
- Network-level attacks (extension doesn't make network requests)

## Security Measures

### Permission Justification

#### storage
- **Purpose**: Save user profile locally
- **Risk**: Other extensions could access storage if they request the same permission
- **Mitigation**: Use namespaced keys, Chrome storage is sandboxed per-extension
- **Data**: User profile (name, email, work history, etc.)

#### activeTab
- **Purpose**: Detect and fill forms on active tab
- **Risk**: Could read sensitive data from pages
- **Mitigation**: Only activates on user action (button click), doesn't persist access
- **Data**: Form field metadata (labels, names, types)

#### host_permissions: <all_urls>
- **Purpose**: Inject content script on all pages for universal form filling
- **Risk**: Broad access to all websites
- **Mitigation**: Content script is read-only except when filling (write only user data), no data exfiltration
- **Justification**: Job sites vary widely, wildcard permission necessary

### Code Security Practices

#### 1. Input Validation
```javascript
// All user inputs validated before storage
function saveProfile(profile) {
  // Validate required fields
  if (!profile.personalInfo || !profile.personalInfo.firstName) {
    throw new Error('Invalid profile data');
  }

  // Sanitize inputs
  const sanitizedProfile = sanitizeProfile(profile);

  // Save with validation
  await chrome.storage.local.set({ defaultProfile: sanitizedProfile });
}
```

#### 2. Content Security Policy (CSP)
Manifest V3 enforces strict CSP:
- No inline scripts
- No eval()
- No external script loading
- All code bundled with extension

#### 3. DOM Manipulation Security
```javascript
// Safe DOM manipulation
function setFieldValue(element, value) {
  // Use native setters, not innerHTML
  element.value = value;

  // Trigger events safely
  element.dispatchEvent(new Event('input', { bubbles: true }));
}
```

#### 4. Error Handling
```javascript
// Don't expose sensitive data in errors
try {
  await fillForm(profile);
} catch (error) {
  // Log detailed error locally
  console.error('[Internal]', error);

  // Show generic message to user
  showError('Failed to fill form');
}
```

### Data Sanitization

#### Resume Parsing
```javascript
// Sanitize extracted text
function sanitizeText(text) {
  // Remove potential XSS vectors
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}
```

#### Field Filling
```javascript
// Only fill with user's own data
function fillField(element, value) {
  // Never inject HTML
  element.value = String(value);

  // Don't execute scripts
  if (element.tagName === 'TEXTAREA') {
    element.textContent = ''; // Clear first
    element.value = String(value); // Set safely
  }
}
```

## Vulnerability Reporting

### Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

### Reporting a Vulnerability

If you discover a security vulnerability, please:

1. **DO NOT** open a public issue
2. Email details to: [Your security email]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will:
- Acknowledge receipt within 48 hours
- Provide an estimated timeline for fix
- Notify you when the fix is released
- Credit you (if desired) in release notes

## Known Limitations

### 1. Other Extensions
- Other installed extensions with `storage` permission could theoretically access the same storage API
- **Mitigation**: Chrome provides extension sandboxing, keys are namespaced
- **User Action**: Users should only install trusted extensions

### 2. Physical Access
- If attacker has physical access to device, they could access Chrome storage
- **Mitigation**: Users should lock their devices, use Chrome profiles with passwords
- **User Action**: Don't leave devices unattended and unlocked

### 3. Malicious Websites
- Websites could create fake forms to trick extension into revealing profile data
- **Mitigation**: Extension only fills on user action, users review before submitting
- **User Action**: Users should only click "Fill Form" on legitimate job sites

## Compliance

### OWASP Top 10 (Web Applications)

1. **Injection** ✅
   - No SQL (no database)
   - No eval() or Function()
   - DOM manipulation uses safe APIs

2. **Broken Authentication** ✅
   - No authentication system
   - No passwords stored

3. **Sensitive Data Exposure** ✅
   - Data encrypted at rest by Chrome Storage API
   - No data transmission
   - No logging of PII

4. **XML External Entities** ✅
   - No XML processing

5. **Broken Access Control** ✅
   - No server-side access control needed
   - Chrome provides extension sandboxing

6. **Security Misconfiguration** ✅
   - Minimal attack surface
   - Strict CSP enforced
   - Permissions principle of least privilege

7. **Cross-Site Scripting (XSS)** ✅
   - No innerHTML usage for user data
   - CSP prevents inline scripts
   - All user input sanitized

8. **Insecure Deserialization** ✅
   - No deserialization of untrusted data
   - JSON parsing only for own data

9. **Using Components with Known Vulnerabilities** ✅
   - Dependencies: pdf.js (Mozilla, well-maintained)
   - Regular updates via npm

10. **Insufficient Logging & Monitoring** ⚠️
    - Console logging for development
    - No production logging (privacy trade-off)
    - User-facing error messages only

## Secure Development Practices

### Code Review
- All code changes reviewed before merge
- Security-focused review for permission changes
- Manual testing on multiple sites

### Dependency Management
```bash
# Regular dependency audits
npm audit

# Update dependencies
npm update

# Check for known vulnerabilities
npm audit fix
```

### Build Security
```bash
# Production build strips console.log
npm run build

# Development build includes debug info
npm run dev
```

### Testing
```bash
# Unit tests for critical functions
npm test

# Manual security testing checklist:
# - Test with malicious inputs
# - Verify no data leakage in errors
# - Check network tab (should be empty)
# - Test permission boundaries
# - Verify data deletion on uninstall
```

## Incident Response Plan

### If Vulnerability Discovered

1. **Assess**: Determine severity and impact
2. **Fix**: Develop and test patch
3. **Release**: Push emergency update to Chrome Web Store
4. **Notify**: Inform affected users via extension update notes
5. **Document**: Update security documentation

### Severity Levels

- **Critical**: Allows data exfiltration, remote code execution
  - Response: Immediate patch within 24 hours

- **High**: Allows unauthorized data access
  - Response: Patch within 7 days

- **Medium**: Potential for abuse with user interaction
  - Response: Patch in next scheduled release

- **Low**: Minimal impact, edge cases
  - Response: Fix in future update

## Security Checklist for Contributors

Before submitting code:
- [ ] No use of `eval()`, `Function()`, or `innerHTML` for user data
- [ ] No external network requests added
- [ ] All user inputs validated and sanitized
- [ ] Errors don't expose sensitive information
- [ ] No new permissions requested without justification
- [ ] Code follows principle of least privilege
- [ ] Manual testing performed
- [ ] Unit tests added for new functionality

## Disclosure

We are committed to transparency. This extension:
- ✅ Is open source (code available for audit)
- ✅ Uses minimal permissions (only what's necessary)
- ✅ Stores data locally only (no external servers)
- ✅ Has no third-party dependencies for runtime (pdf.js is bundled)
- ✅ Follows Chrome Extension security best practices
- ✅ Complies with Manifest V3 requirements

## Resources

- [Chrome Extension Security](https://developer.chrome.com/docs/extensions/mv3/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/)

## Contact

For security concerns:
- 📧 Email: [Your security email]
- 🔒 GitHub: https://github.com/jpalat/applinator/security
- ⚠️ For non-security issues: https://github.com/jpalat/applinator/issues

---

**Security is a priority. If you have concerns or questions, please reach out.**
