/**
 * Options Page Script
 * Handles profile management and configuration
 */

// Import pdf.js for client-side PDF parsing
const pdfjsLib = require('pdfjs-dist');

// Set worker path for pdf.js (client-side, not service worker)
if (typeof pdfjsLib !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('pdf.worker.min.mjs');
}

// State
let currentProfile = null;
let workEntries = [];
let educationEntries = [];

// DOM Elements
let tabs, tabContents;
let saveButton, clearButton, saveStatus;

// Personal info fields
let firstNameInput, lastNameInput, emailInput, phoneInput;
let cityInput, stateInput, zipCodeInput, linkedinInput;

// Skills fields
let technicalSkillsInput, skillsSummaryInput;

// Entry containers
let workEntriesContainer, educationEntriesContainer;
let addWorkButton, addEducationButton;

// Templates
let workEntryTemplate, educationEntryTemplate;

// Resume upload elements
let resumeDropzone, resumeFileInput, browseButton;
let parsingStatus, parsingStatusText, parsingResult, parsingResultMessage;

// JSON upload elements
let jsonBrowseButton, jsonFileInput, showJsonPasteButton;
let jsonPasteArea, jsonInput, importJsonButton, cancelJsonButton, showSchemaButton;
let jsonSchemaExample, schemaExampleContent, copySchemaButton;
let jsonImportStatus, jsonImportStatusText, jsonImportResult, jsonImportResultMessage;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', init);

function init() {
  // Get DOM elements
  tabs = document.querySelectorAll('.tab');
  tabContents = document.querySelectorAll('.tab-content');
  saveButton = document.getElementById('save-button');
  clearButton = document.getElementById('clear-button');
  saveStatus = document.getElementById('save-status');

  // Personal info
  firstNameInput = document.getElementById('firstName');
  lastNameInput = document.getElementById('lastName');
  emailInput = document.getElementById('email');
  phoneInput = document.getElementById('phone');
  cityInput = document.getElementById('city');
  stateInput = document.getElementById('state');
  zipCodeInput = document.getElementById('zipCode');
  linkedinInput = document.getElementById('linkedin');

  // Skills
  technicalSkillsInput = document.getElementById('technical-skills');
  skillsSummaryInput = document.getElementById('skills-summary');

  // Entry containers
  workEntriesContainer = document.getElementById('work-entries');
  educationEntriesContainer = document.getElementById('education-entries');
  addWorkButton = document.getElementById('add-work-button');
  addEducationButton = document.getElementById('add-education-button');

  // Templates
  workEntryTemplate = document.getElementById('work-entry-template');
  educationEntryTemplate = document.getElementById('education-entry-template');

  // Resume upload elements
  resumeDropzone = document.getElementById('resume-dropzone');
  resumeFileInput = document.getElementById('resume-file-input');
  browseButton = document.getElementById('browse-button');
  parsingStatus = document.getElementById('resume-parsing-status');
  parsingStatusText = document.getElementById('parsing-status-text');
  parsingResult = document.getElementById('resume-parsing-result');
  parsingResultMessage = document.getElementById('parsing-result-message');

  // JSON upload elements
  jsonBrowseButton = document.getElementById('json-browse-button');
  jsonFileInput = document.getElementById('json-file-input');
  showJsonPasteButton = document.getElementById('show-json-paste-button');
  jsonPasteArea = document.getElementById('json-paste-area');
  jsonInput = document.getElementById('json-input');
  importJsonButton = document.getElementById('import-json-button');
  cancelJsonButton = document.getElementById('cancel-json-button');
  showSchemaButton = document.getElementById('show-schema-button');
  jsonSchemaExample = document.getElementById('json-schema-example');
  schemaExampleContent = document.getElementById('schema-example-content');
  copySchemaButton = document.getElementById('copy-schema-button');
  jsonImportStatus = document.getElementById('json-import-status');
  jsonImportStatusText = document.getElementById('json-import-status-text');
  jsonImportResult = document.getElementById('json-import-result');
  jsonImportResultMessage = document.getElementById('json-import-result-message');

  // Attach event listeners
  tabs.forEach(tab => tab.addEventListener('click', switchTab));
  saveButton.addEventListener('click', saveProfile);
  clearButton.addEventListener('click', confirmClearProfile);
  addWorkButton.addEventListener('click', addWorkEntry);
  addEducationButton.addEventListener('click', addEducationEntry);

  // Resume upload event listeners
  browseButton.addEventListener('click', () => resumeFileInput.click());
  resumeFileInput.addEventListener('change', handleFileSelect);
  resumeDropzone.addEventListener('dragover', handleDragOver);
  resumeDropzone.addEventListener('dragleave', handleDragLeave);
  resumeDropzone.addEventListener('drop', handleDrop);

  // JSON upload event listeners
  jsonBrowseButton.addEventListener('click', () => jsonFileInput.click());
  jsonFileInput.addEventListener('change', handleJsonFileSelect);
  showJsonPasteButton.addEventListener('click', showJsonPasteArea);
  importJsonButton.addEventListener('click', importJsonData);
  cancelJsonButton.addEventListener('click', hideJsonPasteArea);
  showSchemaButton.addEventListener('click', toggleSchemaExample);
  copySchemaButton.addEventListener('click', copySchemaToClipboard);

  // Load profile
  loadProfile();
}

