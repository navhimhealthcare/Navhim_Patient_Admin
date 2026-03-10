import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'

export default function useAuth() {
  const navigate  = useNavigate()
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const login = useCallback(async (credentials) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await authAPI.login(credentials)
      localStorage.setItem('jwt_token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  const logout = useCallback(async () => {
    try { await authAPI.logout() } catch { /* silent */ }
    localStorage.removeItem('jwt_token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }, [navigate])

  return { user, loading, error, login, logout, isAuthenticated: !!user }
}
