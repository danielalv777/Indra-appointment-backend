import {
  createAppointment,
  getAppointmentsByInsuredId,
} from '../../../src/lambdas/appointment/logic';
import {
  saveAppointmentToDynamo,
  queryAppointmentsByInsuredId,
} from '../../../src/dbController/dynamoDB/dynamodb';
import { publishToSNS } from '../../../src/shared/sns';
import { v4 as uuidv4 } from 'uuid';
import { AppointmentInput } from '../../../src/shared/validation/appointment';

jest.mock('uuid', () => ({ v4: jest.fn() }));
jest.mock('../../../src/dbController/dynamoDB/dynamodb', () => ({
  saveAppointmentToDynamo: jest.fn(),
  queryAppointmentsByInsuredId: jest.fn(),
}));
jest.mock('../../../src/shared/sns', () => ({
  publishToSNS: jest.fn(),
}));

describe('Appointment service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createAppointment should create and publish appointment', async () => {
    const mockId = '123e4567-e89b-12d3-a456-426614174000';
    (uuidv4 as jest.Mock).mockReturnValue(mockId);

    const input: AppointmentInput = {
      insuredId: '00001',
      scheduleId: 101,
      countryISO: 'PE',
    };

    const result = await createAppointment(input);

    expect(uuidv4).toHaveBeenCalled();
    expect(saveAppointmentToDynamo).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockId,
        ...input,
        status: 'pending',
      })
    );
    expect(publishToSNS).toHaveBeenCalledWith(
      expect.objectContaining({ id: mockId })
    );
    expect(result).toEqual({ id: mockId });
  });

  test('getAppointmentsByInsuredId should call query with insuredId', async () => {
    const insuredId = '00001';
    const mockResponse = [
      { insuredId: '00001', scheduleId: 101, countryISO: 'CL' },
      { insuredId: '00001', scheduleId: 101, countryISO: 'PE' },
    ];
    (queryAppointmentsByInsuredId as jest.Mock).mockResolvedValue(mockResponse);

    const result = await getAppointmentsByInsuredId(insuredId);

    expect(queryAppointmentsByInsuredId).toHaveBeenCalledWith(insuredId);
    expect(result).toEqual(mockResponse);
  });
});
