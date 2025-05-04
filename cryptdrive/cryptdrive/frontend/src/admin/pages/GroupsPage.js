import React, { useEffect, useState } from 'react';
import { apiFetch, apiCreate, apiUpdate, apiDelete } from '../api';
import DataTable from '../components/DataTable';
import ModalForm from '../components/ModalForm';
import { getCookie } from '../../utils/csrf';

export default function GroupsPage() {
    const csrf = getCookie('csrftoken');

    const [groups, setGroups] = useState([]);
    const [msg, setMsg] = useState('');
    const [modal, setModal] = useState({ show:false, initial:null });

    const load = async () => {
        try {
            const data = await apiFetch(
                'groups/',
            );
            setGroups(data);
        } catch (err) {
            setMsg(err.message);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleEdit = grp => setModal({ show:true, initial:grp });
    const handleDelete = async grp => {
        if (window.confirm(`Delete group #${grp.id}?`)) {
            try {
                await apiDelete(`groups/${grp.id}/`);
                await load();
            } catch (err) {
                setMsg(err.message);
            };
        }
    };
    const handleSubmit = async form => {
        try {
            if (modal.initial) {
                await apiUpdate(`groups/${modal.initial.id}/`, form);
            } else {
                await apiCreate('groups/', form);
            }
            setModal({ show:false, initial:null });
            load();
        } catch (err) {
            setMsg(err.message);
        }
    };

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'owner', label: 'Owner' },
        { key: 'members', label: 'Members', render:g=>g.members.length },
        { key: 'files', label: 'Files', render:g=>g.files.length },
        { key: 'created', label: 'Created' },
    ];

    return (
        <div className="container mt-4">
            <h3>Groups</h3>
            {msg && <div className="alert alert-danger">{msg}</div>}
            <button className="btn btn-success mb-2" onClick={()=>setModal({ show:true, initial:null })}>
                + New Group
            </button>
            <DataTable
                columns={columns}
                data={groups}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
            <ModalForm
                show={modal.show}
                onHide={()=>setModal({ show:false })}
                title={modal.initial ? 'Edit Group' : 'New Group'}
                initial={modal.initial}
                fields={[
                    { name:'name', label:'Name', required:true },
                    { name:'owner', label:'Owner (ID)', type:'number', required:true },
                ]}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
