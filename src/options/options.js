/**
 * Options Page Script
 * Handles profile management and configuration
 */

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

  // Attach event listeners
  tabs.forEach(tab => tab.addEventListener('click', switchTab));
  saveButton.addEventListener('click', saveProfile);
  clearButton.addEventListener('click', confirmClearProfile);
  addWorkButton.addEventListener('click', addWorkEntry);
  addEducationButton.addEventListener('click', addEducationEntry);

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

console.log('Options script loaded');
