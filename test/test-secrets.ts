import * as dotenv from 'dotenv';
dotenv.config();

import { getDbCredentials } from '../src/infrastructure/database/postgres.secrets';

async function testDbCredentials() {
  console.log('🔍 Probando getDbCredentials()...\n');
  
  console.log('📋 Variables de entorno cargadas:');
  console.log({
    AWS_REGION: process.env.AWS_REGION,
    DB_SECRET_NAME: process.env.DB_SECRET_NAME,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? '***' : '❌ No definida',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? '***' : '❌ No definida'
  });
  console.log('\n');
  
  try {
    const creds = await getDbCredentials();
    
    console.log('✅ Credenciales cargadas correctamente:\n');
    console.log({
      host: creds.host,
      port: creds.port,
      dbname: creds.dbname,
      username: creds.username,
      password: '***' // No mostrar contraseña
    });
    
    console.log('\n✅ Conexión a RDS lista para usar');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error al cargar credenciales:\n');
    console.error('Tipo:', error.__type || error.name);
    console.error('Mensaje:', error.message);
    console.error('\n📌 Verifica:');
    console.error('  1. AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY en .env');
    console.error('  2. Que las credenciales no hayan expirado');
    console.error('  3. Que el usuario IAM tenga permiso secretsmanager:GetSecretValue');
    console.error('  4. Que el secreto exista en AWS Secrets Manager: ' + process.env.DB_SECRET_NAME);
    console.error('  5. Que la región sea correcta: ' + process.env.AWS_REGION);
    console.error('\nError completo:', error);
    process.exit(1);
  }
}

testDbCredentials();
