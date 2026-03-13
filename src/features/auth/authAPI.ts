import axiosInstance from '../../services/axiosConfig'

export const loginAPI = async ({ email, password }) => {
  const response = await axiosInstance.post('/auth/admin-login', { email, password })
  return response.data
}
// export const logoutUser  = ()      => axiosInstance.post('/auth/logout')
// export const getCurrentUser = ()   => axiosInstance.get('/auth/me')
