import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';

const client = new EventBridgeClient({ region: 'us-west-2' });

export const sendConfirmationToEventBridge = async (
  appointmentId: string,
  countryISO: string
) => {
  try {
    const command = new PutEventsCommand({
      Entries: [
        {
          Source: 'appointments', // Fuente del evento
          DetailType: 'AppointmentConfirmed',
          Detail: JSON.stringify({
            appointmentId,
            countryISO,
          }),
          EventBusName: process.env.EVENT_BUS_NAME || 'default',
        },
      ],
    });

    await client.send(command);
    console.log(`✅ Evento enviado al eventbridge: ${appointmentId}`);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `❌ Failed to send EventBridge event con mensaje de Error: ${error.message}`
      );
    } else {
      throw new Error('❌ Failed to send EventBridge event: Unknown error');
    }
  }
};
