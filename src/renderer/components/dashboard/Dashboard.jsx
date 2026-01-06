import { useState, useEffect } from 'react';
import StatCard from './StatCard';
import { statIcons, actionIcons, activityIcons, infoIcons } from '../../config/icons';
import '../../styles/Dashboard.css';

function Dashboard({ onPageChange, onAddAccount }) {
  const [stats, setStats] = useState({
    totalAccounts: 0,
    activeAccounts: 0,
    totalFollowers: 0,
    totalPosts: 0,
    totalViews: 0,
    activePercentage: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const result = await window.electronAPI.getStatistics();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome to TikTok Manager Pro - Your complete account management solution</p>
      </div>

      <div className="stats-overview">
        <StatCard
          icon={statIcons.users}
          title="Total Accounts"
          value={stats.totalAccounts}
          subtitle="Managed accounts"
          gradient="primary"
        />
        <StatCard
          icon={statIcons.active}
          title="Active Now"
          value={stats.activeAccounts}
          subtitle={`${stats.activePercentage}% of total`}
          gradient="success"
        />
        <StatCard
          icon={statIcons.heart}
          title="Total Followers"
          value={formatNumber(stats.totalFollowers)}
          subtitle="Across all accounts"
          gradient="secondary"
        />
        <StatCard
          icon={statIcons.chart}
          title="Total Posts"
          value={formatNumber(stats.totalPosts)}
          subtitle="Content created"
          gradient="accent"
        />
        <StatCard
          icon={statIcons.eye}
          title="Total Views"
          value={formatNumber(stats.totalViews)}
          subtitle="All-time views"
          gradient="info"
        />
        <StatCard
          icon={statIcons.rocket}
          title="Growth Rate"
          value="+12%"
          subtitle="This week"
          gradient="warning"
        />
      </div>

      <div className="dashboard-content">
        <div className="dashboard-grid">
          <div className="dashboard-card quick-actions">
            <h2 className="card-title">Quick Actions</h2>
            <div className="quick-actions-grid">
              <button className="quick-action-btn" onClick={onAddAccount}>
                <span className="action-icon"><actionIcons.plus size={24} /></span>
                <span className="action-label">Add Account</span>
              </button>
              <button className="quick-action-btn" onClick={() => onPageChange('instances')}>
                <span className="action-icon"><actionIcons.smartphone size={24} /></span>
                <span className="action-label">Open Instance</span>
              </button>
              <button className="quick-action-btn" onClick={() => onPageChange('automation')}>
                <span className="action-icon"><actionIcons.bot size={24} /></span>
                <span className="action-label">Start Automation</span>
              </button>
              <button className="quick-action-btn" onClick={() => onPageChange('analytics')}>
                <span className="action-icon"><actionIcons.chart size={24} /></span>
                <span className="action-label">View Analytics</span>
              </button>
              <button className="quick-action-btn" onClick={() => onPageChange('tags')}>
                <span className="action-icon"><actionIcons.tag size={24} /></span>
                <span className="action-label">Manage Tags</span>
              </button>
              <button className="quick-action-btn" onClick={() => onPageChange('export')}>
                <span className="action-icon"><actionIcons.upload size={24} /></span>
                <span className="action-label">Export Data</span>
              </button>
            </div>
          </div>

          <div className="dashboard-card recent-activity">
            <h2 className="card-title">Recent Activity</h2>
            <div className="activity-list">
              <div className="activity-item">
                <span className="activity-icon"><activityIcons.check size={20} /></span>
                <div className="activity-content">
                  <div className="activity-text">Account added successfully</div>
                  <div className="activity-time">2 minutes ago</div>
                </div>
              </div>
              <div className="activity-item">
                <span className="activity-icon"><activityIcons.smartphone size={20} /></span>
                <div className="activity-content">
                  <div className="activity-text">Mobile instance opened for @user123</div>
                  <div className="activity-time">5 minutes ago</div>
                </div>
              </div>
              <div className="activity-item">
                <span className="activity-icon"><activityIcons.bot size={20} /></span>
                <div className="activity-content">
                  <div className="activity-text">Automation started for 3 accounts</div>
                  <div className="activity-time">10 minutes ago</div>
                </div>
              </div>
              <div className="activity-item">
                <span className="activity-icon"><activityIcons.heart size={20} /></span>
                <div className="activity-content">
                  <div className="activity-text">Auto-liked 15 videos</div>
                  <div className="activity-time">15 minutes ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-info">
          <div className="info-card">
            <h3 className="info-title">
              <infoIcons.rocket size={20} style={{ display: 'inline', marginRight: '8px' }} />
              Getting Started
            </h3>
            <p className="info-text">
              Welcome to TikTok Manager Pro! Start by adding your accounts, then use mobile instances 
              to manage them simultaneously. Enable automation for organic growth.
            </p>
          </div>
          <div className="info-card">
            <h3 className="info-title">
              <infoIcons.lightbulb size={20} style={{ display: 'inline', marginRight: '8px' }} />
              Pro Tip
            </h3>
            <p className="info-text">
              Use the "Organic" automation preset for natural engagement patterns that avoid detection. 
              Adjust settings per account for best results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
