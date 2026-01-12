// Hybrid Authentication and User Management System for Kafaat Platform
// Uses Cloudflare Functions API when deployed, falls back to local storage for development
// Ensures data persistence across browsers when API is available

const SESSION_KEY = 'kafaat-session';

// Detect if running on Cloudflare Pages (has /api endpoint)
let USE_API = false;
let API_AVAILABLE = null; // null = not checked, true/false = result

// ==================== API HELPER FUNCTIONS ====================

async function checkApiAvailability() {
  if (API_AVAILABLE !== null) return API_AVAILABLE;
  
  try {
    const response = await fetch('/api/health', { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    API_AVAILABLE = data.success === true;
    USE_API = API_AVAILABLE;
    console.log('API available:', API_AVAILABLE);
  } catch (error) {
    API_AVAILABLE = false;
    USE_API = false;
    console.log('API not available, using local storage');
  }
  
  return API_AVAILABLE;
}

async function apiCall(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`/api/${endpoint}`, options);
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error: error.message || 'Network error' };
  }
}

// ==================== LOCAL STORAGE HELPERS ====================

const USERS_KEY = 'kafaat-users';

const DEFAULT_ADMIN = {
  id: 'admin-001',
  email: 'eslamelkilany@gmail.com',
  password: '2951990@Eami',
  role: 'admin',
  name: 'System Administrator',
  nameAr: 'مسؤول النظام',
  department: 'Administration',
  position: 'System Admin',
  tokens: 0,
  assignedAssessments: ['kafaat', '360'],
  completedAssessments: [],
  reports: [],
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  createdBy: 'system'
};

function getLocalUsers() {
  try {
    const data = localStorage.getItem(USERS_KEY);
    let users = data ? JSON.parse(data) : [];
    
    // Ensure admin exists
    const adminExists = users.find(u => u.email === DEFAULT_ADMIN.email);
    if (!adminExists) {
      users.unshift(DEFAULT_ADMIN);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    
    return users;
  } catch {
    return [DEFAULT_ADMIN];
  }
}

function saveLocalUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  } catch {
    return false;
  }
}

function getStoredSession() {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function storeSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Error storing session:', error);
  }
}

function clearStoredSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ==================== INITIALIZATION ====================

export const initializeAuth = async () => {
  await checkApiAvailability();
  
  if (USE_API) {
    try {
      const result = await apiCall('health');
      return result.success;
    } catch {
      return false;
    }
  }
  
  // Initialize local storage
  getLocalUsers();
  return true;
};

// ==================== USER MANAGEMENT ====================

export const getUsers = async () => {
  if (USE_API) {
    const result = await apiCall('users');
    return result.success ? result.users : [];
  }
  return getLocalUsers();
};

export const getUserById = async (userId) => {
  if (USE_API) {
    const result = await apiCall(`users/${userId}`);
    return result.success ? result.user : null;
  }
  const users = getLocalUsers();
  return users.find(u => u.id === userId) || null;
};

export const getUserByEmail = async (email) => {
  const users = await getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
};

export const createUser = async (userData) => {
  const session = getStoredSession();
  
  if (USE_API) {
    return await apiCall('users', 'POST', {
      ...userData,
      createdBy: session?.userId || 'system'
    });
  }
  
  // Local storage
  const users = getLocalUsers();
  const exists = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
  if (exists) {
    return { success: false, error: 'Email already exists' };
  }
  
  const newUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email: userData.email.toLowerCase().trim(),
    password: userData.password,
    role: userData.role || 'candidate',
    name: userData.name.trim(),
    nameAr: (userData.nameAr || userData.name).trim(),
    department: (userData.department || '').trim(),
    position: (userData.position || '').trim(),
    tokens: userData.role === 'admin' ? 0 : (parseInt(userData.tokens) || 1),
    assignedAssessments: userData.assignedAssessments || [],
    completedAssessments: [],
    reports: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: session?.userId || 'system'
  };
  
  users.push(newUser);
  saveLocalUsers(users);
  
  return { success: true, user: newUser };
};

