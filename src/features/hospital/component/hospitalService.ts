import axiosInstance from "../../../services/axiosConfig";
import {
  HospitalApiResponse,
  HospitalSingleResponse,
} from "../../hospital/component/types/hospital.types";

export const hospitalService = {
  getAll: (params?: object) =>
    axiosInstance.get<HospitalApiResponse>("/hospitals/hospital-list", { params }),

  create: (data: object) =>
    axiosInstance.post<HospitalSingleResponse>("/hospitals/add", data),

  update: (id: string, data: object) =>
    axiosInstance.put<HospitalSingleResponse>(`/hospitals/${id}`, data),

  remove: (id: string) => axiosInstance.delete(`/hospitals/${id}`),

  toggleStatus: (id: string, isActive: boolean) =>
    axiosInstance.patch<HospitalSingleResponse>(`/hospitals/${id}/status`, {
      isActive,
    }),
};
