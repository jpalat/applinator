/**
 * Side Panel Script
 * Displays profile information for easy viewing and copying
 */

// DOM elements
let loadingState, noProfileState, profileViewState;
let personalInfoFields, workExperienceContainer, educationContainer, skillsFields;
let setupButton, refreshButton;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', init);

function init() {
  // Get DOM elements
  loadingState = document.getElementById('loading-state');
  noProfileState = document.getElementById('no-profile-state');
  profileViewState = document.getElementById('profile-view-state');

  personalInfoFields = document.getElementById('personal-info-fields');
  workExperienceContainer = document.getElementById('work-experience-container');
  educationContainer = document.getElementById('education-container');
  skillsFields = document.getElementById('skills-fields');

  setupButton = document.getElementById('setup-button');
  refreshButton = document.getElementById('refresh-button');

  // Attach event listeners
  setupButton.addEventListener('click', openOptions);
  refreshButton.addEventListener('click', loadProfile);
  profileViewState.addEventListener('click', handleCopyClick);

  // Attach tab navigation listeners
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Attach accordion listeners (using event delegation)
  workExperienceContainer.addEventListener('click', handleAccordionClick);
  educationContainer.addEventListener('click', handleAccordionClick);

  // Load profile
  loadProfile();
}

/**
 * Load and display profile
 */
async function loadProfile() {
  try {
    // Show loading state
    showLoadingState();

    // Get profile data
    const response = await chrome.runtime.sendMessage({ type: 'GET_PROFILE' });

    if (!response.success || !response.profile) {
      showNoProfileState();
      return;
    }

    const profile = response.profile;

    // Populate all sections
    populatePersonalInfo(profile.personalInfo || {});
    populateWorkExperience(profile.workExperience || []);
    populateEducation(profile.education || []);
    populateSkills(profile.skills || {});

    // Show profile view
    showProfileViewState();
  } catch (error) {
    console.error('Error loading profile:', error);
    showNoProfileState();
  }
}

/**
 * Show loading state
 */
function showLoadingState() {
  loadingState.style.display = 'flex';
  noProfileState.style.display = 'none';
  profileViewState.style.display = 'none';
}

/**
 * Show no profile state
 */
function showNoProfileState() {
  loadingState.style.display = 'none';
  noProfileState.style.display = 'flex';
  profileViewState.style.display = 'none';
}

/**
 * Show profile view state
 */
function showProfileViewState() {
  loadingState.style.display = 'none';
  noProfileState.style.display = 'none';
  profileViewState.style.display = 'block';
}

/**
 * Switch between tabs
 */
function switchTab(tabName) {
  // Remove active class from all tabs and panels
  const allTabButtons = document.querySelectorAll('.tab-btn');
  const allTabPanels = document.querySelectorAll('.tab-panel');

  allTabButtons.forEach(btn => btn.classList.remove('active'));
  allTabPanels.forEach(panel => panel.classList.remove('active'));

  // Add active class to selected tab and panel
  const selectedButton = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
  const selectedPanel = document.getElementById(`${tabName}-panel`);

  if (selectedButton && selectedPanel) {
    selectedButton.classList.add('active');
    selectedPanel.classList.add('active');
  }
}

/**
 * Handle accordion clicks
 */
function handleAccordionClick(e) {
  const accordionHeader = e.target.closest('.accordion-header');
  if (!accordionHeader) return;

  const accordionEntry = accordionHeader.closest('.accordion-entry');
  if (!accordionEntry) return;

  accordionEntry.classList.toggle('open');
}

/**
 * Populate personal info section
 */
function populatePersonalInfo(personalInfo) {
  const fields = [
    { label: 'First Name', value: personalInfo.firstName },
    { label: 'Last Name', value: personalInfo.lastName },
    { label: 'Email', value: personalInfo.email },
    { label: 'Phone', value: personalInfo.phone },
    { label: 'City', value: personalInfo.city },
    { label: 'State', value: personalInfo.state },
    { label: 'ZIP Code', value: personalInfo.zipCode },
    { label: 'LinkedIn', value: personalInfo.linkedin }
  ];

  personalInfoFields.innerHTML = fields
    .filter(f => f.value)
    .map(f => createFieldRow(f.label, f.value))
    .join('');
}

