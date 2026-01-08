import { BrowserWindow, screen } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Device presets with comprehensive anti-detection properties
const DEVICE_PRESETS = {
  // ========== iPhone Models (12 devices) ==========
  iphone15promax: {
    name: 'iPhone 15 Pro Max',
    width: 430,
    height: 932,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
    platform: 'iPhone',
    devicePixelRatio: 3,
    timezone: 'America/New_York',
    locale: 'en-US',
    latitude: 40.7128,
    longitude: -74.0060
  },
  iphone15pro: {
    name: 'iPhone 15 Pro',
    width: 393,
    height: 852,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    platform: 'iPhone',
    devicePixelRatio: 3,
    timezone: 'America/Los_Angeles',
    locale: 'en-US',
    latitude: 34.0522,
    longitude: -118.2437
  },
  iphone15: {
    name: 'iPhone 15',
    width: 393,
    height: 852,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    platform: 'iPhone',
    devicePixelRatio: 3,
    timezone: 'America/Chicago',
    locale: 'en-US',
    latitude: 41.8781,
    longitude: -87.6298
  },
  iphone14promax: {
    name: 'iPhone 14 Pro Max',
    width: 430,
    height: 932,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    platform: 'iPhone',
    devicePixelRatio: 3,
    timezone: 'America/Denver',
    locale: 'en-US',
    latitude: 39.7392,
    longitude: -104.9903
  },
  iphone14pro: {
    name: 'iPhone 14 Pro',
    width: 393,
    height: 852,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    platform: 'iPhone',
    devicePixelRatio: 3,
    timezone: 'America/Phoenix',
    locale: 'en-US',
    latitude: 33.4484,
    longitude: -112.0740
  },
  iphone14: {
    name: 'iPhone 14',
    width: 390,
    height: 844,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    platform: 'iPhone',
    devicePixelRatio: 3,
    timezone: 'America/Toronto',
    locale: 'en-CA',
    latitude: 43.6532,
    longitude: -79.3832
  },
  iphone13promax: {
    name: 'iPhone 13 Pro Max',
    width: 428,
    height: 926,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Mobile/15E148 Safari/604.1',
    platform: 'iPhone',
    devicePixelRatio: 3,
    timezone: 'America/Vancouver',
    locale: 'en-CA',
    latitude: 49.2827,
    longitude: -123.1207
  },
  iphone13pro: {
    name: 'iPhone 13 Pro',
    width: 390,
    height: 844,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Mobile/15E148 Safari/604.1',
    platform: 'iPhone',
    devicePixelRatio: 3,
    timezone: 'Europe/London',
    locale: 'en-GB',
    latitude: 51.5074,
    longitude: -0.1278
  },
  iphone13: {
    name: 'iPhone 13',
    width: 390,
    height: 844,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    platform: 'iPhone',
    devicePixelRatio: 3,
    timezone: 'Australia/Sydney',
    locale: 'en-AU',
    latitude: -33.8688,
    longitude: 151.2093
  },
  iphone13mini: {
    name: 'iPhone 13 Mini',
    width: 375,
    height: 812,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    platform: 'iPhone',
    devicePixelRatio: 3,
    timezone: 'America/Mexico_City',
    locale: 'es-MX',
    latitude: 19.4326,
    longitude: -99.1332
  },
  iphone12: {
    name: 'iPhone 12',
    width: 390,
    height: 844,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.7 Mobile/15E148 Safari/604.1',
    platform: 'iPhone',
    devicePixelRatio: 3,
    timezone: 'America/Sao_Paulo',
    locale: 'pt-BR',
    latitude: -23.5505,
    longitude: -46.6333
  },
  iphone11: {
    name: 'iPhone 11',
    width: 414,
    height: 896,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.5 Mobile/15E148 Safari/604.1',
    platform: 'iPhone',
    devicePixelRatio: 2,
    timezone: 'Asia/Tokyo',
    locale: 'ja-JP',
    latitude: 35.6762,
    longitude: 139.6503
  },
  
  // ========== Samsung Galaxy Models (10 devices) ==========
  galaxys24ultra: {
    name: 'Samsung Galaxy S24 Ultra',
    width: 384,
    height: 854,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    platform: 'Linux armv8l',
    devicePixelRatio: 3.5,
    timezone: 'America/New_York',
    locale: 'en-US',
    latitude: 40.7128,
    longitude: -74.0060
  },
  galaxys24: {
    name: 'Samsung Galaxy S24',
    width: 360,
    height: 800,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    platform: 'Linux armv8l',
    devicePixelRatio: 3,
    timezone: 'America/Los_Angeles',
    locale: 'en-US',
    latitude: 34.0522,
    longitude: -118.2437
  },
  galaxys23ultra: {
    name: 'Samsung Galaxy S23 Ultra',
    width: 384,
    height: 854,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36',
    platform: 'Linux armv8l',
    devicePixelRatio: 3.5,
    timezone: 'America/Chicago',
    locale: 'en-US',
    latitude: 41.8781,
    longitude: -87.6298
  },
  galaxys23: {
    name: 'Samsung Galaxy S23',
    width: 360,
    height: 800,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36',
    platform: 'Linux armv8l',
    devicePixelRatio: 3,
    timezone: 'America/Denver',
    locale: 'en-US',
    latitude: 39.7392,
    longitude: -104.9903
  },
  galaxys22ultra: {
    name: 'Samsung Galaxy S22 Ultra',
    width: 384,
    height: 854,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36',
    platform: 'Linux armv8l',
    devicePixelRatio: 3.5,
    timezone: 'America/Phoenix',
    locale: 'en-US',
    latitude: 33.4484,
    longitude: -112.0740
  },
  galaxys22: {
    name: 'Samsung Galaxy S22',
    width: 360,
    height: 780,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S901B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Mobile Safari/537.36',
    platform: 'Linux armv8l',
    devicePixelRatio: 3,
    timezone: 'Europe/Paris',
    locale: 'fr-FR',
    latitude: 48.8566,
    longitude: 2.3522
  },
  galaxys21ultra: {
    name: 'Samsung Galaxy S21 Ultra',
    width: 384,
    height: 854,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
    platform: 'Linux armv8l',
    devicePixelRatio: 3.5,
    timezone: 'Europe/Berlin',
    locale: 'de-DE',
    latitude: 52.5200,
    longitude: 13.4050
  },
  galaxys21: {
    name: 'Samsung Galaxy S21',
    width: 360,
    height: 800,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
    platform: 'Linux armv8l',
    devicePixelRatio: 3,
    timezone: 'Europe/Madrid',
    locale: 'es-ES',
    latitude: 40.4168,
    longitude: -3.7038
  },
  galaxyzfold5: {
    name: 'Samsung Galaxy Z Fold 5',
    width: 344,
    height: 882,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-F946B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
    platform: 'Linux armv8l',
    devicePixelRatio: 3,
    timezone: 'Asia/Seoul',
    locale: 'ko-KR',
    latitude: 37.5665,
    longitude: 126.9780
  },
  galaxya54: {
    name: 'Samsung Galaxy A54',
    width: 360,
    height: 800,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-A546B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Mobile Safari/537.36',
    platform: 'Linux armv8l',
    devicePixelRatio: 2.625,
    timezone: 'Asia/Singapore',
    locale: 'en-SG',
    latitude: 1.3521,
    longitude: 103.8198
  },
  
  // ========== Google Pixel Models (6 devices) ==========
  pixel8pro: {
    name: 'Google Pixel 8 Pro',
    width: 412,
    height: 915,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    platform: 'Linux armv8l',
    devicePixelRatio: 3,
    timezone: 'America/New_York',
    locale: 'en-US',
    latitude: 40.7128,
    longitude: -74.0060
  },
  pixel8: {
    name: 'Google Pixel 8',
    width: 412,
    height: 915,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    platform: 'Linux armv8l',
    devicePixelRatio: 2.625,
    timezone: 'America/Los_Angeles',
    locale: 'en-US',
    latitude: 37.7749,
    longitude: -122.4194
  },
  pixel7pro: {
    name: 'Google Pixel 7 Pro',
    width: 412,
    height: 915,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36',
    platform: 'Linux armv8l',
    devicePixelRatio: 3,
    timezone: 'America/Chicago',
    locale: 'en-US',
    latitude: 41.8781,
    longitude: -87.6298
  },
  pixel7: {
    name: 'Google Pixel 7',
    width: 412,
    height: 915,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36',
    platform: 'Linux armv8l',
    devicePixelRatio: 2.625,
    timezone: 'America/Denver',
    locale: 'en-US',
    latitude: 39.7392,
    longitude: -104.9903
  },
  pixel6pro: {
    name: 'Google Pixel 6 Pro',
    width: 412,
    height: 915,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 6 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
    platform: 'Linux armv8l',
    devicePixelRatio: 3,
    timezone: 'Europe/London',
    locale: 'en-GB',
    latitude: 51.5074,
    longitude: -0.1278
  },
  pixel6: {
    name: 'Google Pixel 6',
    width: 412,
    height: 915,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
    platform: 'Linux armv8l',
    devicePixelRatio: 2.625,
    timezone: 'Australia/Sydney',
    locale: 'en-AU',
    latitude: -33.8688,
    longitude: 151.2093
  },
  
  // ========== OnePlus Models (4 devices) ==========
  oneplus11: {
    name: 'OnePlus 11',
    width: 412,
    height: 919,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; CPH2449) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36',
    platform: 'Linux armv8l',
    devicePixelRatio: 3.5,
    timezone: 'America/New_York',
    locale: 'en-US',
    latitude: 40.7128,
    longitude: -74.0060
  },
  oneplus10pro: {
    name: 'OnePlus 10 Pro',
    width: 412,
    height: 919,
    userAgent: 'Mozilla/5.0 (Linux; Android 12; NE2213) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
    platform: 'Linux armv8l',
    devicePixelRatio: 3.5,
    timezone: 'America/Los_Angeles',
    locale: 'en-US',
    latitude: 34.0522,
    longitude: -118.2437
  },
  oneplus9pro: {
    name: 'OnePlus 9 Pro',
    width: 412,
    height: 919,
    userAgent: 'Mozilla/5.0 (Linux; Android 12; LE2121) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Mobile Safari/537.36',
    platform: 'Linux armv8l',
    devicePixelRatio: 3.5,
    timezone: 'America/Chicago',
    locale: 'en-US',
    latitude: 41.8781,
    longitude: -87.6298
  },
  oneplus9: {
    name: 'OnePlus 9',
    width: 412,
    height: 919,
    userAgent: 'Mozilla/5.0 (Linux; Android 12; LE2113) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36',
    platform: 'Linux armv8l',
    devicePixelRatio: 3.5,
    timezone: 'America/Denver',
    locale: 'en-US',
    latitude: 39.7392,
    longitude: -104.9903
  }
};

