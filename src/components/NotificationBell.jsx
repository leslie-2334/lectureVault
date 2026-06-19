import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

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
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
                onClick={() => setOpen(!open)}
                style={{ background: 'none', border: '1px solid #ccc', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 18 }}
            >
                🔔
                {unreadCount > 0 && (
                    <span style={{
                        background: 'red',
                        color: 'white',
                        borderRadius: '50%',
                        fontSize: 11,
                        padding: '1px 5px',
                        marginLeft: 4
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '110%',
                    background: 'white',
                    border: '1px solid #eee',
                    borderRadius: 8,
                    width: 280,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 100
                }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 500 }}>Notifications</span>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} style={{ fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'blue' }}>
                                Mark all read
                            </button>
                        )}
                    </div>

                    {notifications.length === 0 ? (
                        <p style={{ padding: 16, color: 'gray', margin: 0 }}>You're all caught up</p>
                    ) : (
                        notifications.map((n) => (
                            <div key={n.id} style={{ padding: '10px 16px', borderBottom: '1px solid #f5f5f5', fontSize: 14 }}>
                                {n.message}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}