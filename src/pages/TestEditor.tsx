import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

export default function TestEditor(){
  const { id } = useParams<{id:string}>()
  const [name, setName] = useState('')

  const [type, setType] = useState('chapterwise');
  const [difficulty, setDifficulty] = useState('medium');
  const [status, setStatus] = useState('draft');

  const [subject, setSubject] = useState('')
  const [subjects, setSubjects] = useState<any[]>([])

  const [topics, setTopics] = useState<string[]>([])
  const [availableTopics, setAvailableTopics] = useState<any[]>([])

  const [subTopics, setSubTopics] = useState<string[]>([])
  const [availableSubTopics, setAvailableSubTopics] = useState<any[]>([])


  const [marksPerQ, setMarksPerQ] = useState<number>(1)
  const [negativeMarks, setNegativeMarks] = useState<number>(0)
  const [totalTime, setTotalTime] = useState<number>(60);
  const [totalMarks, setTotalMarks] = useState<number>(100);

  const [errors, setErrors] = useState<string[]>([])
  const nav = useNavigate()
  const isCreating = !id;

  useEffect(()=>{
    if(id){
      api.get(`/tests/${id}`).then(r=>{
        setName(r.data.name)
        setSubject(r.data.subject?.id || r.data.subject)
        setType(r.data.type || 'chapterwise');
        setDifficulty(r.data.difficulty || 'medium');
        setStatus(r.data.status || 'draft');
        setTopics(r.data.topics||[])
        setSubTopics(r.data.sub_topics || [])
        const ms = r.data.marking_scheme || {}
        setMarksPerQ(ms.correct_marks ?? 4)
        setNegativeMarks(ms.wrong_marks ?? 1)
        setTotalTime(r.data.total_time || 60);
        setTotalMarks(r.data.total_marks || 100);
      })
    }
  }, [id])

  useEffect(() => {
    api.get('/subjects').then(res => {
      setSubjects(res.data);
    });
  }, []);

  useEffect(() => {
    if (subject) {
      api.get(`/topics/subject/${subject}`).then(res => {
        setAvailableTopics(res.data);
        // Deselect topics that are not available for the new subject
        const availableTopicIds = res.data.map((t:any) => t.id);
        setTopics(currentTopics => currentTopics.filter(tId => availableTopicIds.includes(tId)));
      });
    } else {
      setAvailableTopics([]);
    }
  }, [subject]);

  useEffect(() => {
    if (topics.length > 0) {
      api.post('/sub-topics/multi-topics', { topicIds: topics }).then(res => {
        setAvailableSubTopics(res.data);
        const availableSubTopicIds = res.data.map((st:any) => st.id);
        setSubTopics(current => current.filter(stId => availableSubTopicIds.includes(stId)));
      });
    } else {
      setAvailableSubTopics([]);
      setSubTopics([]);
    }
  }, [topics]);

  function validate(){
    const errs:string[] = []
    if(!name.trim()) errs.push('Name is required')
    if(!subject.trim()) errs.push('Subject is required')
    if(Number.isNaN(negativeMarks) || negativeMarks < 0) errs.push('Negative marks cannot be negative')
    setErrors(errs)
    return errs.length === 0
  }

  async function submit(e:React.FormEvent){
    e.preventDefault()
    if(!validate()) return
    const payload:any = {
      name,
      subject,
      type,
      difficulty,
      status,
      topics,
      sub_topics: subTopics,
      marking_scheme: { correct_marks: Number(marksPerQ), wrong_marks: Number(negativeMarks), unattempt_marks: 0 },
      total_time: Number(totalTime),
      total_marks: Number(totalMarks)
    }
    if(id){
      await api.put(`/tests/${id}`, payload)
      nav('/')
    }else{
      const r = await api.post('/tests', payload)
      nav(`/tests/${r.data.id}/questions`)
    }
  }

  function handleTopicChange(topicId: string) {
    setTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(t => t !== topicId) 
        : [...prev, topicId]
    );
  }

  function handleSubTopicChange(subTopicId: string) {
    setSubTopics(prev =>
      prev.includes(subTopicId)
        ? prev.filter(t => t !== subTopicId)
        : [...prev, subTopicId]
    );
  }

  return (
    <div>
      <h2>{id ? 'Edit Test' : 'Create Test'}</h2>
      <form onSubmit={submit}>
        <fieldset>
          <legend>Basic Details</legend>
          <label>Test Name<input value={name} onChange={e=>setName(e.target.value)}/></label>
          <label>Subject
            <select value={subject} onChange={e => setSubject(e.target.value)}>
              <option value="">Select Subject</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label>Test Type
            <select value={type} onChange={e => setType(e.target.value)}>
              <option value="chapterwise">Chapter-wise</option>
              <option value="full">Full Syllabus</option>
            </select>
          </label>
          <label>Difficulty
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
          <label>Total Time (in minutes)<input type="number" value={totalTime} onChange={e=>setTotalTime(Number(e.target.value))}/></label>
          <label>Total Marks<input type="number" value={totalMarks} onChange={e=>setTotalMarks(Number(e.target.value))}/></label>
        </fieldset>

        <fieldset>
          <legend>Syllabus</legend>
          <label>Topics</label>
          <div>
            {availableTopics.map(t => (
              <label key={t.id} style={{display: 'inline-block', marginRight: '10px'}}><input type="checkbox" checked={topics.includes(t.id)} onChange={() => handleTopicChange(t.id)} /> {t.name}</label>
            ))}
          </div>

          {availableSubTopics.length > 0 && <div style={{marginTop: '1rem'}}>
            <label>Sub-topics</label>
            <div>
              {availableSubTopics.map(st => (
                <label key={st.id} style={{display: 'inline-block', marginRight: '10px'}}><input type="checkbox" checked={subTopics.includes(st.id)} onChange={() => handleSubTopicChange(st.id)} /> {st.name}</label>
              ))}
            </div>
          </div>}
        </fieldset>

        <fieldset style={{marginTop:10}}>
          <legend>Marking Scheme</legend>
          <label>Correct Marks<input type="number" step="0.5" value={marksPerQ} onChange={e=>setMarksPerQ(Number(e.target.value))}/></label>
          <label>Wrong Marks (Negative)<input type="number" step="0.5" value={negativeMarks} onChange={e=>setNegativeMarks(Number(e.target.value))}/></label>
        </fieldset>

        {errors.length>0 && (
          <div style={{color:'red'}}>
            <ul>{errors.map((x,i)=>(<li key={i}>{x}</li>))}</ul>
          </div>
        )}

        <button type="submit" onClick={() => setStatus(isCreating ? 'draft' : status)}>{isCreating ? 'Next: Add Questions' : 'Save Test'}</button>
        {isCreating && <button type="submit" onClick={() => {
          setStatus('draft');
          submit(new (window as any).SubmitEvent("submit"));
        }}>Save as Draft</button>}
        {!isCreating && (
          <button onClick={(e) => { e.preventDefault(); nav(`/tests/${id}/preview`); }}>Preview & Publish</button>
        )}
      </form>
    </div>
  )
}
