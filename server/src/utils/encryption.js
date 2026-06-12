const crypto = require('crypto');

// Get the encryption key from environment variable
// It must be a 32-byte hex string (64 characters)
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
  }
  return Buffer.from(key, 'hex');
};

const ALGORITHM = 'aes-256-cbc';

const encrypt = (text) => {
  if (!text) return text;
  
  try {
    // Generate a deterministic initialization vector based on text and key
    const iv = crypto.createHmac('md5', getEncryptionKey()).update(text).digest();
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
    
    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return iv and encrypted data concatenated
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    return text; // Fallback or throw error based on requirements
  }
};

const decrypt = (encryptedText) => {
  if (!encryptedText || !encryptedText.includes(':')) return encryptedText;
  
  try {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedData = parts.join(':');
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
    
    // Decrypt the text
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    // If decryption fails, it might be unencrypted legacy data
    console.error('Decryption error (might be legacy data):', error);
    return encryptedText;
  }
};

module.exports = {
  encrypt,
  decrypt
};
