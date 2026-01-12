// Cloud-Based Authentication and User Management System for Kafaat Platform
// Uses Cloudflare D1 Database via API for persistent cloud storage
// Works across all browsers and sessions

const API_BASE = '/api';
const SESSION_KEY = 'kafaat-session';

// ==================== API HELPER FUNCTIONS ====================

async function apiCall(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${API_BASE}/${endpoint}`, options);
    const result = await response.json();
    
    return result;
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error: error.message || 'Network error' };
  }
}

// Get current session from localStorage (session ID only)
function getStoredSession() {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

// Store session in localStorage
function storeSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Error storing session:', error);
  }
}

// Clear session from localStorage
function clearStoredSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ==================== INITIALIZATION ====================

// Initialize auth system (checks API health)
export const initializeAuth = async () => {
  try {
    const result = await apiCall('health');
    return result.success;
  } catch {
    return false;
  }
};

// ==================== USER MANAGEMENT ====================

// Get all users from cloud database
export const getUsers = async () => {
  const result = await apiCall('users');
  return result.success ? result.users : [];
};

// Get user by ID
export const getUserById = async (userId) => {
  const result = await apiCall(`users/${userId}`);
  return result.success ? result.user : null;
};

// Get user by email
export const getUserByEmail = async (email) => {
  const users = await getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
};

// Create new user
export const createUser = async (userData) => {
  const session = getStoredSession();
  const result = await apiCall('users', 'POST', {
    ...userData,
    createdBy: session?.userId || 'system'
  });
  return result;
};

// Update user
export const updateUser = async (userId, updates) => {
  const result = await apiCall(`users/${userId}`, 'PUT', updates);
  return result;
};

// Delete user
export const deleteUser = async (userId) => {
  const result = await apiCall(`users/${userId}`, 'DELETE');
  return result;
};

// ==================== AUTHENTICATION ====================

// Login user
export const login = async (email, password, isAdminLogin = false) => {
  const result = await apiCall('auth/login', 'POST', {
    email: email.toLowerCase().trim(),
    password,
    isAdminLogin
  });
  
  if (result.success) {
    storeSession({
      id: result.session.id,
      userId: result.session.userId,
      email: result.session.email,
      role: result.session.role,
      name: result.session.name,
      isAdminLogin
    });
  }
  
  return result;
};

// Logout user
export const logout = async () => {
  const session = getStoredSession();
  if (session?.id) {
    await apiCall('auth/logout', 'POST', { sessionId: session.id });
  }
  clearStoredSession();
};

// Verify current session
export const verifySession = async () => {
  const session = getStoredSession();
  if (!session?.id) {
    return { valid: false };
  }
  
  const result = await apiCall('auth/verify', 'POST', { sessionId: session.id });
  
  if (!result.success || !result.valid) {
    clearStoredSession();
    return { valid: false };
  }
  
  return { valid: true, user: result.user, session: result.session };
};

// Get current session (synchronous - from localStorage)
export const getCurrentSession = () => {
  return getStoredSession();
};

// Get current user (async - from cloud)
export const getCurrentUser = async () => {
  const session = getStoredSession();
  if (!session?.userId) return null;
  
  const result = await apiCall(`users/${session.userId}`);
  return result.success ? result.user : null;
};

// Refresh current user data
export const refreshCurrentUser = async () => {
  return await getCurrentUser();
};

// Check if user is logged in (synchronous check, verify with verifySession for certainty)
export const isLoggedIn = () => {
  const session = getStoredSession();
  return session !== null && session.userId !== undefined;
};

// Check if current user is admin
export const isAdmin = () => {
  const session = getStoredSession();
  return session?.role === 'admin';
};

// ==================== ASSESSMENT MANAGEMENT ====================

// Assign assessment to user
export const assignAssessment = async (userId, assessmentType) => {
  const user = await getUserById(userId);
  if (!user) return { success: false, error: 'User not found' };
  
  const currentAssessments = user.assignedAssessments || [];
  if (!currentAssessments.includes(assessmentType)) {
    currentAssessments.push(assessmentType);
    return await updateUser(userId, { assignedAssessments: currentAssessments });
  }
  
  return { success: true, user };
};

// Remove assessment from user
export const removeAssessment = async (userId, assessmentType) => {
  const user = await getUserById(userId);
  if (!user) return { success: false, error: 'User not found' };
  
  const currentAssessments = (user.assignedAssessments || []).filter(a => a !== assessmentType);
  return await updateUser(userId, { assignedAssessments: currentAssessments });
};

// Check if user can access assessment
export const canAccessAssessment = async (assessmentType) => {
  const user = await getCurrentUser();
  if (!user) return false;
  if (user.role === 'admin') return true;
  
  if (!user.assignedAssessments?.includes(assessmentType)) {
    return false;
  }
  
  return await hasAvailableTokens();
};

// Check if user has completed assessment
export const hasCompletedAssessment = async (assessmentType) => {
  const user = await getCurrentUser();
  if (!user) return false;
  return (user.completedAssessments || []).includes(assessmentType);
};

// ==================== TOKEN MANAGEMENT ====================

// Check if user has available tokens
export const hasAvailableTokens = async (userId = null) => {
  const user = userId ? await getUserById(userId) : await getCurrentUser();
  if (!user) return false;
  if (user.role === 'admin') return true;
  
  const usedTokens = (user.completedAssessments || []).length;
  const totalTokens = user.tokens || 0;
  
  return totalTokens > usedTokens;
};

// Get remaining tokens
export const getRemainingTokens = async (userId = null) => {
  const user = userId ? await getUserById(userId) : await getCurrentUser();
  if (!user) return 0;
  if (user.role === 'admin') return 999;
  
  const usedTokens = (user.completedAssessments || []).length;
  const totalTokens = user.tokens || 0;
  
  return Math.max(0, totalTokens - usedTokens);
};

// Get used tokens
export const getUsedTokens = async (userId = null) => {
  const user = userId ? await getUserById(userId) : await getCurrentUser();
  if (!user) return 0;
  return (user.completedAssessments || []).length;
};

// Reset user tokens
export const resetUserTokens = async (userId) => {
  const result = await apiCall(`tokens/reset/${userId}`, 'POST');
  return result;
};

// Add tokens to user
export const addTokens = async (userId, amount) => {
  const user = await getUserById(userId);
  if (!user) return { success: false, error: 'User not found' };
  
  const newTokens = (user.tokens || 0) + amount;
  return await updateUser(userId, { tokens: newTokens });
};

// ==================== REPORT MANAGEMENT ====================

// Save assessment report
export const saveUserReport = async (userId, assessmentType, reportData) => {
  const result = await apiCall('reports', 'POST', {
    userId,
    assessmentType,
    reportData
  });
  return result;
};

// Get user reports
export const getUserReports = async (userId) => {
  const user = await getUserById(userId);
  return user?.reports || [];
};

// Get specific report
export const getReport = async (userId, reportId) => {
  const user = await getUserById(userId);
  if (!user || !user.reports) return null;
  return user.reports.find(r => r.id === reportId) || null;
};

// Get all reports (Admin only)
export const getAllReports = async () => {
  const result = await apiCall('reports');
  return result.success ? result.reports : [];
};

// ==================== STATISTICS ====================

// Get dashboard statistics
export const getDashboardStats = async () => {
  const users = await getUsers();
  const reports = await getAllReports();
  
  const nonAdminUsers = users.filter(u => u.role !== 'admin');
  
  return {
    totalUsers: nonAdminUsers.length,
    activeUsers: nonAdminUsers.filter(u => u.isActive).length,
    totalReports: reports.length,
    kafaatReports: reports.filter(r => r.assessmentType === 'kafaat').length,
    report360: reports.filter(r => r.assessmentType === '360').length,
    totalTokensUsed: users.reduce((sum, u) => sum + (u.completedAssessments?.length || 0), 0),
    totalTokensAssigned: users.reduce((sum, u) => sum + (u.tokens || 0), 0)
  };
};

// ==================== ACTIVITY LOG ====================

// Log activity (handled by API automatically)
export const logActivity = async (userId, action, details = {}) => {
  // Activity logging is handled automatically by the API
  console.log('Activity:', { userId, action, details });
};

// Get activity log
export const getActivityLog = async (limit = 50) => {
  // Activity log retrieval - would need to add API endpoint
  return [];
};

// ==================== EXPORT ====================

export default {
  // Initialization
  initializeAuth,
  
  // User Management
  getUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  
  // Authentication
  login,
  logout,
  verifySession,
  getCurrentSession,
  getCurrentUser,
  refreshCurrentUser,
  isLoggedIn,
  isAdmin,
  
  // Assessment Management
  assignAssessment,
  removeAssessment,
  canAccessAssessment,
  hasCompletedAssessment,
  
  // Token Management
  hasAvailableTokens,
  getRemainingTokens,
  getUsedTokens,
  resetUserTokens,
  addTokens,
  
  // Report Management
  saveUserReport,
  getUserReports,
  getReport,
  getAllReports,
  
  // Statistics
  getDashboardStats,
  
  // Activity
  logActivity,
  getActivityLog
};