function switchTab(e) {
  const targetTab = e.target.dataset.tab;

  // Update tab buttons
  tabs.forEach(tab => tab.classList.remove('active'));
  e.target.classList.add('active');

  // Update tab contents
  tabContents.forEach(content => {
    content.classList.remove('active');
    if (content.id === `${targetTab}-tab`) {
      content.classList.add('active');
    }
  });
}

async function loadProfile() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_PROFILE' });

    if (!response.success || !response.profile) {
      console.log('No profile found, using defaults');
      currentProfile = createEmptyProfile();
    } else {
      currentProfile = response.profile;
    }

    populateForm();
  } catch (error) {
    console.error('Error loading profile:', error);
    showSaveStatus('Error loading profile', false);
  }
}

function createEmptyProfile() {
  return {
    profileId: 'default',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    personalInfo: {},
    workExperience: [],
    education: [],
    skills: {
      technical: [],
      summary: ''
    }
  };
}

function populateForm() {
  const { personalInfo, workExperience, education, skills } = currentProfile;

  // Personal info
  firstNameInput.value = personalInfo.firstName || '';
  lastNameInput.value = personalInfo.lastName || '';
  emailInput.value = personalInfo.email || '';
  phoneInput.value = personalInfo.phone || '';
  cityInput.value = personalInfo.city || '';
  stateInput.value = personalInfo.state || '';
  zipCodeInput.value = personalInfo.zipCode || '';
  linkedinInput.value = personalInfo.linkedin || '';

  // Skills
  if (skills) {
    technicalSkillsInput.value = (skills.technical || []).join(', ');
    skillsSummaryInput.value = skills.summary || '';
  }

  // Work experience
  workEntriesContainer.innerHTML = '';
  workEntries = [];
  if (workExperience && workExperience.length > 0) {
    workExperience.forEach((work, index) => {
      addWorkEntry(work, index);
    });
  }

  // Education
  educationEntriesContainer.innerHTML = '';
  educationEntries = [];
  if (education && education.length > 0) {
    education.forEach((edu, index) => {
      addEducationEntry(edu, index);
    });
  }
}

function addWorkEntry(data = null, index = null) {
  const entryIndex = index !== null ? index : workEntries.length;

  // Clone template
  const template = workEntryTemplate.content.cloneNode(true);
  const entryCard = template.querySelector('.work-entry');
  entryCard.dataset.index = entryIndex;

  // Set entry number
  template.querySelector('.entry-number').textContent = entryIndex + 1;

  // Get fields
  const companyInput = template.querySelector('.work-company');
  const positionInput = template.querySelector('.work-position');
  const startDateInput = template.querySelector('.work-start-date');
  const endDateInput = template.querySelector('.work-end-date');
  const currentCheckbox = template.querySelector('.work-current');
  const locationInput = template.querySelector('.work-location');
  const descriptionInput = template.querySelector('.work-description');

  // Populate if data provided
  if (data) {
    companyInput.value = data.company || '';
    positionInput.value = data.position || '';
    startDateInput.value = data.startDate || '';
    endDateInput.value = data.endDate || '';
    currentCheckbox.checked = data.current || false;
    locationInput.value = data.location || '';
    descriptionInput.value = data.description || '';
  }

  // Handle current checkbox
  currentCheckbox.addEventListener('change', (e) => {
    endDateInput.disabled = e.target.checked;
    if (e.target.checked) {
      endDateInput.value = '';
    }
  });

  // Handle remove button
  const removeButton = template.querySelector('.btn-remove');
  removeButton.addEventListener('click', () => {
    entryCard.remove();
    workEntries[entryIndex] = null;
    updateWorkEntryNumbers();
  });

  // Append to container
  workEntriesContainer.appendChild(template);

  // Store reference
  workEntries[entryIndex] = {
    element: entryCard,
    company: companyInput,
    position: positionInput,
    startDate: startDateInput,
    endDate: endDateInput,
    current: currentCheckbox,
    location: locationInput,
    description: descriptionInput
  };
}

