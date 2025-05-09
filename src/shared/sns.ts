import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { AppointmentInput } from './validation/appointment';

const client = new SNSClient({});
const topicArn = process.env.SNS_TOPIC_ARN!;

export async function publishToSNS(data: AppointmentInput & { id: string }) {
  try {
    const command = new PublishCommand({
      TopicArn: topicArn,
      Message: JSON.stringify(data),
      MessageAttributes: {
        countryISO: {
          DataType: 'String',
          StringValue: data.countryISO,
        },
      },
    });

    await client.send(command);
    console.log('✅ Exito enviando el SNS');
  } catch (error) {
    console.log('❌ SNS publish error', error);
    throw error;
  }
}
