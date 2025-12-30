# Chrome Web Store Listing

## Extension Details

**Name**: Job Autofill

**Short Description** (132 characters max):
Automatically fill job application forms with your profile. Upload your resume and save hours on applications.

**Category**: Productivity

**Language**: English (United States)

## Detailed Description (16,000 characters max)

Save time and reduce errors when applying to jobs! Job Autofill intelligently detects and fills job application forms with your information.

### KEY FEATURES

✅ Smart Resume Parsing
Upload your PDF resume and let our intelligent parser extract your information automatically. Supports standard resume formats with Experience, Education, Skills, and Contact sections.

✅ Intelligent Field Detection
Advanced classification system recognizes 100+ different field types across job application forms. Works with most career sites without requiring site-specific configuration.

✅ Dynamic Work History
Automatically fills multiple work experiences by detecting and clicking "Add Another" buttons. Saves you from repetitive data entry for each position.

✅ Easy Profile Management
Store and edit your profile with our user-friendly interface. Update your information once and use it across all applications.

✅ Privacy First
All data is stored locally on your device. Your resume and profile information never leave your computer. No external servers, no tracking, complete privacy.

### HOW IT WORKS

1. SET UP YOUR PROFILE
   - Upload your PDF resume for automatic extraction, OR
   - Manually enter your information
   - Review and edit the extracted data
   - Save your profile

2. FILL JOB APPLICATIONS
   - Navigate to any job application page
   - Click the extension icon
   - Click "Fill Form" button
   - Watch your information populate automatically
   - Review and submit!

### WHAT IT FILLS

Personal Information:
- Name (first, last, full)
- Email address
- Phone number
- Address (city, state, ZIP)
- LinkedIn profile
- Portfolio/website

Work Experience:
- Company names
- Job titles
- Employment dates
- Current position checkbox
- Locations
- Job descriptions

Education:
- School/university names
- Degree types
- Fields of study
- Graduation dates
- GPA

Skills & More:
- Technical skills lists
- Professional summary
- Cover letter text
- Yes/no questions (relocate, authorization, etc.)

### PRIVACY & SECURITY

🔒 100% Local Storage - All data stays on your device
🔒 No External Servers - We don't have servers to be hacked
🔒 No Tracking - Zero analytics or data collection
🔒 No Account Required - No login, no registration
🔒 Open Source - Code available for inspection

### TIPS FOR BEST RESULTS

✓ Use well-formatted PDF resumes
✓ Keep your profile updated
✓ Review auto-filled data before submitting
✓ Works best on standard HTML forms

### COMPATIBILITY

✓ Works on most job application sites
✓ Supports Chrome and Edge browsers
✓ Compatible with Manifest V3

### TECHNICAL DETAILS

- Vanilla JavaScript (no frameworks)
- Advanced regex-based field classification
- 3-stage matching algorithm (exact, pattern, type hints)
- Intelligent date parsing (handles various formats)
- Resume parsing powered by pdf.js
- Throttled DOM observation for performance

### SUPPORT

Questions or issues?
- GitHub: https://github.com/jpalat/applinator
- Report bugs with detailed steps to reproduce
- Feature suggestions welcome!

---

Stop wasting hours filling the same information over and over. Download Job Autofill today and streamline your job search!

## Graphics Requirements

### Icon
- **16x16**: dist/icons/icon-16.png
- **48x48**: dist/icons/icon-48.png
- **128x128**: dist/icons/icon-128.png

### Screenshots (1280x800 or 640x400 recommended)
1. **Profile Setup**: Options page with resume upload
2. **Form Detection**: Popup showing detected fields
3. **Form Filling**: Animated GIF/screenshot of fields being filled
4. **Success State**: Completed form with success message
5. **Work Experience**: Multiple work entries being filled

### Promotional Images
- **Marquee** (1400x560): Feature graphic for store listing
- **Small Tile** (440x280): Used in search results and category pages

## Store Listing Copy

### Tagline
"Autofill job applications in seconds, not minutes"

### Features List (Bullet Points)
- 🚀 Upload resume to auto-extract information
- 🎯 Intelligent detection of 100+ field types
- 📝 Fill multiple work experiences automatically
- 🔒 Privacy-first: all data stored locally
- ⚡ Works on most job application sites
- ✨ Clean, user-friendly interface
- 🔄 Easy profile updates and editing
- 🎁 Completely free, no ads, no tracking

### FAQ for Store Listing

