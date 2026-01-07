/**
 * Automation Engine
 * Manages automation presets and applies them to mobile instances
 */

const AUTOMATION_PRESETS = {
  aggressive: {
    name: 'Aggressive Growth',
    description: 'Maximum engagement for rapid growth',
    autoScroll: { enabled: true, speed: 50 },
    autoLike: { enabled: true, probability: 0.5 },
    autoFollow: { enabled: true, dailyLimit: 200 },
    autoComment: { enabled: true, probability: 0.3, dailyLimit: 100 }
  },
  organic: {
    name: 'Organic Growth',
    description: 'Natural engagement patterns',
    autoScroll: { enabled: true, speed: 150 },
    autoLike: { enabled: true, probability: 0.2 },
    autoFollow: { enabled: true, dailyLimit: 50 },
    autoComment: { enabled: true, probability: 0.1, dailyLimit: 30 }
  },
  engagement: {
    name: 'High Engagement',
    description: 'Focus on likes and comments',
    autoScroll: { enabled: true, speed: 100 },
    autoLike: { enabled: true, probability: 0.4 },
    autoFollow: { enabled: false },
    autoComment: { enabled: true, probability: 0.5, dailyLimit: 50 }
  },
  conservative: {
    name: 'Conservative',
    description: 'Minimal automation to avoid detection',
    autoScroll: { enabled: true, speed: 200 },
    autoLike: { enabled: true, probability: 0.1 },
    autoFollow: { enabled: false },
    autoComment: { enabled: false }
  },
  custom: {
    name: 'Custom',
    description: 'User-defined settings',
    autoScroll: { enabled: false, speed: 100 },
    autoLike: { enabled: false, probability: 0.3 },
    autoFollow: { enabled: false, dailyLimit: 100 },
    autoComment: { enabled: false, probability: 0.2, dailyLimit: 50 }
  }
};

// Default comment templates
const DEFAULT_COMMENT_TEMPLATES = [
  '{Amazing|Awesome|Great|Nice|Cool} {video|content|post}! 🔥',
  '{Love|Like|Enjoy} this! {❤️|💯|🙌}',
  'This is {awesome|great|amazing|incredible}! {Keep it up|More please}!',
  '{So good|Perfect|Brilliant}! {👏|🔥|💪}',
  '{Wow|OMG|Amazing}! {Love it|This is great}! {😍|🔥|💯}'
];

// Instance loading timeouts
const INSTANCE_LOAD_DELAY = 2000; // Time to wait after page load for JS initialization
const INSTANCE_LOAD_TIMEOUT = 10000; // Maximum time to wait for page load

class AutomationEngine {
  constructor(database, instanceManager) {
    this.db = database;
    this.instanceManager = instanceManager;
    this.activeAutomations = new Map(); // accountId -> automation state
  }

  getPresets() {
    return AUTOMATION_PRESETS;
  }

  getPreset(presetName) {
    return AUTOMATION_PRESETS[presetName] || AUTOMATION_PRESETS.organic;
  }

  async applyPreset(accountId, presetName) {
    const preset = this.getPreset(presetName);
    
    // ✅ Add randomization to preset values
    const randomizedSettings = {
      auto_scroll: preset.autoScroll.enabled ? 1 : 0,
      // ✅ Random scroll speed (±30% variation)
      scroll_speed: Math.floor(preset.autoScroll.speed * (0.7 + Math.random() * 0.6)),
      auto_like: preset.autoLike.enabled ? 1 : 0,
      // ✅ Random like probability (±0.1 variation)
      like_probability: Math.max(0.1, Math.min(0.9, preset.autoLike.probability + (Math.random() * 0.2 - 0.1))),
      auto_follow: preset.autoFollow?.enabled ? 1 : 0,
      // ✅ Random daily limit (±20% variation)
      follow_daily_limit: Math.floor((preset.autoFollow?.dailyLimit || 100) * (0.8 + Math.random() * 0.4)),
      auto_comment: preset.autoComment?.enabled ? 1 : 0,
      // ✅ Random comment probability
      comment_probability: Math.max(0.05, Math.min(0.5, (preset.autoComment?.probability || 0.2) + (Math.random() * 0.1 - 0.05))),
      preset: presetName
    };

    // Update database
    this.db.updateAutomationSettings(accountId, randomizedSettings);

    // Apply to active instance if exists
    await this.applyToInstance(accountId);

    return { success: true, preset: presetName, settings: randomizedSettings };
  }

  async applyToInstance(accountId) {
    const settings = this.db.getAutomationSettings(accountId);
    if (!settings) {
      console.warn(`No automation settings found for account ${accountId}`);
      return;
    }

    const instance = this.instanceManager.instances.get(accountId);
    if (!instance || instance.isDestroyed()) {
      console.warn(`No active instance found for account ${accountId}`);
      return;
    }

    console.log(`Applying automation settings to account ${accountId}:`, {
      autoScroll: settings.auto_scroll === 1,
      scrollSpeed: settings.scroll_speed,
      autoLike: settings.auto_like === 1,
      preset: settings.preset
    });

    // Send settings to instance
    instance.webContents.send('automation-command', {
      command: 'update-settings',
      settings: {
        autoScroll: settings.auto_scroll === 1,
        scrollSpeed: settings.scroll_speed,
        autoLike: settings.auto_like === 1,
        likeProbability: settings.like_probability,
        autoFollow: settings.auto_follow === 1,
        followDailyLimit: settings.follow_daily_limit,
        autoComment: settings.auto_comment === 1,
        commentProbability: settings.comment_probability,
        commentTemplates: settings.comment_templates || DEFAULT_COMMENT_TEMPLATES
      }
    });

    // Start auto-scroll if enabled
    if (settings.auto_scroll === 1) {
      console.log(`Starting auto-scroll at speed ${settings.scroll_speed} for account ${accountId}`);
      instance.webContents.send('automation-command', {
        command: 'start-auto-scroll',
        speed: settings.scroll_speed
      });
    }
  }

