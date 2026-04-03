# Authorization Matrix

This document maps the intended module ownership and allowed roles for the current platform and tenant architecture.

## Roles

- `PLATFORM_ADMIN`: operates the platform itself. Manages tenants, platform health and platform-level operations.
- `TENANT_ADMIN`: manages one tenant/business.
- `TENANT_STAFF`: operates day-to-day business workflows for one tenant.
- `CUSTOMER`: final buyer. Can only operate self-service and commerce flows tied to their own account.

## Platform Scope

### Platform Tenants

- Allowed: `PLATFORM_ADMIN`
- Operations:
  - List platform tenants
  - Create platform tenants
  - Edit platform tenants
  - Activate/deactivate platform tenants
  - Delete platform tenants

### Platform Health

- Allowed: public for diagnostics
- Operations:
  - Check overall health
  - Check platform DB health
  - Check current tenant DB health

## Tenant Scope

### Auth

- Allowed:
  - `CUSTOMER`, `TENANT_ADMIN`, `TENANT_STAFF`: login, refresh, logout, sessions, identities, preferences, password reset
  - `CUSTOMER`: signup
- Operations:
  - Sign up with email
  - Login with email/social
  - Manage own sessions
  - Manage own identities
  - Update own auth preferences
  - Verify/resend email
  - Request/reset password

### Users

- `GET/PATCH /users/me`
  - Allowed: `CUSTOMER`, `TENANT_ADMIN`, `TENANT_STAFF`
  - Operation: self profile

- `GET/POST/PATCH/DELETE /admin/users`
  - Allowed: `TENANT_ADMIN`
  - Operations:
    - List tenant users
    - Create tenant users
    - Edit tenant users
    - Delete tenant users

### Catalog

- Public catalog read
  - Allowed: public
  - Operations:
    - List catalogs

- Admin catalog operations
  - Allowed: `TENANT_ADMIN`, `TENANT_STAFF`
  - Operations:
    - List catalogs for backoffice
    - Create catalog
    - Activate/deactivate catalog

### Products

- Public product read
  - Allowed: public
  - Operations:
    - List products
    - View product detail

- Admin product operations
  - Allowed: `TENANT_ADMIN`, `TENANT_STAFF`
  - Operations:
    - List products for backoffice
    - Activate/deactivate products
    - Change product price

### Inventory

- Public stock view
  - Allowed: public
  - Operations:
    - View product inventory

- Admin inventory operations
  - Allowed: `TENANT_ADMIN`, `TENANT_STAFF`
  - Operations:
    - Inspect inventory
    - Adjust inventory

### Orders

- Customer operations
  - Allowed: `CUSTOMER`
  - Operations:
    - Create order from own cart
    - List own orders

- Admin operations
  - Allowed: `TENANT_ADMIN`, `TENANT_STAFF`
  - Operations:
    - List tenant orders
    - Advance order status

### Customers

- Customer self-service
  - Allowed: `CUSTOMER`
  - Operations:
    - View own customer profile only

- Backoffice customers
  - Allowed: `TENANT_ADMIN`, `TENANT_STAFF`
  - Operations:
    - View tenant customer profiles

### Loyalty

- Customer self-service
  - Allowed: `CUSTOMER`
  - Operations:
    - View own loyalty account only

- Backoffice loyalty
  - Allowed: `TENANT_ADMIN`, `TENANT_STAFF`
  - Operations:
    - View loyalty account
    - Adjust points

### Cart

- Allowed:
  - public/guest for guest cart
  - `CUSTOMER` for authenticated cart
- Operations:
  - Add item as guest or customer
  - View own active cart
  - Clear own/guest cart

## Design Notes

- `PLATFORM_ADMIN` should not operate tenant backoffice endpoints directly.
- Tenant admin/staff should never operate platform endpoints.
- `CUSTOMER` should never access `/admin/*` or `/platform/*`.
- Customer-facing modules should enforce ownership when a `customerId` is present in the route.