function addEducationEntry(data = null, index = null) {
  const entryIndex = index !== null ? index : educationEntries.length;

  // Clone template
  const template = educationEntryTemplate.content.cloneNode(true);
  const entryCard = template.querySelector('.education-entry');
  entryCard.dataset.index = entryIndex;

  // Set entry number
  template.querySelector('.entry-number').textContent = entryIndex + 1;

  // Get fields
  const schoolInput = template.querySelector('.edu-school');
  const degreeInput = template.querySelector('.edu-degree');
  const fieldInput = template.querySelector('.edu-field');
  const graduationDateInput = template.querySelector('.edu-graduation-date');
  const gpaInput = template.querySelector('.edu-gpa');

  // Populate if data provided
  if (data) {
    schoolInput.value = data.school || '';
    degreeInput.value = data.degree || '';
    fieldInput.value = data.field || '';
    graduationDateInput.value = data.graduationDate || '';
    gpaInput.value = data.gpa || '';
  }

  // Handle remove button
  const removeButton = template.querySelector('.btn-remove');
  removeButton.addEventListener('click', () => {
    entryCard.remove();
    educationEntries[entryIndex] = null;
    updateEducationEntryNumbers();
  });

  // Append to container
  educationEntriesContainer.appendChild(template);

  // Store reference
  educationEntries[entryIndex] = {
    element: entryCard,
    school: schoolInput,
    degree: degreeInput,
    field: fieldInput,
    graduationDate: graduationDateInput,
    gpa: gpaInput
  };
}

function updateWorkEntryNumbers() {
  const validEntries = workEntries.filter(e => e !== null);
  validEntries.forEach((entry, index) => {
    entry.element.querySelector('.entry-number').textContent = index + 1;
  });
}

function updateEducationEntryNumbers() {
  const validEntries = educationEntries.filter(e => e !== null);
  validEntries.forEach((entry, index) => {
    entry.element.querySelector('.entry-number').textContent = index + 1;
  });
}

async function saveProfile() {
  try {
    // Collect personal info
    const personalInfo = {
      firstName: firstNameInput.value.trim(),
      lastName: lastNameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      city: cityInput.value.trim(),
      state: stateInput.value.trim(),
      zipCode: zipCodeInput.value.trim(),
      linkedin: linkedinInput.value.trim()
    };

    // Validate required fields
    if (!personalInfo.firstName || !personalInfo.lastName || !personalInfo.email) {
      showSaveStatus('Please fill in required fields (First Name, Last Name, Email)', false);
      return;
    }

    // Collect work experience
    const workExperience = workEntries
      .filter(entry => entry !== null)
      .map(entry => ({
        company: entry.company.value.trim(),
        position: entry.position.value.trim(),
        startDate: entry.startDate.value,
        endDate: entry.current.checked ? '' : entry.endDate.value,
        current: entry.current.checked,
        location: entry.location.value.trim(),
        description: entry.description.value.trim()
      }))
      .filter(work => work.company && work.position); // Only include entries with company and position

    // Collect education
    const education = educationEntries
      .filter(entry => entry !== null)
      .map(entry => ({
        school: entry.school.value.trim(),
        degree: entry.degree.value.trim(),
        field: entry.field.value.trim(),
        graduationDate: entry.graduationDate.value,
        gpa: entry.gpa.value.trim()
      }))
      .filter(edu => edu.school && edu.degree); // Only include entries with school and degree

    // Collect skills
    const technicalSkillsText = technicalSkillsInput.value.trim();
    const technical = technicalSkillsText
      ? technicalSkillsText.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const skills = {
      technical,
      summary: skillsSummaryInput.value.trim()
    };

    // Create profile object
    const profile = {
      profileId: 'default',
      createdAt: currentProfile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      personalInfo,
      workExperience,
      education,
      skills
    };

    // Save to storage
    const response = await chrome.runtime.sendMessage({
      type: 'SAVE_PROFILE',
      profile
    });

    if (response.success) {
      currentProfile = profile;
      showSaveStatus('Profile saved successfully!', true);
    } else {
      showSaveStatus('Failed to save profile', false);
    }
  } catch (error) {
    console.error('Error saving profile:', error);
    showSaveStatus('Error: ' + error.message, false);
  }
}

