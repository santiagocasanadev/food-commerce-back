-- =========================
-- Auth
-- =========================
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255) NOT NULL,
  image_url TEXT,
  address TEXT,
  birth_date DATE,
  gender VARCHAR(50),
  role VARCHAR(50) NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'ADMIN', 'OPERATOR')),
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE auth_identities (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  provider VARCHAR(50) NOT NULL CHECK (provider IN ('email', 'google', 'facebook', 'apple')),
  provider_user_id VARCHAR(255),
  email VARCHAR(255),
  password_hash TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_auth_identity_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE UNIQUE INDEX uq_auth_identity_provider_user
  ON auth_identities(provider, provider_user_id);

CREATE UNIQUE INDEX uq_auth_identity_email_provider
  ON auth_identities(provider, email);

CREATE TABLE auth_sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  refresh_token TEXT NOT NULL,
  user_agent TEXT,
  ip_address VARCHAR(255),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_auth_session_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE UNIQUE INDEX uq_auth_sessions_refresh_token ON auth_sessions(refresh_token);

CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  consumed BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_email_verification_tokens_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_email_verification_tokens_user_id
  ON email_verification_tokens(user_id);


-- =========================
-- Catalogs
-- =========================
CREATE TABLE catalogs (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  active BOOLEAN NOT NULL
);

-- =========================
-- Products
-- =========================
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price NUMERIC(10,2) NOT NULL,
  active BOOLEAN NOT NULL,
  catalog_id UUID NOT NULL,
  CONSTRAINT fk_products_catalog
    FOREIGN KEY (catalog_id)
    REFERENCES catalogs(id)
);

CREATE INDEX idx_products_catalog_id ON products(catalog_id);

-- =========================
-- Inventory
-- =========================
CREATE TABLE inventory (
  product_id UUID PRIMARY KEY,
  available_quantity INTEGER NOT NULL CHECK (available_quantity >= 0),
  reserved_quantity INTEGER NOT NULL CHECK (reserved_quantity >= 0),
  CONSTRAINT fk_inventory_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)
);

-- =========================
-- Customers
-- =========================
CREATE TABLE customers (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'ADMIN', 'OPERATOR')),
  CONSTRAINT fk_customers_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_customers_user_id ON customers(user_id);

-- =========================
-- Carts
-- =========================
CREATE TABLE carts (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL,
  status VARCHAR(50) NOT NULL,
  CONSTRAINT fk_carts_customer
    FOREIGN KEY (customer_id)
    REFERENCES customers(id)
);

CREATE INDEX idx_carts_customer_id ON carts(customer_id);

-- =========================
-- Cart Items
-- =========================
CREATE TABLE cart_items (
  id UUID PRIMARY KEY,
  cart_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL,
  CONSTRAINT fk_cart_items_cart
    FOREIGN KEY (cart_id)
    REFERENCES carts(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)
);

CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);

-- =========================
-- Orders
-- =========================
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL,
  status VARCHAR(50) NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_orders_customer
    FOREIGN KEY (customer_id)
    REFERENCES customers(id)
);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);

-- =========================
-- Order Items
-- =========================
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL,
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- =========================
-- Loyalty Accounts
-- =========================
CREATE TABLE loyalty_accounts (
  customer_id UUID PRIMARY KEY,
  points INTEGER NOT NULL CHECK (points >= 0),
  CONSTRAINT fk_loyalty_customer
    FOREIGN KEY (customer_id)
    REFERENCES customers(id)
);
