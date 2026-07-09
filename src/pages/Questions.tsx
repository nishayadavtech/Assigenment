import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'

export default function Questions(){
  const { id } = useParams<{id:string}>()
  const [questions, setQuestions] = useState<any[]>([])
  const [qtext, setQtext] = useState('')
  const [opts, setOpts] = useState(['', '', '', ''])
  const [correct, setCorrect] = useState(0)

  async function load(){
    const r = await api.get(`/tests/${id}/questions`)
    setQuestions(r.data)
  }
  useEffect(()=>{ if(id) load() }, [id])

  async function add(e:React.FormEvent){
    e.preventDefault()
    await api.post(`/tests/${id}/questions`, { question_text: qtext, options: opts, correct_index: correct })
    setQtext('')
    setOpts(['', '', '', ''])
    setCorrect(0)
    load()
  }

  async function publish(){
    await api.post(`/tests/${id}/publish`)
    alert('Published')
  }

  return (
    <div>
      <h2>Questions</h2>
      <form onSubmit={add}>
        <label>Question<textarea value={qtext} onChange={e=>setQtext(e.target.value)}/></label>
        {opts.map((o, i)=> (
          <label key={i}>Option {i+1}<input value={o} onChange={e=>{ const copy = [...opts]; copy[i]=e.target.value; setOpts(copy)}}/></label>
        ))}
        <label>Correct index<select value={correct} onChange={e=>setCorrect(Number(e.target.value))}>
          {opts.map((_,i)=>(<option value={i} key={i}>{i+1}</option>))}
        </select></label>
        <button type="submit">Add Question</button>
      </form>

      <h3>Existing</h3>
      <ul>
        {questions.map(q=> (
          <li key={q.id}>{q.question_text} - correct: {q.correct_index+1}</li>
        ))}
      </ul>
      <button onClick={publish}>Publish Test</button>
    </div>
  )
}
