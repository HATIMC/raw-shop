import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useStoreConfig } from './hooks/useStoreConfig';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import MyOrdersPage from './pages/MyOrdersPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const { config, loading, reload } = useStoreConfig();

  // Apply dynamic theme colors, favicon, and title
  useEffect(() => {
    if (config.primaryColor) {
      document.documentElement.style.setProperty('--color-primary', config.primaryColor);
    }
    if (config.secondaryColor) {
      document.documentElement.style.setProperty('--color-secondary', config.secondaryColor);
    }
    if (config.storeName) {
      document.title = config.storeName;
    }
    if (config.faviconPath) {
      let favicon = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = config.faviconPath;
    }
    // Load Google Font if specified
    if (config.storeNameFont) {
      const fontName = config.storeNameFont.replace(/ /g, '+');
      let fontLink = document.querySelector("link[href*='fonts.googleapis.com']") as HTMLLinkElement;
      if (!fontLink) {
        fontLink = document.createElement('link');
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);
      }
      fontLink.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;700&display=swap`;
    }
  }, [config]);

  // Add keyboard shortcut to reload config (Ctrl/Cmd + Shift + R)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'r') {
        e.preventDefault();
        console.log('🔄 Reloading config...');
        reload();
        window.location.reload();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [reload]);

  // Scroll to top on route change (ensures new pages start at the top on mobile & desktop)
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (config.maintenanceMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Under Maintenance</h1>
          <p className="text-gray-600 mb-8">
            We're currently performing scheduled maintenance. Please check back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
        <Route path="/my-orders" element={<MyOrdersPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
