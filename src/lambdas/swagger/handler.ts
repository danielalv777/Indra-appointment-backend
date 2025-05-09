import { APIGatewayProxyHandler } from 'aws-lambda';
import fs from 'fs';
import path from 'path';

// Cargar el archivo Swagger JSON
const swaggerFile = path.resolve(__dirname, './openapi.json');
const swaggerData = fs.readFileSync(swaggerFile, 'utf8');

export const handler: APIGatewayProxyHandler = async () => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: swaggerData,
  };
};
