import axiosInstance from './axiosConfig'

// ── Generic helpers ───────────────────────────────────────────────────
const get    = (url: string, params?: any) => axiosInstance.get(url, { params })
const post   = (url: string, data?: any)   => axiosInstance.post(url, data)
const put    = (url: string, data?: any)   => axiosInstance.put(url, data)
const patch  = (url: string, data?: any)   => axiosInstance.patch(url, data)
const del    = (url: string)         => axiosInstance.delete(url)

// ── Auth ──────────────────────────────────────────────────────────────
export const authAPI = {
  login:   (credentials) => post('/auth/login', credentials),
  logout:  ()            => post('/auth/logout'),
  me:      ()            => get('/auth/me'),
  refresh: ()            => post('/auth/refresh'),
}

// ── Dashboard ─────────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats:       () => get('/dashboard/stats'),
  getActivity:    () => get('/dashboard/activity'),
  getChartData:   () => get('/dashboard/chart'),
}

// ── Appointments ──────────────────────────────────────────────────────
export const appointmentsAPI = {
  getAll:   (params) => get('/appointments', params),
  getById:  (id)     => get(`/appointments/${id}`),
  create:   (data)   => post('/appointments', data),
  update:   (id, data) => put(`/appointments/${id}`, data),
  cancel:   (id)     => patch(`/appointments/${id}/cancel`),
  delete:   (id)     => del(`/appointments/${id}`),
}

// ── Patients ──────────────────────────────────────────────────────────
export const patientsAPI = {
  getAll:   (params) => get('/patients', params),
  getById:  (id)     => get(`/patients/${id}`),
  create:   (data)   => post('/patients', data),
  update:   (id, data) => put(`/patients/${id}`, data),
  delete:   (id)     => del(`/patients/${id}`),
}

// ── Doctors ───────────────────────────────────────────────────────────
export const doctorsAPI = {
  getAll:   (params) => get('/doctors', params),
  getById:  (id)     => get(`/doctors/${id}`),
  create:   (data)   => post('/doctors', data),
  update:   (id, data) => put(`/doctors/${id}`, data),
  delete:   (id)     => del(`/doctors/${id}`),
}
