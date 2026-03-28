INSERT INTO catalogs (id, name, active)
VALUES ('c1','Vegano',1);

INSERT INTO catalogs (id, name, active)
VALUES ('c2','Proteico',1);

INSERT INTO products (id, name, description, base_price, active, catalog_id)
VALUES ('p1','Ensalada Vegana','100% vegetal',18,1,'c1');

INSERT INTO inventory (product_id, available_quantity, reserved_quantity)
VALUES ('p1',10,0);

INSERT INTO users (id, email, name, avatar_url, role, email_verified, created_at, updated_at)
VALUES ('u1','juan@mail.com','Juan Perez',NULL,'CUSTOMER',1,datetime('now'),datetime('now'));

INSERT INTO auth_identities (id, user_id, provider, provider_user_id, email, password_hash, created_at, updated_at)
VALUES ('ai1','u1','email',NULL,'juan@mail.com','$2b$12$examplehashedpasswordvalue',datetime('now'),datetime('now'));

INSERT INTO customers (id, user_id, role)
VALUES ('c1','u1','CUSTOMER');

INSERT INTO carts (id, customer_id, status)
VALUES ('cart1','c1','ACTIVE');

INSERT INTO cart_items (id, cart_id, product_id, quantity, unit_price)
VALUES ('ci1','cart1','p1',2,18);

INSERT INTO orders (id, customer_id, status, total, created_at)
VALUES ('o1','c1','PAID',36,datetime('now'));

INSERT INTO loyalty_accounts (customer_id, points)
VALUES ('c1',10);
