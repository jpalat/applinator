# Job Autofill - Chrome Extension

**Automatically fill job application forms with your profile data.**

Job Autofill is a Chrome extension that intelligently detects and fills job application forms, saving you time and ensuring consistency across applications.

## Features

✅ **Smart Resume Parsing** - Upload your PDF resume and automatically extract your information
✅ **Intelligent Field Detection** - Classifies 100+ different field types across job applications
✅ **iframe Support** - Detects and fills forms inside iframes (common on job sites like Workday, Greenhouse)
✅ **Dynamic Work History** - Automatically fills multiple work experiences by clicking "Add Another" buttons
✅ **Profile Management** - Store and edit your profile information with an easy-to-use interface
✅ **Side Panel View** - Quick access to view your profile without opening the options page
✅ **Universal Form Support** - Works on most job application sites without site-specific configuration
✅ **Privacy First** - All data stored locally on your device, never sent to external servers

## Screenshots

> 📸 Screenshots coming soon! Extension is currently in development.

*Key features to be showcased:*
- Extension popup with form detection status
- Profile setup page with resume upload
- Form filling in action (before/after)
- Side panel profile viewer
- iframe detection indicator

## Installation

### From Chrome Web Store
1. Visit the [Chrome Web Store](#) *(link pending)*
2. Click "Add to Chrome"
3. Click "Add Extension" in the confirmation dialog

### From Source (Development)
1. Clone this repository: `git clone https://github.com/jpalat/applinator.git`
2. Run `npm install` to install dependencies
   - **Note:** Puppeteer (~300MB) is optional and only needed for E2E tests, not for building
3. Run `npm run build` to build the extension
4. Open Chrome and navigate to `chrome://extensions`
5. Enable "Developer mode" (toggle in top right)
6. Click "Load unpacked"
7. Select the `dist` folder from the project directory

## Quick Start Guide

### 1. Set Up Your Profile

**Option A: Upload Your Resume (Recommended)**
1. Click the extension icon in your browser toolbar
2. Click "Setup Profile"
3. Drag and drop your PDF resume or click "Browse Files"
4. Review the extracted data and make any corrections
5. Click "Save Profile"

**Option B: Manual Entry**
1. Click the extension icon
2. Click "Setup Profile"
3. Fill in the tabs:
   - **Personal Info**: Name, email, phone, address, LinkedIn
   - **Work Experience**: Add up to 5 positions
   - **Education**: Add up to 2 entries
   - **Skills**: Technical skills and professional summary
4. Click "Save Profile"

### 2. Fill a Job Application

1. Navigate to a job application page
2. Click the extension icon
3. If forms are detected, you'll see "Found X fillable fields"
   - If the form is in an iframe, you'll see "(in iframe)" indicator
4. Click "Fill Form"
5. Watch as the extension automatically fills your information
6. Review and adjust any fields as needed before submitting

### 3. View Your Profile (Quick Access)

1. Click the extension icon
2. Click "View Profile" button
3. Your profile opens in the side panel
4. Review your information without leaving the page

## How It Works

### Resume Parsing
The extension uses advanced text extraction to parse your PDF resume:
- **Section Detection**: Identifies Experience, Education, Skills, and Contact sections
- **Date Parsing**: Handles various date formats (Jan 2020, 01/2020, 2020, Present)
- **Smart Extraction**: Extracts emails, phone numbers, job titles, companies, and more
- **Manual Override**: You can always edit parsed data before saving

### Field Classification
The extension uses a 3-stage classification system:
1. **Exact Match** (95%+ confidence): Matches exact field labels like "First Name", "Email Address"
2. **Pattern Match** (70-85% confidence): Uses regex patterns to detect variations like "fname", "email_addr"
3. **Type Hints** (60-70% confidence): Uses HTML input types and autocomplete attributes

### iframe Support
Many job application sites embed their forms in iframes (Workday, Greenhouse, Lever). The extension:
- **Detects forms in iframes** automatically
- **Shows "(in iframe)" indicator** in the popup when forms are in an iframe
- **Fills forms seamlessly** whether they're in the main page or an iframe
- **Works with nested iframes** for complex application portals

### Dynamic Form Handling
For work experience sections with "Add Another" buttons:
1. Fills the first work experience with existing fields
2. Automatically clicks "Add Another" button
3. Waits for new fields to appear
4. Fills the new entry
5. Repeats for up to 5 work experiences

## Supported Fields

### Personal Information
- First Name, Last Name, Full Name
- Email Address
- Phone Number
- Address (City, State, ZIP Code)
- LinkedIn Profile URL
- Portfolio/Website

### Work Experience
- Company Name
- Job Title/Position
- Start Date, End Date
- Currently Working checkbox
- Location
- Job Description/Responsibilities

### Education
- School/University Name
- Degree Type
- Field of Study
- Graduation Date
- GPA

### Skills & Other
- Technical Skills (comma-separated list)
- Professional Summary
- Cover Letter
- Willing to Relocate
- Legally Authorized to Work
- Requires Sponsorship

## Tips for Best Results

### Resume Upload
- ✅ Use a well-formatted PDF resume
- ✅ Use clear section headers (EXPERIENCE, EDUCATION, SKILLS)
- ✅ Use standard date formats (Jan 2020, 01/2020)
- ✅ Include one email and one phone number in contact section
- ❌ Avoid overly complex layouts or multi-column formats
- ❌ Don't use images or graphics for text information

### Form Filling
- ✅ Review auto-filled data before submitting applications
- ✅ Keep your profile updated with latest information
- ✅ Use the extension on standard HTML forms (best compatibility)
- ✅ Works with forms inside iframes (common on job sites)
- ⚠️ Some custom form builders may require manual filling
- ⚠️ File upload fields (resume attachments) are not auto-filled
- ⚠️ Cross-origin iframes may not be accessible due to browser security

### Profile Management
- ✅ Update your profile when you gain new experience
- ✅ Tailor your professional summary for the type of jobs you're applying to
- ✅ Keep work experiences in reverse chronological order (most recent first)
- ✅ Limit work history to most recent 5 positions for best results

## Troubleshooting

### "No forms detected on this page"
- Make sure you're on a page with an actual job application form
- Try refreshing the page to reload the extension
- Some forms load dynamically - wait for them to fully load before clicking Fill Form
- If the form is in an iframe, the extension should detect it automatically
- For cross-origin iframes (different domain), the extension may not have access due to browser security

### "Please refresh the page to enable autofill"
- The extension content script wasn't loaded when the page loaded
- Simply refresh the page (F5 or Ctrl+R)
- The extension will be ready after refresh

### "Partially filled X of Y fields"
- Some fields couldn't be filled due to missing data or compatibility issues
- Review the unfilled fields and complete them manually
- This is normal - not all forms use standard field names

### Resume parsing didn't extract all information
- The extension does its best but may miss some fields
- Manually correct any incorrect or missing data in the profile editor
- Save your corrected profile for future use

### Work experience not filling correctly
- Check that your profile has work experiences with complete data
- Verify the form has "Add Another" or similar buttons for multiple entries
- Some forms limit the number of work experiences

## Privacy & Security

### Data Storage
- ✅ All data is stored **locally** on your device using Chrome's Storage API
- ✅ Your resume and profile **never leave your computer**
- ✅ No data is sent to external servers or third parties
- ✅ No analytics or tracking

### Permissions
The extension requires the following permissions:
- **storage**: To save your profile locally
- **activeTab**: To detect and fill forms on the current page
- **sidePanel**: To display your profile in the browser's side panel
- **host_permissions**: To inject the content script on all websites (including iframes)

### What We Don't Do
- ❌ Never collect or store personal data on external servers
- ❌ Never track your browsing history
- ❌ Never share data with third parties
- ❌ Never require account creation or login

## Development

### Building from Source
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Build for development (with watch mode)
npm run dev

# Run unit tests
npm run test:unit

# Run E2E tests (requires Puppeteer - optional dependency)
npm run test:e2e

# Run all tests
npm run test:all

# Lint code
npm run lint
```

**Note on E2E Tests:**
- Puppeteer (~300MB) is an optional dependency only needed for E2E tests
- Not required for building or using the extension
- Install with: `npm install` (already done above)
- See `tests/e2e/README.md` for detailed setup instructions

### Project Structure
```
applinator/
├── src/
│   ├── background/      # Background service worker
│   ├── content/         # Content scripts (form detection & filling)
│   ├── popup/           # Extension popup UI
│   ├── options/         # Options page (profile management)
│   ├── sidepanel/       # Side panel profile viewer
│   ├── lib/             # Shared libraries (patterns, utilities)
│   └── utils/           # Utility functions
├── tests/               # Unit tests
├── dist/                # Build output (gitignored)
├── manifest.json        # Extension manifest
├── CLAUDE.md            # Developer documentation
└── TESTING.md           # Testing guide
```

## Contributing

This is a personal project, but feedback and bug reports are welcome!

1. Open an issue describing the bug or feature request
2. Include browser version and steps to reproduce (for bugs)
3. Screenshots are helpful!

## Roadmap

### Completed (v1.0)
- ✅ Resume PDF parsing
- ✅ Field classification (100+ patterns)
- ✅ Dynamic work history filling
- ✅ Profile management UI
- ✅ Error handling and user feedback
- ✅ iframe support for embedded forms
- ✅ Side panel profile viewer
- ✅ Failed field tracking and retry

### Future Enhancements
- 🔮 Multiple profile support
- 🔮 LinkedIn profile import
- 🔮 Cover letter templates
- 🔮 Application history tracking
- 🔮 Browser sync for profiles
- 🔮 Additional file format support (DOCX)

## Technical Details

- **Extension Type**: Chrome Extension Manifest V3
- **Framework**: Vanilla JavaScript (no frameworks)
- **Build Tool**: Webpack 5
- **PDF Parsing**: pdf.js
- **Storage**: Chrome Storage API (local)
- **Testing**: Jest

## License

Copyright © 2025. All rights reserved.

## Support

For issues, questions, or feedback:
- 📧 Open an issue on GitHub
- 🐛 Report bugs with detailed reproduction steps
- 💡 Suggest features in the discussions

## Acknowledgments

Built with:
- [pdf.js](https://mozilla.github.io/pdf.js/) - PDF parsing
- [Chrome Extension API](https://developer.chrome.com/docs/extensions/) - Extension framework
- [Webpack](https://webpack.js.org/) - Module bundler

---

**Made with ❤️ using Claude Code**
