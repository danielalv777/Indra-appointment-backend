import { handler } from '../../../src/lambdas/appointment_cl/handler';
import { saveToMySQL } from '../../../src/dbController/mysql/rds_appointment';
import { sendConfirmationToEventBridge } from '../../../src/shared/eventbridge';
import { SQSEvent, Context, Callback } from 'aws-lambda';

jest.mock('../../../src/dbController/mysql/rds_appointment', () => ({
  saveToMySQL: jest.fn(),
}));
jest.mock('../../../src/shared/eventbridge', () => ({
  sendConfirmationToEventBridge: jest.fn(),
}));

describe('SQS Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process message and call MySQL and EventBridge functions', async () => {
    const message = {
      id: 'appt-001',
      insuredId: '00001',
      scheduleId: 123,
      countryISO: 'PE',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const snsWrappedMessage = {
      Message: JSON.stringify(message),
    };

    const event: SQSEvent = {
      Records: [
        {
          body: JSON.stringify(snsWrappedMessage),
        } as any,
      ],
    };

    const mockContext: Context = {} as Context;
    const mockCallback: Callback = jest.fn();

    await handler(event, mockContext, mockCallback);

    expect(saveToMySQL).toHaveBeenCalledWith(message);
    expect(sendConfirmationToEventBridge).toHaveBeenCalledWith(
      message.id,
      message.countryISO
    );
  });

  it('should throw error if a required field is missing', async () => {
    const invalidMessage = {
      // falta 'insuredId'
      id: 'appt-001',
      scheduleId: 123,
      countryISO: 'PE',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const snsWrappedMessage = {
      Message: JSON.stringify(invalidMessage),
    };

    const event: SQSEvent = {
      Records: [
        {
          body: JSON.stringify(snsWrappedMessage),
        } as any,
      ],
    };

    const mockContext: Context = {} as Context;
    const mockCallback: Callback = jest.fn();

    await expect(handler(event, mockContext, mockCallback)).rejects.toThrow(
      'Falta el campo: insuredId'
    );
    expect(saveToMySQL).not.toHaveBeenCalled();
    expect(sendConfirmationToEventBridge).not.toHaveBeenCalled();
  });
});
