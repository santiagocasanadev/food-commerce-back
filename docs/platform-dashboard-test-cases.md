# Platform Dashboard Test Cases

This document defines the minimum functional test cases for the platform dashboard in phase 1.

It is focused on these platform capabilities:

- platform authentication
- platform admin management
- tenant registry management
- tenant DB connection validation
- tenant onboarding
- platform and tenant health checks

## Preconditions

- The API is running with `PLATFORM_DATABASE_URL` configured.
- At least one `platform_admins` record exists in the platform database.
- At least one tenant database exists with [schema.sql](C:\Users\USER\Documents\api-food\food-commerce-api\src\infrastructure\database\schema.sql) applied.
- The platform database has [schema.platform.sql](C:\Users\USER\Documents\api-food\food-commerce-api\src\infrastructure\database\schema.platform.sql) applied.

## Core Variables

- `platformAdminToken`
- `platformAdminId`
- `platformTenantId`

## 1. Platform Authentication

### P-AUTH-001 Platform login succeeds

- Route: `POST /api/v1/platform/auth/login`
- Preconditions:
  - Valid platform admin exists.
- Request body:
```json
{
  "email": "platform@example.com",
  "password": "Password123"
}
```
- Expected result:
  - Status `201`
  - Response contains `accessToken`
  - Response contains `user.id`, `user.email`, `user.role = PLATFORM_ADMIN`

### P-AUTH-002 Platform login fails with wrong password

- Route: `POST /api/v1/platform/auth/login`
- Preconditions:
  - Valid platform admin exists.
- Request body:
```json
{
  "email": "platform@example.com",
  "password": "WrongPassword123"
}
```
- Expected result:
  - Status `401`
  - Message indicates invalid platform credentials

### P-AUTH-003 Platform profile requires auth

- Route: `GET /api/v1/platform/auth/me`
- Expected result:
  - Without token: `401`
  - With valid `platformAdminToken`: `200`

## 2. Platform Admin CRUD

### P-ADMIN-001 List platform admins

- Route: `GET /api/v1/platform/admins`
- Expected result:
  - Status `200`
  - Response is an array
  - Each item contains `id`, `email`, `name`, `role`, `active`

### P-ADMIN-002 Create platform admin

- Route: `POST /api/v1/platform/admins`
- Request body:
```json
{
  "email": "ops@example.com",
  "name": "Ops Admin",
  "password": "Password123",
  "active": true
}
```
- Expected result:
  - Status `201`
  - New admin id returned
  - Password hash is not exposed

### P-ADMIN-003 Duplicate platform admin email is rejected

- Route: `POST /api/v1/platform/admins`
- Preconditions:
  - An admin already exists with the same email.
- Expected result:
  - Status `409`
  - Message indicates duplicated platform admin email

### P-ADMIN-004 Update platform admin

- Route: `PATCH /api/v1/platform/admins/{id}`
- Request body:
```json
{
  "name": "Ops Admin Updated",
  "active": true
}
```
- Expected result:
  - Status `200`
  - Updated fields returned

### P-ADMIN-005 Self-deactivation is rejected

- Route: `PATCH /api/v1/platform/admins/{platformAdminId}`
- Request body:
```json
{
  "active": false
}
```
- Expected result:
  - Status `400`
  - Message indicates self-deactivation is not allowed

### P-ADMIN-006 Self-deletion is rejected

- Route: `DELETE /api/v1/platform/admins/{platformAdminId}`
- Expected result:
  - Status `400`
  - Message indicates self-deletion is not allowed

## 3. Platform Tenant CRUD

### P-TENANT-001 List tenants

- Route: `GET /api/v1/platform/tenants`
- Expected result:
  - Status `200`
  - Response is an array of platform tenants

### P-TENANT-002 Create tenant registry entry

- Route: `POST /api/v1/platform/tenants`
- Request body:
```json
{
  "slug": "cliente-demo",
  "name": "Cliente Demo",
  "dbConnectionUrl": "postgresql://postgres.<project-ref>:PASSWORD@aws-0-us-west-2.pooler.supabase.com:5432/postgres",
  "active": true
}
```
- Expected result:
  - Status `201`
  - Response contains `id`, `slug`, `name`, `dbConnectionUrl`, `active`

### P-TENANT-003 Duplicate tenant slug is rejected

- Route: `POST /api/v1/platform/tenants`
- Preconditions:
  - A platform tenant already exists with the same slug.
- Expected result:
  - Status `409`

### P-TENANT-004 Update tenant metadata

- Route: `PATCH /api/v1/platform/tenants/{platformTenantId}`
- Request body:
```json
{
  "name": "Cliente Demo Updated",
  "active": true
}
```
- Expected result:
  - Status `200`
  - Updated tenant data returned

### P-TENANT-005 Delete tenant registry entry

