import axios from 'axios'
import { API_BASE_URL, LOCAL_DATA_STORE } from '../utils/constants'
import { getLocalStorageItem } from '../utils/helpers'

const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request interceptor: attach JWT ──────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getLocalStorageItem(LOCAL_DATA_STORE.JWT_TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ── Response interceptor: handle 401 ─────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default axiosInstance
