# Testing Guide

This document provides comprehensive testing procedures for the Job Autofill extension.

## Quick Test (5 minutes)

1. **Install Extension**
   ```
   chrome://extensions → Load unpacked → Select dist/
   ```

2. **Create Profile**
   - Click extension icon → Setup Profile
   - Fill in name, email, phone
   - Add one work experience
   - Save

3. **Test Form Fill**
   - Navigate to any form (Google Forms, Typeform, job site)
   - Click extension icon → Fill Form
   - Verify fields populated

## Comprehensive Test Suite

### 1. Installation & Setup

#### Test 1.1: Extension Installation
- [ ] Load extension via developer mode
- [ ] Extension icon appears in toolbar
- [ ] No console errors in background page
- [ ] Manifest V3 loads correctly

**Expected**: Extension loads successfully

#### Test 1.2: Initial Popup State
- [ ] Click extension icon
- [ ] See "No Profile Found" empty state
- [ ] Icon displays correctly
- [ ] "Setup Profile" button visible

**Expected**: User-friendly empty state displayed

### 2. Profile Creation

#### Test 2.1: Manual Profile Entry
- [ ] Click "Setup Profile"
- [ ] Options page opens in new tab
- [ ] Navigate through all tabs (Personal, Work, Education, Skills)
- [ ] Fill in required fields
- [ ] Click "Save Profile"
- [ ] See success message

**Expected**: Profile saved successfully

#### Test 2.2: Resume Upload
- [ ] Open options page
- [ ] Drag & drop PDF resume
- [ ] See parsing progress
- [ ] Verify extracted data in fields
- [ ] Correct any parsing errors
- [ ] Click "Save Profile"

**Expected**: Resume parsed and data extracted

#### Test 2.3: Profile Validation
- [ ] Try to save empty profile
- [ ] Try to save with only first name
- [ ] Try to save with invalid email

**Expected**: Validation errors shown for incomplete data

#### Test 2.4: Profile Editing
- [ ] Open saved profile
- [ ] Edit personal info
- [ ] Add new work experience
- [ ] Remove education entry
- [ ] Save changes

**Expected**: Changes persisted correctly

#### Test 2.5: Profile Deletion
- [ ] Click "Clear Profile"
- [ ] Confirm deletion
- [ ] Reload extension popup

**Expected**: Profile deleted, empty state shown

### 3. Form Detection

#### Test 3.1: Basic Form Detection
- [ ] Navigate to page with form
- [ ] Open extension popup
- [ ] Verify "Found X fillable fields" message
- [ ] Verify form type detected (job-application, contact, etc.)

**Expected**: Form detected with count and type

#### Test 3.2: No Forms
- [ ] Navigate to page without forms (e.g., Google homepage)
- [ ] Open extension popup

**Expected**: "No forms detected on this page"

#### Test 3.3: Dynamic Forms
- [ ] Navigate to page with dynamically loaded form
- [ ] Wait for form to load
- [ ] Check popup

**Expected**: Form detected after it loads (MutationObserver)

#### Test 3.4: Multiple Forms
- [ ] Navigate to page with multiple forms
- [ ] Open popup

**Expected**: Detects best form (most fields, job-application type preferred)

### 4. Field Classification

#### Test 4.1: Personal Info Fields
Test with form containing:
- [ ] First name field
- [ ] Last name field
- [ ] Email field
- [ ] Phone field
- [ ] Address fields

**Expected**: All fields classified correctly (check console logs)

#### Test 4.2: Work Experience Fields
Test with form containing:
- [ ] Company field
- [ ] Position/title field
- [ ] Start date field
- [ ] End date field
- [ ] Current position checkbox
- [ ] Description field

**Expected**: Work fields classified correctly

#### Test 4.3: Education Fields
Test with form containing:
- [ ] School/university field
- [ ] Degree field
- [ ] Major/field field
- [ ] Graduation date field

**Expected**: Education fields classified correctly

#### Test 4.4: Edge Cases
Test with:
- [ ] Fields with unusual labels ("fname", "email_addr")
- [ ] Fields without labels (placeholder only)
- [ ] Fields with icons instead of text labels
- [ ] Custom field names

**Expected**: Reasonable classification rate (70%+)

### 5. Form Filling

#### Test 5.1: Basic Fill
- [ ] Navigate to simple form
- [ ] Open popup
- [ ] Click "Fill Form"
- [ ] See progress indicator
- [ ] Verify fields filled

