import React, { useEffect, useState } from 'react';
import {
    checkPublicKeyOnServer,
    generateRSAPair,
    uploadPublicKey,
    generateAESKey,
    encryptFileRaw,
    encryptFileB64,
    encryptAESKeyWithRSA,
    uploadFileWithAESKey,
    getPublicKeyFromServer,
    bufferToBase64,
    base64ToBuffer,
    getFileCryptoMetadata,
    getFileEncryptedData,
    decryptAESKeyWithRSA,
    decryptFileRaw,
    fetchUsers,
    shareFile,
} from '../utils/crypto';
import MemberSelector from './MemberSelector'
import { getCookie } from '../utils/csrf';


function GroupPanel() {
    const [groups, setGroups] = useState([]);
    const [newGroupName, setNewGroupName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [newMember, setNewMember] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [msg, setMsg] = useState(null);

    const csrf = getCookie('csrftoken');

    const fetchGroups = async () => {
        const res = await fetch('/core/groups/', { credentials: 'include' });
        if (res.ok) setGroups(await res.json());
    };

    useEffect(() => { fetchGroups(); }, []);

    const createGroup = async (e) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;
        const res = await fetch('/core/groups/', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf },
            body: JSON.stringify({ name: newGroupName.trim() })
        });
        if (res.ok) {
            setNewGroupName('');
            await fetchGroups();
            setMsg('Group created.');
        }
    };

    const startEdit = (g) => {
        setEditingId(g.id);
        setEditingName(g.name);
    };

    const saveEdit = async (id) => {
        if (!editingName.trim()) return;
        const res = await fetch(`/core/groups/${id}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf },
            body: JSON.stringify({ name: editingName.trim() }),
        });
        if (res.ok) {
            setEditingId(null);
            await fetchGroups();
            setMsg('Group renamed.');
        }
    };

    const deleteGroup = async (id) => {
        if (!window.confirm('Delete this group')) return;
        const res = await fetch(`/core/groups/${id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'X-CSRFToken': csrf },
        });

        if (res.ok) {
            setEditingId(null);
            await fetchGroups();
            setMsg('Group deleted.');
        }
    };

    const addMember = async (g) => {
        if (!newMember) return;

        const res = await fetch(`/core/groups/${g.id}/members/${newMember.id}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrf,
            }
        });
        if (res.ok) {
            setNewMember(null);
            await fetchGroups();
            setMsg(`Added "${newMember.username}" into "${g.name}"`);
        }
    }

    const removeMember = async (g, u) => {
        const res = await fetch(`/core/groups/${g.id}/members/${u.id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrf,
            },
        });
        if (res.ok) {
            await fetchGroups();
            setMsg(`User "${u.username}" removed.`);
        }
    };

    return (
        <div className="container mt-5">
            <h3>Your groups</h3>

            {msg && <div className="alert alert-info py-1 my-2">{msg}</div>}

            <ul className="list-group mb-4">
                {groups.map(g => (
                    <li key={g.id}
                            className="list-group-item d-flex justify-content-between align-items-center">
                        {editingId === g.id ? (
                            <>
                                <input value={editingName}
                                             onChange={e => setEditingName(e.target.value)}
                                             className="form-control me-2" />
                                <button className="btn btn-sm btn-success me-1"
                                                onClick={() => saveEdit(g.id)}>Save</button>
                                <button className="btn btn-sm btn-secondary"
                                                onClick={() => setEditingId(null)}>Cancel</button>
                            </>
                        ) : (
                            <>
                                <span>{g.name}</span>
                                <div>
                                    <button className="btn btn-sm btn-outline-primary me-1"
                                                    onClick={() => startEdit(g)}>Rename</button>
                                    <button className="btn btn-sm btn-outline-danger"
                                                    onClick={() => deleteGroup(g.id)}>Delete</button>
                                </div>
                            </>
                        )}

                        <div className="mt-3">
                            <em>Members:</em>
                            {g.members.length ? (
                                <ul className="list-inline">
                                    {g.members.map(u => (
                                        <li key={u.id} className="list-inline-item me-3">
                                            {u.username}
                                            <button
                                                className="btn btn-link btn-sm text-danger p-0 ms-1"
                                                onClick={() => removeMember(g, u)}
                                            >
                                                &times;
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-muted">No members yet.</div>
                            )}
                        </div>

                        <MemberSelector
                            groupId={g.id}
                            onSelect={(u) => {
                                setNewMember(u);
                            }}
                        />
                        {newMember ? (
                            <><button className="btn btn-sm btn-success me-1" onClick={() => addMember(g)}>Add</button></>
                        ) : (<></>)}
                    </li>
                ))}
            </ul>

            <form className="d-flex" onSubmit={createGroup}>
                <input className="form-control me-2"
                             placeholder="New group name"
                             value={newGroupName}
                             onChange={e => setNewGroupName(e.target.value)} />
                <button className="btn btn-primary">Add</button>
            </form>
        </div>
    )
}

export default GroupPanel;
