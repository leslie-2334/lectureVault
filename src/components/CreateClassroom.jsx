import { useState } from 'react'
import { supabase } from '../supabaseClient'
import './CreateClassroom.css'

export default function CreateClassroom({ user, onCreated }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const generateCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const code = generateCode()

    const { data: classroom, error: createError } = await supabase
      .from('classrooms')
      .insert({ name, code, created_by: user.id })
      .select()
      .single()

    if (createError) {
      setError(createError.message)
      setLoading(false)
      return
    }

    await supabase
      .from('classroom_members')
      .insert({ classroom_id: classroom.id, user_id: user.id })

    onCreated(classroom)
    setLoading(false)
  }

  return (
    <div className="create-classroom-container">
      <h3>Create a classroom</h3>
      <form onSubmit={handleCreate}>

        <input
          type="text"
          placeholder="Classroom name e.g. IS 001"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        
        {error && <p className="error-message" >{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create classroom'}
        </button>
      </form>
    </div>
  )
} 