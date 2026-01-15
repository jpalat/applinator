# Testing Guide: iframe Support & Extension Icons

This guide will help you test the new iframe support and extension icons for the Job Autofill extension.

## Pre-Test Setup

### 1. Build Status ✅
- **Build completed**: All files compiled successfully
- **Icons generated**: 16x16, 32x32, 48x48, 128x128 PNG files
- **Manifest updated**: `all_frames: true` and `match_about_blank: true` configured
- **Frame detection**: Content script includes iframe detection logic

### 2. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `dist/` folder in this project
5. The extension should load successfully

**Expected:** Extension icon appears in Chrome toolbar with the new icon (not a green square)

---

## Test 1: Icon Verification

### Test 1.1: Toolbar Icon
**Steps:**
1. Look at the Chrome toolbar (top-right)
2. Find the Job Autofill extension icon

**Expected Results:**
- ✅ Icon is visible and properly displayed (not a placeholder or broken image)
- ✅ Icon appears crisp and clear (not pixelated)
- ✅ Icon matches the design from `exticon.png`

### Test 1.2: Extensions Page Icon
**Steps:**
1. Go to `chrome://extensions`
2. Find the Job Autofill extension card
3. Check the icon displayed on the card

**Expected Results:**
- ✅ Icon shows the proper design (128x128 version)
- ✅ No placeholder or default Chrome icon

**Status:** ⬜ PASS / ⬜ FAIL

---

## Test 2: iframe Support - Basic Functionality

### Test 2.1: Load Test Page
**Steps:**
1. Open `test-iframe.html` in Chrome (File > Open File)
2. The page should show:
   - Main frame form (Email input in top section)
   - iframe with a job application form (green border)

**Expected Results:**
- ✅ Both forms are visible on the page
- ✅ iframe loads successfully with form fields

### Test 2.2: Content Script Injection
**Steps:**
1. With `test-iframe.html` open, press F12 to open DevTools
2. Go to Console tab
3. Look for console messages

**Expected Results:**
You should see TWO sets of messages:
- ✅ `[JobAutofill] Content script loaded in main frame`
- ✅ `[JobAutofill] Content script loaded in iframe`
- ✅ `[Test] iframe form loaded. URL: ...`
- ✅ `[Test] Is in iframe: true`

**Status:** ⬜ PASS / ⬜ FAIL

### Test 2.3: Form Detection in iframe
**Steps:**
1. Keep `test-iframe.html` open
2. Click the extension icon in Chrome toolbar
3. Check the popup status

**Expected Results:**
- ✅ Popup shows "Found X fillable fields"
- ✅ Status includes text "(in iframe)"
- ✅ "Fill Form" button is enabled

**Status:** ⬜ PASS / ⬜ FAIL

---

## Test 3: iframe Support - Form Filling

### Test 3.1: Setup Profile (if not done)
**Steps:**
1. Click extension icon > "Setup Profile" or "Options"
2. Either upload a resume PDF or manually enter profile data
3. Save profile

### Test 3.2: Fill iframe Form
**Steps:**
1. Return to `test-iframe.html` page
2. Open DevTools Console (F12)
3. Click extension icon > "Fill Form" button
4. Watch both the main frame form AND the iframe form

**Expected Results:**
- ✅ Console shows form filling activity for BOTH frames
- ✅ Main frame Email field is filled
- ✅ iframe form fields are filled (First Name, Last Name, Email, Phone, etc.)
- ✅ Popup shows success message "Successfully filled X of Y fields"

**Status:** ⬜ PASS / ⬜ FAIL

---

## Quick Test Summary

**Run these commands to verify build:**
```bash
# Check icons exist
ls -lh dist/icons/icon-*.png

# Verify manifest has iframe support
grep -A 3 "all_frames" dist/manifest.json

# Check frame detection in content script
grep -o "window.self.*window.top" dist/content.js | head -1
```

**Manual Testing Checklist:**
1. ⬜ Extension loads in Chrome
2. ⬜ New icons display (not green squares)
3. ⬜ Open test-iframe.html
4. ⬜ Console shows content script in main frame and iframe
5. ⬜ Extension popup shows "(in iframe)"
6. ⬜ Click "Fill Form" - both forms fill successfully

---

## Troubleshooting

### Issue: Extension doesn't load
**Solution:** Check `chrome://extensions` for errors, rebuild with `npm run build`

### Issue: Icons still show as green squares
**Solution:** Run `node generate-icons.js`, then `npm run build`, reload extension

### Issue: iframe forms not detected
**Solution:** Check console for errors, verify iframe is same-origin, refresh page

---

## Next Steps

If all tests pass:
- ✅ Extension is ready for real-world testing
- Try on actual job sites (Workday, Greenhouse, Lever)
- Gather user feedback

If any tests fail:
- Document the issue
- Check console errors
- Review the implementation
