import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { readCSV } from '@/services/csvService';

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    discounts: 0,
    shippingMethods: 0,
  });
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [products, categories, discounts, shipping, configData] = await Promise.all([
        readCSV('products.csv'),
        readCSV('categories.csv'),
        readCSV('discounts.csv'),
        readCSV('shipping.csv'),
        readCSV('config.csv'),
      ]);

      setStats({
        products: products.rows.length,
        categories: categories.rows.length,
        discounts: discounts.rows.length,
        shippingMethods: shipping.rows.length,
      });

      // Parse config
      const configObj: Record<string, string> = {};
      configData.rows.forEach((row: any) => {
        const key = row.setting_key || row.settingKey;
        const value = row.setting_value || row.settingValue;
        if (key && value !== undefined) {
          configObj[key] = value;
        }
      });
      setConfig(configObj);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { title: 'Products', count: stats.products, link: '/products', icon: '📦', color: 'bg-blue-500' },
    { title: 'Categories', count: stats.categories, link: '/categories', icon: '📁', color: 'bg-green-500' },
    { title: 'Discounts', count: stats.discounts, link: '/discounts', icon: '💰', color: 'bg-yellow-500' },
    { title: 'Shipping', count: stats.shippingMethods, link: '/shipping', icon: '🚚', color: 'bg-purple-500' },
  ];

  const quickLinks = [
    { title: 'Store Configuration', description: 'Edit store settings, colors, contact info', link: '/config', icon: '⚙️' },
    { title: 'Image Manager', description: 'View and manage all images', link: '/images', icon: '🖼️' },
    { title: 'SEO Settings', description: 'Manage meta tags and SEO', link: '/seo', icon: '🔍' },
    { title: 'Tax Configuration', description: 'Configure tax rules', link: '/taxes', icon: '📄' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to Shop Admin Portal - Manage your e-commerce store</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          ))
        ) : (
          cards.map((card) => (
            <Link key={card.title} to={card.link} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{card.title}</p>
                  <p className="text-2xl md:text-3xl font-bold">{card.count}</p>
                </div>
                <div className={`${card.color} text-white p-4 rounded-lg text-2xl`}>
                  {card.icon}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.title}
              to={link.link}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{link.icon}</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{link.title}</h3>
                  <p className="text-gray-600 text-sm">{link.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Banner Preview */}
      {config.banner_image && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">🎨 Store Preview</h2>
          <div className="card p-0 overflow-hidden">
            <div className="relative h-64 overflow-hidden">
              <img
                src={config.banner_image}
                alt="Banner Preview"
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                <div className="p-8 text-white">
                  <h1 className="text-2xl md:text-4xl font-bold mb-2">
                    {config.banner_title || 'Banner Title'}
                  </h1>
                  <p className="text-base md:text-xl mb-4">
                    {config.banner_subtitle || 'Banner subtitle'}
                  </p>
                  <button className="btn-primary px-6 py-3 rounded-lg font-bold">
                    {config.banner_cta_text || 'Shop Now'}
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Primary Color:</span>
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: config.primary_color }}
                  />
                  <span className="text-gray-600">{config.primary_color}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Currency:</span>
                  <span className="text-xl font-bold">{config.currency_symbol || '$'}</span>
                  <span className="text-gray-600">{config.currency_code || 'USD'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Important Notes */}
      <div className="card bg-yellow-50 border-l-4 border-yellow-400">
        <h3 className="font-bold text-lg mb-2">📝 Important Notes</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• After editing CSV files, download them and replace the files in <code className="bg-yellow-100 px-1">public/data/</code></li>
          <li>• Images must be uploaded to your Firebase storage manually</li>
          <li>• Always test changes on the shop before deploying to production</li>
          <li>• Keep backups of your CSV files before making major changes</li>
        </ul>
      </div>
    </div>
  );
}
