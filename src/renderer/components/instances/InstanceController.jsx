import { useState, useEffect } from 'react';
import InstanceCard from './InstanceCard';
import '../../styles/Instances.css';

function InstanceController() {
  const [instances, setInstances] = useState([]);
  const [settings, setSettings] = useState({
    devicePreset: 'iphone13',
    instancesPerRow: 3,
    spacing: 20,
    maxInstances: 10,
    autoArrange: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInstances();
    loadSettings();
    
    // Refresh instances every 2 seconds
    const interval = setInterval(loadInstances, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadInstances = async () => {
    try {
      const result = await window.electronAPI.getActiveInstances();
      if (result.success) {
        setInstances(result.data);
      }
    } catch (error) {
      console.error('Error loading instances:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const result = await window.electronAPI.getInstanceSettings();
      if (result.success) {
        setSettings(result.data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleStartMultiple = async (count) => {
    try {
      const result = await window.electronAPI.startMultipleInstances(count);
      if (result.success) {
        await loadInstances();
      }
    } catch (error) {
      console.error('Error starting instances:', error);
      alert('Failed to start instances');
    }
  };

  const handleStopAll = async () => {
    if (!confirm('Close all mobile instances?')) return;
    
    try {
      await window.electronAPI.closeAllInstances();
      await loadInstances();
    } catch (error) {
      console.error('Error closing instances:', error);
    }
  };

  const handleArrangeInstances = async () => {
    try {
      await window.electronAPI.arrangeInstances();
    } catch (error) {
      console.error('Error arranging instances:', error);
    }
  };

  const handleAutoScrollAll = async () => {
    try {
      await window.electronAPI.autoScrollAll(100);
    } catch (error) {
      console.error('Error starting auto scroll:', error);
    }
  };

  const handleStopAutoScrollAll = async () => {
    try {
      await window.electronAPI.stopAutoScrollAll();
    } catch (error) {
      console.error('Error stopping auto scroll:', error);
    }
  };

  const handleUpdateSettings = async (newSettings) => {
    try {
      await window.electronAPI.updateInstanceSettings(newSettings);
      setSettings({ ...settings, ...newSettings });
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  return (
    <div className="instance-controller">
      <div className="page-header">
        <div>
          <h1 className="page-title">📱 Mobile Instances</h1>
          <p className="page-subtitle">
            Manage multiple TikTok accounts in mobile-sized windows
          </p>
        </div>
      </div>

      <div className="instance-stats">
        <div className="stat-item">
          <span className="stat-label">Active Instances:</span>
          <span className="stat-value">{instances.length} / {settings.maxInstances}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Layout:</span>
          <span className="stat-value">{settings.instancesPerRow} per row</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Device:</span>
          <span className="stat-value">{settings.devicePreset}</span>
        </div>
      </div>

      <div className="instance-controls">
        <div className="control-group">
          <button 
            className="btn btn-primary"
            onClick={() => handleStartMultiple(3)}
            disabled={instances.length >= settings.maxInstances}
          >
            ▶️ Start 3 Instances
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => handleStartMultiple(5)}
            disabled={instances.length >= settings.maxInstances}
          >
            ▶️ Start 5 Instances
          </button>
          <button 
            className="btn btn-danger"
            onClick={handleStopAll}
            disabled={instances.length === 0}
          >
            ⏹️ Stop All
          </button>
        </div>

        <div className="control-group">
          <button 
            className="btn btn-secondary"
            onClick={handleArrangeInstances}
            disabled={instances.length === 0}
          >
            🔄 Auto-Arrange
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleAutoScrollAll}
            disabled={instances.length === 0}
          >
            📜 Auto Scroll All
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleStopAutoScrollAll}
            disabled={instances.length === 0}
          >
            ⏸️ Stop Scroll
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading instances...</div>
        </div>
      ) : instances.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📱</div>
          <h2 className="empty-state-title">No Active Instances</h2>
          <p className="empty-state-description">
            Start mobile instances to manage multiple TikTok accounts simultaneously. 
            Each instance runs in its own mobile-sized window with isolated sessions.
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => handleStartMultiple(3)}
          >
            Start Your First Instances
          </button>
        </div>
      ) : (
        <div className="instance-grid">
          {instances.map((instance) => (
            <InstanceCard
              key={instance.accountId}
              instance={instance}
              onRefresh={loadInstances}
            />
          ))}
        </div>
      )}

      <div className="instance-settings-panel">
        <h3 className="settings-title">Instance Settings</h3>
        <div className="settings-grid">
          <div className="setting-item">
            <label>Instances Per Row</label>
            <input
              type="number"
              min="2"
              max="5"
              value={settings.instancesPerRow}
              onChange={(e) => handleUpdateSettings({ instancesPerRow: parseInt(e.target.value) })}
            />
          </div>
          <div className="setting-item">
            <label>Window Spacing (px)</label>
            <input
              type="number"
              min="10"
              max="50"
              value={settings.spacing}
              onChange={(e) => handleUpdateSettings({ spacing: parseInt(e.target.value) })}
            />
          </div>
          <div className="setting-item">
            <label>Max Instances</label>
            <input
              type="number"
              min="5"
              max="20"
              value={settings.maxInstances}
              onChange={(e) => handleUpdateSettings({ maxInstances: parseInt(e.target.value) })}
            />
          </div>
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.autoArrange}
                onChange={(e) => handleUpdateSettings({ autoArrange: e.target.checked })}
              />
              Auto-Arrange Windows
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstanceController;
