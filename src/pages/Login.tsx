import React, { useState } from 'react'
import api from '../api'
import { setToken } from '../auth'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const nav = useNavigate()

  async function submit(e: React.FormEvent){
    e.preventDefault()
    try{
      const res = await api.post('/login', { username, password })
      setToken(res.data.token)
      nav('/')
    }catch(err:any){
      setError(err?.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="login">
      <h2>Login</h2>
      <form onSubmit={submit}>
        <label>Username<input value={username} onChange={e=>setUsername(e.target.value)}/></label>
        <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)}/></label>
        <button type="submit">Login</button>
      </form>
      {error && <div className="error">{error}</div>}
      <div className="hint">Use vedant-admin / vedant123</div>
    </div>
  )
}
