import { Appointment } from '../../shared/types';
import { getPool } from '../../shared/mysql';

export async function saveToMySQL(data: Appointment) {
  console.log('data enviada al controlador mysql', data);

  const { id, insuredId, scheduleId, countryISO, status, createdAt } = data;

  let conn;
  try {
    conn = await getPool().getConnection();
    const result = await conn.query(
      'INSERT INTO appointments (idDynamo, insuredId, scheduleId, countryISO, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      [id, insuredId, scheduleId, countryISO, status, createdAt]
    );
    console.log('Inserción exitosa:', result);
  } catch (error) {
    console.error('Error al guardar en MySQL:', error);
    throw new Error(`Error al guardar en MySQL: ${error}`);
  } finally {
    if (conn) {
      conn.release(); // liberar la conexion
    }
  }
}