function confirmClearProfile() {
  if (confirm('Are you sure you want to clear all profile data? This cannot be undone.')) {
    clearProfile();
  }
}

async function clearProfile() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'CLEAR_PROFILE' });

    if (response.success) {
      currentProfile = createEmptyProfile();
      populateForm();
      showSaveStatus('Profile cleared successfully', true);
    } else {
      showSaveStatus('Failed to clear profile', false);
    }
  } catch (error) {
    console.error('Error clearing profile:', error);
    showSaveStatus('Error: ' + error.message, false);
  }
}

function showSaveStatus(message, success) {
  saveStatus.textContent = message;
  saveStatus.className = 'save-status ' + (success ? 'success' : 'error');
  saveStatus.style.display = 'block';

  setTimeout(() => {
    saveStatus.style.display = 'none';
  }, 5000);
}

// Resume Parsing Functions (client-side PDF parsing)

async function parseResumePDF(file) {
  try {
    console.log('Starting resume parsing...');

    // Extract text from PDF
    const text = await extractTextFromPDF(file);

    if (!text || text.length < 50) {
      throw new Error('PDF appears to be empty or text extraction failed');
    }

    console.log(`Extracted ${text.length} characters from PDF`);

    // Detect sections in the resume
    const sections = detectSections(text);

    // Parse each section
    const profile = {
      personalInfo: parseContactInfo(sections.contact || text),
      workExperience: parseWorkExperience(sections.experience || ''),
      education: parseEducation(sections.education || ''),
      skills: parseSkills(sections.skills || text)
    };

    console.log('Resume parsing complete:', profile);

    return profile;
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw error;
  }
}

async function extractTextFromPDF(file) {
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Load PDF document using pdf.js
    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

    console.log(`PDF loaded: ${pdf.numPages} pages`);

    let fullText = '';

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Combine text items with spaces
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ');

      fullText += pageText + '\n\n';
    }

    return fullText.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF: ' + error.message);
  }
}

function detectSections(text) {
  const sections = {};
  const lines = text.split('\n').map(line => line.trim());

  // Section header patterns
  const sectionPatterns = {
    contact: /^(contact|personal)[\s]?(information)?$/i,
    experience: /^(work[\s]?experience|experience|employment|professional[\s]?experience)$/i,
    education: /^(education|academic)$/i,
    skills: /^(skills|technical[\s]?skills|competencies)$/i,
    certifications: /^certifications?$/i,
    summary: /^(summary|professional[\s]?summary|objective)$/i
  };

  let currentSection = null;
  let sectionContent = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!line) continue;

    // Check if line is a section header
    let matchedSection = null;
    for (const [section, pattern] of Object.entries(sectionPatterns)) {
      if (pattern.test(line)) {
        matchedSection = section;
        break;
      }
    }

    if (matchedSection) {
      // Save previous section
      if (currentSection && sectionContent.length > 0) {
        sections[currentSection] = sectionContent.join('\n');
      }

      // Start new section
      currentSection = matchedSection;
      sectionContent = [];
    } else if (currentSection) {
      sectionContent.push(line);
    }
  }

  // Save last section
  if (currentSection && sectionContent.length > 0) {
    sections[currentSection] = sectionContent.join('\n');
  }

  console.log('Detected sections:', Object.keys(sections));

  return sections;
}

