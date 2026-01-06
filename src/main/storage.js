import Store from 'electron-store';
import CryptoJS from 'crypto-js';

/**
 * SECURITY NOTE: The encryption key below is a basic implementation for demonstration.
 * 
 * For production use, consider these improvements:
 * 1. Derive key from a user-provided master password using PBKDF2
 * 2. Generate a unique key per installation stored in system keychain
 * 3. Use environment variables or secure configuration management
 * 4. Implement key rotation and version management
 * 
 * This basic key provides encryption at rest but should be enhanced
 * before deploying to production environments.
 */
const ENCRYPTION_KEY = 'tiktok-account-manager-v1-secret-key-2024';

class SecureStorage {
  constructor(customEncryptionKey = null) {
    this.store = new Store({
      name: 'tiktok-accounts',
      encryptionKey: 'obfuscation-key-for-store'
    });
    // Allow custom encryption key for future master password implementation
    this.encryptionKey = customEncryptionKey || ENCRYPTION_KEY;
  }

  // Encrypt data using AES-256
  encrypt(data) {
    try {
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(data),
        this.encryptionKey
      ).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw error;
    }
  }

  // Decrypt data
  decrypt(encryptedData) {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Decryption error:', error);
      throw error;
    }
  }

  // Get all accounts
  getAccounts() {
    const encrypted = this.store.get('accounts', []);
    if (!encrypted || encrypted.length === 0) return [];
    
    try {
      return encrypted.map(enc => this.decrypt(enc));
    } catch (error) {
      console.error('Error getting accounts:', error);
      return [];
    }
  }

  // Add a new account
  addAccount(account) {
    const accounts = this.getAccounts();
    const newAccount = {
      id: Date.now().toString(),
      ...account,
      createdAt: new Date().toISOString(),
      isActive: false
    };
    
    const encrypted = this.encrypt(newAccount);
    accounts.push(newAccount);
    
    const encryptedAccounts = accounts.map(acc => this.encrypt(acc));
    this.store.set('accounts', encryptedAccounts);
    
    return newAccount;
  }

  // Update an existing account
  updateAccount(id, updates) {
    const accounts = this.getAccounts();
    const index = accounts.findIndex(acc => acc.id === id);
    
    if (index === -1) {
      throw new Error('Account not found');
    }
    
    accounts[index] = { ...accounts[index], ...updates };
    const encryptedAccounts = accounts.map(acc => this.encrypt(acc));
    this.store.set('accounts', encryptedAccounts);
    
    return accounts[index];
  }

  // Delete an account
  deleteAccount(id) {
    const accounts = this.getAccounts();
    const filtered = accounts.filter(acc => acc.id !== id);
    const encryptedAccounts = filtered.map(acc => this.encrypt(acc));
    this.store.set('accounts', encryptedAccounts);
    return true;
  }

  // Get account by ID
  getAccountById(id) {
    const accounts = this.getAccounts();
    return accounts.find(acc => acc.id === id) || null;
  }

  // Save session cookies for an account
  saveCookies(accountId, cookies) {
    const encrypted = this.encrypt(cookies);
    this.store.set(`cookies_${accountId}`, encrypted);
  }

  // Get session cookies for an account
  getCookies(accountId) {
    const encrypted = this.store.get(`cookies_${accountId}`);
    if (!encrypted) return null;
    
    try {
      return this.decrypt(encrypted);
    } catch (error) {
      console.error('Error getting cookies:', error);
      return null;
    }
  }

  // Delete cookies for an account
  deleteCookies(accountId) {
    this.store.delete(`cookies_${accountId}`);
  }

  // Clear all data
  clearAll() {
    this.store.clear();
  }
}

export default SecureStorage;
