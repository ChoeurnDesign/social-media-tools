import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Account management
  getAccounts: () => ipcRenderer.invoke('get-accounts'),
  addAccount: (account) => ipcRenderer.invoke('add-account', account),
  updateAccount: (id, updates) => ipcRenderer.invoke('update-account', id, updates),
  deleteAccount: (id) => ipcRenderer.invoke('delete-account', id),
  bulkDeleteAccounts: (accountIds) => ipcRenderer.invoke('bulk-delete-accounts', accountIds),
  
  // Mobile instance management
  createMobileInstance: (accountId) => ipcRenderer.invoke('create-mobile-instance', accountId),
  closeInstance: (accountId) => ipcRenderer.invoke('close-instance', accountId),
  closeAllInstances: () => ipcRenderer.invoke('close-all-instances'),
  startMultipleInstances: (count) => ipcRenderer.invoke('start-multiple-instances', count),
  arrangeInstances: () => ipcRenderer.invoke('arrange-instances'),
  getActiveInstances: () => ipcRenderer.invoke('get-active-instances'),
  updateInstanceSettings: (settings) => ipcRenderer.invoke('update-instance-settings', settings),
  getInstanceSettings: () => ipcRenderer.invoke('get-instance-settings'),
  getDevicePresets: () => ipcRenderer.invoke('get-device-presets'),
  
  // Automation
  getAutomationPresets: () => ipcRenderer.invoke('get-automation-presets'),
  applyAutomationPreset: (accountId, presetName) => ipcRenderer.invoke('apply-automation-preset', accountId, presetName),
  startAutomation: (accountId) => ipcRenderer.invoke('start-automation', accountId),
  stopAutomation: (accountId) => ipcRenderer.invoke('stop-automation', accountId),
  updateAutomationSettings: (accountId, settings) => ipcRenderer.invoke('update-automation-settings', accountId, settings),
  getAutomationSettings: (accountId) => ipcRenderer.invoke('get-automation-settings', accountId),
  bulkApplyPreset: (accountIds, presetName) => ipcRenderer.invoke('bulk-apply-preset', accountIds, presetName),
  autoScrollAll: (speed) => ipcRenderer.invoke('auto-scroll-all', speed),
  stopAutoScrollAll: () => ipcRenderer.invoke('stop-auto-scroll-all'),
  
  // Groups & Tags
  addGroup: (name, color, parentId) => ipcRenderer.invoke('add-group', name, color, parentId),
  getGroups: () => ipcRenderer.invoke('get-groups'),
  assignAccountToGroup: (accountId, groupId) => ipcRenderer.invoke('assign-account-to-group', accountId, groupId),
  addTag: (name, color) => ipcRenderer.invoke('add-tag', name, color),
  getTags: () => ipcRenderer.invoke('get-tags'),
  assignTagToAccount: (accountId, tagId) => ipcRenderer.invoke('assign-tag-to-account', accountId, tagId),
  
  // Statistics & Analytics
  getStatistics: () => ipcRenderer.invoke('get-statistics'),
  getActivityLogs: (accountId, limit) => ipcRenderer.invoke('get-activity-logs', accountId, limit),
  
  // Proxies
  addProxy: (proxyData) => ipcRenderer.invoke('add-proxy', proxyData),
  getProxies: () => ipcRenderer.invoke('get-proxies'),
  assignProxyToAccount: (accountId, proxyId) => ipcRenderer.invoke('assign-proxy-to-account', accountId, proxyId),
  
  // Legacy session management
  openLogin: (accountId) => ipcRenderer.invoke('open-login', accountId),
  closeSession: (accountId) => ipcRenderer.invoke('close-session', accountId),
  
  // Theme management
  getTheme: () => ipcRenderer.invoke('get-theme'),
  setTheme: (theme) => ipcRenderer.invoke('set-theme', theme),
});