class InstanceManager {
  constructor(database) {
    this.db = database;
    this.instances = new Map(); // accountId -> BrowserWindow
    this.settings = {
      devicePreset: 'iphone13',
      instancesPerRow: 3,
      spacing: 0,  // ✅ No gaps - windows touch perfectly
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

    // ✅ Get screen dimensions for dynamic columns
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth } = primaryDisplay.workAreaSize;
    
    const instanceCount = this.instances.size;
    const spacing = 0;  // ✅ No gaps - windows touch perfectly
    
    // ✅ Dynamic columns based on screen width
    const columns = Math.floor(screenWidth / width) || 1;

    const column = instanceCount % columns;
    const row = Math.floor(instanceCount / columns);

    // ✅ Perfect grid positioning - no offsets, no spacing
    const x = column * width;
    const y = row * height;

    return { x, y };
  }

  injectDeviceFingerprint(window, devicePreset) {
    // Calculate random values outside template to ensure consistency
    const hardwareConcurrency = 4 + Math.floor(Math.random() * 5);  // 4-8 cores
    const deviceMemory = [4, 6, 8, 12, 16][Math.floor(Math.random() * 5)];  // Random GB
    const batteryLevel = 0.15 + Math.random() * 0.85;  // 15-100% battery
    const isCharging = Math.random() > 0.7;  // 30% chance charging
    const connectionType = ['4g', '5g', 'wifi'][Math.floor(Math.random() * 3)];
    
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
      
      // ✅ Battery API spoofing
      if (navigator.getBattery) {
        const originalGetBattery = navigator.getBattery.bind(navigator);
        navigator.getBattery = function() {
          return originalGetBattery().then(battery => {
            Object.defineProperty(battery, 'level', {
              get: () => ${batteryLevel.toFixed(2)}
            });
            Object.defineProperty(battery, 'charging', {
              get: () => ${isCharging}
            });
            return battery;
          });
        };
      }
      
      // ✅ Connection type spoofing
      if (navigator.connection) {
        Object.defineProperty(navigator.connection, 'effectiveType', {
          get: () => '${connectionType}'
        });
      }
      
      // ✅ Timezone spoofing
      if (Intl && Intl.DateTimeFormat) {
        const originalResolvedOptions = Intl.DateTimeFormat.prototype.resolvedOptions;
        Intl.DateTimeFormat.prototype.resolvedOptions = function() {
          const options = originalResolvedOptions.call(this);
          options.timeZone = '${devicePreset.timezone}';
          options.locale = '${devicePreset.locale}';
          return options;
        };
      }
      
      // ✅ Geolocation spoofing
      if (navigator.geolocation) {
        const originalGetCurrentPosition = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);
        navigator.geolocation.getCurrentPosition = function(success, error, options) {
          if (success) {
            success({
              coords: {
                latitude: ${devicePreset.latitude},
                longitude: ${devicePreset.longitude},
                accuracy: 10 + Math.random() * 40,
                altitude: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null
              },
              timestamp: Date.now()
            });
          }
        };
      }
      
