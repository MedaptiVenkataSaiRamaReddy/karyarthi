import axios from 'axios'

/**
 * In development:  requests go to /api  → Vite proxy → localhost:8081
 * In production:   requests go to VITE_API_URL/api (different origin, CORS handled by Spring)
 */
const baseURL = import.meta.env.PROD
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const api = axios.create({ baseURL, withCredentials: true })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('karyarthi_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(r => r, async err => {
  if (err.response?.status === 401 && !err.config._retry) {
    err.config._retry = true
    try {
      const { data } = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true })
      localStorage.setItem('karyarthi_token', data.token)
      err.config.headers.Authorization = `Bearer ${data.token}`
      return api(err.config)
    } catch {
      localStorage.removeItem('karyarthi_token')
      window.location.href = '/login'
    }
  }
  return Promise.reject(err)
})

export const auth = {
  register:      d     => api.post('/auth/register', d),
  login:         d     => api.post('/auth/login', d),
  logout:        ()    => api.post('/auth/logout'),
  me:            ()    => api.get('/auth/me'),
  requestReset:  email => api.post(`/auth/request-password-reset?email=${encodeURIComponent(email)}`),
  resetPassword: (t,p) => api.post(`/auth/reset-password?token=${t}&newPassword=${encodeURIComponent(p)}`),
}

export const resumes = {
  list:          ()               => api.get('/resumes'),
  get:           id               => api.get(`/resumes/${id}`),
  status:        id               => api.get(`/resumes/${id}/status`),
  uploadOptimize:(fd, onProgress) => api.post('/resumes/upload-optimize', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: e => onProgress && onProgress(Math.round(e.loaded * 100 / e.total))
  }),
  buildFresher:  data => api.post('/resumes/build-fresher', data),
}

export const payments = {
  createOrder: (resumeId, format) => api.post('/payments/create-order', { resumeId, format }),
  verify:      data               => api.post('/payments/verify', data),
}

export default api
