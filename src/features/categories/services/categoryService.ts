import axiosInstance from "../../../services/axiosConfig";
import { CategoryApiResponse } from "../types/category.types";

export const categoryService = {
  getAll: () => axiosInstance.get<CategoryApiResponse>("/categories/list"),
};
