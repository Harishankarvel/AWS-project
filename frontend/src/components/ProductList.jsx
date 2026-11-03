import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { fetchRecommendation } from '../api';
import { getProductName } from '../data/translations';
import { getPortionPrices } from '../data/inflationEngine';

const ProductList = () => {
  const {
    products,
    searchQuery,
    selectedCategory,
    selectedTrendFilter,
    addToCart,
    user,
    language,
    festiveSeason,
    FESTIVE_SEASONS,
    macroFactors,
    isRecalibrating,
    secondsUntilNextInflation
  } = useApp();

  const [aiAnalysisState, setAiAnalysisState] = useState({});
  const [selectedPortions, setSelectedPortions] = useState({}); // { [productId]: '200g' | '500g' | '1kg' }
  const activeSeason = FESTIVE_SEASONS[festiveSeason] || FESTIVE_SEASONS.festive_sale;

  // Filter products by search query, category, and monthly trend filter
  const filteredProducts = products.filter(product => {
    const translatedName = getProductName(product, language) || product.name;
    const sellerName = product.seller || '';
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      translatedName.toLowerCase().includes(q) ||
      product.name.toLowerCase().includes(q) ||
      sellerName.toLowerCase().includes(q);
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    // Monthly trend filtering from sidebar
    let matchesTrend = true;
    if (selectedTrendFilter === 'most_sold') {
      matchesTrend = product.isBestSeller || (product.monthlySales >= 300);
    }

    return matchesSearch && matchesCategory && matchesTrend;
  });

  const handleSimulateAiAudit = async (product) => {
    setAiAnalysisState(prev => ({ ...prev, [product.id]: 'analyzing' }));
    try {
      const payload = { commodity: product.name, district: "North", arrival_qty: 100, cpi_inflation_index: 105, fuel_price_index: 75, seasonality: 1.0 };
      await fetchRecommendation(payload);
      setAiAnalysisState(prev => ({ ...prev, [product.id]: 'verified' }));
    } catch (e) {
      console.error(e);
      setAiAnalysisState(prev => ({ ...prev, [product.id]: 'verified' }));
    }
  };

  return (
    <div className="catalog-section">
      {/* Live AI Market Banner */}
      <div className="festive-live-banner regular">
        <div className="festive-banner-content">
          <div className="festive-banner-badge">
            <span className="sparkle-icon">✨</span>
            <span>Direct Farm Marketplace</span>
          </div>
          <h3>🌱 Pure Farm-Direct Produce</h3>
          <p>Fresh crops harvested daily by certified local farmers. AI dynamically recalibrates fair market rates to ensure zero middlemen markup.</p>
        </div>
      </div>

      {/* Catalog Status Bar */}
      <div className="catalog-status-bar">
        <div className="active-filter-indicator">
          <span className="indicator-label">Viewing:</span>
          <span className="indicator-tag">
            {selectedTrendFilter === 'most_sold' ? '🔥 Most Sold This Month' : '🌾 All Produce'}
          </span>
          {selectedCategory !== 'all' && (
            <span className="indicator-tag category">
              {selectedCategory === 'fruit' ? '🍎 Fruits' : '🥦 Vegetables'}
            </span>
          )}
        </div>

        <span className="results-count">
          Showing <strong>{filteredProducts.length}</strong> farm items
        </span>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="no-products">
          <span className="no-icon">🔍</span>
          <h3>No produce items found</h3>
          <p>Try selecting another category or clear your search term</p>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map(product => {
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= 20;
            const displayPrice = product.aiRecommendedPrice || product.price;
            const isWeightBased = !product.unit || product.unit === 'kg';
            const chosenPortion = selectedPortions[product.id] || (isWeightBased ? '1kg' : product.unit);
            const portions = getPortionPrices(displayPrice);
            const effectiveDisplayPrice = isWeightBased ? portions[chosenPortion] : displayPrice;

            return (
              <div key={product.id} className={`product-card ${isOutOfStock ? 'out-of-stock-card' : ''}`}>
                <div className="card-top-badges">
                  {/* Monthly Trend Tag: ONLY shown when Most Sold filter is active */}
                  {selectedTrendFilter === 'most_sold' ? (
                    <span className="trend-badge bestseller">🔥 Most Sold This Month</span>
                  ) : (
                    <span className="rating-badge">⭐ {product.rating}</span>
                  )}

                  {isOutOfStock ? (
                    <span className="stock-badge out-stock">Out of Stock</span>
                  ) : isLowStock ? (
                    <span className="stock-badge low-stock">Only {product.stock} left</span>
                  ) : (
                    <span className="stock-badge in-stock">{product.stock} in stock</span>
                  )}
                </div>

                <div className="product-image-box">
                  <span className="product-emoji">{product.image}</span>
                </div>

                <div className="product-info">
                  <h3>{getProductName(product, language) || product.name}</h3>

                  {/* Seller Attribution Display */}
                  <div className="product-seller-tag">
                    <span className="seller-icon">🌾</span>
                    <span className="seller-name-label">Farmer: <strong>{product.seller || 'Verified Local Farmer'}</strong></span>
                  </div>

                  {/* Monthly Sales Tracker Badge: ONLY shown when Most Sold is active */}
                  {selectedTrendFilter === 'most_sold' && (
                    <div className="monthly-sales-tracker-badge">
                      <span className="sales-icon">📊</span>
                      <span><strong>{product.monthlySales || 120}+ {product.unit}</strong> sold this month</span>
                    </div>
                  )}

                  <span className="product-unit">Price per {product.unit}</span>

                  <div className="price-row">
                    <div className="price-with-ai-badge">
                      <span className={`current-price ${isRecalibrating ? 'price-pulse' : ''}`}>₹{effectiveDisplayPrice.toFixed(2)}</span>
                      {product.previousPrice && product.previousPrice !== (product.aiRecommendedPrice || product.price) ? (
                        <span className={`inflation-delta-tag ${product.price > product.previousPrice ? 'up' : 'down'}`}>
                          {product.price > product.previousPrice ? `▲ +₹${(product.price - product.previousPrice).toFixed(0)}` : `▼ -₹${(product.previousPrice - product.price).toFixed(0)}`}
                        </span>
                      ) : product.basePrice && (product.basePrice !== (product.aiRecommendedPrice || product.price)) ? (
                        <span className="strikethrough-price">₹{product.basePrice.toFixed(2)}</span>
                      ) : null}
                    </div>
                    <span className="ai-recommended-tag">
                      🤖 AI Recommended
                    </span>
                  </div>

                  {/* Weight / Portion Selector for User (200g, 500g, 1kg) */}
                  {isWeightBased && (
                    <div className="portion-selector-box">
                      <div className="portion-selector-header">
                        <span className="portion-heading">Select Weight / Portion:</span>
                        <span className="portion-calc-note">AI Dynamic Rate</span>
                      </div>
                      <div className="portion-chips-row">
                        <button
                          type="button"
                          className={`portion-chip ${chosenPortion === '200g' ? 'active' : ''}`}
                          onClick={() => setSelectedPortions(prev => ({ ...prev, [product.id]: '200g' }))}
                        >
                          <span className="portion-qty">200g</span>
                          <span className="portion-price">₹{portions['200g']}</span>
                        </button>

                        <button
                          type="button"
                          className={`portion-chip ${chosenPortion === '500g' ? 'active' : ''}`}
                          onClick={() => setSelectedPortions(prev => ({ ...prev, [product.id]: '500g' }))}
                        >
                          <span className="portion-qty">500g</span>
                          <span className="portion-price">₹{portions['500g']}</span>
                        </button>

                        <button
                          type="button"
                          className={`portion-chip ${chosenPortion === '1kg' ? 'active' : ''}`}
                          onClick={() => setSelectedPortions(prev => ({ ...prev, [product.id]: '1kg' }))}
                        >
                          <span className="portion-qty">1 kg</span>
                          <span className="portion-price">₹{portions['1kg']}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* AI Market Verification indicator */}
                  <div className="ai-market-status" onClick={() => handleSimulateAiAudit(product)}>
                    <span className="status-dot"></span>
                    <span className="status-text">
                      {aiAnalysisState[product.id] === 'analyzing' 
                        ? 'Auditing live mandi rates...' 
                        : 'Dynamic AI Market Price Active'}
                    </span>
                  </div>

                  {/* Add to Cart Button for Customer */}
                  {user?.role === 'admin' ? (
                    <div className="admin-item-notice">
                      ⚙️ Admin Oversight: Stock {product.stock} {product.unit}
                    </div>
                  ) : user?.role === 'seller' ? (
                    <div className="seller-item-notice">
                      🌾 Seller View: Rate ₹{displayPrice}/{product.unit}
                    </div>
                  ) : (
                    <button 
                      className="add-to-cart-btn"
                      onClick={() => addToCart(product, 1, chosenPortion, effectiveDisplayPrice)}
                      disabled={isOutOfStock}
                    >
                      {isOutOfStock ? 'Out of Stock' : `🛒 Add ${chosenPortion} to Cart • ₹${effectiveDisplayPrice}`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductList;
