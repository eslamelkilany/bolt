-- ============================================================================
-- Kafaat Smart Evaluation Platform - Seed Data
-- Extracted from: functions/api/[[path]].js (DEFAULT_ADMIN constant)
-- ============================================================================
--
-- !!! SECURITY WARNING !!!
-- The original code commits the admin password in plaintext inside the
-- repository. Before running this seed in any real environment:
--   1. Change the password below to a newly generated strong password.
--   2. Replace this with a hash (bcrypt / argon2 / PBKDF2) — the app code
--      must be updated at the same time to verify hashes instead of
--      comparing plaintext.
--   3. Rotate the committed password in the live D1 database.
-- ============================================================================

INSERT OR IGNORE INTO users (
  id,
  email,
  password,
  role,
  name,
  nameAr,
  department,
  position,
  tokens,
  assignedAssessments,
  completedAssessments,
  reports,
  isActive,
  createdAt,
  createdBy
) VALUES (
  'admin-001',
  'eslamelkilany@gmail.com',
  '2951990@Eami',              -- TODO: replace with hash before deploying
  'admin',
  'System Administrator',
  'مسؤول النظام',
  'Administration',
  'System Admin',
  0,
  '["kafaat","360"]',
  '[]',
  '[]',
  1,
  '2024-01-01T00:00:00.000Z',
  'system'
);
