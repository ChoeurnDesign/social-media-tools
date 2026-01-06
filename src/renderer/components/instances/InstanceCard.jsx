import '../../styles/Instances.css';

function InstanceCard({ instance, onRefresh }) {
  const handleClose = async () => {
    try {
      await window.electronAPI.closeInstance(instance.accountId);
      await onRefresh();
    } catch (error) {
      console.error('Error closing instance:', error);
    }
  };

  return (
    <div className={`instance-card ${instance.isFocused ? 'focused' : ''}`}>
      <div className="instance-header">
        <div className="instance-status">
          <span className={`status-indicator ${instance.isVisible ? 'active' : 'inactive'}`}></span>
          <span className="instance-title">{instance.title}</span>
        </div>
        <button 
          className="instance-close-btn"
          onClick={handleClose}
          title="Close instance"
        >
          ✕
        </button>
      </div>
      
      <div className="instance-info">
        <div className="info-row">
          <span className="info-label">Position:</span>
          <span className="info-value">{instance.bounds.x}, {instance.bounds.y}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Size:</span>
          <span className="info-value">{instance.bounds.width} × {instance.bounds.height}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Status:</span>
          <span className={`status-badge ${instance.isVisible ? 'visible' : 'hidden'}`}>
            {instance.isVisible ? '👁️ Visible' : '🙈 Hidden'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default InstanceCard;
