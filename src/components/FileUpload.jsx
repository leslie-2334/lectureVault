import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function FileUpload({ user, classroom, onUploaded }) {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState(null)

    const handleUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setUploading(true)
        setError(null)

        const filePath = `${classroom.id}/${Date.now()}_${file.name}`

        const { error: uploadError } = await supabase.storage
            .from('materials')
            .upload(filePath, file)

        if (uploadError) {
            setError(uploadError.message)
            setUploading(false)
            return
        }

        const { error: dbError } = await supabase
            .from('files')
            .insert({
                name: file.name,
                path: filePath,
                classroom_id: classroom.id,
                uploaded_by: user.id
            })

        if (dbError) {
            setError(dbError.message)
            setUploading(false)
            return
        }

        const { data: members } = await supabase
            .from('classroom_members')
            .select('user_id')
            .eq('classroom_id', classroom.id)
            .neq('user_id', user.id)

        if (members && members.length > 0) {
            const notifications = members.map((member) => ({
                user_id: member.user_id,
                classroom_id: classroom.id,
                message: `New material uploaded: ${file.name}`
            }))

            await supabase.from('notifications').insert(notifications)
        }

        onUploaded()
        setUploading(false)
    }

    return (
        <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                Upload material
            </label>
            <input
                type="file"
                onChange={handleUpload}
                disabled={uploading}
            />
            {uploading && <p style={{ color: 'gray' }}>Uploading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    )
}