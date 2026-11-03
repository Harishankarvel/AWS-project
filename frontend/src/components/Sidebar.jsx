import React from 'react';
import { useApp } from '../context/AppContext';

const Sidebar = () => {
  const {
    products,
    cart,
    orders,
    user,
    selectedCategory,
    setSelectedCategory,
    selectedTrendFilter,
    setSelectedTrendFilter,
    setIsCartOpen,
    setIsOrdersOpen,
    isSidebarOpen,
    setIsSidebarOpen,
    getCartCount,
    getCartTotal
  } = useApp();

  const totalFruits = products.filter(p => p.category === 'fruit').length;
  const totalVegetables = products.filter(p => p.category === 'vegetable').length;
  const totalMostSold = products.filter(p => p.isBestSeller || p.monthlySales >= 300).length;

  return (
    <>
      {/* Overlay backdrop when sidebar is open on mobile / overlay mode */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside className={`app-sidebar ${isSidebarOpen ? 'open' : 'collapsed'}`}>
        {/* Sidebar Header with Close Button */}
        <div className="sidebar-header-bar">
          <div className="sidebar-title-badge">
            <span className="sidebar-leaf">🌿</span>
            <span>Marketplace Control</span>
          </div>
          <button 
            className="sidebar-close-btn"
            onClick={() => setIsSidebarOpen(false)}
            title="Hide Sidebar"
          >
            ✕
          </button>
        </div>

        {/* Quick Nav / Cart & Orders Summary Widget */}
        {(!user || user.role === 'user') && (
          <div className="sidebar-section sidebar-actions-box">
            <button 
              className="sidebar-action-btn cart-sidebar-btn"
              onClick={() => {
                setIsCartOpen(true);
              }}
            >
              <div className="sidebar-btn-left">
                <span className="sidebar-btn-icon">🛒</span>
                <div>
                  <strong>Your Cart</strong>
                  <span className="sidebar-btn-sub">
                    {getCartCount()} items • ₹{getCartTotal().toFixed(2)}
                  </span>
                </div>
              </div>
              {getCartCount() > 0 && (
                <span className="sidebar-badge-count">{getCartCount()}</span>
              )}
            </button>

            <button 
              className="sidebar-action-btn orders-sidebar-btn"
              onClick={() => {
                setIsOrdersOpen(true);
              }}
            >
              <div className="sidebar-btn-left">
                <span className="sidebar-btn-icon">📦</span>
                <div>
                  <strong>Your Orders</strong>
                  <span className="sidebar-btn-sub">Track month delivery</span>
                </div>
              </div>
              {orders.length > 0 && (
                <span className="sidebar-badge-orders">{orders.length}</span>
              )}
            </button>
          </div>
        )}


        {/* Monthly Trends Sidebar Section */}
        <div className="sidebar-section">
          <h4 className="sidebar-heading">🔥 Monthly Highlights</h4>
          <div className="sidebar-nav-list">
            <button 
              className={`sidebar-nav-item ${selectedTrendFilter === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedTrendFilter('all')}
            >
              <span className="nav-item-icon">🌾</span>
              <span className="nav-item-title">All Produce</span>
              <span className="nav-item-pill">{products.length}</span>
            </button>

            <button 
              className={`sidebar-nav-item highlight ${selectedTrendFilter === 'most_sold' ? 'active' : ''}`}
              onClick={() => setSelectedTrendFilter('most_sold')}
            >
              <span className="nav-item-icon">🔥</span>
              <span className="nav-item-title">Most Sold This Month</span>
              <span className="nav-item-pill count-hot">{totalMostSold}</span>
            </button>
          </div>
        </div>

        {/* Categories Section */}
        <div className="sidebar-section">
          <h4 className="sidebar-heading">📂 Categories</h4>
          <div className="sidebar-nav-list">
            <button 
              className={`sidebar-nav-item ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              <span className="nav-item-icon">🌟</span>
              <span className="nav-item-title">All Categories</span>
              <span className="nav-item-pill">{products.length}</span>
            </button>

            <button 
              className={`sidebar-nav-item ${selectedCategory === 'fruit' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('fruit')}
            >
              <span className="nav-item-icon">🍎</span>
              <span className="nav-item-title">Fresh Fruits</span>
              <span className="nav-item-pill">{totalFruits}</span>
            </button>

            <button 
              className={`sidebar-nav-item ${selectedCategory === 'vegetable' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('vegetable')}
            >
              <span className="nav-item-icon">🥦</span>
              <span className="nav-item-title">Farm Vegetables</span>
              <span className="nav-item-pill">{totalVegetables}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
