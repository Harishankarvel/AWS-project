import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { loginApi, signupApi } from '../api';

const AuthModal = ({ isFirstScreen = false, fixedRole = null }) => {
  const { isAuthOpen, setIsAuthOpen, login } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  // Default role or strictly fixed role
  const [role, setRole] = useState(fixedRole || 'user'); // 'user' | 'seller' | 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [farmName, setFarmName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('North');
  const [statusMsg, setStatusMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isFirstScreen && !isAuthOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setStatusMsg({ type: 'error', text: 'Please fill in both email and password.' });
      return;
    }
    setLoading(true);
    setStatusMsg(null);

    const activeRole = fixedRole || role;

    try {
      if (isSignUp) {
        const res = await signupApi({
          role: activeRole,
          email,
          password,
          full_name: name || email.split('@')[0],
          farm_name: farmName,
          district,
          phone
        });
        setStatusMsg({ type: 'success', text: `Registration successful! Welcome, ${res.user.name}.` });
        setTimeout(() => {
          login(res.user.email, password, res.user.role, res.user);
        }, 1000);
      } else {
        const res = await loginApi({ role: activeRole, email, password });
        setStatusMsg({ type: 'success', text: `Login successful! Welcome back, ${res.user.name}.` });
        setTimeout(() => {
          login(res.user.email, password, res.user.role, res.user);
        }, 800);
      }
    } catch (err) {
      const errMsg = err.message || '';
      if (errMsg.toLowerCase().includes('not found') || errMsg.toLowerCase().includes('please sign up')) {
        setStatusMsg({
          type: 'error',
          text: `Account not found for ${activeRole.toUpperCase()} credentials in database. Please click "Sign Up" below to create your account.`
        });
        setIsSignUp(true);
      } else if (errMsg.toLowerCase().includes('connection') || errMsg.toLowerCase().includes('failed to fetch')) {
        setStatusMsg({
          type: 'error',
          text: `⚠️ Cannot connect to backend server (http://localhost:8000). Ensure the backend is running so MySQL can authenticate your account.`
        });
      } else {
        setStatusMsg({ type: 'error', text: errMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  const DEMO_SELLERS = [
    { label: '🌾 Kisan Agro Collective (6 items)', name: 'Ramesh Patel', email: 'kisan.agro@farm.com', farm: 'Kisan Agro Collective', district: 'West' },
    { label: '🌾 Sahyadri Agri Farmer Co. (5 items)', name: 'Dnyaneshwar Patil', email: 'sahyadri.agri@farm.com', farm: 'Sahyadri Agri Farmer Co.', district: 'West' },
    { label: '🌾 Himachal Apple Orchards', name: 'Rajesh Sharma', email: 'himachal.apple@farm.com', farm: 'Himachal Apple Orchards', district: 'North' },
    { label: '🌾 Ratnagiri Farms', name: 'Suresh Desai', email: 'ratnagiri.farms@farm.com', farm: 'Ratnagiri Farms', district: 'West' },
    { label: '🌾 Kashmir Valley Growers', name: 'Ghulam Mohammad', email: 'kashmir.valley@farm.com', farm: 'Kashmir Valley Growers', district: 'North' },
    { label: '🌾 Ooty Organic Roots', name: 'Sivasankar M.', email: 'ooty.roots@farm.com', farm: 'Ooty Organic Roots', district: 'South' }
  ];

  const fillQuickDemo = (demoRole) => {
    setStatusMsg(null);
    setRole(demoRole);
    if (demoRole === 'admin') {
      setEmail('admin@farm.com');
      setPassword('admin123');
      setName('Platform Admin');
    } else if (demoRole === 'seller') {
      const s = DEMO_SELLERS[0];
      setEmail(s.email);
      setPassword('seller123');
      setName(s.name);
      setFarmName(s.farm);
      setDistrict(s.district);
    } else {
      setEmail('user@farm.com');
      setPassword('user123');
      setName('Ananya Sharma');
    }
  };

  const activeRole = fixedRole || role;

  return (
    <div className={`modal-backdrop ${isFirstScreen ? 'first-screen-backdrop' : ''}`} onClick={() => !isFirstScreen && setIsAuthOpen(false)}>
      <div className="modal-content auth-modal" onClick={e => e.stopPropagation()}>
        {!isFirstScreen && (
          <button className="close-modal" onClick={() => setIsAuthOpen(false)}>✕</button>
        )}
        
        <h2>{isSignUp ? `✨ Create ${activeRole.toUpperCase()} Account` : `🔑 ${activeRole.toUpperCase()} Login`}</h2>
        <p className="modal-subtitle">
          {isSignUp 
            ? `Register into MySQL table: '${activeRole}_credentials'` 
            : `Authenticate against MySQL table: '${activeRole}_credentials'`}
        </p>

        {/* Dedicated Portal Selector Tabs */}
        {!fixedRole && (
          <div className="role-selector three-roles">
            <label className={`role-tab ${role === 'user' ? 'active' : ''}`}>
              <input type="radio" value="user" checked={role === 'user'} onChange={() => { setRole('user'); setStatusMsg(null); }} />
              👤 Customer Portal
            </label>
            <label className={`role-tab ${role === 'seller' ? 'active' : ''}`}>
              <input type="radio" value="seller" checked={role === 'seller'} onChange={() => { setRole('seller'); setStatusMsg(null); }} />
              🌾 Seller Portal
            </label>
            <label className={`role-tab ${role === 'admin' ? 'active' : ''}`}>
              <input type="radio" value="admin" checked={role === 'admin'} onChange={() => { setRole('admin'); setStatusMsg(null); }} />
              👑 Admin Portal
            </label>
          </div>
        )}

        {/* Quick Demo Pre-fill */}
        <div className="demo-accounts">
          <span>Quick Pre-fill Credentials:</span>
          <div className="demo-buttons">
            <button type="button" onClick={() => fillQuickDemo('user')}>👤 Customer</button>
            <button type="button" onClick={() => fillQuickDemo('seller')}>🌾 Seller</button>
            <button type="button" onClick={() => fillQuickDemo('admin')}>👑 Admin</button>
          </div>
          {role === 'seller' && (
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.82rem', color: '#8b949e' }}>Choose Farm Seller:</span>
              <select 
                onChange={(e) => {
                  const s = DEMO_SELLERS[parseInt(e.target.value)];
                  if (s) {
                    setEmail(s.email);
                    setPassword('seller123');
                    setName(s.name);
                    setFarmName(s.farm);
                    setDistrict(s.district);
                  }
                }}
                style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #30363d', background: '#161b22', color: '#7ee787', fontSize: '0.85rem' }}
              >
                {DEMO_SELLERS.map((s, idx) => (
                  <option key={s.email} value={idx}>{s.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {statusMsg && (
          <div style={{
            margin: '12px 0',
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '0.9rem',
            backgroundColor: statusMsg.type === 'success' ? '#d4edda' : '#f8d7da',
            color: statusMsg.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${statusMsg.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignUp && (
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                placeholder="Enter full name"
                value={name} 
                onChange={e => setName(e.target.value)} 
                required
              />
            </div>
          )}

          {isSignUp && (
            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="tel" 
                placeholder="e.g. +91 9876543210"
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
              />
            </div>
          )}

          {activeRole === 'seller' && (
            <div className="form-group">
              <label>Farm / Mandi Name {isSignUp ? '' : '(Optional)'}</label>
              <input 
                type="text" 
                placeholder="e.g. Green Valley Agro Farms"
                value={farmName} 
                onChange={e => setFarmName(e.target.value)} 
              />
            </div>
          )}

          {isSignUp && activeRole === 'seller' && (
            <div className="form-group">
              <label>District / Mandi Zone</label>
              <select value={district} onChange={e => setDistrict(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #30363d', background: '#0d1117', color: '#fff' }}>
                <option value="North">North Zone</option>
                <option value="South">South Zone</option>
                <option value="East">East Zone</option>
                <option value="West">West Zone</option>
                <option value="Central">Central Zone</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="e.g. name@domain.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required
            />
          </div>

          <button type="submit" className="primary-btn submit-btn" disabled={loading}>
            {loading ? 'Verifying with MySQL...' : (isSignUp ? `Register as ${activeRole.toUpperCase()}` : `Login to ${activeRole.toUpperCase()} Portal`)}
          </button>
        </form>

        <div className="auth-toggle">
          {isSignUp ? (
            <p>Already registered in database? <span onClick={() => { setIsSignUp(false); setStatusMsg(null); }}>Login here</span></p>
          ) : (
            <p>Don't have an account in database? <span onClick={() => { setIsSignUp(true); setStatusMsg(null); }}>Sign up now</span></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
