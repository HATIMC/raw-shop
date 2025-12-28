import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import { readCSV } from './services/csvService';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ConfigEditor from './pages/ConfigEditor';
import ProductsEditor from './pages/ProductsEditor';
import CategoriesEditor from './pages/CategoriesEditor';
import ShippingEditor from './pages/ShippingEditor';
import DiscountsEditor from './pages/DiscountsEditor';
import TaxesEditor from './pages/TaxesEditor';
import SEOEditor from './pages/SEOEditor';
import ImageManager from './pages/ImageManager';
import OrdersManager from './pages/OrdersManager';
import AddOrderPage from './pages/AddOrderPage';
import Layout from './components/Layout';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Load and apply config
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const csv = await readCSV('config.csv');
        const configObj: Record<string, string> = {};
        csv.rows.forEach((row: any) => {
          const key = row.setting_key || row.settingKey;
          const value = row.setting_value || row.settingValue;
          if (key && value !== undefined) {
            configObj[key] = value;
          }
        });
        setConfig(configObj);
        
        // Apply theme colors
        if (configObj.primary_color) {
          document.documentElement.style.setProperty('--color-primary', configObj.primary_color);
        }
        if (configObj.secondary_color) {
          document.documentElement.style.setProperty('--color-secondary', configObj.secondary_color);
        }
        
        // Apply favicon
        if (configObj.favicon_path) {
          let favicon = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!favicon) {
            favicon = document.createElement('link');
            favicon.rel = 'icon';
            document.head.appendChild(favicon);
          }
          favicon.href = configObj.favicon_path;
        }
        
        // Set page title
        if (configObj.store_name) {
          document.title = `${configObj.store_name} - Admin`;
        }
        
        // Load Google Font if specified
        if (configObj.store_name_font) {
          const fontName = configObj.store_name_font.replace(/ /g, '+');
          let fontLink = document.querySelector("link[href*='fonts.googleapis.com']") as HTMLLinkElement;
          if (!fontLink) {
            fontLink = document.createElement('link');
            fontLink.rel = 'stylesheet';
            document.head.appendChild(fontLink);
          }
          fontLink.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;700&display=swap`;
        }
      } catch (error) {
        console.error('Error loading config:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated) {
      loadConfig();
    } else {
      setLoading(false);
    }

    // Listen for config reload events
    const handleConfigReload = () => {
      console.log('🔄 Reloading config...');
      loadConfig();
    };

    window.addEventListener('config-updated', handleConfigReload);
    return () => window.removeEventListener('config-updated', handleConfigReload);
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Login />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Layout config={config}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/config" element={<ConfigEditor />} />
        <Route path="/products" element={<ProductsEditor />} />
        <Route path="/categories" element={<CategoriesEditor />} />
        <Route path="/shipping" element={<ShippingEditor />} />
        <Route path="/discounts" element={<DiscountsEditor />} />
        <Route path="/taxes" element={<TaxesEditor />} />
        <Route path="/seo" element={<SEOEditor />} />
        <Route path="/images" element={<ImageManager />} />
        <Route path="/orders" element={<OrdersManager />} />
        <Route path="/orders/add" element={<AddOrderPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
