import { useState } from 'react';
import { headerIcons } from '../../config/icons';
import '../../styles/Header.css';

function Header({ theme, onThemeChange, searchQuery, onSearchChange }) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggleTheme = () => {
    onThemeChange(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-title">
          <h1>TikTok Manager Pro</h1>
          <span className="header-subtitle">Professional Multi-Account Management</span>
        </div>
      </div>

      <div className="header-center">
        <div className="search-box">
          <span className="search-icon"><headerIcons.search size={18} /></span>
          <input
            type="text"
            placeholder="Search accounts, groups, tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button 
              className="search-clear"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            >
              <headerIcons.close size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="header-right">
        <button 
          className="header-action-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <headerIcons.sun size={18} /> : <headerIcons.moon size={18} />}
        </button>

        <button className="header-action-btn" title="Notifications">
          <span className="notification-icon"><headerIcons.bell size={18} /></span>
          <span className="notification-badge">3</span>
        </button>

        <div className="user-menu">
          <button 
            className="user-avatar"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <headerIcons.user size={18} />
          </button>
          {showUserMenu && (
            <div className="user-dropdown">
              <div className="user-info">
                <div className="user-name">Admin</div>
                <div className="user-email">admin@tiktokmanager.pro</div>
              </div>
              <div className="user-menu-divider"></div>
              <button className="user-menu-item">
                <headerIcons.settings size={16} />
                Settings
              </button>
              <button className="user-menu-item">
                <headerIcons.docs size={16} />
                Documentation
              </button>
              <button className="user-menu-item">
                <headerIcons.support size={16} />
                Support
              </button>
              <div className="user-menu-divider"></div>
              <button className="user-menu-item danger">
                <headerIcons.logout size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
