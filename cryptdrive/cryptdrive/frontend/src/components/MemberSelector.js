import React, { useEffect, useState } from 'react';
import { fetchUsers, shareFile } from '../utils/crypto';

function MemberSelector({ groupId, onSelect }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [statusMsg, setStatusMsg] = useState('');

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;
        try {
            const results = await fetchUsers(searchTerm.trim());
            setUsers(results);
        } catch {
            setStatusMsg('Search error');
        }
    };

    return (
        <div className="mt-3 p-2 border">
            <h6>Share to group #{groupId}</h6>
            {statusMsg && <div className="alert alert-info p-1">{statusMsg}</div>}

            <div className="d-flex">
                <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search users"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <button
                    className="btn btn-sm btn-primary ms-2"
                    onClick={handleSearch}
                >
                    Search
                </button>
            </div>

            <ul className="list-group list-group-sm mt-2">
                {users.map(u =>
                    <li
                        key={u.id}
                        className={`list-group-item d-flex justify-content-between
                            ${selectedUser?.id === u.id ? 'active text-white' : ''}`}
                        onClick={() => {
                            setSelectedUser(u);
                            onSelect(u);
                        }}
                        style={{ cursor: 'pointer' }}
                    >
                        {u.username}
                        {selectedUser?.id === u.id && <span>&#10004;</span>}
                    </li>
                )}
            </ul>
        </div>
    );
}

export default MemberSelector;
