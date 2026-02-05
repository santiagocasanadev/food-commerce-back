import * as dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { getDbCredentials } from '../src/infrastructure/database/postgres.secrets';
import { v4 as uuidv4 } from 'uuid';

let pool: Pool;

async function initRdsPool() {
  console.log('🔐 Obteniendo credenciales de AWS Secrets Manager...\n');
  const creds = await getDbCredentials();

  console.log('📡 Conectando a RDS...\n');
  pool = new Pool({
    host: creds.host,
    port: creds.port,
    user: creds.username,
    password: creds.password,
    database: creds.dbname,
    ssl: {
      rejectUnauthorized: false // Para desarrollo, sin validar certificado
    }
  });

  // Test conexión
  try {
    await pool.query('SELECT 1');
    console.log('✅ Conexión a RDS exitosa\n');
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    process.exit(1);
  }
}

async function checkTables() {
  console.log('📋 Verificando tablas en RDS...\n');
  
  const result = await pool.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
  );

  if (result.rows.length === 0) {
    console.log('⚠️  No hay tablas. Ejecutando schema.sql...\n');
    await createTables();
  } else {
    console.log('✅ Tablas encontradas:');
    result.rows.forEach(row => console.log(`   - ${row.table_name}`));
    console.log();
  }
}

async function createTables() {
  const schemaPath = path.join(process.cwd(), 'src', 'infrastructure', 'database', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  try {
    await pool.query(schema);
    console.log('✅ Tablas creadas exitosamente\n');
  } catch (error: any) {
    console.error('❌ Error creando tablas:', error.message);
    process.exit(1);
  }
}

async function testInserts() {
  console.log('🧪 Ejecutando pruebas de INSERT...\n');

  try {
    // Insert catalog
    const catalogId = uuidv4();
    console.log('1️⃣  Insertando catálogo...');
    await pool.query(
      'INSERT INTO catalogs (id, name, active) VALUES ($1, $2, $3)',
      [catalogId, 'Test Catalog', true]
    );
    console.log(`   ✅ Catálogo insertado: ${catalogId}\n`);

    // Insert product
    const productId = uuidv4();
    console.log('2️⃣  Insertando producto...');
    await pool.query(
      'INSERT INTO products (id, name, description, base_price, active, catalog_id) VALUES ($1, $2, $3, $4, $5, $6)',
      [productId, 'Test Product', 'A test product', 99.99, true, catalogId]
    );
    console.log(`   ✅ Producto insertado: ${productId}\n`);

    // Insert inventory
    console.log('3️⃣  Insertando inventario...');
    await pool.query(
      'INSERT INTO inventory (product_id, available_quantity, reserved_quantity) VALUES ($1, $2, $3)',
      [productId, 100, 0]
    );
    console.log('   ✅ Inventario insertado\n');

    // Insert customer
    const customerId = uuidv4();
    console.log('4️⃣  Insertando cliente...');
    await pool.query(
      'INSERT INTO customers (id, name, email, address) VALUES ($1, $2, $3, $4)',
      [customerId, 'Test Customer', `test-${Date.now()}@example.com`, '123 Main St']
    );
    console.log(`   ✅ Cliente insertado: ${customerId}\n`);

    // Read back data
    await testSelects(catalogId, productId, customerId);

  } catch (error: any) {
    console.error('❌ Error en INSERT:', error.message);
    console.error(error);
  }
}

async function testSelects(catalogId: string, productId: string, customerId: string) {
  console.log('🔍 Verificando datos insertados...\n');

  try {
    // Read catalog
    const catalogs = await pool.query('SELECT * FROM catalogs WHERE id = $1', [catalogId]);
    console.log('📚 Catálogos:');
    console.log(catalogs.rows[0]);
    console.log();

    // Read product
    const products = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
    console.log('📦 Productos:');
    console.log(products.rows[0]);
    console.log();

    // Read inventory
    const inventory = await pool.query('SELECT * FROM inventory WHERE product_id = $1', [productId]);
    console.log('📊 Inventario:');
    console.log(inventory.rows[0]);
    console.log();

    // Read customer
    const customers = await pool.query('SELECT * FROM customers WHERE id = $1', [customerId]);
    console.log('👤 Clientes:');
    console.log(customers.rows[0]);
    console.log();

    console.log('✅ Todas las pruebas completadas exitosamente');
  } catch (error: any) {
    console.error('❌ Error en SELECT:', error.message);
  }
}

async function main() {
  try {
    await initRdsPool();
    await checkTables();
    await testInserts();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('\n🔌 Conexión cerrada');
  }
}

main();
