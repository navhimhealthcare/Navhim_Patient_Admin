export interface SubCategory {
  _id:       string
  category:  string
  name:      string
  icon:      string
  isActive:  boolean
  createdAt: string
  updatedAt: string
}

export interface Category {
  _id:           string
  name:          string
  isActive:      boolean
  createdAt:     string
  updatedAt:     string
  subCategories: SubCategory[]
}

export interface CategoryFormValues {
  name:     string
  isActive: boolean
}

export interface SubCategoryFormValues {
  name:         string
  categoryId:   string
  icon:         File | null
  existingIcon: string
  isActive:     boolean
}

export interface CategoryApiResponse {
  success: boolean
  status:  number
  message: string
  data:    Category[]
}

export interface CategorySingleResponse {
  success: boolean
  status:  number
  message: string
  data:    Category
}

export interface SubCategorySingleResponse {
  success: boolean
  status:  number
  message: string
  data:    SubCategory
}