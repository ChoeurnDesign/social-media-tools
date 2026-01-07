import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import SecureStorage from './storage.js';
import SessionManager from './session.js';
import DatabaseManager from './database.js';
import InstanceManager from './instance-manager.js';
import AutomationEngine from './automation-engine.js';
import Migration from './migration.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow;
let storage;
let sessionManager;
let database;
let instanceManager;
let automationEngine;
let migrationCompleted = false;

// Initialize all managers
async function initializeApp() {
  storage = new SecureStorage();
  database = new DatabaseManager();
  instanceManager = new InstanceManager(database);
  automationEngine = new AutomationEngine(database, instanceManager);
  sessionManager = new SessionManager(storage);
  
  // Run migration from JSON to SQLite
  try {
    const migration = new Migration();
    const result = await migration.migrate();
    console.log('Migration result:', result);
    migrationCompleted = true;
  } catch (error) {
    console.error('Migration error:', error);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.cjs'),
    },
    backgroundColor: '#1a1d29',
    show: false,
    frame: true,
    titleBarStyle: 'default'
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers
function setupIpcHandlers() {
  // ============ Account Management ============
  
  // Get all accounts
  ipcMain.handle('get-accounts', async () => {
    try {
      return { success: true, data: database.getAccounts() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Add account
  ipcMain.handle('add-account', async (event, account) => {
    try {
      const newAccount = database.addAccount(account);
      return { success: true, data: newAccount };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Update account
  ipcMain.handle('update-account', async (event, id, updates) => {
    try {
      const updated = database.updateAccount(id, updates);
      return { success: true, data: updated };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Delete account
  ipcMain.handle('delete-account', async (event, id) => {
    try {
      // Close instance if active
      instanceManager.closeInstance(id);
      // Close old session if active
      sessionManager.closeSession(id);
      // Delete account from database
      database.deleteAccount(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Bulk delete accounts
  ipcMain.handle('bulk-delete-accounts', async (event, accountIds) => {
    try {
      for (const id of accountIds) {
        instanceManager.closeInstance(id);
        sessionManager.closeSession(id);
        database.deleteAccount(id);
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // ============ Mobile Instance Management ============
  
  // Create mobile instance
  ipcMain.handle('create-mobile-instance', async (event, accountId) => {
    try {
      const account = database.getAccountById(accountId);
      if (!account) {
        throw new Error('Account not found');
      }
      const window = instanceManager.createMobileInstance(account);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Close instance
  ipcMain.handle('close-instance', async (event, accountId) => {
    try {
      instanceManager.closeInstance(accountId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Close all instances
  ipcMain.handle('close-all-instances', async () => {
    try {
      instanceManager.closeAllInstances();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Start multiple instances
  ipcMain.handle('start-multiple-instances', async (event, count) => {
    try {
      const accounts = database.getAccounts().filter(a => a.status !== 'active');
      const results = await instanceManager.startMultipleInstances(accounts, count);
      return { success: true, data: results };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Arrange instances
  ipcMain.handle('arrange-instances', async () => {
    try {
      instanceManager.arrangeInstances();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Get active instances
  ipcMain.handle('get-active-instances', async () => {
    try {
      const instances = instanceManager.getActiveInstances();
      return { success: true, data: instances };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Update instance settings
  ipcMain.handle('update-instance-settings', async (event, settings) => {
    try {
      instanceManager.updateSettings(settings);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Get instance settings
  ipcMain.handle('get-instance-settings', async () => {
    try {
      const settings = instanceManager.getSettings();
      return { success: true, data: settings };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Get device presets
  ipcMain.handle('get-device-presets', async () => {
    try {
      const presets = instanceManager.getDevicePresets();
      return { success: true, data: presets };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // ============ Automation ============
  
  // Get automation presets
  ipcMain.handle('get-automation-presets', async () => {
    try {
      const presets = automationEngine.getPresets();
      return { success: true, data: presets };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Apply automation preset
  ipcMain.handle('apply-automation-preset', async (event, accountId, presetName) => {
    try {
      const result = await automationEngine.applyPreset(accountId, presetName);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Start automation
  ipcMain.handle('start-automation', async (event, accountId) => {
    try {
      const result = await automationEngine.startAutomation(accountId);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Stop automation
  ipcMain.handle('stop-automation', async (event, accountId) => {
    try {
      const result = await automationEngine.stopAutomation(accountId);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Update automation settings
  ipcMain.handle('update-automation-settings', async (event, accountId, settings) => {
    try {
      const result = await automationEngine.updateSettings(accountId, settings);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Get automation settings
  ipcMain.handle('get-automation-settings', async (event, accountId) => {
    try {
      const settings = database.getAutomationSettings(accountId);
      return { success: true, data: settings };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Bulk apply preset
  ipcMain.handle('bulk-apply-preset', async (event, accountIds, presetName) => {
    try {
      const results = await automationEngine.bulkApplyPreset(accountIds, presetName);
      return { success: true, data: results };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Auto scroll all
  ipcMain.handle('auto-scroll-all', async (event, speed) => {
    try {
      await instanceManager.autoScrollAll(speed);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Stop auto scroll all
  ipcMain.handle('stop-auto-scroll-all', async () => {
    try {
      await instanceManager.stopAutoScrollAll();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // ============ Groups & Tags ============
  
  // Add group
  ipcMain.handle('add-group', async (event, name, color, parentId) => {
    try {
      const group = database.addGroup(name, color, parentId);
      return { success: true, data: group };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Get groups
  ipcMain.handle('get-groups', async () => {
    try {
      const groups = database.getGroups();
      return { success: true, data: groups };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Assign account to group
  ipcMain.handle('assign-account-to-group', async (event, accountId, groupId) => {
    try {
      database.assignAccountToGroup(accountId, groupId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Add tag
  ipcMain.handle('add-tag', async (event, name, color) => {
    try {
      const tag = database.addTag(name, color);
      return { success: true, data: tag };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Get tags
  ipcMain.handle('get-tags', async () => {
    try {
      const tags = database.getTags();
      return { success: true, data: tags };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Assign tag to account
  ipcMain.handle('assign-tag-to-account', async (event, accountId, tagId) => {
    try {
      database.assignTagToAccount(accountId, tagId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // ============ Statistics & Analytics ============
  
  // Get statistics
  ipcMain.handle('get-statistics', async () => {
    try {
      const stats = database.getStatistics();
      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Get activity logs
  ipcMain.handle('get-activity-logs', async (event, accountId, limit) => {
    try {
      const logs = database.getActivityLogs(accountId, limit);
      return { success: true, data: logs };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // ============ Proxies ============
  
  // Add proxy
  ipcMain.handle('add-proxy', async (event, proxyData) => {
    try {
      const proxy = database.addProxy(proxyData);
      return { success: true, data: proxy };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Get proxies
  ipcMain.handle('get-proxies', async () => {
    try {
      const proxies = database.getProxies();
      return { success: true, data: proxies };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Assign proxy to account
  ipcMain.handle('assign-proxy-to-account', async (event, accountId, proxyId) => {
    try {
      database.assignProxyToAccount(accountId, proxyId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // ============ Content Queue ============
  
  // Add to content queue
  ipcMain.handle('add-to-content-queue', async (event, queueData) => {
    try {
      const item = database.addToContentQueue(queueData);
      return { success: true, data: item };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Get content queue
  ipcMain.handle('get-content-queue', async (event, accountId) => {
    try {
      const queue = database.getContentQueue(accountId);
      return { success: true, data: queue };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Update content queue status
  ipcMain.handle('update-content-queue-status', async (event, id, status, postedAt) => {
    try {
      database.updateContentQueueStatus(id, status, postedAt);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Delete from content queue
  ipcMain.handle('delete-from-content-queue', async (event, id) => {
    try {
      database.deleteFromContentQueue(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // ============ Settings ============
  
  // Get setting
  ipcMain.handle('get-setting', async (event, key, defaultValue) => {
    try {
      const value = database.getSetting(key, defaultValue);
      return { success: true, data: value };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Set setting
  ipcMain.handle('set-setting', async (event, key, value) => {
    try {
      database.setSetting(key, value);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Get all settings
  ipcMain.handle('get-all-settings', async () => {
    try {
      const settings = database.getAllSettings();
      return { success: true, data: settings };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // ============ Legacy Handlers (for backward compatibility) ============
  
  // Open login window (old method)
  ipcMain.handle('open-login', async (event, accountId) => {
    try {
      const account = database.getAccountById(accountId);
      if (!account) {
        throw new Error('Account not found');
      }
      await sessionManager.openLoginWindow(account);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Close session (old method)
  ipcMain.handle('close-session', async (event, accountId) => {
    try {
      sessionManager.closeSession(accountId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Get theme preference
  ipcMain.handle('get-theme', () => {
    return storage.store.get('theme', 'dark');
  });

  // Set theme preference
  ipcMain.handle('set-theme', (event, theme) => {
    storage.store.set('theme', theme);
    return { success: true };
  });
}

// App lifecycle
app.whenReady().then(async () => {
  await initializeApp();
  setupIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    sessionManager.closeAllSessions();
    instanceManager.closeAllInstances();
    database.close();
    app.quit();
  }
});

app.on('before-quit', () => {
  sessionManager.closeAllSessions();
  instanceManager.closeAllInstances();
  database.close();
});
