import axios from 'axios'

const TOKEN_KEY = 'worktrack_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

export const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const t = getToken()
  if (t) config.headers.Authorization = `Bearer ${t}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (error) => {
    // протухший/невалидный токен → выходим и на логин
    if (axios.isAxiosError(error) && error.response?.status === 401 && getToken()) {
      clearToken()
      if (window.location.pathname !== '/login') window.location.assign('/login')
    }
    return Promise.reject(error)
  },
)
