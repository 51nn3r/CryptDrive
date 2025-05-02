import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import DataTable from '../components/DataTable';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [msg, setMsg] = useState('');

    const load = async () => {
        try {
            const data = await apiFetch('/adminpanel/users/');
            setUsers(data);
        } catch (err) {
            setMsg(err.message);
        }
    };

    useEffect(() => { load(); }, []);

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'username', label: 'Username' },
        { key: 'is_active', label: 'Active', render: u => u.is_active ? 'V' : 'X' },
        { key: 'date_joined', label: 'Joined' },
    ];

    return (
        <div className="container mt-4">
            <h3>Users</h3>
            {msg && <div className="alert alert-danger">{msg}</div>}
            <DataTable columns={columns} data={users} />
        </div>
    );
}
