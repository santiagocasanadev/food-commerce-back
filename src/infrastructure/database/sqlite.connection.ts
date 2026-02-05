import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

export const sqliteDb = new Database(':memory:');

export function initSchema() {
  const basePath = process.cwd(); // raíz del proyecto

  const schemaPath = path.join(
    basePath,
    'src',
    'infrastructure',
    'database',
    'schema.sql'
  );

  const seedPath = path.join(
    basePath,
    'src',
    'infrastructure',
    'database',
    'seed.sql'
  );

  const schema = fs.readFileSync(schemaPath, 'utf-8');
  const seed = fs.readFileSync(seedPath, 'utf-8');

  sqliteDb.exec(schema);
  sqliteDb.exec(seed);
}
