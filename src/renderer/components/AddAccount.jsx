import { useState, useEffect } from 'react';
import { formIcons } from '../config/icons';
import '../styles/AddAccount.css';

function AddAccount({ account, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nickname: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (account) {
      setFormData({
        username: account.username || '',
        password: '', // Don't pre-fill password for security
        nickname: account.nickname || '',
      });
    }
  }, [account]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!account && !formData.password.trim()) {
      newErrors.password = 'Password is required for new accounts';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const accountData = {
      username: formData.username.trim(),
      nickname: formData.nickname.trim() || formData.username.trim(),
    };

    // Only include password if it's provided
    if (formData.password.trim()) {
      accountData.password = formData.password;
    }

    if (account) {
      onSave(account.id, accountData);
    } else {
      onSave(accountData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  return (
    <div className="add-account">
      <div className="add-account-container">
        <h2 className="form-title">
          {account ? (
            <>
              <formIcons.edit size={24} style={{ marginRight: '12px', display: 'inline', verticalAlign: 'middle' }} />
              Edit Account
            </>
          ) : (
            <>
              <formIcons.plus size={24} style={{ marginRight: '12px', display: 'inline', verticalAlign: 'middle' }} />
              Add New Account
            </>
          )}
        </h2>

        <form onSubmit={handleSubmit} className="account-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              TikTok Username *
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`form-input ${errors.username ? 'error' : ''}`}
              placeholder="Enter your TikTok username"
              autoComplete="off"
            />
            {errors.username && (
              <span className="error-message">{errors.username}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password {account ? '(leave blank to keep current)' : '*'}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Enter your password"
              autoComplete="new-password"
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="nickname" className="form-label">
              Nickname / Display Name
            </label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              className="form-input"
              placeholder="Optional: A friendly name for this account"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn btn-save">
              {account ? 'Update Account' : 'Add Account'}
            </button>
          </div>
        </form>

        <div className="security-info">
          <p>
            <formIcons.lock size={16} style={{ marginRight: '8px', display: 'inline', verticalAlign: 'middle' }} />
            Your credentials are encrypted using AES-256 encryption before being stored locally.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AddAccount;
