import { useEffect, useState } from 'react';
import { readCSV, saveCSV, getRuntimeConfig } from '@/services/csvService';
import ImageUploader from '@/components/ImageUploader';

export default function ConfigEditor() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const csv = await readCSV('config.csv');
      setData(csv.rows);
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (index: number, currentValue: string) => {
    setEditMode(index);
    setEditValue(currentValue);
  };

  const handleSave = async (index: number) => {
    const newData = [...data];
    const key = 'setting_value' in newData[index] ? 'setting_value' : 'settingValue';
    newData[index][key] = editValue;
    setData(newData);
    setEditMode(null);
    await saveCSV('config.csv', newData);
    loadData();
    
    // Trigger config reload in App.tsx
    window.dispatchEvent(new CustomEvent('config-updated'));
  };

  const handleSaveAll = async () => {
    await saveCSV('config.csv', data);
    loadData();
    
    // Trigger config reload in App.tsx
    window.dispatchEvent(new CustomEvent('config-updated'));
  };

  const resolveConfigImage = (p?: string | null) => {
    if (!p) return null;
    const adminOrigin = typeof window !== 'undefined' ? window.location.origin || '' : '';
    const isAdminLocal = adminOrigin.includes('localhost') || adminOrigin.startsWith('file://');

    try {
      if (p.startsWith('http')) {
        const host = new URL(p).host;
        const isLocalHost = /^(localhost|127\.|10\.|192\.168\.|172\.)/i.test(host);
        if (isLocalHost && !isAdminLocal) return null;
        return p;
      }
    } catch (e) {
      // ignore
    }

    if (!isAdminLocal) return null;
    const API_URL = getRuntimeConfig().API_URL.replace(/\/$/, '');
    return p.startsWith('/') ? `${API_URL}${p}` : `${API_URL}/${p}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading configuration...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Configuration</h1>
          <p className="text-gray-600">Edit store settings, colors, and contact information</p>
          <p className="text-sm text-orange-600 mt-1">⚠️ After saving theme changes, refresh the Shop page (http://localhost:5173) to see updates</p>
        </div>
        <button onClick={handleSaveAll} className="btn btn-primary w-full md:w-auto">
          💾 Save All Changes
        </button>
      </div>

      <div className="card">
        {/* Desktop table - hidden on small screens */}
        <div className="overflow-x-auto hidden md:block">
          <table className="table">
            <thead>
              <tr>
                <th className="w-1/4">Setting</th>
                <th className="w-1/2">Value</th>
                <th className="w-1/6">Type</th>
                <th className="w-1/6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => {
                const key = row.setting_key || row.settingKey;
                const value = row.setting_value || row.settingValue;
                const type = row.setting_type || row.settingType;
                const description = row.description || '';

                return (
                  <tr key={index}>
                    <td>
                      <div className="font-medium">{key}</div>
                      {description && (
                        <div className="text-xs text-gray-500 mt-1">{description}</div>
                      )}
                    </td>
                    <td>
                      {editMode === index ? (
                        type === 'select' ? (
                          <select
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="input"
                          >
                            <option value="Playfair Display">Playfair Display (Elegant)</option>
                            <option value="Montserrat">Montserrat (Modern)</option>
                            <option value="Roboto">Roboto (Clean)</option>
                            <option value="Lato">Lato (Friendly)</option>
                            <option value="Open Sans">Open Sans (Professional)</option>
                            <option value="Poppins">Poppins (Geometric)</option>
                            <option value="Raleway">Raleway (Stylish)</option>
                            <option value="Merriweather">Merriweather (Classic)</option>
                            <option value="Bebas Neue">Bebas Neue (Bold)</option>
                            <option value="Dancing Script">Dancing Script (Handwritten)</option>
                          </select>
                        ) : type === 'path' && (key === 'logo_path' || key === 'favicon_path' || key === 'banner_image') ? (
                          <ImageUploader
                            currentUrl={editValue}
                            onUploadComplete={(url) => setEditValue(url)}
                            label=""
                          />
                        ) : (
                          <input
                            type={type === 'color' ? 'color' : 'text'}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="input"
                          />
                        )
                      ) : (
                        <div className="flex items-center gap-2">
                          {type === 'color' && (
                            <div
                              className="w-6 h-6 rounded border"
                              style={{ backgroundColor: value }}
                            />
                          )}
                          {type === 'path' && (key === 'logo_path' || key === 'favicon_path' || key === 'banner_image') && value ? (
                            <img 
                              src={resolveConfigImage(value) || ''} 
                              alt={key}
                              className="w-16 h-16 object-cover rounded border"
                              onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                          ) : null}
                          <span className={value?.length > 100 ? 'text-sm' : ''}>
                            {value || 'N/A'}
                          </span>
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="px-2 py-1 bg-gray-100 rounded text-sm">{type}</span>
                    </td>
                    <td>
                      {editMode === index ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSave(index)}
                            className="text-green-600 hover:text-green-800"
                          >
                            ✓ Save
                          </button>
                          <button
                            onClick={() => setEditMode(null)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ✗ Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(index, value)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ✏️ Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile stacked view - visible on small screens */}
        <div className="md:hidden space-y-4">
          {data.map((row, index) => {
            const key = row.setting_key || row.settingKey;
            const value = row.setting_value || row.settingValue;
            const type = row.setting_type || row.settingType;
            const description = row.description || '';

            return (
              <div key={index} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-sm">{key}</div>
                    {description && <div className="text-xs text-gray-500 mt-1">{description}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">{type}</span>
                    {editMode !== index && (
                      <button
                        onClick={() => handleEdit(index, value)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        ✏️ Edit
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  {editMode === index ? (
                    <div className="space-y-3">
                      {type === 'select' ? (
                        <select value={editValue} onChange={(e) => setEditValue(e.target.value)} className="input">
                          <option value="Playfair Display">Playfair Display (Elegant)</option>
                          <option value="Montserrat">Montserrat (Modern)</option>
                          <option value="Roboto">Roboto (Clean)</option>
                          <option value="Lato">Lato (Friendly)</option>
                          <option value="Open Sans">Open Sans (Professional)</option>
                          <option value="Poppins">Poppins (Geometric)</option>
                          <option value="Raleway">Raleway (Stylish)</option>
                          <option value="Merriweather">Merriweather (Classic)</option>
                          <option value="Bebas Neue">Bebas Neue (Bold)</option>
                          <option value="Dancing Script">Dancing Script (Handwritten)</option>
                        </select>
                      ) : type === 'path' && (key === 'logo_path' || key === 'favicon_path' || key === 'banner_image') ? (
                        <ImageUploader currentUrl={editValue} onUploadComplete={(url) => setEditValue(url)} label="" />
                      ) : (
                        <input
                          type={type === 'color' ? 'color' : 'text'}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="input"
                        />
                      )}

                      <div className="flex gap-3 mt-3">
                        <button onClick={() => handleSave(index)} className="btn btn-primary w-full md:w-auto">✓ Save</button>
                        <button onClick={() => setEditMode(null)} className="btn btn-secondary w-full md:w-auto">✗ Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {type === 'color' && (
                        <div className="w-6 h-6 rounded border" style={{ backgroundColor: value }} />
                      )}
                      {type === 'path' && (key === 'logo_path' || key === 'favicon_path' || key === 'banner_image') && value ? (
                        <img src={resolveConfigImage(value) || ''} alt={key} className="w-20 h-20 object-cover rounded border" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      ) : null}
                      <div className="text-sm break-words">{value || 'N/A'}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preview important settings */}
      {data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="card">
            <h3 className="font-bold mb-4">🎨 Brand Colors</h3>
            <div className="space-y-3">
              {data
                .filter((row) => {
                  const key = row.setting_key || row.settingKey;
                  return key?.includes('color');
                })
                .map((row, i) => {
                  const key = row.setting_key || row.settingKey;
                  const value = row.setting_value || row.settingValue;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded border"
                        style={{ backgroundColor: value || '#000' }}
                      />
                      <div>
                        <div className="font-medium text-sm">{key}</div>
                        <div className="text-xs text-gray-500">{value}</div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="card">
            <h3 className="font-bold mb-4">📞 Contact Information</h3>
            <div className="space-y-2 text-sm">
              {data
                .filter((row) => {
                  const key = row.setting_key || row.settingKey;
                  return (
                    key?.includes('email') ||
                    key?.includes('phone') ||
                    key?.includes('whatsapp') ||
                    key?.includes('address')
                  );
                })
                .map((row, i) => {
                  const key = row.setting_key || row.settingKey;
                  const value = row.setting_value || row.settingValue;
                  return (
                    <div key={i}>
                      <span className="font-medium">{key}:</span> {value || 'N/A'}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
