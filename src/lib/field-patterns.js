/**
 * Field Patterns Dictionary
 * Comprehensive mapping of form field types to their possible identifiers
 * Used for intelligent field classification
 */

/**
 * Field classification patterns
 * Each entry contains:
 * - exact: Exact string matches (case-insensitive)
 * - patterns: Regex patterns to match
 * - type: HTML input type hints
 * - autocomplete: HTML autocomplete attribute hints
 */
const FIELD_PATTERNS = {
  // Personal Information - Name Fields
  'personalInfo.firstName': {
    exact: ['first name', 'firstname', 'given name', 'fname', 'forename'],
    patterns: [
      /^f[_.-]?name$/i,
      /^name[_.-]?first$/i,
      /^first$/i,
      /given.*name/i
    ],
    autocomplete: ['given-name'],
    priority: 10
  },

  'personalInfo.middleName': {
    exact: ['middle name', 'middlename', 'middle initial', 'mname'],
    patterns: [
      /^m[_.-]?name$/i,
      /^name[_.-]?middle$/i,
      /middle.*name/i,
      /^middle$/i
    ],
    autocomplete: ['additional-name'],
    priority: 8
  },

  'personalInfo.lastName': {
    exact: ['last name', 'lastname', 'surname', 'family name', 'lname'],
    patterns: [
      /^l[_.-]?name$/i,
      /^name[_.-]?last$/i,
      /^last$/i,
      /family.*name/i,
      /surname/i
    ],
    autocomplete: ['family-name'],
    priority: 10
  },

  'personalInfo.fullName': {
    exact: ['full name', 'fullname', 'name', 'your name', 'applicant name'],
    patterns: [
      /^name$/i,
      /^full[_.-]?name$/i,
      /applicant.*name/i,
      /candidate.*name/i
    ],
    autocomplete: ['name'],
    priority: 9
  },

  // Personal Information - Contact Fields
  'personalInfo.email': {
    exact: ['email', 'e-mail', 'email address', 'e-mail address'],
    patterns: [
      /^email/i,
      /e-?mail/i,
      /mail.*address/i,
      /^mail$/i
    ],
    type: ['email'],
    autocomplete: ['email'],
    priority: 10
  },

  'personalInfo.phone': {
    exact: ['phone', 'phone number', 'telephone', 'tel', 'mobile', 'cell', 'contact number'],
    patterns: [
      /^phone/i,
      /^tel/i,
      /telephone/i,
      /mobile/i,
      /cell/i,
      /contact.*number/i,
      /phone.*number/i
    ],
    type: ['tel'],
    autocomplete: ['tel', 'tel-national'],
    priority: 10
  },

  'personalInfo.alternatePhone': {
    exact: ['alternate phone', 'secondary phone', 'other phone', 'additional phone'],
    patterns: [
      /alt.*phone/i,
      /secondary.*phone/i,
      /alternate.*phone/i,
      /other.*phone/i,
      /phone.*2/i
    ],
    type: ['tel'],
    priority: 5
  },

  // Personal Information - Address Fields
  'personalInfo.address.street': {
    exact: ['street address', 'address', 'street', 'address line 1', 'address1'],
    patterns: [
      /^address$/i,
      /street.*address/i,
      /^street$/i,
      /address.*1/i,
      /address.*line.*1/i
    ],
    autocomplete: ['address-line1', 'street-address'],
    priority: 9
  },

  'personalInfo.address.street2': {
    exact: ['address line 2', 'address2', 'apt', 'apartment', 'suite', 'unit'],
    patterns: [
      /address.*2/i,
      /address.*line.*2/i,
      /apt/i,
      /apartment/i,
      /suite/i,
      /unit/i
    ],
    autocomplete: ['address-line2'],
    priority: 7
  },

  'personalInfo.city': {
    exact: ['city', 'town'],
    patterns: [
      /^city$/i,
      /^town$/i
    ],
    autocomplete: ['address-level2'],
    priority: 10
  },

  'personalInfo.state': {
    exact: ['state', 'province', 'region', 'state/province'],
    patterns: [
      /^state$/i,
      /province/i,
      /region/i,
      /state.*province/i
    ],
    autocomplete: ['address-level1'],
    priority: 10
  },

  'personalInfo.zipCode': {
    exact: ['zip', 'zip code', 'postal code', 'postcode'],
    patterns: [
      /^zip/i,
      /postal.*code/i,
      /post.*code/i,
      /^postcode$/i
    ],
    autocomplete: ['postal-code'],
    priority: 10
  },

  'personalInfo.country': {
    exact: ['country'],
    patterns: [
      /^country$/i
    ],
    autocomplete: ['country', 'country-name'],
    priority: 9
  },

  // Personal Information - Social/Web
  'personalInfo.linkedin': {
    exact: ['linkedin', 'linkedin url', 'linkedin profile'],
    patterns: [
      /linkedin/i,
      /linked.*in/i
    ],
    autocomplete: ['url'],
    priority: 8
  },

  'personalInfo.website': {
    exact: ['website', 'personal website', 'portfolio', 'portfolio url'],
    patterns: [
      /^website$/i,
      /personal.*website/i,
      /portfolio/i,
      /^url$/i,
      /web.*site/i
    ],
    type: ['url'],
    autocomplete: ['url'],
    priority: 7
  },

  'personalInfo.github': {
    exact: ['github', 'github url', 'github profile'],
    patterns: [
      /github/i,
      /git.*hub/i
    ],
    type: ['url'],
    priority: 6
  },

  // Work Experience Fields
  'workExperience.company': {
    exact: ['company', 'employer', 'organization', 'company name', 'employer name'],
    patterns: [
      /^company$/i,
      /employer/i,
      /organization/i,
      /company.*name/i,
      /employer.*name/i,
      /org.*name/i
    ],
    autocomplete: ['organization'],
    priority: 10
  },

  'workExperience.position': {
    exact: ['position', 'job title', 'title', 'role', 'job role'],
    patterns: [
      /^position$/i,
      /job.*title/i,
      /^title$/i,
      /^role$/i,
      /job.*role/i,
      /position.*title/i
    ],
    autocomplete: ['organization-title'],
    priority: 10
  },

  'workExperience.startDate': {
    exact: ['start date', 'from date', 'begin date', 'employment start'],
    patterns: [
      /start.*date/i,
      /from.*date/i,
      /begin.*date/i,
      /date.*from/i,
      /employment.*start/i,
      /^from$/i
    ],
    type: ['date', 'month'],
    priority: 9
  },

  'workExperience.endDate': {
    exact: ['end date', 'to date', 'until', 'employment end'],
    patterns: [
      /end.*date/i,
      /to.*date/i,
      /until/i,
      /date.*to/i,
      /employment.*end/i,
      /^to$/i
    ],
    type: ['date', 'month'],
    priority: 9
  },

  'workExperience.current': {
    exact: ['current', 'currently working', 'present', 'currently employed'],
    patterns: [
      /current/i,
      /present/i,
      /currently.*working/i,
      /still.*working/i,
      /currently.*employed/i
    ],
    type: ['checkbox'],
    priority: 8
  },

  'workExperience.location': {
    exact: ['location', 'job location', 'work location', 'city'],
    patterns: [
      /^location$/i,
      /job.*location/i,
      /work.*location/i,
      /employment.*location/i
    ],
    priority: 7
  },

  'workExperience.description': {
    exact: ['job description', 'responsibilities', 'duties', 'description', 'job duties'],
    patterns: [
      /job.*description/i,
      /responsibilities/i,
      /duties/i,
      /^description$/i,
      /job.*duties/i,
      /role.*description/i
    ],
    priority: 8
  },

  // Education Fields
  'education.school': {
    exact: ['school', 'university', 'college', 'institution', 'school name'],
    patterns: [
      /^school$/i,
      /university/i,
      /college/i,
      /institution/i,
      /school.*name/i,
      /educational.*institution/i
    ],
    priority: 10
  },

  'education.degree': {
    exact: ['degree', 'degree type', 'qualification', 'diploma'],
    patterns: [
      /^degree$/i,
      /degree.*type/i,
      /qualification/i,
      /diploma/i,
      /certificate/i
    ],
    priority: 10
  },

  'education.field': {
    exact: ['field of study', 'major', 'field', 'area of study', 'concentration'],
    patterns: [
      /field.*of.*study/i,
      /^major$/i,
      /^field$/i,
      /area.*of.*study/i,
      /concentration/i,
      /specialization/i
    ],
    priority: 9
  },

  'education.graduationDate': {
    exact: ['graduation date', 'completion date', 'end date', 'date graduated'],
    patterns: [
      /graduation.*date/i,
      /graduated/i,
      /completion.*date/i,
      /date.*graduated/i,
      /end.*date/i
    ],
    type: ['date', 'month'],
    priority: 9
  },

  'education.gpa': {
    exact: ['gpa', 'grade point average', 'grades'],
    patterns: [
      /^gpa$/i,
      /grade.*point/i,
      /g\.p\.a/i
    ],
    type: ['number', 'text'],
    priority: 7
  },

  // Skills Fields
  'skills.technical': {
    exact: ['skills', 'technical skills', 'technologies', 'competencies'],
    patterns: [
      /^skills$/i,
      /technical.*skills/i,
      /technologies/i,
      /competencies/i,
      /core.*skills/i
    ],
    priority: 8
  },

  'skills.summary': {
    exact: ['summary', 'professional summary', 'objective', 'about'],
    patterns: [
      /^summary$/i,
      /professional.*summary/i,
      /^objective$/i,
      /career.*objective/i,
      /^about$/i,
      /about.*you/i
    ],
    priority: 7
  },

  // Custom/EEO Fields
  'custom.gender': {
    exact: ['gender', 'sex'],
    patterns: [
      /^gender$/i,
      /^sex$/i
    ],
    priority: 5
  },

  'custom.ethnicity': {
    exact: ['ethnicity', 'race', 'ethnic background'],
    patterns: [
      /ethnicity/i,
      /^race$/i,
      /ethnic/i
    ],
    priority: 5
  },

  'custom.veteranStatus': {
    exact: ['veteran status', 'veteran', 'military service'],
    patterns: [
      /veteran/i,
      /military.*service/i
    ],
    priority: 5
  },

  'custom.disabilityStatus': {
    exact: ['disability status', 'disability', 'disabled'],
    patterns: [
      /disability/i,
      /disabled/i
    ],
    priority: 5
  },

  'custom.workAuthorization': {
    exact: ['work authorization', 'authorized to work', 'work permit', 'visa status'],
    patterns: [
      /work.*authorization/i,
      /authorized.*to.*work/i,
      /work.*permit/i,
      /visa.*status/i,
      /employment.*authorization/i
    ],
    priority: 7
  },

  'custom.sponsorship': {
    exact: ['sponsorship', 'require sponsorship', 'visa sponsorship'],
    patterns: [
      /sponsorship/i,
      /require.*sponsorship/i,
      /visa.*sponsorship/i,
      /sponsor/i
    ],
    priority: 7
  },

  'custom.willingToRelocate': {
    exact: ['willing to relocate', 'relocate', 'relocation'],
    patterns: [
      /willing.*to.*relocate/i,
      /^relocate$/i,
      /relocation/i,
      /willing.*relocate/i
    ],
    type: ['checkbox'],
    priority: 6
  },

  'custom.salaryExpectation': {
    exact: ['salary expectation', 'desired salary', 'expected salary', 'salary requirements'],
    patterns: [
      /salary.*expectation/i,
      /desired.*salary/i,
      /expected.*salary/i,
      /salary.*requirements/i,
      /compensation.*expectation/i
    ],
    type: ['number', 'text'],
    priority: 6
  },

  'custom.startDate': {
    exact: ['start date', 'available start date', 'availability', 'when can you start'],
    patterns: [
      /available.*start/i,
      /availability/i,
      /when.*can.*you.*start/i,
      /start.*date/i,
      /earliest.*start/i
    ],
    type: ['date'],
    priority: 6
  },

  // Resume/Cover Letter Upload
  'documents.resume': {
    exact: ['resume', 'cv', 'curriculum vitae', 'upload resume'],
    patterns: [
      /resume/i,
      /^cv$/i,
      /curriculum.*vitae/i,
      /upload.*resume/i
    ],
    type: ['file'],
    priority: 9
  },

  'documents.coverLetter': {
    exact: ['cover letter', 'coverletter', 'letter'],
    patterns: [
      /cover.*letter/i,
      /^letter$/i
    ],
    type: ['file'],
    priority: 7
  },

  // How did you hear about us
  'custom.referralSource': {
    exact: ['how did you hear about us', 'referral source', 'source', 'how did you find us'],
    patterns: [
      /how.*did.*you.*hear/i,
      /referral.*source/i,
      /how.*did.*you.*find/i,
      /heard.*about.*us/i
    ],
    priority: 5
  }
};

/**
 * Get all field patterns
 * @returns {Object} Field patterns dictionary
 */
function getFieldPatterns() {
  return FIELD_PATTERNS;
}

/**
 * Get pattern for specific field type
 * @param {string} fieldType - Field type key (e.g., 'personalInfo.firstName')
 * @returns {Object|null} Pattern object or null if not found
 */
function getPatternForField(fieldType) {
  return FIELD_PATTERNS[fieldType] || null;
}

/**
 * Get all field types (categories)
 * @returns {Array<string>} Array of field type keys
 */
function getAllFieldTypes() {
  return Object.keys(FIELD_PATTERNS);
}

/**
 * Get field types by category
 * @param {string} category - Category (e.g., 'personalInfo', 'workExperience')
 * @returns {Array<string>} Array of field type keys in that category
 */
function getFieldTypesByCategory(category) {
  return Object.keys(FIELD_PATTERNS).filter(key => key.startsWith(category + '.'));
}

module.exports = {
  FIELD_PATTERNS,
  getFieldPatterns,
  getPatternForField,
  getAllFieldTypes,
  getFieldTypesByCategory
};
