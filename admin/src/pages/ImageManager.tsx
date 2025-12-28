import { useEffect, useState } from 'react';
import { readCSV, getRuntimeConfig } from '@/services/csvService';
import { scanImageUsage, ImageUsage } from '@/services/imageService';

export default function ImageManager() {
  const [loading, setLoading] = useState(true);
  const [imageUsage, setImageUsage] = useState<ImageUsage[]>([]);
  const [filter, setFilter] = useState<'all' | 'used' | 'config' | 'products' | 'categories'>('all');

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      // Load all CSV data
      const [config, products, categories, seo] = await Promise.all([
        readCSV('config.csv'),
        readCSV('products.csv'),
        readCSV('categories.csv'),
        readCSV('seo.csv'),
      ]);

      // Scan for image usage
      const usage = scanImageUsage({
        config: config.rows,
        products: products.rows,
        categories: categories.rows,
        seo: seo.rows,
      });

      setImageUsage(usage);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = imageUsage.filter((img) => {
    if (filter === 'all') return true;
    if (filter === 'config') return img.usedIn.some((u) => u.file === 'config.csv');
    if (filter === 'products') return img.usedIn.some((u) => u.file === 'products.csv');
    if (filter === 'categories') return img.usedIn.some((u) => u.file === 'categories.csv');
    return true;
  });

  const getFileColor = (fileName: string) => {
    switch (fileName) {
      case 'config.csv':
        return 'bg-blue-100 text-blue-800';
      case 'products.csv':
        return 'bg-green-100 text-green-800';
      case 'categories.csv':
        return 'bg-purple-100 text-purple-800';
      case 'seo.csv':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Render an image preview or a placeholder with links when the image is local-only
  const renderImagePreview = (path: string) => {
    const adminOrigin = (typeof window !== 'undefined' && window.location && window.location.origin) || '';
    const isAdminLocal = adminOrigin.includes('localhost') || adminOrigin.startsWith('file://');
    const isRelative = !path.startsWith('http');
    const isAbsoluteLocal = /^(https?:)?\/\/(localhost|127\.|10\.|192\.168\.|172\.)/i.test(path);
    const shopBase = getRuntimeConfig().SHOP_URL.replace(/\/$/, '');
    const apiBase = getRuntimeConfig().API_URL.replace(/\/$/, '');

    if ((isRelative || isAbsoluteLocal) && !isAdminLocal) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-600 p-3 text-center">
          <div className="font-medium">Local image — not accessible from hosted Admin</div>
          <div className="text-xs text-gray-500 mt-1 break-all">{path}</div>
          <div className="mt-2 flex gap-2">
            {isAbsoluteLocal ? (
              <a href={path} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">Open local URL</a>
            ) : (
              <>
                <a href={`${apiBase}${path}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">Open on API</a>
                <a href={`${shopBase}${path}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">Open on Shop</a>
              </>
            )}
          </div>
        </div>
      );
    }

    const src = path.startsWith('http') ? path : `${getRuntimeConfig().API_URL.replace(/\/$/, '')}${path}`;
    return (
      <img
        src={src}
        alt="Preview"
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
        }}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Scanning images...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Image Manager</h1>
        <p className="text-gray-600">View all images used in your store</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Total Images</div>
          <div className="text-2xl md:text-3xl font-bold">{imageUsage.length}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Config Images</div>
          <div className="text-2xl md:text-3xl font-bold">
            {imageUsage.filter((img) => img.usedIn.some((u) => u.file === 'config.csv')).length}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Product Images</div>
          <div className="text-2xl md:text-3xl font-bold">
            {imageUsage.filter((img) => img.usedIn.some((u) => u.file === 'products.csv')).length}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Category Images</div>
          <div className="text-2xl md:text-3xl font-bold">
            {imageUsage.filter((img) => img.usedIn.some((u) => u.file === 'categories.csv')).length}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All Images' },
          { key: 'config', label: 'Config' },
          { key: 'products', label: 'Products' },
          { key: 'categories', label: 'Categories' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredImages.map((img, index) => (
          <div key={index} className="card hover:shadow-lg transition-shadow">
            {/* Image Preview */}
            <div className="mb-4 relative h-48 bg-gray-100 rounded-lg overflow-hidden">
              {renderImagePreview(img.path)}
            </div>

            {/* Image Info */}
            <div className="space-y-3">
              {/* URL */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Image URL</label>
                <a
                  href={img.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline break-all"
                >
                  {img.path}
                </a>
              </div>

              {/* Usage */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Used In ({img.usedIn.length})
                </label>
                <div className="space-y-2">
                  {img.usedIn.map((usage, i) => (
                    <div key={i} className="bg-gray-50 p-2 rounded text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`px-2 py-1 rounded font-medium ${getFileColor(usage.file)}`}>
                          {usage.file}
                        </span>
                        <span className="text-gray-600">{usage.field}</span>
                      </div>
                      <div className="font-medium text-gray-900">{usage.record}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No images found for this filter
        </div>
      )}

      {/* Upload Instructions */}
      <div className="card mt-8 bg-blue-50">
        <h3 className="font-bold mb-3">📤 Image Upload Instructions</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>1. Prepare Images:</strong> Optimize images for web (compress, resize to appropriate dimensions)
          </p>
          <p>
            <strong>2. Upload to Firebase:</strong> Add images to your Firebase Storage or place them in the{' '}
            <code className="bg-blue-100 px-1 rounded">public/images/</code> folder
          </p>
          <p>
            <strong>3. Update CSV:</strong> Copy the image URL and paste it into the appropriate CSV file
          </p>
          <p>
            <strong>4. Test:</strong> Reload the shop to verify images display correctly
          </p>
        </div>
      </div>

      {/* Config Images Summary */}
      <div className="card mt-6">
        <h3 className="font-bold mb-4">🎨 Config Images Overview</h3>
        <div className="space-y-3">
          {imageUsage
            .filter((img) => img.usedIn.some((u) => u.file === 'config.csv'))
            .map((img, i) => {
              const configUsage = img.usedIn.find((u) => u.file === 'config.csv');
              return (
                <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={img.path}
                    alt={configUsage?.field || 'Config image'}
                    className="w-20 h-20 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://via.placeholder.com/80x80?text=Error';
                    }}
                  />
                  <div className="flex-1">
                    <div className="font-medium mb-1">{configUsage?.field}</div>
                    <div className="text-xs text-gray-600 break-all">{img.path}</div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
