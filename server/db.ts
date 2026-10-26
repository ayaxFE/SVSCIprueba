// server/db.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Pool de conexiones optimizado para concurrencia en servidor local o Neon PostgreSQL
export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'svsci_areco',
  max: 20, // Máximo de sockets concurrentes permitidos
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('[DATABASE ERROR] Falla inesperada en el pool de PostgreSQL:', err);
});