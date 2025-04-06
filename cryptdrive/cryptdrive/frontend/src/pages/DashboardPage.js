import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    checkPublicKeyOnServer,
    generateRSAPair,
    uploadPublicKey,
    generateAESKey,
    encryptFileB64,
    encryptAESKeyWithRSA,
    uploadFileWithAESKey,
    getPublicKeyFromServer,
} from '../utils/crypto';

function DashboardPage() {
    const [hasPublicKey, setHasPublicKey] = useState(false);
    const [warning, setWarning] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showPrivateKey, setShowPrivateKey] = useState(false);
    const [privateKeyValue, setPrivateKeyValue] = useState('');

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

    // Capture the selected file from an <input type="file">
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    // Encrypt and upload the file via JSON approach
    const handleUpload = async () => {
        if (!selectedFile) {
            setWarning('Please select a file first.');
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
            const { aesKey, rawAES } = await generateAESKey();

            // 2) Encrypt the file with AES
            const { encryptedFile, iv } = await encryptFileB64(selectedFile.arrayBuffer(), aesKey);

            // 3) Get the public key from the server (or use local if you stored it)
            const publicKeyBase64 = await getPublicKeyFromServer();

            // 4) Encrypt the raw AES key with the server's public key
            const encryptedAES = await encryptAESKeyWithRSA(rawAES, publicKeyBase64);

            // 5) Upload the encrypted file and the encrypted AES key (in base64) as JSON
            // @TODO continue here
            // await uploadFileWithAESKey(encryptedFile, iv, encryptedAES);

            setWarning('File encrypted and uploaded successfully!');
        } catch (err) {
            console.error(err);
            setWarning('An error occurred during encryption or upload.');
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
