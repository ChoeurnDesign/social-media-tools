import { BrowserWindow, screen } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Device presets
const DEVICE_PRESETS = {
  'iphone13': { width: 390, height: 844, name: 'iPhone 13' },
  'iphone8': { width: 375, height: 667, name: 'iPhone 8' },
  'pixel6': { width: 412, height: 915, name: 'Google Pixel 6' },
  'galaxy-s21': { width: 360, height: 800, name: 'Galaxy S21' },
  'custom': { width: 360, height: 780, name: 'Custom' }
};

class InstanceManager {
  constructor(database) {
    this.db = database;
    this.instances = new Map(); // accountId -> BrowserWindow
    this.settings = {
      devicePreset: 'iphone13',
      instancesPerRow: 3,
      spacing: 20,
      maxInstances: 10,
      autoArrange: true
    };
  }

  createMobileInstance(account, options = {}) {
    // Check if instance already exists
    if (this.instances.has(account.id)) {
      const existingWindow = this.instances.get(account.id);
      if (!existingWindow.isDestroyed()) {
        existingWindow.focus();
        return existingWindow;
      } else {
        this.instances.delete(account.id);
      }
    }

    // Check max instances limit
    if (this.instances.size >= this.settings.maxInstances) {
      throw new Error(`Maximum ${this.settings.maxInstances} instances allowed`);
    }

    // Get device dimensions
    const preset = DEVICE_PRESETS[this.settings.devicePreset] || DEVICE_PRESETS.iphone13;
    const width = options.width || preset.width;
    const height = options.height || preset.height;

    // Calculate position
    const { x, y } = this.calculatePosition(width, height);

    // Create mobile window
    const mobileWindow = new BrowserWindow({
      width,
      height,
      x,
      y,
      title: `TikTok - ${account.username}`,
      resizable: true,
      webPreferences: {
        partition: `persist:tiktok_${account.id}`,
        contextIsolation: true,
        nodeIntegration: false,
        preload: path.join(__dirname, '../mobile/mobile-preload.cjs')
      },
      backgroundColor: '#000000',
      show: false
    });

    // Set mobile user agent
    const userAgent = this.getMobileUserAgent();
    mobileWindow.webContents.setUserAgent(userAgent);

    // Load TikTok
    mobileWindow.loadURL('https://www.tiktok.com');

    // Show when ready
    mobileWindow.once('ready-to-show', () => {
      mobileWindow.show();
    });

    // Handle window close
    mobileWindow.on('closed', () => {
      this.instances.delete(account.id);
      
      // Update account status
      this.db.updateAccount(account.id, { status: 'inactive' });
      
      // Log activity
      this.db.logActivity(account.id, 'instance_closed');
    });

    // Store instance
    this.instances.set(account.id, mobileWindow);

    // Update account status
    this.db.updateAccount(account.id, { status: 'active' });
    this.db.updateLastLogin(account.id);

    // Log activity
    this.db.logActivity(account.id, 'instance_opened');

    return mobileWindow;
  }

  calculatePosition(width, height) {
    if (!this.settings.autoArrange) {
      return { x: 100, y: 100 };
    }

    const instanceCount = this.instances.size;
    const columns = this.settings.instancesPerRow;
    const spacing = this.settings.spacing;

    const column = instanceCount % columns;
    const row = Math.floor(instanceCount / columns);

    const x = 100 + (column * (width + spacing));
    const y = 100 + (row * (height + spacing));

    return { x, y };
  }

  getMobileUserAgent() {
    return 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) ' +
           'AppleWebKit/605.1.15 (KHTML, like Gecko) ' +
           'Version/15.0 Mobile/15E148 Safari/604.1';
  }

  closeInstance(accountId) {
    const window = this.instances.get(accountId);
    if (window && !window.isDestroyed()) {
      window.close();
    }
    this.instances.delete(accountId);
  }

  closeAllInstances() {
    for (const [accountId, window] of this.instances) {
      if (!window.isDestroyed()) {
        window.close();
      }
    }
    this.instances.clear();
  }

  focusInstance(accountId) {
    const window = this.instances.get(accountId);
    if (window && !window.isDestroyed()) {
      window.focus();
    }
  }

  arrangeInstances() {
    const instances = Array.from(this.instances.values());
    if (instances.length === 0) return;

    // Get screen dimensions
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

    // iPhone 13 dimensions
    const instanceWidth = 390;
    const instanceHeight = 844;
    const gap = 0; // No gap - windows perfectly touching

    // Calculate how many instances fit per row
    const instancesPerRow = Math.floor(screenWidth / (instanceWidth + gap));

    // Position each instance in a grid
    instances.forEach((instance, index) => {
      if (instance.isDestroyed()) return;

      // Calculate row and column
      const row = Math.floor(index / instancesPerRow);
      const col = index % instancesPerRow;

      // Calculate x and y positions
      const x = col * (instanceWidth + gap);
      const y = row * (instanceHeight + gap);

      // Check if instance fits on screen
      if (y + instanceHeight > screenHeight) {
        // Instance would be off-screen, skip or handle differently
        console.warn(`Instance ${index} would be off-screen at y: ${y}`);
        return;
      }

      // Set bounds
      instance.setBounds({
        x: Math.round(x),
        y: Math.round(y),
        width: instanceWidth,
        height: instanceHeight
      });

      // Bring to front
      instance.show();
    });
  }

  async startMultipleInstances(accounts, count = 3) {
    const results = [];
    const accountsToStart = accounts.slice(0, Math.min(count, this.settings.maxInstances - this.instances.size));

    for (const account of accountsToStart) {
      try {
        const window = this.createMobileInstance(account);
        results.push({ success: true, accountId: account.id, window });
      } catch (error) {
        results.push({ success: false, accountId: account.id, error: error.message });
      }
    }

    return results;
  }

  getActiveInstances() {
    const active = [];
    for (const [accountId, window] of this.instances) {
      if (!window.isDestroyed()) {
        active.push({
          accountId,
          title: window.getTitle(),
          bounds: window.getBounds(),
          isVisible: window.isVisible(),
          isFocused: window.isFocused()
        });
      }
    }
    return active;
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    
    // Re-arrange if auto-arrange is enabled
    if (this.settings.autoArrange) {
      this.arrangeInstances();
    }
  }

  getSettings() {
    return { ...this.settings };
  }

  getDevicePresets() {
    return DEVICE_PRESETS;
  }

  async autoScrollAll(speed = 100) {
    for (const [accountId, window] of this.instances) {
      if (!window.isDestroyed()) {
        window.webContents.send('automation-command', {
          command: 'start-auto-scroll',
          speed
        });
      }
    }
  }

  async stopAutoScrollAll() {
    for (const [accountId, window] of this.instances) {
      if (!window.isDestroyed()) {
        window.webContents.send('automation-command', {
          command: 'stop-auto-scroll'
        });
      }
    }
  }

  async sendCommandToInstance(accountId, command, params = {}) {
    const window = this.instances.get(accountId);
    if (window && !window.isDestroyed()) {
      window.webContents.send('automation-command', {
        command,
        ...params
      });
    }
  }
}

export default InstanceManager;
