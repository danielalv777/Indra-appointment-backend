import { z } from 'zod';

export const AppointmentSchema = z.object({
  insuredId: z
    .string()
    .length(5, 'insuredId debe tener exactamente 5 dígitos')
    .regex(/^\d{5}$/, 'insuredId debe ser numérico de 5 dígitos'),
  scheduleId: z.number().int().nonnegative(),
  countryISO: z.enum(['PE', 'CL']),
});

export const InsuredIdParamSchema = z.object({
  insuredId: z
    .string()
    .length(5, 'insuredId debe tener 5 dígitos')
    .regex(/^\d{5}$/, 'insuredId debe ser numérico de 5 dígitos'),
});

export type AppointmentInput = z.infer<typeof AppointmentSchema>;
export type InsuredIdParam = z.infer<typeof InsuredIdParamSchema>;
