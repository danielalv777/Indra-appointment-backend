import { APIGatewayProxyHandler } from 'aws-lambda';
import fs from 'fs';
import path from 'path';

// Cargar el archivo Swagger JSON
const swaggerFile = path.resolve(__dirname, './openapi.json');
console.log('Current directory:', __dirname);
console.log('swaggerFile ***', swaggerFile);
const swaggerData = fs.readFileSync(swaggerFile, 'utf8');
console.log('swaggerData ***', swaggerData);

export const handler: APIGatewayProxyHandler = async () => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: swaggerData,
  };
};