function parseContactInfo(text) {
  const contactInfo = {};

  // Email pattern
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  if (emailMatch) {
    contactInfo.email = emailMatch[0];
  }

  // Phone pattern (various formats)
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) {
    contactInfo.phone = phoneMatch[0];
  }

  // LinkedIn URL
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
  if (linkedinMatch) {
    contactInfo.linkedin = 'https://' + linkedinMatch[0];
  }

  // Name (usually first line or near email)
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length > 0) {
    // Try first non-empty line as name
    const nameLine = lines[0];
    const nameParts = nameLine.split(/\s+/).filter(part =>
      part.length > 1 && /^[A-Za-z]+$/.test(part)
    );

    if (nameParts.length >= 2) {
      contactInfo.firstName = nameParts[0];
      contactInfo.lastName = nameParts[nameParts.length - 1];
    }
  }

  // City, State, Zip
  const locationMatch = text.match(/([A-Za-z\s]+),\s*([A-Z]{2})\s*(\d{5})?/);
  if (locationMatch) {
    contactInfo.city = locationMatch[1].trim();
    contactInfo.state = locationMatch[2];
    if (locationMatch[3]) {
      contactInfo.zipCode = locationMatch[3];
    }
  }

  return contactInfo;
}

function parseWorkExperience(text) {
  if (!text) return [];

  const experiences = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  let currentEntry = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line contains dates
    const dateMatch = line.match(/(\w+\.?\s+\d{4}|\d{1,2}\/\d{4}|\d{4})\s*[-–—to]+\s*(present|\w+\.?\s+\d{4}|\d{1,2}\/\d{4}|\d{4})/i);

    if (dateMatch) {
      // Parse dates
      const dates = parseDateRange(dateMatch[0]);

      if (currentEntry) {
        currentEntry.startDate = dates.start;
        currentEntry.endDate = dates.end;
        currentEntry.current = dates.current;
      } else {
        currentEntry = {
          company: '',
          position: '',
          startDate: dates.start,
          endDate: dates.end,
          current: dates.current,
          location: '',
          description: ''
        };
      }
    } else if (line.includes('|') || line.includes('–') || line.includes('—')) {
      const parts = line.split(/[|–—]/).map(p => p.trim());

      if (parts.length >= 2) {
        if (currentEntry) {
          experiences.push(currentEntry);
        }

        currentEntry = {
          company: parts[0] || '',
          position: parts[1] || '',
          startDate: '',
          endDate: '',
          current: false,
          location: parts.length > 2 ? parts[2] : '',
          description: ''
        };
      }
    } else if (currentEntry && !currentEntry.company) {
      currentEntry.company = line;
    } else if (currentEntry && !currentEntry.position) {
      currentEntry.position = line;
    } else if (currentEntry) {
      currentEntry.description += (currentEntry.description ? ' ' : '') + line;
    } else {
      if (currentEntry) {
        experiences.push(currentEntry);
      }

      currentEntry = {
        company: line,
        position: '',
        startDate: '',
        endDate: '',
        current: false,
        location: '',
        description: ''
      };
    }
  }

  // Add last entry
  if (currentEntry && (currentEntry.company || currentEntry.position)) {
    experiences.push(currentEntry);
  }

  return experiences.filter(exp => exp.company && exp.position);
}

function parseEducation(text) {
  if (!text) return [];

  const educationEntries = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  let currentEntry = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for degree patterns
    const degreeMatch = line.match(/(bachelor|master|phd|ph\.d|doctorate|associate|b\.s\.|m\.s\.|b\.a\.|m\.a\.|b\.sc|m\.sc)/i);

    // Check for date patterns
    const dateMatch = line.match(/(\d{4})\s*[-–—]\s*(\d{4}|present)/i) ||
                      line.match(/graduated?\s*:?\s*(\w+\.?\s+)?\d{4}/i) ||
                      line.match(/\d{4}/);

    if (degreeMatch) {
      if (currentEntry) {
        educationEntries.push(currentEntry);
      }

      currentEntry = {
        school: '',
        degree: line,
        field: '',
        graduationDate: '',
        gpa: ''
      };

      // Try to extract field of study
      const fieldMatch = line.match(/in\s+(.+?)(?:\s*[-–—,]|$)/i);
      if (fieldMatch) {
        currentEntry.field = fieldMatch[1].trim();
      }
    } else if (currentEntry && !currentEntry.school) {
      currentEntry.school = line;
    } else if (dateMatch && currentEntry) {
      const year = dateMatch[1] || dateMatch[0].match(/\d{4}/)[0];
      currentEntry.graduationDate = year + '-05';
    } else if (!currentEntry) {
      currentEntry = {
        school: line,
        degree: '',
        field: '',
        graduationDate: '',
        gpa: ''
      };
    }

    // Look for GPA
    const gpaMatch = line.match(/gpa:?\s*(\d+\.\d+)/i);
    if (gpaMatch && currentEntry) {
      currentEntry.gpa = gpaMatch[1];
    }
  }

  // Add last entry
  if (currentEntry && (currentEntry.school || currentEntry.degree)) {
    educationEntries.push(currentEntry);
  }

  return educationEntries.filter(edu => edu.school && edu.degree);
}

