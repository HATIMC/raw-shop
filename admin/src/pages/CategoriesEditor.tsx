import { useEffect, useState } from 'react';
import ImageUploader from '@/components/ImageUploader';
import { readCSV, saveCSV, getRuntimeConfig } from '@/services/csvService';

interface Category {
  category_id?: string;
  categoryId?: string;
  category_name?: string;
  categoryName?: string;
  parent_category_id?: string;
  parentCategoryId?: string;
  image_url?: string;
  imageUrl?: string;
  description?: string;
  is_active?: string | boolean;
  isActive?: string | boolean;
}

export default function CategoriesEditor() {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const csv = await readCSV('categories.csv');
      setData(csv.rows);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    const newCategory: Category = {
      category_id: `C${String(data.length + 1).padStart(3, '0')}`,
      category_name: '',
      parent_category_id: '',
      image_url: '',
      description: '',
      is_active: 'true',
    };
    setEditingCategory(newCategory);
    setIsAddingNew(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory({ ...category });
    setIsAddingNew(false);
  };

  const handleDelete = async (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    setData(newData);
    await saveCSV('categories.csv', newData);
    loadData();
  };

  const handleSaveEdit = async () => {
    if (!editingCategory) return;

    let newData;
    if (isAddingNew) {
      newData = [...data, editingCategory];
      setData(newData);
    } else {
      const index = data.findIndex(
        (c) =>
          (c.category_id || c.categoryId) ===
          (editingCategory.category_id || editingCategory.categoryId)
      );
      if (index !== -1) {
        newData = [...data];
        newData[index] = editingCategory;
        setData(newData);
      }
    }

    setEditingCategory(null);
    setIsAddingNew(false);

    if (newData) {
      await saveCSV('categories.csv', newData);
      loadData();
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (!editingCategory) return;
    setEditingCategory({ ...editingCategory, [field]: value });
  };

  const mainCategories = data.filter(
    (row) => !(row.parent_category_id || row.parentCategoryId)
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading categories...</div>;
  }

  const resolveImageUrl = (img?: string | null | undefined) => {
    if (!img) return '';
    const s = img.toString();
    if (s.startsWith('http')) return s;
    const { API_URL } = getRuntimeConfig();
    const base = API_URL.replace(/\/$/, '');
    if (s.startsWith('/')) return `${base}${s}`;
    return `${base}/${s}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Categories Management</h1>
          <p className="text-gray-600">{data.length} total categories</p>
        </div>
        <button onClick={handleAddNew} className="btn bg-green-600 hover:bg-green-700 text-white">
          ➕ Add New Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((category, index) => {
          const name = category.category_name || category.categoryName;
          const id = category.category_id || category.categoryId;
          const image = category.image_url || category.imageUrl;
          const adminOrigin = (typeof window !== 'undefined' && window.location && window.location.origin) || '';
          const isAdminLocal = adminOrigin.includes('localhost') || adminOrigin.startsWith('file://');
          const isRelativeImage = image && !image.toString().startsWith('http');
          const isAbsoluteLocal = !!(image && /^(https?:)?\/\/(localhost|127\.|10\.|192\.168\.|172\.)/i.test(image.toString()));
          const shopBase = getRuntimeConfig().SHOP_URL.replace(/\/$/, '');
          const apiBase = getRuntimeConfig().API_URL.replace(/\/$/, '');
          const description = category.description || '';
          const isActive = category.is_active || category.isActive;

          return (
            <div key={index} className="card">
              {/* Image */}
              <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden mb-3">
                {image ? (
                  (isRelativeImage || isAbsoluteLocal) && !isAdminLocal ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-600 p-3 text-center">
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
                      alt={name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://via.placeholder.com/400x200?text=Category';
                      }}
                    />
                  )
                ) : (
                  <div className="flex items-center justify-center h-full text-4xl">📁</div>
                )}
              </div>

              {/* Content */}
              <div className="mb-3">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-lg">{name}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      isActive === 'true' || isActive === true
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {isActive === 'true' || isActive === true ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">ID: {id}</p>
                {description && (
                  <p className="text-sm text-gray-700 line-clamp-2">{description}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col md:flex-row gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 btn btn-secondary text-sm"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="btn bg-red-600 hover:bg-red-700 text-white text-sm"
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit/Add Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {isAddingNew ? '➕ Add New Category' : '✏️ Edit Category'}
              </h2>

              <div className="space-y-4">
                {/* Category ID */}
                <div>
                  <label className="block text-sm font-medium mb-1">Category ID *</label>
                  <input
                    type="text"
                    value={editingCategory.category_id || editingCategory.categoryId || ''}
                    onChange={(e) => handleInputChange('category_id', e.target.value)}
                    className="input"
                    placeholder="C001"
                    disabled={!isAddingNew}
                  />
                </div>

                {/* Category Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">Category Name *</label>
                  <input
                    type="text"
                    value={editingCategory.category_name || editingCategory.categoryName || ''}
                    onChange={(e) => handleInputChange('category_name', e.target.value)}
                    className="input"
                    placeholder="Smartphones"
                  />
                </div>

                {/* Parent Category */}
                <div>
                  <label className="block text-sm font-medium mb-1">Parent Category</label>
                  <select
                    value={
                      editingCategory.parent_category_id || editingCategory.parentCategoryId || ''
                    }
                    onChange={(e) => handleInputChange('parent_category_id', e.target.value)}
                    className="input"
                  >
                    <option value="">None (Main Category)</option>
                    {mainCategories.map((cat, idx) => (
                      <option
                        key={idx}
                        value={cat.category_id || cat.categoryId}
                      >
                        {cat.category_name || cat.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image */}
                <ImageUploader
                  label="Category Image"
                  currentUrl={editingCategory.image_url || editingCategory.imageUrl || ''}
                  onUploadComplete={(url: string) => handleInputChange('image_url', url)}
                />

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={editingCategory.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="input"
                    rows={3}
                    placeholder="Category description..."
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={
                      editingCategory.is_active === 'true' ||
                      editingCategory.is_active === true ||
                      editingCategory.isActive === 'true' ||
                      editingCategory.isActive === true
                    }
                    onChange={(e) =>
                      handleInputChange('is_active', e.target.checked ? 'true' : 'false')
                    }
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium">Active</label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button onClick={handleSaveEdit} className="btn btn-primary flex-1">
                  {isAddingNew ? '➕ Add Category' : '💾 Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setIsAddingNew(false);
                  }}
                  className="btn btn-secondary"
                >
                  ✖️ Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