**Expected**: All detected fields filled correctly

#### Test 5.2: Field Types
Test filling different input types:
- [ ] text inputs
- [ ] email inputs
- [ ] tel inputs
- [ ] date inputs
- [ ] select dropdowns
- [ ] textareas
- [ ] checkboxes (current position)

**Expected**: All input types filled correctly

#### Test 5.3: Data Formatting
Verify correct formatting:
- [ ] Dates formatted as YYYY-MM-DD
- [ ] Phone formatted as (123) 456-7890
- [ ] Arrays joined with commas
- [ ] Boolean values as "Yes"/"No"

**Expected**: Data formatted appropriately for field type

#### Test 5.4: Partial Fill
- [ ] Form with some undetected fields
- [ ] Fill form
- [ ] Check result message

**Expected**: "Successfully filled X of Y fields (Z skipped)"

#### Test 5.5: Fill with Missing Data
- [ ] Profile missing phone number
- [ ] Form requires phone number
- [ ] Fill form

**Expected**: Other fields filled, phone field skipped

### 6. Dynamic Work History

#### Test 6.1: Detect "Add Another" Button
- [ ] Form with "Add Position" button
- [ ] Open console
- [ ] Trigger form analysis

**Expected**: Dynamic section detected (check console logs)

#### Test 6.2: Fill Multiple Work Experiences
Profile with 3 work experiences:
- [ ] Fill form
- [ ] Watch extension click "Add Another"
- [ ] Verify all 3 experiences filled

**Expected**: 3 work entries created and filled

#### Test 6.3: Max Entries Limit
Profile with 6 work experiences (more than max of 5):
- [ ] Fill form

**Expected**: Only 5 entries filled, no errors

#### Test 6.4: Failed Button Click
- [ ] Form with disabled "Add Another" button
- [ ] Fill form

**Expected**: Fills first entry, gracefully stops, no crash

### 7. Error Handling

#### Test 7.1: No Profile Error
- [ ] Clear profile
- [ ] Navigate to form
- [ ] Try to fill

**Expected**: User-friendly error: "No profile found. Please set up your profile..."

#### Test 7.2: Content Script Not Loaded
- [ ] Open form page
- [ ] Immediately click Fill (before script loads)

**Expected**: "Please refresh the page to enable autofill"

#### Test 7.3: Network Error
- [ ] Disconnect network
- [ ] Try to fill form

**Expected**: Extension works (all operations are local)

#### Test 7.4: Invalid Profile Data
- [ ] Manually corrupt storage data (dev tools)
- [ ] Reload extension

**Expected**: Graceful handling, clear profile if invalid

### 8. UI/UX

#### Test 8.1: Loading States
- [ ] Open popup immediately after page load
- [ ] See spinner

**Expected**: Animated spinner with "Loading extension..."

#### Test 8.2: Empty States
- [ ] No profile: see empty state with icon
- [ ] No forms: see helpful message

**Expected**: User-friendly empty states

#### Test 8.3: Success Messages
- [ ] Successfully fill form
- [ ] See success message

**Expected**: Green success with statistics, auto-hides after 5s

#### Test 8.4: Warning Messages
- [ ] Partial fill (some fields failed)
- [ ] See warning message

**Expected**: Orange warning with details, auto-hides after 7s

#### Test 8.5: Error Messages
- [ ] Trigger error (e.g., no profile)
- [ ] See error state

**Expected**: Red error with actionable button

#### Test 8.6: Progress Indicator
- [ ] Fill large form
- [ ] Watch progress bar

**Expected**: Progress shows stages: Analyzing → Filling → Complete

### 9. Performance

#### Test 9.1: Form Detection Speed
- [ ] Navigate to page with multiple large forms
- [ ] Time how long detection takes

**Expected**: < 500ms for detection

#### Test 9.2: Fill Speed
- [ ] Fill form with 20+ fields
- [ ] Time how long filling takes

**Expected**: < 5 seconds for 20 fields (with 100ms delay)

#### Test 9.3: Memory Usage
- [ ] Open DevTools → Memory
- [ ] Check extension memory usage

**Expected**: < 50MB for content script

#### Test 9.4: MutationObserver Throttling
- [ ] Page with frequent DOM changes
- [ ] Watch console for re-analysis logs