function parseSkills(text) {
  const skills = {
    technical: [],
    summary: ''
  };

  // Common technical skills keywords
  const techKeywords = [
    'javascript', 'python', 'java', 'c\\+\\+', 'c#', 'ruby', 'php', 'swift', 'kotlin',
    'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring',
    'sql', 'mongodb', 'postgresql', 'mysql', 'redis',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins',
    'git', 'agile', 'scrum', 'jira', 'rest', 'api', 'graphql',
    'html', 'css', 'typescript', 'webpack', 'babel'
  ];

  techKeywords.forEach(keyword => {
    const regex = new RegExp('\\b' + keyword + '\\b', 'i');
    const match = text.match(regex);
    if (match && !skills.technical.includes(match[0])) {
      skills.technical.push(match[0]);
    }
  });

  // Try to find summary/objective section
  const summaryMatch = text.match(/(?:summary|objective)[:\s]+(.*?)(?:\n\n|$)/is);
  if (summaryMatch) {
    skills.summary = summaryMatch[1].trim().replace(/\s+/g, ' ');
  }

  return skills;
}

function parseDateRange(dateStr) {
  const parts = dateStr.split(/[-–—to]+/i).map(p => p.trim());

  const result = {
    start: '',
    end: '',
    current: false
  };

  if (parts[0]) {
    result.start = parseDate(parts[0]);
  }

  if (parts[1]) {
    if (/present|current|now/i.test(parts[1])) {
      result.current = true;
      result.end = '';
    } else {
      result.end = parseDate(parts[1]);
    }
  }

  return result;
}

function parseDate(dateStr) {
  // Month names to numbers
  const months = {
    'jan': '01', 'january': '01',
    'feb': '02', 'february': '02',
    'mar': '03', 'march': '03',
    'apr': '04', 'april': '04',
    'may': '05',
    'jun': '06', 'june': '06',
    'jul': '07', 'july': '07',
    'aug': '08', 'august': '08',
    'sep': '09', 'sept': '09', 'september': '09',
    'oct': '10', 'october': '10',
    'nov': '11', 'november': '11',
    'dec': '12', 'december': '12'
  };

  // Format: "Jan 2020" or "January 2020"
  const monthYearMatch = dateStr.match(/(\w+)\.?\s+(\d{4})/);
  if (monthYearMatch) {
    const monthName = monthYearMatch[1].toLowerCase();
    const year = monthYearMatch[2];
    const month = months[monthName] || '01';
    return `${year}-${month}`;
  }

  // Format: "01/2020" or "1/2020"
  const numericMatch = dateStr.match(/(\d{1,2})\/(\d{4})/);
  if (numericMatch) {
    const month = numericMatch[1].padStart(2, '0');
    const year = numericMatch[2];
    return `${year}-${month}`;
  }

  // Format: Just year "2020"
  const yearMatch = dateStr.match(/\d{4}/);
  if (yearMatch) {
    return `${yearMatch[0]}-01`;
  }

  return '';
}

// Resume Upload Handlers

function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  resumeDropzone.classList.add('dragover');
}

function handleDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  resumeDropzone.classList.remove('dragover');
}

function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  resumeDropzone.classList.remove('dragover');

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    handleResumeFile(files[0]);
  }
}

function handleFileSelect(e) {
  const files = e.target.files;
  if (files.length > 0) {
    handleResumeFile(files[0]);
  }
}

async function handleResumeFile(file) {
  // Validate file type
  if (!file.type.includes('pdf')) {
    showParsingResult('Please upload a PDF file', false);
    return;
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showParsingResult('File too large. Maximum size is 5MB', false);
    return;
  }

  console.log('Processing resume file:', file.name);

  // Show parsing status
  parsingStatus.style.display = 'flex';
  parsingResult.style.display = 'none';
  parsingStatusText.textContent = 'Parsing resume...';

  try {
    // Parse PDF directly in the options page (client-side)
    // No service worker involved - avoids import() restrictions
    const parsedData = await parseResumePDF(file);

    parsingStatus.style.display = 'none';

    console.log('Resume parsed successfully:', parsedData);

    // Populate form with parsed data
    populateParsedData(parsedData);

    showParsingResult(`Resume parsed successfully! Review and save your profile.`, true);
  } catch (error) {
    console.error('Error parsing resume:', error);
    parsingStatus.style.display = 'none';
    showParsingResult('Error parsing resume: ' + error.message, false);
  }

  // Reset file input
  resumeFileInput.value = '';
}

