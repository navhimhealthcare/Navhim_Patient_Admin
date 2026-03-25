// ── Medicine ──────────────────────────────────────────────────────────────
export interface Medicine {
  _id?:         string
  name:         string
  dosage:       string
  frequency:    string
  times:        string[]
  startDate:    string   // ISO or YYYY-MM-DD
  endDate?:     string
  status?:      string
  takenDates?:  string[]
  missedDates?: string[]
}

// ── Doctor stub inside prescription ──────────────────────────────────────
export interface PrescriptionDoctor {
  _id:          string
  name:         string
  profileImage: string | null
}

// ── Prescription ──────────────────────────────────────────────────────────
export type PrescriptionStatus = 'ongoing' | 'completed' | 'cancelled'

export interface Prescription {
  _id:        string
  patientId:  string
  doctorId:   PrescriptionDoctor
  diagnosis:  string
  pdfKey:     string
  pdfUrl?:    string
  status:     PrescriptionStatus
  medicines:  Medicine[]
  createdAt:  string
  updatedAt:  string
}

// ── Filter ────────────────────────────────────────────────────────────────
export interface PrescriptionFilter {
  fromDate: string   // YYYY-MM-DD or ''
  toDate:   string
  status:   PrescriptionStatus | 'all'
}

// ── Form — medicine row ───────────────────────────────────────────────────
export interface MedicineForm {
  name:      string
  dosage:    string
  frequency: string
  times:     string[]
  startDate: string
  endDate:   string
}

// ── Form — full create prescription ──────────────────────────────────────
export interface PrescriptionForm {
  patientName: string
  doctorId:    string
  doctorName:  string
  diagnosis:   string
  date:        string
}

// ── API responses ─────────────────────────────────────────────────────────
export interface PrescriptionListResponse {
  success: boolean
  status:  number
  message: string
  data:    Prescription[]
}

export interface PrescriptionSingleResponse {
  success: boolean
  status:  number
  message: string
  data:    Prescription
}
