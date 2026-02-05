INSERT INTO catalogs (id, name, active)
VALUES ('c1','Vegano',1);

INSERT INTO catalogs (id, name, active)
VALUES ('c2','Proteico',1);

INSERT INTO products (id, name, description, base_price, active, catalog_id)
VALUES ('p1','Ensalada Vegana','100% vegetal',18,1,'c1');

INSERT INTO inventory (product_id, available_quantity, reserved_quantity)
VALUES ('p1',10,0);

INSERT INTO customers (id, name, email, address)
VALUES ('c1','Juan Perez','juan@mail.com','Lima');

INSERT INTO carts (id, customer_id, status)
VALUES ('cart1','c1','ACTIVE');

INSERT INTO cart_items (id, cart_id, product_id, quantity, unit_price)
VALUES ('ci1','cart1','p1',2,18);

INSERT INTO orders (id, customer_id, status, total, created_at)
VALUES ('o1','c1','PAID',36,datetime('now'));

INSERT INTO loyalty_accounts (customer_id, points)
VALUES ('c1',10);
