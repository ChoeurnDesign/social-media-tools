import { useState } from 'react';
import { sidebarIcons } from '../../config/icons';
import '../../styles/Sidebar.css';

function Sidebar({ currentPage, onPageChange, collapsed, onToggleCollapse }) {
  const menuItems = [
    { id: 'dashboard', icon: sidebarIcons.dashboard, label: 'Dashboard', badge: null },
    { id: 'accounts', icon: sidebarIcons.accounts, label: 'Accounts', badge: null },
    { id: 'instances', icon: sidebarIcons.instances, label: 'Mobile Instances', badge: null },
    { id: 'automation', icon: sidebarIcons.automation, label: 'Automation', badge: null },
    { id: 'analytics', icon: sidebarIcons.analytics, label: 'Analytics', badge: null },
    { id: 'content', icon: sidebarIcons.content, label: 'Content Queue', badge: 'Soon' },
    { id: 'tags', icon: sidebarIcons.tags, label: 'Tags Manager', badge: null },
    { id: 'settings', icon: sidebarIcons.settings, label: 'Settings', badge: null },
    { id: 'export', icon: sidebarIcons.export, label: 'Export/Import', badge: null },
  ];

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button 
          className="sidebar-toggle" 
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <sidebarIcons.menu size={20} /> : <sidebarIcons.close size={20} />}
        </button>
        {!collapsed && (
          <div className="sidebar-logo">
            <div className="logo-icon"><sidebarIcons.logo size={32} /></div>
            <div className="logo-text">
              <div className="logo-title">TikTok Manager</div>
              <div className="logo-subtitle">Pro</div>
            </div>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              className={`sidebar-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => onPageChange(item.id)}
              title={collapsed ? item.label : ''}
            >
              <span className="sidebar-item-icon">
                <IconComponent size={20} />
              </span>
              {!collapsed && (
                <>
                  <span className="sidebar-item-label">{item.label}</span>
                  {item.badge && (
                    <span className="sidebar-item-badge">{item.badge}</span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {!collapsed && (
          <div className="sidebar-version">
            <div className="version-text">Version 2.0.0</div>
            <div className="version-status">
              <span className="status-dot"></span>
              <span>All systems operational</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
