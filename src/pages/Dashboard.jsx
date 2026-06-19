import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import CreateClassroom from '../components/CreateClassroom'
import JoinClassroom from '../components/JoinClassroom'
import FileUpload from '../components/FileUpload'
import FileList from '../components/FileList'
import NotificationBell from '../components/NotificationBell'

export default function Dashboard() {
    const [user, setUser] = useState(null)
    const [classroom, setClassroom] = useState(null)
    const [loading, setLoading] = useState(true)
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const navigate = useNavigate()

    useEffect(() => {
        const init = async () => {
            const { data } = await supabase.auth.getUser()
            const currentUser = data.user
            setUser(currentUser)

            const { data: membership } = await supabase
                .from('classroom_members')
                .select('classroom_id, classrooms(id, name, code, created_by)')
                .eq('user_id', currentUser.id)
                .single()

            if (membership) setClassroom(membership.classrooms)

            setLoading(false)
        }

        init()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    const handleUploaded = () => {
        setRefreshTrigger(prev => prev + 1)
    }

    if (loading) return <p>Loading...</p>

    return (
        <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>LectureVault 🎓</h2>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {classroom && user && (
                        <NotificationBell user={user} classroom={classroom} />
                    )}
                    <button onClick={handleLogout}>Log out</button>
                </div>
            </div>

            {user && <p style={{ color: 'gray' }}>{user.user_metadata.full_name}</p>}

            {classroom ? (
                <div style={{ marginTop: 32 }}>
                    <h3>{classroom.name}</h3>
                    <p style={{ color: 'gray' }}>Join code: <strong style={{ color: 'black' }}>{classroom.code}</strong></p>
                    <hr style={{ margin: '24px 0' }} />

                    {/* {classroom.created_by === user.id && (
                        <FileUpload user={user} classroom={classroom} onUploaded={handleUploaded} />
                    )} */}

                    {classroom.created_by === user.id ? (
                        <FileUpload user={user} classroom={classroom} onUploaded={handleUploaded} />
                    ) : null}

                    <hr style={{ margin: '24px 0' }} />
                    <FileList classroom={classroom} refreshTrigger={refreshTrigger} />
                </div>
            ) : (
                <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 32 }}>
                    <CreateClassroom user={user} onCreated={setClassroom} />
                    <hr />
                    <JoinClassroom user={user} onJoined={setClassroom} />
                </div>
            )}
        </div>
    )
}