import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function ProtectedRoute({ children }) {
    const [session, setSession] = useState(undefined)

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session)
        })
    }, [])

    if (session === undefined) return <p>Loading...</p>
    if (session === null) return <Navigate to="/login" />

    return children
}