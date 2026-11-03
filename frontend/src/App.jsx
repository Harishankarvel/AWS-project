import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProductList from './components/ProductList';
import BillingPortal from './components/BillingPortal';
import AuthModal from './components/AuthModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AdminPortal from './components/AdminPortal';
import SellerPortal from './components/SellerPortal';
import OrdersModal from './components/OrdersModal';
import ProfileModal from './components/ProfileModal';
import './index.css';

function MainAppContent() {
  const { user } = useApp();

  // 1. Mandatory Gatekeeper: If not logged in, show the role-specific login portal first
  if (!user) {
    return (
      <div className="login-portal-wrapper">
        <AuthModal isFirstScreen={true} />
      </div>
    );
  }

  // 2. Seller Dedicated Workspace: Farmer / Seller only sees their produce, inventory, and crop listing
  if (user.role === 'seller') {
    return (
      <div className="App seller-app-layout">
        <Navbar />
        <main className="seller-main-container">
          <SellerPortal isStandalone={true} />
        </main>
        <ProfileModal />
        <footer className="app-footer">
          <p>© 2026 FarmFresh Mandi • Seller & Farmer Logistics Workspace</p>
        </footer>
      </div>
    );
  }

  // 3. Admin Dedicated Workspace: Admin only sees seasonal pricing controls, inflation regulator, and audit logs
  if (user.role === 'admin') {
    return (
      <div className="App admin-app-layout">
        <Navbar />
        <main className="admin-main-container">
          <AdminPortal isStandalone={true} />
        </main>
        <ProfileModal />
        <footer className="app-footer">
          <p>© 2026 FarmFresh Admin Control Panel • Macroeconomic Oversight</p>
        </footer>
      </div>
    );
  }

  // 4. Customer Dedicated Storefront: Customer only sees fresh catalog, cart, checkout, and order history
  return (
    <div className="App customer-app-layout">
      <Navbar />
      
      <div className="app-body-layout">
        <Sidebar />

        <main className="main-content">
          <section className="hero-banner">
            <div className="hero-text">
              <h1>🍎 Fresh Organic Farm Produce</h1>
              <p>Directly from verified local farmers with AI-recommended market rates & monthly demand tracking</p>
            </div>
          </section>

          <ProductList />
          <BillingPortal />
        </main>
      </div>

      <CartDrawer />
      <CheckoutModal />
      <OrdersModal />
      <ProfileModal />

      <footer className="app-footer">
        <p>© 2026 FarmFresh Market. All rights reserved. 🌿 100% Organic Certified Direct From Indian Farmers.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

export default App;
