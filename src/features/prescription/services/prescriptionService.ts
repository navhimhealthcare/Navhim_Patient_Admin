import axiosInstance from '../../../services/axiosConfig'
import { PrescriptionListResponse } from '../types/prescription.types'

export const prescriptionService = {
  // GET prescriptions/patient  — admin fetch by patientId + date filters
  getByPatient: (params: { patientId?: string; fromDate?: string; toDate?: string }) =>
    axiosInstance.get<PrescriptionListResponse>('/priscriptions/patient', { params }),
}
