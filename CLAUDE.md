# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Job Autofill** is a Chrome Extension (Manifest V3) that intelligently detects and fills job application forms by parsing PDF resumes and classifying form fields. The extension uses vanilla JavaScript with Webpack bundling.

## Build Commands

```bash
# Install dependencies
npm install

# Development build with watch mode
npm run dev

# Production build (creates dist/ folder for Chrome)
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## Loading the Extension in Chrome

After building:
1. Navigate to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist/` folder

## Architecture

### Extension Components (Manifest V3)

The extension follows Chrome's Manifest V3 architecture with four independent entry points:

1. **Background Service Worker** (`src/background/service-worker.js`)
   - Persistent background script
   - Handles profile storage via Chrome Storage API
   - Routes messages between popup, options, and content scripts
   - Processes resume parsing requests

2. **Content Script** (`src/content/content-script.js`)
   - Injected into all web pages (`run_at: document_idle`)
   - Detects forms and classifies fields
   - Fills forms with profile data
   - Watches for dynamic form changes via MutationObserver

3. **Popup** (`src/popup/popup.js`)
   - Extension toolbar popup UI
   - Displays form detection status
   - Triggers form filling

4. **Options Page** (`src/options/options.js`)
   - Profile management interface
   - Handles PDF resume upload and parsing (client-side)
   - Profile editing with tabs (Personal Info, Work, Education, Skills)

### Core Systems

#### Field Classification (3-Stage System)

The field classifier (`src/content/field-classifier.js`) uses a multi-stage approach:

1. **Stage 1: Exact Match** (95%+ confidence)
   - Matches field labels/names against exact keywords
   - Example: "First Name" → `personalInfo.firstName`

2. **Stage 2: Pattern Match** (70-85% confidence)
   - Uses regex patterns from `src/lib/field-patterns.js`
   - Example: `/^f[_.-]?name$/i` matches "f_name", "fname"

3. **Stage 3: Type Hints** (60-70% confidence)
   - Uses HTML `type` and `autocomplete` attributes
   - Example: `type="email"` → `personalInfo.email`

**Field Patterns Dictionary** (`src/lib/field-patterns.js`):
- 100+ field type patterns organized by category
- Categories: personalInfo, workExperience, education, skills, custom
- Each pattern includes exact matches, regex patterns, autocomplete hints, and priority

#### Signal Extraction (`src/utils/dom-utils.js`)

The `getFieldSignals()` function extracts all identifying information from a field:
- Label text (via `<label>`, `aria-labelledby`, or nearby text)
- Name/ID attributes
- Placeholder text
- `aria-label` and `title` attributes
- Parent element context

#### Form Detection & Analysis

`src/content/form-detector.js` provides:
- `detectForms()` - Finds all forms on page, classifies fields
- `getFormSummary()` - Quick check without full classification
- `getBestFormToFill()` - Selects most relevant form based on classified field count
- Form type detection (job application, contact form, generic)

#### Dynamic Form Handling

`src/content/dynamic-handler.js` handles multi-entry sections:
- Detects "Add Another" buttons via keyword matching
- Fills first work experience with existing fields
- Clicks "Add Another", waits for new fields (with retries)
- Repeats for up to 5 work experiences
- Handles timing issues with `waitForElement()` utility


### Data Flow

```
User uploads resume
  → Options page sends to background service worker
  → resume-parser.js extracts text and parses sections
  → Returns structured profile object
  → Options page saves to Chrome Storage

User clicks "Fill Form" in popup
  → Popup sends FILL_FORM message to content script
  → Content script requests profile from background
  → form-detector.js analyzes page forms
  → field-classifier.js classifies each field
  → form-filler.js fills fields with profile data
  → dynamic-handler.js handles multi-entry sections
```

### Message Passing

Background service worker handles:
- `GET_PROFILE` - Returns stored profile
- `SAVE_PROFILE` - Saves profile to storage
- `HAS_PROFILE` - Checks if profile exists
- `CLEAR_PROFILE` - Removes profile
- `PARSE_RESUME` - Parses PDF resume

Content script handles:
- `CHECK_FORMS` - Quick form presence check
- `ANALYZE_FORMS` - Full field classification
- `FILL_FORM` - Fill form with profile data
- `HIGHLIGHT_FIELDS` - Debug visualization

## Profile Data Structure

```javascript
{
  profileId: 'default',
  createdAt: ISO timestamp,
  updatedAt: ISO timestamp,
  personalInfo: {
    firstName, lastName, fullName, email, phone,
    city, state, zipCode, linkedIn, portfolio, ...
  },
  workExperience: [
    {
      company, title, startDate, endDate, currentlyWorking,
      location, description, ...
    }
  ],
  education: [
    { school, degree, fieldOfStudy, graduationDate, gpa, ... }
  ],
  skills: {
    technical: [...],
    summary: "..."
  }
}
```

## Development Guidelines

### Adding New Field Types

1. Add pattern to `src/lib/field-patterns.js`:
   ```javascript
   'category.fieldName': {
     exact: ['exact match 1', 'exact match 2'],
     patterns: [/regex1/i, /regex2/i],
     autocomplete: ['autocomplete-value'],
     type: ['input-type'],
     priority: 10
   }
   ```

2. Update profile structure in `src/background/storage-manager.js` if needed

3. Add fill logic in `src/content/form-filler.js` if special handling required

### Debugging Form Classification

1. Use `HIGHLIGHT_FIELDS` message to visualize classification:
   - Green: High confidence (80%+)
   - Orange: Medium confidence (50-80%)
   - Yellow: Low confidence (<50%)
   - Red: Unknown field

2. Check console logs in content script for classification details

### Testing

- Tests use Jest
- Test files in `tests/` directory
- Mock Chrome APIs when testing extension components

### iframe Support

The extension supports forms inside iframes (including nested iframes). The content script is injected into all frames via the `all_frames: true` manifest configuration.

**How it works:**
- Each frame (main + iframes) runs an independent content script instance
- Form detection occurs within each frame's document scope
- Message handlers (CHECK_FORMS, FILL_FORM) broadcast to all frames
- Each frame independently detects and fills forms within its context

**Frame Detection:**
- Content script detects if it's running in an iframe: `window.self !== window.top`
- Frame context information is included in form detection messages
- Popup displays "(in iframe)" indicator when forms are detected in iframes

**Limitations:**
- Cross-origin iframes may not be accessible (browser security policy)
- "Add Another" buttons in parent frame that affect child iframe are not supported
- Field highlighting in iframes may not auto-scroll parent frame

## Common Pitfalls

1. **Service Worker Context**: Background script cannot access DOM or window
2. **Async Message Passing**: Always `return true` in message listeners for async responses
3. **Content Script Timing**: Use `document_idle` to ensure page is loaded
4. **CommonJS Modules**: Project uses `require()` not ES6 imports due to Webpack config

## Build Output

Webpack bundles into `dist/`:
- `background.js` - Service worker bundle
- `content.js` - Content script bundle
- `popup.js`, `popup.html`, `popup.css` - Popup UI
- `options.js`, `options.html`, `options.css` - Options page
- `manifest.json` - Extension manifest
- `icons/` - Extension icons

## Issue Tracking

This project uses **beads** (`bd`) for issue tracking. See AGENTS.md for complete workflow documentation.

When completing work, always:
1. Close finished issues with `bd close <id>`
2. Run `bd sync` to commit issue changes
3. Commit code changes with git
4. Run `bd sync` again if needed
5. Push to remote with `git push`
