import { useState, useEffect } from 'react';
import { sidebarIcons, actionIcons, instanceIcons } from '../../config/icons';
import '../../styles/Automation.css';

function Automation() {
  const [accounts, setAccounts] = useState([]);
  const [presets, setPresets] = useState({});
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
        alert('Settings saved successfully!');
        setActiveSettings(null);
        await loadAccounts();
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    }
  };

  const handleApplyPreset = async (accountId, presetName) => {
    try {
      const result = await window.electronAPI.applyAutomationPreset(accountId, presetName);
      if (result.success) {
        await loadAccounts();
        alert(`Preset "${presetName}" applied to account`);
      }
    } catch (error) {
      console.error('Failed to apply preset:', error);
      alert('Failed to apply preset');
    }
  };

  const handleBulkApplyPreset = async () => {
    if (selectedAccounts.length === 0) {
      alert('Please select at least one account');
      return;
    }

    try {
      const result = await window.electronAPI.bulkApplyPreset(
        selectedAccounts,
        selectedPreset
      );
      if (result.success) {
        // DON'T clear selection - keep checkboxes checked
        // DON'T reset preset - keep selected preset
        await loadAccounts();
        alert(`Preset "${presetDescriptions[selectedPreset].name}" applied to ${selectedAccounts.length} account(s)`);
      }
    } catch (error) {
      console.error('Failed to apply preset:', error);
      alert('Failed to apply preset');
    }
  };

  const handleBulkApplyPresetAndStart = async () => {
    if (selectedAccounts.length === 0) {
      alert('Please select at least one account');
      return;
    }

    try {
      // Step 1: Apply preset to all selected accounts
      const applyResult = await window.electronAPI.bulkApplyPreset(
        selectedAccounts,
        selectedPreset
      );
      
      if (!applyResult.success) {
        alert('Failed to apply preset');
        return;
      }

      // Step 2: Start automation on all selected accounts
      const startPromises = selectedAccounts.map(accountId => 
        window.electronAPI.startAutomation(accountId)
          .then(result => ({ accountId, success: result.success }))
          .catch(error => ({ accountId, success: false, error: error.message }))
      );
      
      const startResults = await Promise.all(startPromises);

      // Count successes
      const successCount = startResults.filter(r => r.success).length;
      
      // Reload accounts to show updated status
      await loadAccounts();
      
      // Show success message
      alert(
        `Preset "${presetDescriptions[selectedPreset].name}" applied and ` +
        `automation started on ${successCount} of ${selectedAccounts.length} account(s)`
      );
      
      // Keep selection for easy re-use
      // Don't clear: setSelectedAccounts([]);
      
    } catch (error) {
      console.error('Failed to apply preset and start:', error);
      alert('Failed to apply preset and start automation');
    }
  };

  const handleStartAutomation = async (accountId) => {
    try {
      const result = await window.electronAPI.startAutomation(accountId);
      if (result.success) {
        alert('Automation started');
        await loadAccounts();
      }
    } catch (error) {
      console.error('Failed to start automation:', error);
      alert('Failed to start automation');
    }
  };

  const handleStopAutomation = async (accountId) => {
    try {
      const result = await window.electronAPI.stopAutomation(accountId);
      if (result.success) {
        alert('Automation stopped');
        await loadAccounts();
      }
    } catch (error) {
      console.error('Failed to stop automation:', error);
      alert('Failed to stop automation');
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

  const presetDescriptions = {
    organic: {
      name: 'Organic',
      icon: '🌿',
      description: 'Natural, human-like behavior with moderate engagement',
      color: '#4caf50',
    },
    aggressive: {
      name: 'Aggressive',
      icon: '🔥',
      description: 'Maximum engagement for rapid growth (higher risk)',
      color: '#e94560',
    },
    engagement: {
      name: 'Engagement',
      icon: '💬',
      description: 'Focus on likes and comments for better interaction',
      color: '#667eea',
    },
    conservative: {
      name: 'Conservative',
      icon: '🛡️',
      description: 'Minimal automation, safest approach',
      color: '#9e9e9e',
    },
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
          {Object.entries(presetDescriptions).map(([key, preset]) => (
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
            </div>
          ))}
        </div>

        <div className="bulk-actions">
          <button
            className="btn btn-primary"
            onClick={handleBulkApplyPresetAndStart}
            disabled={selectedAccounts.length === 0}
          >
            <actionIcons.bot size={18} style={{ marginRight: '8px' }} />
            {selectedAccounts.length === 0 
              ? `Select accounts to apply "${presetDescriptions[selectedPreset].name}"`
              : `Apply "${presetDescriptions[selectedPreset].name}" & Start (${selectedAccounts.length})`
            }
          </button>
        </div>
      </div>

      {/* Accounts List */}
      <div className="automation-accounts">
        {/* Bulk selection controls */}
        <div className="bulk-selection-controls">
          <h3 className="section-title" style={{ margin: 0 }}>Account Automation Settings</h3>
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
                    {/* Show current preset */}
                    {account.preset && (
                      <span 
                        className="preset-badge" 
                        style={{ backgroundColor: presetDescriptions[account.preset]?.color || '#666' }}
                      >
                        {presetDescriptions[account.preset]?.name || account.preset}
                      </span>
                    )}
                  </div>
                </div>

                <div className="account-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleLoadSettings(account.id)}
                  >
                    <actionIcons.bot size={16} style={{ marginRight: '6px' }} />
                    Configure
                  </button>
                  
                  {account.status === 'active' ? (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleStopAutomation(account.id)}
                    >
                      <instanceIcons.stop size={16} style={{ marginRight: '6px' }} />
                      Stop
                    </button>
                  ) : (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleStartAutomation(account.id)}
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
