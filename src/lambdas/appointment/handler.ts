import { APIGatewayProxyHandler } from 'aws-lambda';
import {
  AppointmentSchema,
  InsuredIdParamSchema,
} from '../../shared/validation/appointment';
import { createAppointment, getAppointmentsByInsuredId } from './logic';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const method = event.httpMethod;

    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const parsed = AppointmentSchema.parse(body);
      console.log('Appointment PARSED', parsed);
      const result = await createAppointment(parsed);
      return {
        statusCode: 201,
        body: JSON.stringify({
          message: 'Appointment in proccess...',
          id: result.id,
        }),
      };
    }

    if (method === 'GET') {
      const pathParams = InsuredIdParamSchema.parse(event.pathParameters || {});
      const appointments = await getAppointmentsByInsuredId(
        pathParams.insuredId
      );

      if (appointments.length === 0) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: `Agendamientos no encontrados para el Id del asegurado: ${pathParams.insuredId}`,
          }),
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify(appointments),
      };
    }

    return {
      statusCode: 405,
      headers: { Allow: 'GET, POST' },
      body: JSON.stringify({ error: `Method ${method} not allowed` }),
    };
  } catch (error: any) {
    console.log('❌ Error en Appointment', error);
    if (error.name === 'ZodError') {
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: 'Error de validación',
          errors: error.issues.map((issue: any) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        }),
      };
    }

    if (error instanceof SyntaxError) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Error en al estructura de la solicitud',
          error: error.message,
        }),
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ message: '❌ Internal server error', error }),
    };
  }
};
