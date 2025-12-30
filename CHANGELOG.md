# Changelog

All notable changes to the Job Autofill extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-29

### Added - Initial MVP Release

#### Core Features
- **Resume Parsing**: Upload PDF resume with intelligent text extraction
- **Profile Management**: Easy-to-use interface for creating and editing profiles
- **Field Classification**: 100+ field pattern library with 3-stage classification
- **Form Detection**: Automatic detection and analysis of job application forms
- **Form Filling**: Intelligent autofill with support for multiple input types
- **Dynamic Work History**: Automatic detection and filling of multiple work experiences

#### Personal Information Support
- First Name, Last Name, Full Name
- Email Address
- Phone Number (with formatting)
- Address (City, State, ZIP Code)
- LinkedIn Profile URL
- Portfolio/Website URL

#### Work Experience Support
- Company Name
- Job Title/Position
- Start Date, End Date (with formatting)
- Current Position checkbox
- Job Location
- Job Description/Responsibilities
- Support for up to 5 work experiences
- Automatic "Add Another" button detection and clicking

#### Education Support
- School/University Name
- Degree Type
- Field of Study
- Graduation Date
- GPA

#### Skills Support
- Technical Skills (comma-separated list)
- Professional Summary
- Cover Letter text

#### UI/UX Features
- Loading spinner with animations
- Empty states with helpful icons and guidance
- Error states with actionable buttons (Retry, Refresh, Open Options)
- Success/Warning/Error feedback messages
- Progress indicator with stages (Analyzing → Filling → Complete)
- Color-coded form status indicators (green/orange/red)
- Auto-hiding notifications (5s for success, 7s for warnings/errors)

#### Error Handling
- User-friendly error messages for all error types
- Centralized ErrorHandler module
- Specific errors: NO_PROFILE, FILL_FAILED, CONTENT_SCRIPT_NOT_LOADED, etc.
- Graceful degradation on partial fills

#### Performance Optimizations
- Throttled MutationObserver (1s limit) for form change detection
- Debounce utility for future optimizations
- Optimized field classification algorithm
- Efficient DOM traversal

#### Testing
- 50+ unit tests for date parsing and field classification
- Comprehensive manual testing guide
- Cross-browser compatibility (Chrome, Edge)

#### Documentation
- Comprehensive README with usage guide
- Privacy Policy (100% local storage, no data collection)
- Security Policy with OWASP compliance
- Chrome Web Store listing prepared
- Testing guide with 100+ test cases

#### Privacy & Security
- 100% local storage (Chrome Storage API)
- Zero data collection or transmission
- No third-party analytics or tracking
- No account required
- Open source code for transparency
- Manifest V3 compliant
- CSP-compliant (no eval, no inline scripts)
- XSS prevention measures

### Technical Details
- **Build System**: Webpack 5 with Babel transpilation
- **PDF Library**: pdf.js (Mozilla)
- **Module System**: CommonJS (require/module.exports)
- **Testing Framework**: Jest
- **Code Style**: ESLint
- **Min Chrome Version**: 88 (Manifest V3)

### Known Limitations
- PDF resumes only (DOCX planned for future)
- Single profile only (multiple profiles planned for future)
- File upload fields not supported
- Some custom form builders may require manual filling
- Max 5 work experiences (configurable)

### Bundle Size
- background.js: 419 KB (includes pdf.js)
- content.js: 54.8 KB
- popup.js: 14.1 KB
- pdf.worker.min.mjs: 987 KB

---

## [Unreleased]

### Planned Features
- Multiple profile support
- DOCX resume support
- LinkedIn profile import
- Cover letter templates
- Application history tracking
- Cloud sync for profiles
- Education dynamic sections (like work history)
- Custom field mapping editor
- Fill history and analytics (local only)
- Export/import profiles
- Browser action keyboard shortcuts

### Under Consideration
- Browser sync across devices
- Site-specific adapters for complex forms
- Cover letter generation
- Auto-apply workflow
- Form validation warnings
- Field confidence visualization
- Manual field mapping override
- Advanced retry logic for failed fills

---

## Version History

| Version | Release Date | Highlights |
|---------|-------------|------------|
| 1.0.0   | 2025-12-29  | Initial MVP release with core autofill features |

---

## Upgrade Guide

### From 0.x to 1.0.0
- First public release, no upgrade path needed
- Fresh install recommended

---

## Deprecations

None yet.

---

## Security Fixes

None yet. Any security fixes will be clearly marked in this section.

---

## Breaking Changes

None yet. Breaking changes will be clearly marked with migration guides.

---

## Contributors

- Jay Palat (@jpalat) - Initial development
- Claude Code (Anthropic) - Development assistance

---

## Links

- **GitHub**: https://github.com/jpalat/applinator
- **Chrome Web Store**: [Pending]
- **Documentation**: https://github.com/jpalat/applinator/blob/main/README.md
- **Issues**: https://github.com/jpalat/applinator/issues

---

## Notes

### Versioning Scheme
- **Major** (X.0.0): Breaking changes, major new features
- **Minor** (1.X.0): New features, backwards compatible
- **Patch** (1.0.X): Bug fixes, minor improvements

### Release Cycle
- **Patch releases**: As needed for critical bugs
- **Minor releases**: Monthly (planned)
- **Major releases**: Annually or for significant rewrites

---

[1.0.0]: https://github.com/jpalat/applinator/releases/tag/v1.0.0
[Unreleased]: https://github.com/jpalat/applinator/compare/v1.0.0...HEAD
