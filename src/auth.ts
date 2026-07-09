const STORAGE_KEY = 'pr_token'
export function setToken(t: string){ localStorage.setItem(STORAGE_KEY, t) }
export function getToken(){ return localStorage.getItem(STORAGE_KEY) }
export function clearToken(){ localStorage.removeItem(STORAGE_KEY) }
