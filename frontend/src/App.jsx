import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ConfigureDashboard from './pages/ConfigureDashboard';
import CustomerOrders from './pages/CustomerOrders';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Settings from './pages/Settings';
import ProductManagement from './pages/ProductManagement';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
  
  return children;
};

const NAV_LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/orders', label: 'Customer Orders' },
  { to: '/settings', label: 'Settings' },
  { to: '/products', label: 'Manage Products', adminOnly: true },
];

const TopNavigation = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  if (!user) return null; // Hide nav if not logged in

  return (
    <nav
      className="glass-panel"
      style={{ position: 'sticky', top: 0, zIndex: 100 }}
    >
      {/* Desktop / main bar */}
      <div style={{
        padding: '0 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '56px',
      }}>
        {/* Left: logo + links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <span style={{
            fontWeight: 800,
            fontSize: '1.15rem',
            color: 'var(--primary)',
            letterSpacing: '-0.04em',
            flexShrink: 0,
          }}>Halleyx</span>

          {/* Desktop nav links — hidden on mobile via CSS */}
          <div className="nav-desktop-links" style={{ display: 'flex', gap: '0.25rem' }}>
            {NAV_LINKS.filter(link => !link.adminOnly || user?.role === 'admin').map(({ to, label }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  style={{
                    textDecoration: 'none',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    fontWeight: active ? 600 : 450,
                    color: active ? 'var(--primary)' : 'var(--text-muted)',
                    background: active ? 'var(--primary-light)' : 'transparent',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: CTA (desktop) + hamburger (mobile) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="nav-user-info" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</span>
            <button 
              onClick={logout}
              style={{ 
                background: 'none', 
                border: '1px solid var(--border)', 
                padding: '0.25rem 0.75rem', 
                borderRadius: '6px', 
                fontSize: '0.8rem', 
                cursor: 'pointer' 
              }}
            >
              Logout
            </button>
          </div>

          {location.pathname !== '/configure' && (
            <Link
              to="/configure"
              className="btn btn-primary nav-cta-desktop"
              style={{ textDecoration: 'none', fontSize: '0.8rem', padding: '0.45rem 1rem' }}
            >
              Configure Dashboard
            </Link>
          )}

          {/* Hamburger — shown on mobile via CSS */}
          <button
            className="nav-hamburger"
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen((o) => !o)}
          >
            <span style={mobileOpen ? { transform: 'rotate(45deg) translate(4px, 4px)' } : {}} />
            <span style={mobileOpen ? { opacity: 0 } : {}} />
            <span style={mobileOpen ? { transform: 'rotate(-45deg) translate(4px, -4px)' } : {}} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <div className={`nav-mobile-menu${mobileOpen ? ' open' : ''}`}>
        {NAV_LINKS.filter(link => !link.adminOnly || user?.role === 'admin').map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={isActive(to) ? 'active' : ''}
            onClick={() => setMobileOpen(false)}
          >
            {label}
          </Link>
        ))}
        {location.pathname !== '/configure' && (
          <div className="nav-mobile-cta">
            <Link
              to="/configure"
              className="btn btn-primary"
              style={{ textDecoration: 'none', fontSize: '0.875rem', width: '100%', justifyContent: 'center' }}
              onClick={() => setMobileOpen(false)}
            >
              Configure Dashboard
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

/* Hide desktop links on mobile & hamburger on desktop */
const responsiveNavStyle = `
  @media (max-width: 640px) {
    .nav-desktop-links { display: none !important; }
    .nav-cta-desktop   { display: none !important; }
    .nav-hamburger     { display: flex !important; }
  }
`;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <style>{responsiveNavStyle}</style>
        <div className="app-container">
          <TopNavigation />
          <main style={{ padding: '1.5rem' }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/admin/login" element={<Login isAdmin={true} />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/orders" element={
                <ProtectedRoute>
                  <CustomerOrders />
                </ProtectedRoute>
              } />

              <Route path="/configure" element={
                <ProtectedRoute>
                  <ConfigureDashboard />
                </ProtectedRoute>
              } />

              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />

              <Route path="/products" element={
                <ProtectedRoute isAdminOnly={true}>
                  <ProductManagement />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
