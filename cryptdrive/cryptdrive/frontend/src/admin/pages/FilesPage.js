import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import DataTable from '../components/DataTable';

export default function FilesPage() {
    const [files, setFiles] = useState([]);
    const [msg, setMsg] = useState('');

    const load = async () => {
        try {
            const data = await apiFetch('files/');
            setFiles(data);
        } catch (err) {
            setMsg(err.message);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'filename', label: 'Filename' },
        { key: 'owner', label: 'Owner ID' },
        { key: 'size', label: 'Size (bytes)' },
        { key: 'created_at', label: 'Uploaded' },
    ];

    return (
        <div className="container mt-4">
            <h3>Files</h3>
            {msg && <div className="alert alert-danger">{msg}</div>}
            <DataTable columns={columns} data={files} />
        </div>
    );
}
