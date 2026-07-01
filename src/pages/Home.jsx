import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import './Home.css'
import NotificationBell from "../components/NotificationBell";

export default function Home() {
    const [user, setUser] = useState(null);
    const [classrooms, setClassrooms] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const init = async () => {
            const { data } = await supabase.auth.getUser();
            const currentUser = data.user;
            setUser(currentUser);

            const { data: memberships } = await supabase
                .from("classroom_members")
                .select("classroom_id, classrooms(id, name, created_by,code)")
                .eq("user_id", currentUser.id);

            if (memberships) setClassrooms(memberships.map(m => m.classrooms));
        };


        init()
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    const openClassroom = (classroomId) => {
        navigate(`/dashboard/${classroomId}`);
    }

    return (
        <div className="home-container">
            <h2>LectureVault 🎓</h2>
            {user && <p>Logged in as: {user.user_metadata.full_name}</p>}
            {classrooms.length === 0 ? (
                <p>You are not a member of any classrooms yet. <Link to="/home">Create one.</Link></p>

            ) : (
                classrooms.map((classroom) => (
                    <div className="classroom-card"
                        onClick={() => openClassroom(classroom.id)}
                        key={classroom.id}>
                        <h3>{classroom.name}</h3>
                        <div className="classroom-actions">
                            {/* <button>
                                Join Classroom
                            </button> */}
                            {classroom && user && (
                                <NotificationBell user={user} classroom={classroom} />
                            )}
                            <button>
                                Leave Classroom
                            </button>
                        </div>
                    </div>
                )))
            }


            <button onClick={handleLogout}>Log out</button>
        </div>
    );
}
