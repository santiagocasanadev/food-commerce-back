import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({
  region: process.env.AWS_REGION
});

export type DbCredentials = {
  username: string;
  password: string;
  host: string;
  port: number;
  dbname: string;
};

export async function getDbCredentials(): Promise<DbCredentials> {
  const command = new GetSecretValueCommand({
    SecretId: process.env.DB_SECRET_NAME
  });

  const response = await client.send(command);

  if (!response.SecretString) {
    throw new Error('Database secret is empty or undefined');
  }

  return JSON.parse(response.SecretString) as DbCredentials;
}
