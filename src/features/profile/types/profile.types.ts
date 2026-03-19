// ── Admin Profile ─────────────────────────────────────────────────────────
export interface AdminProfile {
  _id:       string
  name:      string
  email:     string
  mobile:    string
  address:   string
  state:     string
  district:  string
  avatar:    string | null
  role:      string
  createdAt: string
  updatedAt: string
}

export interface AdminProfileUpdatePayload {
  name:     string
  email:    string
  mobile:   string
  address:  string
  state:    string
  district: string
  avatar?:  File | null
}

// ── API response shapes ───────────────────────────────────────────────────
export interface ProfileResponse {
  success: boolean
  status:  number
  message: string
  data:    AdminProfile
}
