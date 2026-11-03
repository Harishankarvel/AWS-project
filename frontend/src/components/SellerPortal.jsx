import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translateProduceName } from '../data/produceDictionary';
import { getProductName } from '../data/translations';
import { PRODUCE_ICONS, suggestProduceIcon } from '../data/produceIcons';

const SellerPortal = ({ isStandalone = false }) => {
  const {
    isSellerPortalOpen,
    setIsSellerPortalOpen,
    products,
    updateProductStock,
    updateProductPrice,
    addProduct,
    deleteProduct,
    user,
    language,
    festiveSeason,
    FESTIVE_SEASONS
  } = useApp();

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'add'
  const [filterText, setFilterText] = useState('');

  // New product state
  const [newProd, setNewProd] = useState({
    name: '',
    category: 'fruit',
    price: '',
    stock: '',
    unit: 'kg',
    image: '🌾',
    seller: user?.farmName || user?.name || ''
  });

  // Icon search and filter in the picker
  const [iconSearch, setIconSearch] = useState('');
  const [isPickerOpen, setIsPickerOpen] = useState(true);

  if (!isStandalone && !isSellerPortalOpen) return null;

  const allFarms = Array.from(new Set(products.map(p => p.seller).filter(Boolean))).sort();
  const currentSellerName = user?.farmName || user?.name || 'Verified Farmer';
  const [selectedFarm, setSelectedFarm] = useState(() => {
    if (user?.farmName && allFarms.some(f => f.toLowerCase().includes(user.farmName.toLowerCase()))) {
      return user.farmName;
    }
    return 'all';
  });

  // Filter products belonging to selected farm or all
  const displayList = products.filter(p => {
    const matchesFarm = selectedFarm === 'all' || (p.seller && p.seller.toLowerCase() === selectedFarm.toLowerCase());
    const matchesFilter = p.name.toLowerCase().includes(filterText.toLowerCase()) ||
                          p.category.toLowerCase().includes(filterText.toLowerCase()) ||
                          (p.seller && p.seller.toLowerCase().includes(filterText.toLowerCase()));
    return matchesFarm && matchesFilter;
  });

  const handleStockChange = (id, delta) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    const newStock = Math.max(0, (prod.stock || 0) + delta);
    updateProductStock(id, newStock);
  };

  const handlePriceChange = (id, newPrice) => {
    const val = parseFloat(newPrice);
    if (!isNaN(val) && val > 0) {
      updateProductPrice(id, val);
    }
  };

  const handleNameChange = (e) => {
    const nameVal = e.target.value;
    const autoIcon = suggestProduceIcon(nameVal);
    setNewProd(prev => ({
      ...prev,
      name: nameVal,
      image: autoIcon
    }));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price || !newProd.stock) return alert('Please fill in all fields');
    
    addProduct({
      ...newProd,
      seller: newProd.seller || currentSellerName
    });
    
    alert(`Successfully added ${newProd.name} to the marketplace catalog at ₹${newProd.price}/${newProd.unit}!`);
    setNewProd({
      name: '',
      category: 'fruit',
      price: '',
      stock: '',
      unit: 'kg',
      image: '🍎',
      seller: currentSellerName
    });
    setActiveTab('inventory');
  };

  const totalStockCount = displayList.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalInventoryValue = displayList.reduce((acc, p) => acc + ((p.stock || 0) * (p.price || 0)), 0);
  const estimatedSellerProfit = Math.round(totalInventoryValue * (festiveSeason === 'pre_festive' ? 0.32 : festiveSeason === 'festive_sale' ? 0.28 : 0.22));

  const content = (
    <div className={`seller-portal-modal ${isStandalone ? 'standalone-portal-view' : ''}`} onClick={e => e.stopPropagation()}>
      <div className="seller-header">
        <div className="seller-title-area">
          <span className="seller-badge-icon">🌾</span>
          <div>
            <h2>Seller & Farmer Workspace</h2>
            <span className="seller-sub">
              Logged in as <strong>{user?.name}</strong> • Farm: <span className="seller-tag">{currentSellerName}</span> • District: <strong>{user?.district || 'Registered District'}</strong>
            </span>
          </div>
        </div>
        {!isStandalone && (
          <button className="close-modal" onClick={() => setIsSellerPortalOpen(false)}>✕</button>
        )}
      </div>

      <div className="seller-season-profit-alert">
        <div className="alert-content">
          <span className="alert-badge">📊 Mandi AI Yield Tracker</span>
          <p>
            Current Platform Season: <strong>{FESTIVE_SEASONS[festiveSeason]?.name || 'Festive Sale'}</strong>. 
            Estimated farmer payout margin: <strong>{festiveSeason === 'pre_festive' ? '32%' : festiveSeason === 'festive_sale' ? '28%' : '22%'}</strong> per kg sold.
          </p>
        </div>
      </div>

      <div className="seller-tabs">
        <button 
          className={`seller-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          📦 My Produce Inventory ({displayList.length})
        </button>
        <button 
          className={`seller-tab-btn ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          ➕ List New Crop / Produce
        </button>
      </div>

      <div className="seller-stats-bar">
        <div className="stat-pill">
          <span className="stat-label">Total Stock:</span>
          <span className="stat-val">{totalStockCount} kg</span>
        </div>
        <div className="stat-pill">
          <span className="stat-label">Inventory Worth:</span>
          <span className="stat-val">₹{totalInventoryValue.toLocaleString('en-IN')}</span>
        </div>
        <div className="stat-pill highlight">
          <span className="stat-label">Projected Net Farmer Profit:</span>
          <span className="stat-val">₹{estimatedSellerProfit.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <div className="inventory-tab-content">
          <div className="inventory-filter-bar" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Search listed produce by name or category..." 
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="seller-search-input"
              style={{ flex: 1, minWidth: '220px' }}
            />
            <div className="farm-filter-box" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: '#8b949e', whiteSpace: 'nowrap' }}>🌾 Filter Farm:</span>
              <select
                value={selectedFarm}
                onChange={(e) => setSelectedFarm(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #30363d',
                  background: '#161b22',
                  color: '#fff',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <option value="all">🌐 All 37 Registered Farms ({products.length} items)</option>
                {allFarms.map(f => (
                  <option key={f} value={f}>🌾 {f}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="seller-table-wrap">
            <table className="seller-inventory-table">
              <thead>
                <tr>
                  <th>Produce</th>
                  <th>Category</th>
                  <th>Farm / Seller</th>
                  <th>Base Rate (₹/kg)</th>
                  <th>Storefront Price</th>
                  <th>Current Stock</th>
                  <th>Stock Controls</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayList.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div className="prod-cell">
                        <span className="prod-icon">{item.image}</span>
                        <div>
                          <strong>{getProductName(item, language)}</strong>
                          <span className="unit-label">per {item.unit}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`cat-pill ${item.category}`}>{item.category}</span>
                    </td>
                    <td>
                      <span className="seller-pill" style={{ fontSize: '0.82rem', padding: '3px 8px', borderRadius: '4px', background: '#21262d', color: '#7ee787' }}>
                        🌾 {item.seller || 'Verified Farm'}
                      </span>
                    </td>
                    <td>
                      <div className="price-edit-cell">
                        <span>₹</span>
                        <input 
                          type="number"
                          className="table-price-input"
                          defaultValue={item.basePrice || item.price}
                          onBlur={(e) => handlePriceChange(item.id, e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handlePriceChange(item.id, e.target.value)}
                          min="1"
                        />
                      </div>
                    </td>
                    <td>
                      <strong className="live-store-price">₹{item.price}</strong>
                    </td>
                    <td>
                      <span className={`stock-status ${item.stock <= 5 ? 'low' : ''}`}>
                        {item.stock} {item.unit}
                      </span>
                    </td>
                    <td>
                      <div className="table-stock-actions">
                        <button onClick={() => handleStockChange(item.id, -5)} title="-5 kg">-5</button>
                        <button onClick={() => handleStockChange(item.id, -1)} title="-1 kg">-1</button>
                        <button onClick={() => handleStockChange(item.id, 1)} title="+1 kg">+1</button>
                        <button onClick={() => handleStockChange(item.id, 5)} title="+5 kg">+5</button>
                        <button onClick={() => handleStockChange(item.id, 25)} title="+25 kg" className="bulk-btn">+25</button>
                      </div>
                    </td>
                    <td>
                      <button 
                        className="seller-delete-btn" 
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to remove ${item.name} from your listing?`)) {
                            deleteProduct(item.id);
                          }
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <form onSubmit={handleAddSubmit} className="seller-add-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Produce / Crop Name *</label>
              <input 
                type="text" 
                placeholder="e.g. Organic Alphonso Mango" 
                value={newProd.name} 
                onChange={handleNameChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Produce Category *</label>
              <select 
                value={newProd.category} 
                onChange={e => setNewProd(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="fruit">🍎 Fruit</option>
                <option value="vegetable">🥦 Vegetable</option>
                <option value="grain">🌾 Grain & Cereal</option>
                <option value="green">🥬 Leafy Greens</option>
              </select>
            </div>

            <div className="form-group">
              <label>Base Price (₹ per unit) *</label>
              <input 
                type="number" 
                placeholder="e.g. 120" 
                value={newProd.price} 
                onChange={e => setNewProd(prev => ({ ...prev, price: parseFloat(e.target.value) || '' }))}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>Initial Harvest Arrival Qty (Stock) *</label>
              <input 
                type="number" 
                placeholder="e.g. 50" 
                value={newProd.stock} 
                onChange={e => setNewProd(prev => ({ ...prev, stock: parseInt(e.target.value, 10) || '' }))}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>Unit of Measure</label>
              <select 
                value={newProd.unit} 
                onChange={e => setNewProd(prev => ({ ...prev, unit: e.target.value }))}
              >
                <option value="kg">kg</option>
                <option value="bunch">bunch</option>
                <option value="box">box</option>
              </select>
            </div>

            <div className="form-group">
              <label>Farmer / Seller Name</label>
              <input 
                type="text" 
                value={currentSellerName} 
                disabled 
                style={{ opacity: 0.8 }}
              />
            </div>
          </div>

          <div className="form-actions-right">
            <button type="submit" className="primary-btn submit-crop-btn">
              🌱 List Produce on Marketplace
            </button>
          </div>
        </form>
      )}
    </div>
  );

  if (isStandalone) {
    return <div className="standalone-portal-container">{content}</div>;
  }

  return (
    <div className="modal-backdrop" onClick={() => setIsSellerPortalOpen(false)}>
      {content}
    </div>
  );
};

export default SellerPortal;
