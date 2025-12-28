import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getRuntimeConfig } from '@/services/csvService';

interface LayoutProps {
  children: ReactNode;
  config?: Record<string, string>;
}

export default function Layout({ children, config = {} }: LayoutProps) {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Resolve image paths coming from config (which are stored as relative paths like '/images/..').
  // For local Admin (dev), resolve to the API host so images can be previewed. For hosted Admin, avoid
  // attempting to fetch images from local/private hosts (this would trigger PNA/CORS errors).
  const resolveConfigImage = (p?: string | null) => {
    if (!p) return null;
    const adminOrigin = typeof window !== 'undefined' ? window.location.origin || '' : '';
    const isAdminLocal = adminOrigin.includes('localhost') || adminOrigin.startsWith('file://');

    try {
      if (p.startsWith('http')) {
        const host = new URL(p).host;
        const isLocalHost = /^(localhost|127\.|10\.|192\.168\.|172\.)/i.test(host);
        if (isLocalHost && !isAdminLocal) return null; // don't try to load local-only URL from hosted admin
        return p;
      }
    } catch (e) {
      // malformed URL, continue
    }

    // p is a relative path like /images/foo.png
    if (!isAdminLocal) {
      // hosted Admin cannot fetch the local API's images until they are deployed
      return null;
    }

    const API_URL = getRuntimeConfig().API_URL.replace(/\/$/, '');
    return p.startsWith('/') ? `${API_URL}${p}` : `${API_URL}/${p}`;
  };

  const navigation = [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Orders', path: '/orders', icon: '🛒' },
    { name: 'Config', path: '/config', icon: '⚙️' },
    { name: 'Products', path: '/products', icon: '📦' },
    { name: 'Categories', path: '/categories', icon: '📁' },
    { name: 'Shipping', path: '/shipping', icon: '🚚' },
    { name: 'Discounts', path: '/discounts', icon: '💰' },
    { name: 'Taxes', path: '/taxes', icon: '📄' },
    { name: 'SEO', path: '/seo', icon: '🔍' },
    { name: 'Images', path: '/images', icon: '🖼️' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
            className="p-2 text-2xl text-gray-700"
          >
            ☰
          </button>

          <div className="flex items-center gap-3">
            {resolveConfigImage(config.logo_path) && (
              <img
                src={resolveConfigImage(config.logo_path) || ''}
                alt="Logo"
                className="h-8 object-contain"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            )}
            <span className="font-semibold">{config.store_name || 'Shop Admin'}</span>
          </div>

          <button
            aria-label="Logout"
            onClick={logout}
            className="p-2 text-xl text-gray-700"
          >
            🚪
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />

          <aside className="relative w-64 bg-gray-900 text-white h-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {resolveConfigImage(config.logo_path) && (
                  <img
                    src={resolveConfigImage(config.logo_path) || ''}
                    alt="Logo"
                    className="h-8 object-contain"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                )}
                <h2 className="font-bold text-lg">{config.store_name || 'Shop Admin'}</h2>
              </div>
              <button aria-label="Close menu" onClick={() => setMobileOpen(false)} className="text-2xl">×</button>
            </div>

            <nav className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>

            <div className="absolute bottom-6 left-6 right-6">
              <button
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
              >
                <span className="text-xl">🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-gray-900 text-white flex-col">
        <div className="p-6">
          {resolveConfigImage(config.logo_path) && (
            <img
              src={resolveConfigImage(config.logo_path) || ''}
              alt="Logo"
              className="h-10 object-contain mb-3"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          )}
          <h1
            className="text-2xl font-bold"
            style={{
              fontFamily: config.store_name_font ? `'${config.store_name_font}', sans-serif` : undefined,
              fontSize: config.store_name_font_size ? `${config.store_name_font_size}px` : undefined,
            }}
          >
            {config.store_name || 'Shop Admin'}
          </h1>
          <p className="text-sm text-gray-400 mt-1">{config.currency_symbol || '$'} Portal Manager</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <span className="text-xl">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16 md:pt-8">
        <div className="max-w-7xl mx-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
