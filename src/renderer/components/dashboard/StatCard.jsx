import '../../styles/Dashboard.css';

function StatCard({ icon, title, value, subtitle, gradient = 'primary' }) {
  return (
    <div className={`stat-card gradient-${gradient}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-title">{title}</div>
        <div className="stat-subtitle">{subtitle}</div>
      </div>
    </div>
  );
}

export default StatCard;
