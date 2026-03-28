exports.up = (pgm) => {
  pgm.addColumn('customers', {
    user_id: { type: 'uuid' },
    role: { type: 'text', notNull: true, default: 'CUSTOMER' }
  });

  pgm.addConstraint(
    'customers',
    'fk_customers_user',
    'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE'
  );

  pgm.createIndex('customers', 'user_id', {
    name: 'idx_customers_user_id',
    unique: true
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('customers', 'user_id', {
    name: 'idx_customers_user_id',
    ifExists: true
  });

  pgm.dropConstraint('customers', 'fk_customers_user', {
    ifExists: true
  });

  pgm.dropColumn('customers', 'user_id', {
    ifExists: true
  });

  pgm.dropColumn('customers', 'role', {
    ifExists: true
  });
};