function populateParsedData(data) {
  // Personal Info
  if (data.personalInfo) {
    const info = data.personalInfo;
    if (info.firstName) firstNameInput.value = info.firstName;
    if (info.lastName) lastNameInput.value = info.lastName;
    if (info.email) emailInput.value = info.email;
    if (info.phone) phoneInput.value = info.phone;
    if (info.city) cityInput.value = info.city;
    if (info.state) stateInput.value = info.state;
    if (info.zipCode) zipCodeInput.value = info.zipCode;
    if (info.linkedin) linkedinInput.value = info.linkedin;
  }

  // Work Experience
  if (data.workExperience && data.workExperience.length > 0) {
    // Clear existing entries
    workEntriesContainer.innerHTML = '';
    workEntries = [];

    // Add parsed entries
    data.workExperience.forEach((work, index) => {
      addWorkEntry(work, index);
    });
  }

  // Education
  if (data.education && data.education.length > 0) {
    // Clear existing entries
    educationEntriesContainer.innerHTML = '';
    educationEntries = [];

    // Add parsed entries
    data.education.forEach((edu, index) => {
      addEducationEntry(edu, index);
    });
  }

  // Skills
  if (data.skills) {
    if (data.skills.technical && data.skills.technical.length > 0) {
      technicalSkillsInput.value = data.skills.technical.join(', ');
    }
    if (data.skills.summary) {
      skillsSummaryInput.value = data.skills.summary;
    }
  }

  console.log('Form populated with parsed data');
}

function showParsingResult(message, success) {
  parsingResult.style.display = 'block';
  parsingResult.className = 'parsing-result ' + (success ? 'success' : 'error');
  parsingResultMessage.textContent = message;

  // Hide after 10 seconds
  setTimeout(() => {
    parsingResult.style.display = 'none';
  }, 10000);
}

// JSON Upload Handlers

const PROFILE_SCHEMA_EXAMPLE = {
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "(555) 123-4567",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102",
    "linkedin": "https://linkedin.com/in/johndoe"
  },
  "workExperience": [
    {
      "company": "Tech Corp",
      "position": "Senior Software Engineer",
      "startDate": "2020-01",
      "endDate": "2023-12",
      "current": false,
      "location": "San Francisco, CA",
      "description": "Led development of cloud infrastructure..."
    },
    {
      "company": "Startup Inc",
      "position": "Software Engineer",
      "startDate": "2018-06",
      "endDate": "",
      "current": true,
      "location": "Remote",
      "description": "Full-stack development..."
    }
  ],
  "education": [
    {
      "school": "University of California",
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "graduationDate": "2018-05",
      "gpa": "3.8"
    }
  ],
  "skills": {
    "technical": ["JavaScript", "Python", "React", "Node.js", "AWS", "Docker"],
    "summary": "Experienced software engineer with 5+ years in full-stack development..."
  }
};

function showJsonPasteArea() {
  jsonPasteArea.style.display = 'block';
  jsonInput.value = '';
  jsonImportResult.style.display = 'none';
  jsonSchemaExample.style.display = 'none';
}

function hideJsonPasteArea() {
  jsonPasteArea.style.display = 'none';
  jsonInput.value = '';
  jsonImportResult.style.display = 'none';
  jsonSchemaExample.style.display = 'none';
}

function toggleSchemaExample() {
  if (jsonSchemaExample.style.display === 'none') {
    schemaExampleContent.textContent = JSON.stringify(PROFILE_SCHEMA_EXAMPLE, null, 2);
    jsonSchemaExample.style.display = 'block';
  } else {
    jsonSchemaExample.style.display = 'none';
  }
}

