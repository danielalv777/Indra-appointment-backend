import { v4 as uuidv4 } from 'uuid';
import { AppointmentInput } from '../../shared/validation/appointment';
import {
  saveAppointmentToDynamo,
  queryAppointmentsByInsuredId,
} from '../../dbController/dynamoDB/dynamodb';
import { publishToSNS } from '../../shared/sns';

export async function createAppointment(data: AppointmentInput) {
  const id = uuidv4(); // ID único
  const item = {
    id,
    ...data,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  await saveAppointmentToDynamo(item);
  await publishToSNS(item);

  console.log('✅ SNS publicado:', item);

  return { id };
}

export async function getAppointmentsByInsuredId(insuredId: string) {
  return await queryAppointmentsByInsuredId(insuredId);
}
