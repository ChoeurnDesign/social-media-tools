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
    
    // Convert preset to database format
    const settings = {
      auto_scroll: preset.autoScroll.enabled ? 1 : 0,
      scroll_speed: preset.autoScroll.speed,
      auto_like: preset.autoLike.enabled ? 1 : 0,
      like_probability: preset.autoLike.probability,
      auto_follow: preset.autoFollow?.enabled ? 1 : 0,
      follow_daily_limit: preset.autoFollow?.dailyLimit || 100,
      auto_comment: preset.autoComment?.enabled ? 1 : 0,
      comment_probability: preset.autoComment?.probability || 0.2,
      preset: presetName
    };

    // Update database
    this.db.updateAutomationSettings(accountId, settings);

    // Apply to active instance if exists
    await this.applyToInstance(accountId);

    return { success: true, preset: presetName };
  }

  async applyToInstance(accountId) {
    const settings = this.db.getAutomationSettings(accountId);
    if (!settings) return;

    const instance = this.instanceManager.instances.get(accountId);
    if (!instance || instance.isDestroyed()) return;

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

    await this.applyToInstance(accountId);
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
