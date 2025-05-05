import { SQSEvent, SQSHandler } from 'aws-lambda';
import { saveToMySQL } from '../../dbController/mysql/rds_appointment';
import { sendConfirmationToEventBridge } from '../../shared/eventbridge';

export const handler: SQSHandler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    try {
      const sqsMessage = JSON.parse(record.body);
      console.log('📥 Mensaje recibido de SQS:', sqsMessage);

      // Ahora, extraer y parsear el mensaje que viene dentro de 'Message' (mensaje de SNS)
      const message = JSON.parse(sqsMessage.Message);
      console.log('📥 Mensaje SNS dentro de SQS:', message);

      // Verificar si los campos necesarios están presentes
      const requiredFields = [
        'id',
        'insuredId',
        'scheduleId',
        'countryISO',
        'status',
        'createdAt',
      ];
      for (const field of requiredFields) {
        if (!message[field]) {
          throw new Error(`Falta el campo: ${field}`);
        }
      }

      // Guardar en MySQL
      await saveToMySQL(message);

      console.log('✅ Guardado en MySQL con éxito');

      // Enviar el evento de confirmación a EventBridge
      await sendConfirmationToEventBridge(message.id, message.countryISO);
      console.log('✅ Enviado a EventBridge con exito');
    } catch (err) {
      console.log('❌ Error procesando mensaje:', err);
      // puedes lanzar el error si quieres reintentos
      throw err;
    }
  }
};
