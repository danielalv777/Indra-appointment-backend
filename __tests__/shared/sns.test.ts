process.env.SNS_TOPIC_ARN = 'arn:aws:sns:us-east-1:123456789012:MyTopic';
import { publishToSNS } from '../../src/shared/sns';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { AppointmentInput } from '../../src/shared/validation/appointment';

describe('publishToSNS', () => {
  const mockSend = jest.fn();
  const mockSNSClient = SNSClient as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(SNSClient.prototype, 'send').mockImplementation(mockSend);
    process.env.SNS_TOPIC_ARN = 'arn:aws:sns:us-east-1:123456789012:MyTopic';
  });

  const validData: AppointmentInput & { id: string } = {
    id: 'uuid-123',
    insuredId: '12345',
    scheduleId: 100,
    countryISO: 'CL',
  };

  it('should publish SNS message successfully', async () => {
    mockSend.mockResolvedValue({});

    await expect(publishToSNS(validData)).resolves.not.toThrow();

    expect(mockSend).toHaveBeenCalledWith(expect.any(PublishCommand));

    const sentCommand = mockSend.mock.calls[0][0];
    expect(sentCommand.input).toMatchObject({
      TopicArn: process.env.SNS_TOPIC_ARN,
      Message: JSON.stringify(validData),
      MessageAttributes: {
        countryISO: {
          DataType: 'String',
          StringValue: 'CL',
        },
      },
    });
  });

  it('should throw error if SNS publish fails', async () => {
    const error = new Error('SNS failed');
    mockSend.mockRejectedValue(error);

    await expect(publishToSNS(validData)).rejects.toThrow('SNS failed');
    expect(mockSend).toHaveBeenCalledTimes(1);
  });
});