  async startAutomation(accountId) {
    const settings = this.db.getAutomationSettings(accountId);
    if (!settings) {
      throw new Error('No automation settings found for account');
    }

    // Check if mobile instance exists
    let instance = this.instanceManager.instances.get(accountId);
    
    // If not, create it!
    if (!instance || instance.isDestroyed()) {
      console.log(`No instance found for account ${accountId}, creating new instance...`);
      
      // Get account data
      const account = this.db.getAccountById(accountId);
      if (!account) {
        throw new Error('Account not found');
      }
      
      // Create mobile instance
      instance = this.instanceManager.createMobileInstance(account);
      
      // Wait for TikTok to load before applying automation
      await new Promise((resolve) => {
        let timeoutId = null;
        let isResolved = false;
        
        // Handler for when page finishes loading
        const onLoadComplete = () => {
          if (isResolved) return;
          isResolved = true;
          
          // Clear the fallback timeout
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          
          console.log(`Instance loaded for account ${accountId}`);
          // Give it extra time for TikTok's JavaScript to initialize
          setTimeout(resolve, INSTANCE_LOAD_DELAY);
        };
        
        // Wait for page to finish loading
        instance.webContents.once('did-finish-load', onLoadComplete);
        
        // Fallback timeout in case did-finish-load doesn't fire
        timeoutId = setTimeout(() => {
          if (isResolved) return;
          isResolved = true;
          
          // Remove the event listener to prevent it from firing later
          instance.webContents.removeListener('did-finish-load', onLoadComplete);
          
          console.log(`Instance load timeout for account ${accountId}, proceeding anyway`);
          resolve();
        }, INSTANCE_LOAD_TIMEOUT);
      });
    }

    // Now apply automation settings to the instance
    await this.applyToInstance(accountId);
    
    // Mark as active
    this.activeAutomations.set(accountId, { 
      active: true, 
      startedAt: new Date() 
    });

    this.db.logActivity(accountId, 'automation_started', { preset: settings.preset });

    return { success: true };
  }

  async stopAutomation(accountId) {
    const instance = this.instanceManager.instances.get(accountId);
    if (instance && !instance.isDestroyed()) {
      instance.webContents.send('automation-command', {
        command: 'stop-auto-scroll'
      });
    }

    this.activeAutomations.delete(accountId);
    this.db.logActivity(accountId, 'automation_stopped');

    return { success: true };
  }

  async updateSettings(accountId, settings) {
    // Update database
    this.db.updateAutomationSettings(accountId, settings);

    // Apply to active instance
    await this.applyToInstance(accountId);

    return { success: true };
  }

  async setCommentTemplates(accountId, templates) {
    this.db.updateAutomationSettings(accountId, {
      comment_templates: JSON.stringify(templates)
    });

    await this.applyToInstance(accountId);

    return { success: true };
  }

  getDefaultCommentTemplates() {
    return DEFAULT_COMMENT_TEMPLATES;
  }

  async bulkApplyPreset(accountIds, presetName) {
    const results = [];
    
    for (const accountId of accountIds) {
      try {
        await this.applyPreset(accountId, presetName);
        results.push({ accountId, success: true });
      } catch (error) {
        results.push({ accountId, success: false, error: error.message });
      }
    }

    return results;
  }

  async bulkStartAutomation(accountIds) {
    const results = [];
    
    for (const accountId of accountIds) {
      try {
        await this.startAutomation(accountId);
        results.push({ accountId, success: true });
      } catch (error) {
        results.push({ accountId, success: false, error: error.message });
      }
    }

    return results;
  }

  async bulkStartAutomationStaggered(accountIds) {
    const results = [];
    
    for (let i = 0; i < accountIds.length; i++) {
      const accountId = accountIds[i];
      
      try {
        console.log(`Starting automation for account ${i + 1}/${accountIds.length}: ${accountId}`);
        
        // Start automation (this opens instance)
        await this.startAutomation(accountId);
        results.push({ accountId, success: true });
        
        // Add random delay before next account (except for last one)
        if (i < accountIds.length - 1) {
          // Random delay between 30-120 seconds
          const delay = 30000 + Math.floor(Math.random() * 90000);
          console.log(`Waiting ${Math.round(delay/1000)}s before opening next instance...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
      } catch (error) {
        console.error(`Failed to start automation for ${accountId}:`, error);
        results.push({ accountId, success: false, error: error.message });
      }
    }
    
    return results;
  }

  async bulkStopAutomation(accountIds) {
    const results = [];
    
    for (const accountId of accountIds) {
      try {
        await this.stopAutomation(accountId);
        results.push({ accountId, success: true });
      } catch (error) {
        results.push({ accountId, success: false, error: error.message });
      }
    }

    return results;
  }

  getActiveAutomations() {
    return Array.from(this.activeAutomations.entries()).map(([accountId, state]) => ({
      accountId,
      ...state
    }));
  }

  isActive(accountId) {
    return this.activeAutomations.has(accountId);
  }
}

export default AutomationEngine;
