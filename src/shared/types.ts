export interface Appointment {
  id: string;
  insuredId: string;
  scheduleId: number;
  countryISO: string;
  status: string;
  createdAt: string;
}

export interface AppointmentConfirmedEvent {
  appointmentId: string;
  countryISO: string;
}
