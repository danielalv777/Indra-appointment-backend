import { SQSEvent } from 'aws-lambda';
import { updateAppointmentStatus } from '../../dbController/dynamoDB/dynamodb';
import { AppointmentConfirmedEvent } from '../../shared/types';

export const handler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    try {
      const body = JSON.parse(record.body);
      // Cuando el evento viene desde EventBridge hacia SQS, el mensaje está anidado
      const eventDetail = body.detail as AppointmentConfirmedEvent;

      await updateAppointmentStatus(
        eventDetail.appointmentId,
        getRandomStatus()
      );
      console.log('✅ Appointment actualizado con exito');
    } catch (error) {
      console.log('❌ Failed to process record:', record, error);
      throw new Error('Failed to process record.');
    }
  }
};

const getRandomStatus = (): 'pending' | 'completed' | 'failed' => {
  const statuses: ('pending' | 'completed' | 'failed')[] = [
    'pending',
    'completed',
    'failed',
  ];
  const randomIndex = Math.floor(Math.random() * statuses.length);
  return statuses[randomIndex];
};
