export interface SubCategory {
  _id: string;
  category: string;
  name: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subCategories: SubCategory[];
}
export interface CategoryApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: Category[];
}