export const updateUser = async (userId, updates) => {
  if (USE_API) {
    return await apiCall(`users/${userId}`, 'PUT', updates);
  }
  
  const users = getLocalUsers();
  const index = users.findIndex(u => u.id === userId);
  
  if (index === -1) {
    return { success: false, error: 'User not found' };
  }
  
  users[index] = { ...users[index], ...updates, lastActivity: new Date().toISOString() };
  saveLocalUsers(users);
  
  return { success: true, user: users[index] };
};

export const deleteUser = async (userId) => {
  if (USE_API) {
    return await apiCall(`users/${userId}`, 'DELETE');
  }
  
  const users = getLocalUsers();
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return { success: false, error: 'User not found' };
  }
  
  if (user.email === DEFAULT_ADMIN.email) {
    return { success: false, error: 'Cannot delete main admin' };
  }
  
  const filtered = users.filter(u => u.id !== userId);
  saveLocalUsers(filtered);
  
  return { success: true };
};

// ==================== AUTHENTICATION ====================

export const login = async (email, password, isAdminLogin = false) => {
  if (USE_API) {
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
  }
  
  // Local login
  const users = getLocalUsers();
  const user = users.find(u => 
    u.email.toLowerCase() === email.toLowerCase().trim() && 
    u.password === password
  );
  
  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }
  
  if (!user.isActive) {
    return { success: false, error: 'Account is deactivated' };
  }
  
  if (isAdminLogin && user.role !== 'admin') {
    return { success: false, error: 'Admin credentials required' };
  }
  
  if (!isAdminLogin && user.role === 'admin') {
    return { success: false, error: 'Please use Admin Login page' };
  }
  
  // Update last login
  const index = users.findIndex(u => u.id === user.id);
  users[index].lastLogin = new Date().toISOString();
  saveLocalUsers(users);
  
  const session = {
    id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    isAdminLogin
  };
  
  storeSession(session);
  
  return { success: true, user, session };
};

export const logout = async () => {
  const session = getStoredSession();
  
  if (USE_API && session?.id) {
    await apiCall('auth/logout', 'POST', { sessionId: session.id });
  }
  
  clearStoredSession();
};

export const verifySession = async () => {
  const session = getStoredSession();
  if (!session?.id) {
    return { valid: false };
  }
  
  if (USE_API) {
    const result = await apiCall('auth/verify', 'POST', { sessionId: session.id });
    
    if (!result.success || !result.valid) {
      clearStoredSession();
      return { valid: false };
    }
    
    return { valid: true, user: result.user, session: result.session };
  }
  
  // Local verify
  const user = await getUserById(session.userId);
  if (!user) {
    clearStoredSession();
    return { valid: false };
  }
  
  return { valid: true, user, session };
};

export const getCurrentSession = () => {
  return getStoredSession();
};

export const getCurrentUser = async () => {
  const session = getStoredSession();
  if (!session?.userId) return null;
  return await getUserById(session.userId);
};

export const refreshCurrentUser = async () => {
  return await getCurrentUser();
};

export const isLoggedIn = () => {
  const session = getStoredSession();
  return session !== null && session.userId !== undefined;
};

export const isAdmin = () => {
  const session = getStoredSession();
  return session?.role === 'admin';
};

// ==================== ASSESSMENT MANAGEMENT ====================

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

export const removeAssessment = async (userId, assessmentType) => {
  const user = await getUserById(userId);
  if (!user) return { success: false, error: 'User not found' };
  
  const currentAssessments = (user.assignedAssessments || []).filter(a => a !== assessmentType);
  return await updateUser(userId, { assignedAssessments: currentAssessments });
};

export const canAccessAssessment = async (assessmentType) => {
  const user = await getCurrentUser();
  if (!user) return false;
  if (user.role === 'admin') return true;
  
  if (!user.assignedAssessments?.includes(assessmentType)) {
    return false;
  }
  
  return await hasAvailableTokens();
};

export const hasCompletedAssessment = async (assessmentType) => {
  const user = await getCurrentUser();
  if (!user) return false;
  return (user.completedAssessments || []).includes(assessmentType);
};

// ==================== TOKEN MANAGEMENT ====================

