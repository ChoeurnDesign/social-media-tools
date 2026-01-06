import { useState, useEffect } from 'react';
import AccountList from './components/AccountList.jsx';
import AddAccount from './components/AddAccount.jsx';
import './styles/App.css';

function App() {
  const [accounts, setAccounts] = useState([]);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [searchQuery, setSearchQuery] = useState('');

  // Load accounts on mount
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
      const result = await window.electronAPI.restoreSession(accountId);
      if (result.success) {
        await loadAccounts();
      } else {
        alert('Failed to open session: ' + result.error);
      }
    } catch (error) {
      console.error('Error opening session:', error);
      alert('Failed to open session');
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setShowAddAccount(true);
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    try {
      await window.electronAPI.setTheme(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const filteredAccounts = accounts.filter(account =>
    account.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.nickname?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="icon">🎵</span>
            TikTok Account Manager
          </h1>
          <div className="header-actions">
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="main-header">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <button
            className="btn-add-account"
            onClick={() => {
              setEditingAccount(null);
              setShowAddAccount(true);
            }}
          >
            <span className="btn-icon">+</span>
            Add Account
          </button>
        </div>

        {showAddAccount ? (
          <AddAccount
            account={editingAccount}
            onSave={editingAccount ? handleUpdateAccount : handleAddAccount}
            onCancel={() => {
              setShowAddAccount(false);
              setEditingAccount(null);
            }}
          />
        ) : (
          <AccountList
            accounts={filteredAccounts}
            onLogin={handleLogin}
            onEdit={handleEdit}
            onDelete={handleDeleteAccount}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>
          Total Accounts: <strong>{accounts.length}</strong> | 
          Active: <strong>{accounts.filter(a => a.isActive).length}</strong>
        </p>
        <p className="security-note">🔒 All credentials are encrypted with AES-256</p>
      </footer>
    </div>
  );
}

export default App;
