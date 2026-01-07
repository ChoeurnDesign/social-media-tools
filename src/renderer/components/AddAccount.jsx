import { useState, useEffect } from 'react';
import { formIcons } from '../config/icons';
import '../styles/AddAccount.css';

function AddAccount({ account, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    username: '',
    nickname: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (account) {
      setFormData({
        username: account.username || '',
        nickname: account.nickname || '',
      });
    }
  }, [account]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nickname.trim()) {
      newErrors.nickname = 'Nickname/Label is required';
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
      username: formData.username.trim() || formData.nickname.trim(),
      nickname: formData.nickname.trim(),
      password: '', // Empty password - authentication happens via TikTok OAuth
    };

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
            <label htmlFor="nickname" className="form-label">
              Account Label / Nickname *
            </label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              className={`form-input ${errors.nickname ? 'error' : ''}`}
              placeholder="e.g., My Personal Account, Business Account"
              autoComplete="off"
            />
            {errors.nickname && (
              <span className="error-message">{errors.nickname}</span>
            )}
            <p className="field-help">
              This is just a label to help you identify this account in the app.
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="username" className="form-label">
              TikTok Username (Optional)
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., @username (for display purposes only)"
              autoComplete="off"
            />
            <p className="field-help">
              Optional - for display purposes only. You can leave this blank.
            </p>
          </div>

          <div className="auth-info">
            <div className="auth-info-header">
              <formIcons.lock size={20} style={{ marginRight: '8px' }} />
              <strong>How Authentication Works</strong>
            </div>
            <p className="auth-info-text">
              TikTok uses social login (Google, Facebook, Apple) for authentication, not username/password.
              After adding this account, click the <strong>"Login"</strong> button to open a mobile instance
              where you'll log in using TikTok's normal login flow. Your session will be saved automatically.
            </p>
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
            All account data is encrypted and stored locally on your device. Your data never leaves your computer.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AddAccount;
