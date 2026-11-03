import React from 'react';
import { useApp } from '../context/AppContext';
import { getProductName } from '../data/translations';

const BillingPortal = () => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    setIsCheckoutOpen,
    user,
    language,
  } = useApp();

  if (user?.role === 'admin' || user?.role === 'seller') return null; // Billing portal is for customer purchases

  return (
    <section className="billing-portal-container">
      <div className="billing-portal-header">
        <h2>🧾 Live Shopping Billing & Invoice Portal</h2>
        <p>Real-time itemized breakdown of added produce and verified farm sellers</p>
      </div>

      <div className="billing-portal-content">
        <div className="billing-table-wrapper">
          {cart.length === 0 ? (
            <div className="billing-empty">
              <span>🛒</span>
              <p>No items added to billing yet.</p>
              <small>Click "Add to Cart" on any product above to generate live invoice items.</small>
            </div>
          ) : (
            <table className="billing-table">
              <thead>
                <tr>
                  <th>Produce Item</th>
                  <th>Farmer / Seller</th>
                  <th>Unit Rate (₹)</th>
                  <th>Quantity</th>
                  <th>Subtotal (₹)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => {
                  const { product, quantity, selectedPortion, unitPrice, cartItemId } = item;
                  const effectiveRate = unitPrice !== undefined ? unitPrice : product.price;
                  const portionTag = selectedPortion || product.unit;

                  return (
                    <tr key={cartItemId || product.id}>
                      <td className="billing-item-name">
                        <span className="billing-emoji">{product.image}</span>
                        <div>
                          <strong>{getProductName(product, language) || product.name}</strong>
                          <span className="billing-portion-tag">({portionTag})</span>
                          <br />
                          <small className="muted-text">{product.category}</small>
                        </div>
                      </td>
                      <td>
                        <span className="seller-pill">🌾 {product.seller || 'Local Farmer'}</span>
                      </td>
                      <td>₹{effectiveRate.toFixed(2)} / {portionTag}</td>
                      <td>
                        <div className="billing-qty-control">
                          <button onClick={() => updateCartQuantity(cartItemId || product.id, quantity - 1)}>-</button>
                          <span>{quantity}</span>
                          <button onClick={() => updateCartQuantity(cartItemId || product.id, quantity + 1)}>+</button>
                        </div>
                      </td>
                      <td className="subtotal-cell">₹{(effectiveRate * quantity).toFixed(2)}</td>
                      <td>
                        <button className="billing-delete-btn" onClick={() => removeFromCart(cartItemId || product.id)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Invoice Summary Box */}
        {cart.length > 0 && (
          <div className="billing-summary-card">
            <h3>Order Summary</h3>
            <div className="summary-line">
              <span>Items Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} items)</span>
              <span>₹{getCartTotal().toFixed(2)}</span>
            </div>
            <div className="summary-line">
              <span>Express Farm Direct Shipping</span>
              <span className="free-tag">FREE</span>
            </div>
            <hr className="divider" />
            <div className="summary-line grand-total-line">
              <span>Grand Total</span>
              <span className="grand-total-price">
                ₹{getCartTotal().toFixed(2)}
              </span>
            </div>

            <div className="billing-actions">
              <button className="checkout-now-btn" onClick={() => setIsCheckoutOpen(true)}>
                Proceed to Payment Gateway 💳
              </button>
              <button className="clear-cart-btn" onClick={clearCart}>
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default BillingPortal;