async function copySchemaToClipboard() {
  try {
    const schemaText = JSON.stringify(PROFILE_SCHEMA_EXAMPLE, null, 2);
    await navigator.clipboard.writeText(schemaText);

    // Show feedback
    const originalText = copySchemaButton.textContent;
    copySchemaButton.textContent = 'Copied!';
    setTimeout(() => {
      copySchemaButton.textContent = originalText;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy schema:', error);
    showJsonImportResult('Failed to copy to clipboard', false);
  }
}

async function handleJsonFileSelect(e) {
  const files = e.target.files;
  if (files.length > 0) {
    await handleJsonFile(files[0]);
  }
}

async function handleJsonFile(file) {
  // Validate file type
  if (!file.name.endsWith('.json')) {
    showJsonImportResult('Please upload a JSON file', false);
    return;
  }

  // Validate file size (max 1MB)
  if (file.size > 1024 * 1024) {
    showJsonImportResult('File too large. Maximum size is 1MB', false);
    return;
  }

  console.log('Processing JSON file:', file.name);

  // Show import status
  jsonImportStatus.style.display = 'flex';
  jsonImportResult.style.display = 'none';
  jsonImportStatusText.textContent = 'Importing JSON...';

  try {
    const text = await file.text();
    const profileData = JSON.parse(text);

    // Validate and import
    await processJsonImport(profileData);

  } catch (error) {
    console.error('Error importing JSON:', error);
    jsonImportStatus.style.display = 'none';
    if (error instanceof SyntaxError) {
      showJsonImportResult('Invalid JSON format: ' + error.message, false);
    } else {
      showJsonImportResult('Error importing JSON: ' + error.message, false);
    }
  }

  // Reset file input
  jsonFileInput.value = '';
}

async function importJsonData() {
  const jsonText = jsonInput.value.trim();

  if (!jsonText) {
    showJsonImportResult('Please paste JSON data', false);
    return;
  }

  // Show import status
  jsonImportStatus.style.display = 'flex';
  jsonImportResult.style.display = 'none';
  jsonImportStatusText.textContent = 'Importing JSON...';

  try {
    const profileData = JSON.parse(jsonText);

    // Validate and import
    await processJsonImport(profileData);

  } catch (error) {
    console.error('Error importing JSON:', error);
    jsonImportStatus.style.display = 'none';
    if (error instanceof SyntaxError) {
      showJsonImportResult('Invalid JSON format: ' + error.message, false);
    } else {
      showJsonImportResult('Error importing JSON: ' + error.message, false);
    }
  }
}

async function processJsonImport(profileData) {
  // Validate the structure
  const validationError = validateProfileJson(profileData);
  if (validationError) {
    jsonImportStatus.style.display = 'none';
    showJsonImportResult('Validation error: ' + validationError, false);
    return;
  }

  // Import successful - populate the form
  jsonImportStatus.style.display = 'none';
  populateParsedData(profileData);
  showJsonImportResult('JSON imported successfully! Review and save your profile.', true);

  // Hide paste area on success
  hideJsonPasteArea();

  console.log('JSON imported successfully:', profileData);
}

function validateProfileJson(data) {
  // Check if data is an object
  if (typeof data !== 'object' || data === null) {
    return 'Profile data must be an object';
  }

  // Validate personalInfo if present
  if (data.personalInfo && typeof data.personalInfo !== 'object') {
    return 'personalInfo must be an object';
  }

  // Validate workExperience if present
  if (data.workExperience) {
    if (!Array.isArray(data.workExperience)) {
      return 'workExperience must be an array';
    }
    for (let i = 0; i < data.workExperience.length; i++) {
      const exp = data.workExperience[i];
      if (typeof exp !== 'object') {
        return `workExperience[${i}] must be an object`;
      }
    }
  }

  // Validate education if present
  if (data.education) {
    if (!Array.isArray(data.education)) {
      return 'education must be an array';
    }
    for (let i = 0; i < data.education.length; i++) {
      const edu = data.education[i];
      if (typeof edu !== 'object') {
        return `education[${i}] must be an object`;
      }
    }
  }

  // Validate skills if present
  if (data.skills) {
    if (typeof data.skills !== 'object') {
      return 'skills must be an object';
    }
    if (data.skills.technical && !Array.isArray(data.skills.technical)) {
      return 'skills.technical must be an array';
    }
  }

  return null; // No errors
}

function showJsonImportResult(message, success) {
  jsonImportResult.style.display = 'block';
  jsonImportResult.className = 'parsing-result ' + (success ? 'success' : 'error');
  jsonImportResultMessage.textContent = message;

  // Hide after 10 seconds
  setTimeout(() => {
    jsonImportResult.style.display = 'none';
  }, 10000);
}

console.log('Options script loaded');
