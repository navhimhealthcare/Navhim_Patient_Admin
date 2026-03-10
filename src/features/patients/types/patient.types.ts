export interface PatientLocation {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

export interface Patient {
  _id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  avatar: string | null;
  bloodGroup?: string;
  nfcCardNumber?: string;
  emergencyContact?: string;
  height?: number;
  weight?: number | null;
  fcmToken?: string | null;
  location?: PatientLocation;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PatientFormValues {
  avatar: File | null; // ← new file
  existingAvatar: string; // ← current URL from API
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  nfcCardNumber: string;
  emergencyContact: string;
  height: string;
  weight: string;
  lat: string;
  lng: string;
  isActive: boolean;
}
export interface PatientFormAddValues {
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
}

export interface PatientFilter {
  search: string;
  gender: string;
  bloodGroup: string;
  status: "all" | "active" | "inactive";
}

export interface PatientApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: Patient[];
}

export interface PatientSingleResponse {
  success: boolean;
  status: number;
  message: string;
  data: Patient;
}
