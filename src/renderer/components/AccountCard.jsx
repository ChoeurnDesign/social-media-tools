import { accountIcons } from '../config/icons';
import '../styles/AccountCard.css';

function AccountCard({ account, onLogin, onEdit, onDelete }) {
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`account-card ${account.isActive ? 'active' : ''}`}>
      <div className="card-header">
        <div className="avatar">
          {account.avatar ? (
            <img src={account.avatar} alt={account.username} />
          ) : (
            <div className="avatar-placeholder">
              {getInitials(account.nickname || account.username)}
            </div>
          )}
        </div>
        <div className="account-info">
          <h3 className="account-name">{account.nickname || account.username}</h3>
          <p className="account-username">@{account.username}</p>
        </div>
        {account.isActive && (
          <div className="status-badge">
            <span className="status-dot"></span>
            Active
          </div>
        )}
      </div>

      <div className="card-actions">
        <button
          className="btn btn-primary"
          onClick={() => onLogin(account.id)}
          disabled={account.isActive}
        >
          {account.isActive ? (
            <>
              <accountIcons.check size={16} style={{ marginRight: '6px', display: 'inline' }} />
              Logged In
            </>
          ) : (
            <>
              <accountIcons.rocket size={16} style={{ marginRight: '6px', display: 'inline' }} />
              Login
            </>
          )}
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => onEdit(account)}
        >
          <accountIcons.edit size={16} style={{ marginRight: '6px', display: 'inline' }} />
          Edit
        </button>
        <button
          className="btn btn-danger"
          onClick={() => onDelete(account.id)}
        >
          <accountIcons.delete size={16} style={{ marginRight: '6px', display: 'inline' }} />
          Delete
        </button>
      </div>

      {account.createdAt && (
        <div className="card-footer">
          <small>Added: {new Date(account.createdAt).toLocaleDateString()}</small>
        </div>
      )}
    </div>
  );
}

export default AccountCard;
