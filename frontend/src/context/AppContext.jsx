import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_PRODUCTS, LANGUAGES } from '../data/mockData';
import { FESTIVE_SEASONS, calculateDynamicPrice } from '../data/festiveEngine';
import { translateProduceName } from '../data/produceDictionary';
import { registerProductTranslations } from '../data/translations';
import { 
  INITIAL_MACRO_FACTORS, 
  generateNextMacroCycle, 
  recalculateProductPriceWithInflation 
} from '../data/inflationEngine';
import { saveOrderApi, fetchUserOrdersApi, saveSellerProductApi, fetchSellerProductsApi } from '../api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Festive & Algorithmic Pricing Season State: 'regular' | 'pre_festive' | 'festive_sale' | 'harvest_flush'
  const [festiveSeason, setFestiveSeason] = useState(() => {
    return localStorage.getItem('f2c_festive_season') || 'festive_sale'; // Default to active Festive Sale for instant demonstration
  });

  // 2-Minute AI Price Inflation State & Macroeconomic Factors
  const [macroFactors, setMacroFactors] = useState(INITIAL_MACRO_FACTORS);
  const [secondsUntilNextInflation, setSecondsUntilNextInflation] = useState(120);
  const [inflationLogs, setInflationLogs] = useState([
    {
      id: 'init-1',
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      title: 'AI Inflation Engine Online',
      desc: 'Live 2-minute macroeconomic recalibration active. Monitoring CPI, fuel index & mandi supplies.'
    }
  ]);
  const [lastUpdatedTime, setLastUpdatedTime] = useState(() => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
  const [isRecalibrating, setIsRecalibrating] = useState(false);

  // Load products & stock from localStorage or default
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('f2c_products_v4');
    let loadedProducts = INITIAL_PRODUCTS;
    if (saved) {
      try {
        loadedProducts = JSON.parse(saved);
      } catch (e) {
        loadedProducts = INITIAL_PRODUCTS;
      }
    }
    // Remove obsolete versions
    localStorage.removeItem('f2c_products');
    localStorage.removeItem('f2c_products_v2');
    localStorage.removeItem('f2c_products_v3');

    // Rehydrate dynamic translations for any custom added products
    return loadedProducts.map(p => {
      if (p.id && p.id.startsWith('custom_')) {
        const trans = p.translations || translateProduceName(p.name);
        registerProductTranslations(p.id, trans);
        return {
          ...p,
          translations: trans
        };
      }
      return p;
    });
  });

  // Cart State: { product, quantity }
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('f2c_cart_v2');
    return saved ? JSON.parse(saved) : [];
  });

  // Helper to load account-specific orders
  const getStoredOrdersForUser = (userEmail) => {
    if (!userEmail) return [];
    const storageKey = `f2c_orders_${userEmail.toLowerCase().trim()}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    // Only provide sample demo order for the demo user 'user@farm.com'
    if (userEmail.toLowerCase().trim() === 'user@farm.com') {
      const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
      return [
        {
          id: 'ORD-IN-839201',
          date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          month: currentMonth,
          status: 'Delivered 🚚',
          paymentMethod: 'UPI',
          userEmail: 'user@farm.com',
          userName: 'Ananya Sharma',
          items: [
            { name: 'Red Delicious Apple', quantity: 2, price: 165, unit: 'kg', image: '🍎', seller: 'Himachal Apple Orchards' },
            { name: 'Organic Potato', quantity: 3, price: 28, unit: 'kg', image: '🥔', seller: 'Agra Potato Collective' }
          ],
          total: 414.00,
          address: { name: 'Ananya Sharma', city: 'Mumbai', pincode: '400001' }
        }
      ];
    }
    return [];
  };

  // Auth state: Fresh session always starts at the login page
  const [user, setUser] = useState(null);

  // Orders State: strictly isolated per user account
  const [orders, setOrders] = useState([]);

  // UI Modals
  const [isAuthOpen, setIsAuthOpen] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);
  const [isSellerPortalOpen, setIsSellerPortalOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Language
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('f2c_lang') || 'en';
  });

  // Search, Category, and Monthly Trend Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTrendFilter, setSelectedTrendFilter] = useState('all'); // 'all' | 'most_sold'

  // Persistent storage sync
  useEffect(() => {
    localStorage.setItem('f2c_products_v4', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('f2c_festive_season', festiveSeason);
  }, [festiveSeason]);

  // Core 2-Minute AI Price Inflation Execution Function
  const triggerInflationCycle = (isManual = false) => {
    setIsRecalibrating(true);

    setMacroFactors(prevMacro => {
      const nextMacro = generateNextMacroCycle(prevMacro);

      // Recalculate catalog prices using AI Macro factors
      setProducts(prevProds => {
        const updated = prevProds.map(prod => recalculateProductPriceWithInflation(prod, nextMacro));
        return updated;
      });

      // Synchronize active cart items with the new AI market prices
      setCart(prevCart => prevCart.map(item => {
        const currentProd = products.find(p => p.id === item.product.id);
        if (currentProd) {
          const fresh = recalculateProductPriceWithInflation(currentProd, nextMacro);
          const portion = item.selectedPortion || '1kg';
          const freshPortionPrice = portion === '200g' ? fresh.price200g :
                                    portion === '500g' ? fresh.price500g :
                                    fresh.price;
          return {
            ...item,
            product: fresh,
            unitPrice: freshPortionPrice
          };
        }
        return item;
      }));

      // Log the AI adjustment event
      const logEntry = {
        id: 'inf-' + Date.now(),
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        title: isManual ? '⚡ Manual AI Recalibration Triggered' : '⏱️ 2-Min Automated Price Recalibration',
        desc: `AI updated produce prices. Macro indicators: CPI Index ${nextMacro.cpiIndex} (${nextMacro.inflationTrend}), Fuel Index ${nextMacro.fuelIndex}, Mandi Supply arrival: ${(nextMacro.mandiArrivalFactor * 100).toFixed(0)}%.`
      };

      setInflationLogs(prev => [logEntry, ...prev.slice(0, 9)]);
      setLastUpdatedTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));

      return nextMacro;
    });

    setSecondsUntilNextInflation(120);
    setTimeout(() => {
      setIsRecalibrating(false);
    }, 900);
  };

  // 2-Minute Ticker Interval (120 seconds countdown)
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsUntilNextInflation(prev => {
        if (prev <= 1) {
          triggerInflationCycle(false);
          return 120;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [products]);

  // Dynamic Amazon-style Price Regulation: Recalculate AI recommended prices whenever festive season changes
  const applyFestiveSeason = (seasonId) => {
    setFestiveSeason(seasonId);
    setProducts(prevProducts => prevProducts.map(item => {
      const base = item.basePrice || item.price;
      const dynamic = calculateDynamicPrice(base, seasonId);
      return {
        ...item,
        price: dynamic.price,
        aiRecommendedPrice: dynamic.price,
        basePrice: dynamic.basePrice
      };
    }));
  };

  useEffect(() => {
    localStorage.setItem('f2c_cart_v2', JSON.stringify(cart));
  }, [cart]);

  // Persist orders partitioned strictly per user account
  useEffect(() => {
    if (user?.email) {
      const storageKey = `f2c_orders_${user.email.toLowerCase().trim()}`;
      localStorage.setItem(storageKey, JSON.stringify(orders));
    }
  }, [orders, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('f2c_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('f2c_user');
    }
  }, [user]);

  // Sync orders whenever the logged-in user changes (load from local storage and backend DB)
  useEffect(() => {
    if (!user?.email) {
      setOrders([]);
      return;
    }
    const localUserOrders = getStoredOrdersForUser(user.email);
    setOrders(localUserOrders);

    // Also attempt fetching from MySQL backend if available
    fetchUserOrdersApi(user.email).then(backendOrders => {
      if (backendOrders && Array.isArray(backendOrders) && backendOrders.length > 0) {
        setOrders(prev => {
          const map = new Map();
          // Backend orders first
          backendOrders.forEach(o => map.set(o.id, o));
          // Then any locally placed orders not yet synced
          prev.forEach(o => {
            if (!map.has(o.id)) map.set(o.id, o);
          });
          const merged = Array.from(map.values());
          const storageKey = `f2c_orders_${user.email.toLowerCase().trim()}`;
          localStorage.setItem(storageKey, JSON.stringify(merged));
          return merged;
        });
      }
    }).catch(() => {});
  }, [user?.email]);

  useEffect(() => {
    localStorage.setItem('f2c_lang', language);
  }, [language]);

  // Auth Functions
  const login = (email, password, role = 'user', extra = {}) => {
    const namePart = email.split('@')[0];
    const defaultName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const userObj = {
      email,
      name: extra.name || defaultName,
      farmName: extra.farmName || (role === 'seller' ? `${defaultName}'s Farm Produce` : undefined),
      role
    };
    setUser(userObj);
    // Load this specific user's orders immediately
    const userOrders = getStoredOrdersForUser(email);
    setOrders(userOrders);
    setIsAuthOpen(false);
    return userObj;
  };

  const logout = () => {
    setUser(null);
    setOrders([]);
    setIsAuthOpen(true);
    setIsAdminPortalOpen(false);
    setIsSellerPortalOpen(false);
    setIsOrdersOpen(false);
  };

  // Cart Functions with Weight Portion Support (200g, 500g, 1kg)
  const addToCart = (product, quantity = 1, selectedPortion = '1kg', customPrice = null) => {
    // Determine effective unit rate based on chosen portion (or custom rate)
    const portionRate = customPrice !== null ? customPrice : (
      selectedPortion === '200g' ? (product.price200g || Math.max(2, Math.round(product.price * 0.23))) :
      selectedPortion === '500g' ? (product.price500g || Math.max(3, Math.round(product.price * 0.52))) :
      product.price
    );

    const cartItemId = `${product.id}_${selectedPortion}`;

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        if (newQty > product.stock) {
          alert(`Sorry, only ${product.stock} items available in stock!`);
          return prev;
        }
        updated[existingIndex].quantity = newQty;
        return updated;
      } else {
        if (quantity > product.stock) {
          alert(`Sorry, only ${product.stock} items available in stock!`);
          return prev;
        }
        return [
          ...prev, 
          { 
            cartItemId,
            product, 
            quantity, 
            selectedPortion,
            unitPrice: portionRate
          }
        ];
      }
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (cartItemIdOrProdId, newQty) => {
    const item = cart.find(it => it.cartItemId === cartItemIdOrProdId || it.product.id === cartItemIdOrProdId);
    if (!item) return;

    const prod = products.find(p => p.id === item.product.id);
    if (prod && newQty > prod.stock) {
      alert(`Cannot add more. Only ${prod.stock} items available in stock!`);
      return;
    }
    if (newQty <= 0) {
      removeFromCart(item.cartItemId || item.product.id);
      return;
    }
    setCart(prev => prev.map(it => (it.cartItemId === item.cartItemId || it.product.id === item.product.id) ? { ...it, quantity: newQty } : it));
  };

  const removeFromCart = (cartItemIdOrProdId) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemIdOrProdId && item.product.id !== cartItemIdOrProdId));
  };

  const clearCart = () => setCart([]);

  // Orders Functions
  const placeOrder = (orderData) => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const targetEmail = (user?.email || 'guest@farm.com').toLowerCase().trim();
    const newOrder = {
      ...orderData,
      id: orderData.id || ('ORD-IN-' + Math.floor(100000 + Math.random() * 900000)),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      month: currentMonth,
      status: 'Order Placed (In Transit 🚚)',
      userEmail: targetEmail,
      userName: user?.name || orderData.address?.name || 'Customer'
    };

    // Increment monthlySales for purchased items
    setProducts(prev => prev.map(prod => {
      const purchased = orderData.items?.find(it => it.id === prod.id);
      if (purchased) {
        const updatedSales = (prod.monthlySales || 100) + purchased.quantity;
        return {
          ...prod,
          stock: Math.max(0, prod.stock - purchased.quantity),
          monthlySales: updatedSales,
          isBestSeller: updatedSales > 350,
          trend: updatedSales > 350 ? '🔥 Most Sold This Month' : prod.trend
        };
      }
      return prod;
    }));

    setOrders(prev => {
      const updated = [newOrder, ...prev];
      if (targetEmail) {
        localStorage.setItem(`f2c_orders_${targetEmail}`, JSON.stringify(updated));
      }
      return updated;
    });

    // Save order asynchronously into MySQL table user_orders_history
    saveOrderApi({
      order_id: newOrder.id,
      user_email: targetEmail,
      user_name: newOrder.userName,
      order_date: newOrder.date,
      order_month: newOrder.month,
      items: newOrder.items,
      total_amount: newOrder.total,
      payment_method: newOrder.paymentMethod,
      delivery_address: newOrder.address,
      order_status: newOrder.status
    }).catch(err => console.warn('Order sync to MySQL:', err));

    clearCart();
    return newOrder;
  };

  // Stock Management (Admin & Seller)
  const updateProductStock = (productId, newStock) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: Math.max(0, parseInt(newStock) || 0) } : p));
  };

  // Seller Product Creation & Rate Setting with Automatic Multi-Lingual Translation
  const addProduct = (newProduct) => {
    const sellerName = newProduct.seller || user?.farmName || user?.name || 'Verified Local Farmer';
    const priceVal = parseFloat(newProduct.price);
    const newId = 'custom_' + Date.now();

    // Automatically translate English crop/item name to Tamil, Hindi, Telugu, Spanish, French
    const autoTranslations = newProduct.translations || translateProduceName(newProduct.name);
    registerProductTranslations(newId, autoTranslations);

    const created = {
      ...newProduct,
      id: newId,
      translations: autoTranslations,
      price: priceVal,
      aiRecommendedPrice: priceVal,
      basePrice: Math.round(priceVal * 1.1),
      monthlySales: 10,
      stock: parseInt(newProduct.stock),
      seller: sellerName,
      rating: 5.0
    };
    setProducts(prev => [created, ...prev]);

    // Save newly listed crop into MySQL table seller_products
    saveSellerProductApi({
      product_id: newId,
      seller_email: (user?.email || 'seller@farm.com').toLowerCase().trim(),
      seller_name: sellerName,
      product_name: newProduct.name,
      category: newProduct.category || 'fruit',
      base_price: priceVal,
      stock_quantity: parseInt(newProduct.stock) || 0,
      unit: newProduct.unit || 'kg',
      image_icon: newProduct.image || '🌾'
    }).catch(e => console.warn('Sync seller product to MySQL:', e));

    return created;
  };

  const updateProductPrice = (productId, newPrice) => {
    const val = Math.max(0, parseFloat(newPrice) || 0);
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, price: val, aiRecommendedPrice: val } : p));
  };

  const deleteProduct = (productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + ((item.unitPrice !== undefined ? item.unitPrice : item.product.price) * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <AppContext.Provider value={{
      products,
      cart,
      orders,
      user,
      language,
      setLanguage,
      searchQuery,
      setSearchQuery,
      selectedCategory,
      setSelectedCategory,
      selectedTrendFilter,
      setSelectedTrendFilter,
      isAuthOpen,
      setIsAuthOpen,
      isCartOpen,
      setIsCartOpen,
      isCheckoutOpen,
      setIsCheckoutOpen,
      isAdminPortalOpen,
      setIsAdminPortalOpen,
      isSellerPortalOpen,
      setIsSellerPortalOpen,
      isOrdersOpen,
      setIsOrdersOpen,
      isProfileOpen,
      setIsProfileOpen,
      isSidebarOpen,
      setIsSidebarOpen,
      login,
      logout,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      placeOrder,
      updateProductStock,
      addProduct,
      updateProductPrice,
      deleteProduct,
      getCartTotal,
      getCartCount,
      festiveSeason,
      setFestiveSeason,
      applyFestiveSeason,
      FESTIVE_SEASONS,
      LANGUAGES,
      // 2-Minute Price Inflation Engine values
      macroFactors,
      secondsUntilNextInflation,
      inflationLogs,
      lastUpdatedTime,
      isRecalibrating,
      triggerInflationCycle
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
