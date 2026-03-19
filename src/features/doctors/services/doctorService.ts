import axiosInstance from "../../../services/axiosConfig";
import { buildDoctorPayload } from "../helpers/doctorHelper";
import {
  CategoryApiResponse,
  DoctorApiResponse,
  DoctorFormValues,
  DoctorSingleResponse,
} from "../types/doctor.types";
const multipart = { headers: { "Content-Type": "multipart/form-data" } };

export const doctorService = {
  getAll: (params?: object) =>
    axiosInstance.get<DoctorApiResponse>("/doctors/filter", { params }),
  getCategoryAll: () =>
    axiosInstance.get<CategoryApiResponse>("/categories/list"),

  create: (data: object) =>
    axiosInstance.post<DoctorSingleResponse>(
      "/doctors/add-doctor",
      data,
      multipart,
    ),

  update: (id: string, form: DoctorFormValues) => {
    if (form.profileImage) {
      // Has new file → multipart
      return axiosInstance.put<DoctorSingleResponse>(
        `/doctors/${id}`,
        buildDoctorPayload(form),
        { headers: { "Content-Type": "multipart/form-data" } },
      );
    } else {
      // No new file → plain JSON, pass existing URL directly
      return axiosInstance.put<DoctorSingleResponse>(`/doctors/${id}`, {
        profileImage: form.existingProfileImage || undefined,
        name: form.name.trim(),
        about: form.about.trim(),
        specialization: form.specializationId,
        hospital: form.hospitalId,
        experienceYears: parseInt(form.experienceYears) || 0,
        consultationFee: form.isFree
          ? 0
          : parseFloat(form.consultationFee) || 0,
        isFree: form.isFree,
        isActive: form.isActive,
        rating: Number(form.rating) || 0,
        availability: form.availability,
      });
    }
  },

  remove: (id: string) => axiosInstance.delete(`/doctors/${id}`),

  toggleStatus: (id: string, isActive: boolean) =>
    axiosInstance.patch<DoctorSingleResponse>(`/doctors/${id}/status`, {
      isActive,
    }),
};
