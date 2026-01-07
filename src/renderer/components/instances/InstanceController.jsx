import { useState, useEffect } from 'react';
import InstanceCard from './InstanceCard';
import { instanceIcons, sidebarIcons } from '../../config/icons';
import { toast } from '../../utils/toast';
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
  const [isStarting, setIsStarting] = useState(false);

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
    setIsStarting(true);
    let toastId = null;
    
    try {
      // ✅ PRE-CHECK: Get accounts first
      const accountsResult = await window.electronAPI.getAccounts();
      if (!accountsResult.success) {
        toast.error('Failed to load accounts');
        setIsStarting(false);
        return;
      }
      
      const allAccounts = accountsResult.data;
      const inactiveAccounts = allAccounts.filter(a => a.status !== 'active');
      
      // ✅ CHECK: Do we have any accounts?
      if (allAccounts.length === 0) {
        toast.warning('No accounts found. Please add accounts first.');
        setIsStarting(false);
        return;
      }
      
      // ✅ CHECK: Do we have any inactive accounts?
      if (inactiveAccounts.length === 0) {
        toast.warning('All accounts are already active. Close some instances first.');
        setIsStarting(false);
        return;
      }
      
      // ✅ CHECK: Do we have enough inactive accounts?
      const actualCount = Math.min(count, inactiveAccounts.length);
      if (actualCount < count) {
        toast.info(`Only ${actualCount} inactive account${actualCount !== 1 ? 's' : ''} available. Starting all...`);
      }
      
      toastId = toast.loading(`Starting ${actualCount} instance${actualCount !== 1 ? 's' : ''}...`);
      
      // Use actualCount to match the number of available inactive accounts
      const result = await window.electronAPI.startMultipleInstances(actualCount);
      
      if (result.success && result.data) {
        // Parse individual results
        const successCount = result.data.filter(r => r.success).length;
        const failureCount = result.data.filter(r => !r.success).length;
        
        // Update instances list
        await loadInstances();
        
        // Show appropriate message based on results
        if (failureCount === 0 && successCount > 0) {
          // All instances started successfully
          toast.update(toastId, {
            render: `✅ Successfully started ${successCount} instance${successCount !== 1 ? 's' : ''}!`,
            type: 'success',
            isLoading: false,
            autoClose: 4000,
          });
        } else if (successCount === 0 && failureCount > 0) {
          // All instances failed
          const firstError = result.data.find(r => !r.success)?.error || 'Unknown error';
          toast.update(toastId, {
            render: `❌ Failed to start instances: ${firstError}`,
            type: 'error',
            isLoading: false,
            autoClose: 6000,
          });
        } else if (successCount > 0 && failureCount > 0) {
          // Partial success
          const firstError = result.data.find(r => !r.success)?.error || 'Unknown error';
          toast.update(toastId, {
            render: `⚠️ Started ${successCount} instance${successCount !== 1 ? 's' : ''}. Failed to start ${failureCount}: ${firstError}`,
            type: 'warning',
            isLoading: false,
            autoClose: 6000,
          });
        } else {
          // Empty results array - log for debugging
          console.warn('Received empty results array from startMultipleInstances');
          toast.update(toastId, {
            render: '⚠️ No instances were started. Please try again.',
            type: 'warning',
            isLoading: false,
            autoClose: 5000,
          });
        }
      } else {
        toast.update(toastId, {
          render: `❌ Failed to start instances: ${result.error || 'Unknown error'}`,
          type: 'error',
          isLoading: false,
          autoClose: 6000,
        });
      }
    } catch (error) {
      console.error('Error starting instances:', error);
      // Dismiss loading toast if it exists
      if (toastId) {
        toast.dismiss(toastId);
      }
      toast.error(`Failed to start instances: ${error.message}`);
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopAll = async () => {
    if (!confirm('Close all mobile instances?')) return;
    
    try {
      await window.electronAPI.closeAllInstances();
      await loadInstances();
      toast.success('All instances closed successfully');
    } catch (error) {
      console.error('Error closing instances:', error);
      toast.error('Failed to close instances. Please try again.');
    }
  };

  const handleArrangeInstances = async () => {
    try {
      await window.electronAPI.arrangeInstances();
      toast.info('Instances rearranged');
    } catch (error) {
      console.error('Error arranging instances:', error);
      toast.error('Failed to arrange instances');
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
          <h1 className="page-title">
            <sidebarIcons.instances size={28} style={{ display: 'inline', marginRight: '12px', verticalAlign: 'middle' }} />
            Mobile Instances
          </h1>
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
            disabled={instances.length >= settings.maxInstances || isStarting}
          >
            <instanceIcons.play size={16} style={{ marginRight: '8px', display: 'inline' }} />
            {isStarting ? 'Starting...' : 'Start 3 Instances'}
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => handleStartMultiple(5)}
            disabled={instances.length >= settings.maxInstances || isStarting}
          >
            <instanceIcons.play size={16} style={{ marginRight: '8px', display: 'inline' }} />
            {isStarting ? 'Starting...' : 'Start 5 Instances'}
          </button>
          <button 
            className="btn btn-danger"
            onClick={handleStopAll}
            disabled={instances.length === 0}
          >
            <instanceIcons.stop size={16} style={{ marginRight: '8px', display: 'inline' }} />
            Stop All
          </button>
        </div>

        <div className="control-group">
          <button 
            className="btn btn-secondary"
            onClick={handleArrangeInstances}
            disabled={instances.length === 0}
          >
            <instanceIcons.refresh size={16} style={{ marginRight: '8px', display: 'inline' }} />
            Auto-Arrange
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleAutoScrollAll}
            disabled={instances.length === 0}
          >
            <instanceIcons.scroll size={16} style={{ marginRight: '8px', display: 'inline' }} />
            Auto Scroll All
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleStopAutoScrollAll}
            disabled={instances.length === 0}
          >
            <instanceIcons.pause size={16} style={{ marginRight: '8px', display: 'inline' }} />
            Stop Scroll
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
          <div className="empty-state-icon"><instanceIcons.smartphone size={64} /></div>
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
