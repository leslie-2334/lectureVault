import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import './NotificationBell.css'

export default function NotificationBell({ user, classroom }) {
    const [notifications, setNotifications] = useState([])
    const [open, setOpen] = useState(false)

    const fetchNotifications = async () => {
        const { data } = await supabase
            .from('notifications') 
            .select()
            .eq('user_id', user.id)
            .eq('classroom_id', classroom.id)
            .eq('is_read', false)
            .order('created_at', { ascending: false })

        if (data) setNotifications(data)
    }

    useEffect(() => {
        fetchNotifications()

        const channel = supabase
            .channel('notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                },
                () => { fetchNotifications() }
            )
            .subscribe()

        return () => supabase.removeChannel(channel)
    }, [user.id, classroom.id])

    const markAllRead = async () => {
        const ids = notifications.map((n) => n.id)

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .in('id', ids)

        setNotifications([])
        setOpen(false)
    }

    const unreadCount = notifications.length

    return (
        <div className="notification-bell" >
            <button
                onClick={() => setOpen(!open)}
                className="notification-button"
            >
                🔔
                {unreadCount > 0 && (
                    <span className="unread-count" >
                        {unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="notification-dropdown">
                    <div className="notification-dropdown-container" >
                        <span className="notification-dropdown-header" >Notifications</span>
                        {unreadCount > 0 && (
                            <button className="mark-all-read" onClick={markAllRead}>
                                Mark all read
                            </button>
                        )}
                    </div>

                    {notifications.length === 0 ? (
                        <p className="notification-empty" >You're all caught up</p>
                    ) : (
                        notifications.map((n) => (
                            <div key={n.id} className="notification-item" >
                                {n.message}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}