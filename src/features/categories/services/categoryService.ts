import axiosInstance from '../../../services/axiosConfig'
import {
  CategoryApiResponse,
  CategorySingleResponse,
  SubCategorySingleResponse,
} from '../types/category.types'

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } }

export const categoryService = {
  // ── Category ──────────────────────────────────────────────────────
  getAll: () =>
    axiosInstance.get<CategoryApiResponse>('/categories/list'),

  createCategory: (data: { name: string; isActive: boolean }) =>
    axiosInstance.post<CategorySingleResponse>('/categories/add', data),

  updateCategory: (id: string, data: { name: string; isActive: boolean }) =>
    axiosInstance.put<CategorySingleResponse>(`/categories/${id}`, data),

  deleteCategory: (id: string) =>
    axiosInstance.delete(`/categories/${id}`),

  toggleCategory: (id: string, isActive: boolean) =>
    axiosInstance.patch<CategorySingleResponse>(`/categories/${id}/status`, { isActive }),

  // ── SubCategory ───────────────────────────────────────────────────
  createSubCategory: (data: FormData) =>
    axiosInstance.post<SubCategorySingleResponse>('/subcategories/add', data, multipart),

  updateSubCategory: (id: string, data: FormData | object) => {
    const isMultipart = data instanceof FormData;
    return axiosInstance.put<SubCategorySingleResponse>(
      `/subcategories/${id}`,
      data,
      isMultipart ? multipart : {}
    );
  },

  deleteSubCategory: (id: string) =>
    axiosInstance.delete(`/subcategories/${id}`),

  toggleSubCategory: (id: string, isActive: boolean) =>
    axiosInstance.patch<SubCategorySingleResponse>(`/sub-categories/${id}/status`, { isActive }),
}