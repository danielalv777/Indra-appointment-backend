import { handler } from '../../../src/lambdas/appointment/handler';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
  Callback,
} from 'aws-lambda';
import {
  createAppointment,
  getAppointmentsByInsuredId,
} from '../../../src/lambdas/appointment/logic';

// Mocks
jest.mock('../../../src/lambdas/appointment/logic');

describe('appointment handler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /appointments', () => {
    it('should create an appointment successfully', async () => {
      const mockEvent: APIGatewayProxyEvent = {
        httpMethod: 'POST',
        body: JSON.stringify({
          insuredId: '00007',
          scheduleId: 1,
          countryISO: 'PE',
          status: 'pending',
          createdAt: new Date().toISOString(),
        }),
        pathParameters: null,
        queryStringParameters: null,
        headers: {},
        multiValueHeaders: {},
        requestContext: {} as any,
        isBase64Encoded: false,
        path: '',
        multiValueQueryStringParameters: null,
        stageVariables: null,
        resource: '',
      };
      const mockContext: Context = {} as Context;
      const mockCallback: Callback = jest.fn();

      // Mocking the logic call
      const createAppointmentMock = createAppointment as jest.Mock;
      createAppointmentMock.mockResolvedValue({ id: 'appointment-id' });

      const response = (await handler(
        mockEvent,
        mockContext,
        mockCallback
      )) as APIGatewayProxyResult;

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.body).message).toBe(
        'Appointment in proccess...'
      );
      expect(createAppointmentMock).toHaveBeenCalled();
    });

    it('should return a 400 for invalid body (validation error)', async () => {
      const mockEvent: APIGatewayProxyEvent = {
        httpMethod: 'POST',
        body: JSON.stringify({
          insuredId: '00007',
          scheduleId: 1,
          countryISO: 'BR',
          status: 'pending',
          createdAt: new Date().toISOString(),
        }),
        pathParameters: null,
        queryStringParameters: null,
        headers: {},
        multiValueHeaders: {},
        requestContext: {} as any,
        isBase64Encoded: false,
        path: '',
        multiValueQueryStringParameters: null,
        stageVariables: null,
        resource: '',
      };

      const mockContext: Context = {} as Context;
      const mockCallback: Callback = jest.fn();

      const response = (await handler(
        mockEvent,
        mockContext,
        mockCallback
      )) as APIGatewayProxyResult;

      expect(response.statusCode).toBe(400);
      const responseBody = JSON.parse(response.body);
      expect(responseBody.message).toBe('Error de validación');
    });
  });

  describe('GET /appointments/{insuredId}', () => {
    it('should get appointments by insuredId successfully', async () => {
      const mockEvent: APIGatewayProxyEvent = {
        httpMethod: 'GET',
        body: null,
        pathParameters: { insuredId: '00007' },
        queryStringParameters: null,
        headers: {},
        multiValueHeaders: {},
        requestContext: {} as any,
        isBase64Encoded: false,
        path: '/appointments',
        multiValueQueryStringParameters: null,
        stageVariables: {},
        resource: '/appointments/{insuredId}',
      };

      const getAppointmentsByInsuredIdMock =
        getAppointmentsByInsuredId as jest.Mock;
      getAppointmentsByInsuredIdMock.mockResolvedValue([
        { id: 'appointment-id', insuredId: '00007' },
      ]);

      const mockContext: Context = {} as Context;
      const mockCallback: Callback = jest.fn();

      const response = (await handler(
        mockEvent,
        mockContext,
        mockCallback
      )) as APIGatewayProxyResult;

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toHaveLength(1);
      expect(getAppointmentsByInsuredIdMock).toHaveBeenCalled();
    });

    it('should return 404 if no appointments found for insuredId', async () => {
      const mockEvent: APIGatewayProxyEvent = {
        httpMethod: 'GET',
        body: null,
        pathParameters: { insuredId: '12344' },
        queryStringParameters: null,
        headers: {},
        multiValueHeaders: {},
        requestContext: {} as any,
        isBase64Encoded: false,
        path: '/appointments',
        multiValueQueryStringParameters: null,
        stageVariables: {},
        resource: '/appointments/{insuredId}',
      };

      const getAppointmentsByInsuredIdMock =
        getAppointmentsByInsuredId as jest.Mock;
      getAppointmentsByInsuredIdMock.mockResolvedValue([]); // Simula que no hay citas

      const mockContext: Context = {} as Context;
      const mockCallback: Callback = jest.fn();

      const response = (await handler(
        mockEvent,
        mockContext,
        mockCallback
      )) as APIGatewayProxyResult;

      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body).message).toBe(
        'No appointments found for insuredId: 12344'
      );
    });
  });

  describe('Error Handling', () => {
    it('should return 405 for unsupported HTTP methods', async () => {
      const mockEvent: APIGatewayProxyEvent = {
        httpMethod: 'PUT',
        body: null,
        pathParameters: null,
        queryStringParameters: null,
        headers: {},
        multiValueHeaders: {},
        requestContext: {} as any,
        isBase64Encoded: false,
        path: '/appointments',
        multiValueQueryStringParameters: null,
        stageVariables: {},
        resource: '/appointments/{insuredId}',
      };

      const mockContext: Context = {} as Context;
      const mockCallback: Callback = jest.fn();

      const response = (await handler(
        mockEvent,
        mockContext,
        mockCallback
      )) as APIGatewayProxyResult;

      expect(response.statusCode).toBe(405);
      expect(response.body).toContain('Method PUT not allowed');
    });

    it('should return a 500 if an unknown error occurs', async () => {
      const mockEvent: APIGatewayProxyEvent = {
        httpMethod: 'POST',
        body: JSON.stringify({
          insuredId: '00007',
          scheduleId: 1,
          countryISO: 'PE',
          status: 'pending',
          createdAt: new Date().toISOString(),
        }),
        pathParameters: null,
        queryStringParameters: null,
        headers: {},
        multiValueHeaders: {},
        requestContext: {} as any,
        isBase64Encoded: false,
        path: '/appointments',
        multiValueQueryStringParameters: null,
        stageVariables: {},
        resource: '/appointments/{insuredId}',
      };

      const createAppointmentMock = createAppointment as jest.Mock;
      createAppointmentMock.mockRejectedValue(new Error('Unexpected error'));

      const mockContext: Context = {} as Context;
      const mockCallback: Callback = jest.fn();

      const response = (await handler(
        mockEvent,
        mockContext,
        mockCallback
      )) as APIGatewayProxyResult;

      expect(response.statusCode).toBe(500);
      expect(response.body).toContain('Internal server error');
    });
  });
});
