import React from 'react'
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TestEditor from './pages/TestEditor'
import Questions from './pages/Questions'
import Preview from './pages/Preview'
import { getToken, clearToken } from './auth'
import './App.css'

function RequireAuth({ children }: { children: React.ReactNode }){
  return getToken() ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App(){
  const navigate = useNavigate()
  const token = getToken()
  return (
    <div className="app">
      <header>
        <h1>Test Manager</h1>
        <nav>
          {token ? (
            <>
              <Link to="/">Dashboard</Link>
              <button onClick={() => { clearToken(); navigate('/login') }}>Logout</button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login/>} />
          <Route path="/" element={<RequireAuth><Dashboard/></RequireAuth>} />
          <Route path="/tests/new" element={<RequireAuth><TestEditor/></RequireAuth>} />
          <Route path="/tests/:id/edit" element={<RequireAuth><TestEditor/></RequireAuth>} />
          <Route path="/tests/:id/questions" element={<RequireAuth><Questions/></RequireAuth>} />
          <Route path="/tests/:id/preview" element={<RequireAuth><Preview/></RequireAuth>} />
        </Routes>
      </main>
    </div>
  )
}
