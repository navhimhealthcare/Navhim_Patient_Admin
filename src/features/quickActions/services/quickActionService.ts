import axiosInstance from "../../../services/axiosConfig";
import {
  QuickActionListResponse,
  QuickActionSingleResponse,
} from "../types/quickAction.types";

const multipart = { headers: { "Content-Type": "multipart/form-data" } };

export const quickActionService = {
  /** GET /quick-actions */
  getAll: () => axiosInstance.get<QuickActionListResponse>("/quick-actions"),

  /** GET /quick-actions/:id */
  getById: (id: string) =>
    axiosInstance.get<QuickActionSingleResponse>(`/quick-actions/${id}`),

  /** POST /quick-actions  (multipart: name + image file) */
  create: (data: FormData) =>
    axiosInstance.post<QuickActionSingleResponse>(
      "/quick-actions/add",
      data,
      multipart,
    ),

  /** PUT /quick-actions/:id  (multipart when image changed, JSON otherwise) */
  update: (id: string, data: FormData | object, hasNewImage: boolean) =>
    hasNewImage
      ? axiosInstance.put<QuickActionSingleResponse>(
          `/quick-actions/${id}`,
          data,
          multipart,
        )
      : axiosInstance.put<QuickActionSingleResponse>(
          `/quick-actions/${id}`,
          data,
        ),

  /** DELETE /quick-actions/:id */
  remove: (id: string) => axiosInstance.delete(`/quick-actions/${id}`),
};
