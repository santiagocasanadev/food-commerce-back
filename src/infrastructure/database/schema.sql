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
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  address TEXT
);

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
