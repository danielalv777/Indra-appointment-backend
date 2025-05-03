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
  const result = await dynamo
    .query({
      TableName: tableName,
      KeyConditionExpression: 'insuredId = :insuredId',
      ExpressionAttributeValues: {
        ':insuredId': insuredId,
      },
    })
    .promise();

  return result.Items || [];
}
