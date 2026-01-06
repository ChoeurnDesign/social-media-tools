import AccountCard from './AccountCard.jsx';
import { instanceIcons } from '../config/icons';
import '../styles/AccountList.css';

function AccountList({ accounts, onLogin, onEdit, onDelete }) {
  if (accounts.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon"><instanceIcons.smartphone size={64} /></div>
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
