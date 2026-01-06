import { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import AccountList from './components/AccountList.jsx';
import AddAccount from './components/AddAccount.jsx';
import InstanceController from './components/instances/InstanceController';
import { sidebarIcons, actionIcons } from './config/icons';
import './styles/variables.css';
import './styles/App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [accounts, setAccounts] = useState([]);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [theme, setTheme] = useState('dark');

  // Load accounts and theme on mount
  useEffect(() => {
    loadAccounts();
    loadTheme();
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const loadAccounts = async () => {
    try {
      const result = await window.electronAPI.getAccounts();
      if (result.success) {
        setAccounts(result.data);
      } else {
        console.error('Failed to load accounts:', result.error);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const loadTheme = async () => {
    try {
      const savedTheme = await window.electronAPI.getTheme();
      setTheme(savedTheme);
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
    try {
      await window.electronAPI.setTheme(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setShowAddAccount(false);
    setEditingAccount(null);
  };

  const handleAddAccount = async (accountData) => {
    try {
      const result = await window.electronAPI.addAccount(accountData);
      if (result.success) {
        await loadAccounts();
        setShowAddAccount(false);
      } else {
        alert('Failed to add account: ' + result.error);
      }
    } catch (error) {
      console.error('Error adding account:', error);
      alert('Failed to add account');
    }
  };

  const handleUpdateAccount = async (id, updates) => {
    try {
      const result = await window.electronAPI.updateAccount(id, updates);
      if (result.success) {
        await loadAccounts();
        setEditingAccount(null);
        setShowAddAccount(false);
      } else {
        alert('Failed to update account: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating account:', error);
      alert('Failed to update account');
    }
  };

  const handleDeleteAccount = async (id) => {
    if (!confirm('Are you sure you want to delete this account?')) {
      return;
    }

    try {
      const result = await window.electronAPI.deleteAccount(id);
      if (result.success) {
        await loadAccounts();
      } else {
        alert('Failed to delete account: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    }
  };

  const handleLogin = async (accountId) => {
    try {
      // Use new mobile instance instead of old session
      const result = await window.electronAPI.createMobileInstance(accountId);
      if (result.success) {
        await loadAccounts();
        // Optionally switch to instances page
        setCurrentPage('instances');
      } else {
        alert('Failed to open instance: ' + result.error);
      }
    } catch (error) {
      console.error('Error opening instance:', error);
      alert('Failed to open instance');
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setShowAddAccount(true);
  };

  // Render page content based on current page
  const renderPage = () => {
    if (showAddAccount) {
      return (
        <AddAccount
          account={editingAccount}
          onSave={editingAccount ? handleUpdateAccount : handleAddAccount}
          onCancel={() => {
            setShowAddAccount(false);
            setEditingAccount(null);
          }}
        />
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      
      case 'accounts':
        return (
          <div>
            <div className="page-header">
              <div>
                <h1 className="page-title">
                  <sidebarIcons.accounts size={28} style={{ display: 'inline', marginRight: '12px', verticalAlign: 'middle' }} />
                  Accounts
                </h1>
                <p className="page-subtitle">Manage all your TikTok accounts</p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setEditingAccount(null);
                  setShowAddAccount(true);
                }}
              >
                <actionIcons.plus size={18} style={{ marginRight: '8px', display: 'inline' }} />
                Add Account
              </button>
            </div>
            <AccountList
              accounts={accounts}
              onLogin={handleLogin}
              onEdit={handleEdit}
              onDelete={handleDeleteAccount}
            />
          </div>
        );
      
      case 'instances':
        return <InstanceController />;
      
      case 'automation':
        return (
          <div className="page-header">
            <h1 className="page-title">
              <sidebarIcons.automation size={28} style={{ display: 'inline', marginRight: '12px', verticalAlign: 'middle' }} />
              Automation
            </h1>
            <p className="page-subtitle">Manage automation settings and presets</p>
            <div className="empty-state">
              <div className="empty-state-icon"><sidebarIcons.automation size={64} /></div>
              <h2 className="empty-state-title">Automation Panel</h2>
              <p className="empty-state-description">
                Configure automation settings for your accounts. Coming soon in this view!
                For now, automation settings are available per account.
              </p>
            </div>
          </div>
        );
      
      case 'analytics':
        return (
          <div className="page-header">
            <h1 className="page-title">
              <sidebarIcons.analytics size={28} style={{ display: 'inline', marginRight: '12px', verticalAlign: 'middle' }} />
              Analytics
            </h1>
            <p className="page-subtitle">View detailed analytics and reports</p>
            <div className="empty-state">
              <div className="empty-state-icon"><sidebarIcons.analytics size={64} /></div>
              <h2 className="empty-state-title">Analytics Dashboard</h2>
              <p className="empty-state-description">
                Detailed charts and analytics will be displayed here. Feature coming soon!
              </p>
            </div>
          </div>
        );
      
      case 'content':
        return (
          <div className="page-header">
            <h1 className="page-title">
              <sidebarIcons.content size={28} style={{ display: 'inline', marginRight: '12px', verticalAlign: 'middle' }} />
              Content Queue
            </h1>
            <p className="page-subtitle">Manage scheduled content</p>
            <div className="empty-state">
              <div className="empty-state-icon"><sidebarIcons.content size={64} /></div>
              <h2 className="empty-state-title">Content Queue</h2>
              <p className="empty-state-description">
                Schedule and manage video uploads across accounts. Feature coming soon!
              </p>
            </div>
          </div>
        );
      
      case 'tags':
        return (
          <div className="page-header">
            <h1 className="page-title">
              <sidebarIcons.tags size={28} style={{ display: 'inline', marginRight: '12px', verticalAlign: 'middle' }} />
              Tags Manager
            </h1>
            <p className="page-subtitle">Organize accounts with tags</p>
            <div className="empty-state">
              <div className="empty-state-icon"><sidebarIcons.tags size={64} /></div>
              <h2 className="empty-state-title">Tags Manager</h2>
              <p className="empty-state-description">
                Create and manage tags to organize your accounts. Feature coming soon!
              </p>
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div className="page-header">
            <h1 className="page-title">
              <sidebarIcons.settings size={28} style={{ display: 'inline', marginRight: '12px', verticalAlign: 'middle' }} />
              Settings
            </h1>
            <p className="page-subtitle">Configure application settings</p>
            <div className="empty-state">
              <div className="empty-state-icon"><sidebarIcons.settings size={64} /></div>
              <h2 className="empty-state-title">Settings</h2>
              <p className="empty-state-description">
                Application settings and preferences. Feature coming soon!
              </p>
            </div>
          </div>
        );
      
      case 'export':
        return (
          <div className="page-header">
            <h1 className="page-title">
              <sidebarIcons.export size={28} style={{ display: 'inline', marginRight: '12px', verticalAlign: 'middle' }} />
              Export/Import
            </h1>
            <p className="page-subtitle">Backup and restore your data</p>
            <div className="empty-state">
              <div className="empty-state-icon"><sidebarIcons.export size={64} /></div>
              <h2 className="empty-state-title">Export/Import</h2>
              <p className="empty-state-description">
                Export and import account data. Feature coming soon!
              </p>
            </div>
          </div>
        );
      
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      onPageChange={handlePageChange}
      theme={theme}
      onThemeChange={handleThemeChange}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;
