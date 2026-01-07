import { useState, useEffect } from 'react';
import { sidebarIcons, actionIcons, instanceIcons } from '../../config/icons';
import { toast } from '../../utils/toast';
import '../../styles/Automation.css';

function Automation() {
  const [accounts, setAccounts] = useState([]);
  const [presets, setPresets] = useState({});
  const [devicePresets, setDevicePresets] = useState({});
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState('organic');
  const [activeSettings, setActiveSettings] = useState(null);
  const [settingsForm, setSettingsForm] = useState({
    auto_scroll: false,
    scroll_speed: 100,
    auto_like: false,
    like_probability: 0.3,
    auto_follow: false,
    follow_daily_limit: 100,
    auto_comment: false,
    comment_probability: 0.2,
    comment_templates: [],
    preset: 'organic',
  });
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadAccounts();
    loadPresets();
    loadDevicePresets();
  }, []);

  const loadAccounts = async () => {
    try {
      const result = await window.electronAPI.getAccounts();
      if (result.success) {
        setAccounts(result.data);
      }
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
  };

  const loadPresets = async () => {
    try {
      const result = await window.electronAPI.getAutomationPresets();
      if (result.success) {
        setPresets(result.data);
      }
    } catch (error) {
      console.error('Failed to load presets:', error);
    }
  };

  const loadDevicePresets = async () => {
    try {
      const result = await window.electronAPI.getDevicePresets();
      if (result.success) {
        setDevicePresets(result.data);
      }
    } catch (error) {
      console.error('Failed to load device presets:', error);
    }
  };

  const handleLoadSettings = async (accountId) => {
    try {
      const result = await window.electronAPI.getAutomationSettings(accountId);
      if (result.success && result.data) {
        const settings = result.data;
        setSettingsForm({
          ...settings,
          comment_templates: settings.comment_templates || [],
        });
        setActiveSettings(accountId);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    if (!activeSettings) return;

    try {
      const result = await window.electronAPI.updateAutomationSettings(
        activeSettings,
        settingsForm
      );
      if (result.success) {
        setActiveSettings(null);
        await loadAccounts();
        toast.success('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings. Please try again.');
    }
  };

  const handleApplyPreset = async (accountId, presetName) => {
    try {
      const result = await window.electronAPI.applyAutomationPreset(accountId, presetName);
      if (result.success) {
        await loadAccounts();
        
        // Show success message with auto-start info
        if (result.data?.autoStarted) {
          toast.success(`"${presets[presetName]?.name}" preset applied and automation started!`);
        } else {
          toast.success(`"${presets[presetName]?.name}" preset applied. Click "Start" to begin automation.`);
        }
      }
    } catch (error) {
      console.error('Failed to apply preset:', error);
      toast.error('Failed to apply preset. Please try again.');
    }
  };

  const handleBulkApplyPreset = async () => {
    if (selectedAccounts.length === 0) {
      return;
    }

    try {
      const result = await window.electronAPI.bulkApplyPreset(
        selectedAccounts,
        selectedPreset
      );
      if (result.success) {
        // Keep selection to improve user workflow and enable consecutive operations
        // This allows users to quickly reapply different presets to the same accounts
        await loadAccounts();
        
        // Count how many had active instances
        const activeCount = result.data?.filter(r => r.autoStarted).length || 0;
        
        if (activeCount > 0) {
          toast.success(`Preset applied to ${selectedAccounts.length} accounts. ${activeCount} active instances auto-started!`);
        } else {
          toast.success(`Preset applied to ${selectedAccounts.length} accounts. Open instances and click "Start" to begin automation.`);
        }
      }
    } catch (error) {
      console.error('Failed to apply preset:', error);
      toast.error('Failed to apply preset. Please try again.');
    }
  };

  const handleBulkApplyPresetAndStart = async () => {
    if (selectedAccounts.length === 0) {
      return;
    }

    try {
      // Show warning for multiple accounts
      if (selectedAccounts.length > 1) {
        // Calculate estimated time: (accounts - 1) * average delay / 60 seconds per minute
        const estimatedMinutes = Math.ceil((selectedAccounts.length - 1) * 75 / 60);
        
        const confirm = window.confirm(
          `⚠️ ANTI-DETECTION MODE\n\n` +
          `Opening ${selectedAccounts.length} accounts with random delays (30-120 seconds between each).\n\n` +
          `This process will take approximately ${estimatedMinutes} minutes to complete.\n\n` +
          `Each account will use a different device type and behavior pattern to avoid TikTok bot detection.\n\n` +
          `Continue?`
        );
        
        if (!confirm) return;
      }
      
      console.log('Starting staggered automation for accounts:', selectedAccounts);
      
      // Use staggered start with anti-detection
      const result = await window.electronAPI.bulkApplyPresetStaggered(
        selectedAccounts,
        selectedPreset
      );
      
      if (!result.success) {
        toast.error('Failed to apply preset. Please try again.');
        return;
      }
      
      // Reload accounts to show updated status
      await loadAccounts();
      toast.success(`Staggered automation started for ${selectedAccounts.length} accounts!`);
      
    } catch (error) {
      console.error('Failed to apply preset and start:', error);
      toast.error(`Failed to apply preset and start automation: ${error.message}`);
    }
  };

  const handleStartAutomation = async (accountId) => {
    try {
      const result = await window.electronAPI.startAutomation(accountId);
      if (result.success) {
        await loadAccounts();
        toast.success('Automation started successfully!');
      }
    } catch (error) {
      console.error('Failed to start automation:', error);
      toast.error('Failed to start automation. Please try again.');
    }
  };

  const handleStopAutomation = async (accountId) => {
    try {
      const result = await window.electronAPI.stopAutomation(accountId);
      if (result.success) {
        await loadAccounts();
        toast.info('Automation stopped');
      }
    } catch (error) {
      console.error('Failed to stop automation:', error);
      toast.error('Failed to stop automation. Please try again.');
    }
  };

  const toggleAccountSelection = (accountId) => {
    setSelectedAccounts(prev => {
      if (prev.includes(accountId)) {
        return prev.filter(id => id !== accountId);
      } else {
        return [...prev, accountId];
      }
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    setSettingsForm(prev => ({
      ...prev,
      comment_templates: [...prev.comment_templates, newComment],
    }));
    setNewComment('');
  };

  const handleRemoveComment = (index) => {
    setSettingsForm(prev => ({
      ...prev,
      comment_templates: prev.comment_templates.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="automation-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <sidebarIcons.automation size={28} style={{ display: 'inline', marginRight: '12px', verticalAlign: 'middle' }} />
            Automation
          </h1>
          <p className="page-subtitle">Manage automation settings and presets for your accounts</p>
        </div>
      </div>

      {/* Presets Section */}
      <div className="presets-section">
        <h3 className="section-title">Automation Presets</h3>
        <div className="presets-grid">
          {Object.entries(presets).map(([key, preset]) => (
            <div
              key={key}
              className={`preset-card ${selectedPreset === key ? 'active' : ''}`}
              onClick={() => setSelectedPreset(key)}
            >
              <div className="preset-icon" style={{ backgroundColor: preset.color }}>
                <span>{preset.icon}</span>
              </div>
              <h4 className="preset-name">{preset.name}</h4>
              <p className="preset-description">{preset.description}</p>
              
              {/* Preset Settings Preview */}
              <div className="preset-settings-preview">
                <div className="setting-preview-item">
                  <span>📜</span>
                  <span>Scroll: {preset.autoScroll.speed}ms</span>
                </div>
                <div className="setting-preview-item">
                  <span>❤️</span>
                  <span>Like: {(preset.autoLike.probability * 100).toFixed(0)}%</span>
                </div>
                {preset.autoFollow.enabled ? (
                  <div className="setting-preview-item">
                    <span>➕</span>
                    <span>Follow: {preset.autoFollow.dailyLimit}/day</span>
                  </div>
                ) : (
                  <div className="setting-preview-item disabled">
                    <span>➕</span>
                    <span>No follows</span>
                  </div>
                )}
                {preset.autoComment.enabled ? (
                  <div className="setting-preview-item">
                    <span>💬</span>
                    <span>Comment: {(preset.autoComment.probability * 100).toFixed(0)}%</span>
                  </div>
                ) : (
                  <div className="setting-preview-item disabled">
                    <span>💬</span>
                    <span>No comments</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bulk-actions">
          <button
            className="btn btn-primary"
            onClick={handleBulkApplyPresetAndStart}
            disabled={selectedAccounts.length === 0}
            title={selectedAccounts.length === 0 
              ? "Select accounts from the list below to apply automation preset" 
              : `Apply "${presets[selectedPreset]?.name}" preset and start automation for selected accounts`}
          >
            <actionIcons.bot size={18} style={{ marginRight: '8px' }} />
            {selectedAccounts.length === 0 
              ? `Select accounts to apply "${presets[selectedPreset]?.name || selectedPreset}"`
              : `Apply "${presets[selectedPreset]?.name || selectedPreset}" & Start (${selectedAccounts.length})`
            }
          </button>
          <p className="help-text" style={{ marginTop: '12px', fontSize: '13px', color: '#888' }}>
            💡 <strong>Tip:</strong> Select accounts below, choose a preset above, then click this button to apply settings and start automation automatically.
          </p>
        </div>
      </div>

      {/* Accounts List */}
      <div className="automation-accounts">
        {/* Bulk selection controls */}
        <div className="bulk-selection-controls">
          <h3 className="section-title-no-margin">Account Automation Settings</h3>
          <div className="bulk-selection-buttons">
            <button 
              className="btn btn-sm btn-secondary"
              onClick={() => setSelectedAccounts(accounts.map(a => a.id))}
            >
              Select All
            </button>
            <button 
              className="btn btn-sm btn-secondary"
              onClick={() => setSelectedAccounts([])}
            >
              Deselect All
            </button>
          </div>
        </div>
        
        {accounts.length === 0 ? (
          <div className="empty-state">
            <sidebarIcons.automation size={48} />
            <p>No accounts found. Add accounts to configure automation.</p>
          </div>
        ) : (
          <div className="accounts-grid">
            {accounts.map(account => (
              <div key={account.id} className="automation-account-card">
                <div className="account-header">
                  <input
                    type="checkbox"
                    checked={selectedAccounts.includes(account.id)}
                    onChange={() => toggleAccountSelection(account.id)}
                    className="account-checkbox"
                  />
                  <div className="account-info">
                    <h4 className="account-name">{account.nickname || account.username}</h4>
                    {account.username && <p className="account-username">@{account.username}</p>}
                    
                    {/* Device Info */}
                    {account.device_type && devicePresets[account.device_type] && (
                      <div className="account-device">
                        <span className="device-icon">📱</span>
                        <span className="device-name">
                          {devicePresets[account.device_type].name}
                        </span>
                        <span className="device-size">
                          ({devicePresets[account.device_type].width}×{devicePresets[account.device_type].height})
                        </span>
                      </div>
                    )}
                    
                    {/* Automation Status */}
                    {account.status === 'active' && account.auto_scroll === 1 && (
                      <div className="automation-status-live">
                        <span className="status-pulse">⚡</span>
                        <span>Scrolling ({account.scroll_speed}ms)</span>
                      </div>
                    )}
                    
                    {/* Show current preset */}
                    {account.preset && (
                      <span 
                        className="preset-badge" 
                        style={{ backgroundColor: presets[account.preset]?.color || '#666' }}
                      >
                        {presets[account.preset]?.icon} {presets[account.preset]?.name || account.preset}
                      </span>
                    )}
                  </div>
                </div>

                <div className="account-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleLoadSettings(account.id)}
                    title="Configure custom automation settings for this account"
                  >
                    <actionIcons.bot size={16} style={{ marginRight: '6px' }} />
                    Configure
                  </button>
                  
                  {account.status === 'active' ? (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleStopAutomation(account.id)}
                      title="Stop automation for this account"
                    >
                      <instanceIcons.stop size={16} style={{ marginRight: '6px' }} />
                      Stop
                    </button>
                  ) : (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleStartAutomation(account.id)}
                      title="Open TikTok instance and start automation for this account"
                    >
                      <instanceIcons.play size={16} style={{ marginRight: '6px' }} />
                      Start
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {activeSettings && (
        <div className="modal-overlay" onClick={() => setActiveSettings(null)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Automation Settings</h2>
              <button className="close-btn" onClick={() => setActiveSettings(null)}>×</button>
            </div>

            <div className="settings-content">
              {/* Auto Scroll */}
              <div className="setting-group">
                <div className="setting-header">
                  <label className="setting-toggle">
                    <input
                      type="checkbox"
                      checked={settingsForm.auto_scroll}
                      onChange={(e) => setSettingsForm({ ...settingsForm, auto_scroll: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <h4>Auto Scroll</h4>
                </div>
                {settingsForm.auto_scroll && (
                  <div className="setting-controls">
                    <label>Scroll Speed: {settingsForm.scroll_speed}%</label>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      value={settingsForm.scroll_speed}
                      onChange={(e) => setSettingsForm({ ...settingsForm, scroll_speed: parseInt(e.target.value) })}
                      className="slider"
                    />
                  </div>
                )}
              </div>

              {/* Auto Like */}
              <div className="setting-group">
                <div className="setting-header">
                  <label className="setting-toggle">
                    <input
                      type="checkbox"
                      checked={settingsForm.auto_like}
                      onChange={(e) => setSettingsForm({ ...settingsForm, auto_like: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <h4>Auto Like</h4>
                </div>
                {settingsForm.auto_like && (
                  <div className="setting-controls">
                    <label>Like Probability: {(settingsForm.like_probability * 100).toFixed(0)}%</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settingsForm.like_probability}
                      onChange={(e) => setSettingsForm({ ...settingsForm, like_probability: parseFloat(e.target.value) })}
                      className="slider"
                    />
                  </div>
                )}
              </div>

              {/* Auto Follow */}
              <div className="setting-group">
                <div className="setting-header">
                  <label className="setting-toggle">
                    <input
                      type="checkbox"
                      checked={settingsForm.auto_follow}
                      onChange={(e) => setSettingsForm({ ...settingsForm, auto_follow: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <h4>Auto Follow</h4>
                </div>
                {settingsForm.auto_follow && (
                  <div className="setting-controls">
                    <label>Daily Limit: {settingsForm.follow_daily_limit}</label>
                    <input
                      type="number"
                      min="10"
                      max="500"
                      value={settingsForm.follow_daily_limit}
                      onChange={(e) => setSettingsForm({ ...settingsForm, follow_daily_limit: parseInt(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                )}
              </div>

              {/* Auto Comment */}
              <div className="setting-group">
                <div className="setting-header">
                  <label className="setting-toggle">
                    <input
                      type="checkbox"
                      checked={settingsForm.auto_comment}
                      onChange={(e) => setSettingsForm({ ...settingsForm, auto_comment: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <h4>Auto Comment</h4>
                </div>
                {settingsForm.auto_comment && (
                  <div className="setting-controls">
                    <label>Comment Probability: {(settingsForm.comment_probability * 100).toFixed(0)}%</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settingsForm.comment_probability}
                      onChange={(e) => setSettingsForm({ ...settingsForm, comment_probability: parseFloat(e.target.value) })}
                      className="slider"
                    />

                    <div className="comment-templates">
                      <label>Comment Templates:</label>
                      <div className="template-list">
                        {settingsForm.comment_templates.map((template, index) => (
                          <div key={index} className="template-item">
                            <span>{template}</span>
                            <button
                              className="remove-btn"
                              onClick={() => handleRemoveComment(index)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="add-template">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add comment template..."
                          className="input-field"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                        />
                        <button className="btn btn-secondary btn-sm" onClick={handleAddComment}>
                          Add
                        </button>
                      </div>
                      <p className="help-text">
                        Use {'{option1|option2|option3}'} for random variations
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-cancel" onClick={() => setActiveSettings(null)}>
                Cancel
              </button>
              <button className="btn btn-save" onClick={handleSaveSettings}>
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Automation;