- Route: `DELETE /api/v1/platform/tenants/{platformTenantId}`
- Expected result:
  - Status `200`
  - `{ "success": true }`

## 4. Tenant DB Connection Validation

### P-CONN-001 Valid tenant connection string succeeds

- Route: `POST /api/v1/platform/tenants/test-connection`
- Request body:
```json
{
  "dbConnectionUrl": "postgresql://postgres.<project-ref>:PASSWORD@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
}
```
- Expected result:
  - Status `201`
  - `success = true`
  - `target` contains safe connection metadata

### P-CONN-002 Invalid tenant connection string fails

- Route: `POST /api/v1/platform/tenants/test-connection`
- Request body:
```json
{
  "dbConnectionUrl": "postgresql://postgres.invalid:badpassword@invalid-host:5432/postgres"
}
```
- Expected result:
  - Status `500`
  - Message indicates tenant connection test failed

## 5. Tenant Onboarding

### P-ONBOARD-001 Onboard tenant with initial admin

- Route: `POST /api/v1/platform/tenants/onboard`
- Preconditions:
  - Target tenant database exists and has tenant schema applied.
  - Admin email does not already exist inside that tenant DB.
- Request body:
```json
{
  "slug": "cliente-onboard",
  "name": "Cliente Onboard",
  "dbConnectionUrl": "postgresql://postgres.<project-ref>:PASSWORD@aws-0-us-west-2.pooler.supabase.com:5432/postgres",
  "adminEmail": "admin@cliente-onboard.com",
  "adminName": "Tenant Admin",
  "adminPassword": "Password123",
  "active": true
}
```
- Expected result:
  - Status `201`
  - Response contains `tenant`
  - Response contains `initialAdmin`
  - `initialAdmin.role = TENANT_ADMIN`

### P-ONBOARD-002 Duplicate tenant slug is rejected during onboarding

- Route: `POST /api/v1/platform/tenants/onboard`
- Preconditions:
  - A platform tenant already exists with the same slug.
- Expected result:
  - Status `409`

### P-ONBOARD-003 Duplicate initial admin email is rejected during onboarding

- Route: `POST /api/v1/platform/tenants/onboard`
- Preconditions:
  - Target tenant DB already contains the same email in `users` or `auth_identities`.
- Expected result:
  - Status `409`
  - No orphan tenant should remain in `platform_tenants`

### P-ONBOARD-004 Invalid tenant DB connection fails during onboarding

- Route: `POST /api/v1/platform/tenants/onboard`
- Preconditions:
  - The provided connection string is invalid or unreachable.
- Expected result:
  - Status `500`
  - Tenant is not persisted in `platform_tenants`

## 6. Health Checks

### P-HEALTH-001 Overall health responds

- Route: `GET /api/v1/health`
- Expected result:
  - Status `200`
  - Response includes platform and tenant health blocks

### P-HEALTH-002 Platform DB health responds without tenant header

- Route: `GET /api/v1/health/platform`
- Expected result:
  - Status `200`
  - Response indicates platform DB state

### P-HEALTH-003 Tenant DB health responds with tenant context

- Route: `GET /api/v1/health/tenant`
- Headers:
  - `x-tenant-slug: cliente-demo`
- Expected result:
  - Status `200`
  - Response indicates tenant DB state

### P-HEALTH-004 Tenant DB health fails when tenant cannot be resolved

- Route: `GET /api/v1/health/tenant`
- Preconditions:
  - No tenant header sent
  - `REQUIRE_TENANT_RESOLUTION=true`
- Expected result:
  - Status `404`
  - Message indicates tenant could not be resolved

## 7. Role Separation

### P-AUTHZ-001 Tenant token cannot call platform endpoints

- Routes:
  - `GET /api/v1/platform/tenants`
  - `GET /api/v1/platform/admins`
- Preconditions:
  - Use a tenant token instead of a platform token.
- Expected result:
  - Status `403`

### P-AUTHZ-002 Platform token cannot be used as tenant customer/admin token

- Sample routes:
  - `GET /api/v1/users/me`
  - `GET /api/v1/admin/users`
- Preconditions:
  - Use `platformAdminToken`
- Expected result:
  - Request should not gain tenant business access

## 8. Suggested Manual Test Order

1. `P-AUTH-001`
2. `P-ADMIN-001`
3. `P-CONN-001`
4. `P-TENANT-002`
5. `P-ONBOARD-001`
6. `P-HEALTH-002`
7. `P-HEALTH-003`
8. `P-AUTHZ-001`

## 9. Phase 1 Exit Criteria

Platform phase 1 can be considered operational when all these conditions are met:

- A platform admin can log in.
- Platform admins can be listed and managed.
- Tenants can be listed and managed.
- A tenant DB connection can be validated before persistence.
- A tenant can be onboarded with its initial tenant admin.
- Platform and tenant health endpoints are usable.
- Role separation between platform and tenant paths is enforced.
