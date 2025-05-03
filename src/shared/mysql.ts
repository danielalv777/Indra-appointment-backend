import mysql from 'mysql2/promise';

let pool: mysql.Pool;

/**
 * Retorna una instancia singleton del pool de conexiones.
 * Esto permite que la Lambda reutilice la conexión entre invocaciones frías y calientes.
 */
export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.RDS_HOST,
      user: process.env.RDS_USER,
      password: process.env.RDS_PASSWORD,
      database: process.env.RDS_DATABASE,
      port: Number(process.env.RDS_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  return pool;
}
