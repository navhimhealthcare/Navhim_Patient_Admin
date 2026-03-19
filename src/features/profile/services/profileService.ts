import axiosInstance from '../../../services/axiosConfig'
import { ProfileResponse } from '../types/profile.types'

// GET  admin/profile
export const fetchProfileAPI = () =>
  axiosInstance.get<ProfileResponse>('/admin/profile')

// PUT  admin/profile  (multipart — avatar is optional File)
export const updateProfileAPI = (payload: FormData) =>
  axiosInstance.put<ProfileResponse>('/admin/update-profile', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
