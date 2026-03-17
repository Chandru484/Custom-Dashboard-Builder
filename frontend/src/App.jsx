import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ConfigureDashboard from './pages/ConfigureDashboard';
import CustomerOrders from './pages/CustomerOrders';
import ProductManagement from './pages/ProductManagement';

const NAV_LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/orders', label: 'Customer Orders' },
  { to: '/products', label: 'Manage Products' },
];

const TopNavigation = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

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
            fontSize: '1.2rem',
            color: '#4f46e5',
            letterSpacing: '-0.04em',
            flexShrink: 0,
          }}>Dashboard Builder</span>

          {/* Desktop nav links — hidden on mobile via CSS */}
          <div className="nav-desktop-links" style={{ display: 'flex', gap: '0.25rem' }}>
            {NAV_LINKS.map(({ to, label }) => {
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
                      fontWeight: active ? 600 : 500,
                      color: active ? '#4f46e5' : '#64748b',
                      background: active ? '#eef2ff' : 'transparent',
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
          {location.pathname !== '/configure' && (
            <Link
              to="/configure"
              className="btn btn-primary nav-main-cta"
              style={{ textDecoration: 'none', fontSize: '0.8rem', padding: '0.45rem 1rem' }}
            >
              <span className="cta-text-desktop">Configure Dashboard</span>
              <span className="cta-text-mobile">Configure</span>
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
        {NAV_LINKS.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={isActive(to) ? 'active' : ''}
            onClick={() => setMobileOpen(false)}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

/* Hide desktop links on mobile & hamburger on desktop */
const responsiveNavStyle = `
  @media (max-width: 1024px) {
    .nav-desktop-links { display: none !important; }
    .cta-text-desktop  { display: none !important; }
    .cta-text-mobile   { display: inline !important; }
    .nav-hamburger     { display: flex !important; }
    .nav-main-cta      { padding: 0.4rem 0.75rem !important; font-size: 0.75rem !important; }
  }
  @media (min-width: 1025px) {
    .cta-text-mobile { display: none !important; }
  }
`;

import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <style>{responsiveNavStyle}</style>
        <div className="app-container">
          <TopNavigation />
          <main style={{ padding: '1.5rem' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/orders" element={<CustomerOrders />} />
              <Route path="/configure" element={<ConfigureDashboard />} />
              <Route path="/products" element={<ProductManagement />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
