-- =========================================================
-- Platform Database Seed
-- Food Commerce API
--
-- This seed is intended for the central platform database.
-- It creates an initial platform admin that can access:
-- - /api/v1/platform/auth/login
-- - /api/v1/platform/admins
-- - /api/v1/platform/tenants
-- =========================================================

INSERT INTO platform_admins (
  id,
  email,
  name,
  password_hash,
  active,
  created_at,
  updated_at
)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'platform@example.com',
  'Platform Admin',
  '$2b$12$PhDP13hfemh2qPmMgEOgoO9BXYRMDX0RxHe3uWbIIXmN2Ot8urZly',
  TRUE,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

-- Default credentials for local/dev bootstrap only:
-- email: platform@example.com
-- password: Password123
