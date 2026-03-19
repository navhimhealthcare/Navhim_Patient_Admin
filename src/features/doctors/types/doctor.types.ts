export interface DoctorSpecialization {
  _id:       string
  name:      string
  isActive:  boolean
  createdAt: string
  updatedAt: string
}

export interface DoctorHospital {
  _id:      string
  name:     string
  address:  string
  phone:    string
  email:    string
  isActive: boolean
  location: { type: 'Point'; coordinates: [number, number] }
}

export interface DoctorAvailability {
  _id:   string
  day:   string
  slots: string[]
}

export interface Doctor {
  _id:              string
  name:             string
  specialization:   DoctorSpecialization
  about:            string
  hospital:         DoctorHospital
  experienceYears:  number
  rating:           number
  reviewsCount:     number
  patientsCount:    number
  availability:     DoctorAvailability[]
  consultationFee:  number
  isFree:           boolean
  isActive:         boolean
  profileImage:     string
  isFavorite:       boolean
  createdAt:        string
  updatedAt:        string
}
export interface Category {
  _id:       string
  name:      string
  isActive:  boolean
  createdAt: string
  updatedAt: string
  subCategories: SubCategory[]
}
export interface DoctorFormValues {
  profileImage:         File | null   // new file selected by user
  existingProfileImage: string        // current image URL from API (keep as-is)
  name:                 string
  about:                string
  specializationId:     string
  hospitalId:           string
  experienceYears:      string
  consultationFee:      string
  isFree:               boolean
  isActive:             boolean
  availability:         { day: string; slots: string[] }[]
   rating?: number | string; 
}

export interface DoctorFilter {
  search:      string
  specialty:   string
  day:         string
  experience:  string
  minFees:     string
  maxFees:     string
  hospital:    string
  status:      'all' | 'active' | 'inactive'
}

export interface DoctorApiResponse {
  success: boolean
  status:  number
  message: string
  data:    Doctor[]
}
export interface CategoryApiResponse {
  success: boolean
  status:  number
  message: string
  data:    Category[]
}
export interface DoctorSingleResponse {
  success: boolean
  status:  number
  message: string
  data:    Doctor
}