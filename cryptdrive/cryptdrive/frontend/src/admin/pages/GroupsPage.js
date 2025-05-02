import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import DataTable from '../components/DataTable';

export default function GroupsPage() {
    const [groups, setGroups] = useState([]);
    const [msg, setMsg] = useState('');

    const load = async () => {
        try {
            const data = await apiFetch('/adminpanel/groups/');
            setGroups(data);
        } catch (err) {
            setMsg(err.message);
        }
    };

    useEffect(() => { load(); }, []);

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'owner', label: 'Owner-ID' },
        { key: 'members', label: 'Members', render: g => g.members.length },
        { key: 'files', label: 'Files', render: g => g.files.length },
        { key: 'created', label: 'Created' },
    ];

    return (
        <div className="container mt-4">
            <h3>Groups</h3>
            {msg && <div className="alert alert-danger">{msg}</div>}
            <DataTable columns={columns} data={groups} />
        </div>
    );
}
