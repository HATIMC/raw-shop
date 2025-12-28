import { useEffect, useState } from 'react';
import { readCSV, saveCSV, getRuntimeConfig } from '@/services/csvService';
import ImageUploader from '@/components/ImageUploader';

interface Product {
  [key: string]: string | number;
}

export default function ProductsEditor() {
  const [data, setData] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Track ongoing image uploads so the UI can prevent saving while uploads are in progress
  const [uploadingCount, setUploadingCount] = useState(0);
  const handleUploadingChange = (isUploading: boolean) => {
    setUploadingCount((c) => Math.max(0, c + (isUploading ? 1 : -1)));
  };

  useEffect(() => {
    loadData();
    loadCategories();
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const csv = await readCSV('config.csv');
      const configObj: any = {};
      csv.rows.forEach((row: any) => {
        const key = row.setting_key || row.settingKey;
        const value = row.setting_value || row.settingValue;
        if (key && value !== undefined) {
          configObj[key] = value;
        }
      });
      setConfig(configObj);
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const loadData = async () => {
    try {
      const csv = await readCSV('products.csv');
      setData(csv.rows);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const csv = await readCSV('categories.csv');
      setCategories(csv.rows);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSave = async () => {
    await saveCSV('products.csv', data);
    loadData();
  };

  const handleDelete = async (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    setData(newData);
    await saveCSV('products.csv', newData);
    loadData(); // Reload to confirm
  };

  const handleEdit = (product: Product) => {
    setEditingProduct({ ...product });
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    const newProduct: Product = {
      product_id: `P${String(data.length + 1).padStart(3, '0')}`,
      product_name: '',
      category_id: '',
      subcategory_id: '',
      sku: '',
      description: '',
      short_description: '',
      price: 0,
      compare_at_price: 0,
      cost_price: 0,
      stock_quantity: 0,
      low_stock_threshold: 10,
      is_available: 'true',
      is_featured: 'false',
      weight_kg: 0,
      dimensions_cm: '',
      color_variants: '',
      size_variants: '',
      image_1: '',
      image_2: '',
      image_3: '',
      image_4: '',
      image_5: '',
      image_thumbnail: '',
      video_url: '',
      brand: '',
      tags: '',
      meta_title: '',
      meta_description: '',
      created_date: new Date().toISOString().split('T')[0],
      modified_date: new Date().toISOString().split('T')[0],
    };
    setEditingProduct(newProduct);
    setIsAddingNew(true);
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;

    let newData;
    if (isAddingNew) {
      newData = [...data, editingProduct];
      setData(newData);
    } else {
      const index = data.findIndex(
        (p) =>
          (p.product_id || p.productId) === (editingProduct.product_id || editingProduct.productId)
      );
      if (index !== -1) {
        newData = [...data];
        newData[index] = editingProduct;
        setData(newData);
      }
    }
    
    setEditingProduct(null);
    setIsAddingNew(false);
    
    if (newData) {
      await saveCSV('products.csv', newData);
      loadData();
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setIsAddingNew(false);
  };

  const handleFieldChange = (field: string, value: string) => {
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, [field]: value });
    }
  };

  const filteredData = data.filter((row) => {
    const name = row.product_name || row.productName || '';
    const id = row.product_id || row.productId || '';
    return (
      name.toString().toLowerCase().includes(filter.toLowerCase()) ||
      id.toString().toLowerCase().includes(filter.toLowerCase())
    );
  });

  // Resolve a product image path to an absolute URL using the API server when needed.
  const resolveImageUrl = (img?: string | null | undefined) => {
    if (!img) return '';
    const s = img.toString();
    if (s.startsWith('http')) return s;
    const { API_URL } = getRuntimeConfig();
    const base = API_URL.replace(/\/$/, '');
    if (s.startsWith('/')) return `${base}${s}`;
    return `${base}/${s}`;
  };

  // Edit Modal
  if (editingProduct) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {isAddingNew ? 'Add New Product' : 'Edit Product'}
            </h2>
            <button onClick={handleCancelEdit} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product ID</label>
                <input
                  type="text"
                  value={editingProduct.product_id || editingProduct.productId || ''}
                  onChange={(e) => handleFieldChange('product_id', e.target.value)}
                  className="input"
                  disabled={!isAddingNew}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Product Name *</label>
                <input
                  type="text"
                  value={editingProduct.product_name || editingProduct.productName || ''}
                  onChange={(e) => handleFieldChange('product_name', e.target.value)}
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price *</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingProduct.price || 0}
                  onChange={(e) => handleFieldChange('price', e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Compare At Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingProduct.compare_at_price || editingProduct.compareAtPrice || 0}
                  onChange={(e) => handleFieldChange('compare_at_price', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock Quantity *</label>
                <input
                  type="number"
                  value={editingProduct.stock_quantity || editingProduct.stockQuantity || 0}
                  onChange={(e) => handleFieldChange('stock_quantity', e.target.value)}
                  className="input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Short Description</label>
              <input
                type="text"
                value={editingProduct.short_description || editingProduct.shortDescription || ''}
                onChange={(e) => handleFieldChange('short_description', e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={editingProduct.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="input"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">SKU</label>
                <input
                  type="text"
                  value={editingProduct.sku || ''}
                  onChange={(e) => handleFieldChange('sku', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Brand</label>
                <input
                  type="text"
                  value={editingProduct.brand || ''}
                  onChange={(e) => handleFieldChange('brand', e.target.value)}
                  className="input"
                  placeholder="Apple, Samsung, etc."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={editingProduct.category_id || editingProduct.categoryId || ''}
                onChange={(e) => handleFieldChange('category_id', e.target.value)}
                className="input"
              >
                <option value="">Select Category...</option>
                {categories.map((cat, idx) => (
                  <option 
                    key={idx} 
                    value={cat.category_id || cat.categoryId}
                  >
                    {cat.category_name || cat.categoryName} ({cat.category_id || cat.categoryId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={editingProduct.tags || ''}
                onChange={(e) => handleFieldChange('tags', e.target.value)}
                className="input"
                placeholder="electronics,audio,wireless"
              />
            </div>

            {/* Images */}
            <div className="border-t pt-4">
              <h3 className="font-bold mb-3">Product Images (Upload or URL)</h3>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((num) => (
                  <ImageUploader
                    key={num}
                    label={`Image ${num}`}
                    currentUrl={editingProduct[`image_${num}`] as string}
                    onUploadComplete={(url) => handleFieldChange(`image_${num}`, url)}
                    onUploadingChange={handleUploadingChange}
                  />
                ))}
                <ImageUploader
                  label="Thumbnail"
                  currentUrl={editingProduct.image_thumbnail as string}
                  onUploadComplete={(url) => handleFieldChange('image_thumbnail', url)}
                  onUploadingChange={handleUploadingChange}
                />
              </div>
            </div>

            {/* Variants */}
            <div className="border-t pt-4">
              <h3 className="font-bold mb-3">Variants</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Colors (separated by |)</label>
                  <input
                    type="text"
                    value={editingProduct.color_variants || editingProduct.colorVariants || ''}
                    onChange={(e) => handleFieldChange('color_variants', e.target.value)}
                    className="input"
                    placeholder="Black|White|Blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sizes (separated by |)</label>
                  <input
                    type="text"
                    value={editingProduct.size_variants || editingProduct.sizeVariants || ''}
                    onChange={(e) => handleFieldChange('size_variants', e.target.value)}
                    className="input"
                    placeholder="Small|Medium|Large"
                  />
                </div>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="border-t pt-4 flex flex-col md:flex-row gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingProduct.is_featured === 'true' || editingProduct.isFeatured === 'true'}
                  onChange={(e) => handleFieldChange('is_featured', e.target.checked ? 'true' : 'false')}
                />
                <span>Featured Product</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingProduct.is_available === 'true' || editingProduct.isAvailable === 'true'}
                  onChange={(e) => handleFieldChange('is_available', e.target.checked ? 'true' : 'false')}
                />
                <span>Available for Purchase</span>
              </label>
            </div>
          </div>

          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex flex-col md:flex-row md:justify-end gap-3 border-t">
            <button onClick={handleCancelEdit} className="btn btn-secondary w-full md:w-auto">
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="btn btn-success w-full md:w-auto"
              disabled={uploadingCount > 0}
            >
              {isAddingNew ? (uploadingCount > 0 ? 'Uploading images...' : 'Add Product') : (uploadingCount > 0 ? 'Uploading images...' : 'Save Changes')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show a loading state while products are being fetched
  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading products...</div>;
  }

  // Main Product List View
  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Products Management</h1>
          <p className="text-gray-600">{data.length} products in catalog</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <button onClick={handleAddNew} className="btn btn-success w-full md:w-auto">
            ➕ Add New Product
          </button>
          <button onClick={handleSave} className="btn btn-primary w-full md:w-auto">
            💾 Save Changes
          </button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search products..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input w-full md:max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((row, index) => {
          const id = row.product_id || row.productId;
          const name = row.product_name || row.productName;
          const price = row.price || 0;
          const stock = row.stock_quantity || row.stockQuantity || 0;
          const image =
            row.image_1 ||
            row.image1 ||
            row.image_thumbnail ||
            row.imageThumbnail ||
            row.thumbnail ||
            row.image ||
            '';
          const adminOrigin = (typeof window !== 'undefined' && window.location && window.location.origin) || '';
          const isAdminLocal = adminOrigin.includes('localhost') || adminOrigin.startsWith('file://');
          const isRelativeImage = image && !image.toString().startsWith('http');
          const isAbsoluteLocal = !!(image && /^(https?:)?\/\/(localhost|127\.|10\.|192\.168\.|172\.)/i.test(image.toString()));
          const shopBase = getRuntimeConfig().SHOP_URL.replace(/\/$/, '');
          const apiBase = getRuntimeConfig().API_URL.replace(/\/$/, '');

           const category = row.category || row.category_id || row.categoryId || '';

           return (
             <div key={index} className="card hover:shadow-lg transition-shadow">
               {/* Product Image */}
               <div className="mb-4 relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                {image ? (
                  (isRelativeImage || isAbsoluteLocal) && !isAdminLocal ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-600 p-4 text-center">
                      <div className="font-medium">Local image — not accessible from hosted Admin</div>
                      <div className="text-xs text-gray-500 mt-1 break-all">{image.toString()}</div>
                      <div className="mt-2 flex gap-2">
                        {isAbsoluteLocal ? (
                          <a href={image.toString()} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">Open local URL</a>
                        ) : (
                          <>
                            <a href={`${apiBase}${image}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">Open on API</a>
                            <a href={`${shopBase}${image}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">Open on Shop</a>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <img
                      src={resolveImageUrl(image as string)}
                      alt={name?.toString()}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://via.placeholder.com/400x400?text=No+Image';
                      }}
                    />
                  )
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Image
                  </div>
                )}
               </div>

              {/* Product Info */}
              <div>
                <div className="text-xs text-gray-500 mb-1">{id}</div>
                <h3 className="font-bold text-lg mb-2">{name}</h3>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl font-bold text-blue-600">{config.currency_symbol || '$'}{price}</span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      Number(stock) > 10
                        ? 'bg-green-100 text-green-800'
                        : Number(stock) > 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    Stock: {stock}
                  </span>
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  Category: <span className="font-medium">{category}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(row)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(data.indexOf(row))}
                    className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No products found matching "{filter}"
        </div>
      )}
    </div>
  );
}
