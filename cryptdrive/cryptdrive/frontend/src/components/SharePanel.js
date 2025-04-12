import React, { useState } from 'react';
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


function SharePanel({ fileId, onClose }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [statusMsg, setStatusMsg] = useState('');

    const handleSearch = async () => {
        try {
            const results = await fetchUsers(searchTerm);
            setUsers(results);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setStatusMsg('Search error.');
        }
    };

    const handleShare = async () => {
        if (!fileId || !selectedUser) {
            setStatusMsg('Select user first');
            return;
        }
        try {
            const privateKey = localStorage.getItem('privateKey');
            if (!privateKey) {
                throw new Error('No private key found locally.');
                return;
            }

            const {filename, iv, encryptedAES} = await getFileCryptoMetadata(fileId);
            const aesKey = await decryptAESKeyWithRSA(encryptedAES, privateKey);
            const pubKeyBase64 = await getPublicKeyFromServer(selectedUser.id);

            const encryptedAESB64 = await encryptAESKeyWithRSA(aesKey, pubKeyBase64);
            await shareFile(fileId, selectedUser.id, encryptedAESB64);
            setStatusMsg('File shared successfully!');
        } catch (err) {
            console.error('Share error:', err);
            setStatusMsg('Failed to share file.');
        }
    };

    return (
        <div className="p-3 border mt-2">
            <div className="d-flex justify-content-between align-items-center">
                <h5>Share file #{fileId}</h5>
                <button className="btn btn-sm btn-secondary" onClick={onClose}>
                    X
                </button>
            </div>

            {statusMsg && <div className="alert alert-info mt-2">{statusMsg}</div>}

            <div className="mt-2">
                <input
                    type="text"
                    placeholder="Search users"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <button onClick={handleSearch} className="btn btn-sm btn-primary ms-2">
                    Search
                </button>
            </div>

            <ul className="list-group mt-2">
                {users.map(u => (
                    <li key={u.id} className="list-group-item d-flex justify-content-between align-items-center">
                        {u.username}
                        <button className="btn btn-sm btn-outline-primary" onClick={() => setSelectedUser(u)}>
                            Select
                        </button>
                    </li>
                ))}
            </ul>

            {selectedUser && (
                <div className="mt-2">
                    <p>Selected user: {selectedUser.username}</p>
                    <button className="btn btn-success btn-sm" onClick={handleShare}>
                        Share
                    </button>
                </div>
            )}
        </div>
    );
}

export default SharePanel;
