import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getProductName } from '../data/translations';

const OrdersModal = () => {
  const { isOrdersOpen, setIsOrdersOpen, orders, user, language } = useApp();
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('all');

  if (!isOrdersOpen) return null;

  // Extract unique months from orders
  const availableMonths = Array.from(new Set(orders.map(o => o.month).filter(Boolean)));

  const filteredOrders = orders.filter(order => {
    if (selectedMonthFilter === 'all') return true;
    return order.month === selectedMonthFilter;
  });

  return (
    <div className="modal-backdrop" onClick={() => setIsOrdersOpen(false)}>
      <div className="modal-content orders-modal" onClick={e => e.stopPropagation()}>
        <div className="orders-modal-header">
          <div className="orders-title-group">
            <span className="orders-icon">📦</span>
            <div>
              <h2>Your Order History & Tracking</h2>
              <span className="orders-sub">
                Track all fresh produce orders placed by {user?.name || 'Customer'}
              </span>
            </div>
          </div>
          <button className="close-modal" onClick={() => setIsOrdersOpen(false)}>✕</button>
        </div>

        {/* Month Tracking Filter */}
        <div className="orders-month-tracker">
          <div className="tracker-label">
            <span>📅 Track Orders by Month:</span>
          </div>
          <div className="month-pills">
            <button 
              className={`month-pill ${selectedMonthFilter === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedMonthFilter('all')}
            >
              All Months ({orders.length})
            </button>
            {availableMonths.map(m => (
              <button 
                key={m}
                className={`month-pill ${selectedMonthFilter === m ? 'active' : ''}`}
                onClick={() => setSelectedMonthFilter(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Content */}
        <div className="orders-list-container">
          {filteredOrders.length === 0 ? (
            <div className="no-orders-box">
              <span className="no-orders-emoji">🛒</span>
              <h3>No orders found for this selection</h3>
              <p>Place an order from the product portal to see it tracked here live!</p>
            </div>
          ) : (
            <div className="orders-cards-list">
              {filteredOrders.map(order => (
                <div key={order.id} className="order-history-card">
                  <div className="order-card-header">
                    <div>
                      <span className="order-id-badge">{order.id}</span>
                      <span className="order-date-text">Placed on: {order.date}</span>
                    </div>
                    <div className="order-status-badge">
                      {order.status || 'Delivered 🚚'}
                    </div>
                  </div>

                  <div className="order-items-grid">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="order-item-row">
                        <span className="order-item-emoji">{item.image || '🍎'}</span>
                        <div className="order-item-info">
                          <strong>{getProductName(item, language) || item.name}</strong>
                          <span className="order-item-meta">
                            {item.quantity} {item.unit || 'unit'} × ₹{item.price?.toFixed(2)}
                            {item.seller && <span className="order-farmer-tag">🌾 {item.seller}</span>}
                          </span>
                        </div>
                        <div className="order-item-subtotal">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-card-footer">
                    <div className="order-delivery-info">
                      <span>📍 Delivery To: {order.address?.name || 'Customer'}, {order.address?.city} {order.address?.pincode}</span>
                      <span className="order-payment-method">Payment: <strong>{order.paymentMethod || 'UPI'}</strong></span>
                    </div>
                    <div className="order-total-block">
                      <span className="order-total-label">Total Amount</span>
                      <span className="order-total-val">₹{Number(order.total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersModal;