export const hasAvailableTokens = async (userId = null) => {
  const user = userId ? await getUserById(userId) : await getCurrentUser();
  if (!user) return false;
  if (user.role === 'admin') return true;
  
  const usedTokens = (user.completedAssessments || []).length;
  const totalTokens = user.tokens || 0;
  
  return totalTokens > usedTokens;
};

export const getRemainingTokens = async (userId = null) => {
  const user = userId ? await getUserById(userId) : await getCurrentUser();
  if (!user) return 0;
  if (user.role === 'admin') return 999;
  
  const usedTokens = (user.completedAssessments || []).length;
  const totalTokens = user.tokens || 0;
  
  return Math.max(0, totalTokens - usedTokens);
};

export const getUsedTokens = async (userId = null) => {
  const user = userId ? await getUserById(userId) : await getCurrentUser();
  if (!user) return 0;
  return (user.completedAssessments || []).length;
};

export const resetUserTokens = async (userId) => {
  if (USE_API) {
    return await apiCall(`tokens/reset/${userId}`, 'POST');
  }
  return await updateUser(userId, { completedAssessments: [] });
};

export const addTokens = async (userId, amount) => {
  const user = await getUserById(userId);
  if (!user) return { success: false, error: 'User not found' };
  
  const newTokens = (user.tokens || 0) + amount;
  return await updateUser(userId, { tokens: newTokens });
};

// ==================== REPORT MANAGEMENT ====================

export const saveUserReport = async (userId, assessmentType, reportData) => {
  if (USE_API) {
    return await apiCall('reports', 'POST', {
      userId,
      assessmentType,
      reportData
    });
  }
  
  // Local storage
  const user = await getUserById(userId);
  if (!user) {
    return { success: false, error: 'User not found' };
  }
  
  // Check tokens for non-admin
  if (user.role !== 'admin') {
    const usedTokens = (user.completedAssessments || []).length;
    if (usedTokens >= (user.tokens || 0)) {
      return { success: false, error: 'No tokens available' };
    }
  }
  
  const report = {
    id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    assessmentType,
    data: reportData,
    completedAt: new Date().toISOString(),
    userId,
    userName: user.name,
    userEmail: user.email,
    userDepartment: user.department,
    userPosition: user.position
  };
  
  const newReports = [...(user.reports || []), report];
  const newCompleted = (user.completedAssessments || []).includes(assessmentType)
    ? user.completedAssessments
    : [...(user.completedAssessments || []), assessmentType];
  
  await updateUser(userId, { 
    reports: newReports, 
    completedAssessments: newCompleted 
  });
  
  return { success: true, report };
};

export const getUserReports = async (userId) => {
  const user = await getUserById(userId);
  return user?.reports || [];
};

export const getReport = async (userId, reportId) => {
  const user = await getUserById(userId);
  if (!user || !user.reports) return null;
  return user.reports.find(r => r.id === reportId) || null;
};

export const getAllReports = async () => {
  if (USE_API) {
    const result = await apiCall('reports');
    return result.success ? result.reports : [];
  }
  
  const users = await getUsers();
  const allReports = [];
  
  users.forEach(user => {
    (user.reports || []).forEach(report => {
      allReports.push({
        ...report,
        userId: user.id,
        userName: user.name,
        userNameAr: user.nameAr,
        userEmail: user.email,
        userDepartment: user.department,
        userPosition: user.position,
        userRole: user.role
      });
    });
  });
  
  return allReports.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
};

// ==================== STATISTICS ====================

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

export const logActivity = async (userId, action, details = {}) => {
  console.log('Activity:', { userId, action, details });
};

export const getActivityLog = async (limit = 50) => {
  return [];
};

// ==================== EXPORT ====================

export default {
  initializeAuth,
  getUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  login,
  logout,
  verifySession,
  getCurrentSession,
  getCurrentUser,
  refreshCurrentUser,
  isLoggedIn,
  isAdmin,
  assignAssessment,
  removeAssessment,
  canAccessAssessment,
  hasCompletedAssessment,
  hasAvailableTokens,
  getRemainingTokens,
  getUsedTokens,
  resetUserTokens,
  addTokens,
  saveUserReport,
  getUserReports,
  getReport,
  getAllReports,
  getDashboardStats,
  logActivity,
  getActivityLog
};
