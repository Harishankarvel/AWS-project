const BACKEND_BASE = 'http://localhost:8000';

const MOCK_CATALOGUE = [
  { id: 'apple', name: 'Apple', category: 'fruit', base_price: 2.5 },
  { id: 'banana', name: 'Banana', category: 'fruit', base_price: 1.8 },
  { id: 'carrot', name: 'Carrot', category: 'vegetable', base_price: 1.2 },
  { id: 'tomato', name: 'Tomato', category: 'vegetable', base_price: 1.5 }
];

export async function fetchCatalogue() {
  try {
    const res = await fetch(`${BACKEND_BASE}/catalogue`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn("Using mock catalogue fallback:", e);
  }
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_CATALOGUE), 300);
  });
}

export async function fetchRecommendation(payload) {
  try {
    const res = await fetch(`${BACKEND_BASE}/infer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn("Using mock recommendation fallback:", e);
  }
  return new Promise((resolve) => {
    const base = MOCK_CATALOGUE.find(item => item.name === payload.commodity)?.base_price || 2.0;
    const factor = 1 + (Math.random() * 0.2 - 0.1);
    setTimeout(() => resolve({ recommended_price: Number((base * factor).toFixed(2)) }), 400);
  });
}

export async function loginApi({ role, email, password }) {
  const res = await fetch(`${BACKEND_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, email, password })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Login failed');
  }
  return data;
}

export async function signupApi({ role, email, password, full_name, farm_name, district, phone }) {
  const res = await fetch(`${BACKEND_BASE}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, email, password, full_name, farm_name, district, phone })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Signup failed');
  }
  return data;
}

export async function saveOrderApi(orderPayload) {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });
    return await res.json();
  } catch (e) {
    console.warn("Failed to save order to MySQL:", e);
    return null;
  }
}

export async function fetchUserOrdersApi(userEmail) {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/orders/${encodeURIComponent(userEmail)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn("Failed to fetch user orders from MySQL:", e);
  }
  return [];
}

export async function saveSellerProductApi(productPayload) {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/seller/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productPayload)
    });
    return await res.json();
  } catch (e) {
    console.warn("Failed to save seller product to MySQL:", e);
    return null;
  }
}

export async function fetchSellerProductsApi(sellerEmail) {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/seller/products/${encodeURIComponent(sellerEmail)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn("Failed to fetch seller products from MySQL:", e);
  }
  return [];
}

