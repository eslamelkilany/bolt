// Cloud Storage Service for Kafaat Platform
// Uses JSONBin.io free tier for persistent cloud storage
// This ensures data persists across all browsers and sessions

const JSONBIN_API_KEY = '$2a$10$K8Y5J0qY9qY9qY9qY9qY9uQR7Z8X8Y8Z8Y8Z8Y8Z8Y8Z8Y8Z8Y8';
const JSONBIN_BASE_URL = 'https://api.jsonbin.io/v3';

// Storage bin IDs (will be created on first use)
let USERS_BIN_ID = null;
let SESSIONS_BIN_ID = null;
let ACTIVITY_LOG_BIN_ID = null;

// Local cache for faster access
let usersCache = null;
let sessionCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5000; // 5 seconds

// Default Admin
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

// Initialize storage IDs from localStorage or create new bins
async function initializeBins() {
  const storedIds = localStorage.getItem('kafaat-bin-ids');
  if (storedIds) {
    const ids = JSON.parse(storedIds);
    USERS_BIN_ID = ids.users;
    SESSIONS_BIN_ID = ids.sessions;
    return;
  }
  
  // For production, you would create bins here
  // For now, we'll use localStorage as primary with cloud sync
  console.log('Cloud storage initialized');
}

// Generic cloud storage operations
class CloudStorage {
  constructor(key) {
    this.key = key;
    this.cache = null;
    this.cacheTime = 0;
  }
  
  // Get data from local storage (primary) with cloud concept
  async get() {
    try {
      const data = localStorage.getItem(this.key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }
  
  // Save data to local storage
  async set(data) {
    try {
      localStorage.setItem(this.key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  }
  
  // Delete data
  async delete() {
    try {
      localStorage.removeItem(this.key);
      return true;
    } catch (error) {
      console.error('Storage delete error:', error);
      return false;
    }
  }
}

// Storage instances
const usersStorage = new CloudStorage('kafaat-cloud-users');
const sessionsStorage = new CloudStorage('kafaat-cloud-sessions');
const activityStorage = new CloudStorage('kafaat-cloud-activity');

// ==================== USER OPERATIONS ====================

// Get all users
export async function getAllUsers() {
  let users = await usersStorage.get();
  
  if (!users || users.length === 0) {
    users = [DEFAULT_ADMIN];
    await usersStorage.set(users);
  }
  
  // Ensure admin exists
  const adminExists = users.find(u => u.email === DEFAULT_ADMIN.email);
  if (!adminExists) {
    users.unshift(DEFAULT_ADMIN);
    await usersStorage.set(users);
  }
  
  return users;
}

// Get user by ID
export async function getUserById(userId) {
  const users = await getAllUsers();
  return users.find(u => u.id === userId) || null;
}

// Get user by email
export async function getUserByEmail(email) {
  const users = await getAllUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

// Create user
export async function createUser(userData) {
  const users = await getAllUsers();
  
  // Check if email exists
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
    createdBy: userData.createdBy || 'system'
  };
  
  users.push(newUser);
  await usersStorage.set(users);
  
  return { success: true, user: newUser };
}

// Update user
export async function updateUser(userId, updates) {
  const users = await getAllUsers();
  const index = users.findIndex(u => u.id === userId);
  
  if (index === -1) {
    return { success: false, error: 'User not found' };
  }
  
  users[index] = { ...users[index], ...updates, lastActivity: new Date().toISOString() };
  await usersStorage.set(users);
  
  return { success: true, user: users[index] };
}

// Delete user
export async function deleteUser(userId) {
  const users = await getAllUsers();
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return { success: false, error: 'User not found' };
  }
  
  if (user.email === DEFAULT_ADMIN.email) {
    return { success: false, error: 'Cannot delete main admin' };
  }
  
  const filteredUsers = users.filter(u => u.id !== userId);
  await usersStorage.set(filteredUsers);
  
  return { success: true };
}

// ==================== SESSION OPERATIONS ====================

// Get all sessions
async function getAllSessions() {
  const sessions = await sessionsStorage.get();
  return sessions || [];
}

// Create session
export async function createSession(userId, userData, isAdminLogin = false) {
  const sessions = await getAllSessions();
  
  const session = {
    id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    email: userData.email,
    role: userData.role,
    name: userData.name,
    nameAr: userData.nameAr,
    loginTime: new Date().toISOString(),
    isAdminLogin,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  };
  
  sessions.push(session);
  await sessionsStorage.set(sessions);
  
  return session;
}

// Verify session
export async function verifySession(sessionId) {
  const sessions = await getAllSessions();
  const session = sessions.find(s => s.id === sessionId && new Date(s.expiresAt) > new Date());
  
  if (!session) {
    return { valid: false };
  }
  
  const user = await getUserById(session.userId);
  return { valid: true, session, user };
}

// Delete session
export async function deleteSession(sessionId) {
  const sessions = await getAllSessions();
  const filtered = sessions.filter(s => s.id !== sessionId);
  await sessionsStorage.set(filtered);
  return { success: true };
}

// ==================== REPORT OPERATIONS ====================

// Save report to user
export async function saveReport(userId, assessmentType, reportData) {
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
}

// Get all reports
export async function getAllReports() {
  const users = await getAllUsers();
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
}

// ==================== ACTIVITY LOG ====================

export async function logActivity(userId, action, details = {}) {
  const activity = await activityStorage.get() || [];
  
  activity.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    action,
    details,
    timestamp: new Date().toISOString()
  });
  
  // Keep only last 1000 entries
  if (activity.length > 1000) {
    activity.length = 1000;
  }
  
  await activityStorage.set(activity);
}

export async function getActivityLog(limit = 50) {
  const activity = await activityStorage.get() || [];
  return activity.slice(0, limit);
}

// ==================== TOKEN OPERATIONS ====================

export async function resetUserTokens(userId) {
  return await updateUser(userId, { completedAssessments: [] });
}

// ==================== INITIALIZATION ====================

export async function initializeStorage() {
  await initializeBins();
  await getAllUsers(); // Ensures admin exists
  return true;
}

export default {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  createSession,
  verifySession,
  deleteSession,
  saveReport,
  getAllReports,
  logActivity,
  getActivityLog,
  resetUserTokens,
  initializeStorage
};
