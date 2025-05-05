const mockSend = jest.fn();

jest.mock('@aws-sdk/client-eventbridge', () => {
  const original = jest.requireActual('@aws-sdk/client-eventbridge');
  return {
    ...original,
    EventBridgeClient: jest.fn().mockImplementation(() => ({
      send: mockSend,
    })),
    PutEventsCommand: original.PutEventsCommand,
  };
});

import { sendConfirmationToEventBridge } from '../../src/shared/eventbridge';

describe('sendConfirmationToEventBridge', () => {
  const appointmentId = 'appt-123';
  const countryISO = 'PE';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EVENT_BUS_NAME = 'test-bus';
  });

  it('should send event to EventBridge successfully', async () => {
    mockSend.mockResolvedValue({});

    await expect(
      sendConfirmationToEventBridge(appointmentId, countryISO)
    ).resolves.not.toThrow();

    const commandArg = mockSend.mock.calls[0][0];
    expect(commandArg.input).toMatchObject({
      Entries: [
        {
          Source: 'appointments',
          DetailType: 'AppointmentConfirmed',
          Detail: JSON.stringify({ appointmentId, countryISO }),
          EventBusName: 'test-bus',
        },
      ],
    });
  });

  it('should throw error when EventBridge fails', async () => {
    const error = new Error('EventBridge failed');
    mockSend.mockRejectedValue(error);

    await expect(
      sendConfirmationToEventBridge(appointmentId, countryISO)
    ).rejects.toThrow(
      '❌ Failed to send EventBridge event con mensaje de Error: EventBridge failed'
    );

    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('should use default bus name when EVENT_BUS_NAME is not defined', async () => {
    delete process.env.EVENT_BUS_NAME;
    mockSend.mockResolvedValue({});

    await sendConfirmationToEventBridge(appointmentId, countryISO);

    const commandArg = mockSend.mock.calls[0][0];
    expect(commandArg.input.Entries[0].EventBusName).toBe('default');
  });
});
