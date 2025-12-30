/**
 * Resume Parser
 * Extracts structured data from PDF resumes using pdf.js
 */

const pdfjsLib = require('pdfjs-dist');

// Set worker path for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('pdf.worker.min.mjs');

/**
 * Extract text from PDF file
 * @param {Object} fileData - File data object with arrayBuffer, name, and type
 * @returns {Promise<string>} Extracted text from all pages
 */
async function extractTextFromPDF(fileData) {
  try {
    // Get ArrayBuffer from fileData
    const arrayBuffer = fileData.arrayBuffer;

    // Load PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

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

/**
 * Parse resume from PDF file
 * @param {Object} fileData - File data object with arrayBuffer, name, and type
 * @returns {Promise<Object>} Parsed profile data
 */
async function parseResume(fileData) {
  try {
    console.log('Starting resume parsing...');

    // Extract text from PDF
    const text = await extractTextFromPDF(fileData);

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

/**
 * Detect sections in resume text
 * @param {string} text - Full resume text
 * @returns {Object} Object with section texts
 */
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

/**
 * Parse contact information from text
 * @param {string} text - Resume text (preferably contact section or full text)
 * @returns {Object} Contact information
 */
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

  // City, State, Zip (look for patterns like "San Francisco, CA 94102")
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

/**
 * Parse work experience from text
 * @param {string} text - Work experience section text
 * @returns {Array} Array of work experience entries
 */
function parseWorkExperience(text) {
  if (!text) return [];

  const experiences = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Pattern to match job entries (company, position, dates)
  // Common formats:
  // "Company Name | Position | Jan 2020 - Dec 2023"
  // "Position at Company Name"
  // "Company Name"
  // "Position"
  // "Jan 2020 - Dec 2023"

  let currentEntry = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line contains dates (likely start of new entry or date line)
    const dateMatch = line.match(/(\w+\.?\s+\d{4}|\d{1,2}\/\d{4}|\d{4})\s*[-–—to]+\s*(present|\w+\.?\s+\d{4}|\d{1,2}\/\d{4}|\d{4})/i);

    if (dateMatch) {
      // Parse dates
      const dates = parseDateRange(dateMatch[0]);

      if (currentEntry) {
        // Add dates to current entry
        currentEntry.startDate = dates.start;
        currentEntry.endDate = dates.end;
        currentEntry.current = dates.current;
      } else {
        // Start new entry with just dates
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
      // Likely a formatted entry line
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
      // First line after dates might be company
      currentEntry.company = line;
    } else if (currentEntry && !currentEntry.position) {
      // Second line might be position
      currentEntry.position = line;
    } else if (currentEntry) {
      // Additional lines are description
      currentEntry.description += (currentEntry.description ? ' ' : '') + line;
    } else {
      // Start new entry with company name
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

  // Filter out incomplete entries
  return experiences.filter(exp => exp.company && exp.position);
}

/**
 * Parse education from text
 * @param {string} text - Education section text
 * @returns {Array} Array of education entries
 */
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

      // Try to extract field of study from degree line
      const fieldMatch = line.match(/in\s+(.+?)(?:\s*[-–—,]|$)/i);
      if (fieldMatch) {
        currentEntry.field = fieldMatch[1].trim();
      }
    } else if (currentEntry && !currentEntry.school) {
      // First line after degree might be school
      currentEntry.school = line;
    } else if (dateMatch && currentEntry) {
      // Extract graduation date
      const year = dateMatch[1] || dateMatch[0].match(/\d{4}/)[0];
      currentEntry.graduationDate = year + '-05'; // Default to May
    } else if (!currentEntry) {
      // Start new entry with school name
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

/**
 * Parse skills from text
 * @param {string} text - Skills section or full text
 * @returns {Object} Skills object
 */
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

  // Extract technical skills
  const lowerText = text.toLowerCase();

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

/**
 * Parse date range from string
 * @param {string} dateStr - Date range string (e.g., "Jan 2020 - Dec 2023")
 * @returns {Object} Object with start, end, and current flag
 */
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

/**
 * Parse single date to YYYY-MM format
 * @param {string} dateStr - Date string
 * @returns {string} Date in YYYY-MM format
 */
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

// Export functions
module.exports = {
  parseResume,
  extractTextFromPDF,
  detectSections,
  parseContactInfo,
  parseWorkExperience,
  parseEducation,
  parseSkills
};
