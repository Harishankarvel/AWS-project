import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

// Multilingual translations dictionary for checkout portal
const TRANSLATIONS = {
  en: {
    title: "Secure Payment Portal",
    subtitle: "Select your preferred payment method & language",
    shippingTitle: "Delivery Address",
    paymentTitle: "Payment Options",
    upiLabel: "UPI / QR Code (GPay, PhonePe, Paytm)",
    cardLabel: "Credit / Debit Card",
    netbankLabel: "Net Banking",
    codLabel: "Cash on Delivery (COD)",
    upiPlaceholder: "Enter UPI ID (e.g. user@upi)",
    cardNumber: "Card Number",
    expiry: "Expiry Date",
    cvv: "CVV",
    placeOrder: "Pay & Place Order",
    successTitle: "🎉 Order Placed Successfully!",
    successMsg: "Thank you for shopping! Your fresh produce will be delivered shortly.",
    orderId: "Order ID:",
    close: "Back to Shopping"
  },
  hi: {
    title: "सुरक्षित भुगतान पोर्टल",
    subtitle: "अपनी पसंदीदा भुगतान विधि और भाषा चुनें",
    shippingTitle: "डिलीवरी का पता",
    paymentTitle: "भुगतान के विकल्प",
    upiLabel: "यूपीआई / क्यूआर (GPay, PhonePe, Paytm)",
    cardLabel: "क्रेडिट / डेबिट कार्ड",
    netbankLabel: "नेट बैंकिंग",
    codLabel: "कैश ऑन डिलीवरी (COD)",
    upiPlaceholder: "यूपीआई आईडी दर्ज करें",
    cardNumber: "कार्ड संख्या",
    expiry: "समाप्ति तिथि",
    cvv: "सीवीवी",
    placeOrder: "भुगतान करें और ऑर्डर दें",
    successTitle: "🎉 ऑर्डर सफलतापूर्वक दिया गया!",
    successMsg: "खरीदारी के लिए धन्यवाद! आपकी ताजा उपज जल्द ही पहुंचा दी जाएगी।",
    orderId: "ऑर्डर आईडी:",
    close: "खरीदारी पर वापस जाएं"
  },
  ta: {
    title: "பாதுகாப்பான கட்டண தளம்",
    subtitle: "விருப்பமான கட்டண முறை மற்றும் மொழியைத் தேர்ந்தெடுக்கவும்",
    shippingTitle: "டெலிவரி முகவரி",
    paymentTitle: "கட்டண முறைகள்",
    upiLabel: "UPI / QR (GPay, PhonePe, Paytm)",
    cardLabel: "கிரெடிட் / டெபிட் கார்டு",
    netbankLabel: "நெட் பேங்கிங்",
    codLabel: "கேஷ் ஆன் டெலிவரி (COD)",
    upiPlaceholder: "UPI ஐடியை உள்ளிடவும்",
    cardNumber: "கார்டு எண்",
    expiry: "காலாவதி தேதி",
    cvv: "CVV",
    placeOrder: "பணம் செலுத்தி ஆர்டர் செய்யவும்",
    successTitle: "🎉 ஆர்டர் வெற்றிகரமாக செய்யப்பட்டது!",
    successMsg: "வாங்கியதற்கு நன்றி! உங்களின் புதிய காய்கறிகள் விரைவில் விநியோகிக்கப்படும்.",
    orderId: "ஆர்டர் ஐடி:",
    close: "மீண்டும் கடையில் வாங்கவும்"
  },
  te: {
    title: "సురక్షిత చెల్లింపు పోర్టల్",
    subtitle: "మీ ప్రాధాన్యత ఆధారంగా చెల్లింపు పద్ధతి & భాషను ఎంచుకోండి",
    shippingTitle: "డెలివరీ చిరునామా",
    paymentTitle: "చెల్లింపు ఎంపికలు",
    upiLabel: "UPI / QR కోడ్ (GPay, PhonePe, Paytm)",
    cardLabel: "క్రెడిట్ / డెబిట్ కార్డ్",
    netbankLabel: "నెట్ బ్యాంకింగ్",
    codLabel: "క్యాష్ ఆన్ డెలివరీ (COD)",
    upiPlaceholder: "UPI ఐడీ ఎంటర్ చేయండి",
    cardNumber: "కార్డ్ సంఖ్య",
    expiry: "గడువు తేదీ",
    cvv: "CVV",
    placeOrder: "చెల్లించి ఆర్డర్ చేయండి",
    successTitle: "🎉 ఆర్డర్ విజయవంతంగా పూర్తయింది!",
    successMsg: "షాపింగ్ చేసినందుకు ధన్యవాదాలు! మీ తాజా పండ్లు త్వరలోనే డెలివరీ చేయబడతాయి.",
    orderId: "ఆర్డర్ ఐడీ:",
    close: "షాపింగ్‌కు తిరిగి వెళ్లండి"
  },
  es: {
    title: "Portal de Pago Seguro",
    subtitle: "Seleccione su método de pago e idioma preferido",
    shippingTitle: "Dirección de Entrega",
    paymentTitle: "Opciones de Pago",
    upiLabel: "UPI / Código QR",
    cardLabel: "Tarjeta de Crédito / Débito",
    netbankLabel: "Banca en Línea",
    codLabel: "Pago Contra Entrega (COD)",
    upiPlaceholder: "Ingrese ID de UPI",
    cardNumber: "Número de Tarjeta",
    expiry: "Fecha de Vencimiento",
    cvv: "CVV",
    placeOrder: "Pagar y Realizar Pedido",
    successTitle: "🎉 ¡Pedido Realizado con Éxito!",
    successMsg: "¡Gracias por su compra! Sus productos frescos llegarán pronto.",
    orderId: "ID de Pedido:",
    close: "Volver a la Tienda"
  },
  fr: {
    title: "Portail de Paiement Sécurisé",
    subtitle: "Sélectionnez votre mode de paiement et votre langue",
    shippingTitle: "Adresse de Livraison",
    paymentTitle: "Options de Paiement",
    upiLabel: "UPI / Code QR",
    cardLabel: "Carte de Crédit / Débito",
    netbankLabel: "Banque en Ligne",
    codLabel: "Paiement à la Livraison (COD)",
    upiPlaceholder: "Entrez l'identifiant UPI",
    cardNumber: "Numéro de Carte",
    expiry: "Date d'expiration",
    cvv: "CVV",
    placeOrder: "Payer et Passer la Commande",
    successTitle: "🎉 Commande Passée avec Succès!",
    successMsg: "Merci pour votre achat! Vos produits frais arriveront bientôt.",
    orderId: "ID de Commande:",
    close: "Retour au Magasin"
  }
};

