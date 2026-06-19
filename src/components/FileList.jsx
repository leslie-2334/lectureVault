import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

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

    // useEffect(() => {
    //     fetchFiles()

    //     const channel = supabase
    //         .channel('files')
    //         .on(
    //             'postgres_changes',
    //             {
    //                 event: 'INSERT',
    //                 schema: 'public',
    //                 table: 'files',
    //                 filter: `classroom_id=eq.${classroom.id}`
    //             },
    //             () => { fetchFiles() }
    //         )
    //         .subscribe()

    //     return () => supabase.removeChannel(channel)
    // }, [classroom.id])

    const handleDownload = async (file) => {
        const { data } = await supabase.storage
            .from('materials')
            .getPublicUrl(file.path)

        window.open(data.publicUrl, '_blank')
    }

    if (loading) return <p>Loading files...</p>
    if (files.length === 0) return <p style={{ color: 'gray' }}>No files uploaded yet.</p>

    return (
        <div>
            <h4 style={{ marginBottom: 12 }}>Materials</h4>
            {files.map((file) => (
                <div
                    key={file.id}
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 0',
                        borderBottom: '1px solid #eee'
                    }}
                >
                    <span>{file.name}</span>
                    <button onClick={() => handleDownload(file)}>Download</button>
                </div>
            ))}
        </div>
    )
}