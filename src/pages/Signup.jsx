import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, Link } from 'react-router-dom'

export default function Signup() {
    const [email, setEmail] = useState('')
    const [fullname, setFullname] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [updateError, setUpdateError] = useState(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSignup = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signUp({ email, password, options:{
                data: { full_name: fullname }       
        } })

        
        if (error) {
            setError(error.message)
            setLoading(false)
        }
        
        navigate('/dashboard')
    }

    return (
        <div style={{ maxWidth: 400, margin: '100px auto', padding: '0 20px' }}>
            <h2>Create your account</h2>
            <form onSubmit={handleSignup}>
                <div style={{ marginBottom: 12 }}>
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        required
                        style={{ width: '100%', padding: 10, boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: 12 }}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: 10, boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: 12 }}>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: 10, boxSizing: 'border-box' }}
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" disabled={loading} style={{ width: '100%', padding: 10 }}>
                    {loading ? 'Creating account...' : 'Sign up'}
                </button>
            </form>
            <p>Already have an account? <Link to="/login">Log in</Link></p>
        </div>
    )
}