const CheckoutModal = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    getCartTotal,
    placeOrder,
    setIsOrdersOpen,
    language,
    setLanguage,
    LANGUAGES
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isOrdered, setIsOrdered] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [address, setAddress] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    pincode: ''
  });

  if (!isCheckoutOpen) return null;

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const grandTotal = getCartTotal().toFixed(2);

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    const newOrderId = 'ORD-IN-' + Math.floor(100000 + Math.random() * 900000);
    
    // Construct items array for persistent history
    const orderItems = cart.map(item => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      unit: item.product.unit,
      image: item.product.image,
      seller: item.product.seller
    }));

    placeOrder({
      id: newOrderId,
      items: orderItems,
      total: parseFloat(grandTotal),
      paymentMethod: paymentMethod.toUpperCase(),
      address: { ...address }
    });

    setOrderId(newOrderId);
    setIsOrdered(true);
  };

  const handleClose = () => {
    setIsOrdered(false);
    setIsCheckoutOpen(false);
  };

  const handleViewOrdersFromSuccess = () => {
    setIsOrdered(false);
    setIsCheckoutOpen(false);
    setIsOrdersOpen(true);
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content checkout-modal" onClick={e => e.stopPropagation()}>
        <button className="close-modal" onClick={handleClose}>✕</button>

        {isOrdered ? (
          <div className="order-success-view">
            <span className="success-emoji">🎉</span>
            <h2>{t.successTitle}</h2>
            <p className="success-msg">{t.successMsg}</p>
            <div className="order-receipt">
              <p><strong>{t.orderId}</strong> {orderId}</p>
              <p><strong>Total Paid:</strong> ₹{grandTotal}</p>
              <p><strong>Payment Method:</strong> {paymentMethod.toUpperCase()}</p>
              <p><strong>Estimated Delivery:</strong> Within 2 hours directly from farm 🚚</p>
            </div>
            <div className="success-action-buttons">
              <button className="view-orders-btn-success" onClick={handleViewOrdersFromSuccess}>
                📦 View Placed Orders
              </button>
              <button className="primary-btn" onClick={handleClose}>{t.close}</button>
            </div>
          </div>
        ) : (
          <>
            <div className="checkout-header">
              <h2>💳 {t.title}</h2>
              <p>{t.subtitle}</p>

              {/* Language switcher inside portal */}
              <div className="portal-lang-switcher">
                <span>Preferred Language:</span>
                <select value={language} onChange={e => setLanguage(e.target.value)}>
                  {LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <form onSubmit={handlePlaceOrder} className="checkout-form">
              <div className="checkout-sections">
                {/* Shipping Details */}
                <div className="checkout-section">
                  <h3>📦 {t.shippingTitle}</h3>
                  <div className="form-group">
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      required 
                      value={address.name}
                      onChange={e => setAddress({ ...address, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <input 
                      type="tel" 
                      placeholder="10-digit Mobile Number" 
                      required 
                      value={address.phone}
                      onChange={e => setAddress({ ...address, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <input 
                      type="text" 
                      placeholder="Street Address, House / Flat No." 
                      required 
                      value={address.street}
                      onChange={e => setAddress({ ...address, street: e.target.value })}
                    />
                  </div>
                  <div className="form-row">
                    <input 
                      type="text" 
                      placeholder="City / Town" 
                      required 
                      value={address.city}
                      onChange={e => setAddress({ ...address, city: e.target.value })}
                    />
                    <input 
                      type="text" 
                      placeholder="PIN Code (6 digits)" 
                      required 
                      value={address.pincode}
                      onChange={e => setAddress({ ...address, pincode: e.target.value })}
                    />
                  </div>
                </div>

                {/* Payment Option */}
                <div className="checkout-section">
                  <h3>💰 {t.paymentTitle}</h3>
                  <div className="payment-options">
                    <label className={`payment-tab ${paymentMethod === 'upi' ? 'selected' : ''}`}>
                      <input 
                        type="radio" 
                        name="pay" 
                        value="upi" 
                        checked={paymentMethod === 'upi'} 
                        onChange={() => setPaymentMethod('upi')}
                      />
                      📱 {t.upiLabel}
                    </label>

                    <label className={`payment-tab ${paymentMethod === 'card' ? 'selected' : ''}`}>
                      <input 
                        type="radio" 
                        name="pay" 
                        value="card" 
                        checked={paymentMethod === 'card'} 
                        onChange={() => setPaymentMethod('card')}
                      />
                      💳 {t.cardLabel}
                    </label>

                    <label className={`payment-tab ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                      <input 
                        type="radio" 
                        name="pay" 
                        value="cod" 
                        checked={paymentMethod === 'cod'} 
                        onChange={() => setPaymentMethod('cod')}
                      />
                      💵 {t.codLabel}
                    </label>
                  </div>

                  {paymentMethod === 'upi' && (
                    <div className="payment-field-box">
                      <input type="text" placeholder={t.upiPlaceholder} required />
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="payment-field-box">
                      <input type="text" placeholder={t.cardNumber} maxLength="16" required />
                      <div className="form-row">
                        <input type="text" placeholder={t.expiry} maxLength="5" required />
                        <input type="password" placeholder={t.cvv} maxLength="3" required />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Total & Submit */}
              <div className="checkout-summary-footer">
                <div className="summary-total-display">
                  <span>Total Payable Amount:</span>
                  <h3>₹{grandTotal}</h3>
                </div>
                <button type="submit" className="primary-btn pay-submit-btn">
                  {t.placeOrder} (₹{grandTotal}) ➔
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
