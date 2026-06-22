import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import './Home.css'

export default function Home() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
        });
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    return (
        <div className="home-container">
            <h2>LectureVault 🎓</h2>
            {user && <p>Logged in as: {user.email}</p>}
            <button onClick={handleLogout}>Log out</button>
        </div>
    );
}
