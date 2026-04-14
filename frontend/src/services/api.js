// Centralizes Api logic for the frontend.
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

const documentApi = axios.create({
  baseURL: 'http://localhost:5004'
})

const notificationApi = axios.create({
  baseURL: 'http://localhost:5005'
})

const sessionKeys = ['access_token', 'refresh_token', 'token', 'user_id', 'current_user']

const clearStoredSession = (storage) => {
  sessionKeys.forEach((key) => storage.removeItem(key))
}

const hasStoredSession = (storage) =>
  ['access_token', 'token', 'current_user'].some((key) => Boolean(storage.getItem(key)))

const getActiveStorage = () => {
  if (hasStoredSession(localStorage)) return localStorage
  if (hasStoredSession(sessionStorage)) return sessionStorage
  return localStorage
}

const clearSession = () => {
  clearStoredSession(localStorage)
  clearStoredSession(sessionStorage)
  window.dispatchEvent(new CustomEvent('smartapply:user-changed', { detail: null }))
}

const persistAuthSession = ({ token, refreshToken, user, userId, remember = false }) => {
  const storage = remember ? localStorage : sessionStorage
  const otherStorage = remember ? sessionStorage : localStorage

  clearStoredSession(otherStorage)

  if (token) {
    storage.setItem('access_token', token)
  }

  if (refreshToken) {
    storage.setItem('refresh_token', refreshToken)
  }

  if (userId) {
    storage.setItem('user_id', userId)
  }

  if (user) {
    storage.setItem('current_user', JSON.stringify(user))
  }

  window.dispatchEvent(new CustomEvent('smartapply:user-changed', { detail: user || null }))
}

const setCurrentUser = (user, options = {}) => {
  if (!user) return
  const storage =
    typeof options.remember === 'boolean'
      ? (options.remember ? localStorage : sessionStorage)
      : getActiveStorage()

  storage.setItem('current_user', JSON.stringify(user))
  window.dispatchEvent(new CustomEvent('smartapply:user-changed', { detail: user }))
}

const getCurrentUser = () => {
  try {
    const storage = getActiveStorage()
    const raw = storage.getItem('current_user')
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

const getAuthToken = () => {
  const storage = getActiveStorage()
  return storage.getItem('access_token') || storage.getItem('token')
}

const attachAuthHeader = (config) => {
  const token = getAuthToken()
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

;[authApi, profileApi, jobApi, aiApi, documentApi, notificationApi].forEach((client) => {
  client.interceptors.request.use(attachAuthHeader)
  client.interceptors.response.use((res) => res, handleAuthError)
})

export {
  authApi,
  profileApi,
  jobApi,
  aiApi,
  documentApi,
  notificationApi,
  clearSession,
  persistAuthSession,
  setCurrentUser,
  getCurrentUser,
  getAuthToken,
  getCurrentUserRole,
  getCurrentUserName
}
export default authApi
