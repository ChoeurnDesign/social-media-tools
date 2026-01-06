import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Account management
  getAccounts: () => ipcRenderer.invoke('get-accounts'),
  addAccount: (account) => ipcRenderer.invoke('add-account', account),
  updateAccount: (id, updates) => ipcRenderer.invoke('update-account', id, updates),
  deleteAccount: (id) => ipcRenderer.invoke('delete-account', id),
  
  // Session management
  openLogin: (accountId) => ipcRenderer.invoke('open-login', accountId),
  restoreSession: (accountId) => ipcRenderer.invoke('restore-session', accountId),
  closeSession: (accountId) => ipcRenderer.invoke('close-session', accountId),
  
  // Theme management
  getTheme: () => ipcRenderer.invoke('get-theme'),
  setTheme: (theme) => ipcRenderer.invoke('set-theme', theme),
});
