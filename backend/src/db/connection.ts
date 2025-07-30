import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';
import { DatabaseConfig } from '../types';

dotenv.config();

const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'chronoline_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1qwertyu'
};

const poolConfig: PoolConfig = {
  ...dbConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool; 