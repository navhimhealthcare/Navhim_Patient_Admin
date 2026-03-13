import axiosInstance from "../../../services/axiosConfig";
import {
  AppointmentListResponse,
  AppointmentSingleResponse,
  AppointmentCreateForm,
  AppointmentRescheduleForm,
  SlotApiResponse,
} from "../types/appointment.types";

export const appointmentService = {
  getAll: (params?: object) =>
    axiosInstance.get<AppointmentListResponse>("/appointments/filterList", {
      params,
    }),

  create: (patientId: string, data: Omit<AppointmentCreateForm, "patientId">) =>
    axiosInstance.post<AppointmentSingleResponse>(
      `/appointments/${patientId}/appointments`,
      data,
    ),

  reschedule: (id: string, data: AppointmentRescheduleForm) =>
    axiosInstance.patch<AppointmentSingleResponse>(
      `/appointments/${id}/reschedule`,
      data,
    ),

  updateStatus: (id: string, status: string) =>
    axiosInstance.patch<AppointmentSingleResponse>(
      `/appointments/${id}/status`,
      { status },
    ),

  getAvailableSlots: (doctorId: string, date: string) =>
    axiosInstance.get<SlotApiResponse>("/appointments/available-slots", {
      params: { doctorId, date },
    }),
};
