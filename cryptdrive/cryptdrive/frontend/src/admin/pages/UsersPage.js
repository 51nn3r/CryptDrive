import React, { useEffect, useState } from 'react';
import { apiFetch, apiCreate, apiUpdate, apiDelete } from '../api';
import DataTable from '../components/DataTable';
import ModalForm from '../components/ModalForm';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [msg, setMsg] = useState('');
    const [modal, setModal] = useState({ show: false, initial: null });

    const load = async () => {
        try {
            const data = await apiFetch('users/');
            setUsers(data);
        } catch (err) {
            setMsg(err.message);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleEdit = user =>
        setModal({ show: true, initial: user });

    const handleDelete = async user => {
        if (!window.confirm(`Delete user #${user.id}?`)) return;
        try {
            await apiDelete(`users/${user.id}/`);
            await load();
        } catch (err) {
            setMsg(err.message);
        }
    };

    const handleSubmit = async form => {
        try {
            if (modal.initial) {
                await apiUpdate(`users/${modal.initial.id}/`, form);
            } else {
                await apiCreate('users/', form);
            }
            setModal({ show: false, initial: null });
            await load();
        } catch (err) {
            setMsg(err.message);
        }
    };

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'username', label: 'Username' },
        { key: 'email', label: 'Email' },
        { key: 'is_active', label: 'Active', render: u => u.is_active ? 'V' : 'X' },
        { key: 'is_superuser',label: 'Superuser', render: u => u.is_superuser ? 'V' : 'X' },
        { key: 'date_joined', label: 'Joined' },
    ];

    return (
        <div className="container mt-4">
            <h3>Users</h3>
            {msg && <div className="alert alert-danger">{msg}</div>}

            <button
                className="btn btn-success mb-2"
                onClick={() => setModal({ show: true, initial: null })}
            >
                + New User
            </button>

            <DataTable
                columns={columns}
                data={users}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ModalForm
                show={modal.show}
                onHide={() => setModal({ show: false, initial: null })}
                title={modal.initial ? 'Edit User' : 'New User'}
                initial={modal.initial}
                fields={[
                    { name: 'username', label: 'Username', required: true },
                    { name: 'email', label: 'Email', type: 'email' },
                    { name: 'password', label: 'Password', type: 'password', required: !modal.initial },
                    { name: 'is_active', label: 'Active', type: 'checkbox' },
                    { name: 'is_superuser', label: 'Superuser', type: 'checkbox' },
                ]}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
