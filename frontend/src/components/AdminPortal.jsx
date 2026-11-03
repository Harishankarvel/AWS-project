import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getProductName } from '../data/translations';

const AdminPortal = ({ isStandalone = false }) => {
  const {
    isAdminPortalOpen,
    setIsAdminPortalOpen,
    products,
    updateProductStock,
    deleteProduct,
    user,
    language,
    festiveSeason,
    applyFestiveSeason,
    FESTIVE_SEASONS,
    macroFactors,
    secondsUntilNextInflation,
    isRecalibrating,
    inflationLogs,
    triggerInflationCycle
  } = useApp();

  const [filterText, setFilterText] = useState('');
  const [showLogsModal, setShowLogsModal] = useState(false);

  if (!isStandalone && !isAdminPortalOpen) return null;

  const activeSeason = FESTIVE_SEASONS[festiveSeason] || FESTIVE_SEASONS.festive_sale;

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(filterText.toLowerCase()) ||
    p.category.toLowerCase().includes(filterText.toLowerCase()) ||
    (p.seller && p.seller.toLowerCase().includes(filterText.toLowerCase()))
  );

  const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalCatalogValue = products.reduce((acc, p) => acc + ((p.stock || 0) * (p.price || 0)), 0);
  const uniqueSellers = Array.from(new Set(products.map(p => p.seller).filter(Boolean)));
  const projectedAdminRevenue = Math.round(totalCatalogValue * (festiveSeason === 'pre_festive' ? 0.06 : festiveSeason === 'festive_sale' ? 0.035 : 0.05));

  const content = (
    <div className={`admin-portal-modal ${isStandalone ? 'standalone-portal-view' : ''}`} onClick={e => e.stopPropagation()}>
      <div className="admin-header">
        <div>
          <h2>👑 Platform Administration & Inflation Oversight</h2>
          <span className="admin-sub">
            Logged in as <strong>{user?.name || 'Super Admin'}</strong> • Admin Control Panel & Mandi Oversight
          </span>
        </div>
        {!isStandalone && (
          <button className="close-modal" onClick={() => setIsAdminPortalOpen(false)}>✕</button>
        )}
      </div>

      <div className="admin-role-notice">
        ℹ️ <strong>Admin Authority:</strong> Regulate storewide seasonal inflation, configure algorithm multipliers, and monitor verified farm supplies across all districts.
      </div>

      {/* Seasonal Pricing & Inflation Regulator */}
      <div className="admin-season-controller-full">
        <div className="controller-full-header">
          <div className="controller-header-title">
            <span className="controller-icon">⚡</span>
            <div>
              <h3>Automated Seasonal Pricing & Inflation Regulator</h3>
              <span className="controller-subtitle">Select a season to instantly recalibrate all customer storefront rates</span>
            </div>
          </div>
          <div className="active-season-chip">
            <span className="chip-label">Current Active Season:</span>
            <strong className="chip-val">{activeSeason.name}</strong>
          </div>
        </div>

        <div className="season-cards-grid">
          <div 
            className={`season-admin-card ${festiveSeason === 'pre_festive' ? 'selected pre_festive' : ''}`}
            onClick={() => applyFestiveSeason('pre_festive')}
          >
            <div className="card-top-row">
              <span className="season-badge-icon">📈</span>
              <span className="season-card-name">Pre-Festive Surge</span>
              <span className="season-rate-pill surge">+18% Rate</span>
            </div>
            <div className="season-formula-tag">Pricing Function: <code>Price = Base × 1.18</code></div>
            <p className="season-card-desc">Early demand spike model prior to Diwali/Navratri.</p>
            <button className="select-season-action-btn">
              {festiveSeason === 'pre_festive' ? '✓ Currently Live' : 'Activate Pre-Festive Surge'}
            </button>
          </div>

          <div 
            className={`season-admin-card ${festiveSeason === 'festive_sale' ? 'selected festive_sale' : ''}`}
            onClick={() => applyFestiveSeason('festive_sale')}
          >
            <div className="card-top-row">
              <span className="season-badge-icon">🎉</span>
              <span className="season-card-name">Festive Mega Sale</span>
              <span className="season-rate-pill festive">-10% Discount</span>
            </div>
            <div className="season-formula-tag">Pricing Function: <code>Price = Base × 0.90</code></div>
            <p className="season-card-desc">Direct subsidized farmer promotion for maximum bulk buyer conversions.</p>
            <button className="select-season-action-btn">
              {festiveSeason === 'festive_sale' ? '✓ Currently Live' : 'Activate Festive Sale'}
            </button>
          </div>

          <div 
            className={`season-admin-card ${festiveSeason === 'harvest_flush' ? 'selected harvest_flush' : ''}`}
            onClick={() => applyFestiveSeason('harvest_flush')}
          >
            <div className="card-top-row">
              <span className="season-badge-icon">🌾</span>
              <span className="season-card-name">Post-Harvest Glut</span>
              <span className="season-rate-pill harvest">-18% Mandi Cleared</span>
            </div>
            <div className="season-formula-tag">Pricing Function: <code>Price = Base × 0.82</code></div>
            <p className="season-card-desc">Excess production liquidation to clear mandi inventory.</p>
            <button className="select-season-action-btn">
              {festiveSeason === 'harvest_flush' ? '✓ Currently Live' : 'Activate Harvest Glut'}
            </button>
          </div>

          <div 
            className={`season-admin-card ${festiveSeason === 'regular' ? 'selected regular' : ''}`}
            onClick={() => applyFestiveSeason('regular')}
          >
            <div className="card-top-row">
              <span className="season-badge-icon">⚖️</span>
              <span className="season-card-name">Standard Off-Season</span>
              <span className="season-rate-pill base">Baseline</span>
            </div>
            <div className="season-formula-tag">Pricing Function: <code>Price = Base × 1.00</code></div>
            <p className="season-card-desc">Standard balanced fair-trade price with zero algorithmic multipliers.</p>
            <button className="select-season-action-btn">
              {festiveSeason === 'regular' ? '✓ Currently Live' : 'Activate Baseline'}
            </button>
          </div>
        </div>
      </div>

      {/* Key Metric Overview */}
      <div className="admin-kpi-row">
        <div className="kpi-card">
          <span className="kpi-num">{products.length}</span>
          <span className="kpi-label">Marketplace SKUs</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-num">{totalStock.toLocaleString('en-IN')} kg</span>
          <span className="kpi-label">Total Mandi Volume</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-num">₹{totalCatalogValue.toLocaleString('en-IN')}</span>
          <span className="kpi-label">Total Gross Value</span>
        </div>
        <div className="kpi-card highlight">
          <span className="kpi-num">₹{projectedAdminRevenue.toLocaleString('en-IN')}</span>
          <span className="kpi-label">Platform Margin Yield</span>
        </div>
      </div>

      {/* Catalog & Inventory Table */}
      <div className="admin-inventory-section">
        <div className="admin-section-header">
          <h3>📦 All Registered Produce & Sellers ({filteredProducts.length})</h3>
          <input 
            type="text" 
            placeholder="Search produce, category, or seller..." 
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="admin-search-input"
          />
        </div>

        <div className="admin-table-container">
          <table className="admin-inventory-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Seller / Farm</th>
                <th>Live Price</th>
                <th>Mandi Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p.id}>
                  <td>
                    <span className="admin-prod-name">{p.image} {getProductName(p, language)}</span>
                  </td>
                  <td>
                    <span className={`cat-pill ${p.category}`}>{p.category}</span>
                  </td>
                  <td>
                    <span className="seller-name-tag">🌾 {p.seller || 'Verified Farm'}</span>
                  </td>
                  <td>
                    <strong>₹{p.price}/{p.unit}</strong>
                  </td>
                  <td>
                    <span className={p.stock <= 10 ? 'stock-warning' : ''}>
                      {p.stock} {p.unit}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="delete-btn" 
                      onClick={() => {
                        if (window.confirm(`Delete ${p.name}?`)) deleteProduct(p.id);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (isStandalone) {
    return <div className="standalone-portal-container">{content}</div>;
  }

  return (
    <div className="modal-backdrop" onClick={() => setIsAdminPortalOpen(false)}>
      {content}
    </div>
  );
};

export default AdminPortal;
