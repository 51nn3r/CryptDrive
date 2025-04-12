import { getCookie } from './csrf';

/**
 * Generate RSA key pair (publicKey + privateKey) using RSA-OAEP with SHA-256
 * Return them as Base64 strings.
 */
export async function generateRSAPair() {
    const keys = await window.crypto.subtle.generateKey(
        {
            name: 'RSA-OAEP',
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: 'SHA-256',
        },
        true,
        ['encrypt', 'decrypt']
    );

    const publicKey = await window.crypto.subtle.exportKey('spki', keys.publicKey);
    const privateKey = await window.crypto.subtle.exportKey('pkcs8', keys.privateKey);

    return {
        publicKey: bufferToBase64(publicKey),
        privateKey: bufferToBase64(privateKey),
    };
}

/**
 * Upload the public key to Django (JSON).
 * Endpoint might be: /core/upload-public-key/
 * Payload: { publicKey: base64String }
 */
export async function uploadPublicKey(publicKeyBase64) {
    const csrfToken = getCookie('csrftoken');
    const response = await fetch('/core/upload-public-key/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({ publicKey: publicKeyBase64 }),
    });
    if (!response.ok) {
        throw new Error('Failed to upload public key');
    }
}

/**
 * Check if a public key exists on the server.
 * Suppose Django returns { hasKey: true/false }
 */
export async function checkPublicKeyOnServer(userId=null) {
    const requestParams = userId ? `${encodeURIComponent(userId)}` : '';

    const response = await fetch(`/core/has-public-key/${requestParams}`, { method: 'GET' });
    if (!response.ok) {
        return false;
    }
    const data = await response.json();
    return data.hasKey;
}

/**
 * Retrieve the server's public key in base64 for local encryption tasks.
 * Suppose endpoint returns: { publicKey: '...' }
 */
export async function getPublicKeyFromServer(userId=null) {
    const requestParams = userId ? `${encodeURIComponent(userId)}` : '';

    const response = await fetch(`/core/get-public-key/${requestParams}`);
    if (!response.ok) {
        throw new Error('No public key found on server');
    }
    const data = await response.json();
    return data.publicKey;
}

/**
 * Retrieve file crypto metadata.
 * Suppose endpoint returns:
 *      {
 *          'filename': ...,
 *          'iv': ...,
 *          'encryptedAES': ...,
 *      }
 */
export async function getFileCryptoMetadata(fileID) {
    const response = await fetch(`/core/download/${fileID}/meta/`, {
        method: 'GET',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
        },
    });
    if (!response.ok) {
        throw new Error(`Failed to download aes key (${response.status}): ` + JSON.stringify(await response.json()));
    }

    const data = await response.json();

    return {
        filename: data.filename,
        iv: base64ToBuffer(data.iv),
        encryptedAES: base64ToBuffer(data.encryptedSymKey),
    };
}

/**
 * Retrieve file data (encrypted)
 */
export async function getFileEncryptedData(fileID) {
    const response = await fetch(`/core/download/${fileID}/data/`, {
        method: 'GET',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
        },
    });
    if (!response.ok) {
        throw new Error(`Failed to download file (${response.status}): ` + JSON.stringify(await response.json()));
    }

    return await response.arrayBuffer();
}

/**
 * Generate AES key (AES-GCM 256).
 */
export async function generateAESKey() {
    const key = await window.crypto.subtle.generateKey(
        {
            name: 'AES-GCM',
            length: 256,
        },
        true,
        ['encrypt', 'decrypt']
    );

    return key;
}

/**
 * Low-level function:
 * Encrypt an ArrayBuffer with an AES-GCM key
 * Returns { encryptedFile (ArrayBuffer), iv (Uint8Array) }
 */
export async function encryptFileRaw(fileBuffer, aesKey) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        aesKey,
        fileBuffer
    );
    return {
        encryptedFile: encrypted, // this is ArrayBuffer
        iv,
    };
}

/**
 * Low-level function:
 * Decrypt an ArrayBuffer with an AES-GCM key
 * - encryptedFile is ArrayBuffer
 * - iv is Uint8Array
 * Returns ArrayBuffer of decrypted data
 */
export async function decryptFileRaw(encryptedFile, iv, aesKey) {
    const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        aesKey,
        encryptedFile
    );
    return decrypted;
}

/**
 * High-level function:
 * Encrypt fileBuffer (ArrayBuffer) with AES, returning base64 strings
 */
export async function encryptFileB64(fileBuffer, aesKey) {
    const { encryptedFile, iv } = await encryptFileRaw(fileBuffer, aesKey);
    return {
        encryptedFile: bufferToBase64(encryptedFile),
        iv: bufferToBase64(iv),
    };
}

