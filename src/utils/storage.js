// Local Storage Management for Kafaat Platform
// This handles all data persistence

const STORAGE_KEYS = {
  ASSESSMENTS: 'kafaat-assessments',
  RESPONSES: 'kafaat-responses',
  REPORTS: 'kafaat-reports',
  USERS: 'kafaat-users',
  ADMIN: 'kafaat-admin'
};

// Generate unique ID
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Generate short assessment link code
export const generateLinkCode = () => {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
};

// Get all assessments
export const getAssessments = () => {
  const data = localStorage.getItem(STORAGE_KEYS.ASSESSMENTS);
  return data ? JSON.parse(data) : [];
};

// Save assessment
export const saveAssessment = (assessment) => {
  const assessments = getAssessments();
  const existingIndex = assessments.findIndex(a => a.id === assessment.id);
  
  if (existingIndex >= 0) {
    assessments[existingIndex] = assessment;
  } else {
    assessments.push(assessment);
  }
  
  localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(assessments));
  return assessment;
};

// Create new Kafaat Assessment
export const createKafaatAssessment = (data) => {
  const assessment = {
    id: generateId(),
    type: 'kafaat',
    linkCode: generateLinkCode(),
    applicantName: data.applicantName,
    applicantEmail: data.applicantEmail,
    department: data.department,
    position: data.position,
    createdAt: new Date().toISOString(),
    status: 'pending',
    responses: [],
    completedAt: null,
    report: null
  };
  
  return saveAssessment(assessment);
};

// Create new 360 Assessment
export const create360Assessment = (data) => {
  const assessment = {
    id: generateId(),
    type: '360',
    managerName: data.managerName,
    managerEmail: data.managerEmail,
    department: data.department,
    position: data.position,
    createdAt: new Date().toISOString(),
    status: 'pending',
    evaluators: data.evaluators.map(e => ({
      id: generateId(),
      linkCode: generateLinkCode(),
      name: e.name,
      email: e.email,
      relationship: e.relationship,
      status: 'pending',
      responses: [],
      completedAt: null
    })),
    report: null
  };
  
  return saveAssessment(assessment);
};

// Get assessment by ID
export const getAssessmentById = (id) => {
  const assessments = getAssessments();
  return assessments.find(a => a.id === id);
};

// Get assessment by link code
export const getAssessmentByLinkCode = (code) => {
  const assessments = getAssessments();
  
  // Check Kafaat assessments
  const kafaat = assessments.find(a => a.type === 'kafaat' && a.linkCode === code);
  if (kafaat) return { type: 'kafaat', assessment: kafaat };
  
  // Check 360 evaluators
  for (const assessment of assessments) {
    if (assessment.type === '360') {
      const evaluator = assessment.evaluators?.find(e => e.linkCode === code);
      if (evaluator) {
        return { type: '360', assessment, evaluator };
      }
    }
  }
  
  return null;
};

// Update assessment status
export const updateAssessmentStatus = (id, status) => {
  const assessment = getAssessmentById(id);
  if (assessment) {
    assessment.status = status;
    saveAssessment(assessment);
  }
  return assessment;
};

// Save Kafaat responses
export const saveKafaatResponses = (assessmentId, responses) => {
  const assessment = getAssessmentById(assessmentId);
  if (assessment) {
    assessment.responses = responses;
    assessment.status = 'completed';
    assessment.completedAt = new Date().toISOString();
    saveAssessment(assessment);
  }
  return assessment;
};

// Save 360 evaluator responses
export const save360EvaluatorResponses = (assessmentId, evaluatorId, responses) => {
  const assessment = getAssessmentById(assessmentId);
  if (assessment && assessment.type === '360') {
    const evaluator = assessment.evaluators.find(e => e.id === evaluatorId);
    if (evaluator) {
      evaluator.responses = responses;
      evaluator.status = 'completed';
      evaluator.completedAt = new Date().toISOString();
      
      // Check if all evaluators completed
      const allCompleted = assessment.evaluators.every(e => e.status === 'completed');
      if (allCompleted) {
        assessment.status = 'completed';
      }
      
      saveAssessment(assessment);
    }
  }
  return assessment;
};

// Generate and save report
export const generateReport = (assessmentId, reportData) => {
  const assessment = getAssessmentById(assessmentId);
  if (assessment) {
    assessment.report = {
      ...reportData,
      generatedAt: new Date().toISOString()
    };
    saveAssessment(assessment);
  }
  return assessment;
};

// Delete assessment
export const deleteAssessment = (id) => {
  const assessments = getAssessments();
  const filtered = assessments.filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(filtered));
};

// Get all reports
export const getReports = () => {
  const assessments = getAssessments();
  return assessments
    .filter(a => a.status === 'completed' && a.report)
    .map(a => ({
      assessmentId: a.id,
      type: a.type,
      applicantName: a.applicantName || a.managerName,
      completedAt: a.completedAt,
      report: a.report
    }));
};

// Export data for backup
export const exportData = () => {
  return JSON.stringify({
    assessments: getAssessments(),
    exportedAt: new Date().toISOString()
  }, null, 2);
};

// Import data from backup
export const importData = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    if (data.assessments) {
      localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(data.assessments));
      return true;
    }
    return false;
  } catch (e) {
    console.error('Import error:', e);
    return false;
  }
};

export default {
  generateId,
  generateLinkCode,
  getAssessments,
  saveAssessment,
  createKafaatAssessment,
  create360Assessment,
  getAssessmentById,
  getAssessmentByLinkCode,
  updateAssessmentStatus,
  saveKafaatResponses,
  save360EvaluatorResponses,
  generateReport,
  deleteAssessment,
  getReports,
  exportData,
  importData
};
