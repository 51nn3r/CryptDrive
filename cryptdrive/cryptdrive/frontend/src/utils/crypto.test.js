import {
    generateRSAPair,
    generateAESKey,
    encryptFileRaw,
    decryptFileRaw,
    encryptAESKeyWithRSA,
    decryptAESKeyWithRSA
} from './crypto';

describe('Encryption and Decryption Workflow', () => {

  test('RSA encryption/decryption works', async () => {
    const { publicKey, privateKey } = await generateRSAPair();
    const { rawAES } = await generateAESKey();

    const encryptedAESKey = await encryptAESKeyWithRSA(rawAES, publicKey);
    const decryptedAESKey = await decryptAESKeyWithRSA(encryptedAESKey, privateKey);

    expect(decryptedAESKey).toEqual(rawAES);
  });

  test('AES file encryption/decryption works', async () => {
    const { aesKey } = await generateAESKey();

    const originalText = "This is a test file";
    const originalFileData = new TextEncoder().encode(originalText);

    const { encryptedFile, iv } = await encryptFileRaw(originalFileData, aesKey);
    const decryptedFileData = await decryptFileRaw(encryptedFile, iv, aesKey);

    const decryptedText = new TextDecoder().decode(decryptedFileData);
    expect(decryptedText).toBe(originalText);
  });

  test('Full encryption/decryption workflow works correctly', async () => {
    const { publicKey, privateKey } = await generateRSAPair();
    const { aesKey, rawAES } = await generateAESKey();

    const originalText = "Full cycle encryption test";
    const originalFileData = new TextEncoder().encode(originalText);
    const { encryptedFile, iv } = await encryptFileRaw(originalFileData, aesKey);
    const encryptedAESKey = await encryptAESKeyWithRSA(rawAES, publicKey);
    const decryptedAESKey = await decryptAESKeyWithRSA(encryptedAESKey, privateKey);
    const aesKeyForDecrypt = await window.crypto.subtle.importKey(
      'raw',
      Uint8Array.from(atob(decryptedAESKey), c => c.charCodeAt(0)),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    const decryptedFileData = await decryptFileRaw(encryptedFile, iv, aesKeyForDecrypt);
    const decryptedText = new TextDecoder().decode(decryptedFileData);

    expect(decryptedText).toBe(originalText);
  });
});
