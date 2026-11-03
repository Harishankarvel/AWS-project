import React from 'react';
import { useApp } from '../context/AppContext';

const Navbar = () => {
  const {
    user,
    logout,
    setIsAuthOpen,
    setIsCartOpen,
    setIsAdminPortalOpen,
    setIsSellerPortalOpen,
    setIsOrdersOpen,
    setIsProfileOpen,
    isSidebarOpen,
    setIsSidebarOpen,
    orders,
    getCartCount,
    language,
    setLanguage,
    LANGUAGES,
    searchQuery,
    setSearchQuery
  } = useApp();

  return (
    <header className="navbar-container">
      <div className="navbar-top">
        {/* Sidebar Toggle Icon Button (Corner Left) & Brand Logo */}
        <div className="navbar-left-group">
          <button 
            className={`sidebar-toggle-btn ${isSidebarOpen ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(prev => !prev)}
            title="Toggle Menu & Category Sidebar"
            aria-label="Toggle Sidebar"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

          <div className="brand-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="logo-icon">🍏</span>
            <div className="brand-text-block">
              <h1 className="portal-brand-title">FarmFresh Market</h1>
              <span className="sub-tagline">100% Organic & Direct from Indian Farmers</span>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search 50+ fresh fruits, veggies, sellers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>

        <div className="nav-actions">
          {/* Language Selector */}
          <div className="language-selector">
            <span className="globe-icon">🌐</span>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* User Auth / Portals */}
          {user ? (
            <div className="user-profile">
              <button 
                className="user-profile-btn" 
                onClick={() => setIsProfileOpen(true)}
                title="Click to view your submitted account profile & details"
              >
                <div className="profile-mini-avatar">
                  {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="profile-name-role">
                  <span className="user-name">{user.name}</span>
                  <span className={`user-badge ${user.role}`}>
                    {user.role === 'admin' ? '👑 Admin' : user.role === 'seller' ? '🌾 Seller' : '👤 Customer'}
                  </span>
                </div>
              </button>

              {user.role === 'admin' && (
                <button className="admin-portal-btn" onClick={() => setIsAdminPortalOpen(true)}>
                  ⚙️ Admin Portal
                </button>
              )}

              {user.role === 'seller' && (
                <button className="seller-portal-btn" onClick={() => setIsSellerPortalOpen(true)}>
                  🌾 Seller Portal
                </button>
              )}

              <button className="logout-btn" onClick={logout}>Logout</button>
            </div>
          ) : (
            <button className="auth-btn" onClick={() => setIsAuthOpen(true)}>
              🔒 Login / Sign Up
            </button>
          )}

          {/* Cart & Your Orders Buttons on top */}
          {(!user || user.role === 'user') && (
            <div className="cart-orders-group">
              <button className="cart-nav-btn" onClick={() => setIsCartOpen(true)}>
                🛒 Cart
                {getCartCount() > 0 && <span className="cart-badge-count">{getCartCount()}</span>}
              </button>

              <button className="orders-nav-btn" onClick={() => setIsOrdersOpen(true)} title="View all your placed orders">
                📦 Your Orders
                {orders.length > 0 && <span className="orders-count-badge">{orders.length}</span>}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
