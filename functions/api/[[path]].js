// Cloudflare Pages Functions API with D1 Database
// This handles all /api/* routes

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

// Handle OPTIONS preflight
function handleOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// JSON response helper
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders
  });
}

// Error response helper
function errorResponse(message, status = 400) {
  return jsonResponse({ success: false, error: message }, status);
}

// Generate unique ID
function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

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
  assignedAssessments: JSON.stringify(['kafaat', '360']),
  completedAssessments: JSON.stringify([]),
  reports: JSON.stringify([]),
  isActive: 1,
  createdAt: '2024-01-01T00:00:00.000Z',
  createdBy: 'system'
};

// Initialize database with tables and default admin
async function initializeDatabase(db) {
  try {
    // Create users table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'candidate',
        name TEXT NOT NULL,
        nameAr TEXT,
        department TEXT,
        position TEXT,
        tokens INTEGER DEFAULT 1,
        assignedAssessments TEXT DEFAULT '[]',
        completedAssessments TEXT DEFAULT '[]',
        reports TEXT DEFAULT '[]',
        isActive INTEGER DEFAULT 1,
        createdAt TEXT,
        createdBy TEXT,
        lastLogin TEXT,
        lastActivity TEXT
      )
    `);

    // Create sessions table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL,
        name TEXT,
        nameAr TEXT,
        loginTime TEXT,
        isAdminLogin INTEGER DEFAULT 0,
        expiresAt TEXT,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // Create activity log table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id TEXT PRIMARY KEY,
        userId TEXT,
        action TEXT NOT NULL,
        details TEXT,
        timestamp TEXT
      )
    `);

    // Check if admin exists
    const admin = await db.prepare('SELECT id FROM users WHERE email = ?').bind(DEFAULT_ADMIN.email).first();
    
    if (!admin) {
      // Insert default admin
      await db.prepare(`
        INSERT INTO users (id, email, password, role, name, nameAr, department, position, tokens, assignedAssessments, completedAssessments, reports, isActive, createdAt, createdBy)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        DEFAULT_ADMIN.id,
        DEFAULT_ADMIN.email,
        DEFAULT_ADMIN.password,
        DEFAULT_ADMIN.role,
        DEFAULT_ADMIN.name,
        DEFAULT_ADMIN.nameAr,
        DEFAULT_ADMIN.department,
        DEFAULT_ADMIN.position,
        DEFAULT_ADMIN.tokens,
        DEFAULT_ADMIN.assignedAssessments,
        DEFAULT_ADMIN.completedAssessments,
        DEFAULT_ADMIN.reports,
        DEFAULT_ADMIN.isActive,
        DEFAULT_ADMIN.createdAt,
        DEFAULT_ADMIN.createdBy
      ).run();
    }

    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
}

// Parse user from database row
function parseUser(row) {
  if (!row) return null;
  return {
    ...row,
    assignedAssessments: JSON.parse(row.assignedAssessments || '[]'),
    completedAssessments: JSON.parse(row.completedAssessments || '[]'),
    reports: JSON.parse(row.reports || '[]'),
    isActive: row.isActive === 1
  };
}

// Main request handler
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/', '');
  const method = request.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return handleOptions();
  }

  // Get database
  const db = env.DB;
  if (!db) {
    return errorResponse('Database not configured', 500);
  }

  // Initialize database on first request
  await initializeDatabase(db);

  try {
    // Route handling
    switch (true) {
      // ============ AUTHENTICATION ============
      
      // POST /api/auth/login
      case path === 'auth/login' && method === 'POST': {
        const { email, password, isAdminLogin } = await request.json();
        
        const user = await db.prepare('SELECT * FROM users WHERE email = ? AND password = ?')
          .bind(email.toLowerCase().trim(), password)
          .first();
        
        if (!user) {
          return errorResponse('Invalid email or password');
        }
        
        if (!user.isActive) {
          return errorResponse('Account is deactivated');
        }
        
        // Role validation
        if (isAdminLogin && user.role !== 'admin') {
          return errorResponse('Admin credentials required');
        }
        
        if (!isAdminLogin && user.role === 'admin') {
          return errorResponse('Please use Admin Login page');
        }
        
        // Update last login
        await db.prepare('UPDATE users SET lastLogin = ?, lastActivity = ? WHERE id = ?')
          .bind(new Date().toISOString(), new Date().toISOString(), user.id)
          .run();
        
        // Create session
        const sessionId = generateId('session');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
        
        await db.prepare(`
          INSERT INTO sessions (id, userId, email, role, name, nameAr, loginTime, isAdminLogin, expiresAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          sessionId, user.id, user.email, user.role, user.name, user.nameAr,
          new Date().toISOString(), isAdminLogin ? 1 : 0, expiresAt
        ).run();
        
        // Log activity
        await db.prepare('INSERT INTO activity_log (id, userId, action, details, timestamp) VALUES (?, ?, ?, ?, ?)')
          .bind(generateId('log'), user.id, 'LOGIN', JSON.stringify({ isAdminLogin }), new Date().toISOString())
          .run();
        
        return jsonResponse({
          success: true,
          user: parseUser(user),
          session: { id: sessionId, userId: user.id, email: user.email, role: user.role, name: user.name }
        });
      }
      
      // POST /api/auth/logout
      case path === 'auth/logout' && method === 'POST': {
        const { sessionId } = await request.json();
        if (sessionId) {
          await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
        }
        return jsonResponse({ success: true });
      }
      
      // POST /api/auth/verify
      case path === 'auth/verify' && method === 'POST': {
        const { sessionId } = await request.json();
        if (!sessionId) {
          return jsonResponse({ success: false, valid: false });
        }
        
        const session = await db.prepare('SELECT * FROM sessions WHERE id = ? AND expiresAt > ?')
          .bind(sessionId, new Date().toISOString())
          .first();
        
        if (!session) {
          return jsonResponse({ success: true, valid: false });
        }
        
        const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(session.userId).first();
        
        return jsonResponse({
          success: true,
          valid: true,
          user: parseUser(user),
          session
        });
      }
      
      // ============ USER MANAGEMENT ============
      
      // GET /api/users - Get all users
      case path === 'users' && method === 'GET': {
        const { results } = await db.prepare('SELECT * FROM users ORDER BY createdAt DESC').all();
        return jsonResponse({
          success: true,
          users: results.map(parseUser)
        });
      }
      
      // GET /api/users/:id - Get user by ID
      case path.startsWith('users/') && method === 'GET': {
        const userId = path.replace('users/', '');
        const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
        
        if (!user) {
          return errorResponse('User not found', 404);
        }
        
        return jsonResponse({ success: true, user: parseUser(user) });
      }
      
      // POST /api/users - Create user
      case path === 'users' && method === 'POST': {
        const userData = await request.json();
        
        // Check if email exists
        const existing = await db.prepare('SELECT id FROM users WHERE email = ?')
          .bind(userData.email.toLowerCase().trim())
          .first();
        
        if (existing) {
          return errorResponse('Email already exists');
        }
        
        const newUser = {
          id: generateId('user'),
          email: userData.email.toLowerCase().trim(),
          password: userData.password,
          role: userData.role || 'candidate',
          name: userData.name.trim(),
          nameAr: (userData.nameAr || userData.name).trim(),
          department: (userData.department || '').trim(),
          position: (userData.position || '').trim(),
          tokens: userData.role === 'admin' ? 0 : (parseInt(userData.tokens) || 1),
          assignedAssessments: JSON.stringify(userData.assignedAssessments || []),
          completedAssessments: JSON.stringify([]),
          reports: JSON.stringify([]),
          isActive: 1,
          createdAt: new Date().toISOString(),
          createdBy: userData.createdBy || 'system'
        };
        
        await db.prepare(`
          INSERT INTO users (id, email, password, role, name, nameAr, department, position, tokens, assignedAssessments, completedAssessments, reports, isActive, createdAt, createdBy)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          newUser.id, newUser.email, newUser.password, newUser.role, newUser.name, newUser.nameAr,
          newUser.department, newUser.position, newUser.tokens, newUser.assignedAssessments,
          newUser.completedAssessments, newUser.reports, newUser.isActive, newUser.createdAt, newUser.createdBy
        ).run();
        
        // Log activity
        await db.prepare('INSERT INTO activity_log (id, userId, action, details, timestamp) VALUES (?, ?, ?, ?, ?)')
          .bind(generateId('log'), 'system', 'CREATE_USER', JSON.stringify({ newUserId: newUser.id, email: newUser.email }), new Date().toISOString())
          .run();
        
        return jsonResponse({ success: true, user: { ...newUser, assignedAssessments: userData.assignedAssessments || [], completedAssessments: [], reports: [], isActive: true } });
      }
      
      // PUT /api/users/:id - Update user
      case path.startsWith('users/') && method === 'PUT': {
        const userId = path.replace('users/', '');
        const updates = await request.json();
        
        const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
        if (!user) {
          return errorResponse('User not found', 404);
        }
        
        // Build update query
        const updateFields = [];
        const updateValues = [];
        
        if (updates.name !== undefined) { updateFields.push('name = ?'); updateValues.push(updates.name); }
        if (updates.nameAr !== undefined) { updateFields.push('nameAr = ?'); updateValues.push(updates.nameAr); }
        if (updates.password !== undefined) { updateFields.push('password = ?'); updateValues.push(updates.password); }
        if (updates.department !== undefined) { updateFields.push('department = ?'); updateValues.push(updates.department); }
        if (updates.position !== undefined) { updateFields.push('position = ?'); updateValues.push(updates.position); }
        if (updates.tokens !== undefined) { updateFields.push('tokens = ?'); updateValues.push(updates.tokens); }
        if (updates.isActive !== undefined) { updateFields.push('isActive = ?'); updateValues.push(updates.isActive ? 1 : 0); }
        if (updates.assignedAssessments !== undefined) { updateFields.push('assignedAssessments = ?'); updateValues.push(JSON.stringify(updates.assignedAssessments)); }
        if (updates.completedAssessments !== undefined) { updateFields.push('completedAssessments = ?'); updateValues.push(JSON.stringify(updates.completedAssessments)); }
        if (updates.reports !== undefined) { updateFields.push('reports = ?'); updateValues.push(JSON.stringify(updates.reports)); }
        
        updateFields.push('lastActivity = ?');
        updateValues.push(new Date().toISOString());
        updateValues.push(userId);
        
        await db.prepare(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`).bind(...updateValues).run();
        
        const updatedUser = await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
        return jsonResponse({ success: true, user: parseUser(updatedUser) });
      }
      
      // DELETE /api/users/:id - Delete user
      case path.startsWith('users/') && method === 'DELETE': {
        const userId = path.replace('users/', '');
        
        const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
        if (!user) {
          return errorResponse('User not found', 404);
        }
        
        if (user.email === DEFAULT_ADMIN.email) {
          return errorResponse('Cannot delete main admin');
        }
        
        await db.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();
        await db.prepare('DELETE FROM sessions WHERE userId = ?').bind(userId).run();
        
        return jsonResponse({ success: true });
      }
      
      // ============ REPORTS ============
      
      // POST /api/reports - Save report
      case path === 'reports' && method === 'POST': {
        const { userId, assessmentType, reportData } = await request.json();
        
        const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
        if (!user) {
          return errorResponse('User not found', 404);
        }
        
        const parsedUser = parseUser(user);
        
        // Check tokens for non-admin
        if (parsedUser.role !== 'admin') {
          const usedTokens = parsedUser.completedAssessments.length;
          if (usedTokens >= parsedUser.tokens) {
            return errorResponse('No tokens available');
          }
        }
        
        // Create report
        const report = {
          id: generateId('report'),
          assessmentType,
          data: reportData,
          completedAt: new Date().toISOString(),
          userId,
          userName: parsedUser.name,
          userEmail: parsedUser.email,
          userDepartment: parsedUser.department,
          userPosition: parsedUser.position
        };
        
        // Update user
        const newReports = [...parsedUser.reports, report];
        const newCompleted = parsedUser.completedAssessments.includes(assessmentType) 
          ? parsedUser.completedAssessments 
          : [...parsedUser.completedAssessments, assessmentType];
        
        await db.prepare('UPDATE users SET reports = ?, completedAssessments = ?, lastActivity = ? WHERE id = ?')
          .bind(JSON.stringify(newReports), JSON.stringify(newCompleted), new Date().toISOString(), userId)
          .run();
        
        // Log activity
        await db.prepare('INSERT INTO activity_log (id, userId, action, details, timestamp) VALUES (?, ?, ?, ?, ?)')
          .bind(generateId('log'), userId, 'COMPLETE_ASSESSMENT', JSON.stringify({ assessmentType, reportId: report.id, score: reportData.overallScore }), new Date().toISOString())
          .run();
        
        return jsonResponse({ success: true, report });
      }
      
      // GET /api/reports - Get all reports
      case path === 'reports' && method === 'GET': {
        const { results } = await db.prepare('SELECT * FROM users WHERE reports != "[]"').all();
        
        const allReports = [];
        results.forEach(user => {
          const parsedUser = parseUser(user);
          parsedUser.reports.forEach(report => {
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
        
        allReports.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
        
        return jsonResponse({ success: true, reports: allReports });
      }
      
      // ============ TOKENS ============
      
      // POST /api/tokens/reset/:userId - Reset tokens
      case path.startsWith('tokens/reset/') && method === 'POST': {
        const userId = path.replace('tokens/reset/', '');
        
        await db.prepare('UPDATE users SET completedAssessments = ?, lastActivity = ? WHERE id = ?')
          .bind(JSON.stringify([]), new Date().toISOString(), userId)
          .run();
        
        return jsonResponse({ success: true });
      }
      
      // ============ HEALTH CHECK ============
      case path === 'health' && method === 'GET': {
        return jsonResponse({ success: true, status: 'healthy', timestamp: new Date().toISOString() });
      }
      
      default:
        return errorResponse('Not found', 404);
    }
  } catch (error) {
    console.error('API Error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
}
