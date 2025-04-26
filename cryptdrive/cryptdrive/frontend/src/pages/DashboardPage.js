import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    getFileCryptoMetadata,
    getFileEncryptedData,
    decryptAESKeyWithRSA,
    decryptFileRaw,
    validateMatchingKeys,
} from '../utils/crypto';
import { getCookie } from '../utils/csrf';
import { deleteFile } from '../utils/helpers';


function DashboardPage() {
    const [hasPublicKey, setHasPublicKey] = useState(false);
    const [importKeyText, setImportKeyText] = useState('');
    const [warning, setWarning] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showPrivateKey, setShowPrivateKey] = useState(false);
    const [privateKeyValue, setPrivateKeyValue] = useState('');
    const [files, setFiles] = useState([]);
    const [selectedShareFileId, setSelectedShareFileId] = useState(null);

    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();

    // Check if user is authenticated
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    // Check if server already has a public key
    useEffect(() => {
        if (user) {
            checkPublicKeyOnServer()
                .then((res) => setHasPublicKey(res))
                .catch(() => setHasPublicKey(false));
        }
    }, [user]);

    // Loading a list of files (only if the public key already exists)
    useEffect(() => {
        if (hasPublicKey) {
            fetch('/core/files/')
                .then(res => res.json())
                .then(data => setFiles(data))
                .catch(err => console.error('Failed to load files:', err));
        }
    }, [hasPublicKey]);

    // Generates a new RSA key pair (client-side)
    const handleGenerateRSA = async () => {
        if (hasPublicKey) {
            // If there's already a public key, warn about losing access to old files
            const confirm = window.confirm(
                'A public key already exists on the server. Generating a new one may invalidate files encrypted with the old key. Continue?'
            );
            if (!confirm) return;
        }
        try {
            const { publicKey, privateKey } = await generateRSAPair();
            // Save private key locally (note: using localStorage for demo; consider IndexedDB)
            localStorage.setItem('privateKey', privateKey);
            // Upload the public key to the server
            await uploadPublicKey(publicKey);
            setHasPublicKey(true);

            setPrivateKeyValue(privateKey);
            setShowPrivateKey(true);

            setWarning('Successfully generated and uploaded a new public key.');
        } catch (err) {
            console.error(err);
            setWarning('Failed to generate RSA key pair.');
        }
    };

    // Import RSA private key
    const handleImportPrivateKey = async (e) => {
        e.preventDefault();
        const key = importKeyText.trim();
        if (!key) {
            setWarning('Paste a key first');
            return;
        }

        try {
            const isKeyValid = await validateMatchingKeys(key);
            if (!isKeyValid) {
                setWarning('The key does not match the server public key');
                return;
            }

            localStorage.setItem('privateKey', key);
            setWarning('Successfully imported private key');
        } catch (err) {
            console.error(err);
            setWarning('Import failed');
        }
    }

    // Capture the selected file from an <input type="file">
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    // Encrypt and upload the file
    const handleUpload = async () => {
        if (!selectedFile) {
            setWarning('Please select a file first.');
            return;
        }

        const MAX_SIZE = 5 * 8 * 1024 * 1024; // 5 MB
        if (selectedFile.size > MAX_SIZE) {
            setWarning('The file size must not exceed 5 MB.');
            return;
        }

        // Ensure we have a private key locally
        const privateKeyBase64 = localStorage.getItem('privateKey');
        if (!privateKeyBase64) {
            setWarning('No private key found locally. Please generate an RSA key pair first!');
            return;
        }

        try {
            // 1) Generate AES key
            const aesKey  = await generateAESKey();

            // 2) Encrypt the file with AES
            const { encryptedFile, iv } = await encryptFileRaw(await selectedFile.arrayBuffer(), aesKey);

            // 3) Get the public key from the server (or use local if you stored it)
            const pubKeyBase64 = await getPublicKeyFromServer();

            // 4) Encrypt the raw AES key with the server's public key
            const encryptedAESB64 = await encryptAESKeyWithRSA(aesKey, pubKeyBase64);

            // 5) Upload the encrypted file and the encrypted AES key (in base64) as JSON
            await uploadFileWithAESKey(selectedFile.name, new Blob([encryptedFile]), bufferToBase64(iv), encryptedAESB64);

            setWarning('File encrypted and uploaded successfully!');
        } catch (err) {
            console.error(err);
            setWarning('An error occurred during encryption or upload.');
        }
    };

    // Download and decrypt
    const handleDownload = async (fileId) => {
        setWarning(null);
        try {
            const privateKey = localStorage.getItem('privateKey');
            if (!privateKey) {
                throw new Error('No private key found locally.');
                return;
            }

            const {filename, iv, encryptedAES} = await getFileCryptoMetadata(fileId);
            const aesKey = await decryptAESKeyWithRSA(encryptedAES, privateKey)

            const encryptedArrayBuffer = await getFileEncryptedData(fileId);
            const decryptedArrayBuffer = await decryptFileRaw(encryptedArrayBuffer, iv, aesKey);

            // Create a temporary download link
            const url = window.URL.createObjectURL(new Blob([decryptedArrayBuffer]));
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            // Cleanup
            a.remove();
            window.URL.revokeObjectURL(url);

            setWarning(`File '${filename}' downloaded successfully.`);
        } catch (err) {
            console.error('Download error:', err);
            setWarning('Failed to download file.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('You are going to delete this file. Are you sure?')) return;
        try {
            await deleteFile(id);
            setFiles(prev => prev.filter(f => f.id !== id));
            setWarning('File deleted');
        } catch (e) { setWarning('Delete failed'); }
    };

    const toggleShare = (fileId) => {
        if (selectedShareFileId === fileId) {
            setSelectedShareFileId(null);
        } else {
            setSelectedShareFileId(fileId);
        }
    };
    if (!user) return null;

    return (
        <div className="container mt-5">
            <h3>Welcome, {user.username}!</h3>

            {warning && <div className="alert alert-info mt-3">{warning}</div>}

            <div className="mb-4">
                <button className="btn btn-secondary" onClick={handleGenerateRSA}>
                    Generate new RSA key pair
                </button>
            </div>

            <hr />

            <div className="card mb-4">
                <div className="card-header">Import existing private key</div>
                <div className="card-body">
                    <form onSubmit={handleImportPrivateKey}>
                    <textarea
                        className="form-control"
                        rows="4"
                        placeholder="Paste your base64 PKCS#8 key here"
                        value={importKeyText}
                        onChange={(e) => setImportKeyText(e.target.value)}
                    />
                    <button className="btn btn-outline-primary mt-2" type="submit">
                        Import key
                    </button>
                    </form>
                </div>
            </div>

            <hr />

            <div className="container mt-5">
                <ul className="list-group">
                    {files.map(file => (
                        <li key={file.id} className="list-group-item d-flex justify-content-between align-items-center">
                            {file.filename}
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => toggleShare(file.id)}>
                                Share
                            </button>

                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(file.id)}>
                                Delete
                            </button>

                            <button className="btn btn-sm btn-outline-primary" onClick={() => handleDownload(file.id)}>
                                Download
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <hr />

            <div>
                <h5>Encrypt and Upload a File (JSON-based)</h5>
                <input type="file" onChange={handleFileChange} className="form-control mb-2" />
                <button className="btn btn-primary" onClick={handleUpload}>
                    Encrypt &amp; Upload
                </button>
            </div>
            {showPrivateKey && (
                <div className="mt-5 p-3 border border-danger">
                    <h5 className="text-danger">Important!</h5>
                    <p>
                        This is your new <strong>private key</strong>. Please copy and store it in a safe place.
                        Do not share it with anyone.
                    </p>
                    <textarea
                        className="form-control mb-2"
                        rows={5}
                        value={privateKeyValue}
                        readOnly
                    />
                    <button
                        className="btn btn-warning"
                        onClick={() => setShowPrivateKey(false)}
                    >
                    I have saved my private key
                    </button>
                </div>
            )}
        </div>
    );
}

export default DashboardPage;