**Q: Is my data safe?**
A: Yes! All data is stored locally on your device using Chrome's secure storage API. We don't have servers, so your data never leaves your computer.

**Q: Does it work on all job sites?**
A: It works on most job application sites that use standard HTML forms. Some custom form builders may require manual filling for certain fields.

**Q: What resume formats are supported?**
A: Currently, only PDF resumes are supported. DOCX support is planned for a future update.

**Q: Do I need to create an account?**
A: No account required! Simply install the extension and start using it immediately.

**Q: Is it free?**
A: Yes, completely free with no ads, no premium features, and no hidden costs.

**Q: Can I use it on multiple computers?**
A: Your profile is stored locally on each device. You'll need to set up your profile on each computer you use. Cloud sync may be added in a future update.

**Q: Does it fill file upload fields?**
A: No, file uploads (like resume attachments) must be done manually. The extension focuses on text form fields.

## Keywords/Tags (20 max)

job application, autofill, resume, form filler, job search, career, application assistant, productivity, automation, job hunting, cv, employment, work, hiring, recruitment, apply, profile, data entry, time saver, job tools

## Privacy Policy

Link to: https://github.com/jpalat/applinator/blob/main/PRIVACY.md

## Support/Homepage

- **Homepage**: https://github.com/jpalat/applinator
- **Support URL**: https://github.com/jpalat/applinator/issues

## Version Information

**Version**: 1.0.0
**Minimum Chrome Version**: 88 (Manifest V3 support)

## Release Notes (for initial submission)

**Version 1.0.0 - Initial Release**

Job Autofill MVP is here! This initial release includes:

✨ Features:
- PDF resume parsing with intelligent text extraction
- Profile management with easy editing
- Intelligent field classification (100+ patterns)
- Dynamic work history filling
- Support for personal info, work experience, education, and skills
- User-friendly error handling and feedback
- Loading states and progress indicators

🔒 Privacy:
- 100% local storage
- Zero data collection
- No external servers
- Open source code

📝 Supported Fields:
- Personal information (name, email, phone, address, LinkedIn)
- Work experience (up to 5 positions with automatic "Add Another" detection)
- Education (degree, school, dates, GPA)
- Skills (technical skills, professional summary)
- Custom fields (yes/no questions, cover letter)

⚡ Performance:
- Optimized form detection
- Throttled DOM observation
- Fast field classification
- Smooth animations

🐛 Known Limitations:
- PDF resumes only (DOCX coming soon)
- Some custom form builders may need manual filling
- File uploads not supported
- Single profile only (multiple profiles planned)

Please report any issues on GitHub with detailed reproduction steps. Feature suggestions welcome!

## Developer Information

**Developer Name**: Jay Palat
**Developer Email**: [Add your email]
**Developer Website**: https://github.com/jpalat

## Permissions Justification

**storage**: Required to save user profile data locally on the device. No data is sent externally.

**activeTab**: Required to detect form fields and fill them on the current tab when user clicks "Fill Form" button. Only accesses tab content when explicitly activated by the user.

**host_permissions (<all_urls>)**: Required to inject the content script that detects and fills forms on job application websites. The extension needs to work across all job sites, making wildcard permission necessary. No data collection occurs - the script only reads form structure and writes user-provided data.

## Security & Privacy Disclosure

This extension:
- ✅ Stores all data locally (Chrome Storage API)
- ✅ Does not transmit data to remote servers
- ✅ Does not use third-party analytics
- ✅ Does not serve advertisements
- ✅ Does not require user authentication
- ✅ Does not collect personally identifiable information beyond what user provides
- ✅ Is open source for transparency

## Submission Checklist

- [ ] All required icons created (16, 48, 128)
- [ ] At least 1 screenshot (max 5 recommended)
- [ ] Promotional images created
- [ ] Detailed description written (under 16,000 chars)
- [ ] Privacy policy published and linked
- [ ] Support/homepage URL provided
- [ ] Permissions justified
- [ ] Extension built and tested
- [ ] manifest.json version matches store listing
- [ ] No broken links in description
- [ ] Screenshots show actual extension UI
- [ ] Promotional images follow guidelines (no misleading content)

## Pricing

**Free** - No in-app purchases, no subscriptions

## Distribution

**Public** - Available to all users

---

## Post-Submission Checklist

After submission:
- [ ] Monitor review status
- [ ] Respond to any reviewer questions within 24 hours
- [ ] Announce launch (social media, etc.)
- [ ] Set up issue tracking for bug reports
- [ ] Plan first update based on user feedback
