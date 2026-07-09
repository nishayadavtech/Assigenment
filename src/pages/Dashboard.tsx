import React, { useEffect, useState } from 'react'
import api from '../api'
import { Link, useNavigate } from 'react-router-dom'

export default function Dashboard(){
  const [tests, setTests] = useState<any[]>([])
  const nav = useNavigate()

  async function load(){
    const res = await api.get('/tests')
    setTests(res.data)
  }
  useEffect(()=>{ load() }, [])

  async function remove(id:string){
    if(!confirm('Delete test?')) return
    await api.delete(`/tests/${id}`)
    load()
  }

  return (
    <div>
      <h2>Dashboard</h2>
      <button className="btn-primary" onClick={()=>nav('/tests/new')}>Create Test</button>
      <table className="table-auto">
        <thead><tr><th>Name</th><th>Subject</th><th>Status</th><th>Created On</th><th>Actions</th></tr></thead>
        <tbody>
          {tests.map(t=> (
            <tr key={t.id}>
              <td>{t.name}</td>
              <td>{t.subject?.name || t.subject}</td>
              <td>
                <span className={`status status-${t.status || (t.published ? 'live' : 'draft')}`}>
                  {t.status || (t.published ? 'Live' : 'Draft')}
                </span>
              </td>
              <td>{t.created_at ? new Date(t.created_at).toLocaleDateString() : 'N/A'}</td>
              <td>
                <Link className="action-link" to={`/tests/${t.id}/edit`}>Edit</Link>
                <Link className="action-link" to={`/tests/${t.id}/questions`}>Questions</Link>
                <Link className="action-link" to={`/tests/${t.id}/preview`}>Preview</Link>
                <button className="action-btn-delete" onClick={()=>remove(t.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
