import { useState, useEffect } from 'react';
import { sidebarIcons, headerIcons } from '../../config/icons';
import { toast } from '../../utils/toast';
import '../../styles/Settings.css';

function Settings({ theme, onThemeChange }) {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    language: 'en',
    startWithSystem: false,
    minimizeToTray: false,
    defaultDevice: 'iphone13',
    defaultPerRow: 3,
    maxActionsPerHour: 100,
    safetyDelay: 3,
  });
  const [proxies, setProxies] = useState([]);
  const [showAddProxy, setShowAddProxy] = useState(false);
  const [newProxy, setNewProxy] = useState({
    protocol: 'http',
    host: '',
    port: '',
    username: '',
    password: '',
    location: '',
  });

  useEffect(() => {
    loadSettings();
    loadProxies();
  }, []);

  const loadSettings = async () => {
    try {
      const result = await window.electronAPI.getAllSettings();
      if (result.success && result.data) {
        setSettings(prev => ({ ...prev, ...result.data }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadProxies = async () => {
    try {
      const result = await window.electronAPI.getProxies();
      if (result.success) {
        setProxies(result.data);
      }
    } catch (error) {
      console.error('Failed to load proxies:', error);
    }
  };

  const handleSettingChange = async (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    try {
      await window.electronAPI.setSetting(key, value);
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  };

  const handleAddProxy = async () => {
    if (!newProxy.host || !newProxy.port) {
      toast.warning('Host and port are required');
      return;
    }

    try {
      const result = await window.electronAPI.addProxy({
        ...newProxy,
        port: parseInt(newProxy.port),
      });
      
      if (result.success) {
        await loadProxies();
        setShowAddProxy(false);
        setNewProxy({
          protocol: 'http',
          host: '',
          port: '',
          username: '',
          password: '',
          location: '',
        });
        toast.success('Proxy added successfully!');
      }
    } catch (error) {
      console.error('Failed to add proxy:', error);
      toast.error('Failed to add proxy. Please try again.');
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: sidebarIcons.settings },
    { id: 'instances', label: 'Mobile Instances', icon: sidebarIcons.instances },
    { id: 'automation', label: 'Automation', icon: sidebarIcons.automation },
    { id: 'proxies', label: 'Proxies', icon: headerIcons.settings },
    { id: 'data', label: 'Data Management', icon: sidebarIcons.export },
    { id: 'about', label: 'About', icon: headerIcons.docs },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="settings-section">
            <h3 className="section-title">General Settings</h3>
            
            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Theme</label>
                <p className="setting-description">Choose your preferred color theme</p>
              </div>
              <div className="setting-control">
                <select 
                  value={theme} 
                  onChange={(e) => onThemeChange(e.target.value)}
                  className="setting-select"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Language</label>
                <p className="setting-description">Select interface language</p>
              </div>
              <div className="setting-control">
                <select 
                  value={settings.language} 
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="setting-select"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Start with System</label>
                <p className="setting-description">Launch app when your computer starts</p>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={settings.startWithSystem}
                    onChange={(e) => handleSettingChange('startWithSystem', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Minimize to Tray</label>
                <p className="setting-description">Keep app running in system tray when closed</p>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={settings.minimizeToTray}
                    onChange={(e) => handleSettingChange('minimizeToTray', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'instances':
        return (
          <div className="settings-section">
            <h3 className="section-title">Mobile Instance Settings</h3>
            
            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Default Device Preset</label>
                <p className="setting-description">Default mobile device for new instances</p>
              </div>
              <div className="setting-control">
                <select 
                  value={settings.defaultDevice} 
                  onChange={(e) => handleSettingChange('defaultDevice', e.target.value)}
                  className="setting-select"
                >
                  <option value="iphone13">iPhone 13</option>
                  <option value="iphone8">iPhone 8</option>
                  <option value="pixel6">Google Pixel 6</option>
                  <option value="galaxy21">Samsung Galaxy S21</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Windows Per Row</label>
                <p className="setting-description">Number of instances to show per row in grid layout</p>
              </div>
              <div className="setting-control">
                <select 
                  value={settings.defaultPerRow} 
                  onChange={(e) => handleSettingChange('defaultPerRow', parseInt(e.target.value))}
                  className="setting-select"
                >
                  <option value="2">2 per row</option>
                  <option value="3">3 per row</option>
                  <option value="4">4 per row</option>
                  <option value="5">5 per row</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'automation':
        return (
          <div className="settings-section">
            <h3 className="section-title">Automation Settings</h3>
            
            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Maximum Actions Per Hour</label>
                <p className="setting-description">Global limit to prevent spam detection</p>
              </div>
              <div className="setting-control">
                <input 
                  type="number" 
                  value={settings.maxActionsPerHour}
                  onChange={(e) => handleSettingChange('maxActionsPerHour', parseInt(e.target.value))}
                  className="setting-input"
                  min="10"
                  max="500"
                />
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Safety Delay (seconds)</label>
                <p className="setting-description">Minimum delay between actions</p>
              </div>
              <div className="setting-control">
                <input 
                  type="number" 
                  value={settings.safetyDelay}
                  onChange={(e) => handleSettingChange('safetyDelay', parseInt(e.target.value))}
                  className="setting-input"
                  min="1"
                  max="60"
                />
              </div>
            </div>

            <div className="info-box">
              <headerIcons.support size={20} />
              <p>These are global limits that apply to all accounts. You can set per-account limits in the Automation page.</p>
            </div>
          </div>
        );

      case 'proxies':
        return (
          <div className="settings-section">
            <div className="section-header">
              <h3 className="section-title">Proxy Settings</h3>
              <button 
                className="btn btn-primary"
                onClick={() => setShowAddProxy(true)}
              >
                <headerIcons.settings size={18} style={{ marginRight: '8px' }} />
                Add Proxy
              </button>
            </div>

            {showAddProxy && (
              <div className="proxy-form">
                <h4>Add New Proxy</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Protocol</label>
                    <select 
                      value={newProxy.protocol}
                      onChange={(e) => setNewProxy({ ...newProxy, protocol: e.target.value })}
                      className="form-input"
                    >
                      <option value="http">HTTP</option>
                      <option value="https">HTTPS</option>
                      <option value="socks5">SOCKS5</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Host *</label>
                    <input 
                      type="text"
                      value={newProxy.host}
                      onChange={(e) => setNewProxy({ ...newProxy, host: e.target.value })}
                      placeholder="proxy.example.com"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Port *</label>
                    <input 
                      type="number"
                      value={newProxy.port}
                      onChange={(e) => setNewProxy({ ...newProxy, port: e.target.value })}
                      placeholder="8080"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Username</label>
                    <input 
                      type="text"
                      value={newProxy.username}
                      onChange={(e) => setNewProxy({ ...newProxy, username: e.target.value })}
                      placeholder="Optional"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Password</label>
                    <input 
                      type="password"
                      value={newProxy.password}
                      onChange={(e) => setNewProxy({ ...newProxy, password: e.target.value })}
                      placeholder="Optional"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Location</label>
                    <input 
                      type="text"
                      value={newProxy.location}
                      onChange={(e) => setNewProxy({ ...newProxy, location: e.target.value })}
                      placeholder="e.g., US, UK"
                      className="form-input"
                    />
                  </div>
                </div>
                
                <div className="form-actions">
                  <button className="btn btn-cancel" onClick={() => setShowAddProxy(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-save" onClick={handleAddProxy}>
                    Add Proxy
                  </button>
                </div>
              </div>
            )}

            <div className="proxy-list">
              {proxies.length === 0 ? (
                <div className="empty-state">
                  <p>No proxies configured</p>
                </div>
              ) : (
                proxies.map(proxy => (
                  <div key={proxy.id} className="proxy-card">
                    <div className="proxy-info">
                      <div className="proxy-protocol">{proxy.protocol.toUpperCase()}</div>
                      <div className="proxy-details">
                        <strong>{proxy.host}:{proxy.port}</strong>
                        {proxy.location && <span className="proxy-location">{proxy.location}</span>}
                      </div>
                    </div>
                    <div className="proxy-actions">
                      {proxy.is_active ? (
                        <span className="status-badge status-active">Active</span>
                      ) : (
                        <span className="status-badge status-inactive">Inactive</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="settings-section">
            <h3 className="section-title">Data Management</h3>
            
            <div className="action-card">
              <div className="action-info">
                <h4>Export Data</h4>
                <p>Export all accounts and settings to a JSON file</p>
              </div>
              <button className="btn btn-secondary">
                <sidebarIcons.export size={18} style={{ marginRight: '8px' }} />
                Export
              </button>
            </div>

            <div className="action-card">
              <div className="action-info">
                <h4>Import Data</h4>
                <p>Import accounts and settings from a backup file</p>
              </div>
              <button className="btn btn-secondary">
                <sidebarIcons.content size={18} style={{ marginRight: '8px' }} />
                Import
              </button>
            </div>

            <div className="action-card">
              <div className="action-info">
                <h4>Clear Sessions</h4>
                <p>Clear all saved login sessions (you'll need to log in again)</p>
              </div>
              <button className="btn btn-warning">
                <headerIcons.logout size={18} style={{ marginRight: '8px' }} />
                Clear Sessions
              </button>
            </div>

            <div className="action-card danger">
              <div className="action-info">
                <h4>Reset Database</h4>
                <p>Delete all data and start fresh (cannot be undone)</p>
              </div>
              <button className="btn btn-danger">
                <headerIcons.close size={18} style={{ marginRight: '8px' }} />
                Reset
              </button>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="settings-section">
            <div className="about-header">
              <div className="app-icon">
                <sidebarIcons.logo size={64} />
              </div>
              <h2>TikTok Manager Pro</h2>
              <p className="version">Version 2.0.0</p>
            </div>

            <div className="about-info">
              <div className="info-item">
                <strong>Author:</strong> ChoeurnDesign
              </div>
              <div className="info-item">
                <strong>License:</strong> MIT License
              </div>
              <div className="info-item">
                <strong>Description:</strong> Professional multi-account TikTok manager with automation and analytics
              </div>
            </div>

            <div className="about-links">
              <a href="https://github.com/ChoeurnDesign/social-media-tools" className="link-button" target="_blank" rel="noopener noreferrer">
                <headerIcons.docs size={18} />
                Documentation
              </a>
              <a href="https://github.com/ChoeurnDesign/social-media-tools/issues" className="link-button" target="_blank" rel="noopener noreferrer">
                <headerIcons.support size={18} />
                Support
              </a>
            </div>

            <div className="credits">
              <h4>Built With</h4>
              <ul>
                <li>Electron - Cross-platform desktop framework</li>
                <li>React - UI library</li>
                <li>Vite - Build tool</li>
                <li>SQLite - Database</li>
                <li>Recharts - Analytics charts</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <sidebarIcons.settings size={28} style={{ display: 'inline', marginRight: '12px', verticalAlign: 'middle' }} />
            Settings
          </h1>
          <p className="page-subtitle">Configure application preferences and options</p>
        </div>
      </div>

      <div className="settings-content">
        <div className="settings-tabs">
          {tabs.map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <IconComponent size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="settings-panel">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

export default Settings;
