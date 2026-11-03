import React from 'react';
import { useApp } from '../context/AppContext';

const ProfileModal = () => {
  const { isProfileOpen, setIsProfileOpen, user, orders } = useApp();

  if (!isProfileOpen || !user) return null;

  const roleBadgeConfig = {
    admin: { label: '👑 Platform Administrator', color: '#ff9800', bg: 'rgba(255, 152, 0, 0.15)', border: '#f57c00' },
    seller: { label: '🌾 Certified Farmer & Seller', color: '#4caf50', bg: 'rgba(76, 175, 80, 0.15)', border: '#388e3c' },
    user: { label: '👤 Registered Customer', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: '#0284c7' }
  };

  const badge = roleBadgeConfig[user.role] || roleBadgeConfig.user;
  const initial = (user.name || user.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="modal-backdrop" onClick={() => setIsProfileOpen(false)}>
      <div className="modal-content profile-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="profile-modal-header">
          <div className="profile-avatar-banner">
            <div className="profile-large-avatar">{initial}</div>
            <div className="profile-header-text">
              <h2>{user.name || 'Account Holder'}</h2>
              <span className="profile-role-pill" style={{ color: badge.color, backgroundColor: badge.bg, borderColor: badge.border }}>
                {badge.label}
              </span>
            </div>
          </div>
          <button className="close-modal" onClick={() => setIsProfileOpen(false)} title="Close Profile">✕</button>
        </div>

        <p className="profile-modal-description">
          Here are your registered account details submitted during signup and authenticated via MySQL database. Sensitive security credentials (password) are hidden.
        </p>

        {/* Profile Details List */}
        <div className="profile-details-grid">
          <div className="profile-detail-item">
            <span className="profile-detail-label">👤 Full Name</span>
            <span className="profile-detail-value">{user.name || 'Not provided'}</span>
          </div>

          <div className="profile-detail-item">
            <span className="profile-detail-label">📧 Email Address</span>
            <span className="profile-detail-value">{user.email || 'Not provided'}</span>
          </div>

          <div className="profile-detail-item">
            <span className="profile-detail-label">🏷️ Account Role</span>
            <span className="profile-detail-value role-caps">{user.role?.toUpperCase() || 'USER'}</span>
          </div>

          {user.phone && (
            <div className="profile-detail-item">
              <span className="profile-detail-label">📞 Phone Number</span>
              <span className="profile-detail-value">{user.phone}</span>
            </div>
          )}

          {user.district && (
            <div className="profile-detail-item">
              <span className="profile-detail-label">📍 Mandi District</span>
              <span className="profile-detail-value">{user.district} Mandi Region</span>
            </div>
          )}

          {user.farmName && (
            <div className="profile-detail-item profile-full-width">
              <span className="profile-detail-label">🌾 Farm / Business Name</span>
              <span className="profile-detail-value highlight-farm">{user.farmName}</span>
            </div>
          )}

          <div className="profile-detail-item">
            <span className="profile-detail-label">🔒 Security / Password</span>
            <span className="profile-detail-value masked-pwd">•••••••• (Hidden for Privacy)</span>
          </div>

          <div className="profile-detail-item">
            <span className="profile-detail-label">📦 Total Orders Placed</span>
            <span className="profile-detail-value highlight-count">{orders?.length || 0} Orders</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="profile-modal-footer">
          <div className="security-note">
            🛡️ <span>Account verified & active in MySQL credentials table</span>
          </div>
          <button className="profile-close-btn" onClick={() => setIsProfileOpen(false)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
