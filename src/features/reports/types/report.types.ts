export interface ReportResult {
  _id: string;
  name: string;
  value: string;
  normalRange: string;
}

export interface PatientReport {
  _id: string;
  patientId: string;
  doctorId: string;
  testName: string;
  results: ReportResult[];
  note: string;
  pdfKey: string;
  pdfUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportFilter {
  fromDate: string;
  toDate: string;
}

// ── Create report ─────────────────────────────────────────────────────────
export interface CreateReportResultForm {
  name: string;
  value: string;
  normalRange: string;
}

export interface CreateReportPayload {
  patientId: string;
  doctorId: string;
  testName: string;
  results: CreateReportResultForm[];
  note: string;
}

// ── API response shapes ───────────────────────────────────────────────────
export interface ReportListResponse {
  success: boolean;
  status: number;
  message: string;
  data: PatientReport[];
}

export interface ReportSingleResponse {
  success: boolean;
  status: number;
  message: string;
  data: PatientReport;
}
