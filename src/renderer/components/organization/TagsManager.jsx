import { useState, useEffect } from 'react';
import { ChromePicker } from 'react-color';
import { sidebarIcons, actionIcons, accountIcons } from '../../config/icons';
import '../../styles/TagsManager.css';

function TagsManager() {
  const [tags, setTags] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [showAddTag, setShowAddTag] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [newTag, setNewTag] = useState({
    name: '',
    color: '#667eea',
  });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [filterTag, setFilterTag] = useState(null);
  const [selectedAccounts, setSelectedAccounts] = useState([]);

  useEffect(() => {
    loadTags();
    loadAccounts();
  }, []);

  const loadTags = async () => {
    try {
      const result = await window.electronAPI.getTags();
      if (result.success) {
        setTags(result.data);
      }
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

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

  const handleAddTag = async () => {
    if (!newTag.name.trim()) {
      alert('Tag name is required');
      return;
    }

    try {
      const result = await window.electronAPI.addTag(newTag.name, newTag.color);
      if (result.success) {
        await loadTags();
        setShowAddTag(false);
        setNewTag({ name: '', color: '#667eea' });
      }
    } catch (error) {
      console.error('Failed to add tag:', error);
      alert('Failed to add tag');
    }
  };

  const handleAssignTag = async (accountId, tagId) => {
    try {
      await window.electronAPI.assignTagToAccount(accountId, tagId);
      await loadAccounts();
    } catch (error) {
      console.error('Failed to assign tag:', error);
    }
  };

  const handleBulkAssign = async () => {
    if (!selectedTag || selectedAccounts.length === 0) {
      alert('Please select a tag and at least one account');
      return;
    }

    try {
      for (const accountId of selectedAccounts) {
        await window.electronAPI.assignTagToAccount(accountId, selectedTag);
      }
      await loadAccounts();
      setSelectedAccounts([]);
      alert(`Tag assigned to ${selectedAccounts.length} account(s)`);
    } catch (error) {
      console.error('Failed to bulk assign tags:', error);
      alert('Failed to assign tags');
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

  const getTagStats = (tagName) => {
    return accounts.filter(account => 
      account.tags && account.tags.includes(tagName)
    ).length;
  };

  const filteredAccounts = filterTag 
    ? accounts.filter(account => account.tags && account.tags.includes(filterTag))
    : accounts;

  const predefinedColors = [
    '#667eea', '#e94560', '#4caf50', '#ff9800', 
    '#9c27b0', '#00bcd4', '#ffc107', '#f44336',
    '#3f51b5', '#8bc34a', '#ff5722', '#795548'
  ];

  return (
    <div className="tags-manager">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <sidebarIcons.tags size={28} style={{ display: 'inline', marginRight: '12px', verticalAlign: 'middle' }} />
            Tags Manager
          </h1>
          <p className="page-subtitle">Organize and categorize your accounts with tags</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddTag(true)}
        >
          <actionIcons.plus size={18} style={{ marginRight: '8px' }} />
          Add Tag
        </button>
      </div>

      {showAddTag && (
        <div className="modal-overlay" onClick={() => setShowAddTag(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">
              {editingTag ? 'Edit Tag' : 'Add New Tag'}
            </h2>
            
            <div className="form-group">
              <label className="form-label">Tag Name *</label>
              <input 
                type="text"
                value={newTag.name}
                onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                placeholder="e.g., Personal, Business, Testing"
                className="form-input"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Color</label>
              <div className="color-picker-wrapper">
                <button 
                  className="color-preview"
                  style={{ backgroundColor: newTag.color }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                >
                  {newTag.color}
                </button>
                
                {showColorPicker && (
                  <div className="color-picker-popup">
                    <div 
                      className="color-picker-overlay"
                      onClick={() => setShowColorPicker(false)}
                    />
                    <ChromePicker 
                      color={newTag.color}
                      onChange={(color) => setNewTag({ ...newTag, color: color.hex })}
                    />
                  </div>
                )}

                <div className="predefined-colors">
                  {predefinedColors.map(color => (
                    <button
                      key={color}
                      className="color-swatch"
                      style={{ backgroundColor: color }}
                      onClick={() => setNewTag({ ...newTag, color })}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn btn-cancel"
                onClick={() => {
                  setShowAddTag(false);
                  setNewTag({ name: '', color: '#667eea' });
                  setShowColorPicker(false);
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-save"
                onClick={handleAddTag}
              >
                {editingTag ? 'Update Tag' : 'Add Tag'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="tags-content">
        {/* Tags List */}
        <div className="tags-section">
          <div className="section-header">
            <h3 className="section-title">All Tags</h3>
            <span className="tag-count">{tags.length} tag{tags.length !== 1 ? 's' : ''}</span>
          </div>

          {tags.length === 0 ? (
            <div className="empty-state">
              <sidebarIcons.tags size={48} />
              <p>No tags created yet</p>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowAddTag(true)}
              >
                Create Your First Tag
              </button>
            </div>
          ) : (
            <div className="tags-grid">
              {tags.map(tag => {
                const count = getTagStats(tag.name);
                return (
                  <div 
                    key={tag.id} 
                    className={`tag-card ${filterTag === tag.name ? 'active' : ''}`}
                    onClick={() => setFilterTag(filterTag === tag.name ? null : tag.name)}
                  >
                    <div className="tag-header">
                      <div 
                        className="tag-color-dot"
                        style={{ backgroundColor: tag.color }}
                      />
                      <h4 className="tag-name">{tag.name}</h4>
                    </div>
                    <div className="tag-stats">
                      <span className="tag-count-badge">
                        {count} account{count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bulk Assignment */}
        {tags.length > 0 && (
          <div className="bulk-assign-section">
            <h3 className="section-title">Bulk Tag Assignment</h3>
            
            <div className="bulk-controls">
              <div className="control-group">
                <label className="control-label">Select Tag:</label>
                <select 
                  value={selectedTag || ''}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="control-select"
                >
                  <option value="">Choose a tag...</option>
                  {tags.map(tag => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>

              <button 
                className="btn btn-primary"
                onClick={handleBulkAssign}
                disabled={!selectedTag || selectedAccounts.length === 0}
              >
                Assign to {selectedAccounts.length} Account{selectedAccounts.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        )}

        {/* Accounts List */}
        <div className="accounts-section">
          <div className="section-header">
            <h3 className="section-title">
              {filterTag ? `Accounts with "${filterTag}"` : 'All Accounts'}
            </h3>
            {filterTag && (
              <button 
                className="btn btn-secondary"
                onClick={() => setFilterTag(null)}
              >
                Clear Filter
              </button>
            )}
          </div>

          {filteredAccounts.length === 0 ? (
            <div className="empty-state">
              <accountIcons.login size={48} />
              <p>{filterTag ? 'No accounts with this tag' : 'No accounts found'}</p>
            </div>
          ) : (
            <div className="accounts-grid">
              {filteredAccounts.map(account => (
                <div 
                  key={account.id} 
                  className={`account-card ${selectedAccounts.includes(account.id) ? 'selected' : ''}`}
                  onClick={() => toggleAccountSelection(account.id)}
                >
                  <div className="account-header">
                    <input 
                      type="checkbox"
                      checked={selectedAccounts.includes(account.id)}
                      onChange={() => toggleAccountSelection(account.id)}
                      className="account-checkbox"
                    />
                    <h4 className="account-name">{account.nickname || account.username}</h4>
                  </div>
                  
                  {account.username && (
                    <p className="account-username">@{account.username}</p>
                  )}

                  <div className="account-tags">
                    {account.tags && account.tags.length > 0 ? (
                      account.tags.map((tagName, index) => {
                        const tag = tags.find(t => t.name === tagName);
                        return tag ? (
                          <span 
                            key={index}
                            className="account-tag"
                            style={{ backgroundColor: tag.color }}
                          >
                            {tagName}
                          </span>
                        ) : null;
                      })
                    ) : (
                      <span className="no-tags">No tags</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TagsManager;