/**
 * Encrypt the AES key with an RSA public key.
 * @param aesKey: CryptoKey
 * @param publicKeyBase64: exported aes in base64 (String)
 *
 * Return base64 of the encrypted AES key.
 */
export async function encryptAESKeyWithRSA(aesKey, publicKeyBase64) {
    const publicKey = base64ToBuffer(publicKeyBase64);
    // import the public key
    const pubKey = await window.crypto.subtle.importKey(
        'spki',
        publicKey,
        {
            name: 'RSA-OAEP',
            hash: 'SHA-256',
        },
        false,
        ['encrypt']
    );

    const rawAES = await window.crypto.subtle.exportKey('raw', aesKey);
    // encrypt raw AES with RSA
    const encrypted = await window.crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        pubKey,
        rawAES
    );

    return bufferToBase64(encrypted);
}

/**
 * Decrypt the AES key with an RSA private key
 * Return AES key
 */
export async function decryptAESKeyWithRSA(encryptedAES, privateKeyBase64) {
    const privateKeyBin = base64ToBuffer(privateKeyBase64);
    const privateKey = await window.crypto.subtle.importKey(
        'pkcs8',
        privateKeyBin,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['decrypt']
    );

    const rawAESKey = await window.crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        privateKey,
        encryptedAES
    );

    return await window.crypto.subtle.importKey(
        'raw',
        rawAESKey,
        { name: 'AES-GCM' },
        true,
        ['encrypt', 'decrypt']
    );
}

/**
 * Upload encrypted file + IV + encrypted AES key as JSON
 * Endpoint: /core/upload-encrypted/
 */
export async function uploadFileWithAESKey(filename, encFile, ivBase64, encryptedAESBase64) {
    const formData = new FormData();
    formData.append('filename', filename);
    formData.append('iv', ivBase64);
    formData.append('encFile', encFile);
    formData.append('encAES', encryptedAESBase64);

    const csrfToken = getCookie('csrftoken');
    const response = await fetch('/core/upload-encrypted/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to upload encrypted file: ' + JSON.stringify(await response.json()));
    }
}

/**
 * Validate that local privateKey indeed matches the server's publicKey
 * We'll do a test encryption/decryption to see if they match
 */
export async function validateMatchingKeys(privateKeyBase64) {
    // @TODO: continue here
    const pubKeyBase64 = await getPublicKeyFromServer();
    const testData = new TextEncoder().encode('Test Encryption Data');

    // import local private key
    const privKeyBin = base64ToBuffer(privateKeyBase64);
    const privateKey = await window.crypto.subtle.importKey(
        'pkcs8',
        privKeyBin,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['decrypt']
    );

    // import server public key
    const pubKeyBin = base64ToBuffer(pubKeyBase64);
    const publicKey = await window.crypto.subtle.importKey(
        'spki',
        pubKeyBin,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['encrypt']
    );

    // encrypt testData with public key
    const encrypted = await window.crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        publicKey,
        testData
    );

    // decrypt with local private key
    const decrypted = await window.crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        privateKey,
        encrypted
    );

    const decryptedStr = new TextDecoder().decode(decrypted);
    return decryptedStr === 'Test Encryption Data';
}

/**
 * Fetch list of users, filtered by search term
 * GET /core/list-users/{searchTerm}
 */
export async function fetchUsers(searchTerm='') {
    const requestParams = searchTerm ? `${encodeURIComponent(searchTerm)}` : '';
    const response = await fetch(`/core/list-users/${requestParams}`, {
    method: 'GET',
    headers: {
          'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch users (${response.status}): ` + JSON.stringify(await response.json()));
    }
    return await response.json(); // [{ id, username }, ...] - UserListSerializer format
}

/**
 * Share file (re-encrypt AES key with recipient's public key on client)
 * then send it to server:
 * POST /core/share-file/ with { file_id, recipient_id, encrypted_sym_key }
 */
export async function shareFile(fileId, recipientId, encryptedSymKeyB64) {
    const response = await fetch('/core/share-file/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({
            file_id: fileId,
            recipient_id: recipientId,
            encrypted_sym_key: encryptedSymKeyB64,
        }),
    });

    if (!response.ok) {
        throw new Error(`Failed to share file (${response.status}): ` + JSON.stringify(await response.json()));
    }
    return await response.json(); // { msg: 'File shared successfully', shared_key_id: ... }
}

/*  Helpers for base64 <-> ArrayBuffer  */

export function bufferToBase64(arrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export function base64ToBuffer(base64) {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}
