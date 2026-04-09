import axios from 'axios'

const authApi = axios.create({
  baseURL: 'http://localhost:5000'
})

const profileApi = axios.create({
  baseURL: 'http://localhost:5001'
})

const jobApi = axios.create({
  baseURL: 'http://localhost:5002'
})

const aiApi = axios.create({
  baseURL: 'http://localhost:5003'
})

const clearSession = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('token')
  localStorage.removeItem('user_id')
  localStorage.removeItem('current_user')
}

const setCurrentUser = (user) => {
  if (!user) return
  localStorage.setItem('current_user', JSON.stringify(user))
}

const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem('current_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const getCurrentUserRole = () => getCurrentUser()?.role || 'user'

const getCurrentUserName = () => {
  const user = getCurrentUser()
  if (!user) return 'Connected user'
  return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || 'Connected user'
}

const attachAuthHeader = (config) => {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

const handleAuthError = (err) => {
  if (err?.response?.status === 401) {
    clearSession()
    window.location.href = '/login'
  }
  return Promise.reject(err)
}

;[authApi, profileApi, jobApi, aiApi].forEach((client) => {
  client.interceptors.request.use(attachAuthHeader)
  client.interceptors.response.use((res) => res, handleAuthError)
})

export { authApi, profileApi, jobApi, aiApi, clearSession, setCurrentUser, getCurrentUser, getCurrentUserRole, getCurrentUserName }
export default authApi
