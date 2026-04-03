-- =========================================================
-- Tenant Database Seed
-- Food Commerce API
--
-- This seed is intended for each client/business database.
-- It uses valid PostgreSQL syntax and UUID values.
-- =========================================================

INSERT INTO catalogs (id, name, active)
VALUES
  ('00000000-0000-0000-0000-000000000101', 'Vegano', TRUE),
  ('00000000-0000-0000-0000-000000000102', 'Proteico', TRUE);

INSERT INTO products (id, name, description, base_price, active, catalog_id)
VALUES
  (
    '00000000-0000-0000-0000-000000000201',
    'Ensalada Vegana',
    '100% vegetal',
    18.00,
    TRUE,
    '00000000-0000-0000-0000-000000000101'
  );

INSERT INTO inventory (product_id, available_quantity, reserved_quantity)
VALUES
  ('00000000-0000-0000-0000-000000000201', 10, 0);

INSERT INTO users (
  id,
  tenant_id,
  email,
  name,
  image_url,
  role,
  email_verified,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000301',
  NULL,
  'juan@mail.com',
  'Juan Perez',
  NULL,
  'CUSTOMER',
  TRUE,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

INSERT INTO auth_identities (
  id,
  user_id,
  provider,
  provider_user_id,
  email,
  password_hash,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000401',
  '00000000-0000-0000-0000-000000000301',
  'email',
  NULL,
  'juan@mail.com',
  '$2b$12$PhDP13hfemh2qPmMgEOgoO9BXYRMDX0RxHe3uWbIIXmN2Ot8urZly',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

INSERT INTO customers (id, user_id, role)
VALUES (
  '00000000-0000-0000-0000-000000000501',
  '00000000-0000-0000-0000-000000000301',
  'CUSTOMER'
);

INSERT INTO carts (id, customer_id, status)
VALUES (
  '00000000-0000-0000-0000-000000000601',
  '00000000-0000-0000-0000-000000000501',
  'ACTIVE'
);

INSERT INTO cart_items (id, cart_id, product_id, quantity, unit_price)
VALUES (
  '00000000-0000-0000-0000-000000000701',
  '00000000-0000-0000-0000-000000000601',
  '00000000-0000-0000-0000-000000000201',
  2,
  18.00
);

INSERT INTO orders (id, customer_id, status, total, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000801',
  '00000000-0000-0000-0000-000000000501',
  'PAID',
  36.00,
  CURRENT_TIMESTAMP
);

INSERT INTO order_items (id, order_id, product_id, quantity, unit_price)
VALUES (
  '00000000-0000-0000-0000-000000000901',
  '00000000-0000-0000-0000-000000000801',
  '00000000-0000-0000-0000-000000000201',
  2,
  18.00
);

INSERT INTO loyalty_accounts (customer_id, points)
VALUES (
  '00000000-0000-0000-0000-000000000501',
  10
);

-- Default demo credentials for local/dev seed only:
-- email: juan@mail.com
-- password: Password123