/**
 * Populate work experience section
 */
function populateWorkExperience(workExperience) {
  if (workExperience.length === 0) {
    workExperienceContainer.innerHTML = '<p class="empty-message">No work experience added</p>';
    return;
  }

  workExperienceContainer.innerHTML = workExperience.map((work, index) => {
    const title = work.position || 'Position';
    const company = work.company || 'Company';
    const dateRange = `${work.startDate || ''} - ${work.current ? 'Present' : work.endDate || ''}`.trim();

    return `
      <div class="accordion-entry">
        <button class="accordion-header" type="button">
          <div class="accordion-header-content">
            <div class="accordion-title">${escapeHtml(title)}</div>
            <div class="accordion-subtitle">${escapeHtml(company)}${dateRange ? ' • ' + escapeHtml(dateRange) : ''}</div>
          </div>
          <svg class="accordion-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <div class="accordion-content">
          <div class="accordion-content-inner">
            ${createFieldRow('Company', work.company)}
            ${createFieldRow('Position', work.position)}
            ${createFieldRow('Start Date', work.startDate)}
            ${createFieldRow('End Date', work.current ? 'Present' : work.endDate)}
            ${createFieldRow('Location', work.location)}
            ${createFieldRow('Description', work.description)}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Populate education section
 */
function populateEducation(education) {
  if (education.length === 0) {
    educationContainer.innerHTML = '<p class="empty-message">No education added</p>';
    return;
  }

  educationContainer.innerHTML = education.map((edu, index) => {
    const degree = edu.degree || 'Degree';
    const school = edu.school || 'School';
    const gradDate = edu.graduationDate || '';

    return `
      <div class="accordion-entry">
        <button class="accordion-header" type="button">
          <div class="accordion-header-content">
            <div class="accordion-title">${escapeHtml(degree)}</div>
            <div class="accordion-subtitle">${escapeHtml(school)}${gradDate ? ' • ' + escapeHtml(gradDate) : ''}</div>
          </div>
          <svg class="accordion-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <div class="accordion-content">
          <div class="accordion-content-inner">
            ${createFieldRow('School', edu.school)}
            ${createFieldRow('Degree', edu.degree)}
            ${createFieldRow('Field of Study', edu.field)}
            ${createFieldRow('Graduation Date', edu.graduationDate)}
            ${createFieldRow('GPA', edu.gpa)}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Populate skills section
 */
function populateSkills(skills) {
  const fields = [
    { label: 'Technical Skills', value: Array.isArray(skills.technical) ? skills.technical.join(', ') : skills.technical },
    { label: 'Professional Summary', value: skills.summary }
  ];

  skillsFields.innerHTML = fields
    .filter(f => f.value)
    .map(f => createFieldRow(f.label, f.value))
    .join('');
}

/**
 * Create a field row with label, value, and copy button
 */
function createFieldRow(label, value) {
  if (!value) return '';

  return `
    <div class="field-row">
      <div class="field-label">${label}</div>
      <div class="field-value-container">
        <div class="field-value">${escapeHtml(value)}</div>
        <button class="copy-btn" data-value="${escapeHtml(value)}" title="Copy to clipboard">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
      </div>
    </div>
  `;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Handle copy button clicks (event delegation)
 */
function handleCopyClick(e) {
  const copyBtn = e.target.closest('.copy-btn');
  if (!copyBtn) return;

  const value = copyBtn.dataset.value;
  copyToClipboard(value, copyBtn);
}

/**
 * Copy text to clipboard with visual feedback
 */
async function copyToClipboard(text, button) {
  try {
    await navigator.clipboard.writeText(text);

    // Visual feedback - change to checkmark
    const originalHTML = button.innerHTML;
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;
    button.classList.add('copied');

    // Restore original icon after 1.5 seconds
    setTimeout(() => {
      button.innerHTML = originalHTML;
      button.classList.remove('copied');
    }, 1500);
  } catch (error) {
    console.error('Failed to copy:', error);
  }
}

/**
 * Open options page to setup profile
 */
function openOptions() {
  chrome.runtime.openOptionsPage();
}

console.log('Side panel loaded');
