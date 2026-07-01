import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, useParams } from 'react-router-dom'
import CreateClassroom from '../components/CreateClassroom'
import JoinClassroom from '../components/JoinClassroom'
import FileUpload from '../components/FileUpload'
import FileList from '../components/FileList'
import NotificationBell from '../components/NotificationBell'
import './Dashboard.css'

export default function Dashboard() {
    const [user, setUser] = useState(null)
    const [classroom, setClassroom] = useState(null)
    const [loading, setLoading] = useState(true)
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const { classroomId } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        const init = async () => {
            const { data } = await supabase.auth.getUser()
            const currentUser = data.user
            setUser(currentUser)

            const { data: membership } = await supabase
                .from('classrooms')
                .select('id, name, code, created_by')
                .eq('id', classroomId)
                .single()

            if (membership) setClassroom(membership)

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
        <div className="dashboard-container" >
            <div className="dashboard-header">
                <h2>LectureVault 🎓</h2>
                <div className="dashboard-header-actions">
                    {classroom && user && (
                        <NotificationBell user={user} classroom={classroom} />
                    )}
                    <button onClick={handleLogout}>Log out</button>
                </div>
            </div>

            {user && <p className="user-name">{user.user_metadata.full_name}</p>}

            {classroom ? (
                <div className="classroom-content-container" >
                    <h3>{classroom.name}</h3>
                    <p className="join-code-text" >Join code: <strong className="classroom-code" >{classroom.code}</strong></p>
                    <hr className="classroom-hr" />

                    {classroom.created_by === user.id ? (
                        <FileUpload user={user} classroom={classroom} onUploaded={handleUploaded} />
                    ) : null}

                    <hr className="classroom-hr" />
                    <FileList classroom={classroom} refreshTrigger={refreshTrigger} />
                </div>
            ) : (
                <div className="classroom-actions-container" >
                    <p>Couldn't find your classroom. <span onClick={() => navigate('/home')}>Go back Home?</span></p>
                </div>
            )}
        </div>
    )
}