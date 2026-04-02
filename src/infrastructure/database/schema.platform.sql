-- =========================================================
-- Platform Database Schema
-- Food Commerce API
--
-- This schema is intended for the central platform database.
-- It stores tenant registry data used to resolve which
-- client database should handle each request.
-- =========================================================

CREATE TABLE platform_tenants (
  id UUID PRIMARY KEY,
  slug VARCHAR(120) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  db_connection_url TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_platform_tenants_active
  ON platform_tenants(active);
