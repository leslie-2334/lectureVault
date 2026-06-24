import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import './FileList.css'

export default function FileList({ classroom, refreshTrigger }) {
    const [files, setFiles] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchFiles = async () => {
            setLoading(true)

            const { data, error } = await supabase
                .from('files')
                .select()
                .eq('classroom_id', classroom.id)
                .order('uploaded_at', { ascending: false })

            if (!error) setFiles(data)
            setLoading(false)
        }

        fetchFiles()

        const channel = supabase
            .channel('files')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'files',
                    filter: `classroom_id=eq.${classroom.id}`
                },
                () => { fetchFiles() }
            )
            .subscribe()

        return () => supabase.removeChannel(channel)
    }, [classroom.id, refreshTrigger])

    const handleDownload = async (file) => {
        const { data } = await supabase.storage
            .from('materials')
            .getPublicUrl(file.path)

        window.open(data.publicUrl, '_blank')
    }

    if (loading) return <p>Loading files...</p>
    if (files.length === 0) return <p className="empty-files">No files uploaded yet.</p>

    return (
        <div className="file-list-container">
            <h4 >Materials</h4>
            {files.map((file) => (
                <div className='file'
                    key={file.id}
                >
                    <span>{file.name}</span>
                    <button onClick={() => handleDownload(file)}>Download</button>
                </div>
            ))}
        </div>
    )
}