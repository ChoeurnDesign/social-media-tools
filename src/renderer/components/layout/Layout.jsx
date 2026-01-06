import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import '../../styles/Layout.css';

function Layout({ children, currentPage, onPageChange, theme, onThemeChange }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="app-layout">
      <Sidebar
        currentPage={currentPage}
        onPageChange={onPageChange}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className={`main-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header
          theme={theme}
          onThemeChange={onThemeChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <main className="main-content">
          <div className="content-wrapper">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
