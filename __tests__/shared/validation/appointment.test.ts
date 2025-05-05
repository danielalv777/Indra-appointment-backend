import {
  AppointmentSchema,
  InsuredIdParamSchema,
} from '../../../src/shared/validation/appointment';
import { ZodError } from 'zod';

describe('AppointmentSchema', () => {
  it('should validate a correct appointment input', () => {
    const validData = {
      insuredId: '12345',
      scheduleId: 10,
      countryISO: 'PE',
    };

    expect(() => AppointmentSchema.parse(validData)).not.toThrow();
  });

  it('should fail if insuredId is not 5 digits', () => {
    const invalidData = {
      insuredId: '1234', // too short
      scheduleId: 10,
      countryISO: 'PE',
    };

    expect(() => AppointmentSchema.parse(invalidData)).toThrow(ZodError);
  });

  it('should fail if insuredId is not numeric', () => {
    const invalidData = {
      insuredId: 'abcde', // not numeric
      scheduleId: 10,
      countryISO: 'PE',
    };

    try {
      AppointmentSchema.parse(invalidData);
    } catch (err) {
      const zodError = err as ZodError;
      expect(zodError.errors[0].message).toMatch(/numérico de 5 dígitos/);
    }
  });

  it('should fail if countryISO is not PE or CL', () => {
    const invalidData = {
      insuredId: '12345',
      scheduleId: 10,
      countryISO: 'AR',
    };

    expect(() => AppointmentSchema.parse(invalidData)).toThrow(
      /Invalid enum value/
    );
  });

  it('should fail if scheduleId is negative', () => {
    const invalidData = {
      insuredId: '12345',
      scheduleId: -1,
      countryISO: 'CL',
    };

    expect(() => AppointmentSchema.parse(invalidData)).toThrow(
      /greater than or equal to 0/
    );
  });
});

describe('InsuredIdParamSchema', () => {
  it('should validate a correct insuredId param', () => {
    const validParam = { insuredId: '54321' };
    expect(() => InsuredIdParamSchema.parse(validParam)).not.toThrow();
  });

  it('should fail if insuredId is not 5 characters', () => {
    const invalidParam = { insuredId: '5432' };
    expect(() => InsuredIdParamSchema.parse(invalidParam)).toThrow(/5 dígitos/);
  });

  it('should fail if insuredId is not numeric', () => {
    const invalidParam = { insuredId: 'abcde' };
    expect(() => InsuredIdParamSchema.parse(invalidParam)).toThrow(
      /numérico de 5 dígitos/
    );
  });
});
