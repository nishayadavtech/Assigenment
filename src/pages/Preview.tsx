import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api'

export default function Preview(){
  const { id } = useParams<{id:string}>()
  const [test, setTest] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [topics, setTopics] = useState<any[]>([])
  const nav = useNavigate()

  useEffect(()=>{
    if(id){
      api.get(`/tests/${id}`).then(r=>{
        setTest(r.data)
        setTopics(r.data.topics || []);
      })
      api.get(`/tests/${id}/questions`).then(r=>setQuestions(r.data))
    }
  }, [id])

  async function publish() {
    if (!confirm('Are you sure you want to publish this test? This cannot be undone.')) return;
    try {
      await api.put(`/tests/${id}/publish`);
      alert('Test published successfully!');
      nav('/');
    } catch (error) {
      alert('Failed to publish test.');
      console.error(error);
    }
  }

  if(!test) return <div>Loading...</div>
  return (
    <div>
      <h2>Preview: {test.name}</h2>
      <div className="test-details-grid">
        <p><strong>Subject:</strong> {test.subject?.name || test.subject}</p>
        <p><strong>Topics:</strong> {(topics.map(t => t.name) || []).join(', ')}</p>
        <p><strong>Difficulty:</strong> {test.difficulty}</p>
        <p><strong>Status:</strong> <span className={`status status-${test.status}`}>{test.status}</span></p>
        <p><strong>Total Time:</strong> {test.total_time} minutes</p>
        <p><strong>Total Marks:</strong> {test.total_marks}</p>
      </div>
      
      <h3>Questions</h3>
      <ol>
        {questions.map(q=> (
          <li key={q.id}>
            <div>{q.question_text}</div>
            <ul className="options-list">
              {q.options.map((o:any,i:number)=>(<li key={i} className={i === q.correct_index ? 'correct-option' : ''}>{o}</li>))}
            </ul>
          </li>
        ))}
      </ol>

      {test.status !== 'live' && (
        <div style={{marginTop: '2rem'}}>
          <Link to={`/tests/${id}/edit`} className="btn-secondary" style={{marginRight: '1rem'}}>Edit Test</Link>
          <Link to={`/tests/${id}/questions`} className="btn-secondary" style={{marginRight: '1rem'}}>Edit Questions</Link>
          <button className="btn-primary" onClick={publish}>Publish Test</button>
        </div>
      )}
    </div>
  )
}
