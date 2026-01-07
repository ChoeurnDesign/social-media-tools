import { BrowserWindow, screen } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Device presets with comprehensive anti-detection properties
const DEVICE_PRESETS = {
  iphone13promax: {
    name: 'iPhone 13 Pro Max',
    width: 428,
    height: 926,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Mobile/15E148 Safari/604.1',
    platform: 'iPhone',
    devicePixelRatio: 3
  },
  iphone13: {
    name: 'iPhone 13',
    width: 390,
    height: 844,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    platform: 'iPhone',
    devicePixelRatio: 3
  },
  iphone12: {
    name: 'iPhone 12',
    width: 390,
    height: 844,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.7 Mobile/15E148 Safari/604.1',
    platform: 'iPhone',
    devicePixelRatio: 3
  },
  iphone11: {
    name: 'iPhone 11',
    width: 414,
    height: 896,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.5 Mobile/15E148 Safari/604.1',
    platform: 'iPhone',
    devicePixelRatio: 2
  },
  galaxys21: {
    name: 'Samsung Galaxy S21',
    width: 360,
    height: 800,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
    platform: 'Linux armv8l',
    devicePixelRatio: 3
  },
  pixel6: {
    name: 'Google Pixel 6',
    width: 412,
    height: 915,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
    platform: 'Linux armv8l',
    devicePixelRatio: 2.625
  },
  oneplus9: {
    name: 'OnePlus 9',
    width: 412,
    height: 919,
    userAgent: 'Mozilla/5.0 (Linux; Android 12; LE2113) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36',
    platform: 'Linux armv8l',
    devicePixelRatio: 3.5
  },
  iphone14: {
    name: 'iPhone 14',
    width: 390,
    height: 844,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    platform: 'iPhone',
    devicePixelRatio: 3
  },
  iphone14pro: {
    name: 'iPhone 14 Pro',
    width: 393,
    height: 852,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    platform: 'iPhone',
    devicePixelRatio: 3
  },
  galaxys22: {
    name: 'Samsung Galaxy S22',
    width: 360,
    height: 780,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S901B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Mobile Safari/537.36',
    platform: 'Linux armv8l',
    devicePixelRatio: 3
  }
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

    // ✅ Get device for this account (random if not assigned)
    let deviceType = this.db.getAccountDevice(account.id);
    if (!deviceType || !DEVICE_PRESETS[deviceType]) {
      deviceType = this.db.assignRandomDeviceToAccount(account.id);
    }
    
    const devicePreset = DEVICE_PRESETS[deviceType];
    
    // ✅ Add random variation to dimensions (±5px to avoid exact fingerprinting)
    const widthVariation = Math.floor(Math.random() * 11) - 5;  // -5 to +5
    const heightVariation = Math.floor(Math.random() * 11) - 5;
    
    const width = options.width || (devicePreset.width + widthVariation);
    const height = options.height || (devicePreset.height + heightVariation);

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

    // ✅ Set device-specific user agent
    mobileWindow.webContents.setUserAgent(devicePreset.userAgent);

    // Load TikTok
    mobileWindow.loadURL('https://www.tiktok.com');

    // Show when ready
    mobileWindow.once('ready-to-show', () => {
      mobileWindow.show();
      
      // ✅ Inject device fingerprint spoofing
      this.injectDeviceFingerprint(mobileWindow, devicePreset);
    });

    // Handle window close
    mobileWindow.on('closed', () => {
      this.instances.delete(account.id);
      this.db.updateAccount(account.id, { status: 'inactive' });
      this.db.logActivity(account.id, 'instance_closed');
    });

    // Store instance
    this.instances.set(account.id, mobileWindow);

    // Update account status
    this.db.updateAccount(account.id, { status: 'active' });
    this.db.updateLastLogin(account.id);

    // Log activity with device info
    this.db.logActivity(account.id, 'instance_opened', { device: devicePreset.name });

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

  injectDeviceFingerprint(window, devicePreset) {
    // Calculate random values outside template to ensure consistency
    const hardwareConcurrency = 4 + Math.floor(Math.random() * 5);  // 4-8 cores
    const deviceMemory = [4, 6, 8, 12, 16][Math.floor(Math.random() * 5)];  // Random GB
    
    // Inject JavaScript to override device fingerprinting
    window.webContents.executeJavaScript(`
      // Override navigator properties
      Object.defineProperty(navigator, 'platform', {
        get: () => '${devicePreset.platform}'
      });
      
      Object.defineProperty(window, 'devicePixelRatio', {
        get: () => ${devicePreset.devicePixelRatio}
      });
      
      // Randomize some browser features slightly
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        get: () => ${hardwareConcurrency}  // 4-8 cores
      });
      
      // Random device memory (4-16 GB)
      Object.defineProperty(navigator, 'deviceMemory', {
        get: () => ${deviceMemory}
      });
      
      console.log('🎭 Device fingerprint spoofing active:', {
        platform: '${devicePreset.platform}',
        devicePixelRatio: ${devicePreset.devicePixelRatio},
        hardwareConcurrency: ${hardwareConcurrency},
        deviceMemory: ${deviceMemory},
        userAgent: navigator.userAgent
      });
    `);
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
        // Get device type for this account
        const deviceType = this.db.getAccountDevice(accountId);
        const devicePreset = DEVICE_PRESETS[deviceType] || DEVICE_PRESETS.iphone13;
        
        // Get automation settings
        const automationSettings = this.db.getAutomationSettings(accountId);
        
        active.push({
          accountId,
          title: window.getTitle(),
          bounds: window.getBounds(),
          isVisible: window.isVisible(),
          isFocused: window.isFocused(),
          deviceName: devicePreset.name,
          deviceType: deviceType,
          automationActive: automationSettings?.auto_scroll === 1,
          scrollSpeed: automationSettings?.scroll_speed || 100
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
