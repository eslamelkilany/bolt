-- ============================================================================
-- Kafaat Smart Evaluation Platform - D1 (SQLite) Schema
-- Extracted from: functions/api/[[path]].js
-- Target runtime: Cloudflare D1 (SQLite dialect)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: users
-- Stores candidates, managers, and admins. JSON arrays (assignedAssessments,
-- completedAssessments, reports) are stored as TEXT and parsed in app code.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id                    TEXT PRIMARY KEY,
  email                 TEXT UNIQUE NOT NULL,
  password              TEXT NOT NULL,            -- NOTE: currently plaintext. MUST be hashed.
  role                  TEXT DEFAULT 'candidate', -- 'admin' | 'manager' | 'candidate'
  name                  TEXT NOT NULL,
  nameAr                TEXT,
  department            TEXT,
  position              TEXT,
  tokens                INTEGER DEFAULT 1,        -- assessment credits/quota
  assignedAssessments   TEXT DEFAULT '[]',        -- JSON array: ['kafaat', '360', ...]
  completedAssessments  TEXT DEFAULT '[]',        -- JSON array of assessment type keys
  reports               TEXT DEFAULT '[]',        -- JSON array of embedded report objects
  isActive              INTEGER DEFAULT 1,        -- 0|1 boolean
  createdAt             TEXT,                     -- ISO 8601 timestamp
  createdBy             TEXT,
  lastLogin             TEXT,
  lastActivity          TEXT
);

-- Recommended indexes (not in original code — add for performance)
CREATE INDEX IF NOT EXISTS idx_users_email  ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role   ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(isActive);

-- ----------------------------------------------------------------------------
-- Table: sessions
-- Session tokens, 24h expiry, single-row-per-login.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
  id            TEXT PRIMARY KEY,                 -- session id; currently used as auth token
  userId        TEXT NOT NULL,
  email         TEXT NOT NULL,
  role          TEXT NOT NULL,
  name          TEXT,
  nameAr        TEXT,
  loginTime     TEXT,
  isAdminLogin  INTEGER DEFAULT 0,                -- 0|1 flag for admin-portal login
  expiresAt     TEXT                              -- ISO 8601; 24h from loginTime
);

CREATE INDEX IF NOT EXISTS idx_sessions_userId    ON sessions(userId);
CREATE INDEX IF NOT EXISTS idx_sessions_expiresAt ON sessions(expiresAt);

-- ----------------------------------------------------------------------------
-- Table: activity_log
-- Audit trail: LOGIN, CREATE_USER, COMPLETE_ASSESSMENT, etc.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_log (
  id         TEXT PRIMARY KEY,
  userId     TEXT,
  action     TEXT NOT NULL,    -- e.g. 'LOGIN' | 'CREATE_USER' | 'COMPLETE_ASSESSMENT'
  details    TEXT,             -- JSON blob of action-specific metadata
  timestamp  TEXT              -- ISO 8601
);

CREATE INDEX IF NOT EXISTS idx_activity_userId    ON activity_log(userId);
CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON activity_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_activity_action    ON activity_log(action);
