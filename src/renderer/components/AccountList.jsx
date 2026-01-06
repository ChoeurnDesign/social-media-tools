import AccountCard from './AccountCard.jsx';
import '../styles/AccountList.css';

function AccountList({ accounts, onLogin, onEdit, onDelete }) {
  if (accounts.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📱</div>
        <h2>No Accounts Yet</h2>
        <p>Click "Add Account" to get started with managing your TikTok accounts</p>
      </div>
    );
  }

  return (
    <div className="account-list">
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          onLogin={onLogin}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default AccountList;
