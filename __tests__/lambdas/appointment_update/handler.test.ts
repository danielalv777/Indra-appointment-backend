import { updateAppointmentStatus } from '../../../src/dbController/dynamoDB/dynamodb';
import { handler } from '../../../src/lambdas/appointment_update/handler';
import { SQSEvent } from 'aws-lambda';

jest.mock('../../../src/dbController/dynamoDB/dynamodb', () => ({
  updateAppointmentStatus: jest.fn(),
}));

describe('SQS Handler Update Dynamo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update appointment status with a valid appointmentId', async () => {
    // Forzamos Math.random para que getRandomStatus devuelva 'completed'
    jest.spyOn(Math, 'random').mockReturnValue(0.5); // índice 1 → 'completed'

    const appointmentId = 'appt-999';
    const sqsEvent: SQSEvent = {
      Records: [
        {
          body: JSON.stringify({
            detail: {
              appointmentId,
            },
          }),
        } as any,
      ],
    };

    await handler(sqsEvent);

    expect(updateAppointmentStatus).toHaveBeenCalledWith(
      appointmentId,
      'completed'
    );

    // Restaurar Math.random
    jest.spyOn(Math, 'random').mockRestore();
  });

  it('should throw error and not call updateAppointmentStatus if JSON is invalid', async () => {
    const sqsEvent: SQSEvent = {
      Records: [
        {
          body: 'invalid-json',
        } as any,
      ],
    };

    await expect(handler(sqsEvent)).rejects.toThrow(
      'Failed to process record.'
    );
    expect(updateAppointmentStatus).not.toHaveBeenCalled();
  });
});
