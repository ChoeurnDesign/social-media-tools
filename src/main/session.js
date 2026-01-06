import { BrowserWindow } from 'electron';

class SessionManager {
  constructor(storage) {
    this.storage = storage;
    this.activeSessions = new Map(); // accountId -> BrowserWindow
  }

  // Open TikTok login for an account
  async openLoginWindow(account) {
    // Check if already have a window for this account
    if (this.activeSessions.has(account.id)) {
      const existingWindow = this.activeSessions.get(account.id);
      if (!existingWindow.isDestroyed()) {
        existingWindow.focus();
        return existingWindow;
      } else {
        this.activeSessions.delete(account.id);
      }
    }

    // Create a new browser window for TikTok
    const sessionWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        partition: `persist:tiktok_${account.id}`, // Isolated session for each account
      },
    });

    // Load TikTok
    await sessionWindow.loadURL('https://www.tiktok.com/login');

    // Store the window reference
    this.activeSessions.set(account.id, sessionWindow);

    // Mark account as active
    this.storage.updateAccount(account.id, { isActive: true });

    // Handle window close
    sessionWindow.on('closed', () => {
      this.activeSessions.delete(account.id);
      this.storage.updateAccount(account.id, { isActive: false });
    });

    // Save cookies when user navigates
    sessionWindow.webContents.on('did-navigate', async () => {
      try {
        const cookies = await sessionWindow.webContents.session.cookies.get({});
        if (cookies.length > 0) {
          this.storage.saveCookies(account.id, cookies);
        }
      } catch (error) {
        console.error('Error saving cookies:', error);
      }
    });

    return sessionWindow;
  }

  // Restore session from saved cookies
  async restoreSession(account) {
    const savedCookies = this.storage.getCookies(account.id);
    
    if (!savedCookies || savedCookies.length === 0) {
      // No saved session, open login window
      return this.openLoginWindow(account);
    }

    const sessionWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        partition: `persist:tiktok_${account.id}`,
      },
    });

    // Restore cookies before loading
    try {
      for (const cookie of savedCookies) {
        await sessionWindow.webContents.session.cookies.set({
          url: cookie.domain.startsWith('.') 
            ? `https://www${cookie.domain}` 
            : `https://${cookie.domain}`,
          name: cookie.name,
          value: cookie.value,
          domain: cookie.domain,
          path: cookie.path,
          secure: cookie.secure,
          httpOnly: cookie.httpOnly,
          expirationDate: cookie.expirationDate,
        });
      }
    } catch (error) {
      console.error('Error restoring cookies:', error);
    }

    // Load TikTok
    await sessionWindow.loadURL('https://www.tiktok.com');

    this.activeSessions.set(account.id, sessionWindow);
    this.storage.updateAccount(account.id, { isActive: true });

    sessionWindow.on('closed', () => {
      this.activeSessions.delete(account.id);
      this.storage.updateAccount(account.id, { isActive: false });
    });

    // Update cookies as user navigates
    sessionWindow.webContents.on('did-navigate', async () => {
      try {
        const cookies = await sessionWindow.webContents.session.cookies.get({});
        if (cookies.length > 0) {
          this.storage.saveCookies(account.id, cookies);
        }
      } catch (error) {
        console.error('Error saving cookies:', error);
      }
    });

    return sessionWindow;
  }

  // Close session for an account
  closeSession(accountId) {
    const window = this.activeSessions.get(accountId);
    if (window && !window.isDestroyed()) {
      window.close();
    }
    this.activeSessions.delete(accountId);
    this.storage.updateAccount(accountId, { isActive: false });
  }

  // Close all sessions
  closeAllSessions() {
    for (const [accountId, window] of this.activeSessions.entries()) {
      if (!window.isDestroyed()) {
        window.close();
      }
      this.storage.updateAccount(accountId, { isActive: false });
    }
    this.activeSessions.clear();
  }

  // Get active session count
  getActiveSessionCount() {
    return this.activeSessions.size;
  }

  // Check if account has active session
  isSessionActive(accountId) {
    return this.activeSessions.has(accountId);
  }
}

export default SessionManager;