      // ✅ Canvas fingerprint randomization
      const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function() {
        const context = this.getContext('2d');
        if (context) {
          const imageData = context.getImageData(0, 0, this.width, this.height);
          // Add subtle noise to canvas (±1 on random pixels)
          for (let i = 0; i < imageData.data.length; i += 4) {
            if (Math.random() < 0.01) {  // 1% of pixels
              imageData.data[i] += Math.floor(Math.random() * 3) - 1;
            }
          }
          context.putImageData(imageData, 0, 0);
        }
        return originalToDataURL.apply(this, arguments);
      };
      
      // ✅ WebGL fingerprint randomization
      const getParameterOriginal = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        // Slightly randomize vendor and renderer strings
        if (parameter === 37445) { // UNMASKED_VENDOR_WEBGL
          return 'Google Inc. (${devicePreset.platform})';
        }
        if (parameter === 37446) { // UNMASKED_RENDERER_WEBGL
          const renderers = [
            'ANGLE (${devicePreset.platform}, Metal)',
            'ANGLE (${devicePreset.platform}, Vulkan)',
            'ANGLE (${devicePreset.platform}, OpenGL ES)'
          ];
          return renderers[Math.floor(Math.random() * renderers.length)];
        }
        return getParameterOriginal.call(this, parameter);
      };
      
      console.log('🎭 Enhanced device fingerprint spoofing active:', {
        platform: '${devicePreset.platform}',
        devicePixelRatio: ${devicePreset.devicePixelRatio},
        hardwareConcurrency: ${hardwareConcurrency},
        deviceMemory: ${deviceMemory},
        battery: '${(batteryLevel * 100).toFixed(0)}%',
        charging: ${isCharging},
        connection: '${connectionType}',
        timezone: '${devicePreset.timezone}',
        locale: '${devicePreset.locale}',
        geolocation: [${devicePreset.latitude}, ${devicePreset.longitude}],
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

    // Get first instance dimensions (all should be similar)
    const firstInstance = instances[0];
    if (firstInstance.isDestroyed()) return;
    
    const bounds = firstInstance.getBounds();
    const instanceWidth = bounds.width;
    const instanceHeight = bounds.height;
    const gap = 0; // ✅ No gap - windows perfectly touching

    // ✅ Calculate how many instances fit per row dynamically
    const instancesPerRow = Math.floor(screenWidth / (instanceWidth + gap)) || 1;

    // Position each instance in a grid
    instances.forEach((instance, index) => {
      if (instance.isDestroyed()) return;

      // Calculate row and column
      const row = Math.floor(index / instancesPerRow);
      const col = index % instancesPerRow;

      // ✅ Calculate x and y positions - perfect grid, no offsets
      const x = col * (instanceWidth + gap);
      const y = row * (instanceHeight + gap);

      // Check if instance fits on screen
      if (y + instanceHeight > screenHeight) {
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
        // Create the instance
        this.createMobileInstance(account);
        
        // ✅ FIX: Don't include 'window' object - it can't be serialized over IPC
        results.push({ 
          success: true, 
          accountId: account.id,
          username: account.username || account.nickname
        });
      } catch (error) {
        results.push({ 
          success: false, 
          accountId: account.id,
          username: account.username || account.nickname,
          error: error.message 
        });
      }
    }

    // ✅ Auto-arrange after creating all windows
    if (this.settings.autoArrange && results.length > 0) {
      setTimeout(() => this.arrangeInstances(), 500);
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
