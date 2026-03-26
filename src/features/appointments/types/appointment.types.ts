export interface AppointmentDoctor {
  _id: string;
  name: string;
  specialization: { _id: string; name: string };
  rating: number;
  reviewsCount: number;
  profileImage: string;
  hospital?: { _id: string; name: string };
}

export interface AppointmentHospital {
  _id: string;
  name: string;
  address: string;
}

export type AppointmentStatus =
  | "upcoming"
  | "completed"
  | "cancelled"
  | "rescheduled"
  | "missed";
export type AppointmentMode = "Online" | "In_Clinic";
export type PaymentStatus = "paid" | "unpaid" | "refunded";
export interface AppointmentPatient {
  _id: string;
  name: string;
  nfcCardNumber?: string;
}
export interface Appointment {
  _id: string;
  patient: AppointmentPatient;
  doctor: AppointmentDoctor;
  hospital: AppointmentHospital;
  appointmentDate: string;
  slot: string;
  reason: string;
  mode: AppointmentMode;
  paymentStatus: PaymentStatus;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentCreateForm {
  patientId: string;
  doctorId: string;
  hospitalId: string;
  appointmentDate: string;
  slot: string;
  reason: string;
  mode: AppointmentMode;
}

export interface AppointmentRescheduleForm {
  appointmentDate: string;
  slot: string;
}

export interface AppointmentFilter {
  search: string;
  status: AppointmentStatus | "all";
  mode: AppointmentMode | "all";
  payment: PaymentStatus | "all";
  startDate: string;
  endDate: string;
}

// ── Slot API ───────────────────────────────────────────────────────────
export interface SlotItem {
  slot: string;
  availability: string; // "true" | "false" (string from API)
}

export interface SlotApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: SlotItem[];
}

// ── API responses ─────────────────────────────────────────────────────
export interface AppointmentListResponse {
  success: boolean;
  status: number;
  message: string;
  data: Appointment[];
}

export interface AppointmentSingleResponse {
  success: boolean;
  status: number;
  message: string;
  data: Appointment;
}
