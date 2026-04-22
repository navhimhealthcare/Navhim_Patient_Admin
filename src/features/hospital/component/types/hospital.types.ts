export interface HospitalLocation {
  type: 'Point'
  coordinates: [number, number] // [lng, lat]
}

export interface Hospital {
  _id:       string
  name:      string
  address:   string
  phone:     string
  email:     string
  isActive:  boolean
  location:  HospitalLocation
  createdAt: string
  updatedAt: string
  __v:       number
}

export interface HospitalFormValues {
  name:     string
  address:  string
  phone:    string
  email:    string
  lat:      string
  lng:      string
  isActive: boolean
}

export interface PaginationMeta {
  total:      number
  page:       number
  limit:      number
  totalPages: number
}

export interface HospitalFilter {
  search: string
  status: 'all' | 'active' | 'inactive'
}

export interface HospitalParams {
  search?:   string
  isActive?: boolean
  page:      number
  limit:     number
}

export interface HospitalApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    counts: {
      total: number;
      active: number;
      inactive: number;
    };
    hospitals: Hospital[];
  };
  pagination?: PaginationMeta;
}

export interface HospitalSingleResponse {
  success: boolean
  status:  number
  message: string
  data:    Hospital
}