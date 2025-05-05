import AWS from 'aws-sdk';
import { Appointment } from '../../shared/types';

const dynamo = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.APPOINTMENTS_TABLE!;

export async function saveAppointmentToDynamo(item: Appointment) {
  try {
    await dynamo
      .put({
        TableName: tableName,
        Item: item,
      })
      .promise();
  } catch (error) {
    console.error('Error saving appointment to DynamoDB:', error);
    throw new Error('Error saving appointment');
  }
}

export async function queryAppointmentsByInsuredId(insuredId: string) {
  try {
    const result = await dynamo
      .query({
        TableName: tableName,
        IndexName: 'insuredId-index',
        KeyConditionExpression: 'insuredId = :insuredId',
        ExpressionAttributeValues: {
          ':insuredId': insuredId,
        },
      })
      .promise();

    return result.Items || [];
  } catch (error) {
    console.error('Error querying DynamoDB for appointments:', error);
    throw new Error('Error querying appointments from DynamoDB');
  }
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: 'pending' | 'completed' | 'failed'
) {
  try {
    console.log(
      'Intentando actualizar el status del Appointment in DynamoDB',
      appointmentId
    );
    await dynamo
      .update({
        TableName: tableName,
        Key: {
          id: appointmentId,
        },
        UpdateExpression: 'set #s = :status',
        ExpressionAttributeNames: {
          '#s': 'status',
        },
        ExpressionAttributeValues: {
          ':status': status,
        },
        ConditionExpression: 'attribute_exists(id)',
      })
      .promise();
    console.log('Se actualizo con exito !!');
  } catch (error) {
    console.error('Error updating appointment status in DynamoDB:', error);
    throw new Error('Error updating appointment status');
  }
}
