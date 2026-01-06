import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import SecureStorage from './storage.js';
import SessionManager from './session.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow;
let storage;
let sessionManager;

// Initialize storage and session manager
function initializeApp() {
  storage = new SecureStorage();
  sessionManager = new SessionManager(storage);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
    },
    backgroundColor: '#1a1a2e',
    show: false,
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
  // Get all accounts
  ipcMain.handle('get-accounts', async () => {
    try {
      return { success: true, data: storage.getAccounts() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Add account
  ipcMain.handle('add-account', async (event, account) => {
    try {
      const newAccount = storage.addAccount(account);
      return { success: true, data: newAccount };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Update account
  ipcMain.handle('update-account', async (event, id, updates) => {
    try {
      const updated = storage.updateAccount(id, updates);
      return { success: true, data: updated };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Delete account
  ipcMain.handle('delete-account', async (event, id) => {
    try {
      // Close session if active
      sessionManager.closeSession(id);
      // Delete cookies
      storage.deleteCookies(id);
      // Delete account
      storage.deleteAccount(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Open login window
  ipcMain.handle('open-login', async (event, accountId) => {
    try {
      const account = storage.getAccountById(accountId);
      if (!account) {
        throw new Error('Account not found');
      }
      await sessionManager.openLoginWindow(account);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Restore session
  ipcMain.handle('restore-session', async (event, accountId) => {
    try {
      const account = storage.getAccountById(accountId);
      if (!account) {
        throw new Error('Account not found');
      }
      await sessionManager.restoreSession(account);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Close session
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
app.whenReady().then(() => {
  initializeApp();
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
    app.quit();
  }
});

app.on('before-quit', () => {
  sessionManager.closeAllSessions();
});
