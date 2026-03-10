import axiosInstance from "../../../services/axiosConfig";
import {
  PatientApiResponse,
  PatientFormAddValues,
  PatientSingleResponse,
} from "../types/patient.types";

const multipart = { headers: { "Content-Type": "multipart/form-data" } };

export const patientService = {
  getAll: (params?: object) =>
    axiosInstance.get<PatientApiResponse>("/patients/list", { params }),

  create: (data: PatientFormAddValues) =>
    axiosInstance.post<PatientSingleResponse>("/auth/register", data),

  update: (id: string, data: FormData) =>
    axiosInstance.put<PatientSingleResponse>(
      `/patients/update/${id}`,
      data,
      multipart,
    ),

  remove: (id: string) => axiosInstance.delete(`/patients/${id}`),
};
