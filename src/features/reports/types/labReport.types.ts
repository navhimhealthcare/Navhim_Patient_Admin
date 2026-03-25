export interface ResultRow {
  name: string;
  value: string;
  normalRange: string;
}

export interface Doctor {
  _id: string;
  name: string;
}

export interface FormState {
  patientName: string;
  doctorId: string;
  doctorName: string;
  testName: string;
  note: string;
  date: string;
}
