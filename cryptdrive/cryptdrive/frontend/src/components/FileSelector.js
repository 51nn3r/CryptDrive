import React, { useState, useEffect } from 'react';
import { encryptKeysForUsers } from '../utils/crypto';
import { getCookie } from '../utils/csrf';


function FileSelector({ groupId, existingFileIds = [], onChange }) {
    const [allFiles, setAllFiles] = useState([]);
    const [filterTerm, setFilterTerm] = useState('');
    const [selection, setSelection] = useState(new Set(existingFileIds));
    const [statusMsg, setStatusMsg] = useState('');
    const csrf = getCookie('csrftoken');

    useEffect(() => {
        async function fetchFiles() {
            const res = await fetch('/core/files/', {
                credentials: 'include'
            });
            if (res.ok) {
                setAllFiles(await res.json());
            } else {
                setStatusMsg('Failed to load files');
            }
        }
        fetchFiles();
    }, []);

    const filtered = allFiles.filter(f =>
        f.filename.toLowerCase().includes(filterTerm.toLowerCase())
    );

    const toggle = (fileId) => {
        setSelection(prev => {
            const next = new Set(prev);
            if (next.has(fileId)) next.delete(fileId);
            else next.add(fileId);
            return next;
        });
    };

    const save = async () => {
        const toAdd = [...selection].filter(id => !existingFileIds.includes(id));
        const toRemove = existingFileIds.filter(id => !selection.has(id));

        setStatusMsg('Saving...');
        for (const fileId of toAdd) {
            let res = await fetch(`/core/groups/${groupId}/files/${fileId}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'X-CSRFToken': csrf }
            });

            if (res.ok) {
                const data = await res.json();
                const { missing_users: missingUsers = [] } = data;

                for (const user of missingUsers) {
                    await encryptKeysForUsers([{
                        id: user.id,
                        missingFiles: [fileId]
                    }]);
                }
            }
        }
        for (const fileId of toRemove) {
            await fetch(`/core/groups/${groupId}/files/${fileId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'X-CSRFToken': csrf }
            });
        }

        setStatusMsg('Saved');
        onChange([...selection]);
    };

    return (
        <div className="p-3 border mt-3">
            <h6>Assign files to group #{groupId}</h6>
            {statusMsg && <div className="alert alert-info py-1">{statusMsg}</div>}

            <div className="input-group mb-2">
                <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Filter files…"
                    value={filterTerm}
                    onChange={e => setFilterTerm(e.target.value)}
                />
            </div>

            <ul className="list-group mb-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {filtered.map(f => (
                    <li
                        key={f.id}
                        className={`list-group-item d-flex justify-content-between ${selection.has(f.id) ? 'active text-white' : ''}`}
                        onClick={() => toggle(f.id)}
                        style={{ cursor: 'pointer' }}
                    >
                        {f.filename}
                        {selection.has(f.id) && <span>&#10004;</span>}
                    </li>
                ))}
                {filtered.length === 0 && (
                    <li className="list-group-item text-muted">No files match.</li>
                )}
            </ul>

            <button className="btn btn-sm btn-primary" onClick={save}>
                Save selection
            </button>
        </div>
    );
}

export default FileSelector;
