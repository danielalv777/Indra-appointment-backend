import { saveToMySQL } from '../../../src/dbController/mysql/rds_appointment';
import { getPool } from '../../../src/shared/mysql';
import { Appointment } from '../../../src/shared/types';

jest.mock('../../../src/shared/mysql');

describe('saveToMySQL', () => {
  let mockQuery: jest.Mock;
  let mockRelease: jest.Mock;

  beforeEach(() => {
    mockQuery = jest.fn();
    mockRelease = jest.fn();

    (getPool as jest.Mock).mockReturnValue({
      getConnection: jest.fn().mockResolvedValue({
        query: mockQuery,
        release: mockRelease,
      }),
    });
  });

  it('should insert data successfully into MySQL', async () => {
    const validAppointment: Appointment = {
      id: '123',
      insuredId: '00001',
      scheduleId: 1001,
      countryISO: 'PE',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    mockQuery.mockResolvedValueOnce({ affectedRows: 1 });

    await expect(saveToMySQL(validAppointment)).resolves.not.toThrow();

    expect(mockQuery).toHaveBeenCalledWith(
      'INSERT INTO appointments (idDynamo, insuredId, scheduleId, countryISO, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      [
        validAppointment.id,
        validAppointment.insuredId,
        validAppointment.scheduleId,
        validAppointment.countryISO,
        validAppointment.status,
        validAppointment.createdAt,
      ]
    );

    expect(mockRelease).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if there is a problem inserting into MySQL', async () => {
    const invalidAppointment: Appointment = {
      id: '123',
      insuredId: '00001',
      scheduleId: 1001,
      countryISO: 'PE',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    mockQuery.mockRejectedValueOnce(new Error('MySQL error'));

    await expect(saveToMySQL(invalidAppointment)).rejects.toThrow(
      'Error al guardar en MySQL: Error: MySQL error'
    );

    expect(mockRelease).toHaveBeenCalledTimes(1);
  });
});
