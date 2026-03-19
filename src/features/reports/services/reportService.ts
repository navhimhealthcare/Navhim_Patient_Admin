import axiosInstance from '../../../services/axiosConfig'
import { ReportListResponse, ReportSingleResponse, CreateReportPayload } from '../types/report.types'

// GET  reports/patient-reports
export const fetchPatientReportsAPI = (params: {
  patientId: string
  fromDate?: string
  toDate?:   string
}) =>
  axiosInstance.get<ReportListResponse>('/reports/patient-reports', { params })

// POST admin/create-for-patient
export const createPatientReportAPI = (payload: CreateReportPayload) =>
  axiosInstance.post<ReportSingleResponse>('/reports/create-for-patient', payload)

