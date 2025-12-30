# Privacy Policy for Job Autofill

**Last Updated: December 29, 2025**

## Overview

Job Autofill ("the Extension", "we", "our") is committed to protecting your privacy. This privacy policy explains how the Extension handles your data.

## Our Privacy Commitment

**We do not collect, store, or transmit any of your personal data to external servers.**

All data processing happens entirely on your device. Your resume, profile information, and any other data you provide stays on your computer.

## Data We Handle

### Information You Provide

The Extension allows you to input and store the following information locally:

**Personal Information:**
- Name (first, last)
- Email address
- Phone number
- Physical address (city, state, ZIP code)
- LinkedIn profile URL
- Portfolio/website URL

**Work Experience:**
- Company names
- Job titles/positions
- Employment dates
- Job locations
- Job descriptions/responsibilities

**Education:**
- School/university names
- Degree types
- Fields of study
- Graduation dates
- GPA

**Skills & Professional Information:**
- Technical skills lists
- Professional summary
- Cover letter text

**Resume Data:**
- PDF resume file content
- Extracted text from resume

### How We Store Your Data

- **Storage Location**: All data is stored locally on your device using Chrome's `chrome.storage.local` API
- **No Cloud Sync**: Data is not synced to any cloud service or external server
- **No Account Required**: No login, registration, or account creation required
- **Device-Specific**: Data only exists on the device where you installed the Extension

### How We Use Your Data

Your data is used exclusively for:

1. **Autofilling Forms**: Detecting form fields on job application pages and filling them with your stored profile information
2. **Resume Parsing**: Extracting information from uploaded PDF resumes to pre-populate your profile
3. **Profile Management**: Displaying and allowing you to edit your stored information

## Data We Do NOT Collect

- ❌ Browsing history
- ❌ Websites you visit
- ❌ Forms you fill (beyond what's needed for the current operation)
- ❌ Analytics or usage statistics
- ❌ Device information
- ❌ IP addresses
- ❌ Cookies (beyond standard Chrome extension storage)
- ❌ Personal identifiers
- ❌ Crashlogs or error reports (beyond local console logs)

## Third-Party Services

**The Extension does not use any third-party services**, including:
- No analytics services (Google Analytics, etc.)
- No advertising networks
- No social media integrations
- No external APIs
- No content delivery networks (CDN) for user data

The Extension does use one third-party library included in the build:
- **pdf.js** by Mozilla - Used locally for PDF parsing, no data sent to Mozilla

## Permissions Explained

The Extension requests the following Chrome permissions:

### storage
**Why**: To save your profile data locally on your device
**Access**: Chrome's local storage API only
**Data**: Your profile information (as listed above)
**External Access**: None - data stays on your device

### activeTab
**Why**: To detect forms and fill fields on the currently active tab when you click "Fill Form"
**Access**: Current tab only, and only when activated
**Data**: Form field information (labels, names, types) for classification
**External Access**: None - field detection happens locally

### host_permissions: <all_urls>
**Why**: To inject the content script that detects and fills forms on any job application site
**Access**: Ability to run JavaScript on web pages you visit
**Data**: None collected - script only reads form structure and writes data you've stored
**External Access**: None - all processing is local

## Data Security

### How We Protect Your Data

- **Local Storage**: Data is stored using Chrome's secure storage API
- **No Transmission**: Data is never transmitted over the internet
- **No Server**: We don't operate any servers that could be compromised
- **No Third Parties**: No data sharing with third parties
- **Open Source**: Code is available for inspection (link in extension listing)

### Your Data Rights

Since all data is stored locally on your device, you have complete control:

- **Access**: View your profile anytime through the Extension options page
- **Modify**: Edit any information in your profile
- **Delete**: Clear your entire profile with one click in the options page
- **Export**: (Future feature) Export your profile data to a file
- **Uninstall**: Uninstalling the Extension completely removes all stored data

## Data Deletion

### Clearing Your Profile
1. Open the Extension options page
2. Click "Clear Profile" at the bottom
3. Confirm the deletion
4. All your data is immediately deleted from Chrome storage

### Uninstalling the Extension
1. Go to `chrome://extensions`
2. Find "Job Autofill"
3. Click "Remove"
4. All Extension data, including your profile, is deleted

## Children's Privacy

The Extension is not directed to individuals under the age of 13. We do not knowingly collect information from children under 13. If you are under 13, please do not use this Extension.

## Changes to Privacy Policy

We may update this privacy policy from time to time. Changes will be reflected in:
- The "Last Updated" date at the top of this document
- Extension updates (if significant changes)

Continued use of the Extension after changes indicates acceptance of the updated policy.

## Open Source Transparency

The Extension's source code is available for review at:
- GitHub: https://github.com/jpalat/applinator

You can inspect the code to verify our privacy claims.

## Compliance

### GDPR (General Data Protection Regulation)
Since all data is stored locally and never transmitted, the Extension does not process personal data in a way that requires GDPR compliance measures. However, we respect GDPR principles:
- **Data Minimization**: We only store what you provide
- **Purpose Limitation**: Data used only for autofilling forms
- **User Control**: Full control over your data
- **Transparency**: This privacy policy explains everything

### CCPA (California Consumer Privacy Act)
The Extension does not "sell" personal information (as defined by CCPA). We do not collect, share, or monetize user data in any way.

## Contact

For privacy-related questions or concerns:
- 📧 Open an issue on GitHub: https://github.com/jpalat/applinator/issues
- 🔒 Include "Privacy" in the issue title

## Summary (TL;DR)

✅ **Your data stays on your device** - never sent anywhere
✅ **No tracking** - we don't know who you are or what you do
✅ **No third parties** - no analytics, no ads, no data sharing
✅ **Full control** - edit or delete your data anytime
✅ **Open source** - code is available for inspection

---

**Your privacy is our priority. If you have any questions about how we handle your data, please don't hesitate to reach out.**
