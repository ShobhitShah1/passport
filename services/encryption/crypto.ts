import * as Crypto from 'expo-crypto';
import { EncryptionKey, StoredData } from '../../types';

const SALT_LENGTH = 32;
const IV_LENGTH = 16;

/**
 * Generate a cryptographically secure random salt
 */
export async function generateSalt(): Promise<string> {
  const saltBytes = await Crypto.getRandomBytesAsync(SALT_LENGTH);
  return arrayBufferToBase64(saltBytes.buffer as ArrayBuffer);
}

/**
 * Generate a cryptographically secure random IV
 */
export async function generateIV(): Promise<string> {
  const ivBytes = await Crypto.getRandomBytesAsync(IV_LENGTH);
  return arrayBufferToBase64(ivBytes.buffer as ArrayBuffer);
}

/**
 * Derive an encryption key from a master password using simple digest
 * Note: In production, use proper PBKDF2 implementation
 */
export async function deriveKey(
  masterPassword: string,
  salt: string
): Promise<string> {
  const combined = masterPassword + salt;
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    combined,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );
  return hash;
}

/**
 * Create an encryption key with salt and IV
 */
export async function createEncryptionKey(masterPassword: string): Promise<EncryptionKey> {
  const salt = await generateSalt();
  const iv = await generateIV();
  const key = await deriveKey(masterPassword, salt);

  return { key, salt, iv };
}

/**
 * Simple encryption using base64 encoding with key obfuscation
 * Note: This is a simplified version for demo. Use proper encryption in production.
 */
export async function encrypt(
  data: string,
  encryptionKey: EncryptionKey
): Promise<StoredData> {
  // Simple XOR-based encryption with key
  const key = encryptionKey.key;
  let encrypted = '';
  
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    encrypted += String.fromCharCode(charCode);
  }

  const encryptedBase64 = btoa(encrypted);

  return {
    encrypted: encryptedBase64,
    salt: encryptionKey.salt,
    iv: encryptionKey.iv,
  };
}

/**
 * Simple decryption 
 * Note: This is a simplified version for demo. Use proper encryption in production.
 */
export async function decrypt(
  storedData: StoredData,
  masterPassword: string
): Promise<string> {
  const key = await deriveKey(masterPassword, storedData.salt);
  const encrypted = atob(storedData.encrypted);
  
  let decrypted = '';
  for (let i = 0; i < encrypted.length; i++) {
    const charCode = encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    decrypted += String.fromCharCode(charCode);
  }

  return decrypted;
}

/**
 * Hash a password for verification (never store the actual password)
 */
export async function hashPassword(
  password: string,
  salt: string
): Promise<string> {
  const combined = password + salt;
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    combined,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );
  return hash;
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string,
  salt: string
): Promise<boolean> {
  const hash = await hashPassword(password, salt);
  return hash === hashedPassword;
}

/**
 * Convert ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}