**Expected**: Re-analysis throttled to max 1/second

### 10. Cross-Browser Testing

#### Test 10.1: Chrome
- [ ] Version: 88+ (Manifest V3)
- [ ] All features work
- [ ] No console errors

**Expected**: Full functionality

#### Test 10.2: Edge
- [ ] Version: Latest
- [ ] Load unpacked extension
- [ ] Test all features

**Expected**: Full functionality (Chromium-based)

### 11. Real-World Sites

#### Test 11.1: Job Application Sites
Test on:
- [ ] Indeed.com
- [ ] LinkedIn Jobs
- [ ] Monster.com
- [ ] Company career pages (e.g., Google Careers)
- [ ] Greenhouse/Lever (if accessible)

**Expected**: 70%+ field detection rate

#### Test 11.2: Contact Forms
- [ ] Google Forms
- [ ] Typeform
- [ ] Wufoo
- [ ] Generic HTML forms

**Expected**: Basic fields filled correctly

### 12. Security Testing

#### Test 12.1: XSS Prevention
- [ ] Profile with `<script>alert('xss')</script>` in name
- [ ] Fill form
- [ ] Check if script executes

**Expected**: Script NOT executed, appears as text

#### Test 12.2: Data Isolation
- [ ] Open multiple tabs with forms
- [ ] Fill each independently

**Expected**: No data leakage between tabs

#### Test 12.3: Storage Security
- [ ] Open DevTools → Application → Storage
- [ ] Check chrome.storage.local

**Expected**: Data stored with proper namespacing

#### Test 12.4: Permission Boundaries
- [ ] Extension only accesses current tab when activated

**Expected**: No background tab access

### 13. Edge Cases

#### Test 13.1: Hidden Fields
- [ ] Form with `display: none` fields
- [ ] Fill form

**Expected**: Hidden fields not filled

#### Test 13.2: Disabled Fields
- [ ] Form with disabled fields
- [ ] Fill form

**Expected**: Disabled fields not filled

#### Test 13.3: ReadOnly Fields
- [ ] Form with readonly fields
- [ ] Fill form

**Expected**: Readonly fields not filled

#### Test 13.4: Very Long Text
- [ ] Profile with 5000-character summary
- [ ] Fill form with textarea

**Expected**: Handles long text, no truncation

#### Test 13.5: Special Characters
- [ ] Profile with special characters (é, ñ, 中文)
- [ ] Fill form

**Expected**: Special characters preserved

#### Test 13.6: Rapid Form Changes
- [ ] Page that dynamically adds/removes forms
- [ ] Check extension stability

**Expected**: No crashes, throttled re-detection

## Automated Tests

### Run Unit Tests
```bash
npm test
```

**Tests**:
- Date parsing (20+ tests)
- Field classification (30+ tests)
- Pattern matching
- Confidence calculations

**Expected**: All tests pass

## Regression Testing

Before each release:
- [ ] Run full test suite above
- [ ] Test on 5+ real job sites
- [ ] Cross-browser test (Chrome + Edge)
- [ ] Check for console errors
- [ ] Verify no new permissions needed
- [ ] Test fresh install (clear all data first)
- [ ] Test upgrade path (install old version, upgrade)

## Bug Report Template

When filing bugs:
```
**Description**: Clear description of issue

**Steps to Reproduce**:
1. ...
2. ...
3. ...

**Expected Behavior**: What should happen

**Actual Behavior**: What actually happens

**Environment**:
- Extension Version: 1.0.0
- Browser: Chrome 120
- OS: Windows 11

**Screenshots**: (if applicable)

**Console Errors**: (paste from DevTools)
```

## Performance Benchmarks

| Operation | Target | Acceptable |
|-----------|--------|------------|
| Form detection | < 200ms | < 500ms |
| Field classification | < 100ms | < 300ms |
| Fill 10 fields | < 2s | < 5s |
| Resume parsing | < 3s | < 10s |
| Profile save | < 500ms | < 1s |

## Testing Checklist for Release

- [ ] All automated tests pass
- [ ] Manual test on 5+ real sites
- [ ] No console errors
- [ ] Cross-browser tested
- [ ] Security review passed
- [ ] Performance benchmarks met
- [ ] Error handling tested
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version number incremented

---

**Happy Testing!** 🧪

If you find bugs, please report them with detailed reproduction steps.
