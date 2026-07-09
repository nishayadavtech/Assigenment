import axios from 'axios'
import { getToken } from './auth'

const api = axios.create({ baseURL: 'http://localhost:4000/api' })
api.interceptors.request.use(cfg => {
  const t = getToken()
  if(t) cfg.headers = { ...(cfg.headers||{}), Authorization: `Bearer ${t}` }
  return cfg
})
export default api
