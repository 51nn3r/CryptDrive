import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';

export default function SystemPage() {
    const [stats, setStats] = useState(null);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        apiFetch('/adminpanel/system/')
            .then(setStats)
            .catch(err => setMsg(err.message));
    }, []);

    if (msg) return <div className="alert alert-danger">{msg}</div>;
    if (!stats) return <div>Loading...</div>;

    return (
        <div className="container mt-4">
            <h3>System metrics</h3>
            <ul className="list-group">
                <li className="list-group-item">Users: {stats.users}</li>
                <li className="list-group-item">Groups: {stats.groups}</li>
                <li className="list-group-item">Files: {stats.files}</li>
                <li className="list-group-item">Disk used: {stats.disk_used_mb} MB</li>
            </ul>
        </div>
    );
}
