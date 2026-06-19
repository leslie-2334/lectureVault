import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function JoinClassroom({ user, onJoined }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleJoin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: classroom, error: findError } = await supabase
      .from('classrooms')
      .select()
      .eq('code', code.toUpperCase())
      .single()

    if (findError || !classroom) {
      setError('Classroom not found. Check the code and try again.')
      setLoading(false)
      return
    }

    const { error: joinError } = await supabase
      .from('classroom_members')
      .insert({ classroom_id: classroom.id, user_id: user.id })

    if (joinError) {
      setError('You may already be in this classroom.')
      setLoading(false)
      return
    }

    onJoined(classroom)
    setLoading(false)
  }

  return (
    <div>
      <h3>Join a classroom</h3>
      <form onSubmit={handleJoin}>
        <input
          type="text"
          placeholder="Enter join code e.g. A3BX92"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          style={{ width: '100%', padding: 10, boxSizing: 'border-box', marginBottom: 12 }}
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 10 }}>
          {loading ? 'Joining...' : 'Join classroom'}
        </button>
      </form>
    </div>
  )
}