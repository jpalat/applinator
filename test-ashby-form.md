# Test: Ashby Job Application Form

## Form Details
**Company:** adaption (Adaptable Labs)
**Position:** Machine Learning Engineer (Applied ML)
**Form Platform:** Ashby (React-based)

## Expected Form Fields

Based on the form definition in the HTML, this application should have these fields:

### Required Fields:
1. **Name** (String) - System field
2. **Email** (Email) - System field, connected to candidate.primary_personal_email_address
3. **Location** (Location) - City, Region, Country
4. **Resume** (File) - File upload
5. **Degree Completion** (Boolean) - "Have you completed your degree, and are you available to begin full-time employment immediately?"
6. **LinkedIn** (URL) - Required
7. **Video Introduction** (Long Text) - Link to video introduction

### Optional Fields:
8. **Phone Number** (Phone) - Connected to candidate.primary_personal_phone_number
9. **Personal Website** (URL)
10. **X/Twitter** (URL)
11. **Github** (URL)
12. **Prior Work Link** (Long Text) - Links to repos, papers, or products

## Testing Steps

### 1. Open in Browser
```bash
# Get the full file path
echo "file://$(pwd)/example/application.html"
```

### 2. Load Extension
- Ensure Job Autofill extension is loaded in Chrome
- Navigate to the file URL above

### 3. Expected Behavior
- Extension should detect the form once JavaScript renders it
- Form type should be identified as "job application"
- Should detect ~12 fillable fields
- May show "(in iframe)" if form is in an iframe (Ashby sometimes uses iframes)

### 4. Test Field Classification
The extension should classify these fields:

| Field | Should Match Pattern | Confidence |
|-------|---------------------|------------|
| Name | personalInfo.fullName or firstName/lastName | High (95%+) |
| Email | personalInfo.email | High (95%+) |
| Phone | personalInfo.phone | High (95%+) |
| Location/City | personalInfo.city | High (95%+) |
| LinkedIn | personalInfo.linkedIn | High (95%+) |
| Website | personalInfo.portfolio | Medium (70%+) |
| Github | custom field or URL | Medium (70%+) |
| Twitter/X | custom field or URL | Medium (70%+) |

### 5. Fields That Won't Auto-Fill
- **Resume** (File) - Extension doesn't fill file upload fields
- **Degree Completion** (Boolean) - May not have profile data for this
- **Video Introduction** (Long text) - Requires manual entry
- **Prior Work Link** (Long text) - Requires manual entry

### 6. Test Fill Operation
1. Set up profile with:
   - First/Last Name
   - Email
   - Phone
   - City, State
   - LinkedIn URL
   - Portfolio/Website URL

2. Click "Fill Form"
3. Verify which fields get filled
4. Document any issues or missing patterns

## Known Limitations

### React Form Challenges:
- Forms rendered by JavaScript may take time to load
- Extension needs to detect forms after React rendering completes
- MutationObserver should catch dynamically added forms

### Ashby-Specific:
- May use custom field names not in standard patterns
- Some fields might be in iframes
- Boolean checkboxes may have non-standard implementations
- File uploads are never auto-filled (by design)

## Success Criteria

✅ **Pass if:**
- Extension detects the form (shows "Found X fillable fields")
- At least 6 of the 12 fields are classified correctly
- Name, Email, Phone, LinkedIn fields fill correctly
- No JavaScript errors in console

⚠️ **Acceptable Partial Success:**
- Some custom fields (Github, Twitter, Prior Work) not classified
- Boolean field not filled (may not be in patterns)
- Location field partially filled (city but not full address)

❌ **Fail if:**
- Form not detected at all
- JavaScript errors prevent form rendering
- Basic fields (Name, Email) not filled
- Extension crashes or freezes

## Field Pattern Recommendations

If fields are not detected, consider adding these patterns to field-patterns.js:

```javascript
// For Github
'personalInfo.github': {
  exact: ['github', 'github url', 'github profile'],
  patterns: [/^github$/i, /github[\s_-]?(url|link|profile)?/i],
  autocomplete: ['url'],
  type: ['url', 'text'],
  priority: 8
}

// For Twitter/X
'personalInfo.twitter': {
  exact: ['twitter', 'x/twitter', 'twitter handle'],
  patterns: [/^(twitter|x)$/i, /(twitter|x)[\s_-]?(handle|profile)?/i],
  autocomplete: ['url'],
  type: ['url', 'text'],
  priority: 8
}
```

