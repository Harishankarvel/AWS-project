import React from 'react';
import { useApp } from '../context/AppContext';
import { getProductName } from '../data/translations';

const CartDrawer = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    getCartTotal,
    setIsCheckoutOpen,
    language,
  } = useApp();

  if (!isCartOpen) return null;

  const handleProceedCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsCartOpen(false)}>
      <div className="cart-drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <h3>🛒 Shopping Cart ({cart.length} items)</h3>
          <button className="close-modal" onClick={() => setIsCartOpen(false)}>✕</button>
        </div>

        <div className="drawer-body">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <span className="empty-icon">🥬</span>
              <p>Your cart is empty!</p>
              <span className="empty-sub">Add fresh produce to start shopping</span>
            </div>
          ) : (
            <div className="cart-items-list">
              {cart.map((item) => {
                const { product, quantity, selectedPortion, unitPrice, cartItemId } = item;
                const effectiveRate = unitPrice !== undefined ? unitPrice : product.price;
                const portionTag = selectedPortion || product.unit;

                return (
                  <div key={cartItemId || product.id} className="cart-item-card">
                    <span className="cart-item-emoji">{product.image}</span>
                    <div className="cart-item-details">
                      <h4>{getProductName(product, language) || product.name}</h4>
                      <span className="item-seller-mini">🌾 {product.seller || 'Local Farmer'}</span>
                      <span className="item-unit-price">
                        <strong>{portionTag}</strong> • ₹{effectiveRate.toFixed(2)}
                      </span>
                      <span className="item-stock-info">Stock: {product.stock} left</span>
                    </div>

                    <div className="quantity-controls">
                      <button onClick={() => updateCartQuantity(cartItemId || product.id, quantity - 1)}>-</button>
                      <span>{quantity}</span>
                      <button 
                        onClick={() => updateCartQuantity(cartItemId || product.id, quantity + 1)}
                        disabled={quantity >= product.stock}
                      >+</button>
                    </div>

                    <div className="item-total-price">
                      ₹{(effectiveRate * quantity).toFixed(2)}
                    </div>

                    <button className="remove-item-btn" onClick={() => removeFromCart(cartItemId || product.id)}>
                      🗑️
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="drawer-footer">
            <div className="cart-summary-row">
              <span>Subtotal:</span>
              <strong>₹{getCartTotal().toFixed(2)}</strong>
            </div>
            <div className="cart-summary-row delivery-row">
              <span>Delivery Fee:</span>
              <span className="free-delivery">FREE</span>
            </div>
            <div className="cart-summary-row total-row">
              <span>Total Amount:</span>
              <span className="final-price">₹{getCartTotal().toFixed(2)}</span>
            </div>

            <button className="primary-btn checkout-btn" onClick={handleProceedCheckout}>
              Proceed to Payment & Checkout ➔
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
