exports.up = (pgm) => {

  pgm.createTable('catalogs', {
    id: { type: 'uuid', primaryKey: true },
    name: { type: 'text', notNull: true },
    active: { type: 'boolean', notNull: true }
  });

  pgm.createTable('products', {
    id: { type: 'uuid', primaryKey: true },
    name: { type: 'text', notNull: true },
    description: { type: 'text' },
    base_price: { type: 'numeric(10,2)', notNull: true },
    active: { type: 'boolean', notNull: true },
    catalog_id: {
      type: 'uuid',
      references: 'catalogs'
    }
  });

  pgm.createTable('inventory', {
    product_id: {
      type: 'uuid',
      primaryKey: true,
      references: 'products'
    },
    available_quantity: { type: 'integer', notNull: true },
    reserved_quantity: { type: 'integer', notNull: true }
  });

  pgm.createTable('customers', {
    id: { type: 'uuid', primaryKey: true },
    name: { type: 'text', notNull: true },
    email: { type: 'text', notNull: true },
    address: { type: 'text' }
  });

  pgm.createTable('carts', {
    id: { type: 'uuid', primaryKey: true },
    customer_id: {
      type: 'uuid',
      references: 'customers'
    },
    status: { type: 'text', notNull: true }
  });

  pgm.createTable('cart_items', {
    id: { type: 'uuid', primaryKey: true },
    cart_id: {
      type: 'uuid',
      references: 'carts',
      onDelete: 'cascade'
    },
    product_id: {
      type: 'uuid',
      references: 'products'
    },
    quantity: { type: 'integer', notNull: true },
    unit_price: { type: 'numeric(10,2)', notNull: true }
  });

  pgm.createTable('orders', {
    id: { type: 'uuid', primaryKey: true },
    customer_id: {
      type: 'uuid',
      references: 'customers'
    },
    status: { type: 'text', notNull: true },
    total: { type: 'numeric(10,2)', notNull: true },
    created_at: { type: 'timestamp', notNull: true }
  });

  pgm.createTable('order_items', {
    id: { type: 'uuid', primaryKey: true },
    order_id: {
      type: 'uuid',
      references: 'orders',
      onDelete: 'cascade'
    },
    product_id: {
      type: 'uuid',
      references: 'products'
    },
    quantity: { type: 'integer', notNull: true },
    unit_price: { type: 'numeric(10,2)', notNull: true }
  });

  pgm.createTable('loyalty_accounts', {
    customer_id: {
      type: 'uuid',
      primaryKey: true,
      references: 'customers'
    },
    points: { type: 'integer', notNull: true }
  });

};

exports.down = (pgm) => {
  pgm.dropTable('loyalty_accounts');
  pgm.dropTable('order_items');
  pgm.dropTable('orders');
  pgm.dropTable('cart_items');
  pgm.dropTable('carts');
  pgm.dropTable('customers');
  pgm.dropTable('inventory');
  pgm.dropTable('products');
  pgm.dropTable('catalogs');
};

